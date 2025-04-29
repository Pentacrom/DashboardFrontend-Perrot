import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListWithSearch, {
  Column,
  DropdownOption,
  SearchFilter,
} from "../../components/ListWithSearch";

interface Punto {
  idLugar: number;
  accion: number;
  estado: number;
  eta: string;
}

interface Payload {
  id: number;
  form: {
    cliente: number;
    tipoOperacion: number;
    origen: number;
    destino: number;
    pais: number;
    fechaSol: string;
    tipoContenedor: number;
    zonaPortuaria: number;
    kilos: number;
    precioCarga: number;
    temperatura: number;
    idCCosto: number;
    guia: string;
    tarjeton: string;
    maquina: string;
    sello: string;
    nave: number;
    observacion: string;
    interchange: string;
    rcNoDevolucion: number;
    odv: string;
    documentoPorContenedor: string;
  };
  puntos: Punto[];
  enviado?: boolean;
}

interface ServiceRow {
  id: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
  raw: Payload;
}

interface CatalogoItem { codigo: number; nombre: string; }
interface DatosCatalogo {
  Operación: CatalogoItem[];
  Zona: CatalogoItem[];
  Zona_portuaria: CatalogoItem[];
  Tipo_contenedor: CatalogoItem[];
}

const mockCatalogos: DatosCatalogo = {
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
};

const columns: Column<ServiceRow>[] = [
  { label: "ID", key: "id", sortable: true },
  { label: "Origen", key: "origen", sortable: true },
  { label: "Destino", key: "destino", sortable: true },
  { label: "Fecha", key: "fecha", sortable: true },
  { label: "Tipo", key: "tipo", sortable: true },
];

const searchFilters: SearchFilter<ServiceRow>[] = [
  { label: "ID", key: "id", type: "text", placeholder: "Buscar ID" },
  { label: "Origen", key: "origen", type: "text", placeholder: "Buscar origen" },
  { label: "Destino", key: "destino", type: "text", placeholder: "Buscar destino" },
];

const STORAGE = {
  borradores: "serviciosBorradores",
  legacyBorrador: "nuevoServicioBorrador",
};

const IngresoServicio: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ServiceRow[]>([]);

  useEffect(() => {
    const lookup = (arr: CatalogoItem[], code: number) =>
      arr.find(x => x.codigo === code)?.nombre || code.toString();

    const loadList = () =>
      JSON.parse(localStorage.getItem(STORAGE.borradores) || "[]") as Payload[];

    // solo borradores (+ legacy)
    const payloads: Payload[] = [
      ...loadList(),
      ...(localStorage.getItem(STORAGE.legacyBorrador)
        ? [JSON.parse(localStorage.getItem(STORAGE.legacyBorrador)!)]
        : []),
    ];

    const mapped = payloads.map(p => {
      const f = p.form;
      const tipoOp = f.tipoOperacion;
      const origenName =
        tipoOp === 2
          ? lookup(mockCatalogos.Zona_portuaria, f.origen)
          : lookup(mockCatalogos.Zona, f.origen);
      const destinoName =
        tipoOp === 1
          ? lookup(mockCatalogos.Zona_portuaria, f.destino)
          : lookup(mockCatalogos.Zona, f.destino);
      return {
        id: p.id.toString(),
        origen: origenName,
        destino: destinoName,
        fecha: f.fechaSol,
        tipo: lookup(mockCatalogos.Operación, tipoOp),
        raw: p,
      };
    });

    setRows(mapped);
  }, []);

  const handleDelete = (id: string) => {
    if (!window.confirm(`¿Eliminar borrador ${id}?`)) return;
    setRows(r => r.filter(x => x.id !== id));

    // eliminar del storage
    const list = JSON.parse(localStorage.getItem(STORAGE.borradores) || "[]") as Payload[];
    localStorage.setItem(
      STORAGE.borradores,
      JSON.stringify(list.filter(p => p.id.toString() !== id))
    );
  };

  const dropdownOptions = (): DropdownOption<ServiceRow>[] => [
    {
      label: "Completar servicio",
      onClick: row =>
        navigate(`/comercial/modificar-servicio/${row.id}`),
    },
    {
      label: "Eliminar borrador",
      onClick: row => handleDelete(row.id),
    },
  ];

  return (
    <div className="p-6">
      <ListWithSearch<ServiceRow>
        data={rows}
        columns={columns}
        searchFilters={searchFilters}
        checkboxFilterGroups={[]}
        dropdownOptions={dropdownOptions}
        tableTitle="Borradores de Servicio"
        filterTitle="Buscar borrador"
        globalButtons={
          <Link
            to="/comercial/nuevo-servicio"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Nuevo Servicio
          </Link>
        }
        onDownloadExcel={() => alert("Descarga de Excel (stub)")}
        onSearch={() => alert("Buscar (stub)")}
      />
    </div>
  );
};

export default IngresoServicio;
