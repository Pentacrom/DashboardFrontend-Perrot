import React from 'react';
import { NavLink } from 'react-router-dom';
import LogoPerrot from "../assets/perrot-logo.png";

const Sidebar: React.FC = () => {
  // Función para definir las clases de cada enlace según si está activo.
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    "flex items-center justify-between text-black py-1 rounded group cursor-pointer " +
    (isActive ? "bg-gray-300" : "hover:bg-gray-200");

  return (
    <aside className="w-64 h-screen text-black bg-white flex flex-col z-2">
      {/* Logo en la parte superior */}
      <div className="h-20 flex justify-center bg-gray-100 border-b border-gray-300">
        <img
          src={LogoPerrot}
          alt="Logo Perrot"
          className="w-32 h-auto object-contain"
        />
      </div>

      <nav className="p-4 flex-1 overflow-y-auto border-r border-gray-300 drop-shadow-md">
        {/* Sección Cliente */}
        <div>
          <h2 className="font-bold uppercase border-b border-gray-300 pb-1">
            Cliente
          </h2>
          <ul className="mt-2 ml-4">
            <li>
              <NavLink to="/ingresoServicios" className={linkClasses}>
                <span>Ingreso de servicios</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/servicios-pendientes" className={linkClasses}>
                <span>Servicios pendientes</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Sección Comercial */}
        <div className="mt-4">
          <h2 className="font-bold uppercase border-b border-gray-300 pb-1">
            Comercial
          </h2>
          <ul className="mt-2 ml-4">
            <li>
              <NavLink to="/ingresoServicios" className={linkClasses}>
                <span>Ingreso de servicios</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/servicios-pendientes" className={linkClasses}>
                <span>Servicios pendientes</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/completar-servicio" className={linkClasses}>
                <span>Completar servicio</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Sección Torre de control */}
        <div className="mt-4">
          <h2 className="font-bold uppercase border-b border-gray-300 pb-1">
            Torre de control
          </h2>
          <ul className="mt-2 ml-4">
            <li>
              <NavLink to="/servicios" className={linkClasses}>
                <span>Servicios</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/servicios-test" className={linkClasses}>
                <span>Servicios test</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Sección Operaciones */}
        <div className="mt-4">
          <h2 className="font-bold uppercase border-b border-gray-300 pb-1">
            Operaciones
          </h2>
          <ul className="mt-2 ml-4">
            <li>
              <NavLink to="/completar-entrega" className={linkClasses}>
                <span>Completar datos de entrega</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/valorizar-servicio" className={linkClasses}>
                <span>Valorizar servicio</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Sección Contabilidad */}
        <div className="mt-4">
          <h2 className="font-bold uppercase border-b border-gray-300 pb-1">
            Contabilidad
          </h2>
          <ul className="mt-2 ml-4">
            <li>
              <NavLink to="/servicios-por-facturar" className={linkClasses}>
                <span>Servicios por facturar</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
