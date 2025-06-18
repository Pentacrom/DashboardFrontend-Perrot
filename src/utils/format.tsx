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

