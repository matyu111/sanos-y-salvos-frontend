import { useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { useAuth } from "../hooks/useAuth";
import { crearUbicacion } from "../services/geolocalizacionService";
import { crearMascota } from "../services/mascotaService";

import "../styles/registrar-mascota.css";

const MAP_CENTER = {
  lat: -33.5111,
  lng: -70.7653,
};

const initialFormData = {
  nombre: "",
  tipo: "",
  raza: "",
  color: "",
  edad: "",
  dimension: "MEDIANA",
  estado: "PERDIDA",
  fotoBase64: "",
};

const mapMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationPicker({ selectedLocation, onSelectLocation }) {
  useMapEvents({
    click(event) {
      onSelectLocation({
        latitud: Number(event.latlng.lat.toFixed(6)),
        longitud: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  if (!selectedLocation) {
    return null;
  }

  return (
    <Marker
      position={[selectedLocation.latitud, selectedLocation.longitud]}
      icon={mapMarkerIcon}
    />
  );
}

const obtenerMascotaId = (responseData) => {
  const possibleId =
    responseData?.id ??
    responseData?.mascotaId ??
    responseData?.data?.id ??
    responseData?.data?.mascotaId ??
    responseData?.mascota?.id ??
    responseData?.mascota?.mascotaId;

  if (possibleId === null || possibleId === undefined) {
    throw new Error("El backend no retorno el id de la mascota registrada.");
  }

  return Number(possibleId);
};

const validarFormulario = (formData, selectedLocation) => {
  if (!formData.nombre.trim()) {
    return "El nombre es obligatorio.";
  }

  if (!formData.raza.trim()) {
    return "La raza es obligatoria.";
  }

  if (!formData.color.trim()) {
    return "El color es obligatorio.";
  }

  if (!formData.fotoBase64) {
    return "La imagen es obligatoria.";
  }

  if (!selectedLocation) {
    return "Debes seleccionar una ubicacion en el mapa.";
  }

  return "";
};

function RegistrarMascota() {
  const auth = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [previewImage, setPreviewImage] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imageInputKey, setImageInputKey] = useState(0);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedFile) {
      setPreviewImage("");
      setFormData((prevState) => ({
        ...prevState,
        fotoBase64: "",
      }));
      return;
    }

    const fileReader = new FileReader();

    fileReader.onloadend = () => {
      const result = fileReader.result;

      if (typeof result !== "string") {
        setErrorMessage("No se pudo procesar la imagen seleccionada.");
        return;
      }

      const [, base64Content = ""] = result.split(",");

      setPreviewImage(result);
      setFormData((prevState) => ({
        ...prevState,
        fotoBase64: base64Content,
      }));
    };

    fileReader.onerror = () => {
      setErrorMessage("No se pudo leer la imagen seleccionada.");
    };

    fileReader.readAsDataURL(selectedFile);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setPreviewImage("");
    setSelectedLocation(null);
    setImageInputKey((prevKey) => prevKey + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validarFormulario(formData, selectedLocation);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const usuarioId = Number(auth.userId);

    if (!Number.isFinite(usuarioId) || usuarioId <= 0) {
      setErrorMessage("No fue posible identificar al usuario autenticado.");
      return;
    }

    setIsSubmitting(true);

    try {
      const mascotaPayload = {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo.trim(),
        raza: formData.raza.trim(),
        color: formData.color.trim(),
        edad: formData.edad === "" ? 0 : Number(formData.edad),
        dimension: formData.dimension,
        estado: formData.estado,
        usuarioId,
        fotoBase64: formData.fotoBase64,
      };

      const mascotaResponse = await crearMascota(mascotaPayload);
      const mascotaId = obtenerMascotaId(mascotaResponse);

      await crearUbicacion({
        mascotaId,
        latitud: selectedLocation.latitud,
        longitud: selectedLocation.longitud,
      });

      resetForm();
      setSuccessMessage("Mascota registrada correctamente junto con su ubicacion.");
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.mensaje ||
        error.message ||
        "No se pudo registrar la mascota.";

      setErrorMessage(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="registrar-mascota-page">
      <div className="page-container registrar-mascota-container">
        <div className="registrar-mascota-header">
          <div>
            <h1>Registrar Mascota</h1>
            <p>
              Completa los datos basicos de la mascota, selecciona una imagen y
              marca la ubicacion en el mapa.
            </p>
          </div>
        </div>

        {errorMessage ? (
          <div className="form-alert form-alert-error">{errorMessage}</div>
        ) : null}

        {successMessage ? (
          <div className="form-alert form-alert-success">{successMessage}</div>
        ) : null}

        <form className="registrar-mascota-form" onSubmit={handleSubmit}>
          <div className="registrar-mascota-grid">
            <label className="form-field">
              <span>Nombre *</span>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre de la mascota"
              />
            </label>

            <label className="form-field">
              <span>Tipo</span>
              <input
                type="text"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                placeholder="Perro, gato, ave..."
              />
            </label>

            <label className="form-field">
              <span>Raza *</span>
              <input
                type="text"
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                placeholder="Raza de la mascota"
              />
            </label>

            <label className="form-field">
              <span>Color *</span>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Color principal"
              />
            </label>

            <label className="form-field">
              <span>Edad</span>
              <input
                type="number"
                name="edad"
                min="0"
                value={formData.edad}
                onChange={handleChange}
                placeholder="0"
              />
            </label>

            <label className="form-field">
              <span>Dimension</span>
              <select
                name="dimension"
                value={formData.dimension}
                onChange={handleChange}
              >
                <option value="PEQUENA">PEQUENA</option>
                <option value="MEDIANA">MEDIANA</option>
                <option value="GRANDE">GRANDE</option>
              </select>
            </label>

            <label className="form-field">
              <span>Estado</span>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="PERDIDA">PERDIDA</option>
                <option value="ENCONTRADA">ENCONTRADA</option>
              </select>
            </label>

            <label className="form-field form-field-file">
              <span>Imagen *</span>
              <input
                key={imageInputKey}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="registrar-mascota-preview-block">
            <div className="image-preview-card">
              <h2>Vista previa</h2>
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Vista previa de la mascota"
                  className="image-preview"
                />
              ) : (
                <div className="image-preview-placeholder">
                  Selecciona una imagen para visualizarla.
                </div>
              )}
            </div>

            <div className="map-card">
              <div className="map-card-header">
                <div>
                  <h2>Ubicacion *</h2>
                  <p>Haz clic en el mapa para seleccionar la ubicacion.</p>
                </div>
                <div className="coordinates-box">
                  <span>
                    Latitud:{" "}
                    {selectedLocation ? selectedLocation.latitud : "No definida"}
                  </span>
                  <span>
                    Longitud:{" "}
                    {selectedLocation ? selectedLocation.longitud : "No definida"}
                  </span>
                </div>
              </div>

              <MapContainer
                center={[MAP_CENTER.lat, MAP_CENTER.lng]}
                zoom={13}
                scrollWheelZoom
                className="pet-location-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker
                  selectedLocation={selectedLocation}
                  onSelectLocation={setSelectedLocation}
                />
              </MapContainer>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default RegistrarMascota;
