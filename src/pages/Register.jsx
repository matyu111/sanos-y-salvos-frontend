import { Navigate } from "react-router-dom";

function Register() {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <h1>Register</h1>;
}

export default Register;