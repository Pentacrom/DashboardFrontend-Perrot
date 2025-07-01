// src/pages/comercial/IngresoServicio.tsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListWithSearch, {
  Column,
  SearchFilter,
  CheckboxFilterGroup,
  DropdownOptionsType,
  DropdownOption
} from "../../components/ListWithSearch";
import { Modal } from "../../components/Modal";
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
  importExcelFile,
  exportToExcelFile,
} from "../../utils/ServiceExcelMapper";
import { ServiceRow, payloadToRow } from "../../utils/ServiceUtils";
import { estadoStyles, badgeTextColor } from "../../config/estadoConfig";
import { formatCLP } from "../../utils/format";

// Definición de filtros de búsqueda
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

// Filtros de casillas
const checkboxFilterGroups: CheckboxFilterGroup<ServiceRow>[] = [
  {
    label: "Filtrar por estado",
    key: "estado" as keyof ServiceRow,
    options: Object.keys(estadoStyles) as EstadoServicio[],
  },
];

interface CustomColumn<T> extends Column<T> {
  render?: (value: any, row: T) => React.ReactNode;
}

const IngresoServicio: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ServiceRow[]>([]);

  // Estados y refs de importación
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [candidateRows, setCandidateRows] = useState<ServiceRow[]>([]);

  // Refs y estados de plantilla de exportación
  const tplInputRef = useRef<HTMLInputElement>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  // Importar Excel: abrir file picker
  const handleImportClick = () => fileInputRef.current?.click();
  // Al seleccionar archivo, generar payloads y abrir modal de confirmación
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const payloads = await importExcelFile(file);
    const newRows = payloads.map(payloadToRow);
    setCandidateRows(newRows);
    setImportModalOpen(true);
    e.target.value = "";
  };
  // Confirmar importación
  const confirmImport = () => {
    setRows((prev) => [...prev, ...candidateRows]);
    setCandidateRows([]);
    setImportModalOpen(false);
  };

  // Cambio de plantilla
  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTemplateFile(file);
    if (tplInputRef.current) tplInputRef.current.value = "";
  };

  // Carga inicial de datos
  useEffect(() => {
    const lookupCodigo = (
      arr: { codigo: number; nombre: string }[],
      code: number
    ) => arr.find((x) => x.codigo === code)?.nombre || code.toString();
    const lookupLugar = (arr: Lugar[], id: number) =>
      arr.find((x) => x.id === id)?.nombre || id.toString();

    const payloads: Payload[] = [...loadDrafts(), ...loadSent()];
    const mapped = payloads.map((p) => {
      const base = payloadToRow(p);
      const f = p.form;
      base.cliente =
        mockCatalogos.empresas.find((e) => e.id === f.cliente)?.nombre ||
        f.cliente.toString();
      base.tipoOperacion =
        mockCatalogos.Operación.find((o) => o.codigo === f.tipoOperacion)
          ?.nombre || f.tipoOperacion.toString();
      base.pais =
        mockPaises.find((pi) => pi.codigo === f.pais)?.nombre ||
        f.pais.toString();
      base.tipoContenedor =
        mockCatalogos.Tipo_contenedor.find((t) => t.codigo === f.tipoContenedor)
          ?.nombre || f.tipoContenedor.toString();
      base.origen = lookupLugar(mockCatalogos.Lugares, f.origen);
      base.destino = lookupLugar(mockCatalogos.Lugares, f.destino);
      base.id = p.id.toString();
      base.fecha = f.fechaSol;
      base.tipo = lookupCodigo(mockCatalogos.Operación, f.tipoOperacion);
      return base;
    });
    setRows(mapped);
  }, []);

  // Columnas con render personalizado
  const columns = useMemo<CustomColumn<ServiceRow>[]>(() => {
    if (!rows.length) return [];
    const sample = rows[0]!;
    const keys = Object.keys(sample).filter((k) => k !== "raw");
    return keys.map((key) => {
      if (key === "precioCarga") {
        return {
          label: "Precio Carga",
          key: "precioCarga",
          sortable: true,
          render: (v) => formatCLP(Number(v)),
        };
      }
      if (key === "estado") {
        return {
          label: "Estado",
          key: "estado",
          sortable: true,
          render: (value: EstadoServicio) => (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${estadoStyles[value]} ${badgeTextColor[value]}`}
            >
              {value}
            </span>
          ),
        };
      }
      return {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        key: key as keyof ServiceRow,
        sortable: true,
      };
    });
  }, [rows]);

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

  // Exportar Excel
  const handleExport = async () => {
    if (!templateFile) {
      tplInputRef.current?.click();
      return;
    }
    await exportToExcelFile(rows, templateFile, "servicios_export.xlsx");
  };

  // Botones globales (Importar/Exportar)
  const globalButtons: React.ReactNode = (
    <>
      <button
        onClick={handleImportClick}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
      >
        Importar Excel
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => tplInputRef.current?.click()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
      >
        Seleccionar plantilla
      </button>
      <input
        ref={tplInputRef}
        type="file"
        accept=".xlsx"
        onChange={handleTemplateChange}
        className="hidden"
      />
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Exportar Excel
      </button>
    </>
  );

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

      {/* Modal de confirmación de importación */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onConfirm={confirmImport}
        confirmText="Confirmar Importación"
        cancelText="Cancelar"
      >
        <p className="mb-4">Se ingresarán {candidateRows.length} servicios:</p>
        <div className="overflow-auto max-h-64">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key as string}
                    className="border px-2 py-1 text-left"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidateRows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-100">
                  {columns.map((col) => (
                    <td key={col.key as string} className="border px-2 py-1">
                      {/* @ts-ignore */}
                      {r[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Listado con filtros y botones */}
      <ListWithSearch<ServiceRow>
        data={rows}
        columns={columns}
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
        globalButtons={globalButtons}
        preferencesKey="Preferences"
      />
    </div>
  );
};

export default IngresoServicio;
