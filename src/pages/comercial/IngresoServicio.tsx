// src/pages/IngresoServicio.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListWithSearch, {
  Column,
  DropdownOption,
  SearchFilter,
  CheckboxFilterGroup,
} from "../../components/ListWithSearch";
import {
  mockCatalogos,
  loadDrafts,
  loadSent,
  deleteDraft,
  Payload,
  EstadoServicio,
} from "../../utils/ServiceDrafts";
import { estadoStyles, badgeTextColor } from "../../config/estadoConfig";

// Extendemos Column para permitir un render personalizado
interface CustomColumn<T> extends Column<T> {
  render?: (value: any, row: T) => React.ReactNode;
}
// Extendemos DropdownOption para poder deshabilitar opciones
interface CustomDropdownOption extends DropdownOption {
  disabled?: boolean;
}

interface ServiceRow {
  id: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
  estado: EstadoServicio;
  raw: Payload;
}

// Queremos mostrar sólo estos dos estados
const estadosFiltrados: EstadoServicio[] = ["Pendiente", "Sin Asignar"];

const columns: CustomColumn<ServiceRow>[] = [
  { label: "ID", key: "id", sortable: true },
  { label: "Origen", key: "origen", sortable: true },
  { label: "Destino", key: "destino", sortable: true },
  { label: "Fecha", key: "fecha", sortable: true },
  { label: "Tipo", key: "tipo", sortable: true },
  {
    label: "Estado",
    key: "estado",
    sortable: true,
    render: (value: EstadoServicio) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          estadoStyles[value] || ""
        } ${badgeTextColor[value] || ""}`}
      >
        {value}
      </span>
    ),
  },
];

const searchFilters: SearchFilter<ServiceRow>[] = [
  { label: "ID", key: "id", type: "text", placeholder: "Buscar ID" },
  {
    label: "Origen",
    key: "origen",
    type: "text",
    placeholder: "Buscar origen",
  },
  {
    label: "Destino",
    key: "destino",
    type: "text",
    placeholder: "Buscar destino",
  },
];

// Ahora incluimos "Sin Asignar" junto a "Pendiente"
const checkboxFilterGroups: CheckboxFilterGroup<ServiceRow>[] = [
  {
    label: "Estados",
    key: "estado",
    options: ["Pendiente", "Sin Asignar"],
  },
];

const IngresoServicio: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ServiceRow[]>([]);

  useEffect(() => {
    const lookup = (arr: { codigo: number; nombre: string }[], code: number) =>
      arr.find((x) => x.codigo === code)?.nombre || code.toString();

    // Cargo borradores y enviados, filtro sólo los pendientes y sin asignar
    const payloads: Payload[] = [...loadDrafts(), ...loadSent()].filter((p) =>
      estadosFiltrados.includes(p.estado)
    );

    const mapped = payloads.map((p) => {
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
        estado: p.estado,
        raw: p,
      };
    });

    setRows(mapped);
  }, []);

  const handleDelete = (row: ServiceRow) => {
    if (!window.confirm(`¿Eliminar servicio ${row.id}?`)) return;
    const idNum = Number(row.id);

    // Si existe en borradores, lo borro de ahí, si no, de enviados
    const drafts = loadDrafts();
    if (drafts.some((d) => d.id === idNum)) {
      deleteDraft(idNum);
    } else {
      const sent = loadSent().filter((s) => s.id !== idNum);
      localStorage.setItem("serviciosEnviados", JSON.stringify(sent));
    }

    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  const dropdownOptions = (row: ServiceRow): CustomDropdownOption[] => {
    if (row.estado === "Pendiente") {
      return [
        {
          label: "Ver/Editar Servicio",
          onClick: () => navigate(`/comercial/modificar-servicio/${row.id}`),
        },
        {
          label: "Gestionar Valores",
          onClick: () => navigate(`/comercial/agregar-valores/${row.id}`),
          disabled: false,
        },
        {
          label: "Eliminar",
          onClick: () => handleDelete(row),
          disabled: false,
        },
      ];
    } else {
      // "Pendiente" sólo lectura
      return [
        {
          label: "Ver Detalle",
          onClick: () => navigate(`/detalle-servicio/${row.id}`),
        },
      ];
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <Link
          to="/comercial/nuevo-servicio"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Nuevo Servicio
        </Link>
      </div>

      <ListWithSearch<ServiceRow>
        data={rows}
        columns={columns}
        searchFilters={searchFilters}
        checkboxFilterGroups={checkboxFilterGroups}
        dropdownOptions={dropdownOptions}
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

export default IngresoServicio;
