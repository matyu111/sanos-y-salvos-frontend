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
