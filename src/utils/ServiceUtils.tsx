// src/utils/ServiceUtils.ts
import { Payload, EstadoServicio, mockCatalogos, mockPaises } from "./ServiceDrafts";

// 1. Ajustamos la firma de índice para que acepte también Payload.
//    De esta forma `raw: Payload` ya no choca con el [key: string]: ...
export interface ServiceRow {
  [key: string]: string | number | boolean | Payload | Date;
  raw: Payload;
}

// 2. Función para aplanar el Payload y extraer todos los campos primitivos
//    (no-array) + los campos básicos de primer nivel (id, estado, chofer, movil, createdBy).
export function payloadToRow(p: Payload): ServiceRow {
  const row: Record<string, string | number | boolean> = {};
  const form = p.form;

  // Helper function to get name from catalog
  const getNameFromCatalog = (catalog: any[], id: number | string, fallback: string) => {
    const item = catalog.find(c => c.id === id || c.codigo === id);
    return item?.nombre || fallback;
  };

  // a) Campos de p.form con lookups a nombres reales
  row.grupoCliente = form.grupoCliente;
  row.cliente = getNameFromCatalog(mockCatalogos.empresas, form.cliente, `Cliente ID: ${form.cliente}`);
  row.tipoOperacion = getNameFromCatalog(mockCatalogos.Operación, form.tipoOperacion, `Operación ID: ${form.tipoOperacion}`);
  row.origen = getNameFromCatalog(mockCatalogos.Lugares, form.origen, `Lugar ID: ${form.origen}`);
  row.destino = getNameFromCatalog(mockCatalogos.Lugares, form.destino, `Lugar ID: ${form.destino}`);
  row.pais = getNameFromCatalog(mockPaises, form.pais, `País ID: ${form.pais}`);
  row.fecha = form.fechaSol;
  row.tipo = getNameFromCatalog(mockCatalogos.Tipo_contenedor, form.tipoContenedor, `Container ID: ${form.tipoContenedor}`);
  row.tipoContenedor = getNameFromCatalog(mockCatalogos.Tipo_contenedor, form.tipoContenedor, `Container ID: ${form.tipoContenedor}`);
  row.kilos = form.kilos;
  row.precioCarga = form.precioCarga;
  row.temperatura = form.temperatura;
  row.guiaDeDespacho = form.guiaDeDespacho;
  row.tarjeton = form.tarjeton;
  row.nroContenedor = form.nroContenedor;
  row.sello = form.sello;
  row.nave = form.nave;
  row.observacion = form.observacion;
  row.interchange = form.interchange;
  row.odv = form.odv;
  row.imoCargo = form.imoCargo;
  row.imoCategoria = form.imoCategoria;
  row.tipoServicio = form.tipoServicio;
  row.folio = form.folio;
  row.fechaFolio = form.fechaFolio;
  row.eta = form.eta;
  row.ejecutivo = form.ejecutivo || '';

  // b) Campos de primer nivel en Payload
  row.id = p.id;
  row.estado = p.estado;
  row.estadoSeguimiento = p.estadoSeguimiento || 'Sin iniciar';
  row.pendienteDevolucion = p.pendienteDevolucion || false;
  row.correoEnviado = p.correoEnviado || false; // Por defecto no se ha enviado el correo
  row.createdBy = p.createdBy;

  if (p.chofer !== undefined) {
    row.chofer = p.chofer;
  }
  if (p.movil !== undefined) {
    row.movil = p.movil;
  }

  // c) Devolvemos todo + raw (Payload entero)
  return {
    ...row,
    raw: p,
  };
}
