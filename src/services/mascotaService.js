import axiosConfig from "../api/axiosConfig";

export const crearMascota = async (mascotaData) => {
  const response = await axiosConfig.post("/bff/mascotas", mascotaData);
  return response.data;
};

export const obtenerMascotasPorUsuario = async (usuarioId) => {
  if (usuarioId == null || Number.isNaN(Number(usuarioId))) {
    throw new Error("usuarioId inválido");
  }

  const response = await axiosConfig.get(`/bff/mascotas/usuario/${usuarioId}`);
  return response.data;
};
