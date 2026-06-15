import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogout = () => {
    auth.clearSession();
    navigate("/login");
  };

  return (
    <nav className="dashboard-navbar">
      <div>
        <h2>Sanos y Salvos</h2>
        <span>Panel de autenticación</span>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </nav>
  );
}

export default Navbar;