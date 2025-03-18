import api from "./api";
import { Patient } from "../interfaces/patient";
import { Appointment } from "../interfaces/appointment";
import { Invoice } from "../interfaces/billing";
import { Staff } from "../interfaces/staff";

// Types for dashboard data
export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingInvoices: number;
  monthlySummary: MonthlySummary[];
  recentAppointments?: Appointment[];
  staffPerformance?: StaffPerformance[];
  inventoryAlerts?: InventoryAlert[];
}

export interface MonthlySummary {
  month: string;
  appointments: number;
  newPatients: number;
  revenue: number;
}

export interface StaffPerformance {
  staffId: string;
  name: string;
  patientsServed: number;
  appointmentsCompleted: number;
}

export interface InventoryAlert {
  id: string;
  name: string;
  currentStock: number;
  reorderLevel: number;
  status: "critical" | "low" | "expiring";
}

/**
 * Get aggregate dashboard statistics
 * @returns Promise resolving to dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get("/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Fallback to mock data if API fails
    return getMockDashboardStats();
  }
};

/**
 * Get detailed patient statistics
 */
export const getPatientStats = async () => {
  const response = await api.get("/dashboard/patients");
  return response.data;
};

/**
 * Get appointment statistics for specified date range
 */
export const getAppointmentStats = async (
  startDate: string,
  endDate: string
) => {
  const response = await api.get("/dashboard/appointments", {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get revenue statistics for specified date range
 */
export const getRevenueStats = async (startDate: string, endDate: string) => {
  const response = await api.get("/dashboard/revenue", {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get recent activity for the dashboard feed
 */
export const getRecentActivity = async (limit: number = 10) => {
  const response = await api.get("/dashboard/activity", {
    params: { limit },
  });
  return response.data;
};

/**
 * Get staff performance metrics
 */
export const getStaffPerformance = async (department?: string) => {
  const response = await api.get("/dashboard/staff-performance", {
    params: { department },
  });
  return response.data;
};

/**
 * Get inventory items that need attention (low stock, expiring)
 */
export const getInventoryAlerts = async () => {
  const response = await api.get("/dashboard/inventory-alerts");
  return response.data;
};

/**
 * Get mock dashboard stats for development/fallback
 */
const getMockDashboardStats = (): DashboardStats => {
  // Generate current month for realistic mock data
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth();

  // Create 6 months of mock data
  const mockMonthlySummary: MonthlySummary[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    mockMonthlySummary.push({
      month: months[monthIndex],
      appointments: Math.floor(Math.random() * 100) + 50,
      newPatients: Math.floor(Math.random() * 30) + 5,
      revenue: (Math.random() * 50000 + 10000).toFixed(2) as unknown as number,
    });
  }

  return {
    totalPatients: 1248,
    todayAppointments: 24,
    pendingInvoices: 15,
    monthlySummary: mockMonthlySummary,
    staffPerformance: [
      {
        staffId: "s-001",
        name: "Dr. Sarah Johnson",
        patientsServed: 142,
        appointmentsCompleted: 187,
      },
      {
        staffId: "s-002",
        name: "Dr. Michael Chen",
        patientsServed: 118,
        appointmentsCompleted: 153,
      },
      {
        staffId: "s-003",
        name: "Dr. Emily Rodriguez",
        patientsServed: 96,
        appointmentsCompleted: 124,
      },
    ],
    inventoryAlerts: [
      {
        id: "med-001",
        name: "Antibiotics Pack",
        currentStock: 5,
        reorderLevel: 20,
        status: "critical",
      },
      {
        id: "med-015",
        name: "Insulin 10ml",
        currentStock: 12,
        reorderLevel: 15,
        status: "low",
      },
      {
        id: "sup-023",
        name: "Surgical Gloves",
        currentStock: 45,
        reorderLevel: 50,
        status: "low",
      },
    ],
  };
};
