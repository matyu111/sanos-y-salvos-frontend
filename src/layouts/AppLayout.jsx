import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import "../styles/layout.css";

function AppLayout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isInicioRoute = location.pathname === "/inicio";

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Navbar onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main className={`app-content ${isInicioRoute ? "app-content-wide" : ""}`}>
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
