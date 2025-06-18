import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  loadDrafts,
  loadSent,
  saveOrUpdateSent,
  Payload,
  Punto,
  mockCatalogos,
  mockCentros,
} from "../../utils/ServiceDrafts";
import { Modal } from "../../components/Modal";
import { formatDateTimeLocal } from "../../utils/format";



const SeguimientoServicio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Payload | null>(null);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Extrae el primer segmento de la ruta
  const segments = location.pathname.split("/").filter(Boolean);
  const perfilActual = segments[1] || "";

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const lookupLugar = (code: number) => {
    const inPort = mockCatalogos.Lugares.find((z) => z.id === code);
    if (inPort) return inPort.nombre;
    const centro = mockCentros.find((c) => c.codigo === code);
    return centro ? centro.nombre : code.toString();
  };
  const lookupAccion = (code: number) =>
    mockCatalogos.acciones.find((a) => a.codigo === code)?.nombre ||
    code.toString();

  const updatePunto = useCallback(
    (idx: number, key: keyof Punto, value: string) =>
      setPuntos((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p))
      ),
    []
  );

  const validarFechas = () =>
    puntos.every((p, idx) => {
      const minArrivalRaw =
        idx === 0 ? service?.form.fechaSol : puntos[idx - 1]?.salida || "";
      return (
        !!p.llegada &&
        !!p.salida &&
        new Date(p.llegada) >= new Date(minArrivalRaw!) &&
        new Date(p.salida) >= new Date(p.llegada)
      );
    });

  const handleGuardar = useCallback(() => {
    if (!service) return;
    const updated: Payload = { ...service, puntos };
    saveOrUpdateSent(updated);
    alert("Seguimiento guardado correctamente.");
    navigate(-1);
  }, [service, puntos, navigate]);

  const handleCompletar = () => {
    if (!validarFechas()) {
      alert("Todas las fechas deben respetar el orden y estar completas.");
      return;
    }
    setShowModal(true);
  };

  const confirmarCompletar = () => {
    if (!service) return;
    const actualizado: Payload = {
      ...service,
      puntos,
      estado: "Por validar",
    };
    saveOrUpdateSent(actualizado);
    setShowModal(false);
    alert("Servicio marcado como Por validar.");
    navigate(`/${perfilActual}/gestion-servicios`);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Seguimiento Servicio #{service.id}
        </h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
          Estado: {service.estado}
        </span>
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
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Puntos del Recorrido</h2>
        <div className="space-y-4">
          {puntos.map((p, idx) => {
            // --- calculamos el mínimo bruto para llegada y salida ---
            const minRawLlegada =
              idx === 0
                ? service!.form.fechaSol // fecha de solicitud (YYYY-MM-DD)
                : puntos[idx - 1]!.salida!; // salida del punto anterior (YYYY-MM-DDTHH:mm)
            const minLlegada = formatDateTimeLocal(minRawLlegada);

            // para salida el mínimo es la llegada misma
            const minRawSalida = p.llegada || "";
            const minSalida = minRawSalida && formatDateTimeLocal(minRawSalida);

            const etaDate = p.eta;
            const minArrivalRaw =
              idx === 0 ? service.form.fechaSol : puntos[idx - 1]?.salida || "";
            const minArrival = minArrivalRaw
              ? formatDateTimeLocal(minArrivalRaw)
              : undefined;
            const isLate =
              !!p.llegada &&
              !!etaDate &&
              new Date(p.llegada) > new Date(etaDate);
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
                  <p>{lookupLugar(p.idLugar)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Acción:</p>
                  <p>{lookupAccion(p.accion)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ETA:</p>
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
                    value={formatDateTimeLocal(p.llegada) || ""}
                    min={minArrival}
                    onChange={(e) =>
                      updatePunto(idx, "llegada", e.target.value)
                    }
                  />
                  {invalidArrival && (
                    <p className="text-sm text-red-800 mt-1">
                      La llegada no puede ser anterior a&nbsp;
                      {minArrival?.replace("T", " ")}
                    </p>
                  )}
                  {isLate && (
                    <p className="text-sm text-red-600 mt-1">
                      Llegada tardía respecto a la ETA (
                      {formatDateTimeLocal(etaDate!)})
                    </p>
                  )}
                </div>

                {/* SALIDA */}
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
                    value={formatDateTimeLocal(p.salida) || ""}
                    min={p.llegada ? formatDateTimeLocal(p.llegada) : undefined}
                    disabled={!p.llegada}
                    onChange={(e) => updatePunto(idx, "salida", e.target.value)}
                  />
                  {invalidSalida && (
                    <p className="text-sm text-red-800 mt-1">
                      La salida no puede ser anterior a la llegada (
                      {formatDateTimeLocal(p.llegada)})
                    </p>
                  )}
                </div>
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Completar Servicio
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            ¿Confirmar completar servicio?
          </h2>
          <p>
            Esta acción marcará el servicio como <strong>Por validar</strong> y
            será enviada a comercial.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarCompletar}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SeguimientoServicio;
