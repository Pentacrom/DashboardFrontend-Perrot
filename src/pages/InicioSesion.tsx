// src/pages/InicioSesion.tsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import LogoPerrot from "../assets/perrot-logo.png";
import { AuthContext } from "../context/AuthContext";

const InicioSesion: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Aquí podrías reemplazar testUsers por la fuente real de usuarios
    const testUsers = JSON.parse(localStorage.getItem("perrot-users") || "[]");
    const user = testUsers.find(
      (u: any) => u.username === usuario && u.password === contrasena
    );

    if (user) {
      setAuth({
        hasAccess: true,
        roles: user.roles,
        userName: user.userName,
      });
      navigate("/home");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 space-y-6">
        <div className="flex justify-center">
          <img
            src={LogoPerrot}
            alt="Perrot Logo"
            className="w-28 h-auto animate-fade-in"
          />
        </div>
        <h1 className="text-3xl font-extrabold text-center text-gray-800">
          Bienvenido
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="usuario"
              className="block text-sm font-medium text-gray-700"
            >
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              placeholder="Tu usuario"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="contrasena"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              placeholder="Tu contraseña"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            Iniciar Sesión
          </button>
        </form>
        <div className="flex justify-between text-sm text-gray-600">
          <button
            onClick={() => navigate("/recuperar-contrasena")}
            className="hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
          <button
            onClick={() => navigate("/crear-cuenta")}
            className="hover:underline"
          >
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default InicioSesion;
