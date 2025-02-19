// Mapeo de estado a clases de Tailwind para el badge
export const estadoStyles: Record<string, string> = {
  "por procesar": "bg-red-500",
  "en proceso": "bg-purple-500",
  "por facturar": "bg-orange-500",
  "facturado": "bg-blue-500",
  completado: "bg-green-500",
  cancelado: "bg-yellow-500",
};

// Definición de color de texto para cada badge
export const badgeTextColor: Record<string, string> = {
  "por procesar": "text-white",
  "en proceso": "text-white",
  "por facturar": "text-white",
  "facturado": "text-white",
  completado: "text-white",
  cancelado: "text-black",
};
