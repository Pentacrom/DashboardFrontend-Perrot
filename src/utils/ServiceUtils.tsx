// src/utils/ServiceUtils.ts
import { Payload, EstadoServicio } from "./ServiceDrafts";

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

  // a) Campos de p.form
  Object.entries(p.form).forEach(([key, value]) => {
    if (!Array.isArray(value)) {
      row[key] = value as string | number | boolean;
    }
  });

  // b) Campos de primer nivel en Payload que no son arrays
  row.id = p.id; // número
  row.estado = p.estado; // string
  row.createdBy = p.createdBy; // string

  if (p.chofer !== undefined) {
    row.chofer = p.chofer; // string
  }
  if (p.movil !== undefined) {
    row.movil = p.movil; // string
  }

  // c) Devolvemos todo + raw (Payload entero)
  return {
    ...row,
    raw: p,
  };
}
