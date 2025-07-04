// src/pages/ImportExportServicios.tsx
import React, { useRef } from "react";
import { loadDrafts, loadSent, saveOrUpdateSent, mockCatalogos, mockPaises, getNextId } from "../utils/ServiceDrafts";
import { mapExcelRowToPayload } from "../utils/ServiceExcelMapper";
import * as XLSX from "xlsx";
import { Payload } from "../utils/ServiceDrafts";

export default function ImportExportServicios() {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Importa desde Excel con formato de carga masiva
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
      
      // Importar usando el mapper existente con el mapeo actualizado
      rows.forEach((row) => {
        try {
          const payload = mapExcelRowToPayload(row, getNextId());
          saveOrUpdateSent(payload);
        } catch (error) {
          console.error("Error procesando fila:", row, error);
        }
      });
      alert(`Importación completada. ${rows.length} servicios procesados.`);
      // reset
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
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
    </div>
  );
}
