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
  mockCatalogos,
  EstadoServicio,
  Cliente,
  Lugar
} from "../../utils/ServiceDrafts";
import { 
  ServiceRow, 
  getServiceColumnsWithRender, 
  defaultColumnConfigs 
} from "../../utils/ServiceColumns";
import { estadoStyles, badgeTextColor } from "../../config/estadoConfig";
import ImportExportButtons from "../../components/ImportExportButtons";

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

  const loadData = () => {
    // lookup genéricos
    const lookup = (arr: { codigo: number; nombre: string }[], code: number) =>
      arr.find((x) => x.codigo === code)?.nombre || code.toString();
    const lookupLugar = (arr: Lugar[], id: number) =>
      arr.find((x) => x.id === id)?.nombre || id.toString();
    const lookupCliente = (arr: Cliente[], id: number) =>
      arr.find((x) => x.id === id)?.nombre || id.toString();

    const drafts = loadDrafts();
    const sent = loadSent();

    const mapped: ServiceRow[] = sent.map((p) => {
      const f = p.form;
      const clienteName = lookupCliente(mockCatalogos.empresas, f.cliente);
      const origenName = lookupLugar(mockCatalogos.Lugares, f.origen);
      const destinoName = lookupLugar(mockCatalogos.Lugares, f.destino);
      const tipoName = lookup(mockCatalogos.Operación, f.tipoOperacion);
      const paisName = mockCatalogos.Zona.find(z => z.codigo === f.pais)?.nombre || "";
      const tipoContenedorName = mockCatalogos.Tipo_contenedor.find(tc => tc.codigo === f.tipoContenedor)?.nombre || "";

      const pendienteDevolucion = p.pendienteDevolucion || false;
      
      return {
        id: p.id.toString(),
        cliente: clienteName,
        tipoOperacion: tipoName,
        origen: origenName,
        destino: destinoName,
        fecha: f.fechaSol && f.fechaSol instanceof Date ? f.fechaSol.toISOString() : "",
        tipo: tipoName,
        estado: p.estado,
        estadoSeguimiento: p.estadoSeguimiento || "Sin iniciar",
        pendienteDevolucion,
        // Campo calculado para coloración de filas
        rowStyle: pendienteDevolucion ? "CONTAINER_PENDIENTE" : p.estado,
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

    // Ordenar para mostrar containers pendientes primero
    const sorted = mapped.sort((a, b) => {
      // Containers pendientes van arriba
      if (a.pendienteDevolucion && !b.pendienteDevolucion) return -1;
      if (!a.pendienteDevolucion && b.pendienteDevolucion) return 1;
      // Luego por estado y fecha
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    setRows(sorted);
  };

  useEffect(() => {
    loadData();
  }, []);

  const dropdownOptions = (row: ServiceRow): DropdownOption<ServiceRow>[] => {
    const opts: DropdownOption<ServiceRow>[] = [
      {
        label: "Ver detalle",
        onClick: () => navigate(`/detalle-servicio/${row.id}`),
      },
    ];
    if (row.estado === "En Proceso" || row.estado === "Por validar") {
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
    {
      label: "Container pendiente",
      key: "pendienteDevolucion" as keyof ServiceRow,
      options: [true, false],
      optionLabels: { "true": "Pendiente ⚠️", "false": "No pendiente ✅" },
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Servicios en Proceso</h1>
        <div className="flex gap-2">
          <ImportExportButtons
            data={rows}
            onDataUpdate={setRows}
          />
        </div>
      </div>

      <ListWithSearch<ServiceRow>
        data={rows}
        columns={getServiceColumnsWithRender()}
        defaultVisibleColumns={defaultColumnConfigs.torreDeControl}
        searchFilters={searchFilters}
        checkboxFilterGroups={estadoCheckboxFilter}
        defaultCheckboxSelections={{
          estado: ["Sin Asignar", "En Proceso"],
        }}
        dropdownOptions={dropdownOptions as DropdownOptionsType<ServiceRow>}
        colorConfig={{
          field: "rowStyle",
          bgMapping: {
            ...estadoStyles,
            "CONTAINER_PENDIENTE": "bg-red-100 border-l-8 border-red-600 shadow-lg ring-2 ring-red-200",
          },
          textMapping: {
            ...badgeTextColor,
            "CONTAINER_PENDIENTE": "text-red-900 font-bold",
          },
          mode: "row",
        }}
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
          pendienteDevolucion: [true, false],
        }}
        defaultSortKey="pendienteDevolucion"
        defaultSortOrder="asc"
        preferencesKey="torreDeControl-servicios"
      />
    </div>
  );
};

export default VistaServicios;
