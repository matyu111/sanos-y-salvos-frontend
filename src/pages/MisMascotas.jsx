import { useEffect, useState } from "react";

import { useAuth } from "../hooks/useAuth";
import { obtenerMascotasPorUsuario } from "../services/mascotaService";

function formatFechaReporte(fechaReporte) {
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

function MisMascotas() {
  const { userId, isAuthenticated } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setMascotas([]);
      setError("No se encontró una sesión activa para cargar tus mascotas.");
      return undefined;
    }

    let isActive = true;

    const cargarMascotas = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await obtenerMascotasPorUsuario(userId);

        if (!isActive) {
          return;
        }

        setMascotas(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (!isActive) {
          return;
        }

        const mensaje =
          fetchError?.response?.data?.message ||
          fetchError?.message ||
          "No fue posible cargar tus mascotas.";

        setMascotas([]);
        setError(mensaje);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    cargarMascotas();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, userId]);

  const tieneMascotas = mascotas.length > 0;

  return (
    <div className="page-container mis-mascotas-page">
      <div className="mis-mascotas-header">
        <div>
          <p className="section-eyebrow">Tus mascotas registradas</p>
          <h1>Mis Mascotas</h1>
          <p className="section-description">
            Consulta el listado de mascotas asociadas a tu cuenta.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="state-card state-card-loading" role="status" aria-live="polite">
          Cargando mascotas...
        </div>
      ) : error ? (
        <div className="state-card state-card-error" role="alert">
          {error}
        </div>
      ) : !tieneMascotas ? (
        <div className="state-card state-card-empty" role="status" aria-live="polite">
          No tienes mascotas registradas todavía.
        </div>
      ) : (
        <section className="mascotas-grid" aria-label="Listado de mascotas">
          {mascotas.map((mascota) => {
            const fotoSrc = mascota.fotoBase64
              ? `data:image/jpeg;base64,${mascota.fotoBase64}`
              : null;

            return (
              <article className="mascota-card" key={mascota.id ?? `${mascota.nombre}-${mascota.fechaReporte}`}>
                <div className="mascota-photo-wrap">
                  {fotoSrc ? (
                    <img
                      className="mascota-photo"
                      src={fotoSrc}
                      alt={`Foto de ${mascota.nombre}`}
                    />
                  ) : (
                    <div className="mascota-photo mascota-photo-placeholder" aria-hidden="true">
                      Sin foto
                    </div>
                  )}
                </div>

                <div className="mascota-card-body">
                  <div className="mascota-card-title-row">
                    <h2>{mascota.nombre}</h2>
                    <span className="mascota-status">{mascota.estado}</span>
                  </div>

                  <dl className="mascota-details">
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
                      <dd>{formatFechaReporte(mascota.fechaReporte)}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default MisMascotas;
