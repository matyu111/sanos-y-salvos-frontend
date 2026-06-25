import { useEffect, useMemo, useState } from "react";

import {
  obtenerUsuariosAdmin,
  eliminarUsuarioAdmin,
} from "../../services/adminService";

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function toDisplayRole(value) {
  const role = normalizeText(value).toUpperCase();
  return role;
}

function getUserKey(user, index) {
  return user?.id ?? user?.userId ?? user?.email ?? index;
}

function AdminUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await obtenerUsuariosAdmin();

        if (!active) {
          return;
        }

        setUsuarios(data);
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setUsuarios([]);
        setError(fetchError?.message || "No fue posible cargar los usuarios.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => usuarios, [usuarios]);
  const handleDelete = async (id) => {
  const confirmar = window.confirm(
    "¿Seguro que deseas eliminar este usuario?"
  );

  if (!confirmar) {
    return;
  }

  try {
    await eliminarUsuarioAdmin(id);

    setUsuarios((prev) =>
      prev.filter((usuario) => usuario.id !== id)
    );
  } catch (error) {
    alert("No fue posible eliminar el usuario.");
  }
};


  return (
    <section className="admin-section">
      <header className="admin-section-header">
        <div>
          <p className="admin-section-kicker">Gestion basica</p>
          <h2>Usuarios</h2>
          <p>
            {rows.length} usuarios registrados en el sistema.
          </p>
        </div>
      </header>

      {loading && <div className="admin-feedback">Cargando usuarios...</div>}
      {!loading && error && <div className="admin-feedback admin-feedback-warning">{error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div className="admin-feedback">No hay usuarios para mostrar.</div>
      )}

      {!loading && rows.length > 0 && (
        <div className="admin-user-grid">
          {rows.map((usuario, index) => {
            const key = getUserKey(usuario, index);

            return (
              <article className="admin-user-card" key={key}>
                <header className="admin-user-card-header">
                  <h3>{usuario?.nombre || usuario?.username || "Sin nombre"}</h3>
                  <span className="admin-user-role">{toDisplayRole(usuario?.rol)}</span>
                </header>

                <dl className="admin-user-details">
                  <div>
                    <dt>Email</dt>
                    <dd>{usuario?.email || "Sin email"}</dd>
                  </div>
                </dl>

                <div className="admin-user-actions">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(usuario)}
                  >
                    Ver detalle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(usuario.id)}
                  >
                    Eliminar
                  </button>
                </div>

              </article>
            );
          })}
        </div>
      )}
      {selectedUser && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="admin-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <p className="admin-section-kicker">
                  Detalle de usuario
                </p>

                <h3>
                  {selectedUser.nombre || "Sin nombre"}
                </h3>
              </div>

              <button
                className="admin-modal-close"
                type="button"
                onClick={() => setSelectedUser(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {selectedUser.id != null && (
                <p><strong>ID:</strong> {selectedUser.id}</p>
              )}

              <p>
                <strong>Nombre:</strong>{" "}
                {selectedUser.nombre || "Sin nombre"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {selectedUser.email || "Sin email"}
              </p>

              <p>
                <strong>Rol:</strong>{" "}
                {toDisplayRole(selectedUser.rol)}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminUsers;