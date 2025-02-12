import React, { useState } from "react";

const CompletarServicio: React.FC = () => {
  const [formData, setFormData] = useState({
    serviceId: "000001", // Valor por defecto, desactivado
    zona: "",
    zonaPortuaria: "",
    pais: "",
    naviera: "",
    nave: "",
    tipo: "",
    contenedorBulto: "",
    sello: "",
    producto: "",
    observacion: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí podrías implementar la lógica de envío de datos
    console.log("Datos enviados:", formData);
  };

  return (
    <div className="p-6">
      {/* Título de la página */}
      <h1 className="text-2xl font-bold mb-4">Completar Servicio</h1>

      {/* Formulario de Completar Servicio */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow mb-8"
      >
        {/* Grid responsive: 1 columna en móviles, 2 en md y 3 en lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Campo: ID del Servicio (desactivado, valor por defecto) */}
          <div className="lg:col-span-3">
            <label
              htmlFor="serviceId"
              className="block text-sm font-medium text-gray-700"
            >
              ODV
            </label>
            <input
              id="serviceId"
              name="serviceId"
              type="text"
              value={formData.serviceId}
              disabled
              className="mt-1 block w-full border-gray-300 bg-gray-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Campo: Zona (destino de la carga) */}
          <div>
            <label
              htmlFor="zona"
              className="block text-sm font-medium text-gray-700"
            >
              Zona (destino de la carga)
            </label>
            <select
              id="zona"
              name="zona"
              value={formData.zona}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccione una zona</option>
              <option value="Norte">Norte</option>
              <option value="Sur">Sur</option>
              <option value="Centro">Centro</option>
            </select>
          </div>

          {/* Campo: Zona portuaria (Puerto involucrado) */}
          <div>
            <label
              htmlFor="zonaPortuaria"
              className="block text-sm font-medium text-gray-700"
            >
              Zona portuaria (Puerto involucrado)
            </label>
            <select
              id="zonaPortuaria"
              name="zonaPortuaria"
              value={formData.zonaPortuaria}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccione un puerto</option>
              <option value="LQN">LQN</option>
              <option value="SAI">SAI</option>
              <option value="VAP">VAP</option>
              <option value="SVE">SVE</option>
            </select>
          </div>

          {/* Campo: PAIS (Procedencia o destino carga) */}
          <div>
            <label
              htmlFor="pais"
              className="block text-sm font-medium text-gray-700"
            >
              PAIS (Procedencia o destino carga)
            </label>
            <input
              id="pais"
              name="pais"
              type="text"
              value={formData.pais}
              onChange={handleChange}
              placeholder="Ingrese el país"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Campo: Naviera (nombre naviera) */}
          <div>
            <label
              htmlFor="naviera"
              className="block text-sm font-medium text-gray-700"
            >
              Naviera (nombre naviera)
            </label>
            <select
              id="naviera"
              name="naviera"
              value={formData.naviera}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccione una naviera</option>
              <option value="MSC">MSC</option>
              <option value="CMA CGM">CMA CGM</option>
              <option value="MAERSK">MAERSK</option>
            </select>
          </div>

          {/* Campo: Nave (Nombre nave) */}
          <div>
            <label
              htmlFor="nave"
              className="block text-sm font-medium text-gray-700"
            >
              Nave (Nombre nave)
            </label>
            <select
              id="nave"
              name="nave"
              value={formData.nave}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccione una nave</option>
              <option value="MSC BARI">MSC BARI</option>
              <option value="MSC JAPAN">MSC JAPAN</option>
              <option value="JPO PISCES">JPO PISCES</option>
              <option value="CALLAO EXPRESS">CALLAO EXPRESS</option>
            </select>
          </div>

          {/* Campo: TIPO (Tipo contenedor) */}
          <div>
            <label
              htmlFor="tipo"
              className="block text-sm font-medium text-gray-700"
            >
              TIPO (Tipo contenedor)
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccione un tipo</option>
              <option value="40HC">40HC</option>
              <option value="20 DV">20 DV</option>
              <option value="40 RF">40 RF</option>
            </select>
          </div>

          {/* Campo: Contenedor Bulto (ID Contenedor) */}
          <div>
            <label
              htmlFor="contenedorBulto"
              className="block text-sm font-medium text-gray-700"
            >
              Contenedor Bulto (ID Contenedor)
            </label>
            <input
              id="contenedorBulto"
              name="contenedorBulto"
              type="text"
              value={formData.contenedorBulto}
              onChange={handleChange}
              placeholder="Ingrese ID del contenedor"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Campo: Sello (Sello contenedor) */}
          <div>
            <label
              htmlFor="sello"
              className="block text-sm font-medium text-gray-700"
            >
              Sello (Sello contenedor)
            </label>
            <input
              id="sello"
              name="sello"
              type="text"
              value={formData.sello}
              onChange={handleChange}
              placeholder="Ingrese el sello del contenedor"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Campo: Producto (Tipo Producto) */}
          <div>
            <label
              htmlFor="producto"
              className="block text-sm font-medium text-gray-700"
            >
              Producto (Tipo Producto)
            </label>
            <input
              id="producto"
              name="producto"
              type="text"
              value={formData.producto}
              onChange={handleChange}
              placeholder="Ingrese el tipo de producto"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Campo: Observación (ocupa el ancho completo en pantallas grandes) */}
          <div className="lg:col-span-3">
            <label
              htmlFor="observacion"
              className="block text-sm font-medium text-gray-700"
            >
              Observación
            </label>
            <textarea
              id="observacion"
              name="observacion"
              value={formData.observacion}
              onChange={handleChange}
              placeholder="Ingrese cualquier observación"
              rows={4}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
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
    </div>
  );
};

export default CompletarServicio;
