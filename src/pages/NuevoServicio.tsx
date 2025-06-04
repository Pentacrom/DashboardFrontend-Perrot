// src/pages/NuevoServicio.tsx
import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Punto,
  FormState,
  Item,
  getNextId,
  loadSent,
  saveOrUpdateSent,
  mockCatalogos,
  mockPaises,
  useServiceDrafts,
  Payload,
  valoresPorDefecto,
  ValorFactura,
  Lugar,
  Descuento,
  imoCategorias
} from "../utils/ServiceDrafts";
import { MoreVertical } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const NuevoServicio: React.FC = () => {
  const { id: paramId } = useParams<{ id?: string }>();
  const nav = useNavigate();
  const location = useLocation();
  const isComercial = location.pathname.includes("/comercial");
  const formRef = useRef<HTMLFormElement>(null);
  const { drafts, remove } = useServiceDrafts();

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
    kilos: 0,
    precioCarga: 0,
    temperatura: 0,
    idCCosto: 0,
    guiaDeDespacho: "",
    tarjeton: "",
    nroContenedor: "",
    sello: "",
    nave: 0,
    observacion: "",
    interchange: "",
    rcNoDevolucion: 0,
    odv: "",
    documentoPorContenedor: [],
    imoCargo: false,
    imoCategoria: 0,
    tipoServicio: 0,
  });
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const { userName } = useContext(AuthContext);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función común para procesar FileList
  const processFiles = useCallback((files: FileList) => {
    const rutas = Array.from(files).map((file) => `/uploads/${file.name}`);
    setForm((f) => ({
      ...f,
      documentoPorContenedor: rutas,
    }));
  }, []);

  useEffect(() => {
    if (!form.fechaSol || puntos.length === 0) return;
    const minFirst = `${form.fechaSol}T00:00`;
    setPuntos((prev) => {
      const first = prev[0];
      if (
        (first!.eta && first!.eta < minFirst) ||
        (first!.llegada && first!.llegada < minFirst)
      ) {
        const updated = [...prev];
        updated[0] = {
          ...first,
          eta: "",
          llegada: "",
        } as Punto;
        return updated;
      }
      return prev;
    });
  }, [form.fechaSol]);

  // Extrae el primer segmento de la ruta (p.ej. "comercial" o "operacion")
  const segments = location.pathname.split("/").filter(Boolean);
  const perfilActual = segments[0] || "";

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
  const centrosFiltrados = mockCatalogos.Lugares.filter(
    (c) => c.cliente === form.cliente && c.tipo === "Centro"
  );

  const ZonasPortuarias = mockCatalogos.Lugares.filter(
    (c) => c.tipo == "Zona Portuaria"
  );

  const ambos = [...ZonasPortuarias, ...centrosFiltrados];

  const origenOptions = (() => {
    if (form.tipoOperacion === 1) return centrosFiltrados;
    if (form.tipoOperacion === 2) return ZonasPortuarias;
    if (form.tipoOperacion > 2) return ambos;
    return [];
  })();

  const destinoOptions = (() => {
    if (form.tipoOperacion === 1) return ZonasPortuarias;
    if (form.tipoOperacion === 2) return centrosFiltrados;
    if (form.tipoOperacion > 2) return ambos;
    return [];
  })();

  // Determina el estado previo del camión antes de cada punto
  const estadosPrevios = puntos.map((_, idx) => {
    if (idx === 0) return "none";
    const act = puntos[idx - 1]?.accion ?? 0;
    if ([1, 7].includes(act)) return "empty";
    if ([2, 6, 8, 9, 11].includes(act)) return "loaded";
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
    (idx: number, key: keyof Punto, val: number | string) =>
      setPuntos((prev) => {
        // 1) clonar y actualizar solo el campo cambiado
        const next = prev.map((pt, i) =>
          i === idx ? ({ ...pt, [key]: val } as Punto) : pt
        );

        // 2) si cambiamos ETA, vaciar posteriores que queden antes
        if (key === "eta") {
          const newEta = val as string;
          for (let j = idx + 1; j < next.length; j++) {
            // si tenían fecha y es anterior a la nueva, la limpiamos
            if (next[j]!.eta && next[j]!.eta < newEta) {
              next[j] = { ...next[j], eta: "" } as Punto;
            }
          }
        }

        return next;
      }),
    []
  );

  const removePunto = useCallback(
    (idx: number) => setPuntos((p) => p.filter((_, i) => i !== idx)),
    []
  );

  // Manejo de archivo para "documentoPorContenedor"
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
    },
    [processFiles]
  );

  // Drag events
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

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
      if (form.imoCargo && form.imoCategoria === 0) {
        alert("Si marcaste Cargo IMO, debes elegir categoría (1–9).");
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
      const createdBy = existing?.createdBy || userName;

      if (!hasValores) {
        const valores = generarValoresDesdePuntos(puntos);
        saveOrUpdateSent({
          id: newId,
          form,
          puntos,
          estado: "Sin Asignar",
          valores,
          createdBy,
        });
        if (drafts.some((d) => d.id === newId)) remove(newId);
        alert("Se generaron valores automáticamente. Revisa y confirma.");
        nav(`/${perfilActual}/gestionar-valores/${newId}`);
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
        createdBy,
      });
      if (drafts.some((d) => d.id === newId)) remove(newId);

      alert(`Servicio ${newId} enviado. Estado: ${estadoFinal}`);
      nav(`/${perfilActual}/gestion-servicios`);
    },
    [form, puntos, idService, drafts, remove, nav]
  );

  // Handler para Guardar borrador
  const handleGuardar = useCallback(() => {
    const newId = idService ?? getNextId();
    const existing = idService
      ? loadSent().find((s) => s.id === newId) ||
        drafts.find((d) => d.id === newId)
      : null;
    const estadoToUse = existing?.estado ?? "Pendiente";
    const createdBy = existing?.createdBy || userName;

    saveOrUpdateSent({
      id: newId,
      form,
      puntos,
      estado: estadoToUse,
      createdBy,
    });
    alert(`Guardado servicio N° ${newId}.`);
    nav(`/${perfilActual}/gestion-servicios`);
  }, [form, puntos, idService, nav]);

  function generarValoresDesdePuntos(puntos: Punto[]): ValorFactura[] {
    // asegura que nunca sea undefined
    const hoy: string = new Date().toISOString().split("T")[0] ?? "";

    return puntos
      .filter((p) => !!valoresPorDefecto[p.accion])
      .map((p, i) => {
        const def = valoresPorDefecto[p.accion]!;

        return {
          id: `auto-${i}`,
          concepto: def.concepto,
          montoVenta: def.montoVenta,
          montoCosto: def.montoCosto,
          impuesto: 0, // ValorPorDefecto no trae impuesto
          fechaEmision: hoy, // Siempre string
          tipo: "costo" as "costo", // o "venta", según convenga
          codigo: p.accion.toString(),
          descuentoPorcentaje: [] as Descuento[],
        } as ValorFactura;
      });
  }

  // quita ceros iniciales: "007" → "7", deja "0" si es exactamente "0"
  const stripLeadingZeros = (raw: string) => raw.replace(/^0+(?=\d)/, "");

  // handler genérico para inputs numéricos
  const handleNumberChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      // limpio los ceros a la izquierda
      const cleaned = stripLeadingZeros(e.target.value);
      // convierto a número (si está vacío lo dejo en 0)
      const num = cleaned === "" ? 0 : Number(cleaned);
      setForm((f) => ({ ...f, [field]: num } as FormState));
    };

  const [showMenuIdx, setShowMenuIdx] = useState<number | null>(null);

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
            {/* Seleccionar si el servicio es Directo o Indirecto */}
            <div>
              <label className="block text-sm font-medium">Servicio *</label>
              <select
                className="input"
                value={form.tipoServicio || 1}
                onChange={upd("tipoServicio")}
                required
              >
                <option value={0}>—</option>
                <option value={1}>Directo</option>
                <option value={2}>Indirecto</option>
              </select>
            </div>
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
                value={form.kilos === 0 ? "" : form.kilos}
                onChange={handleNumberChange("kilos")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Precio de Carga
              </label>
              <input
                type="number"
                className="input"
                value={form.precioCarga === 0 ? "" : form.precioCarga}
                onChange={handleNumberChange("precioCarga")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Temperatura (°C) *
              </label>
              <div className="flex items-center space-x-4">
                {/* Slider */}
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={1}
                  className="flex-grow"
                  value={form.temperatura}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      temperatura: Number(e.target.value),
                    }))
                  }
                  required
                />
                {/* Input numérico */}
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    className="input w-20"
                    value={form.temperatura}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      // opcional: validar rango antes de setear
                      if (val >= -20 && val <= 25) {
                        setForm((f) => ({ ...f, temperatura: val }));
                      }
                    }}
                    min={-20}
                    max={25}
                    required
                  />
                  <span className="text-sm text-gray-600">°C</span>
                </div>
              </div>
            </div>
            {form.tipoContenedor != 11 &&
              <div>
                <label className="block text-sm font-medium">Nro. Contenedor *</label>
                <input
                  className="input"
                  value={form.nroContenedor}
                  onChange={upd("nroContenedor")}
                  required
                />
              </div>
            }
            <div>
              <label className="block text-sm font-medium">Guía de despacho</label>
              <input
                className="input"
                value={form.guiaDeDespacho}
                onChange={upd("guiaDeDespacho")}
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
              <label className="block text-sm font-medium mb-2">
                Documentos por Contenedor
              </label>
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative p-6 border-2 border-dashed rounded cursor-pointer 
          ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 bg-white"
          }`}
              >
                <p className="text-center text-gray-600">
                  {isDragging
                    ? "Suelta los archivos aquí"
                    : "Arrastra los archivos o haz click para seleccionar"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
              </div>

              {/* Ejemplo: mostrar rutas */}
              {form.documentoPorContenedor.length > 0 && (
                <ul className="mt-4 list-disc list-inside">
                  {form.documentoPorContenedor.map((ruta, i) => (
                    <li key={i}>{ruta}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Puntos del recorrido */}
        {puntos.map((p, idx) => {
          const prev = estadosPrevios[idx];
          let acciones: Item[] = [];
          let lugaresPuntos: Lugar[] = [];
          const rawMinEta = idx === 0 ? form.fechaSol : puntos[idx - 1]!.eta;
          const minEta = rawMinEta
            ? rawMinEta.includes("T")
              ? rawMinEta
              : `${rawMinEta}T00:00`
            : undefined;

          // Filtramos lugares igual en todos los casos
          lugaresPuntos = mockCatalogos.Lugares.filter(
            (a) => a.cliente === form.cliente || a.cliente === undefined
          );

          // Si es LCL / Maquinaria (código 11), ajustamos acciones según prev
          if (form.tipoContenedor === 11) {
            if (prev === "loaded") {
              // Ya hay carga: permitir dejar carga (4), porteo (8), almacenaje (9), resguardo (10)
              acciones = mockCatalogos.acciones.filter((a) =>
                [12, 8, 9, 10].includes(a.codigo)
              );
            } else {
              // No hay carga previa: solo permitir retirar carga (11)
              acciones = mockCatalogos.acciones.filter((a) => a.codigo === 11);
            }
          } else {
            // Contenedor normal: aplicamos las reglas previas según `prev`
            if (prev === "none") {
              acciones = mockCatalogos.acciones.filter((a) =>
                [1, 2].includes(a.codigo)
              );
            } else if (prev === "empty") {
              acciones = mockCatalogos.acciones.filter((a) =>
                [6, 3].includes(a.codigo)
              );
            } else if (prev === "loaded") {
              acciones = mockCatalogos.acciones.filter((a) =>
                [7, 4, 8, 9].includes(a.codigo)
              );
            }
          }

          return (
            <div
              key={idx}
              className="flex p-3 bg-white rounded shadow items-center"
            >
              {/* Izquierda: Lugar, Acción, ETA y Observación */}
              <div className="grid grid-cols-4 gap-4 flex-grow">
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
                    {optLugar(lugaresPuntos)}
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
                    min={minEta}
                    onChange={(e) => updatePunto(idx, "eta", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Observación
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    value={p.observacion}
                    onChange={(e) =>
                      updatePunto(idx, "observacion", e.target.value)
                    }
                  />
                </div>

                {/* Mostrar Cargo IMO y Categoría solo si la acción conlleva retirar una carga */}
                {(p.accion === 2 || p.accion === 6 || p.accion === 11) && (
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`imoCargo-${idx}`}
                        checked={form.imoCargo}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm((f) => ({
                            ...f,
                            imoCargo: checked,
                            imoCategoria: checked ? f.imoCategoria : 0,
                          }));
                        }}
                      />
                      <label
                        htmlFor={`imoCargo-${idx}`}
                        className="text-sm font-medium"
                      >
                        Cargo IMO (Carga peligrosa)
                      </label>
                    </div>

                    {form.imoCargo && (
                      <div>
                        <label
                          htmlFor={`imoCategoria-${idx}`}
                          className="block text-sm font-medium mb-1"
                        >
                          Categoría IMO *
                        </label>
                        <select
                          id={`imoCategoria-${idx}`}
                          className="input w-full"
                          value={form.imoCategoria}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              imoCategoria: Number(e.target.value),
                            }))
                          }
                          required
                        >
                          <option value={0}>— Elige categoría —</option>
                          {imoCategorias.map(({ code, label }) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addPunto}
          disabled={!form.fechaSol || !form.tipoContenedor}
          className={`px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Añadir Punto
        </button>

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
