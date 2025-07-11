import { 
    mockCatalogos, 
    mockCentros, 
    mockPaises, 
    FormState, 
    Punto, 
    Payload,
    getNextId,
    loadSent,
    loadDrafts,
    saveOrUpdateSent,
    EstadoSeguimiento
  } from "./ServiceDrafts";
  import { formatDateTime } from "./format";
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

  // Mapeo flexible de encabezados para diferentes formatos
  const HEADER_MAPPING: Record<string, string[]> = {
    ruta: ["ruta", "route"],
    origen: ["origen", "origin", "lugar de retiro 1"],
    destino: ["destino", "destination", "dirección de entrega", "direccion de entrega"],
    cliente: ["cliente", "customer", "empresa"],
    subCliente: ["sub cliente", "subclient", "sub client", "subcliente"],
    tipoOperacion: ["tipo de operacion", "operacion", "operation", "tipo operacion", "tipo de operación"],
    ejecutivo: ["ejecutivo", "executive", "vendedor", "sales"],
    direccionEntrega: ["dirección de entrega", "direccion entrega", "delivery address", "direccion de entrega"],
    referencia: ["referencia", "reference", "ref"],
    reserva: ["reserva", "reservation"],
    zona: ["zona", "zone"],
    zonaPortuaria: ["zona portuaria", "port zone", "zona portuaria"],
    pais: ["pais", "country", "país"],
    etaStacking: ["eta_stacking", "eta stacking", "eta"],
    naviera: ["naviera", "shipping line"],
    nave: ["nave", "vessel"],
    tipoContenedor: ["tipo", "tipo contenedor", "container type", "contenedor"],
    nroContenedor: ["contenedor", "container", "numero contenedor", "nro contenedor"],
    sello: ["sello", "seal"],
    condicion: ["condición", "condicion", "condition"],
    lugarRetiro1: ["lugar de retiro 1", "lugar retiro 1", "pickup place 1"],
    fechaRetiro1: ["fecha de retiro 1", "fecha retiro 1", "pickup date 1"],
    lugarRetiro2: ["lugar de retiro 2", "lugar retiro 2", "pickup place 2"],
    fechaRetiro2: ["fecha de retiro 2", "fecha retiro 2", "pickup date 2"],
    lugarDevolucion: ["lugar de devolucion", "puerto de embarque", "devolucion", "return place", "lugar de devolución", "lugar de devolución / puerto de embarque"],
    tarjeton: ["tarjeton", "ticket", "tarjetón"],
    maquina: ["maquina", "machine", "máquina"],
    guiaDeDespacho: ["guia", "guia despacho", "guia de despacho", "dispatch guide", "guía"],
    fechaPresentacion: ["fecha de presentacion", "fecha presentacion", "presentation date", "fecha de presentación"]
  };

  // Función para encontrar el valor de una celda usando mapeo flexible
  function findCellValue(row: any, fieldKey: string): string {
    const possibleHeaders = HEADER_MAPPING[fieldKey] || [fieldKey];
    
    for (const header of possibleHeaders) {
      // Buscar coincidencia exacta primero
      for (const rowKey of Object.keys(row)) {
        if (normalizeName(rowKey) === normalizeName(header)) {
          return row[rowKey] || "";
        }
      }
      
      // Buscar coincidencia parcial
      for (const rowKey of Object.keys(row)) {
        if (normalizeName(rowKey).includes(normalizeName(header))) {
          return row[rowKey] || "";
        }
      }
    }
    
    return "";
  }
  
  /**
   * Valida los datos de un payload y devuelve errores de validación
   * Campos obligatorios: ruta (origen y destino válidos), tipo de operación, ejecutivo, 
   * cliente, dirección de entrega, país, ETA, naviera, nave, tipo, 
   * lugar de retiro 1, fecha de retiro 1, lugar de devolución, fecha de presentación
   */
  function validatePayloadData(payload: Payload, originalRow: any): FieldValidationError[] {
    const errors: FieldValidationError[] = [];
    const form = payload.form;
    const puntos = payload.puntos || [];

    // 1. Validar RUTA (origen y destino válidos en base de datos)
    if (!form.origen || form.origen === 0) {
      errors.push({
        field: 'origen',
        error: 'Ruta: Origen requerido y debe existir en base de datos',
        value: findCellValue(originalRow, "origen") || findCellValue(originalRow, "ruta") || findCellValue(originalRow, "lugarRetiro1")
      });
    } else {
      // Verificar que el origen existe en la base de datos
      const origenExists = mockCatalogos.Lugares.find(l => l.id === form.origen);
      if (!origenExists) {
        errors.push({
          field: 'origen',
          error: 'Ruta: Origen no existe en base de datos',
          value: findCellValue(originalRow, "origen") || findCellValue(originalRow, "ruta")
        });
      }
    }

    if (!form.destino || form.destino === 0) {
      errors.push({
        field: 'destino',
        error: 'Ruta: Destino requerido y debe existir en base de datos',
        value: findCellValue(originalRow, "destino") || findCellValue(originalRow, "ruta") || findCellValue(originalRow, "direccionEntrega")
      });
    } else {
      // Verificar que el destino existe en la base de datos
      const destinoExists = mockCatalogos.Lugares.find(l => l.id === form.destino);
      if (!destinoExists) {
        errors.push({
          field: 'destino',
          error: 'Ruta: Destino no existe en base de datos',
          value: findCellValue(originalRow, "destino") || findCellValue(originalRow, "ruta")
        });
      }
    }

    // 2. Validar TIPO DE OPERACIÓN (obligatorio)
    if (!form.tipoOperacion || form.tipoOperacion === 0) {
      errors.push({
        field: 'tipoOperacion',
        error: 'Tipo de operación requerido y debe existir en catálogo',
        value: findCellValue(originalRow, "tipoOperacion")
      });
    } else {
      const tipoOpExists = mockCatalogos.Operación.find(op => op.codigo === form.tipoOperacion);
      if (!tipoOpExists) {
        errors.push({
          field: 'tipoOperacion',
          error: 'Tipo de operación no existe en catálogo',
          value: findCellValue(originalRow, "tipoOperacion")
        });
      }
    }

    // 3. Validar EJECUTIVO (obligatorio, no usar valores por defecto)
    const ejecutivoValue = findCellValue(originalRow, "ejecutivo");
    if (!ejecutivoValue || ejecutivoValue.trim() === '' || payload.createdBy === 'importacion-excel') {
      errors.push({
        field: 'ejecutivo',
        error: 'Ejecutivo requerido, no se aceptan valores vacíos',
        value: ejecutivoValue
      });
    }

    // 4. Validar CLIENTE (obligatorio y debe existir)
    if (!form.cliente || form.cliente === 0) {
      errors.push({
        field: 'cliente',
        error: 'Cliente requerido y debe existir en base de datos',
        value: findCellValue(originalRow, "cliente")
      });
    } else {
      const clienteExists = mockCatalogos.empresas.find(e => e.id === form.cliente);
      if (!clienteExists) {
        errors.push({
          field: 'cliente',
          error: 'Cliente no existe en base de datos',
          value: findCellValue(originalRow, "cliente")
        });
      }
    }

    // 5. Validar DIRECCIÓN DE ENTREGA (verificar en puntos)
    const direccionEntregaValue = findCellValue(originalRow, "direccionEntrega");
    if (!direccionEntregaValue || direccionEntregaValue.trim() === '') {
      errors.push({
        field: 'direccionEntrega',
        error: 'Dirección de entrega requerida',
        value: direccionEntregaValue
      });
    }

    // 6. Validar PAÍS (obligatorio y debe existir)
    if (!form.pais || form.pais === 0) {
      errors.push({
        field: 'pais',
        error: 'País requerido y debe existir en catálogo',
        value: findCellValue(originalRow, "pais")
      });
    } else {
      const paisExists = mockPaises.find(p => p.codigo === form.pais);
      if (!paisExists) {
        errors.push({
          field: 'pais',
          error: 'País no existe en catálogo',
          value: findCellValue(originalRow, "pais")
        });
      }
    }

    // 7. Validar ETA (obligatorio y válido)
    const etaValue = findCellValue(originalRow, "etaStacking") || findCellValue(originalRow, "eta");
    if (!etaValue || etaValue.trim() === '') {
      errors.push({
        field: 'eta',
        error: 'ETA requerido',
        value: etaValue
      });
    } else {
      const etaDate = new Date(etaValue);
      if (isNaN(etaDate.getTime())) {
        errors.push({
          field: 'eta',
          error: 'ETA debe ser una fecha válida',
          value: etaValue
        });
      }
    }

    // 8. Validar NAVIERA (obligatorio y debe existir)
    if (!form.naviera || form.naviera === 0) {
      errors.push({
        field: 'naviera',
        error: 'Naviera requerida y debe existir en catálogo',
        value: findCellValue(originalRow, "naviera")
      });
    } else {
      const navieraExists = mockCatalogos.navieras.find(n => n.codigo === form.naviera);
      if (!navieraExists) {
        errors.push({
          field: 'naviera',
          error: 'Naviera no existe en catálogo',
          value: findCellValue(originalRow, "naviera")
        });
      }
    }

    // 9. Validar NAVE (obligatorio y debe existir)
    if (!form.nave || form.nave === 0) {
      errors.push({
        field: 'nave',
        error: 'Nave requerida y debe existir en catálogo',
        value: findCellValue(originalRow, "nave")
      });
    } else {
      const naveExists = mockCatalogos.naves.find(n => n.id === form.nave);
      if (!naveExists) {
        errors.push({
          field: 'nave',
          error: 'Nave no existe en catálogo',
          value: findCellValue(originalRow, "nave")
        });
      } else if (form.naviera && naveExists.naviera !== form.naviera) {
        errors.push({
          field: 'nave',
          error: 'Nave no pertenece a la naviera seleccionada',
          value: findCellValue(originalRow, "nave")
        });
      }
    }

    // 10. Validar TIPO (Tipo de contenedor, obligatorio)
    if (!form.tipoContenedor || form.tipoContenedor === 0) {
      errors.push({
        field: 'tipoContenedor',
        error: 'Tipo de contenedor requerido y debe existir en catálogo',
        value: findCellValue(originalRow, "tipoContenedor")
      });
    } else {
      const tipoExists = mockCatalogos.Tipo_contenedor.find(t => t.codigo === form.tipoContenedor);
      if (!tipoExists) {
        errors.push({
          field: 'tipoContenedor',
          error: 'Tipo de contenedor no existe en catálogo',
          value: findCellValue(originalRow, "tipoContenedor")
        });
      }
    }

    // 11. Validar LUGAR DE RETIRO 1 (obligatorio)
    const lugarRetiro1Value = findCellValue(originalRow, "lugarRetiro1");
    if (!lugarRetiro1Value || lugarRetiro1Value.trim() === '') {
      errors.push({
        field: 'lugarRetiro1',
        error: 'Lugar de retiro 1 requerido',
        value: lugarRetiro1Value
      });
    } else {
      // Verificar que existe en catálogo
      const lugarExists = findItemByName(mockCatalogos.Lugares, lugarRetiro1Value);
      if (!lugarExists) {
        errors.push({
          field: 'lugarRetiro1',
          error: 'Lugar de retiro 1 no existe en base de datos',
          value: lugarRetiro1Value
        });
      }
    }

    // 12. Validar FECHA DE RETIRO 1 (obligatorio)
    const fechaRetiro1Value = findCellValue(originalRow, "fechaRetiro1");
    if (!fechaRetiro1Value || fechaRetiro1Value.trim() === '') {
      errors.push({
        field: 'fechaRetiro1',
        error: 'Fecha de retiro 1 requerida',
        value: fechaRetiro1Value
      });
    } else {
      const fechaRetiro1Date = new Date(fechaRetiro1Value);
      if (isNaN(fechaRetiro1Date.getTime())) {
        errors.push({
          field: 'fechaRetiro1',
          error: 'Fecha de retiro 1 debe ser una fecha válida',
          value: fechaRetiro1Value
        });
      }
    }

    // 13. Validar LUGAR DE DEVOLUCIÓN (obligatorio)
    const lugarDevolucionValue = findCellValue(originalRow, "lugarDevolucion");
    if (!lugarDevolucionValue || lugarDevolucionValue.trim() === '') {
      errors.push({
        field: 'lugarDevolucion',
        error: 'Lugar de devolución requerido',
        value: lugarDevolucionValue
      });
    } else {
      // Verificar que existe en catálogo
      const lugarExists = findItemByName(mockCatalogos.Lugares, lugarDevolucionValue);
      if (!lugarExists) {
        errors.push({
          field: 'lugarDevolucion',
          error: 'Lugar de devolución no existe en base de datos',
          value: lugarDevolucionValue
        });
      }
    }

    // 14. Validar FECHA DE PRESENTACIÓN (obligatorio)
    const fechaPresentacionValue = findCellValue(originalRow, "fechaPresentacion");
    if (!fechaPresentacionValue || fechaPresentacionValue.trim() === '') {
      errors.push({
        field: 'fechaPresentacion',
        error: 'Fecha de presentación requerida',
        value: fechaPresentacionValue
      });
    } else {
      const fechaPresentacionDate = new Date(fechaPresentacionValue);
      if (isNaN(fechaPresentacionDate.getTime())) {
        errors.push({
          field: 'fechaPresentacion',
          error: 'Fecha de presentación debe ser una fecha válida',
          value: fechaPresentacionValue
        });
      }
    }

    return errors;
  }

  /**
   * Mapea una fila del Excel a un Payload
   */
  export function mapExcelRowToPayload(row: any, nextId: number, currentUser?: string): Payload {
    // VALIDACIÓN ESTRICTA: No usar valores por defecto para campos obligatorios
    const tipoOperacionValue = findCellValue(row, "tipoOperacion");
    const tipoOperacionObj = tipoOperacionValue && tipoOperacionValue.trim() !== '' ? findItemByName(mockCatalogos.Operación, tipoOperacionValue) : null;
    const tipoOperacion = tipoOperacionObj?.codigo || 0;
  
    const paisValue = findCellValue(row, "pais");
    const paisObj = paisValue && paisValue.trim() !== '' ? findItemByName(mockPaises, paisValue) : null;
    const pais = paisObj?.codigo || 0;
  
    const tipoContenedorValue = findCellValue(row, "tipoContenedor");
    const tipoContObj = tipoContenedorValue && tipoContenedorValue.trim() !== '' ? findItemByName(mockCatalogos.Tipo_contenedor, tipoContenedorValue) : null;
    const tipoContenedor = tipoContObj?.codigo || 0;
  
    // Cliente - VALIDACIÓN ESTRICTA: No usar valores por defecto
    const clienteValue = findCellValue(row, "cliente");
    const clienteObj = clienteValue && clienteValue.trim() !== '' ? findItemByName(mockCatalogos.empresas, clienteValue) : null;
    const cliente = clienteObj?.id || 0;
  
    // Obtener origen y destino sin usar valores por defecto - VALIDACIÓN ESTRICTA
    let origenValue = findCellValue(row, "origen");
    let destinoValue = findCellValue(row, "destino");
    
    // Si no se encuentran, intentar parsear desde la ruta SOLO si los campos están completamente vacíos
    if ((!origenValue || origenValue.trim() === '') || (!destinoValue || destinoValue.trim() === '')) {
      const rutaValue = findCellValue(row, "ruta");
      if (rutaValue && rutaValue.includes('/')) {
        const [rutaOrigen, rutaDestino] = rutaValue.split('/');
        if (!origenValue || origenValue.trim() === '') {
          origenValue = rutaOrigen?.trim() || '';
        }
        if (!destinoValue || destinoValue.trim() === '') {
          destinoValue = rutaDestino?.trim() || '';
        }
      }
    }
    
    // Solo buscar si el valor existe y no está vacío - NO usar valores por defecto
    const origenLugarObj = origenValue && origenValue.trim() !== '' ? findItemByName(mockCatalogos.Lugares, origenValue) : null;
    const origenLugar = origenLugarObj?.id || 0;
  
    const destinoLugarObj = destinoValue && destinoValue.trim() !== '' ? findItemByName(mockCatalogos.Lugares, destinoValue) : null;
    const destinoLugar = destinoLugarObj?.id || 0;

    // Naviera y Nave - VALIDACIÓN ESTRICTA: No usar valores por defecto
    const navieraValue = findCellValue(row, "naviera");
    const navieraObj = navieraValue && navieraValue.trim() !== '' ? findItemByName(mockCatalogos.navieras, navieraValue) : null;
    const naviera = navieraObj?.codigo || 0;
    
    const naveValue = findCellValue(row, "nave");
    const naveObj = naveValue && naveValue.trim() !== '' ? findItemByName(mockCatalogos.naves, naveValue) : null;
    const nave = naveObj?.id || 0;
  
    const opName = tipoOperacionObj?.nombre.toLowerCase();
  
    const lugarDevolucionId = opName === "importación" ? origenLugar : destinoLugar;
  
    // ETA - VALIDACIÓN ESTRICTA: No usar fecha actual por defecto
    const etaValue = findCellValue(row, "etaStacking") || findCellValue(row, "eta");
    let etaDate: Date;
    if (etaValue && etaValue.trim() !== '') {
      etaDate = new Date(etaValue);
      // Si la fecha no es válida, usar una fecha mínima para que falle la validación
      if (isNaN(etaDate.getTime())) {
        etaDate = new Date(0);
      }
    } else {
      // No hay ETA proporcionado - usar fecha mínima para que falle la validación
      etaDate = new Date(0);
    }
    
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
      kilos: parseInt(findCellValue(row, "kilos")) || 0,
      precioCarga: parseFloat(findCellValue(row, "precioCarga")) || 0,
      temperatura: parseFloat(findCellValue(row, "temperatura")) || 0,
      idCCosto: 0,
      guiaDeDespacho: findCellValue(row, "guiaDeDespacho"),
      tarjeton: findCellValue(row, "tarjeton"),
      nroContenedor: findCellValue(row, "nroContenedor"),
      sello: findCellValue(row, "sello"),
      naviera: naviera,
      nave: nave,
      observacion: findCellValue(row, "observacion"),
      interchange: "",
      rcNoDevolucion: 0,
      odv: "",
      documentoPorContenedor: [],
      imoCargo: false,
      imoCategoria: 0,
      tipoServicio: 0,
      folio: nextId,
      fechaFolio: new Date(),
      eta: etaDate,
      ejecutivo: currentUser || findCellValue(row, "ejecutivo").trim() || "usuario-importacion"
    };
  
    const puntos: Punto[] = [
      {
        idLugar: origenLugar,
        accion: 8,
        estado: 0,
        eta: form.eta,
        observacion: form.observacion,
        naviera: naviera
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
      estadoSeguimiento: "Sin iniciar",
      pendienteDevolucion: false,
      createdBy: findCellValue(row, "ejecutivo").trim() || "importacion-excel"
    };
  }
  
  // Interfaz para rastrear lotes de importación
  export interface ImportBatch {
    batchId: string;
    timestamp: Date;
    filename: string;
    serviceIds: number[];
    rowCount: number;
  }

  // Función para generar ID único de lote
  function generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Función para guardar información del lote
  function saveImportBatch(batch: ImportBatch): void {
    const batches = getImportBatches();
    batches.push(batch);
    localStorage.setItem("importBatches", JSON.stringify(batches));
  }

  // Función para obtener lotes guardados
  export function getImportBatches(): ImportBatch[] {
    const stored = localStorage.getItem("importBatches");
    return stored ? JSON.parse(stored) : [];
  }

  // Función para hacer rollback de un lote
  export function rollbackImportBatch(batchId: string): boolean {
    try {
      const batches = getImportBatches();
      const batch = batches.find(b => b.batchId === batchId);
      if (!batch) return false;

      // Eliminar servicios del lote
      const sent = loadSent();
      const drafts = loadDrafts();
      
      // Filtrar servicios que no pertenecen al lote
      const filteredSent = sent.filter((s: any) => !batch.serviceIds.includes(s.id));
      const filteredDrafts = drafts.filter((d: any) => !batch.serviceIds.includes(d.id));
      
      // Guardar listas filtradas
      localStorage.setItem("serviciosEnviados", JSON.stringify(filteredSent));
      localStorage.setItem("serviciosBorradores", JSON.stringify(filteredDrafts));
      
      // Eliminar el lote del registro
      const remainingBatches = batches.filter(b => b.batchId !== batchId);
      localStorage.setItem("importBatches", JSON.stringify(remainingBatches));
      
      return true;
    } catch (error) {
      console.error("Error en rollback:", error);
      return false;
    }
  }

  /**
   * Interfaz para errores de validación de campos
   */
  export interface FieldValidationError {
    field: string;
    error: string;
    value: any;
  }

  /**
   * Interfaz para payload con información de validación
   */
  export interface ValidatedPayload extends Payload {
    validationErrors: FieldValidationError[];
    isValid: boolean;
  }

  /**
   * Interfaz para el resultado de validación de importación
   */
  export interface ImportValidationResult {
    payloads: ValidatedPayload[];
    batchInfo: { batchId: string; filename: string; rowCount: number };
    duplicateIds: number[];
    duplicatesInFile: number[];
    validPayloads: ValidatedPayload[];
    rejectedRows: ValidatedPayload[];
    skippedCount: number;
  }

  /**
   * Importa un archivo Excel de carga masiva y devuelve un array de Payload con validación de duplicados.
   */
  export async function importCargaMasivaFile(file: File, currentUser?: string): Promise<ImportValidationResult> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]!];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet!, { defval: "" });
    
    const batchId = generateBatchId();
    
    // Mapear todas las filas a payloads con validación
    const allPayloads: ValidatedPayload[] = rows.map(row => {
      const payload = mapExcelRowToPayload(row, getNextId());
      payload.importBatchId = batchId;
      
      // Validar datos del payload
      const validationErrors = validatePayloadData(payload, row);
      const isValid = validationErrors.length === 0;
      
      return {
        ...payload,
        validationErrors,
        isValid
      } as ValidatedPayload;
    });

    // Obtener servicios existentes en el sistema
    const existingSent = loadSent() as Payload[];
    const existingDrafts = loadDrafts() as Payload[];
    const allExistingServices = [...existingSent, ...existingDrafts];
    
    // Función para crear una clave única basada en los datos del servicio
    const createServiceKey = (payload: Payload): string => {
      const form = payload.form;
      // Usar múltiples campos para crear una clave única más robusta
      const contenedor = form.nroContenedor || 'sin-contenedor';
      const fecha = form.fechaSol ? new Date(form.fechaSol).toISOString().split('T')[0] : 'sin-fecha';
      return `${form.cliente}-${form.tipoOperacion}-${contenedor}-${form.origen}-${form.destino}-${fecha}`;
    };
    
    // Crear conjunto de claves existentes
    const existingKeys = new Set(
      allExistingServices.map(service => createServiceKey(service))
    );

    // Detectar duplicados
    const duplicateIds: number[] = [];
    const duplicatesInFile: number[] = [];
    const fileKeys = new Set<string>();
    
    // Validar duplicados y errores
    const validPayloads: ValidatedPayload[] = [];
    const rejectedRows: ValidatedPayload[] = [];
    
    for (const payload of allPayloads) {
      const serviceKey = createServiceKey(payload);
      
      // Si tiene errores de validación, rechazar directamente
      if (payload.validationErrors.length > 0) {
        rejectedRows.push(payload);
        continue;
      }
      
      // Verificar si ya existe en el sistema (usando datos del servicio, no ID)
      if (existingKeys.has(serviceKey)) {
        duplicateIds.push(payload.id);
        continue;
      }
      
      // Verificar si está duplicado dentro del archivo
      if (fileKeys.has(serviceKey)) {
        duplicatesInFile.push(payload.id);
        continue;
      }
      
      // Solo agregar a válidos si no hay errores ni duplicados
      fileKeys.add(serviceKey);
      validPayloads.push(payload);
    }

    const batchInfo = {
      batchId,
      filename: file.name,
      rowCount: rows.length
    };

    return { 
      payloads: allPayloads,
      batchInfo,
      duplicateIds: Array.from(new Set(duplicateIds)),
      duplicatesInFile: Array.from(new Set(duplicatesInFile)),
      validPayloads,
      rejectedRows: rejectedRows || [], // Agregar filas rechazadas por errores de validación
      skippedCount: duplicateIds.length + duplicatesInFile.length + rejectedRows.length
    };
  }

  /**
   * Importa un archivo Excel (.xlsx, .xls, .csv) y devuelve un array de Payload.
   */
  export async function importExcelFile(file: File): Promise<{
    payloads: Payload[];
    batchInfo: { batchId: string; filename: string; rowCount: number };
  }> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]!];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet!, { defval: "" });
    
    const batchId = generateBatchId();
    const payloads = rows.map(row => {
      const payload = mapExcelRowToPayload(row, getNextId());
      // Marcar el payload con el ID del lote
      payload.importBatchId = batchId;
      return payload;
    });

    const batchInfo = {
      batchId,
      filename: file.name,
      rowCount: rows.length
    };

    return { payloads, batchInfo };
  }

  /**
   * Confirma la importación guardando los servicios válidos y registrando el lote
   */
  export function confirmImport(payloads: Payload[], batchInfo: { batchId: string; filename: string; rowCount: number }): void {
    // Guardar solo los servicios válidos (sin duplicados)
    payloads.forEach(payload => saveOrUpdateSent(payload));
    
    // Registrar el lote para posible rollback
    const batch: ImportBatch = {
      batchId: batchInfo.batchId,
      timestamp: new Date(),
      filename: batchInfo.filename,
      serviceIds: payloads.map(p => p.id),
      rowCount: payloads.length // Usar la cantidad real de servicios importados
    };
    
    saveImportBatch(batch);
  }
  
  /**
   * Exporta un array de ServiceRow a un archivo Excel usando el formato de carga masiva
   */
  export async function exportToCargaMasivaFile(dataArray: any[], filename = "servicios_export.xlsx"): Promise<void> {
    // Función helper para extraer valores del payload
    function getPayloadValue(row: any, field: string): string {
      const payload = row.raw || row;
      const form = payload.form || {};
      const puntos = payload.puntos || [];
      
      // Obtener el tipo de operación
      const tipoOperacion = mockCatalogos.Operación.find(op => op.codigo === form.tipoOperacion);
      const esExportacion = tipoOperacion?.nombre.toLowerCase() === "exportación";
      const esImportacion = tipoOperacion?.nombre.toLowerCase() === "importación";
      
      switch (field) {
        case 'Ruta':
          const origenObj = mockCatalogos.Lugares.find(lugar => lugar.id === form.origen);
          const destinoObj = mockCatalogos.Lugares.find(lugar => lugar.id === form.destino);
          const origenNombre = origenObj?.nombre || '';
          const destinoNombre = destinoObj?.nombre || '';
          return origenNombre && destinoNombre ? `${origenNombre}/${destinoNombre}` : '';
        case 'Tipo de Operacion':
          const tipoOp = mockCatalogos.Operación.find(op => op.codigo === form.tipoOperacion);
          return tipoOp?.nombre || '';
        case 'Ejecutivo':
          return payload.createdBy || '';
        case 'Cliente':
          const cliente = mockCatalogos.empresas.find(emp => emp.id === form.cliente);
          return cliente?.nombre || '';
        case 'Sub Cliente':
          // Subcliente es el Centro elegido en el origen o destino
          const origenCentro = mockCatalogos.Lugares.find(lugar => lugar.id === form.origen && lugar.tipo === 'Centro');
          const destinoCentro = mockCatalogos.Lugares.find(lugar => lugar.id === form.destino && lugar.tipo === 'Centro');
          return origenCentro?.nombre || destinoCentro?.nombre || '';
        case 'Dirección de entrega':
          // Lugar del último punto cuya acción involucra dejar la carga
          // (vaciar container, dejar container cargado, o dejar carga)
          const ultimoPuntoEntrega = [...puntos].reverse().find(p => 
            p.accion === 4 ||  // dejar container cargado
            p.accion === 7 ||  // vaciar container
            p.accion === 12    // dejar carga
          );
          if (ultimoPuntoEntrega) {
            const lugar = mockCatalogos.Lugares.find(lugar => lugar.id === ultimoPuntoEntrega.idLugar);
            return lugar?.nombre || '';
          }
          return '';
        case 'Referencia':
          return form.observacion || '';
        case 'Reserva':
          return ''; // Este campo no está mapeado actualmente
        case 'Zona':
          return ''; // Este campo no está mapeado actualmente
        case 'Zona Portuaria':
          // Zona portuaria es el origen en importación, y destino en exportación
          const zonaPortuaria = esImportacion ? 
            mockCatalogos.Lugares.find(lugar => lugar.id === form.origen) :
            mockCatalogos.Lugares.find(lugar => lugar.id === form.destino);
          return zonaPortuaria?.nombre || '';
        case 'Pais':
          const pais = mockPaises.find(p => p.codigo === form.pais);
          return pais?.nombre || '';
        case 'ETA_STACKING':
          return form.eta ? formatDateTime(form.eta) : '';
        case 'Naviera':
          const naviera = mockCatalogos.navieras.find(n => n.codigo === form.naviera);
          return naviera?.nombre || '';
        case 'Nave':
          const nave = mockCatalogos.naves.find(n => n.id === form.nave);
          return nave?.nombre || '';
        case 'Tipo':
          const tipoCont = mockCatalogos.Tipo_contenedor.find(tipo => tipo.codigo === form.tipoContenedor);
          return tipoCont?.nombre || '';
        case 'Contenedor':
          return form.nroContenedor || '';
        case 'Sello':
          return form.sello || '';
        case 'Condición':
          return ''; // Este campo no está mapeado actualmente
        case 'Lugar de Retiro 1':
          // Primer punto cuya acción sea retirar container (vacío o cargado) o carga
          const puntoRetiro1 = puntos.find(p => 
            p.accion === 1 ||  // retirar container vacío
            p.accion === 2 ||  // retirar container cargado
            p.accion === 11    // retirar carga
          );
          if (puntoRetiro1) {
            const lugar = mockCatalogos.Lugares.find(lugar => lugar.id === puntoRetiro1.idLugar);
            return lugar?.nombre || '';
          }
          return '';
        case 'Fecha de Retiro 1':
          // Fecha del primer punto de retiro
          const puntoRetiro1Fecha = puntos.find(p => 
            p.accion === 1 ||  // retirar container vacío
            p.accion === 2 ||  // retirar container cargado
            p.accion === 11    // retirar carga
          );
          return puntoRetiro1Fecha?.eta ? formatDateTime(puntoRetiro1Fecha.eta) : '';
        case 'Lugar de Retiro 2':
          // Solo si hay un retiro de container vacío seguido de llenar container
          const retiroVacio = puntos.find(p => p.accion === 1); // retirar container vacío
          if (retiroVacio) {
            // Buscar el punto donde se llena el container después del retiro vacío
            const indiceRetiroVacio = puntos.indexOf(retiroVacio);
            const puntoLlenar = puntos.slice(indiceRetiroVacio + 1).find(p => p.accion === 6);
            if (puntoLlenar) {
              const lugar = mockCatalogos.Lugares.find(lugar => lugar.id === puntoLlenar.idLugar);
              return lugar?.nombre || '';
            }
          }
          return '';
        case 'Fecha de Retiro 2':
          // Fecha del punto donde se llena el container (solo si hay retiro de container vacío)
          const retiroVacioFecha = puntos.find(p => p.accion === 1); // retirar container vacío
          if (retiroVacioFecha) {
            const indiceRetiroVacio = puntos.indexOf(retiroVacioFecha);
            const puntoLlenar = puntos.slice(indiceRetiroVacio + 1).find(p => p.accion === 6);
            return puntoLlenar?.eta ? formatDateTime(puntoLlenar.eta) : '';
          }
          return '';
        case 'Lugar de Devolución / Puerto de embarque':
          // Último punto donde se deja el container (vacío o cargado), no carga suelta
          const ultimoPuntoDevolucion = [...puntos].reverse().find(p => 
            p.accion === 3 ||  // dejar container vacío
            p.accion === 4     // dejar container cargado
          );
          if (ultimoPuntoDevolucion) {
            const lugar = mockCatalogos.Lugares.find(lugar => lugar.id === ultimoPuntoDevolucion.idLugar);
            return lugar?.nombre || '';
          }
          return '';
        case 'Tarjeton':
          return form.tarjeton || '';
        case 'Maquina':
          return ''; // Este campo no está mapeado actualmente
        case 'Guia':
          return form.guiaDeDespacho || '';
        case 'Fecha de Presentación':
          // Fecha del punto donde se deja la carga específicamente
          const ultimoPuntoPresentacion = [...puntos].reverse().find(p => 
            p.accion === 12    // dejar carga
          );
          if (ultimoPuntoPresentacion?.eta) {
            return formatDateTime(ultimoPuntoPresentacion.eta);
          }
          return form.fechaIng ? formatDateTime(form.fechaIng) : '';
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
    const data = dataArray.map(row => {
      const excelRow: Record<string, any> = {};
      headers.forEach(header => {
        excelRow[header] = getPayloadValue(row, header);
      });
      return excelRow;
    });

    // Crear libro de Excel
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Servicios");
    XLSX.writeFile(wb, filename);
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
  
  