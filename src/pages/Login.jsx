import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUsuario } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const data = await loginUsuario({ email, password });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("No se pudo iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit">Iniciar sesión</button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}

export default Login;