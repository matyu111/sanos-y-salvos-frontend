import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

import AdminPanel from "../components/roles/AdminPanel";
import ClinicaPanel from "../components/roles/ClinicaPanel";
import RefugioPanel from "../components/roles/RefugioPanel";
import UsuarioPanel from "../components/roles/UsuarioPanel";

import "../styles/dashboard.css";

function Dashboard() {
  const auth = useAuth();

  return (
    <main className="dashboard-page">
      <Navbar />

      <section className="dashboard-content">
        <div className="welcome-card">
          <h1>Bienvenido/a</h1>

          <p>
            Has iniciado sesión correctamente. Esta vista representa el acceso
            protegido del sistema mediante JWT.
          </p>

          <div className="dashboard-grid">
            <article className="dashboard-card">
              <h3>Nombre</h3>
              <p>{auth.nombre || "Sin información"}</p>
            </article>

            <article className="dashboard-card">
              <h3>Correo</h3>
              <p>{auth.email || "Sin información"}</p>
            </article>

            <article className="dashboard-card">
              <h3>Rol</h3>
              <p>{auth.rol || "Sin información"}</p>
            </article>
          </div>
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <h3>Autenticación segura</h3>

            <p>
              El sistema utiliza token JWT almacenado en el navegador para
              controlar el acceso a rutas privadas.
            </p>
          </article>

          <article className="dashboard-card">
            <h3>Ruta protegida</h3>

            <p>
              Si no existe un token válido, el usuario es redirigido
              automáticamente al inicio de sesión.
            </p>
          </article>

          <article className="dashboard-card">
            <h3>Conexión con BFF</h3>

            <p>
              El frontend consume los servicios del backend mediante Axios y
              centraliza las solicitudes a través del BFF.
            </p>
          </article>
        </div>

        <section className="roles-section">
          <h2>Perfiles disponibles del sistema</h2>

          <div className="roles-grid">
            <AdminPanel />
            <UsuarioPanel />
            <RefugioPanel />
            <ClinicaPanel />
          </div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;