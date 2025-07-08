import React, { useEffect, useState, useCallback } from "react";
import {
  loadDrafts,
  loadSent,
  saveOrUpdateSent,
  Payload,
  mockMoviles,
  mockChoferes,
  mockRamplas,
  getEmpresasTransporte,
} from "../../utils/ServiceDrafts";
import { Modal } from "../../components/Modal";


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
  const [chofer, setChofer] = useState(0);
  const [movil, setMovil] = useState(0);
  const [rampla, setRampla] = useState(0);
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
      
      const selectedMovil = mockMoviles.find(m => m.id === movil);
      
      const choferNombre = mockChoferes.find(c => c.id === chofer)?.nombre || "";
      const movilPatente = mockMoviles.find(m => m.id === movil)?.patente || "";
      
      const updated: Payload = {
        ...service,
        chofer: choferNombre,
        movil: movilPatente,
        estado: "En Proceso",
        estadoSeguimiento: "Asignado",
      };
      saveOrUpdateSent(updated);
      alert(`Asignación guardada. Servicio #${service.id} en Proceso.`);
      onClose();
      window.location.reload();
    },
    [service, empresa, chofer, movil, rampla, onClose]
  );

  // Filtrar choferes y móviles por empresa seleccionada
  const choferesFiltrados = empresa ? mockChoferes.filter(c => c.empresa === empresa) : [];
  const movilesFiltrados = empresa ? mockMoviles.filter(m => m.empresa === empresa) : [];
  const selectedMovil = mockMoviles.find(m => m.id === movil);
  const isTracto = selectedMovil?.tipo === "Tracto";

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
                  setChofer(0);
                  setMovil(0);
                  setRampla(0);
                }}
                required
                className="input w-full"
              >
                <option value="">— Seleccione empresa —</option>
                {getEmpresasTransporte().map((emp) => (
                  <option key={emp} value={emp}>
                    {emp}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Chofer *</label>
              <select
                value={chofer}
                onChange={(e) => setChofer(Number(e.target.value))}
                required
                disabled={!empresa}
                className="input w-full"
              >
                <option value={0}>— Seleccione chofer —</option>
                {choferesFiltrados.map((chofer) => (
                  <option key={chofer.id} value={chofer.id}>
                    {chofer.nombre} - RUT: {chofer.rut}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Móvil *</label>
              <select
                value={movil}
                onChange={(e) => {
                  setMovil(Number(e.target.value));
                  setRampla(0); // Reset rampla when changing vehicle
                }}
                required
                disabled={!empresa}
                className="input w-full"
              >
                <option value={0}>— Seleccione móvil —</option>
                {movilesFiltrados.map((movil) => (
                  <option key={movil.id} value={movil.id}>
                    {movil.patente} - {movil.tipo} ({movil.capacidad}t)
                  </option>
                ))}
              </select>
            </div>
            
            {/* Mostrar selector de rampla solo para vehículos Tracto */}
            {isTracto && (
              <div>
                <label className="block text-sm font-medium mb-1">Rampla</label>
                <select
                  value={rampla}
                  onChange={(e) => setRampla(Number(e.target.value))}
                  className="input w-full"
                >
                  <option value={0}>— Seleccione rampla —</option>
                  {mockRamplas.map((rampla) => (
                    <option key={rampla.id} value={rampla.id}>
                      {rampla.patente} - {rampla.capacidad}t
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Requerido para vehículos tipo Tracto
                </p>
              </div>
            )}
            
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
