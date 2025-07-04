// src/pages/comercial/IngresoServicio.tsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListWithSearch, {
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
import { 
  ServiceRow, 
  getServiceColumnsWithRender, 
  defaultColumnConfigs 
} from "../../utils/ServiceColumns";
import { payloadToRow } from "../../utils/ServiceUtils";
import { estadoStyles, badgeTextColor } from "../../config/estadoConfig";

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
    const newRows = payloads.map(payloadToRow) as unknown as ServiceRow[];
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
    const mapped: ServiceRow[] = payloads.map((p) => {
      const f = p.form;
      const clienteName = mockCatalogos.empresas.find((e) => e.id === f.cliente)?.nombre || f.cliente.toString();
      const tipoOperacionName = mockCatalogos.Operación.find((o) => o.codigo === f.tipoOperacion)?.nombre || f.tipoOperacion.toString();
      const paisName = mockPaises.find((pi) => pi.codigo === f.pais)?.nombre || f.pais.toString();
      const tipoContenedorName = mockCatalogos.Tipo_contenedor.find((t) => t.codigo === f.tipoContenedor)?.nombre || f.tipoContenedor.toString();
      const origenName = lookupLugar(mockCatalogos.Lugares, f.origen);
      const destinoName = lookupLugar(mockCatalogos.Lugares, f.destino);
      const tipoName = lookupCodigo(mockCatalogos.Operación, f.tipoOperacion);

      return {
        id: p.id.toString(),
        cliente: clienteName,
        tipoOperacion: tipoOperacionName,
        origen: origenName,
        destino: destinoName,
        fecha: f.fechaSol && f.fechaSol instanceof Date ? f.fechaSol.toISOString() : "",
        tipo: tipoName,
        estado: p.estado,
        pais: paisName,
        tipoContenedor: tipoContenedorName,
        kilos: f.kilos,
        precioCarga: f.precioCarga,
        temperatura: f.temperatura,
        guiaDeDespacho: f.guiaDeDespacho,
        tarjeton: f.tarjeton,
        nroContenedor: f.nroContenedor,
        sello: f.sello,
        nave: f.nave,
        observacion: f.observacion,
        interchange: f.interchange,
        odv: f.odv,
        imoCargo: f.imoCargo,
        imoCategoria: f.imoCategoria,
        tipoServicio: f.tipoServicio,
        folio: f.folio,
        fechaFolio: f.fechaFolio && f.fechaFolio instanceof Date ? f.fechaFolio.toISOString() : "",
        eta: f.eta && f.eta instanceof Date ? f.eta.toISOString() : "",
        ejecutivo: f.ejecutivo || "",
        chofer: p.chofer,
        movil: p.movil,
        raw: p,
      };
    });
    setRows(mapped);
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
                {getServiceColumnsWithRender().slice(0, 5).map((col) => (
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
                  {getServiceColumnsWithRender().slice(0, 5).map((col) => (
                    <td key={col.key as string} className="border px-2 py-1">
                      {String(r[col.key] || "")}
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
        globalButtons={globalButtons}
        preferencesKey="comercial-servicios"
      />
    </div>
  );
};

export default IngresoServicio;
