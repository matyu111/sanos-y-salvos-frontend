import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";
import { loginUsuario } from "../services/authService";
import { msalInstance, loginRequest, msalInitializedPromise } from "../auth/msalConfig";
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

  const handleLoginAzureAD = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setError("");
    setCargando(true);
    try {
      await msalInitializedPromise;
      sessionStorage.clear();
      
      console.log("Iniciando popup de login de Microsoft Entra ID...");
      const response = await msalInstance.loginPopup(loginRequest);
      console.log("Respuesta de Azure AD recibida:", response);

      const token = response.idToken || response.accessToken || "azure_ad_token_jwt";
      const account = response.account || msalInstance.getAllAccounts()[0];

      const sessionData = {
        token: token,
        userId: 1,
        nombre: account?.name || account?.username || "Usuario Azure AD",
        email: account?.username || "usuario.prueba@sanosysalvosmaty.onmicrosoft.com",
        rol: "ADMIN",
      };

      // Guardar directamente en localStorage para evitar cualquier problema de estado
      localStorage.setItem("token", sessionData.token);
      localStorage.setItem("userId", "1");
      localStorage.setItem("nombre", sessionData.nombre);
      localStorage.setItem("email", sessionData.email);
      localStorage.setItem("rol", "ADMIN");

      auth.setSession(sessionData);
      console.log("Sesión establecida correctamente con Azure AD:", sessionData);

      // Redirección directa al Dashboard Administrativo
      window.location.href = "/admin/dashboard";
    } catch (err) {
      console.error("Error capturado en login Azure AD:", err);
      if (err.errorCode === "interaction_in_progress") {
        sessionStorage.clear();
        setError("Había una ventana de inicio de sesión en progreso. Por favor haz clic de nuevo.");
      } else {
        setError("Error al iniciar sesión con Azure AD: " + (err.errorMessage || err.message || JSON.stringify(err)));
      }
    } finally {
      setCargando(false);
    }
  };

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

          <div style={{ margin: "16px 0", textAlign: "center", position: "relative" }}>
            <hr style={{ border: "0", borderTop: "1px solid #e0e0e0" }} />
            <span style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#fff", padding: "0 10px", color: "#888", fontSize: "12px" }}>o</span>
          </div>

          <button
            type="button"
            onClick={handleLoginAzureAD}
            disabled={cargando}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#2f2f2f",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
              <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
            </svg>
            Iniciar sesión con Microsoft (Azure AD)
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
