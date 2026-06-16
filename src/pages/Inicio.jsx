import { useEffect, useMemo, useState } from "react";

import MascotaCard from "../components/mapa/MascotaCard";
import MascotasMap from "../components/mapa/MascotasMap";
import { obtenerUbicaciones } from "../services/geolocalizacionService";
import { obtenerMascotas } from "../services/mascotaService";

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
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  const mascotasFiltradas = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return mascotas;
    }

    return mascotas.filter((mascota) => {
      const nombre = mascota.nombre?.toLowerCase() ?? "";
      const raza = mascota.raza?.toLowerCase() ?? "";

      return nombre.includes(normalizedTerm) || raza.includes(normalizedTerm);
    });
  }, [mascotas, searchTerm]);

  const selectedMascota = useMemo(
    () => mascotasFiltradas.find((mascota) => Number(mascota.id) === Number(selectedMascotaId)) ?? null,
    [mascotasFiltradas, selectedMascotaId]
  );

  const handleSelectMascota = (mascota) => {
    setSelectedMascotaId(mascota.id);
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
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Mapa en tiempo real</p>
              <h2>Ubicación de mascotas</h2>
            </div>
            <span className="panel-badge">{mascotas.filter((mascota) => mascota.latitud != null && mascota.longitud != null).length} marcadores</span>
          </div>

          <MascotasMap
            mascotas={mascotas}
            selectedMascotaId={selectedMascotaId}
            onSelectMascota={handleSelectMascota}
          />
        </section>

        <aside className="inicio-search-panel" aria-label="Buscador de mascotas">
          <div className="panel-header panel-header-stacked">
            <div>
              <p className="panel-kicker">Buscador lateral</p>
              <h2>Explorar mascotas</h2>
            </div>
            <label className="search-field">
              <span className="sr-only">Buscar por nombre o raza</span>
              <input
                type="search"
                placeholder="Buscar por nombre o raza"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
          </div>

          <div className="search-results-meta">
            <span>{mascotasFiltradas.length} resultados</span>
          </div>

          {mascotasFiltradas.length ? (
            <div className="mascotas-list">
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
        </aside>
      </div>
    );
  };

  return (
    <div className="page-container inicio-page">
      <div className="inicio-hero">
        <div>
          <p className="section-eyebrow">Sanos y Salvos</p>
          <h1>Inicio</h1>
          <p className="section-description">
            Revisa el mapa de mascotas reportadas y usa el buscador lateral para ubicar
            rápidamente la información que necesitas.
          </p>
        </div>
      </div>

      {renderMainContent()}
    </div>
  );
}

export default Inicio;
