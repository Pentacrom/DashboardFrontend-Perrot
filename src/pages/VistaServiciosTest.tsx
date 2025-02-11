import React from "react";

const VistaServiciosTest: React.FC = () => {
  // Datos de ejemplo de servicios, cada uno con su estado
  const services = [
    {
      id: "001",
      cliente: "Empresa A",
      origen: "Santiago",
      destino: "Valparaíso",
      fecha: "2025-02-10",
      tipo: "Transporte",
      estado: "Pendiente",
    },
    {
      id: "002",
      cliente: "Empresa B",
      origen: "Concepción",
      destino: "Antofagasta",
      fecha: "2025-02-11",
      tipo: "Entrega express",
      estado: "En progreso",
    },
    {
      id: "003",
      cliente: "Empresa C",
      origen: "Temuco",
      destino: "La Serena",
      fecha: "2025-02-12",
      tipo: "Almacenaje",
      estado: "Completado",
    },
    {
      id: "004",
      cliente: "Empresa D",
      origen: "Iquique",
      destino: "Arica",
      fecha: "2025-02-13",
      tipo: "Transporte",
      estado: "Cancelado",
    },
  ];

  // Mapeo de estados a clases de Tailwind para el fondo
  const estadoStyles: Record<string, string> = {
    Pendiente: "bg-red-500",
    "En progreso": "bg-purple-500",
    Completado: "bg-green-500",
    Cancelado: "bg-yellow-500",
  };

  // Mapeo de estados a clases para el color del texto
  const estadoTextColors: Record<string, string> = {
    Pendiente: "text-white",
    "En progreso": "text-white",
    Completado: "text-white",
    Cancelado: "text-black",
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Servicios</h1>

      {/* Leyenda de los colores (opcional para que el usuario identifique cada estado) */}
      <div className="mb-4">
        <span className="mr-4 inline-flex items-center">
          <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-1"></span>
          Pendiente
        </span>
        <span className="mr-4 inline-flex items-center">
          <span className="inline-block w-4 h-4 bg-purple-500 rounded-full mr-1"></span>
          En progreso
        </span>
        <span className="mr-4 inline-flex items-center">
          <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-1"></span>
          Completado
        </span>
        <span className="mr-4 inline-flex items-center">
          <span className="inline-block w-4 h-4 bg-yellow-500 rounded-full mr-1"></span>
          Cancelado
        </span>
      </div>

      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                N° Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Origen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Destino
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map((service) => (
              <tr
                key={service.id}
                className={`${estadoStyles[service.estado]} ${
                  estadoTextColors[service.estado]
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">{service.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {service.cliente}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {service.origen}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {service.destino}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{service.fecha}</td>
                <td className="px-6 py-4 whitespace-nowrap">{service.tipo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VistaServiciosTest;
