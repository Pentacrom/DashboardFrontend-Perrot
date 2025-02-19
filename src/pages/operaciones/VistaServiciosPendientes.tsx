// VistaServiciosPendientes.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import ListWithSearch, {
  Column,
  SearchFilter,
  CheckboxFilterGroup,
  DropdownOption,
  DropdownOptionsType,
} from "../../components/ListWithSearch";

// Actualiza los mapeos de colores para incluir los nuevos estados
const updatedEstadoStyles: Record<string, string> = {
  "por procesar": "bg-red-500",
  "en proceso": "bg-purple-500",
  "por facturar": "bg-orange-500",
  facturado: "bg-blue-500",
  completado: "bg-green-500",
  cancelado: "bg-yellow-500",
  "por valorizar": "bg-indigo-500",
  "por completar": "bg-teal-500",
};

const updatedBadgeTextColor: Record<string, string> = {
  "por procesar": "text-white",
  "en proceso": "text-white",
  "por facturar": "text-white",
  facturado: "text-white",
  completado: "text-white",
  cancelado: "text-black",
  "por valorizar": "text-white",
  "por completar": "text-white",
};

interface Service {
  id: string;
  cliente: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
  estado: string;
}

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
  {
    id: "007",
    cliente: "Empresa G",
    origen: "Valdivia",
    destino: "Santiago",
    fecha: "2025-02-16",
    tipo: "Transporte",
    estado: "por valorizar",
  },
  {
    id: "008",
    cliente: "Empresa H",
    origen: "La Serena",
    destino: "Concepción",
    fecha: "2025-02-17",
    tipo: "Almacenaje",
    estado: "por completar",
  },
];

const columns: Column<Service>[] = [
  { label: "ODV", key: "id", sortable: true },
  { label: "Cliente", key: "cliente", sortable: true },
  { label: "Origen", key: "origen", sortable: true },
  { label: "Destino", key: "destino", sortable: true },
  { label: "Fecha", key: "fecha", sortable: true },
  { label: "Tipo", key: "tipo", sortable: true },
  { label: "Estado", key: "estado", sortable: true },
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
      "por valorizar",
      "por completar",
    ],
  },
];

const VistaServiciosPendientes: React.FC = () => {
  const navigate = useNavigate();

  // Función para obtener las opciones del dropdown para cada fila
  const dropdownOptions = (service: Service): DropdownOption<Service>[] => {
    const options: DropdownOption<Service>[] = [];
    if (service.estado === "por valorizar") {
      options.push({
        label: "Valorizar servicio",
        onClick: (service) =>
          navigate("/valorizar-servicio", { state: { service } }),
      });
    } else if (service.estado === "por completar") {
      options.push({
        label: "Completar servicio",
        onClick: (service) =>
          navigate("/completar-servicio", { state: { service } }),
      });
    }
    // Todas las filas tendrán también la opción "Ver detalle"
    options.push({
      label: "Ver detalle",
      onClick: (service) =>
        navigate("/consulta-servicio", { state: { service } }),
    });
    return options;
  };

  return (
    <ListWithSearch<Service>
      data={services}
      columns={columns}
      searchFilters={searchFilters}
      checkboxFilterGroups={checkboxFilterGroups}
      dropdownOptions={dropdownOptions as DropdownOptionsType<Service>}
      onDownloadExcel={() => alert("Descarga de Excel (stub)")}
      onSearch={() => alert("Buscar (stub)")}
      // Configuración de colores: se asignan colores a la celda "estado"
      colorConfig={{
        field: "estado",
        bgMapping: updatedEstadoStyles,
        textMapping: updatedBadgeTextColor,
        mode: "cell",
      }}
      filterTitle="Filtros de búsqueda"
    />
  );
};

export default VistaServiciosPendientes;
