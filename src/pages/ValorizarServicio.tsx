import React from 'react';

const ValorizarServicio: React.FC = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí implementa la lógica para valorizar el servicio
    console.log("Servicio valorado");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Valorizar Servicio</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Número de Servicio */}
          <div>
            <label htmlFor="numeroServicio" className="block text-sm font-medium text-gray-700">
              Número de Servicio
            </label>
            <input
              id="numeroServicio"
              type="text"
              placeholder="Ej. 001"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Cliente */}
          <div>
            <label htmlFor="cliente" className="block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <input
              id="cliente"
              type="text"
              placeholder="Nombre del cliente"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Costo del Servicio */}
          <div>
            <label htmlFor="costo" className="block text-sm font-medium text-gray-700">
              Costo del Servicio
            </label>
            <input
              id="costo"
              type="number"
              placeholder="Ej. 10000"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Descripción del Servicio */}
          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
              Descripción del Servicio
            </label>
            <textarea
              id="descripcion"
              placeholder="Detalles adicionales sobre el servicio"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            ></textarea>
          </div>
        </div>
        {/* Botón de envío */}
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Valorizar Servicio
          </button>
        </div>
      </form>
    </div>
  );
};

export default ValorizarServicio;
