// src/pages/comercial/IngresoServicio.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListWithSearch, {
  SearchFilter,
  CheckboxFilterGroup,
  DropdownOptionsType,
  DropdownOption
} from "../../components/ListWithSearch";
import {
  loadDrafts,
  loadSent,
  deleteDraft,
  Payload,
  EstadoServicio,
  Lugar,
  mockCatalogos,
  mockPaises,
} from "../../utils/ServiceDrafts";
import { 
  ServiceRow, 
  getServiceColumnsWithRender, 
  defaultColumnConfigs 
} from "../../utils/ServiceColumns";
import { payloadToRow } from "../../utils/ServiceUtils";
import { estadoStyles, badgeTextColor } from "../../config/estadoConfig";
import ImportExportButtons from "../../components/ImportExportButtons";

// Definición de filtros de búsqueda
const searchFilters: SearchFilter<ServiceRow>[] = [
  { label: "Fecha Desde", key: "fecha", type: "date", comparator: "gte" },
  { label: "Fecha Hasta", key: "fecha", type: "date", comparator: "lte" },
];

// Filtros de casillas
const checkboxFilterGroups: CheckboxFilterGroup<ServiceRow>[] = [
  {
    label: "Filtrar por estado",
    key: "estado" as keyof ServiceRow,
    options: Object.keys(estadoStyles) as EstadoServicio[],
  },
];


const IngresoServicio: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ServiceRow[]>([]);

  // Función para cargar datos
  const loadData = () => {
    const payloads: Payload[] = [...loadDrafts(), ...loadSent()];
    const mapped: ServiceRow[] = payloads.map(payloadToRow);
    setRows(mapped);
  };

  // Carga inicial de datos
  useEffect(() => {
    loadData();
  }, []);


  // Opciones del dropdown por fila
  const dropdownOptions: DropdownOptionsType<ServiceRow> = (row) => {
    const est = row.estado as EstadoServicio;
    const common: DropdownOption<ServiceRow>[] = [
      {
        label: "Ver/Editar Servicio",
        onClick: () => navigate(`/comercial/modificar-servicio/${row.id}`),
      },
      {
        label: "Gestionar Valores",
        onClick: () => navigate(`/comercial/gestionar-valores/${row.id}`),
      },
      {
        label: "Ver Detalle",
        onClick: () => navigate(`/detalle-servicio/${row.id}`),
      },
    ];
    if (["Pendiente", "Sin Asignar", "En Proceso"].includes(est)) {
      return [
        common[0]!,
        common[1]!,
        { label: "Eliminar", onClick: () => handleDelete(row) },
        common[2]!,
      ];
    }
    if (est === "Por validar") {
      return [
        common[0]!,
        common[1]!,
        {
          label: "Ver y completar Servicio",
          onClick: () => navigate(`/detalle-servicio/${row.id}`),
        },
      ];
    }
    return common;
  };

  // Función para eliminar
  const handleDelete = (row: ServiceRow) => {
    if (!window.confirm(`¿Eliminar servicio ${row.id}?`)) return;
    const idNum = Number(row.id);
    if (loadDrafts().some((d) => d.id === idNum)) deleteDraft(idNum);
    else
      localStorage.setItem(
        "serviciosEnviados",
        JSON.stringify(loadSent().filter((s) => s.id !== idNum))
      );
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };


  return (
    <div className="p-6 w-full">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Servicios</h1>
        <div className="flex gap-2">
          <ImportExportButtons
            data={rows}
            onDataUpdate={setRows}
          />
          <Link
            to="/comercial/nuevo-servicio"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Nuevo Servicio
          </Link>
        </div>
      </div>


      {/* Listado con filtros y botones */}
      <ListWithSearch<ServiceRow>
        data={rows}
        columns={getServiceColumnsWithRender()}
        defaultVisibleColumns={defaultColumnConfigs.comercial}
        searchFilters={searchFilters}
        checkboxFilterGroups={checkboxFilterGroups}
        defaultCheckboxSelections={{ estado: ["Sin Asignar", "Pendiente"] }}
        dropdownOptions={dropdownOptions}
        customSortOrder={{
          estado: [
            "Pendiente",
            "Sin Asignar",
            "En Proceso",
            "Falso Flete",
            "Por facturar",
            "Completado",
          ],
        }}
        colorConfig={{
          field: "estado",
          bgMapping: estadoStyles,
          textMapping: badgeTextColor,
          mode: "row",
        }}
        preferencesKey="comercial-servicios"
        globalSearch={{
          enabled: true,
          placeholder: "Ej: ID:123, Cliente:empresa, Estado:Pendiente, o texto libre",
          highlightResults: true
        }}
      />
    </div>
  );
};

export default IngresoServicio;
