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
      className={`fixed top-0 left-0 h-full transition-all duration-300 z-20 ${
        collapsed ? "w-16" : "w-64"
      } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800`}
    >
      {/* Header with logo and toggle button */}
      <div className="flex items-center h-16 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center h-full px-5">
            <HospitalIcon className="mr-2 text-primary-500" />
            <h2 className="text-xl font-semibold truncate text-primary-600 dark:text-primary-400">
              HealthcareMS
            </h2>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center ${
            collapsed ? "mx-auto" : "ml-auto mr-2"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      {/* Navigation menu */}
      <nav className="flex-grow px-2 py-5 overflow-y-auto">
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
    </aside>
  );
};

export default Sidebar;
