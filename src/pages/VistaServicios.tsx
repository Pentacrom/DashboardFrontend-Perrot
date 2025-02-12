import React from "react";

const VistaServicios: React.FC = () => {
  // Simulación de datos de servicios con un campo "estado"
  const services = [
    {
      id: "001",
      cliente: "Empresa A",
      origen: "Santiago",
      destino: "Valparaíso",
      fecha: "2025-02-10",
      tipo: "Transporte",
      estado: "Pendiente", // se mostrará en rojo
    },
    {
      id: "002",
      cliente: "Empresa B",
      origen: "Concepción",
      destino: "Antofagasta",
      fecha: "2025-02-11",
      tipo: "Entrega express",
      estado: "En progreso", // se mostrará en morado
    },
    {
      id: "003",
      cliente: "Empresa C",
      origen: "Temuco",
      destino: "La Serena",
      fecha: "2025-02-12",
      tipo: "Almacenaje",
      estado: "Completado", // se mostrará en verde
    },
    {
      id: "004",
      cliente: "Empresa D",
      origen: "Iquique",
      destino: "Arica",
      fecha: "2025-02-13",
      tipo: "Transporte",
      estado: "Cancelado", // se mostrará en amarillo
    },
  ];

  // Mapeo de estado a clases de Tailwind para el badge
  const estadoStyles: Record<string, string> = {
    Pendiente: "bg-red-500",
    "En progreso": "bg-purple-500",
    Completado: "bg-green-500",
    Cancelado: "bg-yellow-500",
  };

  // En este ejemplo, definimos también el color del texto para cada badge
  const badgeTextColor: Record<string, string> = {
    Pendiente: "text-white",
    "En progreso": "text-white",
    Completado: "text-white",
    Cancelado: "text-black",
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Datos de entrega</h1>

      {/* Leyenda de indicadores de estado */}
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
                ODV
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id}>
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      estadoStyles[service.estado]
                    } ${badgeTextColor[service.estado]}`}
                  >
                    {service.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VistaServicios;
