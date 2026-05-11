import { useNavigate } from "react-router-dom";

import AdminPanel from "../components/roles/AdminPanel";
import ClinicaPanel from "../components/roles/ClinicaPanel";
import RefugioPanel from "../components/roles/RefugioPanel";
import UsuarioPanel from "../components/roles/UsuarioPanel";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <main className="dashboard-page">
      <nav className="dashboard-navbar">
        <div>
          <h2>Sanos y Salvos</h2>
          <span>Panel de autenticación</span>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </nav>

      <section className="dashboard-content">
        <div className="welcome-card">
          <h1>Bienvenido/a</h1>
          <p>
            Has iniciado sesión correctamente. Esta vista representa el acceso
            protegido del sistema mediante JWT.
          </p>
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
          <h2>Componentes por perfil</h2>

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