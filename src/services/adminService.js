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

export const obtenerMascotasAdmin = async () => {
  const response = await axiosConfig.get("/bff/mascotas");
  return toArray(response.data);
};

export const obtenerMascotaAdminPorId = async (id) => {
  if (id == null || Number.isNaN(Number(id))) {
    throw new Error("id inválido");
  }

  const response = await axiosConfig.get(`/bff/mascotas/${id}`);
  return response.data;
};

export const obtenerMascotasAdminPorEstado = async (estado) => {
  const estadoNormalizado = String(estado ?? "").trim().toUpperCase();

  if (!estadoNormalizado) {
    return [];
  }

  const response = await axiosConfig.get(`/bff/mascotas/estado/${estadoNormalizado}`);
  return toArray(response.data);
};

export const obtenerMascotasAdminPorUsuario = async (usuarioId) => {
  if (usuarioId == null || Number.isNaN(Number(usuarioId))) {
    throw new Error("usuarioId inválido");
  }

  const response = await axiosConfig.get(`/bff/mascotas/usuario/${usuarioId}`);
  return toArray(response.data);
};

export const obtenerCoincidenciasAdmin = async () => {
  const response = await axiosConfig.get("/bff/coincidencias");
  return toArray(response.data);
};

export const obtenerCoincidenciasAdminPorUsuario = async (usuarioId) => {
  if (usuarioId == null || Number.isNaN(Number(usuarioId))) {
    throw new Error("usuarioId inválido");
  }

  const response = await axiosConfig.get(`/bff/coincidencias/usuario/${usuarioId}`);
  return toArray(response.data);
};

export const eliminarMascotaAdmin = async (id) => {
  if (id == null || Number.isNaN(Number(id))) {
    throw new Error("id inválido");
  }

  const response = await axiosConfig.delete(`/bff/mascotas/${id}`);
  return response.data;
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