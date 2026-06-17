import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import Inicio from "../pages/Inicio";
import RegistrarMascota from "../pages/RegistrarMascota";
import MisMascotas from "../pages/MisMascotas";
import Coincidencias from "../pages/Coincidencias";
import MascotaDetalle from "../pages/MascotaDetalle";
import AdminDashboard from "../admin/pages/AdminDashboard";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="inicio" element={<Inicio />} />
          <Route path="registrar-mascota" element={<RegistrarMascota />} />
          <Route path="mis-mascotas" element={<MisMascotas />} />
          <Route path="coincidencias" element={<Coincidencias />} />
          <Route path="mascota/:id" element={<MascotaDetalle />} />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;                
