import React from "react";
import { Column } from "../components/ListWithSearch";
import { EstadoServicio, EstadoSeguimiento, imoCategorias, mockCatalogos, estadoSeguimientoStyles } from "./ServiceDrafts";
import { estadoStyles, badgeTextColor } from "../config/estadoConfig";
import { formatCLP, formatDateTime } from "./format";
import EstadoSeguimientoOval from "../components/EstadoSeguimientoOval";

export interface ServiceRow {
  id: string;
  cliente: string;
  tipoOperacion: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
  estado: EstadoServicio;
  estadoSeguimiento: EstadoSeguimiento;
  pendienteDevolucion: boolean;
  correoEnviado: boolean; // Para rastrear si se envió el correo de notificación
  rowStyle: string; // Campo calculado para coloración de filas
  pais: string;
  tipoContenedor: string;
  kilos: number;
  precioCarga: number;
  temperatura: number;
  guiaDeDespacho: string;
  tarjeton: string;
  nroContenedor: string;
  sello: string;
  nave: number;
  observacion: string;
  interchange: string;
  odv: string;
  imoCargo: boolean;
  imoCategoria: number;
  tipoServicio: number;
  folio: number;
  fechaFolio: string;
  eta: string;
  ejecutivo: string;
  chofer?: string;
  movil?: string;
  raw: any;
}

// Definición completa de todas las columnas posibles
export const allServiceColumns: Column<ServiceRow>[] = [
  { label: "ID", key: "id", sortable: true, dataType: "text", locked: true },
  { label: "Cliente", key: "cliente", sortable: true, dataType: "text" },
  { label: "Tipo Operación", key: "tipoOperacion", sortable: true, dataType: "text" },
  { label: "Origen", key: "origen", sortable: true, dataType: "text" },
  { label: "Destino", key: "destino", sortable: true, dataType: "text" },
  { label: "Fecha", key: "fecha", sortable: true, dataType: "date" },
  { label: "Tipo", key: "tipo", sortable: true, dataType: "text" },
  {
    label: "Estado",
    key: "estado",
    sortable: true,
    dataType: "text",
  },
  { label: "País", key: "pais", sortable: true, dataType: "text" },
  { label: "Tipo Contenedor", key: "tipoContenedor", sortable: true, dataType: "text" },
  { label: "Kilos", key: "kilos", sortable: true, dataType: "number" },
  {
    label: "Precio Carga",
    key: "precioCarga",
    sortable: true,
    dataType: "currency",
    currencySymbol: "$",
  },
  { 
    label: "Temperatura", 
    key: "temperatura", 
    sortable: true, 
    dataType: "temperature",
    temperatureUnit: "C",
  },
  { label: "Guía Despacho", key: "guiaDeDespacho", sortable: true, dataType: "text" },
  { label: "Tarjetón", key: "tarjeton", sortable: true, dataType: "text" },
  { label: "Nro Contenedor", key: "nroContenedor", sortable: true, dataType: "text" },
  { label: "Sello", key: "sello", sortable: true, dataType: "text" },
  { 
    label: "Nave", 
    key: "nave", 
    sortable: true, 
    dataType: "lookup",
    lookupData: mockCatalogos.navieras.map(nav => ({ code: nav.codigo, name: nav.nombre })),
  },
  { label: "Observación", key: "observacion", sortable: true, dataType: "text" },
  { label: "Interchange", key: "interchange", sortable: true, dataType: "text" },
  { label: "ODV", key: "odv", sortable: true, dataType: "text" },
  { label: "IMO Cargo", key: "imoCargo", sortable: true, dataType: "boolean" },
  { 
    label: "IMO Categoría", 
    key: "imoCategoria", 
    sortable: true, 
    dataType: "lookup",
    lookupData: imoCategorias.map(cat => ({ code: cat.code, name: cat.label })),
  },
  { label: "Tipo Servicio", key: "tipoServicio", sortable: true, dataType: "number" },
  { label: "Folio", key: "folio", sortable: true, dataType: "number" },
  { label: "Fecha Folio", key: "fechaFolio", sortable: true, dataType: "date" },
  { label: "ETA", key: "eta", sortable: true, dataType: "date" },
  { label: "Ejecutivo", key: "ejecutivo", sortable: true, dataType: "text" },
  { label: "Estado Seguimiento", key: "estadoSeguimiento", sortable: true, dataType: "text" },
  { label: "Container Pendiente", key: "pendienteDevolucion", sortable: true, dataType: "boolean" },
  { label: "Chofer", key: "chofer", sortable: true, dataType: "text" },
  { label: "Móvil", key: "movil", sortable: true, dataType: "text" },
];

// Configuraciones de columnas por defecto para cada página
export const defaultColumnConfigs = {
  comercial: ["id", "cliente", "tipoOperacion", "origen", "destino", "fecha", "tipo", "estado", "estadoSeguimiento", "pais", "tipoContenedor", "precioCarga"] as Array<keyof ServiceRow>,
  torreDeControl: ["id", "cliente", "origen", "destino", "fecha", "tipo", "estado", "estadoSeguimiento", "pendienteDevolucion"] as Array<keyof ServiceRow>,
  operaciones: ["id", "cliente", "origen", "destino", "fecha", "tipo", "precioCarga", "estado", "estadoSeguimiento"] as Array<keyof ServiceRow>,
};

// Función para obtener columnas con render personalizado
export const getServiceColumnsWithRender = (showEmailReminder: boolean = false): Column<ServiceRow>[] => {
  return allServiceColumns.map(col => {
    if (col.key === "id") {
      return {
        ...col,
        locked: true,
        render: (value: string, row: ServiceRow) => (
          <div className="flex items-center gap-2">
            <span>{value}</span>
            {row.pendienteDevolucion && (
              <span 
                className="text-red-600 font-bold text-lg" 
                title="Pendiente devolución de container"
              >
                ⚠️
              </span>
            )}
            {showEmailReminder && !row.correoEnviado && (
              <span 
                className="text-orange-600 font-bold text-lg" 
                title="Recordatorio: Enviar correo de notificación"
              >
                ✉️
              </span>
            )}
          </div>
        ),
      };
    }
    if (col.key === "estado") {
      return {
        ...col,
        render: (value: EstadoServicio) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${estadoStyles[value]} ${badgeTextColor[value]}`}
          >
            {value}
          </span>
        ),
      };
    }
    if (col.key === "estadoSeguimiento") {
      return {
        ...col,
        render: (value: EstadoSeguimiento) => (
          <EstadoSeguimientoOval estado={value} />
        ),
      };
    }
    if (col.key === "pendienteDevolucion") {
      return {
        ...col,
        render: (value: boolean) => (
          <div className="flex items-center justify-center gap-2">
            <input
              type="checkbox"
              checked={value}
              disabled
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            {value && (
              <span 
                className="flex items-center gap-1 px-2 py-1 bg-red-100 border border-red-500 text-red-800 rounded-full font-bold text-xs"
                title="¡URGENTE! Container pendiente de devolución"
              >
                🚨 PENDIENTE
              </span>
            )}
          </div>
        ),
      };
    }
    return col;
  });
};