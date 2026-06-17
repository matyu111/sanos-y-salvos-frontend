import { useEffect, useMemo, useState } from "react";

import {
  eliminarMascotaAdmin,
  obtenerMascotaAdminPorId,
  obtenerMascotasAdmin,
  obtenerMascotasAdminPorEstado,
} from "../../services/adminService";

const FILTERS = [
  { value: "ALL", label: "Todas" },
  { value: "PERDIDA", label: "Perdidas" },
  { value: "ENCONTRADA", label: "Encontradas" },
];

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function toImageSrc(fotoBase64) {
  if (!fotoBase64) {
    return "";
  }

  if (String(fotoBase64).startsWith("data:image")) {
    return fotoBase64;
  }

  return `data:image/jpeg;base64,${fotoBase64}`;
}

function getMascotaId(mascota, index) {
  return mascota?.id ?? mascota?.mascotaId ?? index;
}

function getEstadoLabel(value) {
  const normalized = normalizeText(value);

  if (normalized === "perdida") {
    return "Perdida";
  }

  if (normalized === "encontrada") {
    return "Encontrada";
  }

  return value || "Sin estado";
}

function getDimensionLabel(value) {
  const normalized = normalizeText(value);

  if (normalized === "pequena" || normalized === "pequeña") {
    return "Pequeña";
  }

  if (normalized === "mediana") {
    return "Mediana";
  }

  if (normalized === "grande") {
    return "Grande";
  }

  return value || "Sin dimensión";
}

function formatFecha(value) {
  if (!value) {
    return "";
  }

  const fecha = new Date(value);

  if (Number.isNaN(fecha.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
}

function getUsuarioLabel(mascota) {
  return (
    mascota?.usuarioNombre ||
    mascota?.nombreUsuario ||
    mascota?.usuario?.nombre ||
    mascota?.usuario?.nombreUsuario ||
    mascota?.dueno?.nombre ||
    mascota?.dueño?.nombre ||
    (mascota?.usuarioId != null ? `ID ${mascota.usuarioId}` : "")
  );
}

function getUbicacionLabel(mascota) {
  const ubicacion = mascota?.ubicacion || {};
  const direccion =
    mascota?.direccion ||
    ubicacion?.direccion ||
    ubicacion?.address ||
    ubicacion?.descripcion ||
    ubicacion?.display_name;

  if (direccion) {
    return direccion;
  }

  const latitud = mascota?.latitud ?? ubicacion?.latitud;
  const longitud = mascota?.longitud ?? ubicacion?.longitud;

  if (latitud == null || longitud == null) {
    return "";
  }

  return `${Number(latitud).toFixed(5)}, ${Number(longitud).toFixed(5)}`;
}

function AdminMascotas() {
  const [filtroEstado, setFiltroEstado] = useState("ALL");
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [expandedId, setExpandedId] = useState(null);
  const [detallePorId, setDetallePorId] = useState({});
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    const cargarMascotas = async () => {
      setLoading(true);
      setError("");
      setFeedback("");

      try {
        const data =
          filtroEstado === "ALL"
            ? await obtenerMascotasAdmin()
            : await obtenerMascotasAdminPorEstado(filtroEstado);

        if (!active) {
          return;
        }

        setMascotas(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setMascotas([]);
        setError(fetchError?.response?.data?.message || fetchError?.message || "No fue posible cargar las mascotas.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void cargarMascotas();

    return () => {
      active = false;
    };
  }, [filtroEstado]);

  const rows = useMemo(() => mascotas, [mascotas]);

  const handleOpenDetail = async (mascota) => {
    const id = getMascotaId(mascota);

    if (id == null) {
      return;
    }

    if (Number(expandedId) === Number(id)) {
      setExpandedId(null);
      return;
    }

    setError("");
    setFeedback("");
    setLoadingDetailId(id);

    try {
      if (!detallePorId[id]) {
        const detalle = await obtenerMascotaAdminPorId(id);

        setDetallePorId((current) => ({
          ...current,
          [id]: detalle || mascota,
        }));
      }

      setExpandedId(id);
    } catch (detailError) {
      setError(
        detailError?.response?.data?.message || detailError?.message || "No fue posible cargar el detalle de la mascota."
      );
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleDelete = async (mascota) => {
    const id = getMascotaId(mascota);

    if (id == null) {
      setFeedbackType("error");
      setFeedback("No se pudo eliminar la mascota porque no tiene un ID válido.");
      return;
    }

    const confirmed = window.confirm(`Eliminar a ${mascota?.nombre || "esta mascota"}?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setFeedback("");
    setError("");

    try {
      await eliminarMascotaAdmin(id);

      setMascotas((currentMascotas) =>
        currentMascotas.filter((currentMascota, index) => Number(getMascotaId(currentMascota, index)) !== Number(id))
      );

      setDetallePorId((currentDetalles) => {
        const nextDetalles = { ...currentDetalles };
        delete nextDetalles[id];
        return nextDetalles;
      });

      setExpandedId((currentExpanded) => (Number(currentExpanded) === Number(id) ? null : currentExpanded));
      setFeedbackType("success");
      setFeedback("Mascota eliminada correctamente.");
    } catch (deleteError) {
      setFeedbackType("error");
      setFeedback(
        deleteError?.response?.data?.message || deleteError?.message || "No fue posible eliminar la mascota."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="admin-section">
      <header className="admin-section-header">
        <div>
          <p className="admin-section-kicker">Gestion de mascotas</p>
          <h2>Mascotas</h2>
          <p>Listado general del sistema con filtros por estado, detalle de solo lectura y eliminación real.</p>
        </div>

        <div className="admin-pet-filters" aria-label="Filtros de mascotas">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`admin-pet-filter-button ${filtroEstado === filter.value ? "active" : ""}`}
              onClick={() => {
                setFiltroEstado(filter.value);
                setExpandedId(null);
                setFeedback("");
                setError("");
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      {loading && <div className="admin-feedback">Cargando mascotas...</div>}
      {!loading && error && <div className="admin-feedback admin-feedback-warning">{error}</div>}
      {!loading && feedback && (
        <div className={`admin-feedback ${feedbackType === "error" ? "admin-feedback-warning" : ""}`}>
          {feedback}
        </div>
      )}
      {!loading && !error && rows.length === 0 && (
        <div className="admin-feedback">No hay mascotas para mostrar.</div>
      )}

      {!loading && rows.length > 0 && (
        <div className="admin-pet-grid">
          {rows.map((mascota, index) => {
            const id = getMascotaId(mascota, index);
            const detalle = detallePorId[id] || mascota;
            const fotoSrc = toImageSrc(detalle?.fotoBase64 || mascota?.fotoBase64);
            const estadoLabel = getEstadoLabel(detalle?.estado || mascota?.estado);
            const statusClass = normalizeText(detalle?.estado || mascota?.estado) === "encontrada"
              ? "admin-pet-status-found"
              : "admin-pet-status-lost";
            const usuarioLabel = getUsuarioLabel(detalle || mascota);
            const fechaLabel = formatFecha(detalle?.fechaReporte || detalle?.fechaRegistro || detalle?.createdAt || mascota?.fechaReporte || mascota?.fechaRegistro || mascota?.createdAt);
            const isExpanded = Number(expandedId) === Number(id);
            const isLoadingDetail = Number(loadingDetailId) === Number(id);
            const isDeleting = Number(deletingId) === Number(id);

            return (
              <article className="admin-pet-card" key={id}>
                <div className="admin-pet-photo-wrap">
                  {fotoSrc ? (
                    <img className="admin-pet-photo" src={fotoSrc} alt={`Foto de ${detalle?.nombre || mascota?.nombre || "mascota"}`} />
                  ) : (
                    <div className="admin-pet-photo admin-pet-photo-placeholder">Sin foto</div>
                  )}
                </div>

                <div className="admin-pet-body">
                  <header className="admin-pet-header">
                    <div>
                      <h3>{detalle?.nombre || mascota?.nombre || "Sin nombre"}</h3>
                      <p className="admin-pet-subtitle">{detalle?.raza || mascota?.raza || "Raza no informada"}</p>
                    </div>
                    <span className={`admin-pet-status ${statusClass}`}>{estadoLabel}</span>
                  </header>

                  <dl className="admin-pet-meta">
                    <div>
                      <dt>Tipo</dt>
                      <dd>{detalle?.tipo || mascota?.tipo || "No informado"}</dd>
                    </div>
                    {usuarioLabel ? (
                      <div>
                        <dt>Usuario</dt>
                        <dd>{usuarioLabel}</dd>
                      </div>
                    ) : null}
                    {fechaLabel ? (
                      <div>
                        <dt>Fecha registro</dt>
                        <dd>{fechaLabel}</dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="admin-pet-actions">
                    <button type="button" onClick={() => void handleOpenDetail(mascota)} disabled={isLoadingDetail}>
                      {isLoadingDetail ? "Cargando detalle..." : isExpanded ? "Ocultar detalle" : "Ver detalle"}
                    </button>
                    <button type="button" onClick={() => void handleDelete(mascota)} disabled={isDeleting}>
                      {isDeleting ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="admin-pet-expanded">
                      <p><strong>Detalle:</strong></p>
                      {detalle?.id != null && <p>Id: {detalle.id}</p>}
                      {detalle?.nombre && <p>Nombre: {detalle.nombre}</p>}
                      {detalle?.tipo && <p>Tipo: {detalle.tipo}</p>}
                      {detalle?.raza && <p>Raza: {detalle.raza}</p>}
                      {detalle?.color && <p>Color: {detalle.color}</p>}
                      {detalle?.edad != null && <p>Edad: {detalle.edad} años</p>}
                      {detalle?.dimension && <p>Dimensión: {getDimensionLabel(detalle.dimension)}</p>}
                      {detalle?.estado && <p>Estado: {getEstadoLabel(detalle.estado)}</p>}
                      {usuarioLabel && <p>Usuario dueño: {usuarioLabel}</p>}
                      {getUbicacionLabel(detalle) && <p>Ubicación: {getUbicacionLabel(detalle)}</p>}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AdminMascotas;