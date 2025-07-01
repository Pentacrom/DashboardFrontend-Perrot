import { 
    mockCatalogos, 
    mockCentros, 
    mockPaises, 
    FormState, 
    Punto, 
    Payload,
    getNextId
  } from "./ServiceDrafts";
  import * as XLSX from "xlsx";
  import ExcelJS from "exceljs";
  
  // Helper para normalizar strings
  function normalizeName(str: string): string {
    return str
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // quita tildes
      .replace(/\s+/g, " ") // unifica espacios
      .trim();
  }
  
  // Busca un item por nombre flexible
  function findItemByName<T extends { nombre: string }>(list: T[], name: string): T | undefined {
    const normName = normalizeName(name);
    return (
      list.find(item => normalizeName(item.nombre) === normName) ||
      list.find(item => normalizeName(item.nombre).includes(normName))
    );
  }
  
  /**
   * Mapea una fila del Excel a un Payload
   */
  export function mapExcelRowToPayload(row: any, nextId: number): Payload {
    const tipoOperacionObj = findItemByName(mockCatalogos.Operación, row["Tipo de Operacion"]);
    const tipoOperacion = tipoOperacionObj?.codigo || 0;
  
    const paisObj = findItemByName(mockPaises, row["Pais"]);
    const pais = paisObj?.codigo || 0;
  
    const tipoContObj = findItemByName(mockCatalogos.Tipo_contenedor, row["Tipo"]);
    const tipoContenedor = tipoContObj?.codigo || 0;
  
    const clienteObj = findItemByName(mockCatalogos.empresas, row["Cliente"]);
    const cliente = clienteObj?.id || 0;
  
    const origenLugarObj = findItemByName(mockCatalogos.Lugares, row["Lugar de Retiro 1"]);
    const origenLugar = origenLugarObj?.id || 0;
  
    const destinoLugarObj = findItemByName(
      mockCatalogos.Lugares,
      row["Lugar de Devolución / Puerto de embarque"]
    );
    const destinoLugar = destinoLugarObj?.id || 0;
  
    const opName = tipoOperacionObj?.nombre.toLowerCase();
    const centroObj = findItemByName(mockCentros, row["Sub Cliente"]);
    const subClienteCentro = centroObj?.codigo || 0;
  
    const lugarDevolucionId = opName === "importación" ? origenLugar : destinoLugar;
  
    const form: FormState = {
      grupoCliente: 0,
      cliente,
      tipoOperacion,
      origen: origenLugar,
      destino: destinoLugar,
      pais,
      fechaSol: new Date(),
      fechaIng: new Date(),
      tipoContenedor,
      kilos: 0,
      precioCarga: 0,
      temperatura: 0,
      idCCosto: 0,
      guiaDeDespacho: row["Guia"] || "",
      tarjeton: row["Tarjeton"] || "",
      nroContenedor: row["Contenedor"] || "",
      sello: row["Sello"] || "",
      nave: 0,
      observacion: row["Referencia"] || "",
      interchange: "",
      rcNoDevolucion: 0,
      odv: "",
      documentoPorContenedor: [],
      imoCargo: false,
      imoCategoria: 0,
      tipoServicio: 0,
      folio: nextId,
      fechaFolio: new Date(),
      eta: row["ETA_STACKING"] ? new Date(row["ETA_STACKING"]) : new Date(),
      ejecutivo: row["Ejecutivo"] || ""
    };
  
    const puntos: Punto[] = [
      {
        idLugar: origenLugar,
        accion: 8,
        estado: 0,
        eta: form.eta,
        observacion: form.observacion
      },
      {
        idLugar: lugarDevolucionId,
        accion: 4,
        estado: 0
      }
    ];
  
    return {
      id: nextId,
      form,
      puntos,
      estado: "Pendiente",
      createdBy: "importacion-excel"
    };
  }
  
  /**
   * Importa un archivo Excel (.xlsx, .xls, .csv) y devuelve un array de Payload.
   */
  export async function importExcelFile(file: File): Promise<Payload[]> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]!];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet!, { defval: "" });
    return rows.map(row => mapExcelRowToPayload(row, getNextId()));
  }
  
  /**
 * Exporta un array de objetos a un archivo Excel usando como plantilla
 * la hoja "EXPO" de un archivo de referencia.
 *
 * @param dataArray    Array de objetos planos (Payload o similares)
 * @param template     Archivo .xlsx de referencia (File/Blob) o URL donde esté publicado
 * @param filename     Nombre del archivo de salida (por defecto 'export.xlsx')
 */
export async function exportToExcelFile(
    dataArray: any[],
    template: File | Blob | string,
    filename = "export.xlsx"
  ): Promise<void> {
    // 1) Obtengo el buffer de la plantilla según el tipo:
    let tplBuf: ArrayBuffer;
    if (typeof template === "string") {
      // viene como URL
      const resp = await fetch(template);
      if (!resp.ok) throw new Error(`Error al descargar plantilla: ${resp.status}`);
      tplBuf = await resp.arrayBuffer();
    } else if (template instanceof Blob && "arrayBuffer" in template) {
      // viene como File o Blob
      tplBuf = await template.arrayBuffer();
    } else {
      throw new Error("template debe ser un File, Blob o string(URL)");
    }
  
    // 2) Cargo la plantilla
    const tplWb = new ExcelJS.Workbook();
    await tplWb.xlsx.load(tplBuf);
    const tplWs = tplWb.getWorksheet("EXPO");
    if (!tplWs) throw new Error(`No existe la hoja "EXPO" en la plantilla`);
  
    // 3) Creo el libro de salida y la hoja "EXPO"
    const outWb = new ExcelJS.Workbook();
    const outWs = outWb.addWorksheet("EXPO");
  
    // 4) Copio la altura de la fila de encabezado (fila 2)
    const headerTplRow = tplWs.getRow(2);
    outWs.getRow(2).height = headerTplRow.height;
  
    // 5) Agrego los encabezados y copio estilos
    const keys = Object.keys(dataArray[0] || {});
    const newHeader = outWs.addRow(keys);
    newHeader.eachCell((cell, idx) => {
      // idx es 0-based, getCell usa 1-based
      cell.style = { ...headerTplRow.getCell(idx + 1).style };
    });
  
    // 6) Llena datos a partir de la fila 3
    dataArray.forEach(item => {
      const values = keys.map(k => item[k]);
      outWs.addRow(values);
    });
  
    // 7) Ajusto ancho de columnas
    outWs.columns.forEach(col => (col.width = 20));
  
    // 8) Genero buffer y disparo descarga
    const buf = await outWb.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  