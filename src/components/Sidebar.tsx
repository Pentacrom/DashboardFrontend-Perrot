import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import LogoPerrot from "../assets/perrot-logo.png";
import { AuthContext } from "../context/AuthContext";

const Sidebar: React.FC = () => {
  const { roles } = useContext(AuthContext);
  const isAdmin = roles.includes("administracion");
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between text-black px-2 py-1 rounded group cursor-pointer ${
      isActive ? "bg-gray-300" : "hover:bg-gray-200"
    }`;

  const menuContent = (
    <>
      {/* Logo */}
      <div className="h-20 flex justify-center bg-gray-100 border-b border-gray-300 w-4xl">
        <NavLink to="/home">
          <img
            src={LogoPerrot}
            alt="Logo Perrot"
            className="w-32 h-auto object-contain cursor-pointer"
          />
        </NavLink>
      </div>

      <nav className="p-4 flex-1 overflow-y-auto">
        {/* Inicio */}
        <Section title="">
          <NavLink to="/home" className={linkClasses}>
            <span>Inicio</span>
          </NavLink>
        </Section>

        {/* Comercial */}
        {(isAdmin || roles.includes("comercial")) && (
          <Section title="Comercial">
            <NavLink to="/comercial/gestion-servicios" className={linkClasses}>
              <span>Ingreso de servicios</span>
            </NavLink>
          </Section>
        )}

        {/* Torre de Control */}
        {(isAdmin || roles.includes("torre de control")) && (
          <Section title="Torre de control">
            <NavLink
              to="/torre-de-control/gestion-servicios"
              className={linkClasses}
            >
              <span>Seguimiento de servicios</span>
            </NavLink>
          </Section>
        )}

        {/* Operaciones */}
        {(isAdmin || roles.includes("operaciones")) && (
          <Section title="Operaciones">
            <NavLink
              to="/operaciones/gestion-servicios"
              className={linkClasses}
            >
              <span>Gestión de servicios</span>
            </NavLink>
          </Section>
        )}
      </nav>
    </>
  );

  return (
    <>
      {/* Barra superior mobile */}
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

      {/* Sidebar escritorio */}
      <aside className="hidden lg:flex flex-col w-72 h-full bg-white border-r border-gray-300 drop-shadow-md z-20">
        {menuContent}
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 flex">
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setMobileOpen(false)}
          />
          {/* drawer */}
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

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="mt-4">
    {title && (
      <h2 className="font-bold uppercase border-b border-gray-300 pb-1">
        {title}
      </h2>
    )}
    <ul className="mt-2 ml-4 space-y-1">{children}</ul>
  </div>
);

export default Sidebar;
