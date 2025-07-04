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
  ImportValidationResult
} from "../utils/ServiceExcelMapper";
import { ServiceRow, getServiceColumnsWithRender } from "../utils/ServiceColumns";
import { payloadToRow } from "../utils/ServiceUtils";

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
        confirmText="Confirmar Importación"
        cancelText="Cancelar"
      >
        <h3 className="text-lg font-semibold mb-4">Vista Previa de Importación</h3>
        <div className="mb-4">
          <p><strong>Archivo:</strong> {batchInfo?.filename}</p>
          <p><strong>Total de filas en archivo:</strong> {batchInfo?.rowCount}</p>
          <p><strong>Servicios válidos para importar:</strong> {candidateRows.length}</p>
          
          {validationResult && validationResult.skippedCount > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-semibold text-yellow-800">⚠️ Registros omitidos: {validationResult.skippedCount}</p>
              
              {validationResult.duplicateIds.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-yellow-700">
                    <strong>IDs duplicados con sistema existente:</strong> {validationResult.duplicateIds.join(', ')}
                  </p>
                </div>
              )}
              
              {validationResult.duplicatesInFile.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-yellow-700">
                    <strong>IDs duplicados dentro del archivo:</strong> {validationResult.duplicatesInFile.join(', ')}
                  </p>
                </div>
              )}
              
              <p className="text-sm text-yellow-600 mt-2">
                Estos registros no se importarán para evitar conflictos.
              </p>
            </div>
          )}
        </div>
        
        <div className="overflow-auto max-h-96 border border-gray-300 rounded">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {getServiceColumnsWithRender().slice(0, 6).map((col) => (
                  <th
                    key={col.key as string}
                    className="border px-2 py-1 text-left text-sm font-medium"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidateRows.slice(0, 10).map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {getServiceColumnsWithRender().slice(0, 6).map((col) => (
                    <td key={col.key as string} className="border px-2 py-1 text-sm">
                      {String(row[col.key] || "")}
                    </td>
                  ))}
                </tr>
              ))}
              {candidateRows.length > 10 && (
                <tr>
                  <td colSpan={6} className="border px-2 py-1 text-sm text-gray-500 text-center">
                    ... y {candidateRows.length - 10} servicios más
                  </td>
                </tr>
              )}
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