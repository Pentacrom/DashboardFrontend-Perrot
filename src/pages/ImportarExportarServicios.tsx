// src/pages/ImportExportServicios.tsx
import React, { useRef, useState } from "react";
import { loadDrafts, loadSent, saveOrUpdateSent, mockCatalogos, mockPaises, getNextId } from "../utils/ServiceDrafts";
import { mapExcelRowToPayload } from "../utils/ServiceExcelMapper";
import * as XLSX from "xlsx";
import { Payload } from "../utils/ServiceDrafts";
import { Modal } from "../components/Modal";

interface ImportPreviewItem {
  payload: Payload;
  isExisting: boolean;
  rowIndex: number;
}

export default function ImportExportServicios() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewItem[]>([]);

  // Combina borradores y enviados para exportar
  const getAllServicios = (): Payload[] => {
    const drafted = loadDrafts();
    const sent = loadSent();
    // Evitar duplicados por ID: drafts y sent pueden solaparse
    const map = new Map<number, Payload>();
    [...drafted, ...sent].forEach((s) => map.set(s.id, s));
    return Array.from(map.values());
  };

  // Exporta a formato HTML de carga masiva
  const handleExport = () => {
    const servicios = getAllServicios();
    
    // Función helper para extraer valores del payload
    function getPayloadValue(payload: Payload, field: string): string {
      const form = payload.form || {};
      
      switch (field) {
        case 'Ruta':
          return payload.id?.toString() || '';
        case 'Tipo de Operacion':
          const tipoOp = mockCatalogos.Operación.find((op: any) => op.codigo === form.tipoOperacion);
          return tipoOp?.nombre || '';
        case 'Ejecutivo':
          return form.ejecutivo || '';
        case 'Cliente':
          const cliente = mockCatalogos.empresas.find((emp: any) => emp.id === form.cliente);
          return cliente?.nombre || '';
        case 'Dirección de entrega':
          const destino = mockCatalogos.Lugares.find((lugar: any) => lugar.id === form.destino);
          return destino?.nombre || '';
        case 'Referencia':
          return form.observacion || '';
        case 'Pais':
          const pais = mockPaises.find((p: any) => p.codigo === form.pais);
          return pais?.nombre || '';
        case 'ETA_STACKING':
          return form.eta ? new Date(form.eta).toLocaleDateString() : '';
        case 'Tipo':
          const tipoCont = mockCatalogos.Tipo_contenedor.find((tipo: any) => tipo.codigo === form.tipoContenedor);
          return tipoCont?.nombre || '';
        case 'Contenedor':
          return form.nroContenedor || '';
        case 'Sello':
          return form.sello || '';
        case 'Lugar de Retiro 1':
          const origen = mockCatalogos.Lugares.find((lugar: any) => lugar.id === form.origen);
          return origen?.nombre || '';
        case 'Fecha de Retiro 1':
          return form.fechaSol ? new Date(form.fechaSol).toLocaleDateString() : '';
        case 'Lugar de Devolución / Puerto de embarque':
          const lugarDev = mockCatalogos.Lugares.find((lugar: any) => lugar.id === form.destino);
          return lugarDev?.nombre || '';
        case 'Tarjeton':
          return form.tarjeton || '';
        case 'Guia':
          return form.guiaDeDespacho || '';
        case 'Fecha de Presentación':
          return form.fechaIng ? new Date(form.fechaIng).toLocaleDateString() : '';
        default:
          return '';
      }
    }
    
    // Encabezados según el formato HTML de carga masiva
    const headers = [
      'Ruta', 'Tipo de Operacion', 'Ejecutivo', 'Cliente', 'Sub Cliente',
      'Dirección de entrega', 'Referencia', 'Reserva', 'Zona', 'Zona Portuaria',
      'Pais', 'ETA_STACKING', 'Naviera', 'Nave', 'Tipo', 'Contenedor',
      'Sello', 'Condición', 'Lugar de Retiro 1', 'Fecha de Retiro 1',
      'Lugar de Retiro 2', 'Fecha de Retiro 2', 'Lugar de Devolución / Puerto de embarque',
      'Tarjeton', 'Maquina', 'Guia', 'Fecha de Presentación'
    ];
    
    // Crear datos para Excel con las columnas del formato de carga masiva
    const data = servicios.map(servicio => {
      const excelRow: Record<string, any> = {};
      headers.forEach(header => {
        excelRow[header] = getPayloadValue(servicio, header);
      });
      return excelRow;
    });

    // Crear libro de Excel
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Servicios");
    XLSX.writeFile(wb, "servicios_export.xlsx");
  };

  // Función para verificar si un servicio ya existe
  const isServiceExisting = (payload: Payload): boolean => {
    const allServices = getAllServicios();
    return allServices.some(service => 
      service.form.nroContenedor === payload.form.nroContenedor && 
      service.form.nroContenedor !== "" &&
      service.form.cliente === payload.form.cliente &&
      service.form.tipoOperacion === payload.form.tipoOperacion
    );
  };

  // Importa desde Excel con formato de carga masiva - con preview
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]!];
      const rows: any[] = XLSX.utils.sheet_to_json(ws!);
      
      // Procesar filas y preparar preview
      const preview: ImportPreviewItem[] = [];
      rows.forEach((row, index) => {
        try {
          const payload = mapExcelRowToPayload(row, getNextId());
          const isExisting = isServiceExisting(payload);
          preview.push({
            payload,
            isExisting,
            rowIndex: index + 1
          });
        } catch (error) {
          console.error("Error procesando fila:", row, error);
        }
      });
      
      setPreviewData(preview);
      setShowImportModal(true);
      
      // reset
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  // Confirmar importación solo de servicios nuevos
  const handleConfirmImport = () => {
    const newServices = previewData.filter(item => !item.isExisting);
    
    newServices.forEach(item => {
      try {
        saveOrUpdateSent(item.payload);
      } catch (error) {
        console.error("Error guardando servicio:", error);
      }
    });
    
    const skippedCount = previewData.length - newServices.length;
    alert(`Importación completada. ${newServices.length} servicios nuevos importados.${skippedCount > 0 ? ` ${skippedCount} servicios existentes omitidos.` : ''}`);
    
    setShowImportModal(false);
    setPreviewData([]);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">
        Carga Masiva de Servicios
      </h1>
      <div className="flex justify-center gap-4">
        <button className="btn-primary" onClick={handleExport}>
          Exportar
        </button>
        <label className="btn-secondary cursor-pointer">
          Importar
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
      
      {/* Modal de preview de importación */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        onConfirm={handleConfirmImport}
        confirmText="Importar Servicios Nuevos"
        cancelText="Cancelar"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Vista Previa de Importación
          </h2>
          
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <span>Servicios nuevos ({previewData.filter(item => !item.isExisting).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 rounded"></div>
                <span>Servicios existentes ({previewData.filter(item => item.isExisting).length})</span>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-left">Fila</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Cliente</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Tipo Op.</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Contenedor</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((item, index) => (
                  <tr 
                    key={index} 
                    className={item.isExisting ? 'bg-red-50' : 'bg-green-50'}
                  >
                    <td className="border border-gray-300 px-2 py-1">{item.rowIndex}</td>
                    <td className="border border-gray-300 px-2 py-1">
                      {mockCatalogos.empresas.find(e => e.id === item.payload.form.cliente)?.nombre || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {mockCatalogos.Operación.find(o => o.codigo === item.payload.form.tipoOperacion)?.nombre || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {item.payload.form.nroContenedor || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {item.isExisting ? 'Existente' : 'Nuevo'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>• Los servicios en <span className="text-green-600 font-medium">verde</span> serán importados.</p>
            <p>• Los servicios en <span className="text-red-600 font-medium">rojo</span> ya existen y serán omitidos.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
