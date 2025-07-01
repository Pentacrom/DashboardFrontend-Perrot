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
  imoCategorias,
  Cliente,
  GrupoLugar,
} from "../utils/ServiceDrafts";
import { AuthContext } from "../context/AuthContext";
import { MoreVertical } from "lucide-react";
import { SearchableDropdown } from "../components/SearchableDropdown";
import { formatDateTimeLocal, formatDateOnly } from "../utils/format";


const NuevoServicio: React.FC = () => {
  const { id: paramId } = useParams<{ id?: string }>();
  const nav = useNavigate();
  const location = useLocation();
  const isComercial = location.pathname.includes("/comercial");
  const formRef = useRef<HTMLFormElement>(null);
  const { drafts, remove } = useServiceDrafts();

  const [idService, setIdService] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({
    grupoCliente: 0,
    cliente: 0,
    tipoOperacion: 0,
    origen: 0,
    destino: 0,
    pais: 0,
    fechaSol: new Date(),
    fechaIng: new Date(),
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
    folio: 0,
    fechaFolio: new Date(),
    eta: new Date(),
  });
  const [grupoPuntos, setGrupoPuntos] = useState<number[]>([]);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const { userName } = useContext(AuthContext);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subgrupoPuntos, setSubgrupoPuntos] = useState<number[]>([]);

  // Función común para procesar FileList
  const processFiles = useCallback((files: FileList) => {
    const rutas = Array.from(files).map((file) => `/uploads/${file.name}`);
    setForm((f) => ({
      ...f,
      documentoPorContenedor: rutas,
    }));
  }, []);

  // Sincronizador de grupo de lugares
  useEffect(() => {
    setSubgrupoPuntos(
      puntos.map((p) => {
        const lugar = mockCatalogos.Lugares.find((l) => l.id === p.idLugar);
        return lugar?.parentId ?? 0;
      })
    );
  }, [puntos]);


  useEffect(() => {
    //clearAllServiciosCache();
    // migrateAllFechas();
    if (!form.fechaSol || puntos.length === 0) return;
    const minFirst = new Date(form.fechaSol);
    minFirst.setHours(0, 0, 0, 0);
    setPuntos((prev) => {
      const first = prev[0];
      if (
        (first!.eta && first!.eta.getTime() < minFirst.getTime()) ||
        (first!.llegada &&
          new Date(first!.llegada).getTime() < minFirst.getTime())
      ) {
        const updated = [...prev];
        updated[0] = {
          ...first,
          eta: new Date(),
          llegada: new Date(),
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
      setForm({
        ...found.form,
        fechaSol: new Date(found.form.fechaSol),
        fechaIng: new Date(found.form.fechaIng),
        fechaFolio: new Date(found.form.fechaFolio),
      });
      setPuntos(
        (found.puntos || []).map((p) => ({
          ...p,
          eta: new Date(p.eta!),
          llegada: p.llegada ? new Date(p.llegada) : undefined,
          salida: p.salida ? new Date(p.salida) : undefined,
        }))
      );
    }
  }, [paramId, drafts]);

  // Actualización de campos del formulario
  function upd<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<any>) => {
      let value: any = e.target.value;
      if (key === "fechaSol" || key === "fechaIng" || key === "fechaFolio") {
        value = new Date(value);
      } else if (e.target.type === "number" || typeof form[key] === "number") {
        value = Number(value);
      }
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

  const optCliente = useCallback(
    (arr?: Cliente[]) =>
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

  const esContainerRefrigerado = (): boolean => {
    return mockCatalogos.Tipo_contenedor.filter(
      (c) => c.nombre.includes("RF") || c.nombre.includes("FR")
    ).some((c) => c.codigo === form.tipoContenedor);
  };

  const ZonasPortuarias = mockCatalogos.Lugares.filter(
    (c) => c.tipo == "Zona Portuaria"
  );

  const ambos = [...ZonasPortuarias, ...centrosFiltrados];

  const clienteOptions = mockCatalogos.empresas.filter(
    (c) => c.grupo === form.grupoCliente
  );

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
  const addPunto = useCallback(() => {
    setPuntos((p) => [
      ...p,
      { idLugar: 0, accion: 0, estado: 1, eta: new Date() },
    ]);
    setGrupoPuntos((g) => [...g, 0]);
  }, []);


  // Insertar punto antes de la posición idx
  const insertPunto = useCallback(
    (idx: number) =>
      setPuntos((p) => [
        ...p,
        { idLugar: 0, accion: 0, estado: 1, eta: new Date() },
      ]),
    []
  );

  const updatePunto = useCallback(
    (idx: number, key: keyof Punto, val: number | Date | string) =>
      setPuntos((prev) => {
        const next = prev.map((pt, i) =>
          i === idx ? ({ ...pt, [key]: val } as Punto) : pt
        );

        // Si estamos actualizando la ETA y val es Date...
        if (key === "eta" && val instanceof Date) {
          const newEtaMs = val.getTime();
          // Recorre los puntos siguientes
          for (let j = idx + 1; j < next.length; j++) {
            const etaJ = next[j]!.eta;
            // Si el punto j tiene eta anterior a la nueva, resetea
            if (etaJ instanceof Date && etaJ.getTime() < newEtaMs) {
              next[j] = {
                ...next[j],
                eta: new Date(0), // puedes usar otra fecha por defecto
              } as Punto;
            }
          }
        }

        return next;
      }),
    []
  );

  const removePunto = useCallback((idx: number) => {
    setPuntos((p) => p.filter((_, i) => i !== idx));
    setGrupoPuntos((g) => g.filter((_, i) => i !== idx));
  }, []);

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
      const createdBy = userName;

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
        estado: existing!.estado,
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
    const hoy = new Date();

    // 1) Genera todos los valores a partir de puntos
    const detalles = puntos
      .map((p, i) => {
        const def = valoresPorDefecto[p.accion];
        const accionItem = mockCatalogos.acciones.find(
          (a) => a.codigo === p.accion
        );

        if (!accionItem) return null;

        // Si existe definición y cumple condición, usa sus valores
        if (def && (!def.condicion || def.condicion(p))) {
          return {
            id: `auto-${i}`,
            concepto: def.concepto,
            montoVenta: def.montoVenta,
            montoCosto: def.montoCosto,
            impuesto: 0,
            fechaEmision: hoy,
            tipo: "costo" as const,
            codigo: p.accion.toString(),
            descuentoPorcentaje: [] as Descuento[],
          } as ValorFactura;
        }

        // Si falla la condición (o no hay def), usa nombre de acción y ceros
        return {
          id: `auto-${i}`,
          concepto: accionItem.nombre,
          montoVenta: 0,
          montoCosto: 0,
          impuesto: 0,
          fechaEmision: hoy,
          tipo: "costo" as const,
          codigo: p.accion.toString(),
          descuentoPorcentaje: [] as Descuento[],
        } as ValorFactura;
      })
      .filter((v): v is ValorFactura => v !== null);

    // 2) Crea el valor base del servicio, con montos en 0
    const baseServicio: ValorFactura = {
      id: "base-servicio",
      concepto: "Valor base del servicio",
      montoVenta: 0,
      montoCosto: 0,
      fechaEmision: hoy,
      tipo: "costo" as const,
      codigo: "base",
      descuentoPorcentaje: [] as Descuento[],
    };

    // 3) Devuelve primero el base y luego los valores de puntos
    return [baseServicio, ...detalles];
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
        {/* Grupo de cliente */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Grupo de Cliente *
            </label>
            <select
              className="input"
              value={form.grupoCliente}
              onChange={upd("grupoCliente")}
              required
            >
              <option value={0}>—</option>
              {opt(mockCatalogos.grupoCliente)}
            </select>
          </div>

          {/* Cliente y operación */}
          {form.grupoCliente != 0 && (
            <div>
              <div>
                <label className="block text-sm font-medium">Cliente *</label>
                <select
                  className="input"
                  value={form.cliente}
                  onChange={upd("cliente")}
                  required
                >
                  <option value={0}>—</option>
                  {optCliente(clienteOptions)}
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
          )}
        </div>

        {/* Origen / Destino */}
        {form.cliente > 0 && form.tipoOperacion > 0 && form.grupoCliente && (
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="imoCargo"
                checked={form.imoCargo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imoCargo: e.target.checked }))
                }
              />
              <label htmlFor="imoCargo">Cargo IMO (Carga peligrosa)</label>
            </div>
            {form.imoCargo && (
              <div>
                <label htmlFor="imoCategoria">Categoría IMO *</label>
                <select
                  id="imoCategoria"
                  value={form.imoCategoria}
                  onChange={upd("imoCategoria")}
                  required
                  className="input"
                >
                  <option value={0}>—</option>
                  {imoCategorias.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                type="datetime-local"
                className="input"
                value={formatDateTimeLocal(form.fechaSol)}
                onChange={upd("fechaSol")}
                required
              />
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
                Precio de Carga ($US)
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
                Temperatura (°C) {esContainerRefrigerado() && "*"}
              </label>
              <div className="flex items-center space-x-4">
                {/* Slider */}
                <input
                  type="range"
                  min={-20}
                  max={20}
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
            <div>
              <label className="block text-sm font-medium">ETA *</label>
              <input
                type="date"
                className="input"
                value={formatDateOnly(form.eta)}
                onChange={upd("eta")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                N° de Folio {form.tipoOperacion === 1 && "*"}
              </label>
              <input
                type="number"
                className="input"
                value={form.folio}
                onChange={upd("folio")}
                required={form.tipoOperacion === 1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Fecha de Folio
              </label>
              <input
                type="date"
                className="input"
                value={formatDateOnly(form.fechaFolio)}
                onChange={upd("fechaFolio")}
              />
            </div>
            {form.tipoContenedor != 11 && (
              <div>
                <label className="block text-sm font-medium">
                  Nro. Contenedor *
                </label>
                <input
                  className="input"
                  value={form.nroContenedor}
                  onChange={upd("nroContenedor")}
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">
                Guía de despacho
              </label>
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
          const idGrupoSeleccionado = grupoPuntos[idx] || 0;
          const lugaresPuntos = mockCatalogos.Lugares.filter(
            (a) =>
              (a.cliente === form.cliente || a.cliente === undefined) &&
              a.idGrupo === idGrupoSeleccionado
          );
          // rawMinEta siempre string en formato "YYYY-MM-DDTHH:mm"
          const rawMinEta: string | undefined =
            idx === 0
              ? form.fechaSol.toISOString().slice(0, 16)
              : // si en el punto anterior hay eta, lo pasamos a ISO y recortamos
                puntos[idx - 1]!.eta?.toISOString().slice(0, 16);

          const minEta = rawMinEta
            ? rawMinEta.includes("T")
              ? rawMinEta
              : `${rawMinEta}T00:00`
            : undefined;

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

          // grupo actual (id de GrupoLugares)
          const idGrupoSeleccionado = grupoPuntos[idx] || 0;
          // raíces: los lugares de primer nivel de ese grupo
          const rootLugares = mockCatalogos.Lugares.filter(
            (l) => l.idGrupo === idGrupoSeleccionado && !l.parentId
          );
          // sublugares: los que tengan parentId igual al subgrupo seleccionado
          const subLugares = mockCatalogos.Lugares.filter(
            (l) => l.parentId === subgrupoPuntos[idx]
          );

          return (
            <div
              key={idx}
              className="relative flex p-3 bg-white rounded shadow items-start"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ⋮ toggle */}
              <div className="absolute top-2 right-2">
                <MoreVertical
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenuIdx(idx);
                  }}
                />
              </div>

              {/* menú desplegable */}
              {showMenuIdx === idx && (
                <div
                  className="absolute top-8 right-2 w-36 bg-white border rounded shadow-lg z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                    onClick={() => {
                      insertPunto(idx);
                      setShowMenuIdx(null);
                    }}
                  >
                    Agregar arriba
                  </button>
                  <button
                    className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-red-600"
                    onClick={() => {
                      removePunto(idx);
                      setShowMenuIdx(null);
                    }}
                  >
                    Eliminar punto
                  </button>
                </div>
              )}

              {/* Campos del punto */}
              <div className="grid grid-cols-4 gap-4 flex-grow">
                {/* selector de grupo */}
                <div className="w-full pr-2">
                  <label className="block text-sm font-medium mb-1">
                    Grupo *
                  </label>
                  <select
                    className="input w-full"
                    value={idGrupoSeleccionado}
                    onChange={(e) => {
                      const nuevo = Number(e.target.value);
                      setGrupoPuntos((g) => {
                        const copy = [...g];
                        copy[idx] = nuevo;
                        return copy;
                      });
                      // resetear lugar al cambiar grupo
                      updatePunto(idx, "idLugar", 0);
                    }}
                    required
                  >
                    <option value={0}>— Selecciona grupo —</option>
                    {mockCatalogos.GrupoLugares.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* lugar filtrado por grupo */}
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">
                    Lugar del Punto {idx + 1} *
                  </label>
                  <SearchableDropdown
                    options={lugaresPuntos}
                    value={
                      lugaresPuntos.find((l) => l.id === p.idLugar) || null
                    }
                    onChange={(sel) =>
                      sel && updatePunto(idx, "idLugar", sel.id)
                    }
                    getOptionLabel={(l) => l.nombre}
                    placeholder="Buscar lugar..."
                  />
                </div>

                {/* Acción */}
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

                {/* Fecha agendada */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fecha agendada *
                  </label>
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={formatDateTimeLocal(p.eta)}
                    onChange={(e) =>
                      updatePunto(idx, "eta", new Date(e.target.value))
                    }
                    required
                  />
                </div>

                {/* Observación */}
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
