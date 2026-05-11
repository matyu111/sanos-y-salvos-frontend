import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { registrarUsuario } from "../services/authService";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formulario, setFormulario] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmarPassword: "",
    rol: "USUARIO",
  });

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const validarCampo = (name, value, formularioActualizado) => {
    switch (name) {
      case "nombre":
        if (!value.trim()) return "El nombre es obligatorio.";
        if (value.trim().length < 3) return "El nombre debe tener al menos 3 caracteres.";
        return "";

      case "email":
        if (!value.trim()) return "El correo es obligatorio.";

        const dominiosPermitidos = [
          "@duocuc.cl",
          "@profesorduoc.cl",
          "@gmail.com",
          "@hotmail.com",
        ];

        const correoValido = dominiosPermitidos.some((dominio) =>
          value.toLowerCase().endsWith(dominio)
        );

        if (!correoValido) {
          return "Solo se permiten correos institucionales o autorizados.";
        }

        return "";

      case "password":
        if (!value) return "La contraseña es obligatoria.";
        if (value.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
        return "";

      case "confirmarPassword":
        if (!value) return "Confirma tu contraseña.";
        if (value !== formularioActualizado.password) return "Las contraseñas no coinciden.";
        return "";

      case "rol":
        if (!value) return "Selecciona un rol.";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    const formularioActualizado = {
      ...formulario,
      [name]: value,
    };

    const nuevosErrores = {
      ...errores,
      [name]: validarCampo(name, value, formularioActualizado),
    };

    if (name === "password" && formulario.confirmarPassword) {
      nuevosErrores.confirmarPassword = validarCampo(
        "confirmarPassword",
        formulario.confirmarPassword,
        formularioActualizado
      );
    }

    setFormulario(formularioActualizado);
    setErrores(nuevosErrores);
    setMensaje("");
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    Object.keys(formulario).forEach((campo) => {
      const error = validarCampo(campo, formulario[campo], formulario);
      if (error) nuevosErrores[campo] = error;
    });

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje("");

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);

    try {
      const datosRegistro = {
        nombre: formulario.nombre,
        email: formulario.email,
        password: formulario.password,
        rol: formulario.rol,
      };

      await registrarUsuario(datosRegistro);

      setMensaje("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setMensaje("No se pudo registrar el usuario. Revisa los datos o intenta con otro correo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-large">
        <div className="auth-header">
          <h1>Crear cuenta</h1>
          <p>Regístrate para acceder a Sanos y Salvos.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Ingresa tu nombre"
              value={formulario.nombre}
              onChange={handleChange}
            />
            {errores.nombre && <span className="input-error">{errores.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={formulario.email}
              onChange={handleChange}
            />
            {errores.email && <span className="input-error">{errores.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formulario.password}
              onChange={handleChange}
            />
            {errores.password && <span className="input-error">{errores.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmarPassword">Confirmar contraseña</label>
            <input
              id="confirmarPassword"
              name="confirmarPassword"
              type="password"
              placeholder="Repite tu contraseña"
              value={formulario.confirmarPassword}
              onChange={handleChange}
            />
            {errores.confirmarPassword && (
              <span className="input-error">{errores.confirmarPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="rol">Perfil</label>
            <select
              id="rol"
              name="rol"
              value={formulario.rol}
              onChange={handleChange}
            >
              <option value="USUARIO">Usuario</option>
              <option value="REFUGIO">Refugio</option>
              <option value="CLINICA">Clínica veterinaria</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {errores.rol && <span className="input-error">{errores.rol}</span>}
          </div>

          {mensaje && <p className="auth-message">{mensaje}</p>}

          <button className="auth-button" type="submit" disabled={cargando}>
            {cargando ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;