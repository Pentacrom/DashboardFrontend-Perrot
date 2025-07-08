import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  loadDrafts,
  loadSent,
  saveOrUpdateSent,
  Payload,
  Punto,
  mockCatalogos,
  mockMoviles,
  mockRamplas,
} from "../../utils/ServiceDrafts";
import { Modal } from "../../components/Modal";
import { formatDateTimeLocal, formatFechaISO } from "../../utils/format";

const SeguimientoServicio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Payload | null>(null);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRampla, setSelectedRampla] = useState<number>(0);
  const [estadoSeguimiento, setEstadoSeguimiento] = useState<string>(
    service?.estadoSeguimiento || ""
  );

  // Extrae el primer segmento de la ruta
  const segments = location.pathname.split("/").filter(Boolean);
  const perfilActual = segments[0] || "torreDeControl";

  // carga inicial
  useEffect(() => {
    try {
      const sid = Number(id);
      if (!sid) throw new Error("ID inválido");
      const sent = loadSent().find((s) => s.id === sid);
      const draft = loadDrafts().find((s) => s.id === sid);
      const found = sent || draft;
      if (!found) throw new Error("Servicio no encontrado");
      setService(found);
      setPuntos(found.puntos);
      setEstadoSeguimiento(found.estadoSeguimiento || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Actualizar puntos
  const updatePunto = useCallback(
    (idx: number, key: keyof Punto, value: any) =>
      setPuntos((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p))
      ),
    []
  );

  // Nuevo: actualizar campos de form
  const updateForm = useCallback((key: keyof Payload["form"], value: any) => {
    setService((prev) =>
      prev
        ? {
            ...prev,
            form: {
              ...prev.form,
              [key]: value,
            },
          }
        : null
    );
  }, []);

  // Función para calcular si el container está pendiente de devolución
  const calcularPendienteDevolucion = useCallback((puntos: Punto[]) => {
    // Buscar puntos que implican dejar el container (acciones 3 y 4)
    const puntosDevolucion = puntos.filter(p => p.accion === 3 || p.accion === 4);
    
    console.log("DEBUG - Puntos de devolución:", puntosDevolucion);
    
    // Si no hay puntos de devolución, no puede estar pendiente
    if (puntosDevolucion.length === 0) return false;
    
    // Verificar si todos los puntos NO de devolución están completados
    const puntosNoDevolución = puntos.filter(p => p.accion !== 3 && p.accion !== 4);
    const todosNoDevolacionCompletados = puntosNoDevolución.every(p => p.llegada && p.salida);
    
    // Verificar si algún punto de devolución NO está completado
    const algunDevolucionIncompleta = puntosDevolucion.some(p => !p.llegada || !p.salida);
    
    console.log("DEBUG - Todos no devolución completados:", todosNoDevolacionCompletados);
    console.log("DEBUG - Alguna devolución incompleta:", algunDevolucionIncompleta);
    
    // Está pendiente si todos los puntos no-devolución están completos pero falta alguna devolución
    const resultado = todosNoDevolacionCompletados && algunDevolucionIncompleta;
    console.log("DEBUG - Container pendiente:", resultado);
    
    return resultado;
  }, []);

  const validarFechas = () => {
    console.log("DEBUG - Validando fechas de puntos:", puntos);
    const resultado = puntos.every((p, idx) => {
      const minArrivalRaw =
        idx === 0 ? service?.form.fechaSol : puntos[idx - 1]?.salida || "";
      const valido = (
        !!p.llegada &&
        !!p.salida &&
        new Date(p.llegada) >= new Date(minArrivalRaw!) &&
        new Date(p.salida) >= new Date(p.llegada)
      );
      console.log(`DEBUG - Punto ${idx} válido:`, valido, {llegada: p.llegada, salida: p.salida});
      return valido;
    });
    console.log("DEBUG - Resultado validación fechas:", resultado);
    return resultado;
  };

  const handleGuardar = useCallback(() => {
    if (!service) return;
    const pendienteDevolucion = calcularPendienteDevolucion(puntos);
    const updated: Payload = { 
      ...service, 
      puntos,
      pendienteDevolucion,
      estadoSeguimiento
    };
    saveOrUpdateSent(updated);
    alert("Seguimiento guardado correctamente.");
    navigate(-1);
  }, [service, puntos, estadoSeguimiento, navigate, calcularPendienteDevolucion]);

  const handleCompletar = () => {
    console.log("DEBUG - Iniciando handleCompletar");
    
    // Validar que todos los puntos NO de devolución tengan llegada y salida
    // Los puntos de devolución (acciones 3 y 4) pueden estar incompletos
    const puntosNoDevolución = puntos.filter(p => p.accion !== 3 && p.accion !== 4);
    const puntosIncompletos = puntosNoDevolución.filter(p => !p.llegada || !p.salida);
    
    if (puntosIncompletos.length > 0) {
      const indices = puntosIncompletos.map(p => puntos.findIndex(punto => punto === p) + 1);
      alert(`Faltan fechas de llegada y/o salida en los puntos: ${indices.join(', ')}. Los puntos de devolución de container pueden quedar pendientes.`);
      return;
    }
    
    // Validar que la carga fue entregada (debe haber al menos un punto con acción 4 "dejar container cargado" o 7 "vaciar container")
    const cargaEntregada = puntos.some(p => (p.accion === 4 || p.accion === 7) && p.llegada && p.salida);
    if (!cargaEntregada) {
      alert("Debe completar al menos la entrega de la carga (dejar container cargado o vaciar container).");
      return;
    }
    
    // Validar orden de fechas solo para puntos completados
    for (let idx = 0; idx < puntos.length; idx++) {
      const p = puntos[idx];
      const minArrivalRaw = idx === 0 ? service?.form.fechaSol : puntos[idx - 1]?.salida;
      
      // Solo validar si el punto está completado
      if (!p.llegada || !p.salida) continue;
      
      if (minArrivalRaw && new Date(p.llegada) < new Date(minArrivalRaw)) {
        alert(`La fecha de llegada del punto ${idx + 1} debe ser posterior a la salida del punto anterior.`);
        return;
      }
      
      if (new Date(p.salida) < new Date(p.llegada)) {
        alert(`La fecha de salida del punto ${idx + 1} debe ser posterior a la fecha de llegada.`);
        return;
      }
    }
    
    // Validar que si es tracto, debe tener rampla seleccionada
    const movilAsignado = mockMoviles.find(m => m.patente === service?.movil);
    console.log("DEBUG - Móvil asignado:", movilAsignado);
    console.log("DEBUG - Rampla seleccionada:", selectedRampla);
    
    if (movilAsignado?.tipo === "Tracto" && selectedRampla === 0) {
      console.log("DEBUG - Error: Tracto sin rampla");
      alert("Debe seleccionar una rampla para el tracto antes de completar.");
      return;
    }
    
    console.log("DEBUG - Validaciones pasadas, mostrando modal");
    setShowModal(true);
  };

  const confirmarCompletar = () => {
    console.log("DEBUG - Iniciando confirmarCompletar");
    if (!service) {
      console.log("DEBUG - No hay servicio, saliendo");
      return;
    }
    
    // Calcular el estado de devolución de container basado en puntos completados
    const pendienteDevolucion = calcularPendienteDevolucion(puntos);
    console.log("DEBUG - Pendiente devolución calculado:", pendienteDevolucion);
    
    // Verificar si el container está pendiente de devolución
    if (pendienteDevolucion) {
      const confirmar = window.confirm(
        "⚠️ ATENCIÓN: El container aún no ha sido devuelto. El servicio pasará a revisión pero con estado de container pendiente. ¿Continuar?"
      );
      console.log("DEBUG - Usuario confirmó:", confirmar);
      if (!confirmar) return;
    }
    
    const actualizado: Payload = {
      ...service,
      puntos,
      pendienteDevolucion,
      estado: "Por validar",
      estadoSeguimiento
    };
    
    console.log("DEBUG - Payload actualizado:", actualizado);
    
    try {
      saveOrUpdateSent(actualizado);
      console.log("DEBUG - Servicio guardado exitosamente");
      setShowModal(false);
      alert("Servicio marcado como Por validar.");
      
      // Navegación corregida - ruta específica torre de control
      console.log("DEBUG - Navegando a: /torre-de-control/gestion-servicios");
      navigate("/torre-de-control/gestion-servicios");
    } catch (error) {
      console.error("Error al guardar el servicio:", error);
      alert("Error al guardar el servicio. Intente nuevamente.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error || "Servicio no encontrado."}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Seguimiento Servicio #{service.id}
        </h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
          Estado: {service.estado}
        </span>
      </div>

      {/* Estado de Seguimiento */}
      <div className="bg-white p-4 rounded shadow">
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-1">
            Estado de Seguimiento
          </label>
          <select
            className="input w-full"
            value={estadoSeguimiento}
            onChange={(e) => setEstadoSeguimiento(e.target.value)}
          >
            <option value="">— Seleccionar estado —</option>
            <option value="Servicio terminado">Servicio terminado</option>
            <option value="En Panne">En Panne</option>
            <option value="En puerto">En puerto</option>
            <option value="En Resguardo">En Resguardo</option>
            <option value="En ruta a puerto">En ruta a puerto</option>
            <option value="Espera de reprogramacion">Espera de reprogramación</option>
            <option value="Finalizando otra operacion">Finalizando otra operación</option>
            <option value="Falso flete">Falso flete</option>
            <option value="Servicio cancelado">Servicio cancelado</option>
            <option value="En almacen">En almacén</option>
            <option value="Serv. terminado en alm.">Serv. terminado en alm.</option>
            <option value="Unidad retirada">Unidad retirada</option>
            <option value="Unidad a piso full">Unidad a piso full</option>
            <option value="Asignacion pendiente">Asignación pendiente</option>
            <option value="A la espera de horario">A la espera de horario</option>
            <option value="En ruta a retirar">En ruta a retirar</option>
            <option value="Posicionado para retirar">Posicionado para retirar</option>
            <option value="Retirando">Retirando</option>
            <option value="En ruta a cliente">En ruta a cliente</option>
            <option value="En cliente">En cliente</option>
            <option value="Descargado">Descargado</option>
            <option value="En ruta a resguardo">En ruta a resguardo</option>
          </select>
        </div>
      </div>

      {/* Fecha de solicitud */}
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm font-medium mb-1">Fecha de Solicitud</p>
        <input
          type="datetime-local"
          className="input w-full bg-gray-100 cursor-not-allowed"
          value={formatDateTimeLocal(service.form.fechaSol)}
          disabled
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            Folio {service.form.tipoOperacion === 1 && "*"}
          </label>
          <input
            type="number"
            className="input w-full"
            value={service.form.folio}
            onChange={(e) => updateForm("folio", Number(e.target.value))}
            required={service.form.tipoOperacion === 1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha de Folio {service.form.tipoOperacion === 1 && "*"}
          </label>
          <input
            type="datetime-local"
            className="input w-full"
            value={formatDateTimeLocal(service.form.fechaFolio)}
            onChange={(e) => updateForm("fechaFolio", new Date(e.target.value))}
            required={service.form.tipoOperacion === 1}
          />
        </div>
      </div>

      
      {/* Información del servicio asignado */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Recursos Asignados</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Chofer Asignado</label>
            <input
              type="text"
              className="input w-full bg-gray-100"
              value={service?.chofer || "Sin asignar"}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Móvil Asignado</label>
            <input
              type="text"
              className="input w-full bg-gray-100"
              value={service?.movil || "Sin asignar"}
              disabled
            />
          </div>
        </div>
        
        {/* Mostrar selector de rampla solo si el móvil asignado es tipo "Tracto" */}
        {service?.movil && mockMoviles.find(m => m.patente === service.movil)?.tipo === "Tracto" && (
          <div className="max-w-md">
            <label className="block text-sm font-medium mb-1">Rampla para Tracto *</label>
            <select
              className="input w-full"
              value={selectedRampla}
              onChange={(e) => setSelectedRampla(Number(e.target.value))}
              required
            >
              <option value={0}>— Seleccionar rampla —</option>
              {mockRamplas.map((rampla) => (
                <option key={rampla.id} value={rampla.id}>
                  {rampla.patente} - {rampla.capacidad}t
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              * Selecciona la rampla que usará este vehículo tracto (obligatorio)
            </p>
          </div>
        )}
      </div>

      {/* Puntos del recorrido */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Puntos del Recorrido</h2>
        <div className="space-y-4">
          {puntos.map((p, idx) => {
            const minRawLlegada =
              idx === 0 ? service.form.fechaSol : puntos[idx - 1]!.salida!;
            const minLlegada = formatDateTimeLocal(minRawLlegada);


            const etaDate = p.eta;
            const minArrivalRaw =
              idx === 0 ? service.form.fechaSol : puntos[idx - 1]?.salida || "";
            const minArrival = minArrivalRaw
              ? formatDateTimeLocal(minArrivalRaw)
              : undefined;

            const isLate =
              !!p.llegada &&
              !!etaDate &&
              (new Date(p.llegada).getTime() - new Date(etaDate).getTime()) > (15 * 60 * 1000); // 15+ minutos tarde
            const invalidArrival =
              !!p.llegada &&
              minArrival &&
              new Date(p.llegada) < new Date(minArrivalRaw);
            const invalidSalida =
              !!p.salida &&
              !!p.llegada &&
              new Date(p.salida) < new Date(p.llegada);

            return (
              <div
                key={idx}
                className={`grid md:grid-cols-5 gap-4 items-end p-4 rounded ${
                  isLate || invalidArrival
                    ? "bg-red-50 border border-red-400"
                    : "bg-gray-50"
                }`}
              >
                <div>
                  <p className="text-sm font-medium">Lugar:</p>
                  <p>
                    {
                      mockCatalogos.Lugares.find((z) => z.id === p.idLugar)
                        ?.nombre
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Acción:</p>
                  <p>
                    {
                      mockCatalogos.acciones.find((a) => a.codigo === p.accion)
                        ?.nombre
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Fecha agendada:</p>
                  <input
                    type="datetime-local"
                    className="input w-full bg-gray-100 cursor-not-allowed"
                    value={etaDate ? formatDateTimeLocal(etaDate) : ""}
                    disabled
                    title="ETA asignada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Llegada
                  </label>
                  <input
                    type="datetime-local"
                    className={`
                      input w-full
                      ${invalidArrival ? "border-red-800" : ""}
                      ${isLate ? "bg-red-50 border-red-400" : ""}
                    `}
                    value={p.llegada ? formatDateTimeLocal(p.llegada) : ""}
                    min={minLlegada}
                    onChange={(e) =>
                      updatePunto(idx, "llegada", e.target.value)
                    }
                  />
                  {invalidArrival && (
                    <p className="text-sm text-red-800 mt-1">
                      La llegada no puede ser anterior a{" "}
                      {minLlegada.replace("T", " ")}
                    </p>
                  )}
                  {isLate && (
                    <p className="text-sm text-red-600 mt-1">
                      Llegada tardía respecto al agendada (
                      {formatFechaISO(etaDate!)})
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Salida
                  </label>
                  <input
                    type="datetime-local"
                    className={`
                      input w-full
                      ${!p.llegada ? "bg-gray-100 cursor-not-allowed" : ""}
                      ${invalidSalida ? "border-red-800" : ""}
                    `}
                    value={p.salida ? formatDateTimeLocal(p.salida) : ""}
                    min={p.llegada ? formatDateTimeLocal(p.llegada) : undefined}
                    disabled={!p.llegada}
                    onChange={(e) => updatePunto(idx, "salida", e.target.value)}
                  />
                  {invalidSalida && (
                    <p className="text-sm text-red-800 mt-1">
                      La salida no puede ser anterior a la llegada (
                      {formatDateTimeLocal(p.llegada!)})
                    </p>
                  )}
                </div>
                {/* Naviera para puntos de retiro (acción 8) */}
                {p.accion === 8 && (
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium mb-1">
                      Naviera
                    </label>
                    <select
                      className="input w-full"
                      value={p.naviera || 0}
                      onChange={(e) =>
                        updatePunto(idx, "naviera", Number(e.target.value))
                      }
                    >
                      <option value={0}>— Seleccionar naviera —</option>
                      {mockCatalogos.navieras.map((nav) => (
                        <option key={nav.codigo} value={nav.codigo}>
                          {nav.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {isLate && (
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium mb-1">
                      Razón de retraso *
                    </label>
                    <input
                      type="text"
                      className="input w-full border-red-600"
                      value={p.razonDeTardia || ""}
                      onChange={(e) =>
                        updatePunto(idx, "razonDeTardia", e.target.value)
                      }
                      placeholder="Explica por qué llegó tarde"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Guardar Seguimiento
        </button>
        <button
          onClick={handleCompletar}
          className={`px-4 py-2 rounded ${
            calcularPendienteDevolucion(puntos)
              ? "bg-yellow-600 text-white hover:bg-yellow-700" 
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {calcularPendienteDevolucion(puntos) ? "Pasar a Revisar (⚠️ Container Pendiente)" : "Pasar a Revisar"}
        </button>
      </div>

      {/* Modal de confirmación */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onConfirm={confirmarCompletar}
        confirmText="Confirmar"
        cancelText="Cancelar"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            ¿Confirmar pasar servicio a validación?
          </h2>
          {calcularPendienteDevolucion(puntos) ? (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <p className="text-yellow-800 font-medium mb-2">⚠️ Container Pendiente de Devolución</p>
              <p className="text-yellow-700">
                El servicio pasará a <strong>Por validar</strong> pero el container aún no ha sido devuelto. 
                Esto debe resolverse antes de poder completar totalmente el servicio.
              </p>
            </div>
          ) : (
            <p>
              Esta acción marcará el servicio como <strong>Por validar</strong> y
              será enviado a comercial para revisión final.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SeguimientoServicio;
