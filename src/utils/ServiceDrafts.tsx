import { useEffect, useState, useCallback } from "react";
// Interfaces
export interface Item {
  codigo: number;
  nombre: string;
}

export interface Catalogos {
  Operación: Item[];
  Zona: Item[];
  Zona_portuaria: Item[];
  Tipo_contenedor: Item[];
  acciones: Item[];
  empresas: Item[];
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
  zonaPortuaria: number;
  kilos: number;
  precioCarga: number;
  temperatura: number;
  idCCosto: number;
  guia: string;
  tarjeton: string;
  maquina: string;
  sello: string;
  nave: number;
  observacion: string;
  interchange: string;
  rcNoDevolucion: number;
  odv: string;
  documentoPorContenedor: string;
}

export type EstadoServicio = 'Pendiente' | 'En Proceso' | 'Por facturar' | 'Completado' | 'Sin Asignar' | 'Falso Flete' ;

export interface ValorFactura {
  id: string;
  concepto: string;
  monto: number;
  impuesto: number;
  fechaEmision: string;
  tipo: "costo" | "venta";
  codigo?: string;
}



export interface Payload {
  id: number;
  form: FormState;
  puntos: Punto[];
  estado: EstadoServicio;
  valores?: ValorFactura[];
  chofer?: string; // lista de nombres o IDs de choferes asignados
  movil?: string; // lista de patentes o IDs de móviles asignados
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
  Zona_portuaria: [
    { codigo: 1, nombre: "SAI" },
    { codigo: 2, nombre: "VAP" },
    { codigo: 3, nombre: "CNL" },
    { codigo: 4, nombre: "LQN" },
    { codigo: 5, nombre: "SVE" },
    { codigo: 6, nombre: "SCL" },
    { codigo: 7, nombre: "proveedor porteo 1" },
    { codigo: 8, nombre: "proveedor porteo 2" },
    { codigo: 9, nombre: "proveedor almacenaje 1" },
    { codigo: 9, nombre: "proveedor almacenaje 2" },
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
  ],
  empresas: [
    { codigo: 1, nombre: "Perrot1" },
    { codigo: 2, nombre: "Perrot2" },
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

interface ValorPorDefecto {
  concepto: string;
  monto: number;
  aplicaA: "punto" | "servicio";
}

export const valoresPorDefecto: Record<number | string, ValorPorDefecto> = {
  // Valores por acción de punto
  1: { concepto: "Retiro de container vacío", monto: 50000, aplicaA: "punto" },
  2: {
    concepto: "Retiro de container cargado",
    monto: 70000,
    aplicaA: "punto",
  },
  3: { concepto: "Entrega de container vacío", monto: 40000, aplicaA: "punto" },
  4: {
    concepto: "Entrega de container cargado",
    monto: 60000,
    aplicaA: "punto",
  },
  5: { concepto: "Almacenaje de contenido", monto: 45000, aplicaA: "punto" },
  6: { concepto: "Llenado de container", monto: 55000, aplicaA: "punto" },
  7: { concepto: "Vaciado de container", monto: 53000, aplicaA: "punto" },
  8: { concepto: "Servicio de porteo", monto: 30000, aplicaA: "punto" },
  9: { concepto: "Servicio de almacenaje", monto: 25000, aplicaA: "punto" },

  // Servicios extras (no ligados a puntos)
  doc: { concepto: "Gestión documental", monto: 12000, aplicaA: "servicio" },
  mon: { concepto: "Monitoreo 24/7", monto: 15000, aplicaA: "servicio" },
  track: { concepto: "Tracking GPS", monto: 8000, aplicaA: "servicio" },
  seg: { concepto: "Seguro de carga", monto: 10000, aplicaA: "servicio" },
  com: {
    concepto: "Comisión administrativa",
    monto: 6000,
    aplicaA: "servicio",
  },
};


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
