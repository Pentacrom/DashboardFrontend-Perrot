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
  
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div 
        className={`
          px-3 py-1 rounded-full text-xs font-medium border
          ${styles.bg} ${styles.text} ${styles.border}
        `}
      >
        {estado}
      </div>
    </div>
  );
};

export default EstadoSeguimientoOval;