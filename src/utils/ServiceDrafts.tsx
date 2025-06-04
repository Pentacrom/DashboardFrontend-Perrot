import { useEffect, useState, useCallback } from "react";
// Interfaces
export interface Item {
  codigo: number;
  nombre: string;
}

export interface Lugar{
  id: number;
  nombre: string;
  tipo: TipoLugar;
  cliente?: number;
}
export interface Catalogos {
  Operación: Item[];
  Zona: Item[];
  Lugares: Lugar[];
  Tipo_contenedor: Item[];
  acciones: Item[];
  empresas: Item[];
  proveedores_extras: Item[];
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
  eta: string; // estimada
  llegada?: string; // datetime de llegada
  salida?: string; // datetime de salida
  observacion?: string;
  razonDeTardia?: string;
}

export interface FormState {
  cliente: number;
  tipoOperacion: number;
  origen: number;
  destino: number;
  pais: number;
  fechaSol: string;
  fechaIng: string;
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
}

export type EstadoServicio = 'Pendiente' | 'En Proceso' | 'Por facturar' | 'Completado' | 'Sin Asignar' | 'Falso Flete';
export type TipoLugar = 'Zona Portuaria' | 'Centro' | 'Proveedor'

export interface ValorFactura {
  id: string;
  concepto: string;
  montoCosto: number;
  montoVenta: number;
  fechaEmision: string;
  tipo: "costo" | "venta";
  codigo?: string;
  descuentoPorcentaje?: Descuento[] /** Descuento porcentual aplicado a este ítem (0-100) */;
}

export interface Descuento {
  porcentajeDescuento: number;
  razon: string;
}



export interface Payload {
  id: number;
  form: FormState;
  puntos: Punto[];
  estado: EstadoServicio;
  valores?: ValorFactura[];
  chofer?: string; // lista de nombres o IDs de choferes asignados
  movil?: string; // lista de patentes o IDs de móviles asignados
  /** Descuento porcentual aplicado al total del servicio (0-100) */
  descuentoServicioPorcentaje?: Descuento[];
  createdBy: string;
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
  Lugares: [
    { id: 1, nombre: "SAI", tipo: "Zona Portuaria" },
    { id: 2, nombre: "VAP", tipo: "Zona Portuaria" },
    { id: 3, nombre: "CNL", tipo: "Zona Portuaria" },
    { id: 4, nombre: "LQN", tipo: "Zona Portuaria" },
    { id: 5, nombre: "SVE", tipo: "Zona Portuaria" },
    { id: 6, nombre: "SCL", tipo: "Zona Portuaria" },
    { id: 10, nombre: "Proveedor 1", tipo: "Proveedor" },
    { id: 11, nombre: "Proveedor 2", tipo: "Proveedor" },
    { id: 12, nombre: "Proveedor 3", tipo: "Proveedor" },
    { id: 13, nombre: "Centro A", tipo: "Centro", cliente: 1 },
    { id: 14, nombre: "Centro B", tipo: "Centro", cliente: 1 },
    { id: 15, nombre: "Centro C", tipo: "Centro", cliente: 2 },
    { id: 16, nombre: "Centro D", tipo: "Centro", cliente: 2 },
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
    { codigo: 1, nombre: "Perrot1" },
    { codigo: 2, nombre: "Perrot2" },
  ],
  proveedores_extras: [
    { codigo: 0, nombre: "Proveedor 1" },
    { codigo: 1, nombre: "Proveedor 2" },
    { codigo: 2, nombre: "Proveedor 3" },
  ],
};

export const mockCentros: Centro[] = [
  { codigo: 1, nombre: "Centro A", cliente: 1 },
  { codigo: 2, nombre: "Centro B", cliente: 1 },
  { codigo: 3, nombre: "Centro C", cliente: 2 },
  { codigo: 4, nombre: "Centro D", cliente: 2 },
];

export const mockPaises: Item[] = [
  { codigo: 1, nombre: "Chile" },
  { codigo: 2, nombre: "Argentina" },
  { codigo: 3, nombre: "Perú" },
];

// Implementación de las funciones
const STORAGE = {
  borradores: "serviciosBorradores",
  legacy: "nuevoServicioBorrador",
  ultimoId: "ultimoIdServicio",
  enviados: "serviciosEnviados",
};

export interface ValorPorDefecto {
  concepto: string;
  montoVenta: number;
  montoCosto: number;
  aplicaA: "punto" | "servicio";
}

export const valoresPorDefecto: Record<number | string, ValorPorDefecto> = {
  // Valores por acción de punto (ejemplos)
  1: {
    concepto: "Retiro de container vacío",
    montoVenta: 60000,
    montoCosto: 10000,
    aplicaA: "punto",
  },
  2: {
    concepto: "Retiro de container cargado",
    montoVenta: 80000,
    montoCosto: 12000,
    aplicaA: "punto",
  },
  3: {
    concepto: "Entrega de container vacío",
    montoVenta: 50000,
    montoCosto: 9000,
    aplicaA: "punto",
  },
  4: {
    concepto: "Entrega de container cargado",
    montoVenta: 75000,
    montoCosto: 13000,
    aplicaA: "punto",
  },
  5: {
    concepto: "Almacenaje de contenido",
    montoVenta: 55000,
    montoCosto: 8000,
    aplicaA: "punto",
  },
  6: {
    concepto: "Llenado de container",
    montoVenta: 65000,
    montoCosto: 11000,
    aplicaA: "punto",
  },
  7: {
    concepto: "Vaciado de container",
    montoVenta: 63000,
    montoCosto: 10500,
    aplicaA: "punto",
  },
  8: {
    concepto: "Servicio de porteo",
    montoVenta: 40000,
    montoCosto: 7000,
    aplicaA: "punto",
  },
  9: {
    concepto: "Servicio de almacenaje",
    montoVenta: 35000,
    montoCosto: 6000,
    aplicaA: "punto",
  },

  // Servicios extras (ejemplos)
  doc: {
    concepto: "Gestión documental",
    montoVenta: 15000,
    montoCosto: 3000,
    aplicaA: "servicio",
  },
  mon: {
    concepto: "Monitoreo 24/7",
    montoVenta: 18000,
    montoCosto: 4000,
    aplicaA: "servicio",
  },
  track: {
    concepto: "Tracking GPS",
    montoVenta: 10000,
    montoCosto: 2500,
    aplicaA: "servicio",
  },
  seg: {
    concepto: "Seguro de carga",
    montoVenta: 12000,
    montoCosto: 3500,
    aplicaA: "servicio",
  },
  com: {
    concepto: "Comisión administrativa",
    montoVenta: 8000,
    montoCosto: 2000,
    aplicaA: "servicio",
  },
};

export const imoCategorias = [
  {
    code: 1,
    label:
      "1 – Explosivos (sustancias que pueden detonar o iniciar reacción explosiva)",
  },
  {
    code: 2,
    label:
      "2 – Gases (inflamables, no inflamables o tóxicos, envasados a presión)",
  },
  {
    code: 3,
    label: "3 – Líquidos inflamables (petróleo, solventes, alcoholes, etc.)",
  },
  {
    code: 4,
    label:
      "4 – Sólidos inflamables o que emiten gases inflamables al mojarse (pólvoras, sulfuro, etc.)",
  },
  {
    code: 5,
    label:
      "5 – Sustancias comburentes y peróxidos orgánicos (oxidantes que promueven combustión)",
  },
  {
    code: 6,
    label:
      "6 – Sustancias tóxicas e infecciosas (venenos, agentes patógenos, etc.)",
  },
  {
    code: 7,
    label:
      "7 – Material radiactivo (residuos nucleares, fuentes radiactivas industriales, etc.)",
  },
  {
    code: 8,
    label:
      "8 – Sustancias corrosivas (ácidos fuertes, álcalis, etc., que destruyen tejidos o metales)",
  },
  {
    code: 9,
    label:
      "9 – Sustancias y objetos peligrosos diversos (mercancías peligrosas que no encajan en clases anteriores)",
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

/** Sent */
export function loadSent(): Payload[] {
  const raw = localStorage.getItem(STORAGE.enviados);
  return raw ? JSON.parse(raw) : [];
}

export function saveOrUpdateSent(payload: Payload): void {
  const sent = loadSent();
  const idx = sent.findIndex((p) => p.id === payload.id);
  if (idx >= 0) sent[idx] = payload;
  else sent.push(payload);
  localStorage.setItem(STORAGE.enviados, JSON.stringify(sent));
}

/** Hook personalizado */
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
