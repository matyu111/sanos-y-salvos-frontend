import axiosConfig from "../api/axiosConfig";

export const obtenerUbicaciones = async () => {
  const response = await axiosConfig.get("/bff/geolocalizacion");
  return response.data;
};

export const crearUbicacion = async (ubicacionData) => {
  const response = await axiosConfig.post("/bff/geolocalizacion", ubicacionData);
  return response.data;
};
