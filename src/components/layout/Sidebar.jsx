import { Link } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Menú</h3>
          <button className="sidebar-close-btn" onClick={onClose}>✕</button>
        </div>
        <nav className="sidebar-nav">
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
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
