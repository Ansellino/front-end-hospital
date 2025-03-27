/**
 * Notification related interfaces for the healthcare management system
 */

// Notification type options
export type NotificationType =
  | "appointment"
  | "system"
  | "patient"
  | "billing"
  | "staff";

// Core notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  actionUrl?: string;
}

// API response interfaces
export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  meta?: {
    total: number;
    unread: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

// Notification filter options
export interface NotificationFilter {
  type?: NotificationType | "all";
  isRead?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// User notification preferences
export interface NotificationPreferences {
  // Delivery methods
  email: boolean;
  sms: boolean;
  push: boolean;

  // Notification categories
  appointmentReminders: boolean;
  patientUpdates: boolean;
  billingAlerts: boolean;
  systemUpdates: boolean;
  newFeatures: boolean;
}

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: true,
  sms: false,
  push: true,
  appointmentReminders: true,
  patientUpdates: true,
  billingAlerts: true,
  systemUpdates: true,
  newFeatures: true,
};

// Color mapping for notification types
export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  appointment: "#3f51b5", // Blue
  system: "#ff9800", // Orange
  patient: "#4caf50", // Green
  billing: "#f44336", // Red
  staff: "#9c27b0", // Purple
};

// Label mapping for notification types
export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  appointment: "Appointment",
  system: "System",
  patient: "Patient",
  billing: "Billing",
  staff: "Staff",
};

// Icon mapping for notification types
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  appointment: "EventIcon",
  system: "AnnouncementIcon",
  patient: "MedicalServicesIcon",
  billing: "ReceiptIcon",
  staff: "PersonIcon",
};
