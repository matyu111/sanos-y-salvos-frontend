import { useEffect, useMemo, useState } from "react";

import {
  obtenerCoincidenciasAdmin,
  obtenerCoincidenciasAdminPorUsuario,
} from "../../services/adminService";

const FILTER_OPTIONS = [
  { value: "ALL", label: "Todas" },
  { value: "USER", label: "Por usuario" },
];

const MATCH_LABELS = ["raza", "color", "edad", "dimensión"];

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.content)) {
    return value.content;
  }

  if (Array.isArray(value?.coincidencias)) {
    return value.coincidencias;
  }

  return [];
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

function getEstadoLabel(value) {
  if (!value) {
    return "Sin estado";
  }

  const normalized = normalizeText(value);

  if (normalized === "perdida") {
    return "Perdida";
  }

  if (normalized === "encontrada") {
    return "Encontrada";
  }

  return String(value);
}

function formatEdad(value) {
  if (value == null || value === "") {
    return "No informada";
  }

  return `${value} años`;
}

function pickFirst(source, keys) {
  for (const key of keys) {
    const value = source?.[key];

    if (value != null && value !== "") {
      return value;
    }
  }

  return "";
}

function getPetSource(coincidencia, side) {
  const capitalizedSide = side === "perdida" ? "Perdida" : "Encontrada";
  const nestedKeys = [
    `mascota${capitalizedSide}`,
    `mascota_${side}`,
    side,
    side === "perdida" ? "perdida" : "encontrada",
  ];

  for (const key of nestedKeys) {
    const nested = coincidencia?.[key];

    if (nested && typeof nested === "object") {
      return nested;
    }
  }

  return coincidencia || {};
}

function buildPetData(coincidencia, side) {
  const source = getPetSource(coincidencia, side);
  const suffix = side === "perdida" ? "Perdida" : "Encontrada";

  return {
    nombre:
      pickFirst(source, ["nombre", "name"]) ||
      pickFirst(coincidencia, [`nombreMascota${suffix}`, `nombre_${side}`, `nombre${suffix}`]) ||
      "Sin nombre",
    tipo:
      pickFirst(source, ["tipo", "especie"]) ||
      pickFirst(coincidencia, [`tipoMascota${suffix}`, `tipo_${side}`]) ||
      "No informado",
    raza:
      pickFirst(source, ["raza"]) ||
      pickFirst(coincidencia, [`razaMascota${suffix}`, `raza_${side}`]) ||
      "No informada",
    color:
      pickFirst(source, ["color"]) ||
      pickFirst(coincidencia, [`colorMascota${suffix}`, `color_${side}`]) ||
      "No informado",
    edad:
      pickFirst(source, ["edad"]) ??
      pickFirst(coincidencia, [`edadMascota${suffix}`, `edad_${side}`]) ??
      null,
    dimension:
      pickFirst(source, ["dimension", "dimensión"]) ||
      pickFirst(coincidencia, [`dimensionMascota${suffix}`, `dimension_${side}`]) ||
      "",
    estado:
      pickFirst(source, ["estado"]) ||
      pickFirst(coincidencia, [`estadoMascota${suffix}`, `estado_${side}`]) ||
      "",
    fotoBase64:
      pickFirst(source, ["fotoBase64", "foto", "imagenBase64"]) ||
      pickFirst(coincidencia, [`fotoMascota${suffix}`, `imagenMascota${suffix}`, `foto_${side}`]) ||
      "",
  };
}

function getMatchBadge(coincidencia) {
  const criterios = coincidencia?.criteriosCoincidencia || coincidencia?.criterios || coincidencia?.coincidenceCriteria;

  if (Array.isArray(criterios) && criterios.length > 0) {
    return `Posible coincidencia: ${criterios.join(", ")}`;
  }

  if (typeof criterios === "string" && criterios.trim()) {
    return `Posible coincidencia: ${criterios.trim()}`;
  }

  return `Posible coincidencia: ${MATCH_LABELS.join(", ")}`;
}

function getCardTitle(coincidencia) {
  const perdida = buildPetData(coincidencia, "perdida");
  const encontrada = buildPetData(coincidencia, "encontrada");
  return `${perdida.nombre} con ${encontrada.nombre}`;
}

function getScoreLabel(value) {
  const porcentaje = Number(value ?? 0);

  if (Number.isNaN(porcentaje)) {
    return "--";
  }

  return `${Math.max(0, Math.min(100, Math.round(porcentaje)))}%`;
}

function AdminCoincidencias() {
  const [filterMode, setFilterMode] = useState("ALL");
  const [usuarioIdInput, setUsuarioIdInput] = useState("");
  const [usuarioIdActive, setUsuarioIdActive] = useState("");
  const [coincidencias, setCoincidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCoincidencia, setSelectedCoincidencia] = useState(null);
  const [filterFeedback, setFilterFeedback] = useState("");

  useEffect(() => {
    let active = true;

    const cargarCoincidencias = async () => {
      setLoading(true);
      setError("");
      setFilterFeedback("");

      try {
        const data =
          filterMode === "ALL"
            ? await obtenerCoincidenciasAdmin()
            : usuarioIdActive
              ? await obtenerCoincidenciasAdminPorUsuario(usuarioIdActive)
              : [];

        if (!active) {
          return;
        }

        setCoincidencias(normalizeList(data));

        if (filterMode === "USER" && !usuarioIdActive) {
          setFilterFeedback("Ingresa un ID de usuario para filtrar coincidencias.");
        }
      } catch (fetchError) {
        if (!active) {
          return;
        }

        setCoincidencias([]);
        setError(fetchError?.response?.data?.message || fetchError?.message || "No fue posible cargar las coincidencias.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void cargarCoincidencias();

    return () => {
      active = false;
    };
  }, [filterMode, usuarioIdActive]);

  const rows = useMemo(() => coincidencias, [coincidencias]);

  const handleSubmitUserFilter = () => {
    const trimmed = usuarioIdInput.trim();

    if (!trimmed) {
      setUsuarioIdActive("");
      setFilterFeedback("Ingresa un ID de usuario para filtrar coincidencias.");
      return;
    }

    if (Number.isNaN(Number(trimmed))) {
      setFilterFeedback("El ID de usuario debe ser numérico.");
      return;
    }

    setFilterFeedback("");
    setUsuarioIdActive(trimmed);
  };

  const openDetail = (coincidencia) => {
    setSelectedCoincidencia(coincidencia);
  };

  const closeDetail = () => {
    setSelectedCoincidencia(null);
  };

  const renderPetPanel = (title, pet, cardId) => (
    <article className="admin-match-pet-card" aria-labelledby={cardId}>
      <div className="admin-match-pet-media">
        {pet.fotoBase64 ? (
          <img className="admin-match-pet-image" src={toImageSrc(pet.fotoBase64)} alt={`${title} ${pet.nombre}`} />
        ) : (
          <div className="admin-match-pet-placeholder">Sin foto</div>
        )}
      </div>

      <div className="admin-match-pet-content">
        <div className="admin-match-pet-titleRow">
          <h4 id={cardId}>{title}</h4>
          <span className={`admin-pet-status ${normalizeText(pet.estado) === "encontrada" ? "admin-pet-status-found" : "admin-pet-status-lost"}`}>
            {getEstadoLabel(pet.estado)}
          </span>
        </div>

        <div className="admin-match-pet-name">{pet.nombre}</div>

        <dl className="admin-match-pet-meta">
          <div>
            <dt>Tipo</dt>
            <dd>{pet.tipo}</dd>
          </div>
          <div>
            <dt>Raza</dt>
            <dd>{pet.raza}</dd>
          </div>
          <div>
            <dt>Color</dt>
            <dd>{pet.color}</dd>
          </div>
          <div>
            <dt>Edad</dt>
            <dd>{formatEdad(pet.edad)}</dd>
          </div>
          <div>
            <dt>Dimensión</dt>
            <dd>{getDimensionLabel(pet.dimension)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );

  return (
    <section className="admin-section admin-coincidencias-section">
      <header className="admin-section-header">
        <div>
          <p className="admin-section-kicker">Coincidencias admin</p>
          <h2>Coincidencias</h2>
          <p>Vista de administración con comparación visual lado a lado y filtro por usuario.</p>
        </div>

        <div className="admin-section-actions admin-coincidencias-actions">
          <span className="admin-pill">{loading ? "Cargando" : `${rows.length} resultados`}</span>

          <select
            className="admin-coincidencias-select"
            value={filterMode}
            onChange={(event) => {
              const nextMode = event.target.value;
              setFilterMode(nextMode);
              setSelectedCoincidencia(null);
              setError("");
              setFilterFeedback("");

              if (nextMode === "ALL") {
                setUsuarioIdInput("");
                setUsuarioIdActive("");
              }
            }}
            aria-label="Filtro de coincidencias"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {filterMode === "USER" && (
            <div className="admin-coincidencias-userFilter">
              <input
                className="admin-coincidencias-input"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="ID de usuario"
                value={usuarioIdInput}
                onChange={(event) => setUsuarioIdInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSubmitUserFilter();
                  }
                }}
              />
              <button type="button" className="admin-action-link" onClick={handleSubmitUserFilter}>
                Filtrar
              </button>
            </div>
          )}
        </div>
      </header>

      {filterFeedback && <div className="admin-feedback">{filterFeedback}</div>}
      {!loading && error && <div className="admin-feedback admin-feedback-warning">{error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div className="admin-feedback">No hay coincidencias para mostrar.</div>
      )}

      {!loading && rows.length > 0 && (
        <div className="admin-coincidencias-grid" aria-label="Listado de coincidencias">
          {rows.map((coincidencia, index) => {
            const perdida = buildPetData(coincidencia, "perdida");
            const encontrada = buildPetData(coincidencia, "encontrada");
            const porcentaje = getScoreLabel(coincidencia.porcentajeCoincidencia);
            const badge = getMatchBadge(coincidencia);
            const cardKey = `${coincidencia.idMascotaPerdida ?? index}-${coincidencia.idMascotaEncontrada ?? index}`;

            return (
              <article
                key={cardKey}
                className="admin-coincidencia-card"
                onClick={() => openDetail(coincidencia)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openDetail(coincidencia);
                  }
                }}
              >
                <div className="admin-coincidencia-cardHeader">
                  <div className="admin-coincidencia-cardHeaderText">
                    <p className="admin-coincidencia-cardKicker">Coincidencia de mascotas</p>
                    <h3>{getCardTitle(coincidencia)}</h3>
                    <span className="admin-coincidencia-badge">{badge}</span>
                  </div>

                  <div className="admin-coincidencia-score" aria-label={`${porcentaje} de coincidencia`}>
                    {porcentaje}
                  </div>
                </div>

                <div className="admin-coincidencia-comparison">
                  {renderPetPanel("Mascota perdida", perdida, `perdida-${cardKey}`)}
                  {renderPetPanel("Mascota encontrada", encontrada, `encontrada-${cardKey}`)}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedCoincidencia && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" onClick={closeDetail}>
          <div className="admin-modal admin-match-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <p className="admin-section-kicker">Comparación detallada</p>
                <h3>{getCardTitle(selectedCoincidencia)}</h3>
              </div>
              <button className="admin-modal-close" type="button" aria-label="Cerrar detalle" onClick={closeDetail}>
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-match-badgeWrap">
                <span className="admin-match-badge">{getMatchBadge(selectedCoincidencia)}</span>
              </div>

              <div className="admin-match-modalGrid">
                {renderPetPanel(
                  "Mascota perdida",
                  buildPetData(selectedCoincidencia, "perdida"),
                  "detalle-perdida"
                )}
                {renderPetPanel(
                  "Mascota encontrada",
                  buildPetData(selectedCoincidencia, "encontrada"),
                  "detalle-encontrada"
                )}
              </div>

              <dl className="admin-match-summary">
                <div>
                  <dt>ID mascota perdida</dt>
                  <dd>{selectedCoincidencia.idMascotaPerdida ?? "No informado"}</dd>
                </div>
                <div>
                  <dt>ID mascota encontrada</dt>
                  <dd>{selectedCoincidencia.idMascotaEncontrada ?? "No informado"}</dd>
                </div>
                <div>
                  <dt>Porcentaje</dt>
                  <dd>{getScoreLabel(selectedCoincidencia.porcentajeCoincidencia)}</dd>
                </div>
                <div>
                  <dt>Descripción</dt>
                  <dd>{selectedCoincidencia.descripcion || "Sin descripción disponible."}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminCoincidencias;