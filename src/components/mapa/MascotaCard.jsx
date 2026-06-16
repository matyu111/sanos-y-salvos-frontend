function MascotaCard({ mascota, isSelected, onSelect }) {
  const fotoSrc = mascota.fotoBase64
    ? `data:image/jpeg;base64,${mascota.fotoBase64}`
    : null;

  return (
    <button
      type="button"
      className={`mascota-card ${isSelected ? "mascota-card-selected" : ""}`}
      onClick={() => onSelect(mascota)}
      aria-pressed={isSelected}
    >
      <div className="mascota-card-image-wrap">
        {fotoSrc ? (
          <img className="mascota-card-image" src={fotoSrc} alt={`Foto de ${mascota.nombre}`} />
        ) : (
          <div className="mascota-card-image mascota-card-image-placeholder" aria-hidden="true">
            Sin foto
          </div>
        )}
      </div>

      <div className="mascota-card-content">
        <div className="mascota-card-header">
          <h3>{mascota.nombre}</h3>
          <span className="mascota-card-badge">{mascota.estado}</span>
        </div>

        <p className="mascota-card-meta">{mascota.raza || "Raza no informada"}</p>
      </div>
    </button>
  );
}

export default MascotaCard;