import axiosConfig from "../api/axiosConfig";

export const crearUbicacion = async (ubicacionData) => {
  const response = await axiosConfig.post("/bff/geolocalizacion", ubicacionData);
  return response.data;
};
