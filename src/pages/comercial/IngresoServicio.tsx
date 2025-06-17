// src/pages/IngresoServicio.tsx
import React, { useEffect, useState, useMemo } from "react";
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
  Lugar,
  mockPaises
} from "../../utils/ServiceDrafts";
import { estadoStyles, badgeTextColor } from "../../config/estadoConfig";
import { ServiceRow, payloadToRow } from "../../utils/ServiceUtils";
import { formatCLP } from "../../utils/format";

// Extendemos Column para permitir un render personalizado
interface CustomColumn<T> extends Column<T> {
  render?: (value: any, row: T) => React.ReactNode;
}
// Extendemos DropdownOption para poder deshabilitar opciones
interface CustomDropdownOption extends DropdownOption {
  disabled?: boolean;
}

// Sólo mostramos estados pendientes o sin asignar

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

  useEffect(() => {
    const lookupCodigo = (
      arr: { codigo: number; nombre: string }[],
      code: number
    ) => arr.find((x) => x.codigo === code)?.nombre || code.toString();

    const lookupLugar = (arr: Lugar[], id: number) =>
      arr.find((x) => x.id === id)?.nombre || id.toString();

    const payloads: Payload[] = [...loadDrafts(), ...loadSent()];

    const mapped = payloads.map((p) => {
      // Aplanar todo el Payload a primitivos + raw
      const baseRow = payloadToRow(p);
      const f = p.form;

      // Reemplazar cliente (número) por nombre de empresa
      const empresa = mockCatalogos.empresas.find(
        (e) => e.id === f.cliente
      );
      baseRow.cliente = empresa ? empresa.nombre : f.cliente.toString();

      // Reemplazar tipoOperacion (número) por nombre de operación
      const operacion = mockCatalogos.Operación.find(
        (op) => op.codigo === f.tipoOperacion
      );
      baseRow.tipoOperacion = operacion
        ? operacion.nombre
        : f.tipoOperacion.toString();

      // Reemplazar pais (número) por nombre del país
      const paisItem = mockPaises.find((p) => p.codigo === f.pais);
      baseRow.pais = paisItem ? paisItem.nombre : f.pais.toString();

      // Reemplazar tipoContenedor (número) por nombre de tipo de contenedor
      const cont = mockCatalogos.Tipo_contenedor.find(
        (t) => t.codigo === f.tipoContenedor
      );
      baseRow.tipoContenedor = cont ? cont.nombre : f.tipoContenedor.toString();

      // Luego sobreescribimos origen/destino por sus nombres
      const tipoOp = f.tipoOperacion;
      baseRow.origen = lookupLugar(mockCatalogos.Lugares, f.origen);
      baseRow.destino = lookupLugar(mockCatalogos.Lugares, f.destino);

      // Convertimos id a string (payloadToRow deja id como number)
      baseRow.id = p.id.toString();
      // Agregamos fecha a partir de fechaSol
      baseRow.fecha = f.fechaSol;
      // Agregamos tipo legible (nombre de operación)
      baseRow.tipo = lookupCodigo(mockCatalogos.Operación, tipoOp);

      return baseRow;
    });

    // Filtramos sólo los estados indicados
    setRows(mapped);
  }, []);

  // Generamos columnas dinámicamente según las claves de la primera fila.
  // Usamos el operador "!" para indicar a TypeScript que rows[0] no es undefined
  const columns: CustomColumn<ServiceRow>[] = useMemo(() => {
    if (rows.length === 0) return [];

    const sample = rows[0]!;
    const allKeys = Object.keys(sample).filter((k) => k !== "raw");

    return allKeys.map((key) => {
      if (key === "precioCarga") {
        return {
          label: "Precio Carga",
          key: "precioCarga",
          sortable: true,
          render: (value: any) => {
            const num = typeof value === "number" ? value : Number(value);
            return formatCLP(num);
          },
        } as CustomColumn<ServiceRow>;
      }

      if (key === "estado") {
        return {
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
        } as CustomColumn<ServiceRow>;
      }

      const label = key.charAt(0).toUpperCase() + key.slice(1);
      return {
        label,
        key,
        sortable: true,
      } as CustomColumn<ServiceRow>;
    });
  }, [rows]);

  const handleDelete = (row: ServiceRow) => {
    if (!window.confirm(`¿Eliminar servicio ${row.id}?`)) return;
    const idNum = Number(row.id);

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
    const est = row.estado as EstadoServicio;
    if (["Pendiente", "Sin Asignar", "En Proceso"].includes(est)) {
      return [
        {
          label: "Ver/Editar Servicio",
          onClick: () => navigate(`/comercial/modificar-servicio/${row.id}`),
        },
        {
          label: "Gestionar Valores",
          onClick: () => navigate(`/comercial/gestionar-valores/${row.id}`),
          disabled: false,
        },
        {
          label: "Eliminar",
          onClick: () => handleDelete(row),
          disabled: false,
        },
        {
          label: "Ver Detalle",
          onClick: () => navigate(`/detalle-servicio/${row.id}`),
        },
      ];
    } else {
      return [
        {
          label: "Ver Detalle",
          onClick: () => navigate(`/detalle-servicio/${row.id}`),
        },
      ];
    }
  };

  return (
    <div className="p-6 w-full">
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
        defaultCheckboxSelections={{
          estado: ["Sin Asignar", "Pendiente"],
        }}
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
        onDownloadExcel={() => alert("Descarga de Excel (stub)")}
        onSearch={() => alert("Buscar (stub)")}
        preferencesKey="Preferences"
      />
    </div>
  );
};

export default IngresoServicio;
