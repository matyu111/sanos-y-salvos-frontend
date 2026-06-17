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
import AdminLayout from "../admin/layout/AdminLayout";
import AdminUsers from "../admin/pages/AdminUsers";
import AdminMascotas from "../admin/pages/AdminMascotas";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="mascotas" element={<AdminMascotas />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
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
