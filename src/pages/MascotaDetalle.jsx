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

function MascotaDetalle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mascotas, setMascotas] = useState([]);

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
                <dd>{mascota.dimension || "No informada"}</dd>
              </div>
            </dl>
          </div>
        </article>
      )}
    </div>
  );
}

export default MascotaDetalle;