import axiosConfig from "../api/axiosConfig";

export const loginUsuario = async (datos) => {
  const response = await axiosConfig.post("/bff/usuarios/login", datos);
  return response.data;
};
