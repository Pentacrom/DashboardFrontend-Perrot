import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import LogoPerrot from "../assets/perrot-logo.png";
import { AuthContext } from "../context/AuthContext"; // Ajusta la ruta según tu estructura

// Usuarios de prueba
const testUsers = [
  {
    username: "cliente",
    password: "cliente123",
    roles: ["cliente"],
    userName: "Cliente Test",
  },
  {
    username: "comercial",
    password: "comercial123",
    roles: ["comercial"],
    userName: "Comercial Test",
  },
  {
    username: "torre",
    password: "torre123",
    roles: ["torre de control"],
    userName: "Torre Test",
  },
  {
    username: "operaciones",
    password: "operaciones123",
    roles: ["operaciones"],
    userName: "Operaciones Test",
  },
  {
    username: "contabilidad",
    password: "contabilidad123",
    roles: ["contabilidad"],
    userName: "Contabilidad Test",
  },
  {
    username: "administracion",
    password: "administracion123",
    roles: ["administracion"],
    userName: "Administracion Test",
  },
];

const InicioSesion: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const user = testUsers.find(
      (u) => u.username === usuario && u.password === contrasena
    );

    if (user) {
      // Actualizar el contexto con el perfil del usuario
      setAuth({
        hasAccess: true,
        roles: user.roles,
        userName: user.userName,
      });
      // Redirigir al dashboard o home
      navigate("/home");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-black">
        {/* Logo en la parte superior */}
        <div className="flex justify-center mb-4">
          <img
            src={LogoPerrot}
            alt="Logo Perrot"
            className="w-32 h-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-black mb-6 text-center">
          Iniciar Sesión
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="usuario" className="block text-gray-700 mb-2">
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              placeholder="Ingresa tu usuario"
              className="w-full p-2 border border-gray-300 rounded"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="contrasena" className="block text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              placeholder="Ingresa tu contraseña"
              className="w-full p-2 border border-gray-300 rounded"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default InicioSesion;
