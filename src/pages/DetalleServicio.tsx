import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  loadDrafts,
  loadSent,
  Payload,
  Punto,
  ValorFactura,
  mockCatalogos,
} from "../utils/ServiceDrafts";
import { Lugar } from "../utils/ServiceDrafts";

const DetalleServicio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Payload | null>(null);
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

  // Lookup para catálogos con `codigo`
  const lookupCodigo = (
    arr: { codigo: number; nombre: string }[],
    code: number
  ) => arr.find((x) => x.codigo === code)?.nombre || code.toString();

  // Lookup para catálogo `Lugares` con `id`
  const lookupLugar = (arr: Lugar[], id: number) =>
    arr.find((x) => x.id === id)?.nombre || id.toString();

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

  const { form, puntos, estado, valores = [], chofer, movil } = service;

  // Arreglo de lugares válidos para puntos: zonas portuarias + centros del cliente
  const puntosOptions = mockCatalogos.Lugares.filter(
    (l) =>
      l.tipo === "Zona Portuaria" ||
      (l.tipo === "Centro" && l.cliente === form.cliente)
  );

  // Determinar punto actual: primero sin 'salida'
  const puntoActual: Punto | null = puntos.find((p) => !p.salida) || null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Detalle Servicio #{service.id}</h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
          Estado: {estado}
        </span>
      </div>

      {/* Información General */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Cliente:</p>
            <p>{lookupCodigo(mockCatalogos.empresas, form.cliente)}</p>
          </div>
          <div>
            <p className="font-medium">Tipo de operación:</p>
            <p>{lookupCodigo(mockCatalogos.Operación, form.tipoOperacion)}</p>
          </div>
          <div>
            <p className="font-medium">Origen:</p>
            <p>
              {form.tipoOperacion === 2
                ? lookupLugar(mockCatalogos.Lugares, form.origen)
                : lookupCodigo(mockCatalogos.Zona, form.origen)}
            </p>
          </div>
          <div>
            <p className="font-medium">Destino:</p>
            <p>
              {form.tipoOperacion === 1
                ? lookupLugar(mockCatalogos.Lugares, form.destino)
                : lookupCodigo(mockCatalogos.Zona, form.destino)}
            </p>
          </div>
          <div>
            <p className="font-medium">Fecha Solicitud:</p>
            <p>{form.fechaSol}</p>
          </div>
          <div>
            <p className="font-medium">Fecha Creación:</p>
            <p>{form.fechaIng}</p>
          </div>
          <div>
            <p className="font-medium">Tipo Contenedor:</p>
            <p>
              {lookupCodigo(mockCatalogos.Tipo_contenedor, form.tipoContenedor)}
            </p>
          </div>
          <div>
            <p className="font-medium">Chofer Asignado:</p>
            <p>{chofer || "No asignado"}</p>
          </div>
          <div>
            <p className="font-medium">Móvil Asignado:</p>
            <p>{movil || "No asignado"}</p>
          </div>
        </div>
      </div>

      {/* Valores / Facturación */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Valores / Facturación</h2>
        {valores.length === 0 ? (
          <p className="text-gray-500">No hay valores cargados.</p>
        ) : (
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">Concepto</th>
                <th className="border px-2 py-1 text-right">Monto</th>
                <th className="border px-2 py-1 text-right">Impuesto (%)</th>
                <th className="border px-2 py-1 text-center">Fecha emisión</th>
              </tr>
            </thead>
            <tbody>
              {valores.map((v: ValorFactura) => (
                <tr key={v.id}>
                  <td className="border px-2 py-1">{v.concepto}</td>
                  <td className="border px-2 py-1 text-right">
                    ${v.monto.toFixed(2)}
                  </td>
                  <td className="border px-2 py-1 text-right">{v.impuesto}%</td>
                  <td className="border px-2 py-1 text-center">
                    {v.fechaEmision}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Puntos y estado actual */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">
          Recorrido y Estado de Puntos
        </h2>

        {puntoActual && (
          <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            Punto actual:{" "}
            <strong>
              {lookupLugar(puntosOptions, puntoActual.idLugar)} — acción{" "}
              {lookupCodigo(mockCatalogos.acciones, puntoActual.accion)}
            </strong>
          </div>
        )}

        <ul className="space-y-2">
          {puntos.map((p, i) => (
            <li
              key={i}
              className={`p-3 rounded ${
                p === puntoActual
                  ? "bg-blue-50 border-l-4 border-blue-400"
                  : "bg-gray-50"
              }`}
            >
              <p>
                <strong>Punto {i + 1}:</strong>{" "}
                {lookupLugar(puntosOptions, p.idLugar)}
              </p>
              <p>
                Acción: {lookupCodigo(mockCatalogos.acciones, p.accion)} —
                Estado interno: {p.estado}
              </p>
              <p>ETA: {p.eta}</p>
              <p>Llegada: {p.llegada || "—"}</p>
              <p>Salida: {p.salida || "—"}</p>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Volver
      </button>
    </div>
  );
};

export default DetalleServicio;
