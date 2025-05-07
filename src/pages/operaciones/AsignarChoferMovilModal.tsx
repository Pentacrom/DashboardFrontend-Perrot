import React, { useEffect, useState, useCallback } from "react";
import {
  loadDrafts,
  loadSent,
  saveOrUpdateSent,
  Payload,
} from "../../utils/ServiceDrafts";
import { Modal } from "../../components/Modal";

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

interface AsignarChoferMovilModalProps {
  serviceId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const AsignarChoferMovilModal: React.FC<
  AsignarChoferMovilModalProps
> = ({ serviceId, isOpen, onClose }) => {
  const [service, setService] = useState<Payload | null>(null);
  const [empresa, setEmpresa] = useState("");
  const [chofer, setChofer] = useState("");
  const [movil, setMovil] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    const all = [...loadSent(), ...loadDrafts()];
    const found = all.find((s) => s.id === serviceId);
    if (!found) {
      setError(`Servicio no encontrado. ID ${serviceId}`);
      setService(null);
    } else {
      setService(found);
    }
    setLoading(false);
  }, [isOpen, serviceId]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!service) return;
      if (!empresa || !chofer || !movil) {
        alert("Debe completar Empresa, Chofer y Móvil.");
        return;
      }
      const updated: Payload = {
        ...service,
        chofer,
        movil,
        estado: "En Proceso",
      };
      saveOrUpdateSent(updated);
      alert(`Asignación guardada. Servicio #${service.id} en Proceso.`);
      onClose();
      window.location.reload();
    },
    [service, empresa, chofer, movil, onClose]
  );

  const drivers = empresa ? COMPANY_DATA[empresa]?.drivers ?? [] : [];
  const movilesList = empresa ? COMPANY_DATA[empresa]?.moviles ?? [] : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {loading ? (
        <div className="p-6 flex justify-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full" />
        </div>
      ) : error || !service ? (
        <div className="p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            {error}
          </div>
          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Asignar Chofer y Móvil</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Empresa *
              </label>
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
                {drivers.map((d) => (
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
                {movilesList.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Asignar
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
