import React from "react";
import { Column } from "../components/ListWithSearch";
import { EstadoServicio } from "./ServiceDrafts";
import { estadoStyles, badgeTextColor } from "../config/estadoConfig";
import { formatCLP } from "./format";

export interface ServiceRow {
  id: string;
  cliente: string;
  tipoOperacion: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
  estado: EstadoServicio;
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
  { label: "ID", key: "id", sortable: true },
  { label: "Cliente", key: "cliente", sortable: true },
  { label: "Tipo Operación", key: "tipoOperacion", sortable: true },
  { label: "Origen", key: "origen", sortable: true },
  { label: "Destino", key: "destino", sortable: true },
  { label: "Fecha", key: "fecha", sortable: true },
  { label: "Tipo", key: "tipo", sortable: true },
  {
    label: "Estado",
    key: "estado",
    sortable: true,
  },
  { label: "País", key: "pais", sortable: true },
  { label: "Tipo Contenedor", key: "tipoContenedor", sortable: true },
  { label: "Kilos", key: "kilos", sortable: true },
  {
    label: "Precio Carga",
    key: "precioCarga",
    sortable: true,
  },
  { label: "Temperatura", key: "temperatura", sortable: true },
  { label: "Guía Despacho", key: "guiaDeDespacho", sortable: true },
  { label: "Tarjetón", key: "tarjeton", sortable: true },
  { label: "Nro Contenedor", key: "nroContenedor", sortable: true },
  { label: "Sello", key: "sello", sortable: true },
  { label: "Nave", key: "nave", sortable: true },
  { label: "Observación", key: "observacion", sortable: true },
  { label: "Interchange", key: "interchange", sortable: true },
  { label: "ODV", key: "odv", sortable: true },
  { label: "IMO Cargo", key: "imoCargo", sortable: true },
  { label: "IMO Categoría", key: "imoCategoria", sortable: true },
  { label: "Tipo Servicio", key: "tipoServicio", sortable: true },
  { label: "Folio", key: "folio", sortable: true },
  { label: "Fecha Folio", key: "fechaFolio", sortable: true },
  { label: "ETA", key: "eta", sortable: true },
  { label: "Ejecutivo", key: "ejecutivo", sortable: true },
  { label: "Chofer", key: "chofer", sortable: true },
  { label: "Móvil", key: "movil", sortable: true },
];

// Configuraciones de columnas por defecto para cada página
export const defaultColumnConfigs = {
  comercial: ["id", "cliente", "tipoOperacion", "origen", "destino", "fecha", "tipo", "estado", "pais", "tipoContenedor", "precioCarga"] as Array<keyof ServiceRow>,
  torreDeControl: ["id", "cliente", "origen", "destino", "fecha", "tipo", "estado"] as Array<keyof ServiceRow>,
  operaciones: ["id", "cliente", "origen", "destino", "fecha", "tipo", "precioCarga", "estado"] as Array<keyof ServiceRow>,
};

// Función para obtener columnas con render personalizado
export const getServiceColumnsWithRender = (): Column<ServiceRow>[] => {
  return allServiceColumns.map(col => {
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
    if (col.key === "precioCarga") {
      return {
        ...col,
        render: (value: number) => formatCLP(Number(value)),
      };
    }
    if (col.key === "imoCargo") {
      return {
        ...col,
        render: (value: boolean) => value ? "Sí" : "No",
      };
    }
    if (col.key === "kilos" || col.key === "nave" || col.key === "folio" || col.key === "imoCategoria" || col.key === "tipoServicio") {
      return {
        ...col,
        render: (value: number) => value === 0 ? "-" : value.toString(),
      };
    }
    return col;
  });
};