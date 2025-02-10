import React from 'react';

const IngresoServicio: React.FC = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí podrías implementar la lógica de envío
  };

  return (
    <div className="p-6">
      {/* Título de la página */}
      <h1 className="text-2xl font-bold mb-4">Ingreso de Servicios</h1>

      {/* Formulario de Ingreso de Servicios */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-6 rounded shadow mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor="serviceNumber" 
              className="block text-sm font-medium text-gray-700"
            >
              Número de Servicio
            </label>
            <input
              id="serviceNumber"
              type="text"
              placeholder="Ej. 001"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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

      {/* Vista de Servicios Creados (Datos de ejemplo) */}
      <h2 className="text-xl font-bold mb-4">Servicios Creados</h2>
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
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">001</td>
              <td className="px-6 py-4 whitespace-nowrap">Empresa A</td>
              <td className="px-6 py-4 whitespace-nowrap">Santiago</td>
              <td className="px-6 py-4 whitespace-nowrap">Valparaíso</td>
              <td className="px-6 py-4 whitespace-nowrap">2025-02-10</td>
              <td className="px-6 py-4 whitespace-nowrap">Transporte</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">002</td>
              <td className="px-6 py-4 whitespace-nowrap">Empresa B</td>
              <td className="px-6 py-4 whitespace-nowrap">Concepción</td>
              <td className="px-6 py-4 whitespace-nowrap">Antofagasta</td>
              <td className="px-6 py-4 whitespace-nowrap">2025-02-11</td>
              <td className="px-6 py-4 whitespace-nowrap">Entrega express</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">003</td>
              <td className="px-6 py-4 whitespace-nowrap">Empresa C</td>
              <td className="px-6 py-4 whitespace-nowrap">Temuco</td>
              <td className="px-6 py-4 whitespace-nowrap">La Serena</td>
              <td className="px-6 py-4 whitespace-nowrap">2025-02-12</td>
              <td className="px-6 py-4 whitespace-nowrap">Almacenaje</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IngresoServicio;
