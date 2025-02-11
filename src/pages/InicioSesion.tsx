import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoPerrot from '../assets/perrot-logo.png'; // Asegúrate de que la ruta sea correcta

const InicioSesion: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Sin validaciones, simplemente se redirige al dashboard (ruta "/")
    navigate('/home');
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
