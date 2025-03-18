import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Ajusta la ruta según tu estructura

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { userName, roles } = useContext(AuthContext);

  // Simulamos la carga de datos con un retraso (aquí 1 segundo)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        {/* Placeholder para el título */}
        <div className="h-10 bg-gray-300 rounded w-1/2 mb-6"></div>
        {/* Placeholder para el párrafo */}
        <div className="h-6 bg-gray-300 rounded w-full mb-4"></div>
        {/* Placeholder para las tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-24 bg-gray-300 rounded"></div>
          <div className="h-24 bg-gray-300 rounded"></div>
          <div className="h-24 bg-gray-300 rounded"></div>
          <div className="h-24 bg-gray-300 rounded"></div>
        </div>
        {/* Placeholder para el texto final */}
        <div className="mt-8 h-4 bg-gray-300 rounded w-full"></div>
      </div>
    );
  }

  // Función para renderizar tarjetas según el rol del usuario.
  const renderCards = () => {
    if (roles.includes("administracion")) {
      // Administrador ve todas las tarjetas
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Servicios Ingresados</h2>
            <p className="text-2xl">120</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Entregas Completadas</h2>
            <p className="text-2xl">95</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Servicios Valorados</h2>
            <p className="text-2xl">80</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">
              Servicios por Facturar
            </h2>
            <p className="text-2xl">25</p>
          </div>
        </div>
      );
    } else if (roles.includes("cliente")) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">
              Tus Servicios Ingresados
            </h2>
            <p className="text-2xl">50</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Entregas Completadas</h2>
            <p className="text-2xl">45</p>
          </div>
        </div>
      );
    } else if (roles.includes("comercial")) {
      return (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Servicios Pendientes</h2>
            <p className="text-2xl">30</p>
          </div>
        </div>
      );
    } else if (roles.includes("torre de control")) {
      return (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Servicios Activos</h2>
            <p className="text-2xl">60</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Servicios Test</h2>
            <p className="text-2xl">10</p>
          </div>
        </div>
      );
    } else if (roles.includes("operaciones")) {
      return (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">
              Servicios por Facturar
            </h2>
            <p className="text-2xl">25</p>
          </div>
        </div>
      );
    } else if (roles.includes("contabilidad")) {
      return (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">
              Facturación Pendiente
            </h2>
            <p className="text-2xl">15</p>
          </div>
        </div>
      );
    } else {
      return <p>No hay datos disponibles para tu rol.</p>;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Bienvenido/a {userName || "Usuario"}
      </h1>
      <p className="text-lg mb-4">
        Este es el panel de control para la administración de servicios
        logísticos.{" "}
        {roles && roles.length > 0 && (
          <span>Tus roles: {roles.join(", ")}.</span>
        )}
      </p>
      {renderCards()}
      <div className="mt-8">
        <p>
          Utiliza el menú lateral para navegar por las diferentes secciones y
          gestionar los servicios.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
