// Mapeo de estado a clases de Tailwind para el badge (colores básicos)
export const estadoStyles: Record<string, string> = {
  Pendiente:      "bg-yellow-500",
  "En Proceso":   "bg-red-500",
  "Validado": "bg-green-500",
  Completado:     "bg-green-700",
  "Sin Asignar":  "bg-blue-500",
  "Falso Flete": "bg-gray-600",
  "Por validar":  "bg-purple-500",
};

// Color de texto para cada badge
export const badgeTextColor: Record<string, string> = {
  Pendiente:      "text-white",
  "En Proceso":   "text-white",
  "Por facturar": "text-white",
  Completado:     "text-white",
  Cancelado:      "text-white",
  "Sin Asignar":  "text-white",
  "Falso Flete": "text-white",
  "Por validar":  "text-white",
};
