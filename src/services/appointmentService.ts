import api from "./api";
import { Appointment } from "../interfaces/appointment";

/**
 * Service for handling appointment-related API operations
 */
const AppointmentService = {
  /**
   * Get all appointments with optional filtering
   */
  getAppointments: async (params?: any) => {
    try {
      const response = await api.get("/appointments", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },

  /**
   * Get a single appointment by ID
   */
  getAppointment: async (id: string) => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new appointment
   */
  createAppointment: async (
    data: Omit<Appointment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await api.post("/appointments", data);
      return response.data;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  /**
   * Update an existing appointment
   */
  updateAppointment: async (
    id: string,
    data: Omit<Appointment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await api.put(`/appointments/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an appointment
   */
  deleteAppointment: async (id: string) => {
    try {
      const response = await api.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting appointment ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all patients (for appointment selection)
   */
  getPatients: async () => {
    try {
      const response = await api.get("/patients");
      return response.data;
    } catch (error) {
      console.error("Error fetching patients:", error);
      // Return fallback mock data for demo purposes
      return [
        { id: "p-001", firstName: "John", lastName: "Doe" },
        { id: "p-002", firstName: "Jane", lastName: "Smith" },
        { id: "p-003", firstName: "Robert", lastName: "Johnson" },
      ];
    }
  },

  /**
   * Get all doctors (for appointment selection)
   */
  getDoctors: async () => {
    try {
      const response = await api.get("/staff", { params: { role: "doctor" } });
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      // Return fallback mock data for demo purposes
      return [
        { id: "d-001", firstName: "Sarah", lastName: "Johnson" },
        { id: "d-002", firstName: "Michael", lastName: "Chen" },
        { id: "d-003", firstName: "Emily", lastName: "Rodriguez" },
      ];
    }
  },
};

export default AppointmentService;
