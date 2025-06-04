import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const { userName, roles, hasAccess } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Mi Perfil</h1>

      <div className="space-y-2">
        <div>
          <p className="font-medium">Usuario:</p>
          <p>{userName}</p>
        </div>
        <div>
          <p className="font-medium">Roles:</p>
          {roles.length > 0 ? (
            <ul className="list-disc list-inside">
              {roles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : (
            <p>—</p>
          )}
        </div>
        <div>
          <p className="font-medium">Acceso activo:</p>
          <p>{hasAccess ? "Sí" : "No"}</p>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Volver
      </button>
    </div>
  );
};

export default Profile;
