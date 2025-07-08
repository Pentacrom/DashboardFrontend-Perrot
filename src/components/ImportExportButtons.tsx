// src/components/ImportExportButtons.tsx
import React, { useRef, useState } from "react";
import { Modal } from "./Modal";
import { 
  importCargaMasivaFile, 
  exportToCargaMasivaFile, 
  confirmImport, 
  getImportBatches, 
  rollbackImportBatch,
  ImportBatch,
  ImportValidationResult,
  ValidatedPayload,
  FieldValidationError
} from "../utils/ServiceExcelMapper";
import { ServiceRow, getServiceColumnsWithRender } from "../utils/ServiceColumns";
import { payloadToRow } from "../utils/ServiceUtils";
import { mockCatalogos, mockPaises } from "../utils/ServiceDrafts";

interface ImportExportButtonsProps {
  data: ServiceRow[];
  onDataUpdate: (newData: ServiceRow[]) => void;
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({
  data,
  onDataUpdate
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para importación
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [candidateRows, setCandidateRows] = useState<ServiceRow[]>([]);
  const [batchInfo, setBatchInfo] = useState<{ batchId: string; filename: string; rowCount: number } | null>(null);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  
  // Estados para rollback
  const [rollbackModalOpen, setRollbackModalOpen] = useState(false);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);

  // Función para obtener resumen detallado de los servicios
  const getServiceSummary = (payloads: any[]) => {
    if (payloads.length === 0) return [];
    
    // Agrupar por cliente y tipo de operación
    const summary = payloads.reduce((acc: any, payload: any) => {
      const form = payload.form || {};
      
      // Buscar nombres reales en lugar de códigos
      const clienteObj = mockCatalogos.empresas.find(e => e.id === form.cliente);
      const cliente = clienteObj?.nombre || `Cliente ID: ${form.cliente}`;
      
      const tipoOpObj = mockCatalogos.Operación.find(op => op.codigo === form.tipoOperacion);
      const tipoOp = tipoOpObj?.nombre || `Operación ID: ${form.tipoOperacion}`;
      
      const ejecutivo = form.ejecutivo || payload.createdBy || 'Sin especificar';
      
      // Información adicional
      const paisObj = mockPaises.find(p => p.codigo === form.pais);
      const pais = paisObj?.nombre || `País ID: ${form.pais}`;
      
      const tipoContObj = mockCatalogos.Tipo_contenedor.find(tc => tc.codigo === form.tipoContenedor);
      const tipoContenedor = tipoContObj?.nombre || `Contenedor ID: ${form.tipoContenedor}`;
      
      const key = `${cliente} - ${tipoOp} - ${ejecutivo}`;
      
      if (!acc[key]) {
        acc[key] = {
          cliente,
          tipoOperacion: tipoOp,
          ejecutivo,
          pais,
          tipoContenedor,
          count: 0,
          ids: []
        };
      }
      
      acc[key].count++;
      acc[key].ids.push(payload.id);
      return acc;
    }, {});
    
    return Object.values(summary);
  };

  // Función para mostrar vista previa de importación
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await importCargaMasivaFile(file);
      const validRows = result.validPayloads.map(payloadToRow) as unknown as ServiceRow[];
      setCandidateRows(validRows);
      setBatchInfo(result.batchInfo);
      setValidationResult(result);
      setImportModalOpen(true);
    } catch (error) {
      alert(`Error al importar archivo: ${error}`);
    }
    
    e.target.value = "";
  };

  // Confirmar importación
  const handleConfirmImport = () => {
    if (!batchInfo || !validationResult) return;
    
    try {
      const payloads = candidateRows.map(row => row.raw);
      confirmImport(payloads, batchInfo);
      onDataUpdate([...data, ...candidateRows]);
      setCandidateRows([]);
      setBatchInfo(null);
      setValidationResult(null);
      setImportModalOpen(false);
      alert(`Importación exitosa: ${candidateRows.length} servicios agregados`);
    } catch (error) {
      alert(`Error al confirmar importación: ${error}`);
    }
  };


  // Exportar datos
  const handleExport = async () => {
    try {
      await exportToCargaMasivaFile(data, "servicios_export.xlsx");
    } catch (error) {
      alert(`Error al exportar: ${error}`);
    }
  };

  // Mostrar modal de rollback
  const handleShowRollback = () => {
    setImportBatches(getImportBatches());
    setRollbackModalOpen(true);
  };

  // Ejecutar rollback
  const handleRollback = (batchId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres deshacer esta importación?")) return;
    
    const success = rollbackImportBatch(batchId);
    if (success) {
      // Recargar datos después del rollback
      window.location.reload(); // Forzar recarga para actualizar datos
      alert("Rollback exitoso");
    } else {
      alert("Error al realizar rollback");
    }
    setRollbackModalOpen(false);
  };

  return (
    <>
      {/* Botones principales */}
      <button
        onClick={handleImportClick}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
      >
        Importar
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />


      <button
        onClick={handleExport}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
      >
        Exportar
      </button>

      <button
        onClick={handleShowRollback}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Deshacer Importación
      </button>

      {/* Modal de confirmación de importación */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onConfirm={handleConfirmImport}
        confirmText="Importar Servicios Marcados"
        cancelText="Cancelar"
      >
        <h3 className="text-lg font-semibold mb-4">Vista Previa de Importación</h3>
        
        {/* Leyenda de colores */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Se importarán ({validationResult?.validPayloads.filter(p => p.validationErrors.length === 0).length || 0} servicios)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Con errores ({validationResult?.validPayloads.filter(p => p.validationErrors.length > 0).length || 0} servicios)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>No se importarán ({validationResult?.skippedCount || 0} servicios)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 rounded"></div>
              <span>Celdas con datos faltantes</span>
            </div>
          </div>
        </div>
        
        {/* Tabla con scroll vertical */}
        <div className="overflow-y-auto max-h-96 border border-gray-300 rounded">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-2 py-1 text-left text-sm font-medium">Estado</th>
                <th className="border px-2 py-1 text-left text-sm font-medium">ID</th>
                <th className="border px-2 py-1 text-left text-sm font-medium">Cliente</th>
                <th className="border px-2 py-1 text-left text-sm font-medium">Operación</th>
                <th className="border px-2 py-1 text-left text-sm font-medium">Contenedor</th>
                <th className="border px-2 py-1 text-left text-sm font-medium">Origen</th>
                <th className="border px-2 py-1 text-left text-sm font-medium">Destino</th>
                <th className="border px-2 py-1 text-left text-sm font-medium">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Servicios válidos (verde) */}
              {validationResult?.validPayloads.map((payload, i) => {
                const hasErrors = payload.validationErrors.length > 0;
                
                // Funciones helper para verificar errores en campos específicos
                const hasFieldError = (field: string) => payload.validationErrors.some(e => e.field === field);
                const getFieldValue = (field: string) => {
                  switch (field) {
                    case 'cliente':
                      return mockCatalogos.empresas.find(e => e.id === payload.form.cliente)?.nombre || '';
                    case 'tipoOperacion':
                      return mockCatalogos.Operación.find(o => o.codigo === payload.form.tipoOperacion)?.nombre || '';
                    case 'origen':
                      return mockCatalogos.Lugares.find(l => l.id === payload.form.origen)?.nombre || '';
                    case 'destino':
                      return mockCatalogos.Lugares.find(l => l.id === payload.form.destino)?.nombre || '';
                    default:
                      return '';
                  }
                };
                
                return (
                  <tr key={`valid-${i}`} className="bg-green-50 hover:bg-green-100">
                    <td className="border px-2 py-1 text-sm">
                      <span className={`inline-block w-3 h-3 rounded-full ${hasErrors ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                    </td>
                    <td className="border px-2 py-1 text-sm">{payload.id}</td>
                    <td className={`border px-2 py-1 text-sm ${hasFieldError('cliente') ? 'bg-yellow-200' : ''}`}>
                      {getFieldValue('cliente') || <span className="text-red-500">Falta dato</span>}
                    </td>
                    <td className={`border px-2 py-1 text-sm ${hasFieldError('tipoOperacion') ? 'bg-yellow-200' : ''}`}>
                      {getFieldValue('tipoOperacion') || <span className="text-red-500">Falta dato</span>}
                    </td>
                    <td className="border px-2 py-1 text-sm">{payload.form.nroContenedor || '-'}</td>
                    <td className={`border px-2 py-1 text-sm ${hasFieldError('origen') ? 'bg-yellow-200' : ''}`}>
                      {getFieldValue('origen') || <span className="text-red-500">Falta dato</span>}
                    </td>
                    <td className={`border px-2 py-1 text-sm ${hasFieldError('destino') ? 'bg-yellow-200' : ''}`}>
                      {getFieldValue('destino') || <span className="text-red-500">Falta dato</span>}
                    </td>
                    <td className="border px-2 py-1 text-sm">
                      {hasErrors ? (
                        <span className="text-red-500">
                          {payload.validationErrors.length} error{payload.validationErrors.length > 1 ? 'es' : ''}
                        </span>
                      ) : (
                        'OK'
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {/* Servicios omitidos (rojo) */}
              {validationResult && validationResult.payloads.filter(p => 
                [...validationResult.duplicateIds, ...validationResult.duplicatesInFile].includes(p.id)
              ).map((payload, i) => (
                <tr key={`skipped-${i}`} className="bg-red-50 hover:bg-red-100">
                  <td className="border px-2 py-1 text-sm">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                  </td>
                  <td className="border px-2 py-1 text-sm">{payload.id}</td>
                  <td className="border px-2 py-1 text-sm">
                    {mockCatalogos.empresas.find(e => e.id === payload.form.cliente)?.nombre || 'N/A'}
                  </td>
                  <td className="border px-2 py-1 text-sm">
                    {mockCatalogos.Operación.find(o => o.codigo === payload.form.tipoOperacion)?.nombre || 'N/A'}
                  </td>
                  <td className="border px-2 py-1 text-sm">{payload.form.nroContenedor || '-'}</td>
                  <td className="border px-2 py-1 text-sm">
                    {mockCatalogos.Lugares.find(l => l.id === payload.form.origen)?.nombre || 'N/A'}
                  </td>
                  <td className="border px-2 py-1 text-sm">
                    {mockCatalogos.Lugares.find(l => l.id === payload.form.destino)?.nombre || 'N/A'}
                  </td>
                  <td className="border px-2 py-1 text-sm">
                    <span className="text-red-600">
                      {validationResult.duplicateIds.includes(payload.id) 
                        ? 'Ya existe en el sistema' 
                        : 'Duplicado en archivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Modal de rollback */}
      <Modal
        isOpen={rollbackModalOpen}
        onClose={() => setRollbackModalOpen(false)}
      >
        <h3 className="text-lg font-semibold mb-4">Deshacer Importaciones</h3>
        {importBatches.length === 0 ? (
          <p>No hay importaciones para deshacer.</p>
        ) : (
          <div className="space-y-3">
            {importBatches.map((batch) => (
              <div key={batch.batchId} className="border border-gray-300 rounded p-3 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{batch.filename}</p>
                    <p className="text-sm text-gray-600">
                      {batch.rowCount} servicios importados
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(batch.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRollback(batch.batchId)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Deshacer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ImportExportButtons;