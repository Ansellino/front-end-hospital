import api from "./api";
import { formatDistanceToNow } from "date-fns";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "appointment" | "system" | "patient" | "billing" | "staff";
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  actionUrl?: string;
}

/**
 * Service for handling notification-related operations
 */
const NotificationService = {
  /**
   * Get all notifications
   */
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get("/notifications");
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Fallback to mock data for development
      return generateMockNotifications(30);
    }
  },

  /**
   * Get recent unread notifications (for header/dropdown)
   */
  getRecentNotifications: async (
    limit: number = 5
  ): Promise<Notification[]> => {
    try {
      const response = await api.get(`/notifications/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching recent notifications:", error);
      // Return subset of mock data
      return generateMockNotifications(limit);
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: string): Promise<void> => {
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      await api.put("/notifications/mark-all-read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    try {
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
    }
  },

  /**
   * Get total count of unread notifications
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get("/notifications/unread/count");
      return response.data.count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      // Return exactly 5 for the mockup
      return 5;
    }
  },
};

/**
 * Generate mock notifications for development/demo
 * Modified to have exactly 5 unread notifications
 */
export const generateMockNotifications = (count: number): Notification[] => {
  const types: ("appointment" | "system" | "patient" | "billing" | "staff")[] =
    ["appointment", "system", "patient", "billing", "staff"];

  const mockData: Notification[] = [];

  // Generate specifically 5 unread notifications first
  for (let i = 0; i < 5; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const isRead = false; // Make sure these are unread

    // Create dates for proper sorting - newer dates for unread notifications
    const hoursAgo = Math.floor(Math.random() * 24);
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);

    let title = "";
    let message = "";
    let relatedId = "";
    let actionUrl = "";

    switch (type) {
      case "appointment":
        title = "Appointment Reminder";
        message = `You have an appointment scheduled today at ${new Date().getHours()}:00`;
        relatedId = `appt-${1000 + i}`;
        actionUrl = `/appointments/${relatedId}`;
        break;
      case "system":
        title = "System Update";
        message = "System maintenance scheduled for this weekend";
        break;
      case "patient":
        title = "New Patient Record";
        message = "A new patient has been registered in the system";
        relatedId = `p-${1000 + i}`;
        actionUrl = `/patients/${relatedId}`;
        break;
      case "billing":
        title = "Invoice Generated";
        message = "A new invoice has been generated for patient";
        relatedId = `inv-${1000 + i}`;
        actionUrl = `/billing/${relatedId}`;
        break;
      case "staff":
        title = "Staff Update";
        message = "Dr. Johnson has updated their availability";
        relatedId = `s-${1000 + i}`;
        actionUrl = `/staff/${relatedId}`;
        break;
    }

    mockData.push({
      id: `notif-unread-${i}`,
      title,
      message,
      type,
      isRead,
      createdAt: date.toISOString(),
      relatedId,
      actionUrl,
    });
  }

  // Then generate the rest as read notifications
  for (let i = 5; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const isRead = true; // These are all read

    // Older dates for read notifications
    const daysAgo = Math.floor(Math.random() * 7) + 1;
    const hoursAgo = Math.floor(Math.random() * 24);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursAgo);

    let title = "";
    let message = "";
    let relatedId = "";
    let actionUrl = "";

    switch (type) {
      case "appointment":
        title = "Appointment Reminder";
        message = `You have an appointment scheduled ${
          daysAgo === 0 ? "today" : "tomorrow"
        }`;
        relatedId = `appt-${1000 + i}`;
        actionUrl = `/appointments/${relatedId}`;
        break;
      case "system":
        title = "System Update";
        message = "System maintenance scheduled for this weekend";
        break;
      case "patient":
        title = "New Patient Record";
        message = "A new patient has been registered in the system";
        relatedId = `p-${1000 + i}`;
        actionUrl = `/patients/${relatedId}`;
        break;
      case "billing":
        title = "Invoice Generated";
        message = "A new invoice has been generated for patient";
        relatedId = `inv-${1000 + i}`;
        actionUrl = `/billing/${relatedId}`;
        break;
      case "staff":
        title = "Staff Update";
        message = "Dr. Johnson has updated their availability";
        relatedId = `s-${1000 + i}`;
        actionUrl = `/staff/${relatedId}`;
        break;
    }

    mockData.push({
      id: `notif-${i}`,
      title,
      message,
      type,
      isRead,
      createdAt: date.toISOString(),
      relatedId,
      actionUrl,
    });
  }

  // Sort by date (newest first)
  return mockData.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export default NotificationService;
