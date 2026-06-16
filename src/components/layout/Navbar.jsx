import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";
import { useAuth } from "../../hooks/useAuth";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogout = () => {
    auth.clearSession();
    navigate("/login");
  };

  return (
    <nav className="app-navbar">
      <button className="hamburger-btn" onClick={onToggleSidebar}>
        ☰
      </button>
      <div className="app-navbar-brand">
        <img className="app-navbar-logo" src={logo} alt="Logo de Sanos y Salvos" />
        <h2>Sanos y Salvos</h2>
      </div>
      <div className="app-navbar-user">
        <span className="user-name">{auth.nombre || "Usuario"}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
