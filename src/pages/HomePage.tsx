// src/pages/HomePage.tsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { loadDrafts, loadSent, Payload } from "../utils/ServiceDrafts";
import { formatCLP } from "../utils/format";
import { formatFechaISO } from "../utils/ServiceDrafts"; // reutilizamos formateo

interface Stats {
  totalIngresados: number;
  completados: number;
  valorados: number;
  porFacturar: number;
  pendientes: number;
  activos: number;
  porValidar: number;
}

const HomePage: React.FC = () => {
  const { userName, roles } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalIngresados: 0,
    completados: 0,
    valorados: 0,
    porFacturar: 0,
    pendientes: 0,
    activos: 0,
    porValidar: 0,
  });
  const [recent, setRecent] = useState<Payload[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const drafts = loadDrafts();
      const sent = loadSent();
      const all: Payload[] = [...drafts, ...sent];
      const totalIngresados = all.length;
      const completados = all.filter((s) => s.estado === "Completado").length;
      const porFacturar = all.filter((s) => s.estado === "Por facturar").length;
      const pendientes = all.filter((s) => s.estado === "Pendiente").length;
      const valorados = all.filter((s) => (s.valores?.length || 0) > 0).length;
      const activos = sent.filter((s) => s.estado !== "Completado").length;
      const porValidar = all.filter((s) => s.estado === "Por validar").length;

      setStats({
        totalIngresados,
        completados,
        valorados,
        porFacturar,
        pendientes,
        activos,
        porValidar,
      });
      // tomar los últimos 5 servicios por ID descendente
      const sorted = [...all].sort((a, b) => b.id - a.id).slice(0, 5);
      setRecent(sorted);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-10 bg-gray-300 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const {
    totalIngresados,
    completados,
    valorados,
    porFacturar,
    pendientes,
    activos,
    porValidar,
  } = stats;

  const renderCards = () => {
    if (roles.includes("administracion")) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Servicios Ingresados" value={totalIngresados} />
          <Card title="Entregas Completadas" value={completados} />
          <Card title="Servicios Valorados" value={valorados} />
          <Card title="Por Facturar" value={porFacturar} />
          <Card title="Por Validar" value={porValidar} />
        </div>
      );
    } else if (roles.includes("comercial")) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Pendientes" value={pendientes} />
          <Card title="Por Validar" value={porValidar} />
        </div>
      );
    } else if (roles.includes("operaciones")) {
      return (
        <div className="grid grid-cols-1 gap-6">
          <Card title="Servicios Activos" value={activos} />
          <Card title="Por Validar" value={porValidar} />
        </div>
      );
    } else {
      return (
        <p className="text-gray-600">
          No hay estadísticas disponibles para tu rol.
        </p>
      );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        Bienvenido/a, {userName || "Usuario"}
      </h1>
      <p className="mb-6 text-gray-700">
        Roles: <span className="font-medium">{roles.join(", ")}</span>
      </p>
      {renderCards()}

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Últimos Servicios</h2>
        {recent.length === 0 ? (
          <p className="text-gray-600">No hay servicios recientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Fecha Sol.</th>
                  <th className="px-4 py-2 text-left">Creado Por</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{s.id}</td>
                    <td className="px-4 py-2">{s.estado}</td>
                    <td className="px-4 py-2">
                      {formatFechaISO(s.form.fechaSol)}
                    </td>
                    <td className="px-4 py-2">{s.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

interface CardProps {
  title: string;
  value: number;
}

const Card: React.FC<CardProps> = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
    <h3 className="text-lg font-medium text-gray-600">{title}</h3>
    <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

export default HomePage;
