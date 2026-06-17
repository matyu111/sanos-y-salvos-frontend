import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import axiosConfig from "../../api/axiosConfig";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/admin-dashboard.css";

const KPI_CARDS = [
  { key: "usuarios", label: "Total usuarios" },
  { key: "mascotas", label: "Total mascotas" },
  { key: "perdidas", label: "Mascotas perdidas" },
  { key: "encontradas", label: "Mascotas encontradas" },
  { key: "coincidencias", label: "Total coincidencias" },
];

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  return [];
}

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

      const [usuariosResult, mascotasResult, coincidenciasResult] = await Promise.allSettled([
        axiosConfig.get("/bff/usuarios"),
        axiosConfig.get("/bff/mascotas"),
        axiosConfig.get("/bff/coincidencias"),
      ]);

      if (!active) {
        return;
      }

      const usuarios = usuariosResult.status === "fulfilled" ? toArray(usuariosResult.value) : [];
      const mascotas = mascotasResult.status === "fulfilled" ? toArray(mascotasResult.value) : [];
      const coincidencias =
        coincidenciasResult.status === "fulfilled" ? toArray(coincidenciasResult.value) : [];

      const perdidas = mascotas.filter((mascota) => normalizeText(mascota.estado) === "PERDIDA").length;
      const encontradas = mascotas.filter((mascota) => normalizeText(mascota.estado) === "ENCONTRADA").length;

      setKpis({
        usuarios: usuarios.length,
        mascotas: mascotas.length,
        perdidas,
        encontradas,
        coincidencias: coincidencias.length,
      });

      const failed = [usuariosResult, mascotasResult, coincidenciasResult].some(
        (result) => result.status === "rejected"
      );

      if (failed) {
        setError("Algunos indicadores no pudieron cargarse; se muestran los datos disponibles.");
      }

      setLoading(false);
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
    return <Navigate to="/inicio" replace />;
  }

  return (
    <main className="admin-dashboard-page">
      <section className="admin-dashboard-shell">
        <header className="admin-dashboard-header">
          <div>
            <p className="admin-dashboard-eyebrow">Acceso restringido</p>
            <h1>Dashboard Admin Sanos y Salvos</h1>
            <p>
              Resumen operativo básico para supervisión general de usuarios, mascotas y
              coincidencias.
            </p>
          </div>
          <div className="admin-dashboard-badge">{loading ? "Actualizando" : "En línea"}</div>
        </header>

        {error && <div className="admin-dashboard-alert">{error}</div>}

        <section className="admin-dashboard-grid">
          {cards.map((card) => (
            <article className="admin-kpi-card" key={card.key}>
              <span className="admin-kpi-label">{card.label}</span>
              <strong className="admin-kpi-value">{card.value}</strong>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

export default AdminDashboard;