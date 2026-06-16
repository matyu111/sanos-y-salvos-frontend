function MascotaCard({ mascota, isSelected, onSelect }) {
  const fotoSrc = mascota.fotoBase64
    ? `data:image/jpeg;base64,${mascota.fotoBase64}`
    : null;
  const statusClass =
    mascota.estado === "ENCONTRADA" ? "inicio-card-badge-found" : "inicio-card-badge-lost";

  return (
    <button
      type="button"
      className={`inicio-card ${isSelected ? "inicio-card-selected" : ""}`}
      onClick={() => onSelect(mascota)}
      aria-pressed={isSelected}
    >
      <div className="inicio-card-image-wrap">
        {fotoSrc ? (
          <img className="inicio-card-image" src={fotoSrc} alt={`Foto de ${mascota.nombre}`} />
        ) : (
          <div className="inicio-card-image inicio-card-image-placeholder" aria-hidden="true">
            Sin foto
          </div>
        )}
      </div>

      <div className="inicio-card-content">
        <div className="inicio-card-header">
          <h3>{mascota.nombre}</h3>
        </div>

        <p className="inicio-card-meta">{mascota.raza || "Raza no informada"}</p>

        <div className="inicio-card-tags">
          {mascota.tipo ? <span className="inicio-card-tag">{mascota.tipo}</span> : null}
          {mascota.color ? <span className="inicio-card-tag">{mascota.color}</span> : null}
          {mascota.dimension ? <span className="inicio-card-tag">{mascota.dimension}</span> : null}
        </div>

        <div className="inicio-card-status-row">
          <span className={`inicio-card-badge ${statusClass}`}>{mascota.estado}</span>
        </div>
      </div>
    </button>
  );
}

export default MascotaCard;
