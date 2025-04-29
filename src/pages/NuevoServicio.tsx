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

// mock data
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

// claves en localStorage
const STORAGE = {
  enviados: "serviciosEnviados",
  borradores: "serviciosBorradores",
  ultimoId: "ultimoIdServicio",
};

// Genera un ID autoincremental guardado en localStorage
function getNextId(): number {
  const last = parseInt(localStorage.getItem(STORAGE.ultimoId) || "0", 10);
  const next = last + 1;
  localStorage.setItem(STORAGE.ultimoId, next.toString());
  return next;
}

const NuevoServicio: React.FC = () => {
  const { id: paramId } = useParams<{ id?: string }>();
  const nav = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const [idService, setIdService] = useState<number | null>(null);
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [centros, setCentros] = useState<Centro[]>([]);
  const [form, setForm] = useState({
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

  // cargar mocks y, si hay id, cargar datos existentes
  useEffect(() => {
    setCatalogos(mockCatalogos);
    setCentros(mockCentros);

    if (paramId) {
      const svcId = parseInt(paramId, 10);
      if (!isNaN(svcId)) {
        const enviados = JSON.parse(
          localStorage.getItem(STORAGE.enviados) || "[]"
        );
        const borradores = JSON.parse(
          localStorage.getItem(STORAGE.borradores) || "[]"
        );
        const found =
          enviados.find((s: any) => s.id === svcId) ||
          borradores.find((s: any) => s.id === svcId);
        if (found) {
          setIdService(svcId);
          setForm(found.form);
          setPuntos(found.puntos || []);
        }
      }
    }
  }, [paramId]);

  const upd =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val =
        e.target.type === "number" || typeof form[k] === "number"
          ? Number(e.target.value)
          : e.target.value;
      setForm({ ...form, [k]: val });
    };

  const opt = (arr?: Item[]) =>
    arr?.map((i) => (
      <option key={i.codigo} value={i.codigo}>
        {i.nombre}
      </option>
    ));

  const centrosFiltrados = centros.filter((c) => c.cliente === form.cliente);
  const origenOptions: Item[] =
    form.tipoOperacion === 2
      ? catalogos?.Zona_portuaria || []
      : form.tipoOperacion === 1
      ? centrosFiltrados
      : [];
  const destinoOptions: Item[] =
    form.tipoOperacion === 1
      ? catalogos?.Zona_portuaria || []
      : form.tipoOperacion === 2
      ? centrosFiltrados
      : [];

  const addPunto = () =>
    setPuntos([...puntos, { idLugar: 0, accion: 0, estado: 1, eta: "" }]);
  const updatePunto = (
    idx: number,
    key: "idLugar" | "accion" | "eta",
    value: number | string
  ) =>
    setPuntos(
      puntos.map((p, i) => (i === idx ? { ...p, [key]: value } : p))
    );
  const removePunto = (idx: number) =>
    setPuntos(puntos.filter((_, i) => i !== idx));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, documentoPorContenedor: `/uploads/${file.name}` });
    }
  };

  // Enviar (crear o actualizar) y marcar como enviados
  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current?.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }

    const newId = idService ?? getNextId();
    const payload = {
      id: newId,
      form,
      puntos,
      enviado: true,
    };

    // actualizar storage de enviados
    const enviados = JSON.parse(
      localStorage.getItem(STORAGE.enviados) || "[]"
    );
    const idxEnv = enviados.findIndex((s: any) => s.id === newId);
    if (idxEnv >= 0) {
      enviados[idxEnv] = payload;
    } else {
      enviados.push(payload);
    }
    localStorage.setItem(STORAGE.enviados, JSON.stringify(enviados));

    // eliminar si existía en borradores
    const borradores = JSON.parse(
      localStorage.getItem(STORAGE.borradores) || "[]"
    );
    const filtrados = borradores.filter((s: any) => s.id !== newId);
    localStorage.setItem(STORAGE.borradores, JSON.stringify(filtrados));

    alert(`Servicio ${newId} enviado correctamente.`);
    nav("/comercial/ingresoServicios");
  };

  // Guardar borrador (sin validar required)
  const handleGuardar = () => {
    const newId = idService ?? getNextId();
    const payload = { id: newId, form, puntos };
    const borradores = JSON.parse(
      localStorage.getItem(STORAGE.borradores) || "[]"
    );
    const idxBor = borradores.findIndex((s: any) => s.id === newId);
    if (idxBor >= 0) {
      borradores[idxBor] = payload;
    } else {
      borradores.push(payload);
    }
    localStorage.setItem(STORAGE.borradores, JSON.stringify(borradores));
    alert(`Borrador guardado con ID ${newId}.`);
    nav("/comercial/ingresoServicios");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        {idService ? "Modificar Servicio" : "Nuevo Servicio"}
      </h1>
      <p className="mb-4 text-sm text-gray-600">* Campos obligatorios</p>

      <form
        ref={formRef}
        onSubmit={handleEnviar}
        className="space-y-6 bg-white p-6 shadow rounded"
      >
        {/* Cliente y Operación */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Cliente *</label>
            <select
              className="input"
              value={form.cliente}
              onChange={upd("cliente")}
              required
            >
              <option value={0}>—</option>
              {opt(catalogos?.empresas)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Tipo de operación *
            </label>
            <select
              className="input"
              value={form.tipoOperacion}
              onChange={upd("tipoOperacion")}
              required
            >
              <option value={0}>—</option>
              {opt(catalogos?.Operación)}
            </select>
          </div>
        </div>

        {/* Origen y Destino */}
        {form.cliente > 0 && form.tipoOperacion > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Origen *</label>
              <select
                className="input"
                value={form.origen}
                onChange={upd("origen")}
                required
              >
                <option value={0}>—</option>
                {opt(origenOptions)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Destino *</label>
              <select
                className="input"
                value={form.destino}
                onChange={upd("destino")}
                required
              >
                <option value={0}>—</option>
                {opt(destinoOptions)}
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
                <input
                  className="input"
                  value={form.odv}
                  onChange={upd("odv")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">País *</label>
                <select
                  className="input"
                  value={form.pais}
                  onChange={upd("pais")}
                  required
                >
                  <option value={0}>—</option>
                  {opt(mockPaises)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Fecha de servicio *
                </label>
                <input
                  type="date"
                  className="input"
                  value={form.fechaSol}
                  onChange={upd("fechaSol")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Tipo de contenedor *
                </label>
                <select
                  className="input"
                  value={form.tipoContenedor}
                  onChange={upd("tipoContenedor")}
                  required
                >
                  <option value={0}>—</option>
                  {opt(catalogos?.Tipo_contenedor)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Kilos *</label>
                <input
                  type="number"
                  className="input"
                  value={form.kilos}
                  onChange={upd("kilos")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Precio de Carga *
                </label>
                <input
                  type="number"
                  className="input"
                  value={form.precioCarga}
                  onChange={upd("precioCarga")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Temperatura *
                </label>
                <input
                  type="number"
                  className="input"
                  value={form.temperatura}
                  onChange={upd("temperatura")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Guía</label>
                <input
                  className="input"
                  value={form.guia}
                  onChange={upd("guia")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Tarjetón</label>
                <input
                  className="input"
                  value={form.tarjeton}
                  onChange={upd("tarjeton")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Máquina</label>
                <input
                  className="input"
                  value={form.maquina}
                  onChange={upd("maquina")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Sello</label>
                <input
                  className="input"
                  value={form.sello}
                  onChange={upd("sello")}
                />
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
                <input
                  className="input"
                  value={form.interchange}
                  onChange={upd("interchange")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Documento por Contenedor
                </label>
                <input type="file" onChange={handleFileChange} />
              </div>
            </div>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Puntos del recorrido</h2>
              {puntos.map((p, idx) => (
                <div
                  key={idx}
                  className="grid md:grid-cols-4 gap-2 items-center"
                >
                  <select
                    className="input"
                    value={p.idLugar}
                    onChange={(e) =>
                      updatePunto(idx, "idLugar", +e.target.value)
                    }
                  >
                    <option value={0}>Lugar</option>
                    {opt(destinoOptions)}
                  </select>
                  <select
                    className="input"
                    value={p.accion}
                    onChange={(e) =>
                      updatePunto(idx, "accion", +e.target.value)
                    }
                  >
                    <option value={0}>Acción</option>
                    {opt(catalogos?.acciones)}
                  </select>
                  <input
                    type="datetime-local"
                    className="input"
                    placeholder="Hora estimada de llegada"
                    value={p.eta}
                    onChange={(e) =>
                      updatePunto(idx, "eta", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removePunto(idx)}
                    className="px-2 py-1 bg-red-600 text-white rounded"
                  >
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
            Enviar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            className="btn-secondary"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => nav(-1)}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoServicio;
