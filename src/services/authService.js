import axiosConfig from "../api/axiosConfig";

export const loginUsuario = async (datos) => {
  const response = await axiosConfig.post("/bff/usuarios/login", datos);
  return response.data;
};

export const registrarUsuario = async (datos) => {
  const response = await axiosConfig.post("/bff/usuarios", datos);
  return response.data;
};