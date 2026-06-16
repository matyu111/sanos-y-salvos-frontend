import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { obtenerCoincidenciasPorUsuario } from "../services/coincidenciaService";

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  eyebrow: {
    color: "#b9436d",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "12px",
    fontWeight: 700,
  },
  description: {
    color: "#666",
    maxWidth: "68ch",
    lineHeight: 1.6,
  },
  stateCard: {
    padding: "20px 24px",
    borderRadius: "16px",
    background: "#f9fafb",
    color: "#555",
    border: "1px dashed #d4d8df",
    fontWeight: 600,
  },
  errorCard: {
    padding: "20px 24px",
    borderRadius: "16px",
    background: "#fff2f2",
    color: "#a42c2c",
    border: "1px solid #f2c1c1",
    fontWeight: 600,
  },
  emptyCard: {
    padding: "20px 24px",
    borderRadius: "16px",
    background: "#f9fafb",
    color: "#555",
    border: "1px dashed #d4d8df",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid rgba(201, 79, 124, 0.08)",
    boxShadow: "0 10px 30px rgba(180, 90, 120, 0.12)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  cardTop: {
    padding: "20px",
    background: "linear-gradient(135deg, #fff1f6, #fff8fb)",
    borderBottom: "1px solid #f3dde7",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  score: {
    width: "88px",
    height: "88px",
    borderRadius: "999px",
    background: "#fff",
    border: "6px solid #f2c1d1",
    color: "#b9436d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: 800,
    flexShrink: 0,
  },
  topInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: 0,
  },
  badge: {
    alignSelf: "flex-start",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fff1f6",
    color: "#b9436d",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  title: {
    color: "#2f2f33",
    fontSize: "22px",
    lineHeight: 1.2,
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
  },
  body: {
    padding: "20px",
    display: "grid",
    gap: "14px",
  },
  details: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  detailLabel: {
    color: "#8d8d96",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "4px",
  },
  detailValue: {
    color: "#333",
    fontSize: "15px",
    lineHeight: 1.4,
  },
  descriptionBox: {
    padding: "14px 16px",
    borderRadius: "14px",
    background: "#faf7f9",
    border: "1px solid #f0dde5",
    color: "#444",
    lineHeight: 1.55,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    background: "#c94f7c",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s ease, transform 0.2s ease",
  },
};

function getBadgeLabel(porcentajeCoincidencia) {
  if (porcentajeCoincidencia >= 100) {
    return "Coincidencia Alta";
  }

  if (porcentajeCoincidencia >= 75) {
    return "Coincidencia Probable";
  }

  return "Coincidencia Detectada";
}

function Coincidencias() {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useAuth();
  const [coincidencias, setCoincidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setCoincidencias([]);
      setError("No se encontró una sesión activa para cargar tus coincidencias.");
      return undefined;
    }

    let active = true;

    const cargarCoincidencias = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await obtenerCoincidenciasPorUsuario(userId);

        if (!active) {
          return;
        }

        setCoincidencias(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (!active) {
          return;
        }

        const mensaje =
          fetchError?.response?.data?.message ||
          fetchError?.message ||
          "No fue posible cargar las coincidencias.";

        setCoincidencias([]);
        setError(mensaje);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    cargarCoincidencias();

    return () => {
      active = false;
    };
  }, [isAuthenticated, userId]);

  const tieneCoincidencias = coincidencias.length > 0;

  const renderContent = () => {
    if (loading) {
      return <div style={styles.stateCard}>Cargando coincidencias...</div>;
    }

    if (error) {
      return <div style={styles.errorCard}>{error}</div>;
    }

    if (!tieneCoincidencias) {
      return (
        <div style={styles.emptyCard}>No se encontraron coincidencias para tus mascotas.</div>
      );
    }

    return (
      <section style={styles.grid} aria-label="Listado de coincidencias">
        {coincidencias.map((coincidencia) => {
          const porcentaje = Number(coincidencia.porcentajeCoincidencia ?? 0);
          const badge = porcentaje >= 100 || porcentaje >= 75 ? getBadgeLabel(porcentaje) : null;

          return (
            <article key={`${coincidencia.idMascotaPerdida}-${coincidencia.idMascotaEncontrada}`} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.topInfo}>
                  {badge ? <span style={styles.badge}>{badge}</span> : null}
                  <h2 style={styles.title}>Coincidencia de Mascota</h2>
                  <p style={styles.subtitle}>
                    {coincidencia.nombreMascotaPerdida} con {coincidencia.nombreMascotaEncontrada}
                  </p>
                </div>

                <div style={styles.score} aria-label={`${porcentaje}% de coincidencia`}>
                  {porcentaje}%
                </div>
              </div>

              <div style={styles.body}>
                <div style={styles.details}>
                  <div>
                    <div style={styles.detailLabel}>Mascota perdida</div>
                    <div style={styles.detailValue}>{coincidencia.nombreMascotaPerdida || "No informada"}</div>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Mascota encontrada</div>
                    <div style={styles.detailValue}>{coincidencia.nombreMascotaEncontrada || "No informada"}</div>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Tipo</div>
                    <div style={styles.detailValue}>{coincidencia.tipo || "No informado"}</div>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Raza</div>
                    <div style={styles.detailValue}>{coincidencia.raza || "No informada"}</div>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Color</div>
                    <div style={styles.detailValue}>{coincidencia.color || "No informado"}</div>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Edad</div>
                    <div style={styles.detailValue}>{coincidencia.edad != null ? `${coincidencia.edad} años` : "No informada"}</div>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Dimensión</div>
                    <div style={styles.detailValue}>{coincidencia.dimension || "No informada"}</div>
                  </div>
                </div>

                <div style={styles.descriptionBox}>
                  {coincidencia.descripcion || "Sin descripción disponible."}
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    style={styles.button}
                    onClick={() => navigate(`/mascota/${coincidencia.idMascotaPerdida}`)}
                  >
                    Ver Mascota Perdida
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    );
  };

  return (
    <div style={styles.page} className="page-container">
      <header style={styles.header}>
        <p style={styles.eyebrow}>Coincidencias</p>
        <h1>Coincidencias</h1>
        <p style={styles.description}>
          Revisa posibles cruces entre mascotas perdidas y encontradas asociados a tu cuenta.
        </p>
      </header>

      {renderContent()}
    </div>
  );
}

export default Coincidencias;
