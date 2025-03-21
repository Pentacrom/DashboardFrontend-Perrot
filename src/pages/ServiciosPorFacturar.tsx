import React from "react";
import { useNavigate } from "react-router-dom";
import ListWithSearch, { Column } from "../components/ListWithSearch";

interface Service {
  odv: string;
  cliente: string;
  monto: string;
  fecha: string;
}

const services: Service[] = [
  {
    odv: "001",
    cliente: "Empresa A",
    monto: "$15,000",
    fecha: "2025-02-10",
  },
  {
    odv: "002",
    cliente: "Empresa B",
    monto: "$12,500",
    fecha: "2025-02-11",
  },
  {
    odv: "003",
    cliente: "Empresa C",
    monto: "$18,000",
    fecha: "2025-02-12",
  },
];

const columns: Column<Service>[] = [
  { label: "ODV", key: "odv", sortable: true },
  { label: "Cliente", key: "cliente", sortable: true },
  { label: "Monto a Facturar", key: "monto", sortable: true },
  { label: "Fecha del Servicio", key: "fecha", sortable: true },
];

const ServiciosPorFacturar: React.FC = () => {
  const navigate = useNavigate();

  // Función dropdownOptions que recibe el item y retorna una opción que incluye el parámetro facturable
  const dropdownOptions = () => [
    {
      label: "Detalle",
      onClick: () => navigate(`/detalle-servicio?facturable=true`),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Servicios por Facturar</h1>
      <ListWithSearch<Service>
        data={services}
        columns={columns}
        filterTitle="Filtrar Servicios"
        onSearch={() => console.log("Buscando")}
        showExcelButton={true}
        dropdownOptions={dropdownOptions}
      />
    </div>
  );
};

export default ServiciosPorFacturar;
