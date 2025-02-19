import './App.css';
import Sidebar from './components/Sidebar';
import TopMenu from './components/TopMenu';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Páginas del dashboard
import HomePage from './pages/HomePage';
import IngresoServicio from "./pages/IngresoServicio";
import VistaServiciosPendientes from "./pages/VistaServiciosPendientes";
import ServiciosPendientesComercial from "./pages/comercial/VistaServiciosPendientes";
import ServiciosPendientesOperacion from "./pages/operaciones/VistaServiciosPendientes";
import CompletarEntrega from "./pages/CompletarEntrega";
import ValorizarServicio from "./pages/ValorizarServicio";
import ServiciosPorFacturar from "./pages/ServiciosPorFacturar";
import CompletarServicio from "./pages/CompletarServicio";
import VistaServicios from "./pages/VistaServicios";
import VistaServiciosTest from "./pages/VistaServiciosTest";
import ConsultaServicio from "./pages/ConsultaServicio";
import InformeServicio from "./pages/InformeServicios"
// Página de inicio de sesión
import InicioSesion from "./pages/InicioSesion";

function App() {
  return (
    <>
      <Router basename="/DashboardFrontend-Perrot">
        <Routes>
          {/* Ruta para el inicio de sesión (fuera del dashboard) */}
          <Route path="/" element={<InicioSesion />} />

          {/* Rutas del dashboard: se muestran con Sidebar y TopMenu */}
          <Route
            path="/*"
            element={
              <div className="flex h-screen w-screen">
                <Sidebar />
                <div className="flex flex-col flex-1">
                  <TopMenu />
                  <main className="p-4 flex-1 overflow-auto bg-white text-black">
                    <Routes>
                      <Route path="/home" element={<HomePage />} />
                      <Route
                        path="/ingresoServicios"
                        element={<IngresoServicio />}
                      />
                      <Route path="/servicios" element={<VistaServicios />} />
                      <Route
                        path="/servicios-test"
                        element={<VistaServiciosTest />}
                      />

                      <Route
                        path="/servicios-pendientes"
                        element={<VistaServiciosPendientes />}
                      />
                      <Route
                        path="/comercial/servicios-pendientes"
                        element={<ServiciosPendientesComercial />}
                      />
                      <Route
                        path="/operaciones/servicios-pendientes"
                        element={<ServiciosPendientesOperacion />}
                      />
                      <Route
                        path="/completar-entrega"
                        element={<CompletarEntrega />}
                      />
                      <Route
                        path="/valorizar-servicio"
                        element={<ValorizarServicio />}
                      />
                      <Route
                        path="/completar-servicio"
                        element={<CompletarServicio />}
                      />
                      <Route
                        path="/servicios-por-facturar"
                        element={<ServiciosPorFacturar />}
                      />

                      <Route
                        path="/consulta-servicio"
                        element={<ConsultaServicio />}
                      />
                      <Route
                        path="/informe-servicio"
                        element={<InformeServicio />}
                      />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
