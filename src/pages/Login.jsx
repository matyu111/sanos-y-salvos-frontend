import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { loginUsuario } from "../services/authService";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCargando(true);

    try {
      const data = await loginUsuario({ email, password });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("No se pudo iniciar sesión. Verifica tu correo y contraseña.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
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