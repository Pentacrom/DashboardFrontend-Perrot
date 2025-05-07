import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import LogoPerrot from "../assets/perrot-logo.png";
import { AuthContext } from "../context/AuthContext"; // Ajusta la ruta según tu estructura

const Sidebar: React.FC = () => {
  const { roles } = useContext(AuthContext);
  // Si el usuario tiene el rol 'administracion', se muestra todo
  const isAdmin = roles.includes("administracion");

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    "flex items-center justify-between text-black px-2 py-1 rounded group cursor-pointer " +
    (isActive ? "bg-gray-300" : "hover:bg-gray-200");

  return (
    <aside className="w-72 h-screen text-black bg-white flex flex-col z-2">
      {/* Logo en la parte superior */}
      <div className="h-20 flex justify-center bg-gray-100 border-b border-gray-300">
        <img
          src={LogoPerrot}
          alt="Logo Perrot"
          className="w-32 h-auto object-contain"
        />
      </div>

      <nav className="p-4 flex-1 overflow-y-auto border-r border-gray-300 drop-shadow-md">
        {/* Sección Cliente 
        {(isAdmin || roles.includes("cliente")) && (
          <div>
            <h2 className="font-bold uppercase border-b border-gray-300 pb-1">
              Cliente
            </h2>
            <ul className="mt-2 ml-4">
              <li>
                <NavLink to="/cliente/ingresoServicios" className={linkClasses}>
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
        )}*/}

        {/* Sección Comercial */}
        {(isAdmin || roles.includes("comercial")) && (
          <div className="mt-4">
            <h2 className="font-bold uppercase border-b border-gray-300 pb-1">
              Comercial
            </h2>
            <ul className="mt-2 ml-4">
              <li>
                <NavLink
                  to="/comercial/ingresoServicios"
                  className={linkClasses}
                >
                  <span>Ingreso de servicios</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}

        {/* Sección Torre de control */}
        {(isAdmin || roles.includes("torre de control")) && (
          <div className="mt-4">
            <h2 className="font-bold uppercase border-b border-gray-300 pb-1">
              Torre de control
            </h2>
            <ul className="mt-2 ml-4">
              <li>
                <NavLink to="/torre-de-control/servicios" className={linkClasses}>
                  <span>Servicios en proceso</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}

        {/* Sección Operaciones */}
        {(isAdmin || roles.includes("operaciones")) && (
          <div className="mt-4">
            <h2 className="font-bold uppercase border-b border-gray-300 pb-1">
              Operaciones
            </h2>
            <ul className="mt-2 ml-4">
              <li>
                <NavLink
                  to="/operaciones/servicios"
                  className={linkClasses}
                >
                  <span>Servicios</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}

        {/* Sección Contabilidad */}
        {(isAdmin || roles.includes("contabilidad")) && (
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
        )}

        {/* Sección Informe de servicio (asumida para todos los roles autenticados) */}
        {(isAdmin || roles.length > 0) && (
          <div className="mt-4 border-t border-gray-300 pt-1">
            <ul className="mt-2 ml-4">
              <li>
                <NavLink to="/informe-servicio" className={linkClasses}>
                  <span>Informe de servicio</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
