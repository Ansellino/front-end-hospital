import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Import icons
import {
  Dashboard as DashboardIcon,
  People as PatientsIcon,
  EventNote as AppointmentsIcon,
  Badge as StaffIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocalHospital as HospitalIcon,
} from "@mui/icons-material";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { currentUser, hasPermission } = useAuth();

  return (
    <aside
      className={`h-screen bg-white shadow-lg flex flex-col fixed left-0 top-0 bottom-0 transition-all duration-300 z-10 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header with logo and toggle button */}
      <div className="border-b border-gray-200 flex items-center h-16">
        {!collapsed && (
          <div className="flex items-center px-5 h-full">
            <HospitalIcon className="text-primary-500 mr-2" />
            <h2 className="text-xl font-semibold text-primary-600 truncate">
              HealthcareMS
            </h2>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-2 rounded-full hover:bg-gray-100 text-gray-500 flex items-center justify-center ${
            collapsed ? "mx-auto" : "ml-auto mr-2"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      {/* Navigation menu */}
      <nav className="flex-grow py-5 px-2 overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `sidebar-item ${
                  isActive ? "sidebar-item-active" : "sidebar-item-inactive"
                } ${collapsed ? "justify-center" : ""}`
              }
              title="Dashboard"
            >
              <DashboardIcon
                className={collapsed ? "" : "mr-3"}
                fontSize="small"
              />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>

          {hasPermission("view:patients") && (
            <li>
              <NavLink
                to="/patients"
                className={({ isActive }) =>
                  `sidebar-item ${
                    isActive ? "sidebar-item-active" : "sidebar-item-inactive"
                  } ${collapsed ? "justify-center" : ""}`
                }
                title="Patients"
              >
                <PatientsIcon
                  className={collapsed ? "" : "mr-3"}
                  fontSize="small"
                />
                {!collapsed && <span>Patients</span>}
              </NavLink>
            </li>
          )}

          {hasPermission("view:appointments") && (
            <li>
              <NavLink
                to="/appointments"
                className={({ isActive }) =>
                  `sidebar-item ${
                    isActive ? "sidebar-item-active" : "sidebar-item-inactive"
                  } ${collapsed ? "justify-center" : ""}`
                }
                title="Appointments"
              >
                <AppointmentsIcon
                  className={collapsed ? "" : "mr-3"}
                  fontSize="small"
                />
                {!collapsed && <span>Appointments</span>}
              </NavLink>
            </li>
          )}

          {hasPermission("view:staff") && (
            <li>
              <NavLink
                to="/staff"
                className={({ isActive }) =>
                  `sidebar-item ${
                    isActive ? "sidebar-item-active" : "sidebar-item-inactive"
                  } ${collapsed ? "justify-center" : ""}`
                }
                title="Staff"
              >
                <StaffIcon
                  className={collapsed ? "" : "mr-3"}
                  fontSize="small"
                />
                {!collapsed && <span>Staff</span>}
              </NavLink>
            </li>
          )}

          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `sidebar-item ${
                  isActive ? "sidebar-item-active" : "sidebar-item-inactive"
                } ${collapsed ? "justify-center" : ""}`
              }
              title="Settings"
            >
              <SettingsIcon
                className={collapsed ? "" : "mr-3"}
                fontSize="small"
              />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* User profile section */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
              {currentUser?.email?.[0].toUpperCase() || "U"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                {currentUser?.email || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {currentUser?.role || "User"}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
