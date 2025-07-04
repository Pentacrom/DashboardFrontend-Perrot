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
import { estadoStyles, badgeTextColor } from "../../config/estadoConfig";
import ImportExportButtons from "../../components/ImportExportButtons";

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

  // Función para cargar datos
  const loadData = () => {
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
      />
    </div>
  );
};

export default IngresoServicio;
