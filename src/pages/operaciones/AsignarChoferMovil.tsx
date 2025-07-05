// src/pages/operaciones/AsignarChoferMovil.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  loadDrafts,
  loadSent,
  saveOrUpdateSent,
  Payload,
  mockMoviles,
  mockChoferes,
  mockRamplas,
} from "../../utils/ServiceDrafts";


const AsignarChoferMovil: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Payload | null>(null);
  const [chofer, setChofer] = useState(0);
  const [movil, setMovil] = useState(0);
  const [rampla, setRampla] = useState(0);
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
      if (!chofer || !movil) {
        alert("Debe seleccionar chofer y móvil.");
        return;
      }
      
      const selectedMovil = mockMoviles.find(m => m.id === movil);
      if (selectedMovil?.tipo === "Tracto" && !rampla) {
        alert("Debe seleccionar una rampla para vehículos tipo Tracto.");
        return;
      }
      
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
      alert(`Chofer y móvil asignados. Servicio ${service.id} en Proceso.`);
      navigate("/comercial/ingresoServicios");
    },
    [service, chofer, movil, rampla, navigate]
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

  const selectedMovil = mockMoviles.find(m => m.id === movil);
  const isTracto = selectedMovil?.tipo === "Tracto";

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
          <label className="block text-sm font-medium mb-1">Chofer *</label>
          <select
            value={chofer}
            onChange={(e) => setChofer(Number(e.target.value))}
            required
            className="input w-full"
          >
            <option value={0}>— Seleccione chofer —</option>
            {mockChoferes.map((chofer) => (
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
            className="input w-full"
          >
            <option value={0}>— Seleccione móvil —</option>
            {mockMoviles.map((movil) => (
              <option key={movil.id} value={movil.id}>
                {movil.patente} - {movil.tipo} ({movil.capacidad}t)
              </option>
            ))}
          </select>
        </div>

        {/* Mostrar selector de rampla solo para vehículos Tracto */}
        {isTracto && (
          <div>
            <label className="block text-sm font-medium mb-1">Rampla *</label>
            <select
              value={rampla}
              onChange={(e) => setRampla(Number(e.target.value))}
              required
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
