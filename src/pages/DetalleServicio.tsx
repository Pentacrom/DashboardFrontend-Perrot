// src/pages/DetalleServicio.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  loadDrafts,
  loadSent,
  saveOrUpdateSent,
  Payload,
  ValorFactura,
  Descuento,
  mockCatalogos,
  Lugar,
  Cliente,
  imoCategorias,
  mockPaises,
} from "../utils/ServiceDrafts";
import { formatCLP, formatFechaISO } from "../utils/format";

const lookup = <T extends { codigo: number; nombre: string }>(
  arr: T[],
  code: number
): string => arr.find((x) => x.codigo === code)?.nombre || code.toString();

const lookupLugar = (arr: Lugar[], id: number): string =>
  arr.find((x) => x.id === id)?.nombre || id.toString();

const lookupCliente = (arr: Cliente[], id: number): string =>
  arr.find((x) => x.id === id)?.nombre || id.toString();

const DetalleServicio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extrae segmento de perfil ("operacion" o "comercial")
  const segments = location.pathname.split("/").filter(Boolean);
  const perfilActual = segments[0] || "";

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

  const handleCompletar = () => {
    if (!service) return;
    const confirmado = window.confirm(
      "¿Estás seguro que quieres completar el servicio? Esta acción cambiará el estado a 'Completado'."
    );
    if (!confirmado) return;
    const actualizado: Payload = {
      ...service,
      estado: "Completado",
    };
    saveOrUpdateSent(actualizado);
    alert("Servicio marcado como Completado.");
    navigate(-1);
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

  const {
    form,
    puntos,
    estado,
    valores = [],
    chofer,
    movil,
    descuentoServicioPorcentaje = [],
  } = service;

  const esContainerRefrigerado = (): boolean =>
    mockCatalogos.Tipo_contenedor.filter(
      (c) => c.codigo === form.tipoContenedor
    ).some((c) => c.nombre.includes("RF") || c.nombre.includes("FR"));

  const pctDescuentoPorValor = (v: ValorFactura): number =>
    (v.descuentoPorcentaje || []).reduce(
      (sum, d: Descuento) => sum + d.porcentajeDescuento,
      0
    );

  const calcNetoPorValor = (v: ValorFactura): number => {
    const pct = pctDescuentoPorValor(v);
    const ventaConDesc = v.montoVenta * (1 - pct / 100);
    return ventaConDesc - v.montoCosto;
  };

  const totalVenta = valores.reduce((s, v) => s + v.montoVenta, 0);
  const totalCosto = valores.reduce((s, v) => s + v.montoCosto, 0);
  const totalNetoBruto = valores.reduce(
    (s, v) => s + (v.montoVenta - v.montoCosto),
    0
  );
  const totalPreGeneral = valores.reduce((s, v) => s + calcNetoPorValor(v), 0);
  const totalNeto = descuentoServicioPorcentaje.reduce(
    (acc, d) => acc * (1 - d.porcentajeDescuento / 100),
    totalPreGeneral
  );
  const totalDescuentoGeneral = descuentoServicioPorcentaje.reduce(
    (s, d) => s + d.porcentajeDescuento,
    0
  );

  return (
    <div className="p-6 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Detalle Servicio #{service.id}</h1>
        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
          {estado}
        </span>
      </header>

      {/* Información General */}
      <section className="grid grid-cols-1 gap-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Información General</h2>
        <dl className="grid grid-cols-4 gap-x-4 gap-y-2">
          <dt className="font-medium">Cliente:</dt>
          <dd>{lookupCliente(mockCatalogos.empresas, form.cliente)}</dd>

          <dt className="font-medium">Tipo Operación:</dt>
          <dd>{lookup(mockCatalogos.Operación, form.tipoOperacion)}</dd>

          <dt className="font-medium">Origen:</dt>
          <dd>{lookupLugar(mockCatalogos.Lugares, form.origen)}</dd>

          <dt className="font-medium">Destino:</dt>
          <dd>{lookupLugar(mockCatalogos.Lugares, form.destino)}</dd>

          <dt className="font-medium">País:</dt>
          <dd>{lookup(mockPaises, form.pais)}</dd>

          <dt className="font-medium">Fecha Solicitud:</dt>
          <dd>{formatFechaISO(form.fechaSol)}</dd>

          <dt className="font-medium">Guía:</dt>
          <dd>{form.guiaDeDespacho || "—"}</dd>

          <dt className="font-medium">Interchange:</dt>
          <dd className="whitespace-pre-line">{form.interchange || "—"}</dd>

          <dt className="font-medium">Observación:</dt>
          <dd className="whitespace-pre-line">{form.observacion || "—"}</dd>

          <dt className="font-medium">Chofer:</dt>
          <dd>{chofer || "—"}</dd>

          <dt className="font-medium">Móvil:</dt>
          <dd>{movil || "—"}</dd>

          <dt className="font-medium">Creado por:</dt>
          <dd>{service.createdBy || "—"}</dd>

          {/* Nuevos campos */}
          <dt className="font-medium">Precio de Carga:</dt>
          <dd>{formatCLP(form.precioCarga)}</dd>

          <dt className="font-medium">Temperatura:</dt>
          <dd>
            {form.temperatura}°C
            {esContainerRefrigerado() ? " (Refrigerado)" : ""}
          </dd>

          <dt className="font-medium">Cargo IMO:</dt>
          <dd>{form.imoCargo ? "Sí" : "No"}</dd>

          {form.imoCargo && (
            <>
              <dt className="font-medium">Categoría IMO:</dt>
              <dd>
                {imoCategorias.find((c) => c.code === form.imoCategoria)
                  ?.label || form.imoCategoria}
              </dd>
            </>
          )}

          <dt className="font-medium">Documentos por Contenedor:</dt>
          <dd>
            {form.documentoPorContenedor.length > 0 ? (
              <ul className="list-disc list-inside">
                {form.documentoPorContenedor.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </dd>

          <dt className="font-medium">ETA:</dt>
          <dd>{formatFechaISO(form.eta)}</dd>

          {/* Folio y Fecha Folio */}
          <dt className="font-medium">Folio:</dt>
          <dd>{form.folio}</dd>

          <dt className="font-medium">Fecha de Folio:</dt>
          <dd>
            {formatFechaISO(form.fechaFolio)}
          </dd>
        </dl>
      </section>

      {/* Valores / Facturación */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Valores / Facturación</h2>
        {valores.length === 0 ? (
          <p className="text-gray-500">No hay valores cargados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-3 py-2 text-left">Concepto</th>
                  <th className="border px-3 py-2 text-right">Venta</th>
                  <th className="border px-3 py-2 text-right">Costo</th>
                  <th className="border px-3 py-2">Descuentos %</th>
                  <th className="border px-3 py-2 text-right">Neto</th>
                </tr>
              </thead>
              <tbody>
                {valores.map((v, idx) => (
                  <tr
                    key={v.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border px-3 py-2">{v.concepto}</td>
                    <td className="border px-3 py-2 text-right">
                      {formatCLP(v.montoVenta)}
                    </td>
                    <td className="border px-3 py-2 text-right">
                      {formatCLP(v.montoCosto)}
                    </td>
                    <td className="border px-3 py-2">
                      {pctDescuentoPorValor(v) > 0
                        ? `${pctDescuentoPorValor(v)}%`
                        : "—"}
                    </td>
                    <td className="border px-3 py-2 text-right font-medium">
                      {formatCLP(calcNetoPorValor(v))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Resumen de Totales */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Venta</p>
            <p className="text-lg font-semibold">{formatCLP(totalVenta)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Costo</p>
            <p className="text-lg font-semibold">{formatCLP(totalCosto)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Neto Bruto</p>
            <p className="text-lg font-semibold">{formatCLP(totalNetoBruto)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">
              Neto antes descuento general
            </p>
            <p className="text-lg font-semibold">
              {formatCLP(totalPreGeneral)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Neto</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCLP(totalNeto)}
            </p>
          </div>
        </div>
      </section>

      {/* Descuentos generales del servicio */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Descuentos del Servicio</h2>
        {descuentoServicioPorcentaje.length === 0 ? (
          <p className="text-gray-500">No hay descuentos generales.</p>
        ) : (
          <>
            <ul className="list-disc list-inside space-y-2">
              {descuentoServicioPorcentaje.map((d, i) => (
                <li key={i} className="text-sm">
                  <strong>{d.porcentajeDescuento}%</strong> – {d.razon}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-medium">
              Descuento total aplicado: {totalDescuentoGeneral}%
            </p>
          </>
        )}
      </section>

      {/* Recorrido y Puntos */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recorrido y Puntos</h2>
        <div className="space-y-4">
          {puntos.map((p, i) => {
            const arrival = p.llegada ? new Date(p.llegada) : null;
            const eta = p.eta ? new Date(p.eta) : null;
            const isLate = !!(arrival && eta && arrival > eta);
            return (
              <div
                key={i}
                className={`p-4 rounded-lg border-l-4 ${
                  isLate
                    ? "border-red-400 bg-red-50"
                    : "border-blue-400 bg-blue-50"
                }`}
              >
                <h3 className="font-black mb-2">Punto {i + 1}</h3>
                <div className="grid grid-cols-2 text-left gap-2">
                  <p>
                    <strong>Lugar:</strong>{" "}
                    {lookupLugar(mockCatalogos.Lugares, p.idLugar)}
                  </p>
                  <p>
                    <strong>Acción:</strong>{" "}
                    {lookup(mockCatalogos.acciones, p.accion)}
                  </p>
                  <p>
                    <strong>ETA:</strong> {eta ? formatFechaISO(eta) : "—"}
                  </p>
                  <p>
                    <strong>Salida:</strong>{" "}
                    {p.salida ? formatFechaISO(new Date(p.salida)) : "—"}
                  </p>
                  <p>
                    <strong>Llegada:</strong>{" "}
                    {p.llegada ? formatFechaISO(new Date(p.llegada)) : "—"}
                  </p>
                  {p.observacion && (
                    <p>
                      <strong>Observación:</strong> {p.observacion}
                    </p>
                  )}
                  {isLate && (
                    <p className="text-red-600">
                      <strong>Razón de tardía:</strong> {p.razonDeTardia || "—"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex gap-4 mt-4">
        {service.estado === "Por validar" && (
          <button
            onClick={handleCompletar}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Completar Servicio
          </button>
        )}
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default DetalleServicio;
