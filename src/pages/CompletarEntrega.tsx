import React from 'react';

const CompletarEntrega: React.FC = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí puedes implementar la lógica para enviar los datos
    console.log("Datos de entrega enviados");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Completar Datos de Entrega</h1>
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
          {/* Destinatario */}
          <div>
            <label htmlFor="destinatario" className="block text-sm font-medium text-gray-700">
              Destinatario
            </label>
            <input
              id="destinatario"
              type="text"
              placeholder="Nombre del destinatario"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Dirección de Entrega */}
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
              Dirección de Entrega
            </label>
            <input
              id="direccion"
              type="text"
              placeholder="Calle, número, ciudad"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Fecha de Entrega */}
          <div>
            <label htmlFor="fechaEntrega" className="block text-sm font-medium text-gray-700">
              Fecha de Entrega
            </label>
            <input
              id="fechaEntrega"
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Hora de Entrega */}
          <div>
            <label htmlFor="horaEntrega" className="block text-sm font-medium text-gray-700">
              Hora de Entrega
            </label>
            <input
              id="horaEntrega"
              type="time"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Observaciones */}
          <div className="md:col-span-2">
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              placeholder="Comentarios adicionales"
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
            Completar Entrega
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompletarEntrega;
