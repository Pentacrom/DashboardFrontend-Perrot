// src/pages/NuevoServicio.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Punto,
  FormState,
  Item,
  getNextId,
  loadSent,
  saveOrUpdateSent,
  mockCatalogos,
  mockCentros,
  mockPaises,
  useServiceDrafts,
  Payload,
  valoresPorDefecto,
  ValorFactura,
  Lugar,

} from "../utils/ServiceDrafts";
import { ArrowDown } from "lucide-react";


const NuevoServicio: React.FC = () => {
  const { id: paramId } = useParams<{ id?: string }>();
  const nav = useNavigate();
  const location = useLocation();
  const isComercial = location.pathname.includes("/comercial");
  const formRef = useRef<HTMLFormElement>(null);
  const { drafts, upsert, remove } = useServiceDrafts();

  const [idService, setIdService] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({
    cliente: 0,
    tipoOperacion: 0,
    origen: 0,
    destino: 0,
    pais: 0,
    fechaSol: "",
    fechaIng: new Date().toISOString().replace("T", " ").split(".")[0] ?? "",
    tipoContenedor: 0,
    zonaPortuaria: 0,
    kilos: 0,
    precioCarga: 0,
    temperatura: 0,
    idCCosto: 0,
    guia: "",
    tarjeton: "",
    maquina: "",
    sello: "",
    nave: 0,
    observacion: "",
    interchange: "",
    rcNoDevolucion: 0,
    odv: "",
    documentoPorContenedor: "",
  });
  const [puntos, setPuntos] = useState<Punto[]>([]);

  // Carga inicial si editando
  useEffect(() => {
    if (!paramId) return;
    const svcId = parseInt(paramId, 10);
    if (isNaN(svcId)) return;
    const sent = loadSent();
    const found =
      sent.find((s) => s.id === svcId) || drafts.find((d) => d.id === svcId);
    if (found) {
      setIdService(svcId);
      setForm(found.form as FormState);
      setPuntos(found.puntos || []);
    }
  }, [paramId, drafts]);

  // Actualización de campos del formulario
  function upd<K extends keyof FormState>(
    key: K
  ): (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void {
    return (e) => {
      const t = e.target;
      const value =
        t.type === "number" || typeof form[key] === "number"
          ? (Number(t.value) as FormState[K])
          : (t.value as FormState[K]);
      setForm((f) => ({ ...f, [key]: value } as FormState));
    };
  }


  const opt = useCallback(
    (arr?: Item[]) =>
      arr?.map((i) => (
        <option key={i.codigo} value={i.codigo}>
          {i.nombre}
        </option>
      )),
    []
  );

    const optLugar = useCallback(
      (arr?: Lugar[]) =>
        arr?.map((i) => (
          <option key={i.id} value={i.id}>
            {i.nombre}
          </option>
        )),
      []
    );
  

  // Filtrado de catálogos según cliente y operación
  const centrosFiltrados = mockCentros.filter(
    (c) => c.cliente === form.cliente
  );

  const ZonasPortuarias = mockCatalogos.Lugares.filter(
    (c) => c.tipo == "Zona Portuaria"
  )

const origenOptions =
  form.tipoOperacion === 2
    ? ZonasPortuarias // cuando tipoOperacion===2
    : form.tipoOperacion === 1
    ? centrosFiltrados // cuando tipoOperacion===1
    : []; // en cualquier otro caso

const destinoOptions =
  form.tipoOperacion === 1
    ? ZonasPortuarias // cuando tipoOperacion===1
    : form.tipoOperacion === 2
    ? centrosFiltrados // cuando tipoOperacion===2
    : [];


  // Determina el estado previo del camión antes de cada punto
  const estadosPrevios = puntos.map((_, idx) => {
    if (idx === 0) return "none";
    const act = puntos[idx - 1]?.accion ?? 0;
    if ([1, 7].includes(act)) return "empty";
    if ([2, 6, 8, 9].includes(act)) return "loaded";
    return "none";
  });

  // Agregar punto al final
  const addPunto = useCallback(
    () =>
      setPuntos((p) => [...p, { idLugar: 0, accion: 0, estado: 1, eta: "" }]),
    []
  );
  // Insertar punto antes de la posición idx
  const insertPunto = useCallback(
    (idx: number) =>
      setPuntos((p) => [
        ...p.slice(0, idx),
        { idLugar: 0, accion: 0, estado: 1, eta: "" },
        ...p.slice(idx),
      ]),
    []
  );
  const updatePunto = useCallback(
    (idx: number, key: keyof Punto, v: number | string) =>
      setPuntos((p) =>
        p.map((pt, i) => (i === idx ? { ...pt, [key]: v } : pt))
      ),
    []
  );
  const removePunto = useCallback(
    (idx: number) => setPuntos((p) => p.filter((_, i) => i !== idx)),
    []
  );

  // Manejo de archivo para "documentoPorContenedor"
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setForm((f) => ({
          ...f,
          documentoPorContenedor: `/uploads/${file.name}`,
        }));
      }
    },
    []
  );

  // Mostrar estado actual (solo si existe idService)
  const mostrarEstado = () => {
    if (!idService) return "Nuevo (no guardado)";
    const svc =
      loadSent().find((s) => s.id === idService) ||
      drafts.find((d) => d.id === idService);
    return svc?.estado ?? "Pendiente";
  };

  // Handler para Enviar servicio
  const handleEnviar = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formRef.current?.checkValidity()) {
        formRef.current?.reportValidity();
        return;
      }
      if (puntos.length < 2) {
        alert("Debes definir al menos 2 puntos.");
        return;
      }
      const lastAcc = puntos[puntos.length - 1]?.accion;
      const lastState = [1, 7].includes(lastAcc ?? 0)
        ? "empty"
        : [2, 6].includes(lastAcc ?? 0)
        ? "loaded"
        : "none";
      if (lastState !== "none") {
        alert("El viaje debe terminar sin contenedor.");
        return;
      }

      const newId = idService ?? getNextId();
      const sentList = loadSent();
      const existing =
        sentList.find((s) => s.id === newId) ||
        drafts.find((d) => d.id === newId);
      const hasValores = Boolean((existing as Payload)?.valores?.length);

      if (!hasValores) {
        const valores = generarValoresDesdePuntos(puntos);
        saveOrUpdateSent({ id: newId, form, puntos, estado: "Sin Asignar", valores });
        if (drafts.some((d) => d.id === newId)) remove(newId);
        alert("Se generaron valores automáticamente. Revisa y confirma.");
        nav(`/comercial/agregar-valores/${newId}`);
        return;
      }

      // Con valores: estado depende de chofer/móvil
      const hasChofer = Boolean((existing as Payload).chofer);
      const hasMovil = Boolean((existing as Payload).movil);
      const estadoFinal: Payload["estado"] =
        hasChofer && hasMovil ? "En Proceso" : "Sin Asignar";

      saveOrUpdateSent({
        id: newId,
        form,
        puntos,
        estado: estadoFinal,
        valores: (existing as Payload).valores,
        chofer: (existing as Payload).chofer,
        movil: (existing as Payload).movil,
      });
      if (drafts.some((d) => d.id === newId)) remove(newId);

      alert(`Servicio ${newId} enviado. Estado: ${estadoFinal}`);
      nav("/comercial/ingresoServicios");
    },
    [form, puntos, idService, drafts, remove, nav]
  );

  // Handler para Guardar borrador
  const handleGuardar = useCallback(() => {
    const newId = idService ?? getNextId();
    // si ya existía un estado, lo reutilizamos; si no, "Pendiente"
    const existing =
      idService
        ? loadSent().find((s) => s.id === newId) || drafts.find((d) => d.id === newId)
        : null;
    const estadoToUse = existing?.estado ?? "Pendiente";
    saveOrUpdateSent({ id: newId, form, puntos, estado: estadoToUse });
    upsert({ id: newId, form, puntos, estado: estadoToUse });
    alert(`Borrador guardado con ID ${newId}. Estado: Pendiente`);
    nav("/comercial/ingresoServicios");
  }, [form, puntos, idService, upsert, nav]);

function generarValoresDesdePuntos(puntos: Punto[]): ValorFactura[] {
  const hoy: string = new Date().toISOString().split("T")[0]!; // aseguras que es string

  return puntos
    .filter((p) => valoresPorDefecto[p.accion])
    .map((p, i) => {
      const def = valoresPorDefecto[p.accion]!;
      return {
        id: `auto-${i}`,
        concepto: def.concepto,
        monto: def.monto,
        impuesto: 0,
        fechaEmision: hoy, // ahora TypeScript no reclama
        tipo: "costo",
        codigo: p.accion.toString(),
      };
    });
}



  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {idService ? "Modificar Servicio" : "Nuevo Servicio"}
        </h1>
        {idService && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            Estado: {mostrarEstado()}
          </span>
        )}
      </div>

      <form
        ref={formRef}
        onSubmit={handleEnviar}
        className="space-y-6 bg-white p-6 shadow rounded"
      >
        {/* Cliente y operación */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Cliente *</label>
            <select
              className="input"
              value={form.cliente}
              onChange={upd("cliente")}
              required
            >
              <option value={0}>—</option>
              {opt(mockCatalogos.empresas)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Tipo de operación *
            </label>
            <select
              className="input"
              value={form.tipoOperacion}
              onChange={upd("tipoOperacion")}
              required
            >
              <option value={0}>—</option>
              {opt(mockCatalogos.Operación)}
            </select>
          </div>
        </div>

        {/* Origen / Destino */}
        {form.cliente > 0 && form.tipoOperacion > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Origen *</label>
              <select
                className="input"
                value={form.origen}
                onChange={upd("origen")}
                required
              >
                <option value={0}>—</option>
                {optLugar(origenOptions as Lugar[])}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Destino *</label>
              <select
                className="input"
                value={form.destino}
                onChange={upd("destino")}
                required
              >
                <option value={0}>—</option>
                {optLugar(destinoOptions as Lugar[])}
              </select>
            </div>
          </div>
        )}

        {/* Otros campos */}
        {form.cliente > 0 && form.tipoOperacion > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {/*<div>
              <label className="block text-sm font-medium">ODV *</label>
              <input
                className="input"
                value={form.odv}
                onChange={upd("odv")}
                required
              />
            </div>*/}
            <div>
              <label className="block text-sm font-medium">País *</label>
              <select
                className="input"
                value={form.pais}
                onChange={upd("pais")}
                required
              >
                <option value={0}>—</option>
                {opt(mockPaises)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Fecha de Solicitud *
              </label>
              <input
                type="date"
                className="input"
                value={form.fechaSol}
                onChange={upd("fechaSol")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Tipo de contenedor *
              </label>
              <select
                className="input"
                value={form.tipoContenedor}
                onChange={upd("tipoContenedor")}
                required
              >
                <option value={0}>—</option>
                {opt(mockCatalogos.Tipo_contenedor)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Kilos *</label>
              <input
                type="number"
                className="input"
                value={form.kilos}
                onChange={upd("kilos")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Precio de Carga *
              </label>
              <input
                type="number"
                className="input"
                value={form.precioCarga}
                onChange={upd("precioCarga")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Temperatura *</label>
              <input
                type="number"
                className="input"
                value={form.temperatura}
                onChange={upd("temperatura")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Guía</label>
              <input
                className="input"
                value={form.guia}
                onChange={upd("guia")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tarjetón</label>
              <input
                className="input"
                value={form.tarjeton}
                onChange={upd("tarjeton")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Máquina</label>
              <input
                className="input"
                value={form.maquina}
                onChange={upd("maquina")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Sello</label>
              <input
                className="input"
                value={form.sello}
                onChange={upd("sello")}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Observación</label>
              <textarea
                className="input w-full h-24"
                value={form.observacion}
                onChange={upd("observacion")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Interchange</label>
              <input
                className="input"
                value={form.interchange}
                onChange={upd("interchange")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Documento por Contenedor
              </label>
              <input type="file" onChange={handleFileChange} />
            </div>
          </div>
        )}

        {/* Puntos del recorrido */}
        {form.cliente > 0 && form.tipoOperacion > 0 && (
          <section className="space-y-4 mt-6">
            <h2 className="text-lg font-semibold">Puntos del Recorrido</h2>
            <p className="text-sm text-gray-600 mb-4">
              Debes definir al menos 2 puntos y asegurar que el camión comience
              retirando un contenedor y termine vacío.
            </p>
            <div className="space-y-4">
              {puntos.map((p, idx) => {
                const prev = estadosPrevios[idx];
                let acciones: Item[] = [];
                if (prev === "none")
                  acciones = mockCatalogos.acciones.filter((a) =>
                    [1, 2].includes(a.codigo)
                  );
                else if (prev === "empty")
                  acciones = mockCatalogos.acciones.filter((a) =>
                    [6, 3].includes(a.codigo)
                  );
                else if (prev === "loaded")
                  acciones = mockCatalogos.acciones.filter((a) =>
                    [7, 4, 8, 9].includes(a.codigo)
                  );

                return (
                  <div
                    key={idx}
                    className="grid md:grid-cols-4 gap-4 items-end p-3 bg-white rounded shadow"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Lugar del Punto {idx + 1} *
                      </label>
                      <select
                        className="input w-full"
                        value={p.idLugar}
                        onChange={(e) =>
                          updatePunto(idx, "idLugar", +e.target.value)
                        }
                        required
                      >
                        <option value={0}>Seleccione un lugar</option>
                        {optLugar(mockCatalogos.Lugares)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Acción *
                      </label>
                      <select
                        className="input w-full"
                        value={p.accion}
                        onChange={(e) =>
                          updatePunto(idx, "accion", +e.target.value)
                        }
                        required
                      >
                        <option value={0}>Seleccione una acción</option>
                        {opt(acciones)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        ETA *
                      </label>
                      <input
                        type="datetime-local"
                        className="input w-full"
                        value={p.eta}
                        onChange={(e) =>
                          updatePunto(idx, "eta", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => insertPunto(idx)}
                        className="px-3 py-1.5 bg-yellow-600 text-white rounded"
                        title="Insertar punto abajo"
                      >
                        <ArrowDown strokeWidth={3} className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePunto(idx)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={addPunto}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Añadir Punto
              </button>
            </div>
          </section>
        )}

        {/* Botones Enviar y Guardar */}
        <div className="flex gap-4">
          {isComercial && (
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Enviar
            </button>
          )}
          <button
            type="button"
            onClick={handleGuardar}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Guardar
          </button>
          {/* Botón Cancelar */}
          <button
            type="button"
            onClick={() => nav(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoServicio;
