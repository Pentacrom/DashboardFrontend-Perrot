// src/components/EstadoSeguimientoOval.tsx
import React from 'react';
import { EstadoSeguimiento, estadoSeguimientoStyles } from '../utils/ServiceDrafts';

interface EstadoSeguimientoOvalProps {
  estado: EstadoSeguimiento;
  className?: string;
}

export const EstadoSeguimientoOval: React.FC<EstadoSeguimientoOvalProps> = ({ 
  estado, 
  className = "" 
}) => {
  const styles = estadoSeguimientoStyles[estado];
  
  // Debug: Log estados que no tienen estilos definidos
  if (!styles) {
    console.warn(`EstadoSeguimientoOval: No hay estilos definidos para el estado: "${estado}"`);
    console.warn(`Estados disponibles:`, Object.keys(estadoSeguimientoStyles));
  }
  
  // Si no tiene estilos definidos, usar estilo por defecto
  const defaultStyles = styles || { 
    bg: "bg-gray-100", 
    text: "text-gray-800", 
    border: "border-gray-300" 
  };
  
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div 
        className={`
          px-3 py-1 rounded-full text-xs font-medium border
          ${defaultStyles.bg} ${defaultStyles.text} ${defaultStyles.border}
        `}
      >
        {estado}
      </div>
    </div>
  );
};

export default EstadoSeguimientoOval;