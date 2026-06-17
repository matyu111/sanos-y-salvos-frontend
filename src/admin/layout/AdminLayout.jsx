import { NavLink, Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <section className="page-container admin-container">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">Acceso restringido</p>
          <h1>Panel Administrador</h1>
          <p>Gestion central del sistema con visualizacion consistente del frontend.</p>
        </div>
        <nav className="admin-inline-nav" aria-label="Navegacion admin">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `admin-inline-link ${isActive ? "active" : ""}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => `admin-inline-link ${isActive ? "active" : ""}`}
          >
            Usuarios
          </NavLink>
          <NavLink
            to="/admin/mascotas"
            className={({ isActive }) => `admin-inline-link ${isActive ? "active" : ""}`}
          >
            Mascotas
          </NavLink>
        </nav>
      </header>

      <section className="admin-view-content">
        <Outlet />
      </section>
    </section>
  );
}

export default AdminLayout;