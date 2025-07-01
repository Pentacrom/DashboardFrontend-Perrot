// src/components/Sidebar.tsx
import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import LogoPerrot from "../assets/perrot-logo.png";
import { AuthContext } from "../context/AuthContext";

const Sidebar: React.FC = () => {
  const { roles } = useContext(AuthContext);
  const isAdmin = roles.includes("administracion");
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between text-black px-2 py-1 rounded cursor-pointer ${
      isActive ? "bg-gray-300" : "hover:bg-gray-200"
    }`;

  const menuContent = (
    <>
      {/* Logo */}
      <div className="h-20 flex justify-center bg-gray-100 border-b">
        <NavLink to="/home">
          <img
            src={LogoPerrot}
            alt="Logo Perrot"
            className="w-32 h-auto object-contain cursor-pointer"
          />
        </NavLink>
      </div>

      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <NavLink to="/home" className={linkClasses}>
              Inicio
            </NavLink>
          </li>

          {(isAdmin || roles.includes("comercial")) && (
            <li>
              <NavLink
                to="/comercial/gestion-servicios"
                className={linkClasses}
              >
                Ingreso de servicios
              </NavLink>
            </li>
          )}

          {(isAdmin || roles.includes("operaciones")) && (
            <li>
              <NavLink
                to="/operaciones/gestion-servicios"
                className={linkClasses}
              >
                Gestión de servicios
              </NavLink>
            </li>
          )}

          {(isAdmin || roles.includes("torre de control")) && (
            <li>
              <NavLink
                to="/torre-de-control/gestion-servicios"
                className={linkClasses}
              >
                Seguimiento de servicios
              </NavLink>
            </li>
          )}
          {/*
          {(isAdmin || roles.includes("contabilidad")) && (
            <li>
              <NavLink to="/contabilidad/facturacion" className={linkClasses}>
                Facturación
              </NavLink>
            </li>
          )}*/}

          {isAdmin && (
            <>
              <hr className="my-4" />
              <li>
                <NavLink to="/admin/cuentas" className={linkClasses}>
                  Administrar cuentas
                </NavLink>
              </li>
            </>
          )}

          {isAdmin && (
            <>
              <li>
                <NavLink to="/admin/datos" className={linkClasses}>
                  Administrar datos
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-2 bg-white border-b">
        <button onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <NavLink to="/home">
          <img
            src={LogoPerrot}
            alt="Logo Perrot"
            className="w-24 object-contain cursor-pointer"
          />
        </NavLink>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-full bg-white border-r drop-shadow z-20">
        {menuContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-64 h-full bg-white shadow-lg">
            <button
              className="absolute top-2 right-2 p-2"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {menuContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
