import "./App.css";
import Sidebar from "./components/Sidebar";
import TopMenu from "./components/TopMenu";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Páginas del dashboard
import HomePage from "./pages/HomePage";
import IngresoServicioCliente from "./pages/cliente/IngresoServicio";
import GestionServiciosComercial from "./pages/comercial/IngresoServicio";
import VistaTorreDeControl from "./pages/torreDeControl/VistaServicios";
import ServiciosPendientesComercial from "./pages/comercial/VistaServiciosPendientes";
import ServiciosPendientesOperacion from "./pages/operaciones/VistaServiciosPendientes";
import CompletarEntrega from "./pages/CompletarEntrega";
import ValorizarServicio from "./pages/ValorizarServicio";
import ServiciosPorFacturar from "./pages/ServiciosPorFacturar";
import VistaServicios from "./pages/torreDeControl/VistaServicios";
import VistaServiciosTest from "./pages/VistaServiciosTest";
import DetalleServicio from "./pages/DetalleServicio";
import InformeServicio from "./pages/InformeServicios";
import FacturarServicio from "./pages/FacturarServicio";
import NuevoServicio from "./pages/NuevoServicio";
import AgregarValores from "./pages/AgregarValoresServicio";
import SeguimientoServicio from "./pages/torreDeControl/SeguimientoServicio";
import AsignarChoferMovil from "./pages/operaciones/AsignarChoferMovil";
import Profile from "./pages/Profile"
import AdministrarCuentas from "./pages/AdministrarCuentas"
import AdministrarDatos from "./pages/MockCatalogManagerPanel";

// Inicio de sesión
import InicioSesion from "./pages/InicioSesion";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router basename="/DashboardFrontend-Perrot">
        <Routes>
          {/* Ruta para el inicio de sesión (fuera del dashboard) */}
          <Route path="/" element={<InicioSesion />} />

          {/* Rutas del dashboard: se muestran con Sidebar y TopMenu */}
          <Route
            path="/*"
            element={
              <div className="flex h-full w-full min-w-0">
                <Sidebar />
                <div className="flex flex-col flex-1 w-full min-w-0">
                  <TopMenu />
                  <main className="p-4 flex-1 overflow-auto bg-white text-black">
                    <Routes>
                      <Route path="/home" element={<HomePage />} />
                      <Route
                        path="/cliente/ingresoServicios"
                        element={<IngresoServicioCliente />}
                      />
                      <Route
                        path="/comercial/gestion-servicios"
                        element={<GestionServiciosComercial />}
                      />
                      <Route
                        path="/comercial/modificar-servicio/:id"
                        element={<NuevoServicio />}
                      />
                      <Route path="/servicios" element={<VistaServicios />} />
                      <Route
                        path="/servicios-test"
                        element={<VistaServiciosTest />}
                      />
                      <Route
                        path="/torre-de-control/gestion-servicios"
                        element={<VistaTorreDeControl />}
                      />
                      <Route
                        path="/torre-de-control/seguimiento-servicio/:id"
                        element={<SeguimientoServicio />}
                      />
                      <Route
                        path="/comercial/servicios-pendientes"
                        element={<ServiciosPendientesComercial />}
                      />
                      <Route
                        path="/operaciones/gestion-servicios"
                        element={<ServiciosPendientesOperacion />}
                      />
                      <Route
                        path="/operaciones/asignar/:id"
                        element={<AsignarChoferMovil />}
                      />
                      <Route
                        path="/operaciones/gestionar-valores/:id"
                        element={<AgregarValores />}
                      />
                      <Route
                        path="/operaciones/nuevo-servicio"
                        element={<NuevoServicio />}
                      />
                      <Route
                        path="/operaciones/modificar-servicio/:id"
                        element={<NuevoServicio />}
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
                        path="/servicios-por-facturar"
                        element={<ServiciosPorFacturar />}
                      />
                      <Route
                        path="/detalle-servicio/:id"
                        element={<DetalleServicio />}
                      />
                      <Route
                        path="/informe-servicio"
                        element={<InformeServicio />}
                      />
                      <Route
                        path="/facturar-servicio"
                        element={<FacturarServicio />}
                      />
                      <Route
                        path="/comercial/gestionar-valores/:id"
                        element={<AgregarValores />}
                      />
                      <Route
                        path="/comercial/nuevo-servicio"
                        element={<NuevoServicio />}
                      />

                      <Route
                        path="/admin/cuentas"
                        element={<AdministrarCuentas />}
                      />

                      <Route
                        path="/admin/datos"
                        element={<AdministrarDatos />}
                      />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
