import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListWithSearch, {
  Column,
  DropdownOption,
  SearchFilter,
} from "../../components/ListWithSearch";

interface Service {
  id: string;
  cliente: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
}

const initialServices: Service[] = [
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
  { label: "Fecha Desde", key: "fecha", type: "date", comparator: "gte" },
  { label: "Fecha Hasta", key: "fecha", type: "date", comparator: "lte" },
];

const IngresoServicio: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>(initialServices);

  const handleDeleteService = (id: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el servicio ${id}?`)) {
      setServices((prev) => prev.filter((service) => service.id !== id));
    }
  };

  // Opciones del dropdown para cada servicio.
  const dropdownOptions = (): DropdownOption<Service>[] => [
    {
      label: "Modificar servicio",
      onClick: (service) =>
        navigate(`/modificar-servicio/${service.id}`, { state: { service } }),
    },
    {
      label: "Eliminar servicio",
      onClick: (service) => handleDeleteService(service.id),
    },
  ];

  return (
    <div className="p-6">
      <ListWithSearch<Service>
        data={services}
        columns={columns}
        searchFilters={searchFilters}
        checkboxFilterGroups={[]}
        dropdownOptions={dropdownOptions}
        tableTitle="Servicios Creados"
        filterTitle="Buscar servicio creado"
        globalButtons={
          <Link
            to="/nuevo-servicio"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Nuevo Servicio
          </Link>
        }
        onDownloadExcel={() => alert("Descarga de Excel (stub)")}
        onSearch={() => alert("Buscar (stub)")}
        globalSearch={{
          enabled: true,
          placeholder: "Ej: ID:001, Cliente:Empresa A, Tipo:Transporte, o texto libre",
          highlightResults: true
        }}
      />
    </div>
  );
};

export default IngresoServicio;
