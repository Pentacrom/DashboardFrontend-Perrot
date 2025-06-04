// Mapeo de estado a clases de Tailwind para el badge (colores básicos)
export const estadoStyles: Record<string, string> = {
  Pendiente:      "bg-yellow-500",
  "En Proceso":   "bg-red-500",
  "Por facturar": "bg-green-500",
  Completado:     "bg-green-700",
  "Sin Asignar":  "bg-blue-500",
  "Falso Flete":  "text-white",
};

// Color de texto para cada badge
export const badgeTextColor: Record<string, string> = {
  Pendiente:      "text-white",
  "En Proceso":   "text-white",
  "Por facturar": "text-white",
  Completado:     "text-white",
  Cancelado:      "text-white",
  "Sin Asignar":  "text-white",
  "Falso Flete":  "bg-gray-600",
};
