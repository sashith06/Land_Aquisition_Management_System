// src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const NAVBAR_HEIGHT = 64; // px
const SIDEBAR_WIDTH = 256; // px

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Navbar */}
      <header
        className="fixed top-0 left-0 right-0 bg-white shadow z-20 flex items-center"
        style={{ height: NAVBAR_HEIGHT }}
      >
        <Navbar />
      </header>

      {/* Fixed Sidebar starting below Navbar */}
      <aside
        className="fixed left-0 bg-slate-900 shadow z-10"
        style={{
          top: NAVBAR_HEIGHT, // pushes it below navbar
          width: SIDEBAR_WIDTH,
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        }}
      >
        <Sidebar />
      </aside>

      {/* Scrollable Content Area */}
      <main
        className="p-6"
        style={{
          marginLeft: SIDEBAR_WIDTH,
          marginTop: NAVBAR_HEIGHT,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
