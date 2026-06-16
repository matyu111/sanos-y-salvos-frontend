import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MascotaCard from "../components/mapa/MascotaCard";
import MascotasMap from "../components/mapa/MascotasMap";
import { obtenerUbicaciones } from "../services/geolocalizacionService";
import { obtenerMascotas } from "../services/mascotaService";

const FILTER_CONFIG = {
  tipo: {
    label: "Tipo",
    options: [
      { value: "Perro", label: "Perro" },
      { value: "Gato", label: "Gato" },
      { value: "Conejo", label: "Conejo" },
      { value: "Ave", label: "Ave" },
      { value: "Hamster", label: "Hámster" },
      { value: "Erizo", label: "Erizo" },
      { value: "Otros", label: "Otros" },
    ],
  },
  color: {
    label: "Color",
    options: [
      { value: "Blanco", label: "Blanco" },
      { value: "Negro", label: "Negro" },
      { value: "Cafe", label: "Café" },
      { value: "Gris", label: "Gris" },
      { value: "Beige", label: "Beige" },
      { value: "Canela", label: "Canela" },
      { value: "Naranjo", label: "Naranjo" },
      { value: "Amarillo", label: "Amarillo" },
      { value: "Crema", label: "Crema" },
      { value: "Tricolor", label: "Tricolor" },
      { value: "Bicolor", label: "Bicolor" },
      { value: "Manchado", label: "Manchado" },
      { value: "Otros", label: "Otros" },
    ],
  },
  estado: {
    label: "Estado",
    options: [
      { value: "PERDIDA", label: "Perdida" },
      { value: "ENCONTRADA", label: "Encontrada" },
    ],
  },
  dimension: {
    label: "Dimensión",
    options: [
      { value: "PEQUEÑA", label: "Pequeña" },
      { value: "MEDIANA", label: "Mediana" },
      { value: "GRANDE", label: "Grande" },
    ],
  },
};

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getFilterOptionLabel(filterKey, filterValue) {
  const matchingOption = FILTER_CONFIG[filterKey]?.options.find(
    (option) => normalizeText(option.value) === normalizeText(filterValue)
  );

  return matchingOption?.label ?? filterValue;
}

function toNumber(value) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function pickCoordinate(source, keys) {
  for (const key of keys) {
    const normalized = toNumber(source?.[key]);

    if (normalized != null) {
      return normalized;
    }
  }

  return null;
}

function normalizeUbicacion(ubicacion) {
  return {
    ...ubicacion,
    latitud: pickCoordinate(ubicacion, ["latitud", "latitude", "lat"]),
    longitud: pickCoordinate(ubicacion, ["longitud", "longitude", "lng", "lon"]),
  };
}

function mergeMascotasConUbicaciones(mascotas, ubicaciones) {
  const ubicacionesPorMascotaId = new Map(
    ubicaciones.map((ubicacion) => [Number(ubicacion.mascotaId), normalizeUbicacion(ubicacion)])
  );

  return mascotas.map((mascota) => {
    const ubicacion = ubicacionesPorMascotaId.get(Number(mascota.id)) ?? null;

    return {
      ...mascota,
      ubicacion,
      latitud: ubicacion?.latitud ?? null,
      longitud: ubicacion?.longitud ?? null,
    };
  });
}

function Inicio() {
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    tipo: "",
    color: "",
    estado: "",
    dimension: "",
  });
  const [selectedMascotaId, setSelectedMascotaId] = useState(null);

  useEffect(() => {
    let active = true;

    const cargarDatos = async () => {
      setLoading(true);
      setError("");

      try {
        const [mascotasData, ubicacionesData] = await Promise.all([
          obtenerMascotas(),
          obtenerUbicaciones(),
        ]);

        if (!active) {
          return;
        }

        const mascotasNormalizadas = Array.isArray(mascotasData) ? mascotasData : [];
        const ubicacionesNormalizadas = Array.isArray(ubicacionesData) ? ubicacionesData : [];

        setMascotas(mergeMascotasConUbicaciones(mascotasNormalizadas, ubicacionesNormalizadas));
      } catch (fetchError) {
        if (!active) {
          return;
        }

        const mensaje =
          fetchError?.response?.data?.message ||
          fetchError?.message ||
          "No fue posible cargar la pantalla de inicio.";

        setMascotas([]);
        setError(mensaje);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    cargarDatos();

    return () => {
      active = false;
    };
  }, []);

  const availableFilters = useMemo(
    () =>
      Object.entries(FILTER_CONFIG).map(([key, config]) => ({
        key,
        label: config.label,
        options: config.options,
      })),
    []
  );

  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([, value]) => value)
        .map(([key, value]) => ({
          key,
          value,
          label: `${FILTER_CONFIG[key]?.label ?? key}: ${getFilterOptionLabel(key, value)}`,
        })),
    [filters]
  );

  const hasActiveFilters = activeFilters.length > 0;

  const mascotasFiltradas = useMemo(() => {
    const normalizedTerm = normalizeText(searchTerm);

    return mascotas.filter((mascota) => {
      const nombre = normalizeText(mascota.nombre);
      const raza = normalizeText(mascota.raza);
      const matchesSearch =
        !normalizedTerm || nombre.includes(normalizedTerm) || raza.includes(normalizedTerm);

      if (!matchesSearch) {
        return false;
      }

      return Object.entries(filters).every(([key, value]) => {
        if (!value) {
          return true;
        }

        return normalizeText(mascota[key]) === normalizeText(value);
      });
    });
  }, [filters, mascotas, searchTerm]);

  const selectedMascota = useMemo(
    () => mascotasFiltradas.find((mascota) => Number(mascota.id) === Number(selectedMascotaId)) ?? null,
    [mascotasFiltradas, selectedMascotaId]
  );

  const handleSelectMascota = (mascota) => {
    setSelectedMascotaId(mascota.id);
  };

  const handleViewDetails = (mascotaId) => {
    navigate(`/mascota/${mascotaId}`);
  };

  const handleFilterChange = (fieldName, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [fieldName]: value,
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      tipo: "",
      color: "",
      estado: "",
      dimension: "",
    });
  };

  const renderMainContent = () => {
    if (loading) {
      return <div className="inicio-state-card">Cargando mapa y mascotas...</div>;
    }

    if (error) {
      return <div className="inicio-state-card inicio-state-error">{error}</div>;
    }

    if (!mascotas.length) {
      return <div className="inicio-state-card">No hay mascotas registradas para mostrar.</div>;
    }

    return (
      <div className="inicio-dashboard">
        <section className="inicio-map-panel" aria-label="Mapa de mascotas">
          <div className="panel-header inicio-map-header">
            <div>
              <h2>Explora reportes cercanos</h2>
            </div>
            <span className="panel-badge">
              {
                mascotasFiltradas.filter(
                  (mascota) => mascota.latitud != null && mascota.longitud != null
                ).length
              }{" "}
              marcadores
            </span>
          </div>

          <MascotasMap
            mascotas={mascotasFiltradas}
            selectedMascotaId={selectedMascotaId}
            onSelectMascota={handleSelectMascota}
            onViewDetails={handleViewDetails}
          />
        </section>

        <aside className="inicio-search-panel" aria-label="Buscador de mascotas">
          <div className="inicio-search-heading">
            <h2>Explorar mascotas</h2>
          </div>

          <div className="inicio-search-toolbar">
            <label className="search-field inicio-search-field">
              <span className="sr-only">Buscar mascota</span>
              <input
                type="search"
                placeholder="Buscar mascota"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            {availableFilters.length > 0 && (
              <button
                type="button"
                className={`filter-toggle-button ${filtersOpen ? "filter-toggle-button-active" : ""}`}
                onClick={() => setFiltersOpen((currentValue) => !currentValue)}
                aria-expanded={filtersOpen}
                aria-controls="inicio-filtros-panel"
              >
                Filtros
                {hasActiveFilters ? <span className="filter-count-badge">{activeFilters.length}</span> : null}
              </button>
            )}
          </div>

          {filtersOpen && availableFilters.length > 0 ? (
            <div id="inicio-filtros-panel" className="filters-panel">
              <div className="filters-panel-grid">
                {availableFilters.map((filterItem) => (
                  <label key={filterItem.key} className="filter-field">
                    <span>{filterItem.label}</span>
                    <select
                      value={filters[filterItem.key]}
                      onChange={(event) => handleFilterChange(filterItem.key, event.target.value)}
                    >
                      <option value="">Todos</option>
                      {filterItem.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <div className="filters-panel-actions">
                <button type="button" className="filters-clear-button" onClick={handleClearFilters}>
                  Limpiar todo
                </button>
              </div>
            </div>
          ) : null}

          <div className="search-results-meta">
            <span>{mascotasFiltradas.length} resultados</span>
            {(searchTerm.trim() || hasActiveFilters) && (
              <button type="button" className="search-reset-button" onClick={handleClearFilters}>
                Limpiar todo
              </button>
            )}
          </div>

          {hasActiveFilters ? (
            <div className="active-filters-row" aria-label="Filtros activos">
              {activeFilters.map((filterItem) => (
                <button
                  key={filterItem.key}
                  type="button"
                  className="active-filter-chip"
                  onClick={() => handleFilterChange(filterItem.key, "")}
                >
                  {filterItem.label} x
                </button>
              ))}
            </div>
          ) : null}

          <div className="inicio-results-scroll">
            {mascotasFiltradas.length ? (
              <div className="inicio-results-grid">
                {mascotasFiltradas.map((mascota) => (
                  <MascotaCard
                    key={mascota.id}
                    mascota={mascota}
                    isSelected={Number(selectedMascota?.id) === Number(mascota.id)}
                    onSelect={handleSelectMascota}
                  />
                ))}
              </div>
            ) : (
              <div className="inicio-state-card inicio-state-empty">
                No se encontraron mascotas con ese criterio.
              </div>
            )}
          </div>
        </aside>
      </div>
    );
  };

  return (
    <div className="page-container inicio-page">
      <div className="inicio-hero">
        <div className="inicio-hero-content">
          <h1 className="inicio-hero-title">Encuentra y ayuda a encontrar mascotas perdidas</h1>
        </div>
      </div>

      {renderMainContent()}
    </div>
  );
}

export default Inicio;
