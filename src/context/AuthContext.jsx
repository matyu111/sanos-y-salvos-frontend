import { createContext, useEffect, useMemo, useState } from "react";

const AUTH_STORAGE_KEYS = ["token", "userId", "nombre", "email", "rol"];

export const AuthContext = createContext(null);

const readStoredSession = () => {
  const token = localStorage.getItem("token");
  const storedUserId = localStorage.getItem("userId");

  if (!token) {
    return {
      token: null,
      userId: null,
      nombre: null,
      email: null,
      rol: null,
      isAuthenticated: false,
    };
  }

  return {
    token,
    userId: storedUserId ? Number(storedUserId) : null,
    nombre: localStorage.getItem("nombre"),
    email: localStorage.getItem("email"),
    rol: localStorage.getItem("rol"),
    isAuthenticated: true,
  };
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredSession);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAuth({
        token: null,
        userId: null,
        nombre: null,
        email: null,
        rol: null,
        isAuthenticated: false,
      });
      return;
    }

    setAuth({
      token,
      userId: localStorage.getItem("userId"),
      nombre: localStorage.getItem("nombre"),
      email: localStorage.getItem("email"),
      rol: localStorage.getItem("rol"),
      isAuthenticated: true,
    });
  }, []);

  const setSession = (sessionData) => {
    const nextAuth = {
      token: sessionData.token ?? null,
      userId: sessionData.userId != null ? Number(sessionData.userId) : null,
      nombre: sessionData.nombre ?? null,
      email: sessionData.email ?? null,
      rol: sessionData.rol ?? null,
      isAuthenticated: Boolean(sessionData.token),
    };

    AUTH_STORAGE_KEYS.forEach((key) => {
      const value = nextAuth[key];

      if (value === null || value === undefined) {
        localStorage.removeItem(key);
        return;
      }

      localStorage.setItem(key, String(value));
    });

    setAuth(nextAuth);
  };

  const clearSession = () => {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

    setAuth({
      token: null,
      userId: null,
      nombre: null,
      email: null,
      rol: null,
      isAuthenticated: false,
    });
  };

  const value = useMemo(
    () => ({
      token: auth.token,
      userId: auth.userId,
      nombre: auth.nombre,
      email: auth.email,
      rol: auth.rol,
      isAuthenticated: auth.isAuthenticated,
      setSession,
      clearSession,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
