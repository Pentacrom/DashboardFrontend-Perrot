// src/pages/operaciones/VistaServiciosPendientes.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListWithSearch, {
  SearchFilter,
  DropdownOption,
  DropdownOptionsType,
} from "../../components/ListWithSearch";
import {
  loadDrafts,
  loadSent,
  saveOrUpdateSent,
  Payload,
  Descuento,
  mockCatalogos,
} from "../../utils/ServiceDrafts";
import { 
  ServiceRow, 
  getServiceColumnsWithRender, 
  defaultColumnConfigs 
} from "../../utils/ServiceColumns";
import { payloadToRow } from "../../utils/ServiceUtils";
import { estadoStyles, badgeTextColor } from "../../config/estadoConfig";
import { AsignarChoferMovilModal } from "../operaciones/AsignarChoferMovilModal";
import { Modal } from "../../components/Modal";
import ImportExportButtons from "../../components/ImportExportButtons";

const searchFilters: SearchFilter<ServiceRow>[] = [
  { label: "Fecha Desde", key: "fecha", type: "date", comparator: "gte" },
  { label: "Fecha Hasta", key: "fecha", type: "date", comparator: "lte" },
];

const VistaServiciosPendientes: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [modalId, setModalId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);

  const openModal = (id: number) => setModalId(id);
  const closeModal = () => setModalId(null);
  const openConfirm = (id: string) => {
    setConfirmId(id);
    setDiscount(0);
  };
  const closeConfirm = () => setConfirmId(null);


  const confirmFalsoFlete = () => {
    if (!confirmId) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== confirmId) return r;
        // creamos el objeto de descuento
        const desc: Descuento = {
          porcentajeDescuento: discount,
          razon: "Falso Flete",
        };
        const updatedRaw: Payload = {
          ...r.raw,
          estado: "Falso Flete",
          descuentoServicioPorcentaje: [
            ...(r.raw.descuentoServicioPorcentaje || []),
            desc,
          ],
        };
        saveOrUpdateSent(updatedRaw);
        return { ...r, estado: "Falso Flete", raw: updatedRaw };
      })
    );
    closeConfirm();
  };

  const loadData = () => {
    const all = [...loadDrafts(), ...loadSent()];
    const mapped: ServiceRow[] = all.map(payloadToRow);
    setRows(mapped);
  };

  useEffect(() => {
    loadData();
  }, []);

  const dropdownOptions = (row: ServiceRow): DropdownOption<ServiceRow>[] => {
    const idStr = row.id;
    const idNum = Number(row.id);
    const opts: DropdownOption<ServiceRow>[] = [
      {
        label: "Ver detalle",
        onClick: () => navigate(`/detalle-servicio/${idStr}`),
      },
    ];
    if (row.estado === "Sin Asignar")
      opts.push({
        label: "Asignar chofer y móvil",
        onClick: () => openModal(idNum),
      });
    if (["En Proceso", "Sin Asignar"].includes(row.estado))
      opts.push({
        label: "Marcar como Falso Flete",
        onClick: () => openConfirm(idStr),
      });
    opts.push(
      {
        label: "Ver/Editar Servicio",
        onClick: () => navigate(`/operaciones/modificar-servicio/${idStr}`),
      },
      {
        label: "Gestionar Valores",
        onClick: () => navigate(`/operaciones/gestionar-valores/${idStr}`),
      }
    );
    return opts;
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Servicios Pendientes</h1>
        <div className="flex gap-2">
          <ImportExportButtons
            data={rows}
            onDataUpdate={setRows}
          />
          <button
            onClick={() => navigate("/operaciones/nuevo-servicio")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Nuevo Servicio
          </button>
        </div>
      </div>

      <ListWithSearch<ServiceRow>
        data={rows}
        columns={getServiceColumnsWithRender()}
        defaultVisibleColumns={defaultColumnConfigs.operaciones}
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
        customSortOrder={{
          estado: [
            "Sin Asignar",
            "Pendiente",
            "En Proceso",
            "Falso Flete",
            "Por facturar",
            "Completado",
          ],
        }}
        defaultSortKey="estado"
        defaultSortOrder="asc"
        preferencesKey="operaciones-servicios"
        globalSearch={{
          enabled: true,
          placeholder: "Ej: ID:123, Cliente:empresa, Estado:Pendiente, o texto libre",
          highlightResults: true
        }}
      />

      <AsignarChoferMovilModal
        serviceId={modalId!}
        isOpen={modalId !== null}
        onClose={closeModal}
      />

      <Modal isOpen={confirmId !== null} onClose={closeConfirm}>
        <h2 className="text-xl font-semibold mb-4">Confirmar Falso Flete</h2>
        <p className="mb-4">
          Ingresa el porcentaje de descuento a aplicar por{" "}
          <strong>Falso Flete</strong>:
        </p>
        <input
          type="number"
          min={0}
          max={100}
          value={discount}
          onChange={(e) => setDiscount(e.target.valueAsNumber || 0)}
          className="w-full mb-4 px-2 py-1 border rounded"
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={closeConfirm}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={confirmFalsoFlete}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Confirmar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default VistaServiciosPendientes;
