import { useEffect, useMemo, useRef } from "react";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const INITIAL_CENTER = [-33.5111, -70.7653];

const mapMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapSelectionController({ selectedMascota, markerRefs }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedMascota || selectedMascota.latitud == null || selectedMascota.longitud == null) {
      return;
    }

    const coords = [selectedMascota.latitud, selectedMascota.longitud];
    map.flyTo(coords, 16, { animate: true, duration: 0.8 });

    const marker = markerRefs.current[selectedMascota.id];

    if (marker) {
      window.setTimeout(() => {
        marker.openPopup();
      }, 100);
    }
  }, [map, markerRefs, selectedMascota]);

  return null;
}

function MascotasMap({ mascotas, selectedMascotaId, onSelectMascota, onViewDetails }) {
  const markerRefs = useRef({});

  const mascotasConUbicacion = useMemo(
    () => mascotas.filter((mascota) => mascota.latitud != null && mascota.longitud != null),
    [mascotas]
  );

  const selectedMascota = useMemo(
    () => mascotasConUbicacion.find((mascota) => Number(mascota.id) === Number(selectedMascotaId)) ?? null,
    [mascotasConUbicacion, selectedMascotaId]
  );

  return (
    <MapContainer center={INITIAL_CENTER} zoom={13} scrollWheelZoom className="inicio-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapSelectionController selectedMascota={selectedMascota} markerRefs={markerRefs} />

      {mascotasConUbicacion.map((mascota) => (
        <Marker
          key={mascota.id}
          position={[mascota.latitud, mascota.longitud]}
          icon={mapMarkerIcon}
          ref={(marker) => {
            if (marker) {
              markerRefs.current[mascota.id] = marker;
              return;
            }

            delete markerRefs.current[mascota.id];
          }}
          eventHandlers={{
            click: () => onSelectMascota(mascota),
          }}
        >
          <Popup closeButton>
            <div className="map-popup">
              <div className="map-popup-photo-wrap">
                {mascota.fotoBase64 ? (
                  <img
                    className="map-popup-photo"
                    src={`data:image/jpeg;base64,${mascota.fotoBase64}`}
                    alt={`Foto de ${mascota.nombre}`}
                  />
                ) : (
                  <div className="map-popup-photo map-popup-photo-placeholder">Sin foto</div>
                )}
              </div>

              <div className="map-popup-content">
                <h3>{mascota.nombre}</h3>
                <span>{mascota.estado}</span>

                <dl className="map-popup-details">
                  <div>
                    <dt>Raza</dt>
                    <dd>{mascota.raza || "No informada"}</dd>
                  </div>
                  <div>
                    <dt>Color</dt>
                    <dd>{mascota.color || "No informado"}</dd>
                  </div>
                  <div>
                    <dt>Fecha reporte</dt>
                    <dd>{mascota.fechaReporte || "Sin fecha"}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="map-popup-button"
                  onClick={() => onViewDetails?.(mascota.id)}
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MascotasMap;