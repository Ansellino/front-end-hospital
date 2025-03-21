// layouts/MainLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div
        className={`flex flex-col flex-grow transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <Header onMenuClick={toggleSidebar} />

        <main className="flex-grow p-6 overflow-auto">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>

        <footer className="px-6 py-4 text-sm text-center text-gray-500 border-t">
          <p>© 2025 Healthcare Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
