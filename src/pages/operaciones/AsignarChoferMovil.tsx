// src/pages/operaciones/AsignarChoferMovil.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  loadDrafts,
  loadSent,
  saveOrUpdateSent,
  Payload,
} from "../../utils/ServiceDrafts";

const COMPANY_DATA: Record<string, { drivers: string[]; moviles: string[] }> = {
  empresa1: {
    drivers: ["Juan Pérez", "Ana López"],
    moviles: ["ABC-123", "ABC-456"],
  },
  empresa2: {
    drivers: ["Carlos Díaz", "María García"],
    moviles: ["XYZ-789", "XYZ-012"],
  },
  empresa3: {
    drivers: ["Luis Ramírez", "Sofía Torres"],
    moviles: ["MNO-321", "MNO-654"],
  },
};

const AsignarChoferMovil: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Payload | null>(null);
  const [empresa, setEmpresa] = useState("");
  const [chofer, setChofer] = useState("");
  const [movil, setMovil] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const sid = Number(id);
      if (!sid) throw new Error("ID de servicio inválido");
      const sent = loadSent().find((s) => s.id === sid);
      const draft = loadDrafts().find((s) => s.id === sid);
      const found = sent || draft;
      if (!found) throw new Error("Servicio no encontrado");
      setService(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!service) return;
      if (!empresa || !chofer || !movil) {
        alert("Debe seleccionar empresa, chofer y móvil.");
        return;
      }
      const updated: Payload = {
        ...service,
        chofer,
        movil,
        estado: "En Proceso",
      };
      saveOrUpdateSent(updated);
      alert(`Chofer y móvil asignados. Servicio ${service.id} en Proceso.`);
      navigate("/comercial/ingresoServicios");
    },
    [service, empresa, chofer, movil, navigate]
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error || "Servicio no encontrado."}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Volver
        </button>
      </div>
    );
  }

  const drivers = empresa ? COMPANY_DATA[empresa]?.drivers : [];
  const movilesList = empresa ? COMPANY_DATA[empresa]?.moviles : [];

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Asignar Chofer y Móvil al Servicio #{service.id}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded shadow"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Empresa *</label>
          <select
            value={empresa}
            onChange={(e) => {
              setEmpresa(e.target.value);
              setChofer("");
              setMovil("");
            }}
            required
            className="input w-full"
          >
            <option value="">— Seleccione empresa —</option>
            {Object.keys(COMPANY_DATA).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Chofer *</label>
          <select
            value={chofer}
            onChange={(e) => setChofer(e.target.value)}
            required
            disabled={!empresa}
            className="input w-full"
          >
            <option value="">— Seleccione chofer —</option>
            {drivers?.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Móvil *</label>
          <select
            value={movil}
            onChange={(e) => setMovil(e.target.value)}
            required
            disabled={!empresa}
            className="input w-full"
          >
            <option value="">— Seleccione móvil —</option>
            {movilesList?.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Asignar y Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AsignarChoferMovil;
