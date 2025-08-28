import { Outlet } from "react-router-dom";
import { useState } from "react";
import FOSidebar from "../components/FOSidebar";
import Navigation from "../components/Navigation";
import { LAYOUT } from "../constants";
import { Menu, X } from "lucide-react";

export default function FODashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Navbar */}
      <header
        className="fixed top-0 left-0 right-0 bg-white shadow-sm z-20 flex items-center border-b border-slate-200"
        style={{ height: LAYOUT.NAVBAR_HEIGHT }}
      >
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 ml-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div className="flex-1">
          <Navigation type="dashboard" />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 bg-slate-900 shadow-lg z-40 lg:z-10 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:block`}
        style={{
          top: LAYOUT.NAVBAR_HEIGHT,
          width: LAYOUT.SIDEBAR_WIDTH,
          height: `calc(100vh - ${LAYOUT.NAVBAR_HEIGHT}px)`,
        }}
      >
        <FOSidebar />
      </aside>

      {/* Main Content Area */}
      <main
        className="p-4 lg:p-6 transition-all duration-300 lg:ml-64"
        style={{
          marginTop: LAYOUT.NAVBAR_HEIGHT,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
