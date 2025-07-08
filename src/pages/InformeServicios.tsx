import React, { useState } from "react";
import * as XLSX from "xlsx";

interface Servicio {
  id: string; // ODV
  cliente: string;
  origen: string;
  destino: string;
  fecha: string; // formato "YYYY-MM-DD"
  tipo: string;
  estado: string;
  valor: number; // Monto a Facturar
}

// Datos de ejemplo
const exampleServicios: Servicio[] = [
  {
    id: "001",
    cliente: "Empresa A",
    origen: "Santiago",
    destino: "Valparaíso",
    fecha: "2025-02-10",
    tipo: "Transporte",
    estado: "Pendiente",
    valor: 15000,
  },
  {
    id: "002",
    cliente: "Empresa B",
    origen: "Concepción",
    destino: "Antofagasta",
    fecha: "2025-02-11",
    tipo: "Entrega express",
    estado: "Pendiente",
    valor: 12500,
  },
  {
    id: "003",
    cliente: "Empresa C",
    origen: "Temuco",
    destino: "La Serena",
    fecha: "2025-02-12",
    tipo: "Almacenaje",
    estado: "Completado",
    valor: 18000,
  },
  {
    id: "004",
    cliente: "Empresa D",
    origen: "Iquique",
    destino: "Arica",
    fecha: "2025-02-13",
    tipo: "Transporte",
    estado: "Pendiente",
    valor: 22000,
  },
];

const InformeServicios: React.FC = () => {
  // Estados para el formulario de búsqueda
  const [searchOdv, setSearchOdv] = useState("");
  const [searchCliente, setSearchCliente] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  // Estado para los servicios (datos de ejemplo)
  const [servicios] = useState<Servicio[]>(exampleServicios);

  // Estado para ordenar por "valor": "asc", "desc" o null (sin ordenar)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  // Filtramos según los criterios del formulario
  const filteredServicios = servicios.filter((servicio) => {
    if (
      searchOdv &&
      !servicio.id.toLowerCase().includes(searchOdv.toLowerCase())
    ) {
      return false;
    }
    if (
      searchCliente &&
      !servicio.cliente.toLowerCase().includes(searchCliente.toLowerCase())
    ) {
      return false;
    }
    if (searchStartDate && servicio.fecha < searchStartDate) {
      return false;
    }
    if (searchEndDate && servicio.fecha > searchEndDate) {
      return false;
    }
    return true;
  });

  // Si se seleccionó un orden, ordenamos la lista filtrada por el campo "valor"
  const sortedServicios = sortOrder
    ? [...filteredServicios].sort((a, b) =>
        sortOrder === "asc" ? a.valor - b.valor : b.valor - a.valor
      )
    : filteredServicios;

  // Alterna el orden de la columna "valor" al hacer clic en el header
  const toggleSortOrder = () => {
    if (!sortOrder) {
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder(null);
    }
  };

  // Función para generar y descargar el Excel
  const handleDownloadExcel = () => {
    // Matriz de datos: encabezado y filas
    const data = [
      [
        "ODV",
        "Cliente",
        "Origen",
        "Destino",
        "Fecha del Servicio",
        "Estado",
        "Monto a Facturar",
      ],
      ...sortedServicios.map((servicio) => [
        servicio.id,
        servicio.cliente,
        servicio.origen,
        servicio.destino,
        servicio.fecha,
        servicio.estado,
        `$${servicio.valor.toLocaleString()}`,
      ]),
    ];

    // Convertimos la matriz a una hoja de cálculo
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    // Opcional: Forzar estilo a la cabecera (fondo amarillo)
    if (worksheet["A1"])
      worksheet["A1"].s = { fill: { fgColor: { rgb: "FFFF00" } } };
    if (worksheet["B1"])
      worksheet["B1"].s = { fill: { fgColor: { rgb: "FFFF00" } } };
    // Creamos el libro de trabajo y agregamos la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Informe");
    // Descargamos el archivo Excel
    XLSX.writeFile(workbook, "informe_servicios.xlsx", {
      bookType: "xlsx",
      cellStyles: true,
    });
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Informe de Servicios
        </h1>
        {/* Formulario de búsqueda */}
        <div className="bg-gray-100 p-4 rounded mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ODV
              </label>
              <input
                type="text"
                value={searchOdv}
                onChange={(e) => setSearchOdv(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="Ingrese ODV"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <input
                type="text"
                value={searchCliente}
                onChange={(e) => setSearchCliente(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
                placeholder="Ingrese Cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha Desde
              </label>
              <input
                type="date"
                value={searchStartDate}
                onChange={(e) => setSearchStartDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={searchEndDate}
                onChange={(e) => setSearchEndDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              // Puedes implementar lógica adicional al hacer "buscar"
            >
              Buscar
            </button>
            <button
              onClick={handleDownloadExcel}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Descargar Informe en Excel
            </button>
          </div>
        </div>
        {/* Tabla de resultados */}
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ODV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha del Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th
                  onClick={toggleSortOrder}
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Monto a Facturar{" "}
                  {sortOrder === "asc" ? "▲" : sortOrder === "desc" ? "▼" : ""}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedServicios.map((servicio) => (
                <tr key={servicio.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{servicio.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {servicio.cliente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {servicio.origen}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {servicio.destino}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {servicio.fecha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {servicio.estado}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${servicio.valor.toLocaleString()}
                  </td>
                </tr>
              ))}
              {sortedServicios.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-center"
                    colSpan={7}
                  >
                    No se encontraron servicios con esos criterios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InformeServicios;
