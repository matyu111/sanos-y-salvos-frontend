import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { obtenerMascotas } from "../services/mascotaService";

function formatFecha(fechaReporte) {
  if (!fechaReporte) {
    return "Sin fecha";
  }

  const fecha = new Date(fechaReporte);

  if (Number.isNaN(fecha.getTime())) {
    return fechaReporte;
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
}

function getDimensionLabel(value) {
  const normalized = String(value ?? "").trim().toUpperCase();

  if (normalized === "PEQUENA" || normalized === "PEQUEÑA") {
    return "Pequeña";
  }

  if (normalized === "MEDIANA") {
    return "Mediana";
  }

  if (normalized === "GRANDE") {
    return "Grande";
  }

  return value || "No informada";
}

function getUbicacionLabel(mascota) {
  const lat = mascota?.latitud ?? mascota?.ubicacion?.latitud;
  const lng = mascota?.longitud ?? mascota?.ubicacion?.longitud;

  if (lat == null || lng == null) {
    return "Sin ubicación registrada";
  }

  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}

function MascotaDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mascotas, setMascotas] = useState([]);
  const [reportesCiudadanos, setReportesCiudadanos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [formReporte, setFormReporte] = useState({
    nombreDueno: "",
    correoDueno: "",
    comentario: "",
  });

  useEffect(() => {
    let active = true;

    const cargarMascota = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await obtenerMascotas();

        if (!active) {
          return;
        }

        setMascotas(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (!active) {
          return;
        }

        const mensaje =
          fetchError?.response?.data?.message ||
          fetchError?.message ||
          "No fue posible cargar el detalle de la mascota.";

        setError(mensaje);
        setMascotas([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    cargarMascota();

    return () => {
      active = false;
    };
  }, [id]);

  const mascota = useMemo(
    () => mascotas.find((item) => Number(item.id) === Number(id)) ?? null,
    [id, mascotas]
  );

  const fotoSrc = mascota?.fotoBase64 ? `data:image/jpeg;base64,${mascota.fotoBase64}` : null;

  const handleChangeReporte = (event) => {
    const { name, value } = event.target;

    setFormReporte((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitReporte = (event) => {
    event.preventDefault();

    const nuevoReporte = {
      mascotaId: Number(id),
      nombreDueno: formReporte.nombreDueno.trim(),
      correoDueno: formReporte.correoDueno.trim(),
      comentario: formReporte.comentario.trim(),
      creadoEn: new Date().toISOString(),
    };

    setReportesCiudadanos((prev) => [...prev, nuevoReporte]);
    setFormReporte({
      nombreDueno: "",
      correoDueno: "",
      comentario: "",
    });
    setModalAbierto(false);
    setMensajeExito(
      "Reporte enviado correctamente. Un administrador revisará la información."
    );
  };

  return (
    <div className="page-container mascota-detalle-page">
      <div className="detail-topbar">
        <button type="button" className="detail-back-button" onClick={() => navigate(-1)}>
          Volver
        </button>
        <Link to="/inicio" className="detail-link-home">
          Ir a Inicio
        </Link>
      </div>

      {loading ? (
        <div className="detail-state-card">Cargando detalle de la mascota...</div>
      ) : error ? (
        <div className="detail-state-card detail-state-error">{error}</div>
      ) : !mascota ? (
        <div className="detail-state-card detail-state-empty">
          No se encontró la mascota solicitada.
        </div>
      ) : (
        <article className="mascota-detail-card">
          <div className="mascota-detail-photo-wrap">
            {fotoSrc ? (
              <img className="mascota-detail-photo" src={fotoSrc} alt={`Foto de ${mascota.nombre}`} />
            ) : (
              <div className="mascota-detail-photo mascota-detail-photo-placeholder">Sin foto</div>
            )}
          </div>

          <div className="mascota-detail-content">
            <p className="section-eyebrow">Detalle de mascota</p>
            <h1>{mascota.nombre}</h1>

            {mensajeExito ? (
              <p className="detail-report-success" role="status" aria-live="polite">
                {mensajeExito}
              </p>
            ) : null}

            <div className="detail-status-row">
              <span className="mascota-detail-status">{mascota.estado}</span>
            </div>

            <dl className="mascota-detail-grid">
              <div>
                <dt>Raza</dt>
                <dd>{mascota.raza || "No informada"}</dd>
              </div>
              <div>
                <dt>Color</dt>
                <dd>{mascota.color || "No informado"}</dd>
              </div>
              <div>
                <dt>Edad</dt>
                <dd>{mascota.edad != null ? `${mascota.edad} años` : "No informada"}</dd>
              </div>
              <div>
                <dt>Fecha reporte</dt>
                <dd>{formatFecha(mascota.fechaReporte)}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{mascota.tipo || "No informado"}</dd>
              </div>
              <div>
                <dt>Dimensión</dt>
                <dd>{getDimensionLabel(mascota.dimension)}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{mascota.estado || "No informado"}</dd>
              </div>
              <div>
                <dt>Ubicación</dt>
                <dd>{getUbicacionLabel(mascota)}</dd>
              </div>
            </dl>

            <div className="detail-actions-row">
              <button
                type="button"
                className="detail-report-button"
                onClick={() => {
                  setMensajeExito("");
                  setModalAbierto(true);
                }}
              >
                He visto esta mascota
              </button>

              {reportesCiudadanos.length ? (
                <span className="detail-report-count">
                  Reportes locales: {reportesCiudadanos.length}
                </span>
              ) : null}
            </div>
          </div>
        </article>
      )}

      {modalAbierto ? (
        <div className="detail-modal-overlay" role="presentation" onClick={() => setModalAbierto(false)}>
          <div
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-modal-titulo"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="detail-modal-header">
              <h2 id="detalle-modal-titulo">He visto esta mascota</h2>
              <button
                type="button"
                className="detail-modal-close"
                onClick={() => setModalAbierto(false)}
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <form className="detail-modal-form" onSubmit={handleSubmitReporte}>
              <label className="detail-modal-field">
                <span>Nombre del dueño</span>
                <input
                  name="nombreDueno"
                  type="text"
                  value={formReporte.nombreDueno}
                  onChange={handleChangeReporte}
                  placeholder="Nombre del dueño"
                  required
                />
              </label>

              <label className="detail-modal-field">
                <span>Correo del dueño</span>
                <input
                  name="correoDueno"
                  type="email"
                  value={formReporte.correoDueno}
                  onChange={handleChangeReporte}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </label>

              <label className="detail-modal-field">
                <span>Comentario</span>
                <textarea
                  name="comentario"
                  value={formReporte.comentario}
                  onChange={handleChangeReporte}
                  placeholder="Cuéntanos dónde la viste y en qué condiciones"
                  rows={4}
                  required
                />
              </label>

              <div className="detail-modal-actions">
                <button type="button" className="detail-modal-cancel" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="detail-modal-submit">
                  Enviar reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MascotaDetalle;