import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
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

const MAIPU_VALIDATION_MESSAGE =
  "Solo es posible registrar mascotas dentro de la comuna de Maipú.";

const DIMENSION_OPTIONS = [
  { value: "PEQUENA", label: "Pequeña" },
  { value: "MEDIANA", label: "Mediana" },
  { value: "GRANDE", label: "Grande" },
];

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

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function locationBelongsToMaipu(locationData) {
  const address = locationData?.address ?? {};
  const possibleFields = [
    address.city,
    address.town,
    address.village,
    address.municipality,
    address.suburb,
    address.city_district,
    address.county,
    address.state_district,
    locationData?.display_name,
  ];

  return possibleFields.some((field) => normalizeText(field).includes("maipu"));
}

async function reverseGeocodeLocation({ latitud, longitud }) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitud}&lon=${longitud}&zoom=18&addressdetails=1&accept-language=es`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo validar la ubicación seleccionada.");
  }

  return response.json();
}

async function searchAddress(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=cl&accept-language=es&q=${encodeURIComponent(
      `${query}, Maipú, Chile`
    )}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo buscar la dirección ingresada.");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function buildLocationDescription(locationData, fallbackLabel = "") {
  return locationData?.display_name || fallbackLabel || "";
}

function LocationPicker({ selectedLocation, onSelectLocation }) {
  useMapEvents({
    click(event) {
      void onSelectLocation({
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

function MapViewportController({ selectedLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedLocation) {
      return;
    }

    map.flyTo([selectedLocation.latitud, selectedLocation.longitud], 16, {
      animate: true,
      duration: 0.8,
    });
  }, [map, selectedLocation]);

  return null;
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
  const [addressQuery, setAddressQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedLocationLabel, setSelectedLocationLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
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
    setAddressQuery("");
    setSelectedLocation(null);
    setSelectedLocationLabel("");
    setImageInputKey((prevKey) => prevKey + 1);
  };

  const validateAndSetLocation = async (location, locationData, fallbackLabel = "") => {
    setIsValidatingLocation(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const resolvedLocationData = locationData ?? (await reverseGeocodeLocation(location));

      if (!locationBelongsToMaipu(resolvedLocationData)) {
        setErrorMessage(MAIPU_VALIDATION_MESSAGE);
        return false;
      }

      setSelectedLocation(location);
      setSelectedLocationLabel(buildLocationDescription(resolvedLocationData, fallbackLabel));
      return true;
    } catch (validationError) {
      setErrorMessage(
        validationError.message || "No se pudo validar la ubicación seleccionada."
      );
      return false;
    } finally {
      setIsValidatingLocation(false);
    }
  };

  const handleMapLocationSelect = async (location) => {
    await validateAndSetLocation(location);
  };

  const handleAddressSearch = async () => {
    const query = addressQuery.trim();

    if (!query) {
      setErrorMessage("Ingresa una dirección para buscar la ubicación.");
      setSuccessMessage("");
      return;
    }

    setIsSearchingAddress(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const results = await searchAddress(query);

      if (!results.length) {
        setErrorMessage("No se encontró una ubicación para la dirección ingresada.");
        return;
      }

      const validResult = results.find((result) => locationBelongsToMaipu(result));

      if (!validResult) {
        setErrorMessage(MAIPU_VALIDATION_MESSAGE);
        return;
      }

      const location = {
        latitud: Number(Number(validResult.lat).toFixed(6)),
        longitud: Number(Number(validResult.lon).toFixed(6)),
      };

      const locationWasSelected = await validateAndSetLocation(
        location,
        validResult,
        query
      );

      if (locationWasSelected) {
        setAddressQuery(query);
      }
    } catch (searchError) {
      setErrorMessage(searchError.message || "No se pudo buscar la dirección ingresada.");
    } finally {
      setIsSearchingAddress(false);
    }
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
              <span>Dimensión</span>
              <select
                name="dimension"
                value={formData.dimension}
                onChange={handleChange}
              >
                {DIMENSION_OPTIONS.map((dimensionOption) => (
                  <option key={dimensionOption.value} value={dimensionOption.value}>
                    {dimensionOption.label}
                  </option>
                ))}
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
                  <h2>Ubicación *</h2>
                  <p>
                    Busca una dirección o haz clic en el mapa para seleccionar la ubicación.
                  </p>
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
                  <span>
                    Referencia: {selectedLocationLabel || "No definida"}
                  </span>
                </div>
              </div>

              <div className="address-search-row">
                <label className="form-field address-search-field">
                  <span>Dirección en Maipú</span>
                  <input
                    type="text"
                    value={addressQuery}
                    onChange={(event) => setAddressQuery(event.target.value)}
                    placeholder="Ej: Avenida Pajaritos 1234"
                  />
                </label>

                <button
                  type="button"
                  className="address-search-button"
                  onClick={handleAddressSearch}
                  disabled={isSearchingAddress || isValidatingLocation}
                >
                  {isSearchingAddress ? "Buscando..." : "Buscar dirección"}
                </button>
              </div>

              {isValidatingLocation ? (
                <p className="map-helper-text">Validando que la ubicación pertenezca a Maipú...</p>
              ) : null}

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
                <MapViewportController selectedLocation={selectedLocation} />
                <LocationPicker
                  selectedLocation={selectedLocation}
                  onSelectLocation={handleMapLocationSelect}
                />
              </MapContainer>
            </div>
          </div>

          {errorMessage ? (
            <div className="form-alert form-alert-error">{errorMessage}</div>
          ) : null}

          {successMessage ? (
            <div className="form-alert form-alert-success">{successMessage}</div>
          ) : null}

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
