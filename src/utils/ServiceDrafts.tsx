import { useEffect, useState, useCallback } from "react";

// Interfaces
export interface Item {
  codigo: number;
  nombre: string;
}

export interface GrupoLugar {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Lugar {
  id: number;
  nombre: string;
  tipo: TipoLugar;
  cliente?: number;
  parentId?: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  grupo: number;
}

export interface Catalogos {
  Operación: Item[];
  Zona: Item[];
  GrupoLugares: GrupoLugar[];
  Lugares: Lugar[];
  Tipo_contenedor: Item[];
  acciones: Item[];
  empresas: Cliente[];
  proveedores_extras: Item[];
  grupoCliente: Item[];
  navieras: Item[];
}

export interface Centro {
  codigo: number;
  nombre: string;
  cliente: number;
}

export interface Punto {
  idLugar: number;
  accion: number;
  estado: number;
  eta?: Date; // estimada
  llegada?: Date; // datetime de llegada
  salida?: Date; // datetime de salida
  observacion?: string;
  razonDeTardia?: string;
  naviera?: number; // ID de la naviera para puntos de retiro
}

export interface FormState {
  grupoCliente: number;
  cliente: number;
  tipoOperacion: number;
  origen: number;
  destino: number;
  pais: number;
  fechaSol: Date;
  fechaIng: Date;
  tipoContenedor: number;
  kilos: number;
  precioCarga: number;
  temperatura: number;
  idCCosto: number;
  guiaDeDespacho: string;
  tarjeton: string;
  nroContenedor: string;
  sello: string;
  nave: number;
  observacion: string;
  interchange: string;
  rcNoDevolucion: number;
  odv: string;
  documentoPorContenedor: string[];
  imoCargo: boolean;
  imoCategoria: number;
  tipoServicio: number;
  folio: number;
  fechaFolio: Date;
  eta: Date;
  ejecutivo?: string;
}

export type EstadoServicio =
  | "Pendiente"
  | "En Proceso"
  | "Por facturar"
  | "Completado"
  | "Sin Asignar"
  | "Falso Flete"
  | "Por validar"
  | "En revisión";

export type EstadoSeguimiento =
  | "Sin iniciar"
  | "Asignado"
  | "En ruta a origen"
  | "En origen"
  | "Carga retirada"
  | "En ruta a destino"
  | "Carga entregada"
  | "Pendiente devolución"
  | "Container devuelto"
  | "Completado"
  | "En revisión con pendientes"
  | "Finalizado";

export type TipoLugar = "Zona Portuaria" | "Centro" | "Proveedor";

export interface ValorFactura {
  id: string;
  concepto: string;
  montoCosto: number;
  montoVenta: number;
  fechaEmision: Date;
  tipo: "costo" | "venta";
  codigo?: string;
  descuentoPorcentaje?: Descuento[];
}

export interface Descuento {
  porcentajeDescuento: number;
  razon: string;
}

export interface Movil {
  id: number;
  patente: string;
  tipo: "Tracto" | "Camion" | "Furgon";
  capacidad: number; // En toneladas
  empresa: string; // Empresa a la que pertenece
}

export interface Chofer {
  id: number;
  nombre: string;
  rut: string;
  telefono?: string;
  empresa: string; // Empresa a la que pertenece
}

export interface Rampla {
  id: number;
  patente: string;
  capacidad: number; // En toneladas
}

export interface Payload {
  id: number;
  form: FormState;
  puntos: Punto[];
  estado: EstadoServicio;
  estadoSeguimiento: EstadoSeguimiento;
  pendienteDevolucion: boolean;
  valores?: ValorFactura[];
  chofer?: string;
  movil?: string;
  rampla?: number; // ID de la rampla seleccionada
  descuentoServicioPorcentaje?: Descuento[];
  createdBy: string;
  importBatchId?: string; // Para rastrear lotes de importación
}

// Datos mock completos
export const mockCatalogos: Catalogos = {
  Operación: [
    { codigo: 1, nombre: "EXPORTACIÓN" },
    { codigo: 2, nombre: "IMPORTACIÓN" },
    { codigo: 3, nombre: "NACIONAL" },
    { codigo: 4, nombre: "TRENADA" },
    { codigo: 5, nombre: "REUTILIZACIÓN" },
    { codigo: 6, nombre: "RETORNO" },
    { codigo: 7, nombre: "LOCAL" },
  ],
  Zona: [
    { codigo: 1, nombre: "SUR" },
    { codigo: 2, nombre: "CENTRO" },
    { codigo: 3, nombre: "NORTE" },
  ],
  GrupoLugares: [
    { id: 7, nombre: "Proveedores", descripcion: "Proveedores" },
    { id: 8, nombre: "Centros", descripcion: "Centros" },
  ],
  Lugares: [
    { id: 1, nombre: "SAI", tipo: "Zona Portuaria" },
    { id: 2, nombre: "VAP", tipo: "Zona Portuaria" },
    { id: 3, nombre: "CNL", tipo: "Zona Portuaria" },
    { id: 4, nombre: "LQN", tipo: "Zona Portuaria" },
    { id: 5, nombre: "SVE", tipo: "Zona Portuaria" },
    { id: 6, nombre: "SCL", tipo: "Zona Portuaria" },
    {
      id: 101,
      nombre: "Muelle Norte SAI",
      tipo: "Zona Portuaria",
      parentId: 1,
    },
    { id: 102, nombre: "Muelle Sur SAI", tipo: "Zona Portuaria", parentId: 1 },
    { id: 103, nombre: "Muelle Este VAP", tipo: "Zona Portuaria", parentId: 2 },
    {
      id: 104,
      nombre: "Muelle Oeste VAP",
      tipo: "Zona Portuaria",
      parentId: 2,
    },
    {
      id: 105,
      nombre: "Muelle Central CNL",
      tipo: "Zona Portuaria",
      parentId: 3,
    },
    {
      id: 106,
      nombre: "Muelle Exterior CNL",
      tipo: "Zona Portuaria",
      parentId: 3,
    },
    { id: 107, nombre: "Muelle Alto LQN", tipo: "Zona Portuaria", parentId: 4 },
    { id: 108, nombre: "Muelle Bajo LQN", tipo: "Zona Portuaria", parentId: 4 },
    { id: 109, nombre: "Muelle Este SVE", tipo: "Zona Portuaria", parentId: 5 },
    {
      id: 110,
      nombre: "Muelle Oeste SVE",
      tipo: "Zona Portuaria",
      parentId: 5,
    },
    {
      id: 111,
      nombre: "Muelle Norte SCL",
      tipo: "Zona Portuaria",
      parentId: 6,
    },
    { id: 112, nombre: "Muelle Sur SCL", tipo: "Zona Portuaria", parentId: 6 },

    // Proveedores
    { id: 10, nombre: "Proveedor 1", tipo: "Proveedor" },
    { id: 11, nombre: "Proveedor 2", tipo: "Proveedor" },
    { id: 12, nombre: "Proveedor 3", tipo: "Proveedor" },

    // Centros
    { id: 13, nombre: "Centro A", tipo: "Centro", cliente: 1 },
    { id: 14, nombre: "Centro B", tipo: "Centro", cliente: 1 },
    { id: 15, nombre: "Centro C", tipo: "Centro", cliente: 2 },
    { id: 16, nombre: "Centro D", tipo: "Centro", cliente: 2 },
    { id: 17, nombre: "Centro E", tipo: "Centro", cliente: 3 },
    { id: 18, nombre: "Centro F", tipo: "Centro", cliente: 3 },
    { id: 19, nombre: "Centro G", tipo: "Centro", cliente: 4 },
    { id: 20, nombre: "Centro H", tipo: "Centro", cliente: 4 },
  ],
  Tipo_contenedor: [
    { codigo: 1, nombre: "20 DV" },
    { codigo: 2, nombre: "20 FR" },
    { codigo: 3, nombre: "20 OT" },
    { codigo: 4, nombre: "20 RF" },
    { codigo: 5, nombre: "40 DV" },
    { codigo: 6, nombre: "40 FR" },
    { codigo: 7, nombre: "40 HC" },
    { codigo: 8, nombre: "40 NOR" },
    { codigo: 9, nombre: "40 OT" },
    { codigo: 10, nombre: "40 RF" },
    { codigo: 11, nombre: "LCL / MAQUINARIA" },
  ],
  acciones: [
    { codigo: 1, nombre: "retirar container vacío" },
    { codigo: 2, nombre: "retirar container cargado" },
    { codigo: 3, nombre: "dejar container vacío" },
    { codigo: 4, nombre: "dejar container cargado" },
    { codigo: 5, nombre: "almacenar contenido" },
    { codigo: 6, nombre: "llenar container" },
    { codigo: 7, nombre: "vaciar container" },
    { codigo: 8, nombre: "porteo" },
    { codigo: 9, nombre: "almacenaje" },
    { codigo: 10, nombre: "resguardo" },
    { codigo: 11, nombre: "retirar carga" },
    { codigo: 12, nombre: "dejar carga" },
  ],
  empresas: [
    { id: 1, nombre: "Perrot1", grupo: 1 },
    { id: 2, nombre: "Perrot2", grupo: 1 },
    { id: 3, nombre: "Perrot3", grupo: 2 },
    { id: 4, nombre: "Perrot4", grupo: 2 },
    { id: 5, nombre: "Perrot5", grupo: 3 },
    { id: 6, nombre: "Perrot6", grupo: 3 },
  ],
  proveedores_extras: [
    { codigo: 0, nombre: "Proveedor 1" },
    { codigo: 1, nombre: "Proveedor 2" },
    { codigo: 2, nombre: "Proveedor 3" },
  ],
  grupoCliente: [
    { codigo: 1, nombre: "grupo Cliente 1" },
    { codigo: 2, nombre: "grupo Cliente 2" },
    { codigo: 3, nombre: "grupo Cliente 3" },
  ],
  navieras: [
    { codigo: 1, nombre: "MAERSK" },
    { codigo: 2, nombre: "MSC" },
    { codigo: 3, nombre: "CMA CGM" },
    { codigo: 4, nombre: "COSCO SHIPPING" },
    { codigo: 5, nombre: "HAPAG-LLOYD" },
    { codigo: 6, nombre: "ONE" },
    { codigo: 7, nombre: "EVERGREEN" },
    { codigo: 8, nombre: "YANG MING" },
    { codigo: 9, nombre: "ZIM" },
    { codigo: 10, nombre: "PIL PACIFIC" },
    { codigo: 11, nombre: "HAMBURG SÜD" },
    { codigo: 12, nombre: "HYUNDAI MERCHANT MARINE" },
    { codigo: 13, nombre: "CSAV" },
    { codigo: 14, nombre: "ARKAS LINE" },
    { codigo: 15, nombre: "CCNI" },
  ],
};

// Configuración de colores para estados de seguimiento
export const estadoSeguimientoStyles: Record<EstadoSeguimiento, { bg: string; text: string; border: string }> = {
  "Sin iniciar": { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" },
  "Asignado": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  "En ruta a origen": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  "En origen": { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300" },
  "Carga retirada": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  "En ruta a destino": { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-300" },
  "Carga entregada": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  "Pendiente devolución": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  "Container devuelto": { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  "Completado": { bg: "bg-green-200", text: "text-green-900", border: "border-green-400" },
  "En revisión con pendientes": { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  "Finalizado": { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" },
};

export const mockCentros: Centro[] = [
  { codigo: 1, nombre: "Centro A", cliente: 1 },
  { codigo: 2, nombre: "Centro B", cliente: 1 },
  { codigo: 3, nombre: "Centro C", cliente: 2 },
  { codigo: 4, nombre: "Centro D", cliente: 2 },
  { codigo: 5, nombre: "Centro E", cliente: 3 },
  { codigo: 6, nombre: "Centro F", cliente: 3 },
  { codigo: 7, nombre: "Centro G", cliente: 4 },
  { codigo: 8, nombre: "Centro H", cliente: 4 },
  { codigo: 9, nombre: "Centro I", cliente: 5 },
  { codigo: 10, nombre: "Centro J", cliente: 5 },
  { codigo: 11, nombre: "Centro K", cliente: 6 },
  { codigo: 12, nombre: "Centro L", cliente: 6 },
];

export const mockPaises: Item[] = [
  { codigo: 1, nombre: "Chile" },
  { codigo: 2, nombre: "Argentina" },
  { codigo: 3, nombre: "Perú" },
];

export const mockMoviles: Movil[] = [
  // Empresa TransLogística SA
  { id: 1, patente: "ABCD12", tipo: "Tracto", capacidad: 40, empresa: "TransLogística SA" },
  { id: 2, patente: "EFGH34", tipo: "Tracto", capacidad: 40, empresa: "TransLogística SA" },
  { id: 3, patente: "IJKL56", tipo: "Camion", capacidad: 20, empresa: "TransLogística SA" },
  { id: 4, patente: "MNOP78", tipo: "Furgon", capacidad: 5, empresa: "TransLogística SA" },
  
  // Empresa Transportes Unidos Ltda
  { id: 5, patente: "QRST90", tipo: "Tracto", capacidad: 45, empresa: "Transportes Unidos Ltda" },
  { id: 6, patente: "UVWX12", tipo: "Camion", capacidad: 25, empresa: "Transportes Unidos Ltda" },
  { id: 7, patente: "YZAB34", tipo: "Furgon", capacidad: 8, empresa: "Transportes Unidos Ltda" },
  
  // Empresa LogiCarga Express
  { id: 8, patente: "CDEF56", tipo: "Tracto", capacidad: 35, empresa: "LogiCarga Express" },
  { id: 9, patente: "GHIJ78", tipo: "Camion", capacidad: 18, empresa: "LogiCarga Express" },
  { id: 10, patente: "KLMN90", tipo: "Tracto", capacidad: 42, empresa: "LogiCarga Express" },
];

export const mockChoferes: Chofer[] = [
  // Empresa TransLogística SA
  { id: 1, nombre: "Juan Pérez", rut: "12345678-9", telefono: "+56912345678", empresa: "TransLogística SA" },
  { id: 2, nombre: "María González", rut: "98765432-1", telefono: "+56987654321", empresa: "TransLogística SA" },
  { id: 3, nombre: "Carlos Rodríguez", rut: "11223344-5", telefono: "+56923456789", empresa: "TransLogística SA" },
  
  // Empresa Transportes Unidos Ltda  
  { id: 4, nombre: "Ana Martínez", rut: "55667788-9", telefono: "+56945678901", empresa: "Transportes Unidos Ltda" },
  { id: 5, nombre: "Pedro López", rut: "99887766-5", telefono: "+56967890123", empresa: "Transportes Unidos Ltda" },
  { id: 6, nombre: "Luis Sánchez", rut: "44556677-8", telefono: "+56933445566", empresa: "Transportes Unidos Ltda" },
  
  // Empresa LogiCarga Express
  { id: 7, nombre: "Carmen Silva", rut: "22334455-6", telefono: "+56955667788", empresa: "LogiCarga Express" },
  { id: 8, nombre: "Roberto Torres", rut: "77889900-1", telefono: "+56977889900", empresa: "LogiCarga Express" },
];

export const mockRamplas: Rampla[] = [
  { id: 1, patente: "RAMP01", capacidad: 40 },
  { id: 2, patente: "RAMP02", capacidad: 45 },
  { id: 3, patente: "RAMP03", capacidad: 35 },
  { id: 4, patente: "RAMP04", capacidad: 40 },
  { id: 5, patente: "RAMP05", capacidad: 42 },
  { id: 6, patente: "RAMP06", capacidad: 38 },
  { id: 7, patente: "RAMP07", capacidad: 44 },
  { id: 8, patente: "RAMP08", capacidad: 36 },
  { id: 9, patente: "SEMI01", capacidad: 30 },
  { id: 10, patente: "SEMI02", capacidad: 32 },
];

// Función para obtener empresas de transporte únicas
export function getEmpresasTransporte(): string[] {
  const empresas = new Set<string>();
  mockMoviles.forEach(movil => empresas.add(movil.empresa));
  mockChoferes.forEach(chofer => empresas.add(chofer.empresa));
  return Array.from(empresas).sort();
}

// Implementación de funciones de almacenamiento y migración
const STORAGE = {
  borradores: "serviciosBorradores",
  legacy: "nuevoServicioBorrador",
  ultimoId: "ultimoIdServicio",
  enviados: "serviciosEnviados",
};

export const grupoCliente: Item[] = [];

export interface ValorPorDefecto {
  concepto: string;
  montoVenta: number;
  montoCosto: number;
  aplicaA: "punto" | "servicio";
  condicion?: (p: Punto) => boolean;
}

export const valoresPorDefecto: Record<number | string, ValorPorDefecto> = {
  1: {
    concepto: "Servicio de porteo",
    montoVenta: 40000,
    montoCosto: 7000,
    aplicaA: "punto",
    condicion: (p) => p.accion === 8,
  },
  2: {
    concepto: "Servicio de almacenaje",
    montoVenta: 35000,
    montoCosto: 6000,
    aplicaA: "punto",
    condicion: (p) => p.accion === 9,
  },
  3: {
    concepto: "Gestión documental",
    montoVenta: 15000,
    montoCosto: 3000,
    aplicaA: "servicio",
  },
  4: {
    concepto: "Monitoreo 24/7",
    montoVenta: 18000,
    montoCosto: 4000,
    aplicaA: "servicio",
  },
  5: {
    concepto: "Tracking GPS",
    montoVenta: 10000,
    montoCosto: 2500,
    aplicaA: "servicio",
  },
  6: {
    concepto: "Resguardo de carga",
    montoVenta: 12000,
    montoCosto: 3500,
    aplicaA: "servicio",
    condicion: (p) => p.accion === 10,
  },
  7: {
    concepto: "Comisión administrativa",
    montoVenta: 8000,
    montoCosto: 2000,
    aplicaA: "servicio",
  },
};

export const imoCategorias = [
  {
    code: 1,
    label: "1 – Explosivos",
  },
  {
    code: 2,
    label: "2 – Gases",
  },
  {
    code: 3,
    label: "3 – Líquidos inflamables",
  },
  {
    code: 4,
    label: "4 – Sólidos inflamables o que emiten gases inflamables al mojarse",
  },
  {
    code: 5,
    label: "5 – Sustancias comburentes y peróxidos orgánicos",
  },
  {
    code: 6,
    label: "6 – Sustancias tóxicas e infecciosas",
  },
  {
    code: 7,
    label: "7 – Material radiactivo",
  },
  {
    code: 8,
    label: "8 – Sustancias corrosivas",
  },
  {
    code: 9,
    label: "9 – Sustancias y objetos peligrosos diversos",
  },
];

/** Genera un ID autoincremental */
export function getNextId(): number {
  const last = parseInt(localStorage.getItem(STORAGE.ultimoId) || "0", 10);
  const next = last + 1;
  localStorage.setItem(STORAGE.ultimoId, next.toString());
  return next;
}

/** Drafts */
export function loadDrafts(): Payload[] {
  const raw = localStorage.getItem(STORAGE.borradores);
  return raw ? JSON.parse(raw) : [];
}

export function loadLegacyDraft(): Payload | null {
  const raw = localStorage.getItem(STORAGE.legacy);
  return raw ? JSON.parse(raw) : null;
}

export function saveOrUpdateDraft(payload: Payload): void {
  const drafts = loadDrafts();
  const idx = drafts.findIndex((p) => p.id === payload.id);
  if (idx >= 0) drafts[idx] = payload;
  else drafts.push(payload);
  localStorage.setItem(STORAGE.borradores, JSON.stringify(drafts));
}

export function deleteDraft(id: number): void {
  const drafts = loadDrafts().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE.borradores, JSON.stringify(drafts));
}

export function clearLegacyDraft(): void {
  localStorage.removeItem(STORAGE.legacy);
}

function reviver(key: string, value: any) {
  if (
    (key === "fechaSol" || key === "fechaIng" || key === "fechaFolio") &&
    typeof value === "string"
  ) {
    return new Date(value);
  }
  return value;
}

/** Sent */
export function loadSent(): Payload[] {
  const raw = localStorage.getItem(STORAGE.enviados);
  return raw ? JSON.parse(raw, reviver) : [];
}

export function saveOrUpdateSent(payload: Payload): void {
  const sent = loadSent();
  const idx = sent.findIndex((p) => p.id === payload.id);
  if (idx >= 0) sent[idx] = payload;
  else sent.push(payload);
  localStorage.setItem(STORAGE.enviados, JSON.stringify(sent));
}

/** Migra todas las fechas existentes a formato HH:mm dd/MM/yyyy */
export const migrateAllFechas = (): void => {
  const servicios = [...loadSent(), ...loadDrafts()];
  const now = new Date();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const startLastWeek = new Date(now.getTime() - 2 * oneWeekMs);
  const endLastWeek = new Date(now.getTime() - oneWeekMs);
  const startThisWeek = endLastWeek;
  const endThisWeek = now;

  servicios.forEach((s) => {
    const oldSol =
      s.form.fechaSol instanceof Date
        ? s.form.fechaSol
        : new Date(s.form.fechaSol);
    const solDate = isNaN(oldSol.getTime())
      ? randomDateBetween(startLastWeek, endLastWeek)
      : oldSol;

    const oldIng =
      s.form.fechaIng instanceof Date
        ? s.form.fechaIng
        : new Date(s.form.fechaIng);
    const ingDate = isNaN(oldIng.getTime())
      ? randomDateBetween(startThisWeek, endThisWeek)
      : oldIng;

    s.form.fechaSol = solDate;
    s.form.fechaIng = ingDate;
    const oldFolio =
      s.form.fechaFolio instanceof Date
        ? s.form.fechaFolio
        : new Date(s.form.fechaFolio);
    const folioDate = isNaN(oldFolio.getTime()) ? now : oldFolio;
    s.form.fechaFolio = folioDate;

    saveOrUpdateSent(s);
  });
};


// Helper: genera fecha aleatoria entre dos fechas
function randomDateBetween(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

/** Hook personalizado para drafts */
export function useServiceDrafts() {
  const [drafts, setDrafts] = useState<Payload[]>([]);

  useEffect(() => {
    setDrafts(loadDrafts());
  }, []);

  const upsert = useCallback((payload: Payload) => {
    saveOrUpdateDraft(payload);
    setDrafts(loadDrafts());
  }, []);

  const remove = useCallback((id: number) => {
    deleteDraft(id);
    setDrafts(loadDrafts());
  }, []);

  return { drafts, upsert, remove };
}

export function clearAllServiciosCache(): void {
  console.log("limpiando");
  localStorage.removeItem(STORAGE.borradores);
  localStorage.removeItem(STORAGE.legacy);
  localStorage.removeItem(STORAGE.enviados);
  localStorage.removeItem(STORAGE.ultimoId);
  localStorage.clear();
}
