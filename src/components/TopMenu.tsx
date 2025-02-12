import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TopMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Ejemplo de nombre de usuario; en una aplicación real lo obtendrías de contexto, props o global state.
  const username = "Juan Pérez";

  // Cierra el menú si se hace click fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Aquí va la lógica para cerrar sesión
    console.log("Cerrar sesión");
    setIsOpen(false);
    // Redirige al inicio de sesión
    navigate("/");
  };

  const handleVerPerfil = () => {
    // Navega a la página de perfil
    console.log("Ver perfil");
    setIsOpen(false);
    navigate("/profile");
  };

  const handleCambiarContrasena = () => {
    // Navega a la página para cambiar contraseña
    console.log("Cambiar contraseña");
    setIsOpen(false);
    navigate("/change-password");
  };

  return (
    <header className="w-full h-20 bg-white border-b border-gray-300 flex items-center px-6 text-black drop-shadow-md">
      {/* Sección Izquierda: Logo y Título */}
      <div className="flex items-center">
        <span className="font-bold text-lg">
          Sistema Control de Operaciones Perrot
        </span>
      </div>

      {/* Sección Derecha: Navegación */}
      <nav className="ml-auto relative" ref={dropdownRef}>
        <ul className="flex items-center space-x-8 px-6">
          <li
            className="cursor-pointer hover:text-blue-600 transition-colors font-bold text-xl flex items-center"
            onClick={() => setIsOpen(!isOpen)}
          >
            {username}
            <span className="ml-2 text-lg">{isOpen ? "▲" : "▼"}</span>
          </li>
        </ul>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md">
            <ul className="py-1">
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleVerPerfil}
              >
                Ver perfil
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleCambiarContrasena}
              >
                Cambiar contraseña
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                Cerrar sesión
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};

export default TopMenu;
