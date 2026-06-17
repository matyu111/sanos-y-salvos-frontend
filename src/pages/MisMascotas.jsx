import { useEffect, useMemo, useState } from "react";

import axiosConfig from "../api/axiosConfig";
import { useAuth } from "../hooks/useAuth";
import { obtenerMascotasPorUsuario } from "../services/mascotaService";

const DIMENSION_OPTIONS = [
  { value: "PEQUENA", label: "Pequeña" },
  { value: "MEDIANA", label: "Mediana" },
  { value: "GRANDE", label: "Grande" },
];

const ESTADO_OPTIONS = [
  { value: "PERDIDA", label: "Perdida" },
  { value: "ENCONTRADA", label: "Encontrada" },
];

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getDimensionLabel(value) {
  return (
    DIMENSION_OPTIONS.find((option) => normalizeText(option.value) === normalizeText(value))
      ?.label ?? value ?? "No informada"
  );
}

function getEstadoLabel(value) {
  return (
    ESTADO_OPTIONS.find((option) => normalizeText(option.value) === normalizeText(value))?.label ??
    value ??
    "No informado"
  );
}

function normalizeDimensionValue(value) {
  const normalized = normalizeText(value);

  if (normalized === "pequena") {
    return "PEQUENA";
  }

  if (normalized === "mediana") {
    return "MEDIANA";
  }

  if (normalized === "grande") {
    return "GRANDE";
  }

  return value ?? "MEDIANA";
}

function normalizeEstadoValue(value) {
  const normalized = normalizeText(value);

  if (normalized === "perdida") {
    return "PERDIDA";
  }

  if (normalized === "encontrada") {
    return "ENCONTRADA";
  }

  return value ?? "PERDIDA";
}

function createEditFormData(mascota) {
  return {
    id: mascota.id,
    nombre: mascota.nombre ?? "",
    tipo: mascota.tipo ?? "",
    raza: mascota.raza ?? "",
    color: mascota.color ?? "",
    edad: mascota.edad ?? "",
    dimension: normalizeDimensionValue(mascota.dimension),
    estado: normalizeEstadoValue(mascota.estado),
    fotoBase64: mascota.fotoBase64 ?? "",
  };
}

function formatFechaReporte(fechaReporte) {
  if (!fechaReporte) {
    return "Sin fecha";
  }

  const fecha = new Date(fechaReporte);

  if (Number.isNaN(fecha.getTime())) {
    return fechaReporte;
  }

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
}

function MisMascotas() {
  const { userId, isAuthenticated } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingMascota, setEditingMascota] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [editPreviewImage, setEditPreviewImage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setMascotas([]);
      setError("No se encontró una sesión activa para cargar tus mascotas.");
      return undefined;
    }

    let isActive = true;

    const cargarMascotas = async () => {
      setLoading(true);
      setError("");
      setActionError("");
      setFeedbackMessage("");

      try {
        const data = await obtenerMascotasPorUsuario(userId);

        if (!isActive) {
          return;
        }

        setMascotas(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (!isActive) {
          return;
        }

        const mensaje =
          fetchError?.response?.data?.message ||
          fetchError?.message ||
          "No fue posible cargar tus mascotas.";

        setMascotas([]);
        setError(mensaje);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    cargarMascotas();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, userId]);

  const tieneMascotas = mascotas.length > 0;
  const canShowEditModal = Boolean(editingMascota && editFormData);
  const deleteConfirmationText = useMemo(
    () =>
      deleteTarget
        ? `¿Deseas eliminar esta mascota?`
        : "",
    [deleteTarget]
  );

  const handleOpenEdit = (mascota) => {
    setOpenMenuId(null);
    setFeedbackMessage("");
    setError("");
    setActionError("");
    setEditingMascota(mascota);
    setEditFormData(createEditFormData(mascota));
    setEditPreviewImage(
      mascota.fotoBase64 ? `data:image/jpeg;base64,${mascota.fotoBase64}` : ""
    );
  };

  const handleCloseEdit = () => {
    setEditingMascota(null);
    setEditFormData(null);
    setEditPreviewImage("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleEditImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        setError("No se pudo procesar la imagen seleccionada.");
        setActionError("No se pudo procesar la imagen seleccionada.");
        return;
      }

      const [, base64Content = ""] = reader.result.split(",");

      setEditPreviewImage(reader.result);
      setEditFormData((currentFormData) => ({
        ...currentFormData,
        fotoBase64: base64Content,
      }));
    };

    reader.onerror = () => {
      setActionError("No se pudo leer la imagen seleccionada.");
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleSubmitEdit = async (event) => {
    event.preventDefault();

    if (!editFormData?.id) {
      return;
    }

    setActionLoading(true);
    setActionError("");
    setFeedbackMessage("");

    try {
      const payload = {
        nombre: editFormData.nombre.trim(),
        tipo: editFormData.tipo.trim(),
        raza: editFormData.raza.trim(),
        color: editFormData.color.trim(),
        edad: editFormData.edad === "" ? 0 : Number(editFormData.edad),
        dimension: editFormData.dimension,
        estado: editFormData.estado,
        usuarioId: Number(userId),
        fotoBase64: editFormData.fotoBase64,
      };

      await axiosConfig.put(`/bff/mascotas/${editFormData.id}`, payload);

      setMascotas((currentMascotas) =>
        currentMascotas.map((mascota) =>
          Number(mascota.id) === Number(editFormData.id)
            ? {
                ...mascota,
                ...payload,
              }
            : mascota
        )
      );

      setFeedbackMessage("Mascota actualizada correctamente.");
      handleCloseEdit();
    } catch (updateError) {
      const message =
        updateError?.response?.data?.message ||
        updateError?.response?.data?.mensaje ||
        updateError?.message ||
        "No fue posible actualizar la mascota.";

      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    setActionLoading(true);
    setActionError("");
    setFeedbackMessage("");

    try {
      await axiosConfig.delete(`/bff/mascotas/${deleteTarget.id}`);

      setMascotas((currentMascotas) =>
        currentMascotas.filter((mascota) => Number(mascota.id) !== Number(deleteTarget.id))
      );
      setDeleteTarget(null);
      setFeedbackMessage("Mascota eliminada correctamente.");
    } catch (deleteError) {
      const message =
        deleteError?.response?.data?.message ||
        deleteError?.response?.data?.mensaje ||
        deleteError?.message ||
        "No fue posible eliminar la mascota.";

      setActionError(message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-container mis-mascotas-page">
      <div className="mis-mascotas-header">
        <div>
          <h1>Mis Mascotas</h1>
          <p className="section-eyebrow">Tus mascotas registradas</p>
        </div>
      </div>

      {loading ? (
        <div className="state-card state-card-loading" role="status" aria-live="polite">
          Cargando mascotas...
        </div>
      ) : !tieneMascotas ? (
        <>
          {actionError ? (
            <div className="state-card state-card-error" role="alert">
              {actionError}
            </div>
          ) : null}
          {feedbackMessage ? (
            <div className="state-card state-card-success" role="status" aria-live="polite">
              {feedbackMessage}
            </div>
          ) : null}
          {error ? (
            <div className="state-card state-card-error" role="alert">
              {error}
            </div>
          ) : (
            <div className="state-card state-card-empty" role="status" aria-live="polite">
              No tienes mascotas registradas todavía.
            </div>
          )}
        </>
      ) : (
        <>
          {actionError ? (
            <div className="state-card state-card-error" role="alert">
              {actionError}
            </div>
          ) : null}
          {feedbackMessage ? (
            <div className="state-card state-card-success" role="status" aria-live="polite">
              {feedbackMessage}
            </div>
          ) : null}
          {error ? (
            <div className="state-card state-card-error" role="alert">
              {error}
            </div>
          ) : (
            <section className="mascotas-grid" aria-label="Listado de mascotas">
              {mascotas.map((mascota) => {
                const fotoSrc = mascota.fotoBase64
                  ? `data:image/jpeg;base64,${mascota.fotoBase64}`
                  : null;

                return (
                  <article className="mascota-card" key={mascota.id ?? `${mascota.nombre}-${mascota.fechaReporte}`}>
                    <div className="mascota-card-menu-wrap">
                      <button
                        type="button"
                        className="mascota-menu-trigger"
                        aria-label={`Acciones para ${mascota.nombre}`}
                        aria-expanded={openMenuId === mascota.id}
                        onClick={() =>
                          setOpenMenuId((currentMenuId) =>
                            currentMenuId === mascota.id ? null : mascota.id
                          )
                        }
                      >
                        ⋮
                      </button>

                      {openMenuId === mascota.id ? (
                        <div className="mascota-card-menu" role="menu">
                          <button
                            type="button"
                            className="mascota-card-menu-item"
                            onClick={() => handleOpenEdit(mascota)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="mascota-card-menu-item mascota-card-menu-item-danger"
                            onClick={() => {
                              setOpenMenuId(null);
                              setDeleteTarget(mascota);
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="mascota-photo-wrap">
                      {fotoSrc ? (
                        <img
                          className="mascota-photo"
                          src={fotoSrc}
                          alt={`Foto de ${mascota.nombre}`}
                        />
                      ) : (
                        <div className="mascota-photo mascota-photo-placeholder" aria-hidden="true">
                          Sin foto
                        </div>
                      )}
                    </div>

                    <div className="mascota-card-body">
                      <div className="mascota-card-title-row">
                        <h2>{mascota.nombre}</h2>
                        <span className="mascota-status">{getEstadoLabel(mascota.estado)}</span>
                      </div>

                      <dl className="mascota-details">
                        <div>
                          <dt>Raza</dt>
                          <dd>{mascota.raza || "No informada"}</dd>
                        </div>
                        <div>
                          <dt>Color</dt>
                          <dd>{mascota.color || "No informado"}</dd>
                        </div>
                        <div>
                          <dt>Edad</dt>
                          <dd>{mascota.edad != null ? `${mascota.edad} años` : "No informada"}</dd>
                        </div>
                        <div>
                          <dt>Tipo</dt>
                          <dd>{mascota.tipo || "No informado"}</dd>
                        </div>
                        <div>
                          <dt>Dimensión</dt>
                          <dd>{getDimensionLabel(mascota.dimension)}</dd>
                        </div>
                        <div>
                          <dt>Fecha reporte</dt>
                          <dd>{formatFechaReporte(mascota.fechaReporte)}</dd>
                        </div>
                      </dl>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}

      {canShowEditModal ? (
        <div className="detail-modal-overlay" role="presentation">
          <div className="detail-modal mis-mascotas-modal" role="dialog" aria-modal="true" aria-labelledby="edit-mascota-title">
            <div className="detail-modal-header">
              <h2 id="edit-mascota-title">Editar mascota</h2>
              <button type="button" className="detail-modal-close" onClick={handleCloseEdit}>
                ×
              </button>
            </div>

            <form className="detail-modal-form" onSubmit={handleSubmitEdit}>
              <div className="mis-mascotas-edit-grid">
                <label className="detail-modal-field">
                  <span>Nombre</span>
                  <input
                    type="text"
                    name="nombre"
                    value={editFormData.nombre}
                    onChange={handleEditChange}
                  />
                </label>

                <label className="detail-modal-field">
                  <span>Tipo</span>
                  <input
                    type="text"
                    name="tipo"
                    value={editFormData.tipo}
                    onChange={handleEditChange}
                  />
                </label>

                <label className="detail-modal-field">
                  <span>Raza</span>
                  <input
                    type="text"
                    name="raza"
                    value={editFormData.raza}
                    onChange={handleEditChange}
                  />
                </label>

                <label className="detail-modal-field">
                  <span>Color</span>
                  <input
                    type="text"
                    name="color"
                    value={editFormData.color}
                    onChange={handleEditChange}
                  />
                </label>

                <label className="detail-modal-field">
                  <span>Edad</span>
                  <input
                    type="number"
                    name="edad"
                    min="0"
                    value={editFormData.edad}
                    onChange={handleEditChange}
                  />
                </label>

                <label className="detail-modal-field">
                  <span>Dimensión</span>
                  <select
                    name="dimension"
                    value={editFormData.dimension}
                    onChange={handleEditChange}
                  >
                    {DIMENSION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="detail-modal-field">
                  <span>Estado</span>
                  <select name="estado" value={editFormData.estado} onChange={handleEditChange}>
                    {ESTADO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="detail-modal-field">
                  <span>Fotografía</span>
                  <input type="file" accept="image/*" onChange={handleEditImageChange} />
                </label>
              </div>

              <div className="mis-mascotas-edit-preview">
                {editPreviewImage ? (
                  <img src={editPreviewImage} alt={`Vista previa de ${editFormData.nombre}`} />
                ) : (
                  <div className="mis-mascotas-edit-preview-placeholder">Sin foto</div>
                )}
              </div>

              <div className="detail-modal-actions">
                <button type="button" className="detail-modal-cancel" onClick={handleCloseEdit}>
                  Cancelar
                </button>
                <button type="submit" className="detail-modal-submit" disabled={actionLoading}>
                  {actionLoading ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="detail-modal-overlay" role="presentation">
          <div className="detail-modal mis-mascotas-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-mascota-title">
            <div className="detail-modal-header">
              <h2 id="delete-mascota-title">Eliminar mascota</h2>
              <button
                type="button"
                className="detail-modal-close"
                onClick={() => setDeleteTarget(null)}
              >
                ×
              </button>
            </div>

            <div className="mis-mascotas-confirm-body">
              <p>{deleteConfirmationText}</p>
              <strong>{deleteTarget.nombre}</strong>
            </div>

            <div className="detail-modal-actions mis-mascotas-confirm-actions">
              <button
                type="button"
                className="detail-modal-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="detail-modal-submit mis-mascotas-delete-button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MisMascotas;
