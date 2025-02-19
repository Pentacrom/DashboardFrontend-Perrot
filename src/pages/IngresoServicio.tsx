// IngresoServicio.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import ListWithSearch, {
  Column,
  DropdownOption,
} from "../components/ListWithSearch";

interface Service {
  id: string;
  cliente: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
}

const createdServices: Service[] = [
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

const IngresoServicio: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implementa aquí la lógica para enviar el servicio ingresado.
  };

  // Opción para el dropdown en cada fila: Completar servicio
  const dropdownOptions: DropdownOption<Service>[] = [
    {
      label: "Completar servicio",
      onClick: (service) => {
        navigate("/completar-servicio", { state: { service } });
      },
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ingreso de Servicios</h1>

      {/* Formulario de Ingreso */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="client"
              className="block text-sm font-medium text-gray-700"
            >
              Cliente
            </label>
            <input
              id="client"
              type="text"
              placeholder="Nombre del cliente"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="origin"
              className="block text-sm font-medium text-gray-700"
            >
              Origen
            </label>
            <input
              id="origin"
              type="text"
              placeholder="Ciudad de origen"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="destination"
              className="block text-sm font-medium text-gray-700"
            >
              Destino
            </label>
            <input
              id="destination"
              type="text"
              placeholder="Ciudad de destino"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha de Servicio
            </label>
            <input
              id="date"
              type="date"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="serviceType"
              className="block text-sm font-medium text-gray-700"
            >
              Tipo de Servicio
            </label>
            <select
              id="serviceType"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Transporte</option>
              <option>Entrega express</option>
              <option>Almacenaje</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>

      {/* Título para la lista */}
      <h2 className="text-xl font-bold mb-4 text-center">Servicios Creados</h2>
      {/* Lista sin filtros (los arrays se pasan vacíos) */}
      <ListWithSearch<Service>
        data={createdServices}
        columns={columns}
        searchFilters={[]}
        checkboxFilterGroups={[]}
        dropdownOptions={dropdownOptions}
        onDownloadExcel={() => alert("Descarga de Excel (stub)")}
        onSearch={() => alert("Buscar (stub)")}
      />
    </div>
  );
};

export default IngresoServicio;
