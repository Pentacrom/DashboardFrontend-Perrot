import React from "react";
import { useNavigate } from "react-router-dom";
import ListWithSearch, {
  Column,
  SearchFilter,
  CheckboxFilterGroup,
  DropdownOption
} from "../components/ListWithSearch";

interface Service {
  id: string;
  cliente: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
}

const services: Service[] = [
  {
    id: "001",
    cliente: "Empresa A",
    origen: "Santiago",
    destino: "Valparaíso",
    fecha: "2025-02-10",
    tipo: "Transporte",
  },
  {
    id: "002",
    cliente: "Empresa B",
    origen: "Concepción",
    destino: "Antofagasta",
    fecha: "2025-02-11",
    tipo: "Entrega express",
  },
  {
    id: "003",
    cliente: "Empresa C",
    origen: "Temuco",
    destino: "La Serena",
    fecha: "2025-02-12",
    tipo: "Almacenaje",
  },
];

const columns: Column<Service>[] = [
  { label: "ODV", key: "id", sortable: true },
  { label: "Cliente", key: "cliente", sortable: true },
  { label: "Origen", key: "origen", sortable: true },
  { label: "Destino", key: "destino", sortable: true },
  { label: "Fecha", key: "fecha", sortable: true },
  { label: "Tipo", key: "tipo", sortable: true },
];

const searchFilters: SearchFilter<Service>[] = [
  { label: "ODV", key: "id", type: "text", placeholder: "Ingrese ODV" },
  {
    label: "Cliente",
    key: "cliente",
    type: "text",
    placeholder: "Ingrese Cliente",
  },
  { label: "Fecha Desde", key: "fecha", type: "date", comparator: "gte" },
  { label: "Fecha Hasta", key: "fecha", type: "date", comparator: "lte" },
];

const checkboxFilterGroups: CheckboxFilterGroup<Service>[] = [
  // Puedes agregar grupos de filtros si lo necesitas, o dejarlo vacío.
];

const VistaServiciosPendientes: React.FC = () => {
  const navigate = useNavigate();

  // Opción del dropdown para cada fila: Completar servicio
  const dropdownOptions: DropdownOption<Service>[] = [
    {
      label: "Ver Detalle",
      onClick: (service) => {
        navigate("/detalle-servicio", { state: { service } });
      },
    },
  ];

  return (
    <ListWithSearch<Service>
      data={services}
      columns={columns}
      searchFilters={searchFilters}
      checkboxFilterGroups={checkboxFilterGroups}
      dropdownOptions={dropdownOptions}
      onDownloadExcel={() => alert("Descarga de Excel (stub)")}
      onSearch={() => alert("Buscar (stub)")}
    />
  );
};

export default VistaServiciosPendientes;
