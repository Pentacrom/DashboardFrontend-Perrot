import React from "react";
import { useParams, Link } from "react-router-dom";

const FacturarServicio: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Facturar Servicio</h1>
      <p className="mb-4">Servicio ID: {id}</p>
      {/* Aquí puedes agregar el formulario o los detalles necesarios para facturar */}
      <div className="border p-4 rounded bg-gray-50">
        <p>
          Aquí se implementará el proceso de facturación para el servicio {id}.
        </p>
      </div>
      <div className="mt-6">
        <Link
          to="/detalle-servicio?facturable=true"
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Volver al Detalle
        </Link>
      </div>
    </div>
  );
};

export default FacturarServicio;
