import React from 'react';

const ServiciosPorFacturar: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Servicios por Facturar</h1>
      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                N° Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Monto a Facturar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha del Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">001</td>
              <td className="px-6 py-4 whitespace-nowrap">Empresa A</td>
              <td className="px-6 py-4 whitespace-nowrap">$15,000</td>
              <td className="px-6 py-4 whitespace-nowrap">2025-02-10</td>
              <td className="px-6 py-4 whitespace-nowrap">Pendiente</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">002</td>
              <td className="px-6 py-4 whitespace-nowrap">Empresa B</td>
              <td className="px-6 py-4 whitespace-nowrap">$12,500</td>
              <td className="px-6 py-4 whitespace-nowrap">2025-02-11</td>
              <td className="px-6 py-4 whitespace-nowrap">Pendiente</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">003</td>
              <td className="px-6 py-4 whitespace-nowrap">Empresa C</td>
              <td className="px-6 py-4 whitespace-nowrap">$18,000</td>
              <td className="px-6 py-4 whitespace-nowrap">2025-02-12</td>
              <td className="px-6 py-4 whitespace-nowrap">Pendiente</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiciosPorFacturar;
