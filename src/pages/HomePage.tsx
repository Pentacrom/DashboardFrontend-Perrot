import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bienvenido al Dashboard Perrot</h1>
      <p className="text-lg mb-4">
        Este es el panel de control para la administración de servicios logísticos. Desde aquí, podrás gestionar el ingreso de servicios, completar datos de entrega, valorizar servicios y revisar los servicios por facturar.
      </p>

      {/* Tarjetas con información de ejemplo */}
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
          <h2 className="text-xl font-semibold mb-2">Servicios por Facturar</h2>
          <p className="text-2xl">25</p>
        </div>
      </div>

      <div className="mt-8">
        <p>
          Utiliza el menú lateral para navegar por las diferentes secciones y gestionar los servicios.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
