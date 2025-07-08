// src/pages/AdministrarCuentas.tsx
import React, { useState, useContext, ChangeEvent } from "react";
import { AuthContext, ALL_ROLES, UserAccount } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdministrarCuentas: React.FC = () => {
  const { roles, users, addUser, updateUser, deleteUser } =
    useContext(AuthContext);
  const navigate = useNavigate();

  // Solo administradores pueden acceder
  if (!roles.includes("administracion")) {
    navigate("/home");
  }

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<UserAccount>({
    username: "",
    password: "",
    roles: [],
    userName: "",
  });

  const startAdd = () => {
    setEditingIndex(-1);
    setForm({ username: "", password: "", roles: [], userName: "" });
  };

  const startEdit = (idx: number) => {
    setEditingIndex(idx);
    setForm({ ...users[idx]! });
  };

  const cancel = () => {
    setEditingIndex(null);
  };

  const save = () => {
    if (!form.username || !form.password || !form.userName) {
      alert("Usuario, contraseña y nombre completo son obligatorios.");
      return;
    }
    if (editingIndex === -1) {
      addUser(form);
    } else if (editingIndex !== null) {
      updateUser(editingIndex, form);
    }
    setEditingIndex(null);
  };

  const remove = (idx: number) => {
    if (window.confirm("¿Eliminar esta cuenta?")) {
      deleteUser(idx);
    }
  };

  const onChangeField = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as UserAccount)
    );
  };

  const onToggleRole = (e: ChangeEvent<HTMLInputElement>) => {
    const role = e.target.value;
    setForm((prev) => {
      const has = prev.roles.includes(role);
      return {
        ...prev,
        roles: has
          ? prev.roles.filter((r) => r !== role)
          : [...prev.roles, role],
      } as UserAccount;
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Administrar Cuentas</h1>

      {editingIndex !== null ? (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl mb-4">
            {editingIndex === -1 ? "Agregar Cuenta" : "Editar Cuenta"}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium">Usuario</label>
              <input
                name="username"
                value={form.username}
                onChange={onChangeField}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Contraseña</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChangeField}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Nombre Completo
              </label>
              <input
                name="userName"
                value={form.userName}
                onChange={onChangeField}
                className="input w-full"
              />
            </div>
            <div>
              <span className="block text-sm font-medium mb-1">Roles</span>
              <div className="flex flex-wrap gap-2">
                {ALL_ROLES.map((role) => (
                  <label key={role} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      value={role}
                      checked={form.roles.includes(role)}
                      onChange={onToggleRole}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{role}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={save}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Guardar
              </button>
              <button
                onClick={cancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={startAdd}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Agregar Nueva Cuenta
        </button>
      )}

      <table className="min-w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Usuario</th>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Roles</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.username} className="border-t">
              <td className="px-4 py-2">{u.username}</td>
              <td className="px-4 py-2">{u.userName}</td>
              <td className="px-4 py-2">{u.roles.join(", ") || "—"}</td>
              <td className="px-4 py-2 text-center space-x-2">
                <button
                  onClick={() => startEdit(idx)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => remove(idx)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdministrarCuentas;
