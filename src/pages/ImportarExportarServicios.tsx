// src/pages/ImportExportServicios.tsx
import React, { useRef } from "react";
import { loadDrafts, loadSent, saveOrUpdateSent } from "../utils/ServiceDrafts";
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

  // Exporta a Excel
  const handleExport = () => {
    const servicios = getAllServicios();
    // Convertir a objeto plano, separando campos anidados
    const data = servicios.map((s) => ({
      id: s.id,
      estado: s.estado,
      createdBy: s.createdBy,
      // serializar form a JSON
      form: JSON.stringify(s.form),
      puntos: JSON.stringify(s.puntos),
      valores: JSON.stringify(s.valores || []),
      chofer: s.chofer || "",
      movil: s.movil || "",
      descuento: JSON.stringify(s.descuentoServicioPorcentaje || []),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Servicios");
    XLSX.writeFile(wb, "servicios.xlsx");
  };

  // Importa desde Excel
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
      rows.forEach((row) => {
        try {
          const payload: Payload = {
            id: Number(row.id),
            estado: row.estado as Payload["estado"],
            createdBy: row.createdBy,
            form: JSON.parse(row.form),
            puntos: JSON.parse(row.puntos),
            valores: JSON.parse(row.valores),
            chofer: row.chofer || undefined,
            movil: row.movil || undefined,
            descuentoServicioPorcentaje: JSON.parse(row.descuento),
          };
          saveOrUpdateSent(payload);
        } catch (error) {
          console.error("Error procesando fila:", row, error);
        }
      });
      alert("Importación completada.");
      // reset
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">
        Import / Export Servicios
      </h1>
      <div className="flex justify-center gap-4">
        <button className="btn-primary" onClick={handleExport}>
          Exportar a Excel
        </button>
        <label className="btn-secondary cursor-pointer">
          Importar desde Excel
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
