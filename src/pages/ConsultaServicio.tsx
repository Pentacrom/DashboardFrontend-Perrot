import React from "react";
import * as XLSX from "xlsx";

interface Servicio {
  id: string; // ODV
  cliente: string;
  origen: string;
  destino: string;
  fecha: string;
  tipo: string;
  estado: string;
  zona: string; // Zona (destino de la carga)
  zonaPortuaria: string; // Zona portuaria (Puerto involucrado)
  pais: string; // PAIS (Procedencia o destino carga)
  naviera: string; // Naviera (nombre naviera)
  nave: string; // Nave (Nombre nave)
  tipoContenedor: string; // TIPO (Tipo contenedor)
  contenedorBulto: string; // Contenedor Bulto (ID Contenedor)
  sello: string; // Sello (Sello contenedor)
  producto: string; // Producto (Tipo Producto)
  observacion: string;
}

// Datos de ejemplo
const servicio: Servicio = {
  id: "001",
  cliente: "Empresa A",
  origen: "Santiago",
  destino: "Valparaíso",
  fecha: "2025-02-10",
  tipo: "Transporte",
  estado: "Pendiente",
  zona: "Norte",
  zonaPortuaria: "LQN",
  pais: "Chile",
  naviera: "MSC",
  nave: "MSC BARI",
  tipoContenedor: "40HC",
  contenedorBulto: "ABC123",
  sello: "XYZ789",
  producto: "Producto X",
  observacion: "Servicio urgente. Se requiere entrega rápida.",
};

const ConsultaServicio: React.FC = () => {
  // Función para generar y descargar el Excel
  const handleDownloadExcel = () => {
    // Definimos la matriz de datos con encabezados y en el orden deseado
    const data = [
      ["Campo", "Valor"],
      ["ODV", servicio.id],
      ["Cliente", servicio.cliente],
      ["Origen", servicio.origen],
      ["Destino", servicio.destino],
      ["Fecha", servicio.fecha],
      ["Tipo", servicio.tipo],
      ["Estado", servicio.estado],
      ["Zona (destino de la carga)", servicio.zona],
      ["Zona portuaria (Puerto involucrado)", servicio.zonaPortuaria],
      ["PAIS (Procedencia o destino carga)", servicio.pais],
      ["Naviera (nombre naviera)", servicio.naviera],
      ["Nave (Nombre nave)", servicio.nave],
      ["TIPO (Tipo contenedor)", servicio.tipoContenedor],
      ["Contenedor Bulto (ID Contenedor)", servicio.contenedorBulto],
      ["Sello (Sello contenedor)", servicio.sello],
      ["Producto (Tipo Producto)", servicio.producto],
      ["Observación", servicio.observacion],
    ];

    // Convertimos la matriz a una hoja de cálculo
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Aplicamos un estilo al encabezado (primera fila) para que tenga fondo amarillo.
    // Nota: El soporte de estilos puede variar según el entorno y la versión de SheetJS.
    if (worksheet["A1"]) {
      worksheet["A1"].s = { fill: { fgColor: { rgb: "FFFF00" } } };
    }
    if (worksheet["B1"]) {
      worksheet["B1"].s = { fill: { fgColor: { rgb: "FFFF00" } } };
    }

    // Creamos un libro de trabajo y agregamos la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Servicio");

    // Escribimos el archivo Excel, activando el soporte para estilos
    XLSX.writeFile(workbook, "informe_servicio.xlsx", {
      bookType: "xlsx",
      cellStyles: true,
    });
  };

  return (
    <div className="min-h-screen min-w-max rounded-2xl drop-shadow-sm bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Consulta de Servicio
        </h1>
        {/* Contenedor de datos organizados en un grid responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-stretch">
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">ODV:</p>
            <p className="text-lg text-gray-800">{servicio.id}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">Cliente:</p>
            <p className="text-lg text-gray-800">{servicio.cliente}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">Origen:</p>
            <p className="text-lg text-gray-800">{servicio.origen}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">Destino:</p>
            <p className="text-lg text-gray-800">{servicio.destino}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">Fecha:</p>
            <p className="text-lg text-gray-800">{servicio.fecha}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">Tipo:</p>
            <p className="text-lg text-gray-800">{servicio.tipo}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">Estado:</p>
            <p className="text-lg text-gray-800">{servicio.estado}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">
              Zona (destino de la carga):
            </p>
            <p className="text-lg text-gray-800">{servicio.zona}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">
              Zona portuaria (Puerto involucrado):
            </p>
            <p className="text-lg text-gray-800">{servicio.zonaPortuaria}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">
              PAIS (Procedencia o destino carga):
            </p>
            <p className="text-lg text-gray-800">{servicio.pais}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">
              Naviera (nombre naviera):
            </p>
            <p className="text-lg text-gray-800">{servicio.naviera}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">
              Nave (Nombre nave):
            </p>
            <p className="text-lg text-gray-800">{servicio.nave}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">
              TIPO (Tipo contenedor):
            </p>
            <p className="text-lg text-gray-800">{servicio.tipoContenedor}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">
              Contenedor Bulto (ID Contenedor):
            </p>
            <p className="text-lg text-gray-800">{servicio.contenedorBulto}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">
              Sello (Sello contenedor):
            </p>
            <p className="text-lg text-gray-800">{servicio.sello}</p>
          </div>
          <div className="border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">
              Producto (Tipo Producto):
            </p>
            <p className="text-lg text-gray-800">{servicio.producto}</p>
          </div>
          <div className="md:col-span-2 border-b border-gray-300 pb-2">
            <p className="text-sm font-semibold text-gray-600">Observación:</p>
            <p className="text-lg text-gray-800">{servicio.observacion}</p>
          </div>
        </div>
        {/* Botón para descargar el informe en Excel */}
        <div className="mt-8 text-center">
          <button
            onClick={handleDownloadExcel}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Descargar Informe en Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultaServicio;
