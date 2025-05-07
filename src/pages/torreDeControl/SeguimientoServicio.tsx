import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  loadDrafts,
  loadSent,
  saveOrUpdateSent,
  Payload,
  Punto,
  mockCatalogos,
  mockCentros,
} from "../../utils/ServiceDrafts";
import { Modal } from "../../components/Modal";

const SeguimientoServicio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Payload | null>(null);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // carga inicial
  useEffect(() => {
    try {
      const sid = Number(id);
      if (!sid) throw new Error("ID inválido");
      const sent = loadSent().find((s) => s.id === sid);
      const draft = loadDrafts().find((s) => s.id === sid);
      const found = sent || draft;
      if (!found) throw new Error("Servicio no encontrado");
      setService(found);
      setPuntos(found.puntos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const lookupLugar = (code: number) => {
    const inPort = mockCatalogos.Zona_portuaria.find((z) => z.codigo === code);
    if (inPort) return inPort.nombre;
    const centro = mockCentros.find((c) => c.codigo === code);
    return centro ? centro.nombre : code.toString();
  };
  const lookupAccion = (code: number) =>
    mockCatalogos.acciones.find((a) => a.codigo === code)?.nombre ||
    code.toString();

  const updatePunto = useCallback(
    (idx: number, key: "llegada" | "salida", value: string) => {
      setPuntos((prev) =>
        prev.map((p, i) =>
          i === idx
            ? {
                ...p,
                [key]: value,
              }
            : p
        )
      );
    },
    []
  );

  const handleGuardar = useCallback(() => {
    if (!service) return;
    const updated: Payload = {
      ...service,
      puntos,
    };
    saveOrUpdateSent(updated);
    alert("Seguimiento guardado correctamente.");
    navigate(-1);
  }, [service, puntos, navigate]);

  const validarFechas = () =>
    puntos.every((p) => p.llegada?.length && p.salida?.length);

  const handleCompletar = () => {
    if (!validarFechas()) {
      alert("Todas las fechas de llegada y salida deben estar completas.");
      return;
    }
    setShowModal(true);
  };

  const confirmarCompletar = () => {
    if (!service) return;
    const actualizado: Payload = {
      ...service,
      puntos,
      estado: "Completado",
    };
    saveOrUpdateSent(actualizado);
    setShowModal(false);
    alert("Servicio marcado como Completado.");
    navigate("/comercial/ingresoServicios");
  };

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Seguimiento Servicio #{service.id}
        </h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
          Estado: {service.estado}
        </span>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Puntos del Recorrido</h2>
        <div className="space-y-4">
          {puntos.map((p, idx) => (
            <div
              key={idx}
              className="grid md:grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded"
            >
              <div>
                <p className="text-sm font-medium">Lugar:</p>
                <p>{lookupLugar(p.idLugar)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Acción:</p>
                <p>{lookupAccion(p.accion)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Llegada
                </label>
                <input
                  type="datetime-local"
                  className="input w-full"
                  value={p.llegada || ""}
                  onChange={(e) => updatePunto(idx, "llegada", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salida</label>
                <input
                  type="datetime-local"
                  className="input w-full"
                  value={p.salida || ""}
                  onChange={(e) => updatePunto(idx, "salida", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Guardar Seguimiento
        </button>
        <button
          onClick={handleCompletar}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Completar Servicio
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            ¿Confirmar completar servicio?
          </h2>
          <p>
            Esta acción marcará el servicio como <strong>Completado</strong> y
            no podrá ser modificada.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarCompletar}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SeguimientoServicio;
