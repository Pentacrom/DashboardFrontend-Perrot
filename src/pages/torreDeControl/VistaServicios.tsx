// src/pages/VistaServicios.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListWithSearch, {
  Column,
  SearchFilter,
  DropdownOption,
  DropdownOptionsType,
} from "../../components/ListWithSearch";
import {
  loadDrafts,
  loadSent,
  Payload,
  mockCatalogos,
} from "../../utils/ServiceDrafts";
import { estadoStyles, badgeTextColor } from "../../config/estadoConfig";

interface ServiceRow {
  id: string;
  cliente: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
  estado: string;
  raw: Payload;
}

const columns: Column<ServiceRow>[] = [
  { label: "ID", key: "id", sortable: true },
  { label: "Cliente", key: "cliente", sortable: true },
  { label: "Origen", key: "origen", sortable: true },
  { label: "Destino", key: "destino", sortable: true },
  { label: "Fecha", key: "fecha", sortable: true },
  { label: "Tipo", key: "tipo", sortable: true },
  {
    label: "Estado",
    key: "estado",
    sortable: true,
  },
];

const searchFilters: SearchFilter<ServiceRow>[] = [
  { label: "ID", key: "id", type: "text", placeholder: "Buscar ID" },
  {
    label: "Cliente",
    key: "cliente",
    type: "text",
    placeholder: "Buscar cliente",
  },
  { label: "Fecha Desde", key: "fecha", type: "date", comparator: "gte" },
  { label: "Fecha Hasta", key: "fecha", type: "date", comparator: "lte" },
];

const VistaServicios: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ServiceRow[]>([]);

  useEffect(() => {
    const lookup = (arr: { codigo: number; nombre: string }[], code: number) =>
      arr.find((x) => x.codigo === code)?.nombre || code.toString();

    const drafts = loadDrafts();
    const sent = loadSent();
    // Mostrar solo los servicios "En Proceso"
    const inProcess = [...drafts, ...sent].filter(
      (p) => p.estado === "En Proceso"
    );

    const mapped: ServiceRow[] = inProcess.map((p) => {
      const f = p.form;
      const tipoOp = f.tipoOperacion;
      const clienteName = lookup(mockCatalogos.empresas, f.cliente);
      const origenName =
        tipoOp === 2
          ? lookup(mockCatalogos.Zona_portuaria, f.origen)
          : lookup(mockCatalogos.Zona, f.origen);
      const destinoName =
        tipoOp === 1
          ? lookup(mockCatalogos.Zona_portuaria, f.destino)
          : lookup(mockCatalogos.Zona, f.destino);
      const tipoName = lookup(mockCatalogos.Operación, tipoOp);
      return {
        id: p.id.toString(),
        cliente: clienteName,
        origen: origenName,
        destino: destinoName,
        fecha: f.fechaSol,
        tipo: tipoName,
        estado: p.estado,
        raw: p,
      };
    });

    setRows(mapped);
  }, []);

  const dropdownOptions = (row: ServiceRow): DropdownOption<ServiceRow>[] => [
    {
      label: "Ver detalle",
      onClick: () => navigate(`/detalle-servicio/${row.id}`),
    },
    {
      label: "Hacer seguimiento",
      onClick: () =>
        navigate(`/torre-de-control/seguimiento-servicio/${row.id}`),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Servicios en Proceso</h1>
      </div>

      <ListWithSearch<ServiceRow>
        data={rows}
        columns={columns}
        searchFilters={searchFilters}
        dropdownOptions={dropdownOptions as DropdownOptionsType<ServiceRow>}
        colorConfig={{
          field: "estado",
          bgMapping: estadoStyles,
          textMapping: badgeTextColor,
          mode: "row",
        }}
        onDownloadExcel={() => alert("Descarga de Excel (stub)")}
        onSearch={() => alert("Buscar (stub)")}
      />
    </div>
  );
};

export default VistaServicios;
