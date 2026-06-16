import axiosConfig from "../api/axiosConfig";

export const crearMascota = async (mascotaData) => {
  const response = await axiosConfig.post("/bff/mascotas", mascotaData);
  return response.data;
};
