import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Item {
  codigo: number;
  nombre: string;
}
interface Catalogos {
  Operación: Item[];
  Tipo_contenedor: Item[];
  Lugares: Item[];
  acciones: Item[];
}
type Punto = {
  idLugar: number;
  accion: number;
  estado: number;
};

const NuevoServicio: React.FC = () => {
  const nav = useNavigate();
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    origen: "",
    fechaSol: "",
    tipoOperacion: 0,
    tipoContenedor: 0,
    zonaPortuaria: 0,
    kilos: 0,
    precioCarga: 0,
    temperatura: 0,
    idCCosto: 0,
    direccionEntrega: "",
    guia: "",
    tarjeton: "",
    maquina: "",
    sello: "",
    pais: 0,
    nave: 0,
    observacion: "",
    interchange: "",
    rcNoDevolucion: 0,
    odv: "",
    documentoPorContenedor: "",
  });

  const [puntos, setPuntos] = useState<Punto[]>([]);

  const opt = (arr?: Item[]) =>
    arr?.map((i) => (
      <option key={i.codigo} value={i.codigo}>
        {i.nombre}
      </option>
    ));

  const upd =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({
        ...form,
        [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value,
      });

  useEffect(() => {
    fetch("/api/Tablas/Get-ingreso-servicio")
      .then((r) => r.json())
      .then(setCatalogos)
      .catch(() => console.warn("Catálogos no disponibles"));
  }, []);

  const addPunto = () =>
    setPuntos([...puntos, { idLugar: 0, accion: 0, estado: 1 }]);
  const updatePunto = (idx: number, key: "idLugar" | "accion", value: number) =>
    setPuntos(puntos.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
  const removePunto = (idx: number) =>
    setPuntos(puntos.filter((_, i) => i !== idx));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentoFile(file);
      setForm({ ...form, documentoPorContenedor: `/uploads/${file.name}` });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Nuevo Servicio</h1>
      <p className="mb-4 text-sm text-gray-600">* Campos obligatorios</p>
      {error && <p className="mb-4 p-2 bg-red-100 text-red-800">{error}</p>}

      <form className="space-y-6 bg-white p-6 shadow rounded">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Origen *</label>
            <select className="input" value={form.origen} onChange={upd("origen")} required>
              <option value={0}>—</option>
              {opt(catalogos?.Lugares)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha de servicio *</label>
            <input type="date" className="input" value={form.fechaSol} onChange={upd("fechaSol")} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Tipo de operación *</label>
            <select className="input" value={form.tipoOperacion} onChange={upd("tipoOperacion")} required>
              <option value={0}>—</option>
              {opt(catalogos?.Operación)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Tipo de contenedor *</label>
            <select className="input" value={form.tipoContenedor} onChange={upd("tipoContenedor")} required>
              <option value={0}>—</option>
              {opt(catalogos?.Tipo_contenedor)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Zona Portuaria *</label>
            <select className="input" value={form.zonaPortuaria} onChange={upd("zonaPortuaria")} required>
              <option value={0}>—</option>
              {opt(catalogos?.Lugares)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Kilos *</label>
            <input type="number" className="input" value={form.kilos} onChange={upd("kilos")} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Precio de Carga *</label>
            <input type="number" className="input" value={form.precioCarga} onChange={upd("precioCarga")} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Temperatura *</label>
            <input type="number" className="input" value={form.temperatura} onChange={upd("temperatura")} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Centro de Costo *</label>
            <input type="number" className="input" value={form.idCCosto} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium">Dirección *</label>
            <input className="input" value={form.direccionEntrega} onChange={upd("direccionEntrega")} required placeholder="Autocomplete simulado" />
          </div>
          <div>
            <label className="block text-sm font-medium">Guía</label>
            <input className="input" value={form.guia} onChange={upd("guia")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Tarjetón</label>
            <input className="input" value={form.tarjeton} onChange={upd("tarjeton")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Máquina</label>
            <input className="input" value={form.maquina} onChange={upd("maquina")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Sello</label>
            <input className="input" value={form.sello} onChange={upd("sello")} />
          </div>
          <div>
            <label className="block text-sm font-medium">País *</label>
            <input type="number" className="input" value={form.pais} onChange={upd("pais")} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Nave *</label>
            <input type="number" className="input" value={form.nave} onChange={upd("nave")} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Observación</label>
            <textarea
              className="input w-full h-24"
              value={form.observacion}
              onChange={upd("observacion")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Interchange</label>
            <input className="input" value={form.interchange} onChange={upd("interchange")} />
          </div>
          <div>
            <label className="block text-sm font-medium">RC No Devolución *</label>
            <input
              type="number"
              className="input"
              value={form.rcNoDevolucion}
              onChange={upd("rcNoDevolucion")}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">ODV *</label>
            <input className="input" value={form.odv} onChange={upd("odv")} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Documento por Contenedor</label>
            <input type="file" onChange={handleFileChange} />
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Puntos del recorrido</h2>
          {puntos.map((p, idx) => (
            <div key={idx} className="grid md:grid-cols-3 gap-2 items-center">
              <select
                className="input"
                value={p.idLugar}
                onChange={(e) => updatePunto(idx, "idLugar", +e.target.value)}
              >
                <option value={0}>Lugar</option>
                {opt(catalogos?.Lugares)}
              </select>
              <select
                className="input"
                value={p.accion}
                onChange={(e) => updatePunto(idx, "accion", +e.target.value)}
              >
                <option value={0}>Acción</option>
                {opt(catalogos?.acciones)}
                <option value={6}>Dejar carga del container</option>
              </select>
              <button type="button" onClick={() => removePunto(idx)} className="px-2 py-1 bg-red-600 text-white rounded">
                X
              </button>
            </div>
          ))}
          <button type="button" onClick={addPunto} className="btn-primary">
            Añadir punto
          </button>
        </section>
        <div className="flex gap-4">
          <button type="submit" className="btn-primary" disabled>
            Guardar (solo frontend)
          </button>
          <button type="button" onClick={() => nav(-1)} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoServicio;
