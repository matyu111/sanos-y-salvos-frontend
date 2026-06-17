import axiosConfig from "../api/axiosConfig";

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  return [];
};

export const obtenerUsuariosAdmin = async () => {
  const response = await axiosConfig.get("/bff/usuarios");
  return toArray(response.data);
};

export const obtenerDashboardAdmin = async () => {
  const [usuariosResponse, mascotasResponse, coincidenciasResponse] = await Promise.allSettled([
    axiosConfig.get("/bff/usuarios"),
    axiosConfig.get("/bff/mascotas"),
    axiosConfig.get("/bff/coincidencias"),
  ]);

  const usuarios = usuariosResponse.status === "fulfilled" ? toArray(usuariosResponse.value.data) : [];
  const mascotas = mascotasResponse.status === "fulfilled" ? toArray(mascotasResponse.value.data) : [];
  const coincidencias =
    coincidenciasResponse.status === "fulfilled" ? toArray(coincidenciasResponse.value.data) : [];

  return {
    usuarios,
    mascotas,
    coincidencias,
  };
};