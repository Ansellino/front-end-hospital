// components/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Sidebar: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Healthcare System</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </li>
          {hasPermission("view:patients") && (
            <li>
              <NavLink to="/patients">Patients</NavLink>
            </li>
          )}
          {/* Other navigation items */}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
