import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  saveOrUpdateSent,
  loadSent,
  loadDrafts,
  Payload,
  ValorFactura,
  valoresPorDefecto,
} from "../utils/ServiceDrafts";

const AgregarValoresServicio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [valores, setValores] = useState<ValorFactura[]>([]);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const servicioId = parseInt(id || "0", 10);
      if (!servicioId) throw new Error("ID de servicio inválido");
      const enviado = loadSent().find((s) => s.id === servicioId);
      const borrador = loadDrafts().find((s) => s.id === servicioId);
      const serv = enviado || borrador;
      if (!serv) throw new Error("Servicio no encontrado");
      setPayload(serv);
      setValores(serv.valores || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar el servicio"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const agregarValor = useCallback(() => {
    const nuevo: ValorFactura = {
      id: Date.now().toString(),
      concepto: "",
      monto: 0,
      impuesto: 0,
      fechaEmision: new Date().toISOString().split("T")[0]!,
      tipo: "venta",
    };
    setValores((prev) => [...prev, nuevo]);
  }, []);

  const actualizarValor = useCallback(
    (valId: string, campo: keyof ValorFactura, valor: string | number) => {
      setValores((prev) =>
        prev.map((v) => (v.id === valId ? { ...v, [campo]: valor } : v))
      );
    },
    []
  );

  const eliminarValor = useCallback((valId: string) => {
    setValores((prev) => prev.filter((v) => v.id !== valId));
  }, []);

  const handleGuardar = useCallback(() => {
    if (!payload) return;
    const actualizado: Payload = {
      ...payload,
      valores,
      estado: "Pendiente",
    };
    saveOrUpdateSent(actualizado);
    alert(`Borrador guardado con ID ${payload.id}. Estado: Pendiente`);
    navigate("/comercial/ingresoServicios");
  }, [payload, valores, navigate]);

  const handleEnviar = useCallback(() => {
    if (!payload) return;
    if (valores.length === 0) {
      alert("Debes ingresar al menos un valor antes de enviar.");
      return;
    }
    const hasChofer = Boolean(payload.chofer);
    const hasMovil = Boolean(payload.movil);
    const nuevoEstado: Payload["estado"] =
      hasChofer && hasMovil ? "En Proceso" : "Sin Asignar";

    const enviado: Payload = {
      ...payload,
      valores,
      estado: nuevoEstado,
    };
    saveOrUpdateSent(enviado);

    alert(`Servicio ${payload.id} enviado. Estado: ${nuevoEstado}`);
    navigate(-1);
  }, [payload, valores, navigate]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate("/comercial/ingresoServicios")}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="p-6">
        <p>No se encontraron datos del servicio.</p>
        <button
          onClick={() => navigate("/comercial/ingresoServicios")}
          className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Agregar Valores al Servicio #{payload.id}
      </h1>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Valores / Facturación</h2>
        <button
          onClick={agregarValor}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Agregar Valor
        </button>

        {valores.length === 0 ? (
          <p className="text-gray-500">No se han agregado valores aún.</p>
        ) : (
          <div className="space-y-4">
            {valores.map((valor) => {
              const conceptosDisponibles = Object.entries(
                valoresPorDefecto
              ).map(([key, val]) => ({
                codigo: key,
                concepto: val.concepto,
                monto: val.monto,
              }));

              const match = conceptosDisponibles.find(
                (c) => c.concepto === valor.concepto
              );
              const isCustom = !match;

              return (
                <div
                  key={valor.id}
                  className="grid grid-cols-1 md:grid-cols-5 gap-4 border p-4 rounded"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Concepto *
                    </label>
                    <select
                      className="input w-full"
                      value={isCustom ? "custom" : valor.concepto}
                      onChange={(e) => {
                        const selected = e.target.value;
                        if (selected === "custom") {
                          actualizarValor(valor.id, "concepto", "");
                          actualizarValor(valor.id, "monto", 0);
                        } else {
                          const def = conceptosDisponibles.find(
                            (c) => c.concepto === selected
                          );
                          if (def) {
                            actualizarValor(valor.id, "concepto", def.concepto);
                            actualizarValor(valor.id, "monto", def.monto);
                          }
                        }
                      }}
                    >
                      {conceptosDisponibles.map((c) => (
                        <option key={c.codigo} value={c.concepto}>
                          {c.concepto}
                        </option>
                      ))}
                      <option value="custom">Otro (personalizado)</option>
                    </select>
                    {isCustom && (
                      <input
                        className="input mt-2 w-full"
                        type="text"
                        placeholder="Concepto personalizado"
                        value={valor.concepto}
                        onChange={(e) =>
                          actualizarValor(valor.id, "concepto", e.target.value)
                        }
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Monto
                    </label>
                    <input
                      type="number"
                      value={valor.monto}
                      onChange={(e) =>
                        actualizarValor(
                          valor.id,
                          "monto",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="input w-full"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Fecha emisión
                    </label>
                    <input
                      type="date"
                      value={valor.fechaEmision}
                      onChange={(e) =>
                        actualizarValor(
                          valor.id,
                          "fechaEmision",
                          e.target.value
                        )
                      }
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tipo
                    </label>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`tipo-${valor.id}`}
                          value="costo"
                          checked={valor.tipo === "costo"}
                          onChange={() =>
                            actualizarValor(valor.id, "tipo", "costo")
                          }
                        />
                        Costo
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`tipo-${valor.id}`}
                          value="venta"
                          checked={valor.tipo === "venta"}
                          onChange={() =>
                            actualizarValor(valor.id, "tipo", "venta")
                          }
                        />
                        Venta
                      </label>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => eliminarValor(valor.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={handleGuardar}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Guardar
        </button>
        <button
          onClick={handleEnviar}
          disabled={valores.length === 0}
          className={`px-4 py-2 rounded ${
            valores.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default AgregarValoresServicio;
