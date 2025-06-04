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
