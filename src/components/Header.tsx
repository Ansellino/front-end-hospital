import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import NotificationService from "../services/notificationService";

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
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Perbarui useEffect untuk memuat ulang data ketika notifikasi berubah status
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Dapatkan notifikasi terbaru (yang ditampilkan di dropdown)
        const notificationData =
          await NotificationService.getRecentNotifications(10); // Minta lebih banyak untuk memastikan kita punya cukup unread

        // Filter hanya yang unread (up to 5 dari backend mock)
        const unreadNotifications = notificationData.filter(
          (notif) => !notif.isRead
        );

        // Pastikan kita menampilkan notifikasi yang belum dibaca terlebih dahulu
        setNotifications(notificationData);

        // Dapatkan total count unread notifications dari seluruh sistem
        const totalUnread = await NotificationService.getUnreadCount();
        setTotalUnreadCount(totalUnread);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Gunakan totalUnreadCount untuk badge, bukan hanya count dari notifikasi yang diambil
  const unreadCount = totalUnreadCount;

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await NotificationService.markAllAsRead();
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setTotalUnreadCount(0); // Reset total count ke 0
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  // Handle clicking a notification
  const handleNotificationClick = (notification: HeaderNotification) => {
    // Mark as read
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Kurangi total unread count
    if (!notification.isRead) {
      setTotalUnreadCount((prev) => Math.max(0, prev - 1));
    }

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
        <div className="relative z-[999]">
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
            <>
              {/* Backdrop to ensure dropdown is visible and prevent clicks on rest of page */}
              <div
                className="fixed inset-0 bg-black bg-opacity-10 z-[9998]"
                onClick={() => setNotificationsOpen(false)}
              ></div>

              {/* Notification dropdown with improved positioning */}
              <div
                className="fixed right-4 top-16 z-[9999] overflow-hidden bg-white rounded-lg shadow-xl w-80 border border-gray-200 transform transition-all duration-200 ease-out scale-100 origin-top-right"
                style={{
                  maxHeight: "calc(100vh - 80px)",
                  animation: "dropIn 0.2s ease-out forwards",
                }}
              >
                <div className="flex items-center justify-between px-4 py-3 font-medium text-gray-700 border-b border-gray-200 bg-gray-50">
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

                {/* Rest of notification content remains the same */}
                <div className="overflow-y-auto max-h-72 scrollbar-hide">
                  {notifications.filter((notif) => !notif.isRead).length ===
                  0 ? (
                    <div className="px-4 py-6 text-center text-gray-500">
                      <p>No unread notifications</p>
                    </div>
                  ) : (
                    notifications
                      .filter((notif) => !notif.isRead)
                      .slice(0, 3) // Hanya tampilkan 3 notifikasi unread terbaru
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 transition-colors border-b border-gray-100 cursor-pointer hover:bg-gray-50 bg-blue-50"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1 mr-2">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
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
                    {totalUnreadCount > 3
                      ? `View all ${totalUnreadCount} notifications`
                      : "View all notifications"}
                  </button>
                </div>
              </div>
            </>
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
