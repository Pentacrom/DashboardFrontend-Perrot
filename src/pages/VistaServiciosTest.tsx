// VistaServiciosTest.tsx
import React from "react";
import ListWithSearch, {
  Column,
  SearchFilter,
  CheckboxFilterGroup,
} from "../components/ListWithSearch";
import { estadoStyles, badgeTextColor } from "../config/estadoConfig";

// Definición del tipo Service
interface Service {
  id: string;
  cliente: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
  estado: string;
}

// Datos de ejemplo
const services: Service[] = [
  {
    id: "001",
    cliente: "Empresa A",
    origen: "Santiago",
    destino: "Valparaíso",
    fecha: "2025-02-10",
    tipo: "Transporte",
    estado: "por procesar",
  },
  {
    id: "002",
    cliente: "Empresa B",
    origen: "Concepción",
    destino: "Antofagasta",
    fecha: "2025-02-11",
    tipo: "Entrega express",
    estado: "en proceso",
  },
  {
    id: "003",
    cliente: "Empresa C",
    origen: "Temuco",
    destino: "La Serena",
    fecha: "2025-02-12",
    tipo: "Almacenaje",
    estado: "por facturar",
  },
  {
    id: "004",
    cliente: "Empresa D",
    origen: "Iquique",
    destino: "Arica",
    fecha: "2025-02-13",
    tipo: "Transporte",
    estado: "facturado",
  },
  {
    id: "005",
    cliente: "Empresa E",
    origen: "Antofagasta",
    destino: "Rancagua",
    fecha: "2025-02-14",
    tipo: "Logística",
    estado: "completado",
  },
  {
    id: "006",
    cliente: "Empresa F",
    origen: "Puerto Montt",
    destino: "Osorno",
    fecha: "2025-02-15",
    tipo: "Entrega regular",
    estado: "cancelado",
  },
];

// Definición de columnas
const columns: Column<Service>[] = [
  { label: "ODV", key: "id", sortable: true },
  { label: "Cliente", key: "cliente", sortable: true },
  { label: "Origen", key: "origen", sortable: true },
  { label: "Destino", key: "destino", sortable: true },
  { label: "Fecha", key: "fecha", sortable: true },
  { label: "Tipo", key: "tipo", sortable: true },
  { label: "Estado", key: "estado", sortable: true },
];

// Filtros de búsqueda
const searchFilters: SearchFilter<Service>[] = [
  { label: "Fecha Desde", key: "fecha", type: "date" , comparator: "gte"},
  { label: "Fecha Hasta", key: "fecha", type: "date", comparator: "lte" },
];

// Filtro de checkbox para el campo "estado"
const checkboxFilterGroups: CheckboxFilterGroup<Service>[] = [
  {
    label: "Estados",
    key: "estado",
    options: [
      "por procesar",
      "en proceso",
      "por facturar",
      "facturado",
      "completado",
      "cancelado",
    ],
  },
];

const VistaServiciosTest: React.FC = () => {
  return (
    <ListWithSearch<Service>
      data={services}
      columns={columns}
      searchFilters={searchFilters}
      checkboxFilterGroups={checkboxFilterGroups}
      onDownloadExcel={() => alert("Descarga de Excel (stub)")}
      // Modo "row": se aplica el color a toda la fila según el estado
      colorConfig={{
        field: "estado",
        bgMapping: estadoStyles,
        textMapping: badgeTextColor,
        mode: "row",
      }}
      globalSearch={{
        enabled: true,
        placeholder: "Ej: ID:001, Cliente:Empresa A, Estado:en proceso, o texto libre",
        highlightResults: true
      }}
    />
  );
};

export default VistaServiciosTest;
