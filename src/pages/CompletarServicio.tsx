import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Item {
  codigo: number;
  nombre: string;
}
interface Catalogos {
  Operación: Item[];
  Zona: Item[];
  Zona_portuaria: Item[];
  Tipo_contenedor: Item[];
  acciones: Item[];
  empresas: Item[];
}
interface Centro {
  codigo: number;
  nombre: string;
  cliente: number;
}
type Punto = {
  idLugar: number;
  accion: number;
  estado: number;
  eta: string;
};

const mockCatalogos: Catalogos = {
  Operación: [
    { codigo: 1, nombre: "EXPORTACIÓN" },
    { codigo: 2, nombre: "IMPORTACIÓN" },
    { codigo: 3, nombre: "NACIONAL" },
    { codigo: 4, nombre: "TRENADA" },
    { codigo: 5, nombre: "REUTILIZACIÓN" },
    { codigo: 6, nombre: "RETORNO" },
    { codigo: 7, nombre: "LOCAL" },
  ],
  Zona: [
    { codigo: 1, nombre: "SUR" },
    { codigo: 2, nombre: "CENTRO" },
    { codigo: 3, nombre: "NORTE" },
  ],
  Zona_portuaria: [
    { codigo: 1, nombre: "SAI" },
    { codigo: 2, nombre: "VAP" },
    { codigo: 3, nombre: "CNL" },
    { codigo: 4, nombre: "LQN" },
    { codigo: 5, nombre: "SVE" },
    { codigo: 6, nombre: "SCL" },
  ],
  Tipo_contenedor: [
    { codigo: 1, nombre: "20 DV" },
    { codigo: 2, nombre: "20 FR" },
    { codigo: 3, nombre: "20 OT" },
    { codigo: 4, nombre: "20 RF" },
    { codigo: 5, nombre: "40 DV" },
    { codigo: 6, nombre: "40 FR" },
    { codigo: 7, nombre: "40 HC" },
    { codigo: 8, nombre: "40 NOR" },
    { codigo: 9, nombre: "40 OT" },
    { codigo: 10, nombre: "40 RF" },
    { codigo: 11, nombre: "LCL / MAQUINARIA" },
  ],
  acciones: [
    { codigo: 1, nombre: "retirar container vacío" },
    { codigo: 2, nombre: "retirar container cargado" },
    { codigo: 3, nombre: "dejar container vacío" },
    { codigo: 4, nombre: "dejar container cargado" },
    { codigo: 5, nombre: "almacenar contenido" },
    { codigo: 6, nombre: "llenar container" },
    { codigo: 7, nombre: "vaciar container" },
  ],
  empresas: [
    { codigo: 1, nombre: "Perrot1" },
    { codigo: 2, nombre: "Perrot2" },
  ],
};

const mockCentros: Centro[] = [
  { codigo: 1, nombre: "Centro A", cliente: 1 },
  { codigo: 2, nombre: "Centro B", cliente: 1 },
  { codigo: 3, nombre: "Centro C", cliente: 2 },
  { codigo: 4, nombre: "Centro D", cliente: 2 },
];

const mockPaises: Item[] = [
  { codigo: 1, nombre: "Chile" },
  { codigo: 2, nombre: "Argentina" },
  { codigo: 3, nombre: "Perú" },
];

const STORAGE = {
  enviados: "serviciosEnviados",
  borradores: "serviciosBorradores",
};

interface Payload {
  id: number;
  form: any;
  puntos: Punto[];
  enviado?: boolean;
}

const ModificarServicio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState<any>({
    cliente: 0,
    tipoOperacion: 0,
    origen: 0,
    destino: 0,
    pais: 0,
    fechaSol: "",
    tipoContenedor: 0,
    zonaPortuaria: 0,
    kilos: 0,
    precioCarga: 0,
    temperatura: 0,
    idCCosto: 0,
    guia: "",
    tarjeton: "",
    maquina: "",
    sello: "",
    nave: 0,
    observacion: "",
    interchange: "",
    rcNoDevolucion: 0,
    odv: "",
    documentoPorContenedor: "",
  });
  const [puntos, setPuntos] = useState<Punto[]>([]);

  useEffect(() => {
    // cargar todos los guardados
    const arr: Payload[] = [
      ...JSON.parse(localStorage.getItem(STORAGE.enviados) || "[]"),
      ...JSON.parse(localStorage.getItem(STORAGE.borradores) || "[]"),
    ];
    const payload = arr.find(p => p.id.toString() === id);
    if (!payload) {
      alert("Servicio no encontrado");
      navigate(-1);
      return;
    }
    setForm(payload.form);
    setPuntos(payload.puntos);
  }, [id, navigate]);

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [k]: val });
  };

  const opt = (arr: Item[]) =>
    arr.map(i => (
      <option key={i.codigo} value={i.codigo}>
        {i.nombre}
      </option>
    ));

  const centrosFiltrados = mockCentros.filter(c => c.cliente === form.cliente);
  const origenOptions = form.tipoOperacion === 2 ? mockCatalogos.Zona_portuaria : form.tipoOperacion === 1 ? centrosFiltrados : [];
  const destinoOptions = form.tipoOperacion === 1 ? mockCatalogos.Zona_portuaria : form.tipoOperacion === 2 ? centrosFiltrados : [];

  const addPunto = () =>
    setPuntos([...puntos, { idLugar: 0, accion: 0, estado: 1, eta: "" }]);
  const updatePunto = (idx: number, key: keyof Punto, val: any) =>
    setPuntos(puntos.map((p, i) => (i === idx ? { ...p, [key]: val } : p)));
  const removePunto = (idx: number) => setPuntos(puntos.filter((_, i) => i !== idx));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setForm({ ...form, documentoPorContenedor: `/uploads/${f.name}` });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current?.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }
    const updateStorage = (key: keyof typeof STORAGE) => {
      const list: Payload[] = JSON.parse(localStorage.getItem(STORAGE[key]) || "[]");
      const idx = list.findIndex(p => p.id.toString() === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], form, puntos };
        localStorage.setItem(STORAGE[key], JSON.stringify(list));
      }
    };
    updateStorage("enviados");
    updateStorage("borradores");
    alert("Servicio actualizado");
    navigate("/comercial/ingresoServicios");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Completar servicio #{id}</h1>
      <form ref={formRef} onSubmit={handleUpdate} className="space-y-6 bg-white p-6 shadow rounded">
        {/* Cliente y Operación */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Cliente *</label>
            <select className="input" value={form.cliente} onChange={upd("cliente")} >
              <option value={0}>—</option>
              {opt(mockCatalogos.empresas)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Tipo de operación *</label>
            <select className="input" value={form.tipoOperacion} onChange={upd("tipoOperacion")} >
              <option value={0}>—</option>
              {opt(mockCatalogos.Operación)}
            </select>
          </div>
        </div>

        {/* Origen / Destino */}
        {form.cliente > 0 && form.tipoOperacion > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Origen *</label>
              <select className="input" value={form.origen} onChange={upd("origen")} >
                <option value={0}>—</option>
                {opt(origenOptions as Item[])}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Destino *</label>
              <select className="input" value={form.destino} onChange={upd("destino")} >
                <option value={0}>—</option>
                {opt(destinoOptions as Item[])}
              </select>
            </div>
          </div>
        )}

        {/* Resto de campos */}
        {form.cliente > 0 && form.tipoOperacion > 0 && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">ODV *</label>
                <input className="input" value={form.odv} onChange={upd("odv")}  />
              </div>
              <div>
                <label className="block text-sm font-medium">País *</label>
                <select className="input" value={form.pais} onChange={upd("pais")} >
                  <option value={0}>—</option>
                  {opt(mockPaises)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Fecha de servicio *</label>
                <input type="date" className="input" value={form.fechaSol} onChange={upd("fechaSol")}  />
              </div>
              <div>
                <label className="block text-sm font-medium">Tipo de contenedor *</label>
                <select className="input" value={form.tipoContenedor} onChange={upd("tipoContenedor")} >
                  <option value={0}>—</option>
                  {opt(mockCatalogos.Tipo_contenedor)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Kilos *</label>
                <input type="number" className="input" value={form.kilos} onChange={upd("kilos")}  />
              </div>
              <div>
                <label className="block text-sm font-medium">Precio de Carga *</label>
                <input type="number" className="input" value={form.precioCarga} onChange={upd("precioCarga")}  />
              </div>
              <div>
                <label className="block text-sm font-medium">Temperatura *</label>
                <input type="number" className="input" value={form.temperatura} onChange={upd("temperatura")}  />
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
                <label className="block text-sm font-medium">Nave *</label>
                <input type="number" className="input" value={form.nave} onChange={upd("nave")}  />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Observación</label>
                <textarea className="input w-full h-24" value={form.observacion} onChange={upd("observacion")} />
              </div>
              <div>
                <label className="block text-sm font-medium">Interchange</label>
                <input className="input" value={form.interchange} onChange={upd("interchange")} />
              </div>
              <div>
                <label className="block text-sm font-medium">RC No Devolución *</label>
                <input type="number" className="input" value={form.rcNoDevolucion} onChange={upd("rcNoDevolucion")}  />
              </div>
              <div>
                <label className="block text-sm font-medium">Documento por Contenedor</label>
                <input type="file" onChange={handleFileChange} />
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Puntos del recorrido</h2>
              {puntos.map((p, idx) => (
                <div key={idx} className="grid md:grid-cols-4 gap-2 items-center">
                  <select className="input" value={p.idLugar} onChange={e => updatePunto(idx, "idLugar", +e.target.value)}>
                    <option value={0}>Lugar</option>
                    {opt(destinoOptions as Item[])}
                  </select>
                  <select className="input" value={p.accion} onChange={e => updatePunto(idx, "accion", +e.target.value)}>
                    <option value={0}>Acción</option>
                    {opt(mockCatalogos.acciones)}
                  </select>
                  <input
                    type="datetime-local"
                    className="input"
                    placeholder="Hora estimada de llegada"
                    value={p.eta}
                    onChange={e => updatePunto(idx, "eta", e.target.value)}
                    
                  />
                  <button type="button" onClick={() => removePunto(idx)} className="px-2 py-1 bg-red-600 text-white rounded">
                    X
                  </button>
                </div>
              ))}
              <button type="button" onClick={addPunto} className="btn-primary">
                Añadir punto
              </button>
            </section>
          </>
        )}

        <div className="flex gap-4">
          <button type="submit" className="btn-primary">
            Actualizar
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModificarServicio;
