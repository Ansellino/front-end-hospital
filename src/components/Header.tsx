import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Import icons
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex items-center h-16 px-4 bg-white border-b border-gray-200">
      {/* Right section */}
      <div className="flex items-center ml-auto space-x-1">
        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 text-gray-600 rounded-full hover:bg-gray-100"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <NotificationsIcon />
            <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
              3
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 z-20 mt-2 overflow-hidden bg-white rounded-md shadow-lg w-80">
              <div className="flex items-center justify-between px-4 py-3 font-medium text-gray-700 border-b border-gray-200">
                <span>Notifications</span>
                <span className="text-xs cursor-pointer text-primary-600">
                  Mark all as read
                </span>
              </div>
              <div className="overflow-y-auto max-h-72">
                <div className="px-4 py-3 transition-colors border-b border-gray-100 cursor-pointer hover:bg-gray-50">
                  <p className="text-sm text-gray-800">
                    New appointment scheduled for today
                  </p>
                  <p className="mt-1 text-xs text-gray-500">10 minutes ago</p>
                </div>
                <div className="px-4 py-3 transition-colors border-b border-gray-100 cursor-pointer hover:bg-gray-50">
                  <p className="text-sm text-gray-800">
                    Dr. Smith requested patient records
                  </p>
                  <p className="mt-1 text-xs text-gray-500">1 hour ago</p>
                </div>
                <div className="px-4 py-3 transition-colors border-b border-gray-100 cursor-pointer hover:bg-gray-50">
                  <p className="text-sm text-gray-800">
                    System update scheduled for tomorrow
                  </p>
                  <p className="mt-1 text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              <div className="px-4 py-2 text-center">
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="relative">
          <button
            className="flex items-center p-2 space-x-1 text-gray-700 rounded-full hover:bg-gray-100"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="flex items-center justify-center w-8 h-8 text-white rounded-full bg-primary-500">
              {currentUser?.email?.[0].toUpperCase() || "U"}
            </div>
            <span className="hidden text-sm font-medium md:block">
              {currentUser?.firstName || "User"}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 z-20 w-48 mt-2 overflow-hidden bg-white rounded-md shadow-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.email}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                  <AccountCircle className="w-4 h-4 mr-2" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                  <LogoutIcon className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
