/**
 * Formatea un número como moneda CLP (sin decimales) con puntos de miles.
 *
 * Ejemplo: formatCLP(1234567) -> "CLP 1.234.567"
 */
export function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

// Formateo de fechas a HH:mm dd/MM/yyyy
export function formatFechaISO(iso: string | Date): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");

  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const dd = pad(d.getDate());
  const MM = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();

  return `${dd}/${MM}/${yyyy} ${hh}:${mm} `;
}

export function formatDateTimeLocal(input: Date | string | number | undefined): string {
  const d = input instanceof Date
    ? input
    : new Date(input!);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const YYYY = d.getFullYear();
  const MM   = pad(d.getMonth() + 1);
  const DD   = pad(d.getDate());
  const hh   = pad(d.getHours());
  const mm   = pad(d.getMinutes());

  return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
}

export const formatDateOnly = (d?: Date) =>
  d instanceof Date && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "";

