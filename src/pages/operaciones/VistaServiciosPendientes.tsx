// src/pages/operaciones/VistaServiciosPendientes.tsx
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
  saveOrUpdateSent,
  EstadoServicio,
  Lugar,
} from "../../utils/ServiceDrafts";
import { estadoStyles, badgeTextColor } from "../../config/estadoConfig";
import { AsignarChoferMovilModal } from "../operaciones/AsignarChoferMovilModal";
import { Modal } from "../../components/Modal";

interface ServiceRow {
  id: string;
  cliente: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
  estado: EstadoServicio;
  raw: Payload;
}

interface CustomColumn<T> extends Column<T> {
  render?: (value: any, row: T) => React.ReactNode;
}

const columns: CustomColumn<ServiceRow>[] = [
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
    render: (value: EstadoServicio) => (
      <span
        className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${estadoStyles[value] || ""} ${badgeTextColor[value] || ""}
        `}
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

const VistaServiciosPendientes: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [modalId, setModalId] = useState<number | null>(null);
  const [confirmFalsoFleteId, setConfirmFalsoFleteId] = useState<string | null>(
    null
  );

  const openModal = (id: number) => setModalId(id);
  const closeModal = () => setModalId(null);

  const openConfirmFalsoFlete = (id: string) => setConfirmFalsoFleteId(id);
  const closeConfirmFalsoFlete = () => setConfirmFalsoFleteId(null);

  const confirmarFalsoFlete = () => {
    if (!confirmFalsoFleteId) return;

    setRows((prev) =>
      prev.map((r) =>
        r.id === confirmFalsoFleteId
          ? {
              ...r,
              estado: "Falso Flete",
              raw: { ...r.raw, estado: "Falso Flete" },
            }
          : r
      )
    );

    // Persistir cambio
    const drafts = loadDrafts();
    const sent = loadSent();
    const idNum = Number(confirmFalsoFleteId);
    const foundInDrafts = drafts.find((s) => s.id === idNum);
    const foundInSent = sent.find((s) => s.id === idNum);
    const updatedService = {
      ...(foundInDrafts || foundInSent)!,
      estado: "Falso Flete" as EstadoServicio,
    };
    saveOrUpdateSent(updatedService);

    closeConfirmFalsoFlete();
  };

  useEffect(() => {
    // Lookup para catálogos con `codigo`
    const lookupCodigo = (
      arr: { codigo: number; nombre: string }[],
      code: number
    ) => arr.find((x) => x.codigo === code)?.nombre || code.toString();

    // Lookup para Lugares por `id`
    const lookupLugar = (arr: Lugar[], id: number) =>
      arr.find((x) => x.id === id)?.nombre || id.toString();

    // Zonas portuarias extraídas de Lugares
    const zonasPortuarias = mockCatalogos.Lugares.filter(
      (l) => l.tipo === "Zona Portuaria"
    );

    // Combina borradores y enviados
    const all = [...loadDrafts(), ...loadSent()];

    // Mapear a filas
    const mapped: ServiceRow[] = all.map((p) => {
      const f = p.form;
      const tipoOp = f.tipoOperacion;
      const clienteName = lookupCodigo(mockCatalogos.empresas, f.cliente);
      const origenName =
        tipoOp === 2
          ? lookupLugar(zonasPortuarias, f.origen)
          : lookupCodigo(mockCatalogos.Zona, f.origen);
      const destinoName =
        tipoOp === 1
          ? lookupLugar(zonasPortuarias, f.destino)
          : lookupCodigo(mockCatalogos.Zona, f.destino);
      const tipoName = lookupCodigo(mockCatalogos.Operación, tipoOp);

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
      opts.push(
        {
          label: "Ver/Editar Servicio",
          onClick: () => navigate(`/comercial/modificar-servicio/${row.id}`),
        },
        {
          label: "Gestionar Valores",
          onClick: () => navigate(`/comercial/agregar-valores/${row.id}`),
        },
        {
          label: "Marcar como Falso Flete",
          onClick: () => openConfirmFalsoFlete(row.id),
        }
      );
    }

    if (row.estado === "Sin Asignar") {
      opts.push({
        label: "Asignar chofer y móvil",
        onClick: () => openModal(Number(row.id)),
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
        <h1 className="text-2xl font-bold">
          Servicios en Proceso / Sin Asignar
        </h1>
        <button
          onClick={() => navigate("/comercial/nuevo-servicio")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Nuevo Servicio
        </button>
      </div>

      <ListWithSearch<ServiceRow>
        data={rows}
        columns={columns}
        searchFilters={searchFilters}
        checkboxFilterGroups={estadoCheckboxFilter}
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

      <AsignarChoferMovilModal
        serviceId={modalId!}
        isOpen={modalId !== null}
        onClose={closeModal}
      />

      <Modal
        isOpen={confirmFalsoFleteId !== null}
        onClose={closeConfirmFalsoFlete}
      >
        <h2 className="text-xl font-semibold mb-4">Confirmar acción</h2>
        <p className="mb-6">
          ¿Estás seguro de que deseas marcar este servicio como{" "}
          <strong>Falso Flete</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={closeConfirmFalsoFlete}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={confirmarFalsoFlete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default VistaServiciosPendientes;
