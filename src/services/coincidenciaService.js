import axiosConfig from "../api/axiosConfig";

export const obtenerCoincidenciasPorUsuario = async (userId) => {
  if (userId == null || Number.isNaN(Number(userId))) {
    throw new Error("userId inválido");
  }

  const response = await axiosConfig.get(`/bff/coincidencias/usuario/${userId}`);
  return response.data;
};