import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";
import { loginUsuario } from "../services/authService";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  if (auth.isAuthenticated) {
    return <Navigate to={auth.rol === "ADMIN" ? "/admin/dashboard" : "/inicio"} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCargando(true);

    try {
      const data = await loginUsuario({ email, password });
      auth.setSession(data);
      navigate(data?.rol === "ADMIN" ? "/admin/dashboard" : "/inicio", { replace: true });
    } catch {
      setError("No se pudo iniciar sesión. Verifica tu correo y contraseña.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <img className="auth-logo" src={logo} alt="Logo de Sanos y Salvos" />
          <h1>Sanos y Salvos</h1>
          <p>Inicia sesión para acceder a la plataforma.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <p className="auth-help-text">¿Olvidaste tu contraseña?</p>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-button" type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="auth-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
