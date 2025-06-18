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
  EstadoServicio,
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
    render: (value: string) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          estadoStyles[value as EstadoServicio] || ""
        } ${badgeTextColor[value as EstadoServicio] || ""}`}
      >
        {value}
      </span>
    ),
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
    // lookup genéricos
    const lookup = (arr: { codigo: number; nombre: string }[], code: number) =>
      arr.find((x) => x.codigo === code)?.nombre || code.toString();
    const lookupLugar = (arr: { id: number; nombre: string }[], id: number) =>
      arr.find((x) => x.id === id)?.nombre || id.toString();

    const drafts = loadDrafts();
    const sent = loadSent();

    const mapped: ServiceRow[] = sent.map((p) => {
      const f = p.form;
      const tipoOp = f.tipoOperacion;
      const clienteName = lookup(mockCatalogos.empresas, f.cliente);
      const origenName = lookupLugar(mockCatalogos.Lugares, f.origen);
      const destinoName = lookupLugar(mockCatalogos.Lugares, f.destino);
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

  const dropdownOptions = (row: ServiceRow): DropdownOption<ServiceRow>[] => {
    const opts: DropdownOption<ServiceRow>[] = [
      {
        label: "Ver detalle",
        onClick: () => navigate(`/detalle-servicio/${row.id}`),
      },
    ];
    if (row.estado === "En Proceso") {
      opts.push({
        label: "Hacer seguimiento",
        onClick: () =>
          navigate(`/torre-de-control/seguimiento-servicio/${row.id}`),
      });
    }
    return opts;
  };

  const estadoCheckboxFilter = [
    {
      label: "Filtrar por estado",
      key: "estado" as keyof ServiceRow,
      options: Object.keys(estadoStyles) as EstadoServicio[],
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
        checkboxFilterGroups={estadoCheckboxFilter}
        defaultCheckboxSelections={{
          estado: ["Sin Asignar", "En Proceso"],
        }}
        dropdownOptions={dropdownOptions as DropdownOptionsType<ServiceRow>}
        colorConfig={{
          field: "estado",
          bgMapping: estadoStyles,
          textMapping: badgeTextColor,
          mode: "row",
        }}
        onDownloadExcel={() => alert("Descarga de Excel (stub)")}
        onSearch={() => alert("Buscar (stub)")}
        customSortOrder={{
          estado: [
            "En Proceso",
            "Pendiente",
            "Sin Asignar",
            "Falso Flete",
            "Por facturar",
            "Completado",
          ],
        }}
        defaultSortKey="estado"
        defaultSortOrder="asc"
        preferencesKey="torre"
      />
    </div>
  );
};

export default VistaServicios;
