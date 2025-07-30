// src/layouts/DashboardLayout.jsx

import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  return (
    <div className="grid grid-cols-[16rem_1fr] grid-rows-[auto_1fr] min-h-screen bg-gray-100">
      
      {/* Top Navbar (full width) */}
      <header className="col-span-2 bg-white shadow z-10">
        <Navbar />
      </header>

      {/* Sidebar (left) */}
      <aside className="bg-white shadow h-full">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <main className="p-6 h-full overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
