import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListWithSearch, {
  Column,
  DropdownOption,
  SearchFilter,
} from "../../components/ListWithSearch";

interface Service {
  id: string;
  // ya no necesitamos "cliente"
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
}

interface DatosCatalogo {
  Operación: { codigo: number; nombre: string }[];
  Zona: { codigo: number; nombre: string }[];
  Zona_portuaria: { codigo: number; nombre: string }[];
  Tipo_contenedor: { codigo: number; nombre: string }[];
}

const columns: Column<Service>[] = [
  { label: "ID", key: "id", sortable: true },
  // cliente eliminado
  { label: "Origen", key: "origen", sortable: true },
  { label: "Destino", key: "destino", sortable: true },
  { label: "Fecha", key: "fecha", sortable: true },
  { label: "Tipo", key: "tipo", sortable: true },
];

const searchFilters: SearchFilter<Service>[] = [
  { label: "ID", key: "id", type: "text", placeholder: "Buscar ID" },
  // filtro de cliente eliminado
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

const IngresoServicio: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [catalogo, setCatalogo] = useState<DatosCatalogo | null>(null);

  useEffect(() => {
    // opcional: cargar catálogo
    fetch("/api/Tablas/Get-ingreso-servicio")
      .then((res) => res.json())
      .then((data: DatosCatalogo) => setCatalogo(data))
      .catch((err) => console.error("Error cargando catálogo:", err));

    // listar servicios
    fetch("/api/Servicio/Servicios")
      .then((res) => res.json())
      .then((data: any[]) =>
        setServices(
          data.map((item) => ({
            id: item.idSolicitud?.toString() ?? "",
            // ahora origen = producto (antes lo poníamos en cliente)
            origen: item.producto ?? "",
            destino: item.nZonaPortuaria ?? "",
            fecha: item.fechaSol ? item.fechaSol.slice(0, 10) : "",
            tipo: item.nombreTipoOperacion ?? "",
          }))
        )
      )
      .catch((err) => console.error("Error listando servicios:", err));
  }, []);

  const handleDeleteService = (id: string) => {
    if (window.confirm(`¿Eliminar servicio ${id}?`)) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const dropdownOptions = (): DropdownOption<Service>[] => [
    {
      label: "Completar servicio",
      onClick: (service) =>
        navigate("/completar-servicio?facturar=true", { state: { service } }),
    },
    {
      label: "Modificar servicio",
      onClick: (service) =>
        navigate(`/modificar-servicio/${service.id}`, { state: { service } }),
    },
    {
      label: "Eliminar servicio",
      onClick: (service) => handleDeleteService(service.id),
    },
  ];

  return (
    <div className="p-6">
      <ListWithSearch<Service>
        data={services}
        columns={columns}
        searchFilters={searchFilters}
        checkboxFilterGroups={[]}
        dropdownOptions={dropdownOptions}
        tableTitle="Servicios Creados"
        filterTitle="Buscar servicio creado"
        globalButtons={
          <Link
            to="/nuevo-servicio"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Nuevo Servicio
          </Link>
        }
        onDownloadExcel={() => alert("Descarga de Excel (stub)")}
        onSearch={() => alert("Buscar (stub)")}
      />
    </div>
  );
};

export default IngresoServicio;
