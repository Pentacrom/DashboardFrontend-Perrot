// src/pages/AgregarValoresServicio.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  saveOrUpdateSent,
  loadSent,
  loadDrafts,
  Payload,
  ValorFactura,
  valoresPorDefecto,
} from "../utils/ServiceDrafts";
import { formatDateTimeLocal } from "../utils/format";

interface Discount {
  id: string;
  porcentaje: number;
  razon: string;
}

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const AgregarValoresServicio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [payload, setPayload] = useState<Payload | null>(null);
  const [valores, setValores] = useState<ValorFactura[]>([]);
  const [descPorValor, setDescPorValor] = useState<Record<string, Discount[]>>(
    {}
  );
  const [descTotal, setDescTotal] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extrae el primer segmento de la ruta (p.ej. "comercial" o "operacion")
  const segments = location.pathname.split("/").filter(Boolean);
  const perfilActual = segments[1] || "";
  const isOperacion = perfilActual === "operaciones";

  useEffect(() => {
    try {
      const svcId = Number(id);
      if (!svcId) throw new Error("ID inválido");
      const sent = loadSent().find((s) => s.id === svcId);
      const draft = loadDrafts().find((s) => s.id === svcId);
      const svc = sent || draft;
      if (!svc) throw new Error("Servicio no encontrado");

      setPayload(svc);
      setValores(svc.valores || []);

      // inicializar descuentos generales
      const initTotal: Discount[] = (svc.descuentoServicioPorcentaje || []).map(
        (d, i) => ({
          id: Date.now().toString() + "-" + i,
          porcentaje: d.porcentajeDescuento,
          razon: d.razon,
        })
      );
      setDescTotal(initTotal);

      // inicializar descuentos por valor
      const initPorValor: Record<string, Discount[]> = {};
      (svc.valores || []).forEach((v) => {
        initPorValor[v.id] = (v.descuentoPorcentaje || []).map((d, i) => ({
          id: Date.now().toString() + "-" + i,
          porcentaje: d.porcentajeDescuento,
          razon: d.razon,
        }));
      });
      setDescPorValor(initPorValor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ---- Helpers para valores ----
  const agregarValor = () => {
    const nuevo: ValorFactura = {
      id: Date.now().toString(),
      concepto: "",
      codigo: "",
      montoVenta: 0,
      montoCosto: 0,
      fechaEmision: new Date(),
      tipo: "venta",
      descuentoPorcentaje: [],
    };
    setValores((v) => [...v, nuevo]);
  };

  const actualizarValor = (
    vid: string,
    campo: keyof ValorFactura,
    val: any
  ) => {
    setValores((v) =>
      v.map((x) => (x.id === vid ? { ...x, [campo]: val } : x))
    );
  };
  const eliminarValor = (vid: string) => {
    setValores((v) => v.filter((x) => x.id !== vid));
    setDescPorValor((d) => {
      const c = { ...d };
      delete c[vid];
      return c;
    });
  };

  // ---- Descuentos por valor ----
  const agregarDescValor = (vid: string) => {
    const d: Discount = { id: Date.now().toString(), porcentaje: 0, razon: "" };
    setDescPorValor((dv) => ({ ...dv, [vid]: [...(dv[vid] || []), d] }));
  };
  const actualizarDescValor = (
    vid: string,
    did: string,
    campo: keyof Discount,
    val: number | string
  ) => {
    setDescPorValor((dv) => {
      const arr = (dv[vid] || []).map((x) => {
        if (x.id !== did) return x;

        if (campo === "porcentaje") {
          // 1) convertir val a string
          let s = typeof val === "number" ? val.toString() : val;
          // 2) eliminar todo excepto dígitos y punto
          s = s.replace(/[^0-9.]/g, "");
          // 3) quitar ceros al inicio (pero dejar “0” si es cero)
          s = s.replace(/^0+(?=\d)/, "");
          // 4) parsear y clamp
          const num = parseFloat(s) || 0;
          const clean = Math.max(0, Math.min(100, num));
          return { ...x, porcentaje: clean };
        }

        // para razón no tocamos nada
        return { ...x, [campo]: val };
      });

      return { ...dv, [vid]: arr };
    });
  };
  const eliminarDescValor = (vid: string, did: string) => {
    setDescPorValor((dv) => ({
      ...dv,
      [vid]: (dv[vid] || []).filter((x) => x.id !== did),
    }));
  };

  // ---- Descuentos totales ----
  const agregarDescTotal = () => {
    const d: Discount = { id: Date.now().toString(), porcentaje: 0, razon: "" };
    setDescTotal((dt) => [...dt, d]);
  };
  const actualizarDescTotal = (
    did: string,
    campo: keyof Discount,
    val: number | string
  ) => {
    setDescTotal((dt) =>
      dt.map((x) => (x.id === did ? { ...x, [campo]: val } : x))
    );
  };
  const eliminarDescTotal = (did: string) => {
    setDescTotal((dt) => dt.filter((x) => x.id !== did));
  };

  // ---- Cálculos ----

  // Los descuentos son sumados 5% + 5% = 10% descuento total y por valor
  const calcItem = (v: ValorFactura): number => {
    // 1) suma porcentajes
    const totalPct = Math.min(
      100,
      (descPorValor[v.id] || []).reduce((sum, d) => sum + d.porcentaje, 0)
    );
    // 2) aplica el descuento sumado
    const discountedSale = v.montoVenta * (1 - totalPct / 100);
    // 3) resta el costo
    return discountedSale - v.montoCosto;
  };

  const calcSubtotal = () => valores.reduce((sum, v) => sum + calcItem(v), 0);
  const calcTotal = () => {
    let total = calcSubtotal();
    descTotal.forEach((d) => {
      total *= 1 - d.porcentaje / 100;
    });
    return total;
  };

  // ---- Guardar / Enviar ----
  const handleGuardar = () => {
    if (!payload) return;
    const nuevosValores: ValorFactura[] = valores.map((v) => ({
      ...v,
      descuentoPorcentaje: (descPorValor[v.id] || []).map((d) => ({
        porcentajeDescuento: d.porcentaje,
        razon: d.razon,
      })),
    }));
    const nuevosDescTotal = descTotal.map((d) => ({
      porcentajeDescuento: d.porcentaje,
      razon: d.razon,
    }));
    saveOrUpdateSent({
      ...payload,
      valores: nuevosValores,
      descuentoServicioPorcentaje: nuevosDescTotal
    });
    alert(`Guardado servicio N° ${payload.id}`);
    navigate(`/${perfilActual}/gestion-servicios`);
  };
  const handleEnviar = () => {
    if (!payload) return;
    if (valores.length === 0) return alert("Agrega al menos un valor");

    const nuevosValores: ValorFactura[] = valores.map((v) => ({
      ...v,
      descuentoPorcentaje: (descPorValor[v.id] || []).map((d) => ({
        porcentajeDescuento: d.porcentaje,
        razon: d.razon,
      })),
    }));
    const nuevosDescTotal = descTotal.map((d) => ({
      porcentajeDescuento: d.porcentaje,
      razon: d.razon,
    }));
    const nuevoEstado =
      payload.chofer && payload.movil ? "En Proceso" : "Sin Asignar";
    saveOrUpdateSent({
      ...payload,
      valores: nuevosValores,
      descuentoServicioPorcentaje: nuevosDescTotal,
      estado: nuevoEstado,
    });
    alert(`Enviado servicio ${payload.id}: ${nuevoEstado}`);
    navigate(`/${perfilActual}/gestion-servicios`);
  };

  if (loading) return <div className="p-6">Cargando…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!payload) return null;

  // Totales para el resumen
  const totalVenta = valores.reduce((sum, v) => sum + v.montoVenta, 0);
  const totalCosto = valores.reduce((sum, v) => sum + v.montoCosto, 0);
  const subtotalBruto = valores.reduce(
    (sum, v) => sum + (v.montoVenta - v.montoCosto),
    0
  );
  const descuentoPorValorTotal = subtotalBruto - calcSubtotal();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Valores Servicio #{payload.id}</h1>

      {/* Valores / Facturación */}
      <section className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="font-semibold">Valores / Facturación</h2>
        <button onClick={agregarValor} className="btn-primary">
          + Añadir Valor
        </button>
        {valores.length === 0 && <p>No hay valores.</p>}
        {valores.map((v) => (
          <div key={v.id} className="border p-4 rounded space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Concepto */}
              <div>
                <label className="block text-sm font-medium">Concepto</label>
                <input
                  list={`conceptos-${v.id}`}
                  className="input mt-1"
                  value={v.concepto}
                  onChange={(e) => {
                    const val = e.target.value;
                    // 1) actualizamos el texto del concepto
                    actualizarValor(v.id, "concepto", val);

                    // 2) si coincide con uno de los predefinidos, cargamos sus montos
                    const found = Object.entries(valoresPorDefecto).find(
                      ([, def]) => def.concepto === val
                    );
                    if (found) {
                      const [key, def] = found as [
                        string,
                        (typeof valoresPorDefecto)[string]
                      ];
                      actualizarValor(v.id, "codigo", key);
                      actualizarValor(v.id, "montoVenta", def.montoVenta);
                      actualizarValor(v.id, "montoCosto", def.montoCosto);
                    } else {
                      // si no, dejamos el código vacío para saber que es custom
                      actualizarValor(v.id, "codigo", "");
                    }
                  }}
                />
                <datalist id={`conceptos-${v.id}`}>
                  {Object.entries(valoresPorDefecto).map(([key, def]) => (
                    <option key={key} value={def.concepto} />
                  ))}
                </datalist>
              </div>

              {/* Venta */}
              <div>
                <label className="block text-sm font-medium">Venta</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="input mt-1"
                  value={v.montoVenta}
                  onChange={(e) =>
                    actualizarValor(
                      v.id,
                      "montoVenta",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              {/* Costo */}
              <div>
                <label className="block text-sm font-medium">Costo</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="input mt-1"
                  value={v.montoCosto}
                  onChange={(e) =>
                    actualizarValor(
                      v.id,
                      "montoCosto",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              {/* Eliminar */}
              <div className="flex items-end">
                <button
                  onClick={() => eliminarValor(v.id)}
                  className="text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {/* Descuentos por valor */}
            <div>
              <h3 className="font-medium mb-2">Descuentos de este valor</h3>
              {(descPorValor[v.id] || []).map((d) => (
                <div key={d.id} className="flex gap-2 items-center mb-2">
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1.0}
                      className="input w-20 pr-6 mt-1"
                      value={d.porcentaje}
                      onChange={(e) =>
                        actualizarDescValor(
                          v.id,
                          d.id,
                          "porcentaje",
                          e.target.value
                        )
                      }
                    />
                    <span className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                  <input
                    type="text"
                    className="input flex-1 mt-1"
                    placeholder="Razón"
                    value={d.razon}
                    onChange={(e) =>
                      actualizarDescValor(v.id, d.id, "razon", e.target.value)
                    }
                  />
                  <button
                    onClick={() => eliminarDescValor(v.id, d.id)}
                    className="text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => agregarDescValor(v.id)}
                className="btn-secondary text-sm"
              >
                + Añadir descuento
              </button>
            </div>

            <div className="text-right font-semibold">
              Valor: {formatCLP(calcItem(v))}
            </div>
          </div>
        ))}
      </section>

      {/* Descuentos totales */}
      <section className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-semibold">Descuentos al total de servicio</h2>
        {descTotal.map((d) => (
          <div key={d.id} className="flex gap-2 items-center mb-2">
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                className="input w-20 pr-6 mt-1"
                value={d.porcentaje}
                onChange={(e) =>
                  actualizarDescTotal(
                    d.id,
                    "porcentaje",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
              <span className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500">
                %
              </span>
            </div>
            <input
              type="text"
              className="input flex-1 mt-1"
              placeholder="Razón"
              value={d.razon}
              onChange={(e) =>
                actualizarDescTotal(d.id, "razon", e.target.value)
              }
            />
            <button
              onClick={() => eliminarDescTotal(d.id)}
              className="text-red-600 mt-1"
            >
              ×
            </button>
          </div>
        ))}
        <button onClick={agregarDescTotal} className="btn-secondary text-sm">
          + Añadir descuento al total
        </button>
      </section>

      {/* Resumen Detallado */}
      <section className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="font-semibold text-lg">Resumen Detallado</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <p className="font-medium">Venta total:</p>
            <p>{formatCLP(totalVenta)}</p>
          </div>
          <div>
            <p className="font-medium">Costo total:</p>
            <p>{formatCLP(totalCosto)}</p>
          </div>
          <div>
            <p className="font-medium">Subtotal bruto:</p>
            <p>{formatCLP(subtotalBruto)}</p>
          </div>
          <div>
            <p className="font-medium">Descuento por valor:</p>
            <p>-{formatCLP(descuentoPorValorTotal)}</p>
          </div>
          <div>
            <p className="font-medium">
              Subtotal neto (antes descuentos generales):
            </p>
            <p>{formatCLP(calcSubtotal())}</p>
          </div>
          <div>
            <p className="font-medium">Descuento general:</p>
            <p>-{formatCLP(calcSubtotal() - calcTotal())}</p>
          </div>
          <div>
            <p className="font-medium">Total final:</p>
            <p className="font-bold">{formatCLP(calcTotal())}</p>
          </div>
        </div>
      </section>

      {/* Acciones */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleGuardar}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Guardar
        </button>
        {!isOperacion && (
          <button
            onClick={handleEnviar}
            disabled={valores.length === 0}
            className={`px-4 py-2 rounded ${
              valores.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white"
            }`}
          >
            Enviar
          </button>
        )}
      </div>
    </div>
  );
};

export default AgregarValoresServicio;
