import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";

// Import icons
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Badge as BadgeIcon,
  Receipt as BillingIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

// Define a simplified Notification interface for Header usage
interface HeaderNotification {
  id: string;
  title: string;
  message: string;
  type: "appointment" | "system" | "patient" | "billing" | "staff";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Get recent notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch notifications from your API
        // const response = await api.get('/notifications/recent');
        // setNotifications(response.data);

        // For demo purposes, we'll use mock data
        const mockNotifications = generateMockNotifications(5);
        setNotifications(mockNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mock notification generator (similar to the one in NotificationsPage)
  const generateMockNotifications = (count: number): HeaderNotification[] => {
    const types: (
      | "appointment"
      | "system"
      | "patient"
      | "billing"
      | "staff"
    )[] = ["appointment", "system", "patient", "billing", "staff"];

    const mockData: HeaderNotification[] = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const isRead = i >= 3; // First 3 notifications are unread
      const hoursAgo = Math.floor(Math.random() * 12) + 1;
      const date = new Date();
      date.setHours(date.getHours() - hoursAgo);

      let title = "";
      let message = "";
      let actionUrl = "";

      switch (type) {
        case "appointment":
          title = "Appointment Reminder";
          message = "You have an appointment scheduled tomorrow";
          actionUrl = `/appointments`;
          break;
        case "system":
          title = "System Update";
          message = "System maintenance scheduled for this weekend";
          break;
        case "patient":
          title = "New Patient Record";
          message = "A new patient has been registered in the system";
          actionUrl = `/patients/p-${1000 + i}`;
          break;
        case "billing":
          title = "Invoice Generated";
          message = "A new invoice has been generated for patient";
          actionUrl = `/billing/inv-${1000 + i}`;
          break;
        case "staff":
          title = "Staff Update";
          message = "Dr. Johnson has updated their availability";
          actionUrl = `/staff/s-${1000 + i}`;
          break;
      }

      mockData.push({
        id: `notif-${i}`,
        title,
        message,
        type,
        isRead,
        createdAt: date.toISOString(),
        actionUrl,
      });
    }

    // Sort by date (newest first)
    return mockData.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Count unread notifications
  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  // Handle marking all notifications as read
  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from closing

    // In a real app, you would call your API
    // api.put('/notifications/mark-all-read');

    // Update local state
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  // Handle clicking a notification
  const handleNotificationClick = (notification: HeaderNotification) => {
    // Mark as read
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Navigate to the relevant page if actionUrl exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }

    // Close the dropdown
    setNotificationsOpen(false);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <EventIcon className="w-4 h-4 text-blue-500" />;
      case "system":
        return <AnnouncementIcon className="w-4 h-4 text-orange-500" />;
      case "patient":
        return <MedicalServicesIcon className="w-4 h-4 text-green-500" />;
      case "billing":
        return <BillingIcon className="w-4 h-4 text-red-500" />;
      case "staff":
        return <PersonIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <NotificationsIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-10 flex items-center h-16 px-4 bg-white border-b border-gray-200">
      {/* Menu button */}
      <button
        className="p-2 mr-4 text-gray-600 rounded-full lg:hidden hover:bg-gray-100"
        onClick={onMenuClick}
        aria-label="Menu"
      >
        <MenuIcon />
      </button>

      {/* Right section */}
      <div className="flex items-center ml-auto space-x-1">
        {/* Billing Button */}
        <button
          className="p-2 text-gray-600 rounded-full hover:bg-gray-100"
          onClick={() => navigate("/billing")}
          aria-label="Billing"
        >
          <BillingIcon />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 text-gray-600 rounded-full hover:bg-gray-100"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <NotificationsIcon />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 z-20 mt-2 overflow-hidden bg-white rounded-md shadow-lg w-80">
              <div className="flex items-center justify-between px-4 py-3 font-medium text-gray-700 border-b border-gray-200">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span
                    className="text-xs cursor-pointer text-primary-600 hover:text-primary-800"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </span>
                )}
              </div>
              <div className="overflow-y-auto max-h-72">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500">
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 transition-colors border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1 mr-2">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm text-gray-800 ${
                              !notification.isRead ? "font-medium" : ""
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 text-center">
                <button
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  onClick={() => {
                    navigate("/notifications");
                    setNotificationsOpen(false);
                  }}
                >
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
                    navigate("/settings");
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
