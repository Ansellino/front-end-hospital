// layouts/MainLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const MainLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="content-wrapper">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
