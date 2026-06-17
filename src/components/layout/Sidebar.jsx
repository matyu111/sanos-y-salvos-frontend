import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function Sidebar({ isOpen, onClose }) {
  const auth = useAuth();
  const isAdmin = auth.rol === "ADMIN";

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Menú</h3>
          <button className="sidebar-close-btn" onClick={onClose}>✕</button>
        </div>
        <nav className="sidebar-nav">
          {isAdmin ? (
            <>
              <Link to="/admin/dashboard" className="sidebar-link" onClick={onClose}>
                Dashboard Admin
              </Link>
              <Link to="/admin/users" className="sidebar-link" onClick={onClose}>
                Usuarios
              </Link>
              <Link to="/admin/mascotas" className="sidebar-link" onClick={onClose}>
                Mascotas
              </Link>
            </>
          ) : (
            <>
              <Link to="/inicio" className="sidebar-link" onClick={onClose}>
                Inicio
              </Link>
              <Link to="/registrar-mascota" className="sidebar-link" onClick={onClose}>
                Registrar Mascota
              </Link>
              <Link to="/mis-mascotas" className="sidebar-link" onClick={onClose}>
                Mis Mascotas
              </Link>
              <Link to="/coincidencias" className="sidebar-link" onClick={onClose}>
                Coincidencias
              </Link>

              <div className="sidebar-visual-actions" aria-label="Opciones visuales">
                <button type="button" className="sidebar-link sidebar-link-button">
                  Perfil
                </button>
                <button type="button" className="sidebar-link sidebar-link-button">
                  Configuración
                </button>
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
