// src/pages/HomePage.tsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { loadDrafts, loadSent, Payload } from "../utils/ServiceDrafts";

interface Stats {
  totalIngresados: number;
  completados: number;
  valorados: number;
  porFacturar: number;
  pendientes: number;
  activos: number;
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
  });

  useEffect(() => {
    // Simula tiempo de carga
    const timer = setTimeout(() => {
      const drafts = loadDrafts();
      const sent = loadSent();

      const all: Payload[] = [...drafts, ...sent];
      const totalIngresados = all.length;
      const completados = all.filter((s) => s.estado === "Completado").length;
      const porFacturar = all.filter((s) => s.estado === "Por facturar").length;
      const pendientes = all.filter((s) => s.estado === "Pendiente").length;
      // "valorados" = tienen valores
      const valorados = all.filter((s) => (s.valores?.length || 0) > 0).length;
      // "activos" lo definimos como enviados que aún no están completados
      const activos = sent.filter((s) => s.estado !== "Completado").length;

      setStats({
        totalIngresados,
        completados,
        valorados,
        porFacturar,
        pendientes,
        activos,
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-10 bg-gray-300 rounded w-1/2 mb-6"></div>
        <div className="h-6 bg-gray-300 rounded w-full mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-300 rounded"></div>
          ))}
        </div>
        <div className="mt-8 h-4 bg-gray-300 rounded w-full"></div>
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
  } = stats;

  // Renderiza tarjetas según el rol
  const renderCards = () => {
    if (roles.includes("administracion")) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Servicios Ingresados" value={totalIngresados} />
          <Card title="Entregas Completadas" value={completados} />
          <Card title="Servicios Valorados" value={valorados} />
          <Card title="Servicios por Facturar" value={porFacturar} />
        </div>
      );
    } else if (roles.includes("cliente")) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Tus Servicios Ingresados" value={totalIngresados} />
          <Card title="Entregas Completadas" value={completados} />
        </div>
      );
    } else if (roles.includes("comercial")) {
      return (
        <div className="grid grid-cols-1 gap-6">
          <Card title="Servicios Pendientes" value={pendientes} />
        </div>
      );
    } else if (roles.includes("torre de control")) {
      return (
        <div className="grid grid-cols-1 gap-6">
          <Card title="Servicios Activos" value={activos} />
          <Card title="Servicios Test" value={0} />
        </div>
      );
    } else if (roles.includes("operaciones")) {
      return (
        <div className="grid grid-cols-1 gap-6">
          <Card title="Servicios por Facturar" value={porFacturar} />
        </div>
      );
    } else if (roles.includes("contabilidad")) {
      return (
        <div className="grid grid-cols-1 gap-6">
          <Card title="Facturación Pendiente" value={porFacturar} />
        </div>
      );
    } else {
      return <p>No hay datos disponibles para tu rol.</p>;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Bienvenido/a {userName || "Usuario"}
      </h1>
      <p className="text-lg mb-4">
        Este es el panel de control para la administración de servicios
        logísticos.{" "}
        {roles.length > 0 && <span>Tus roles: {roles.join(", ")}.</span>}
      </p>
      {renderCards()}
      <div className="mt-8">
        <p>
          Utiliza el menú lateral para navegar por las diferentes secciones y
          gestionar los servicios.
        </p>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  value: number;
}

const Card: React.FC<CardProps> = ({ title, value }) => (
  <div className="bg-white p-4 rounded shadow">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className="text-2xl">{value}</p>
  </div>
);

export default HomePage;
