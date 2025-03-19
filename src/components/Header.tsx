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
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-10">
      {/* Left section */}
      <button
        className="lg:hidden mr-4 p-2 rounded-full hover:bg-gray-100"
        onClick={onMenuClick}
        aria-label="Menu"
      >
        <MenuIcon />
      </button>

      {/* Search */}
      <div className="hidden md:flex relative max-w-md flex-grow mr-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 placeholder-gray-500"
          placeholder="Search..."
        />
      </div>

      {/* Right section */}
      <div className="flex items-center ml-auto space-x-1">
        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <NotificationsIcon />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div className="px-4 py-3 border-b border-gray-200 font-medium text-gray-700 flex justify-between items-center">
                <span>Notifications</span>
                <span className="text-primary-600 text-xs cursor-pointer">
                  Mark all as read
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-800">
                    New appointment scheduled for today
                  </p>
                  <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
                </div>
                <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-800">
                    Dr. Smith requested patient records
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
                <div className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-800">
                    System update scheduled for tomorrow
                  </p>
                  <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                </div>
              </div>
              <div className="px-4 py-2 text-center">
                <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="relative">
          <button
            className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 text-gray-700"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white">
              {currentUser?.email?.[0].toUpperCase() || "U"}
            </div>
            <span className="hidden md:block text-sm font-medium">
              {currentUser?.firstName || "User"}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20">
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
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center"
                >
                  <AccountCircle className="h-4 w-4 mr-2" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center"
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center"
                >
                  <LogoutIcon className="h-4 w-4 mr-2" />
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
