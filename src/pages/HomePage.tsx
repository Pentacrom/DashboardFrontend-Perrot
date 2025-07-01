// src/pages/HomePage.tsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { loadDrafts, loadSent, Payload } from "../utils/ServiceDrafts";
import { formatCLP } from "../utils/format";
import { formatFechaISO } from "../utils/format";
import { Truck, CheckCircle, Clock, ClipboardList } from "lucide-react"; // íconos

interface Stats {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}

const HomePage: React.FC = () => {
  const { userName, roles } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats[]>([]);
  const [recent, setRecent] = useState<Payload[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const drafts = loadDrafts();
      const sent = loadSent();
      const all = [...drafts, ...sent];

      const computed: Stats[] = [
        {
          title: "Ingresados",
          value: all.length,
          icon: <ClipboardList className="w-6 h-6" />,
          bgColor: "bg-blue-100",
        },
        {
          title: "Completados",
          value: all.filter((s) => s.estado === "Completado").length,
          icon: <CheckCircle className="w-6 h-6" />,
          bgColor: "bg-green-100",
        },
        {
          title: "Pendientes",
          value: all.filter((s) => s.estado === "Pendiente").length,
          icon: <Clock className="w-6 h-6" />,
          bgColor: "bg-yellow-100",
        },
        {
          title: "Por Facturar",
          value: all.filter((s) => s.estado === "Por facturar").length,
          icon: <Truck className="w-6 h-6" />,
          bgColor: "bg-purple-100",
        },
      ];

      // Filtrar por rol
      const filtered = computed.filter((stat) => {
        if (roles.includes("administracion")) return true;
        if (
          roles.includes("comercial") &&
          ["Pendientes", "Por Validar"].includes(stat.title)
        )
          return true;
        if (
          roles.includes("operaciones") &&
          ["Ingresados", "Pendientes"].includes(stat.title)
        )
          return true;
        return false;
      });

      setStats(filtered);

      const sorted = [...all].sort((a, b) => b.id - a.id).slice(0, 5);
      setRecent(sorted);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [roles]);

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-12 bg-gray-300 rounded w-2/3 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-4xl font-bold mb-2">
          Bienvenido{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-gray-500">
          Roles: <span className="font-medium">{roles.join(", ")}</span>
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Estadísticas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div
              key={s.title}
              className={`${s.bgColor} p-6 rounded-2xl shadow hover:shadow-lg transform hover:scale-105 transition`}
            >
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-gray-600">{s.icon}</div>
              </div>
              <div className="mt-2 text-gray-700">{s.title}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Últimos Servicios</h2>
        {recent.length === 0 ? (
          <p className="text-gray-600">No hay servicios recientes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  {["ID", "Estado", "Fecha", "Creado Por"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((s, i) => (
                  <tr
                    key={s.id}
                    className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-6 py-4 border-t rounded-bl-lg">{s.id}</td>
                    <td className="px-6 py-4 border-t">{s.estado}</td>
                    <td className="px-6 py-4 border-t">
                      {formatFechaISO(s.form.fechaSol)}
                    </td>
                    <td className="px-6 py-4 border-t rounded-br-lg">
                      {s.createdBy}
                    </td>
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

export default HomePage;
