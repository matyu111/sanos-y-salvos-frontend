import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { obtenerDashboardAdmin } from "../../services/adminService";

const KPI_CARDS = [
  { key: "usuarios", label: "Total usuarios" },
  { key: "mascotas", label: "Total mascotas" },
  { key: "perdidas", label: "Mascotas perdidas" },
  { key: "encontradas", label: "Mascotas encontradas" },
  { key: "coincidencias", label: "Total coincidencias" },
];

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function AdminDashboard() {
  const auth = useAuth();
  const [kpis, setKpis] = useState({
    usuarios: 0,
    mascotas: 0,
    perdidas: 0,
    encontradas: 0,
    coincidencias: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth.rol !== "ADMIN") {
      return;
    }

    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const { usuarios, mascotas, coincidencias } = await obtenerDashboardAdmin();

        if (!active) {
          return;
        }

        const perdidas = mascotas.filter(
          (mascota) => normalizeText(mascota.estado) === "PERDIDA"
        ).length;
        const encontradas = mascotas.filter(
          (mascota) => normalizeText(mascota.estado) === "ENCONTRADA"
        ).length;

        setKpis({
          usuarios: usuarios.length,
          mascotas: mascotas.length,
          perdidas,
          encontradas,
          coincidencias: coincidencias.length,
        });

        setError("");
      } catch {
        if (active) {
          setKpis({
            usuarios: 0,
            mascotas: 0,
            perdidas: 0,
            encontradas: 0,
            coincidencias: 0,
          });
          setError("No fue posible cargar los indicadores; se muestran valores de respaldo.");
        }
      }

      if (active) {
        setLoading(false);
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, [auth.rol]);

  const cards = useMemo(
    () => KPI_CARDS.map((card) => ({ ...card, value: kpis[card.key] ?? 0 })),
    [kpis]
  );

  if (auth.rol !== "ADMIN") {
    return null;
  }

  return (
    <section className="admin-section">
      <header className="admin-section-header">
        <div>
          <p className="admin-section-kicker">Resumen operativo</p>
          <h2>Dashboard Admin Sanos y Salvos</h2>
          <p>
            KPIs consolidados del sistema para usuarios, mascotas perdidas/encontradas y
            coincidencias.
          </p>
        </div>
        <div className="admin-section-actions">
          <span className="admin-pill">{loading ? "Actualizando" : "En linea"}</span>
          <NavLink to="/admin/users" className="admin-action-link">
            Ver usuarios
          </NavLink>
        </div>
      </header>

      {error && <div className="admin-feedback admin-feedback-warning">{error}</div>}

      <section className="admin-kpi-grid">
        {cards.map((card) => (
          <article className="admin-card" key={card.key}>
            <span className="admin-card-label">{card.label}</span>
            <strong className="admin-card-value">{card.value}</strong>
          </article>
        ))}
      </section>
    </section>
  );
}

export default AdminDashboard;