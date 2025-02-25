import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Servicio {
  id: string; // ODV
  cliente: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
  estado: string;
  zona: string; // Zona (destino de la carga)
  zonaPortuaria: string; // Zona portuaria (Puerto involucrado)
  pais: string; // PAIS (Procedencia o destino carga)
  naviera: string; // Naviera (nombre naviera)
  nave: string; // Nave (Nombre nave)
  tipoContenedor: string; // TIPO (Tipo contenedor)
  contenedorBulto: string; // Contenedor Bulto (ID Contenedor)
  sello: string; // Sello (Sello contenedor)
  producto: string; // Producto (Tipo Producto)
  observacion: string;
}

const ModificarServicio: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Se espera que el servicio se pase en el state de navegación.
  const serviceState = location.state?.service as Servicio | undefined;

  // Si no se recibe el servicio, se puede redirigir o mostrar un mensaje de error.
  const [servicio, setServicio] = useState<Servicio>(
    serviceState || {
      id: "",
      cliente: "",
      origen: "",
      destino: "",
      fecha: "",
      tipo: "",
      estado: "",
      zona: "",
      zonaPortuaria: "",
      pais: "",
      naviera: "",
      nave: "",
      tipoContenedor: "",
      contenedorBulto: "",
      sello: "",
      producto: "",
      observacion: "",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setServicio((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí se implementaría la lógica para actualizar el servicio (por ejemplo, una llamada a la API)
    console.log("Servicio modificado:", servicio);
    // Después de actualizar, volvemos a la página anterior
    navigate(-1);
  };

  return (
    <div className="min-h-screen min-w-max rounded-2xl drop-shadow-sm bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Modificar Servicio
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ODV (deshabilitado, ya que suele ser identificador único) */}
            <div>
              <label
                htmlFor="id"
                className="block text-sm font-medium text-gray-700"
              >
                ODV:
              </label>
              <input
                type="text"
                id="id"
                name="id"
                value={servicio.id}
                disabled
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
              />
            </div>
            <div>
              <label
                htmlFor="cliente"
                className="block text-sm font-medium text-gray-700"
              >
                Cliente:
              </label>
              <input
                type="text"
                id="cliente"
                name="cliente"
                value={servicio.cliente}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="origen"
                className="block text-sm font-medium text-gray-700"
              >
                Origen:
              </label>
              <input
                type="text"
                id="origen"
                name="origen"
                value={servicio.origen}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="destino"
                className="block text-sm font-medium text-gray-700"
              >
                Destino:
              </label>
              <input
                type="text"
                id="destino"
                name="destino"
                value={servicio.destino}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="fecha"
                className="block text-sm font-medium text-gray-700"
              >
                Fecha de Servicio:
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={servicio.fecha}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="tipo"
                className="block text-sm font-medium text-gray-700"
              >
                Tipo de Servicio:
              </label>
              <input
                type="text"
                id="tipo"
                name="tipo"
                value={servicio.tipo}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="estado"
                className="block text-sm font-medium text-gray-700"
              >
                Estado:
              </label>
              <input
                type="text"
                id="estado"
                name="estado"
                value={servicio.estado}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="zona"
                className="block text-sm font-medium text-gray-700"
              >
                Zona (destino de la carga):
              </label>
              <input
                type="text"
                id="zona"
                name="zona"
                value={servicio.zona}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="zonaPortuaria"
                className="block text-sm font-medium text-gray-700"
              >
                Zona portuaria (Puerto involucrado):
              </label>
              <input
                type="text"
                id="zonaPortuaria"
                name="zonaPortuaria"
                value={servicio.zonaPortuaria}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="pais"
                className="block text-sm font-medium text-gray-700"
              >
                PAIS (Procedencia o destino carga):
              </label>
              <input
                type="text"
                id="pais"
                name="pais"
                value={servicio.pais}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="naviera"
                className="block text-sm font-medium text-gray-700"
              >
                Naviera (nombre naviera):
              </label>
              <input
                type="text"
                id="naviera"
                name="naviera"
                value={servicio.naviera}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="nave"
                className="block text-sm font-medium text-gray-700"
              >
                Nave (Nombre nave):
              </label>
              <input
                type="text"
                id="nave"
                name="nave"
                value={servicio.nave}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="tipoContenedor"
                className="block text-sm font-medium text-gray-700"
              >
                TIPO (Tipo contenedor):
              </label>
              <input
                type="text"
                id="tipoContenedor"
                name="tipoContenedor"
                value={servicio.tipoContenedor}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="contenedorBulto"
                className="block text-sm font-medium text-gray-700"
              >
                Contenedor Bulto (ID Contenedor):
              </label>
              <input
                type="text"
                id="contenedorBulto"
                name="contenedorBulto"
                value={servicio.contenedorBulto}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="sello"
                className="block text-sm font-medium text-gray-700"
              >
                Sello (Sello contenedor):
              </label>
              <input
                type="text"
                id="sello"
                name="sello"
                value={servicio.sello}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="producto"
                className="block text-sm font-medium text-gray-700"
              >
                Producto (Tipo Producto):
              </label>
              <input
                type="text"
                id="producto"
                name="producto"
                value={servicio.producto}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="observacion"
                className="block text-sm font-medium text-gray-700"
              >
                Observación:
              </label>
              <textarea
                id="observacion"
                name="observacion"
                value={servicio.observacion}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                rows={3}
              ></textarea>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModificarServicio;
