import React from "react";
import { useNavigate } from "react-router-dom";

const NuevoServicio: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí implementa la lógica para crear un nuevo servicio,
    // por ejemplo, llamando a un API o actualizando el estado global.
    console.log("Nuevo servicio creado");
    // Luego, volvemos a la página anterior (o a la lista de servicios)
    navigate(-1);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Nuevo Servicio</h1>
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
      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default NuevoServicio;
