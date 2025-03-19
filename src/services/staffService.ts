import api from "./api";
import { Staff, WorkSchedule } from "../interfaces/staff";

/**
 * Get all staff members with optional filtering parameters
 */
export const getAllStaff = async (params?: any) => {
  try {
    const response = await api.get("/staff", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    // Return mock data if API fails
    return generateMockStaff();
  }
};

/**
 * Get a staff member by ID
 */
export const getStaffById = async (id: string) => {
  try {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching staff with id ${id}:`, error);
    // Return first mock data item or generate one with this id
    const mockStaff = generateMockStaff();
    return mockStaff.find((staff) => staff.id === id) || mockStaff[0];
  }
};

/**
 * Create a new staff member
 */
export const createStaff = async (
  data: Omit<Staff, "id" | "createdAt" | "updatedAt">
) => {
  const response = await api.post("/staff", data);
  return response.data;
};

/**
 * Update an existing staff member
 */
export const updateStaff = async (id: string, data: Partial<Staff>) => {
  const response = await api.put(`/staff/${id}`, data);
  return response.data;
};

/**
 * Delete a staff member
 */
export const deleteStaff = async (id: string) => {
  const response = await api.delete(`/staff/${id}`);
  return response.data;
};

/**
 * Get staff members by role (e.g., doctors, nurses)
 */
export const getStaffByRole = async (role: string) => {
  try {
    const response = await api.get("/staff", { params: { role } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching staff with role ${role}:`, error);
    return generateMockStaff().filter(
      (staff) => staff.role === (role as Staff["role"])
    );
  }
};

/**
 * Get staff members by department
 */
export const getStaffByDepartment = async (department: string) => {
  try {
    const response = await api.get("/staff", { params: { department } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching staff in department ${department}:`, error);
    return generateMockStaff().filter(
      (staff) => staff.department === department
    );
  }
};

/**
 * For development/demo environments - create mock staff data when API is not available
 */
export const generateMockStaff = (): Staff[] => {
  // Define arrays with explicit type annotations
  const roles: Staff["role"][] = [
    "doctor",
    "nurse",
    "admin",
    "receptionist",
    "pharmacist",
  ];

  const departments = [
    "Cardiology",
    "Dermatology",
    "Emergency",
    "General Medicine",
    "Neurology",
    "Obstetrics",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Administration",
  ];

  const statuses: Staff["status"][] = ["active", "inactive", "on-leave"];

  // Generate 20 mock staff members
  return Array.from({ length: 20 }, (_, i): Staff => {
    // Add explicit return type annotation here
    const id = `staff-${i + 1}`;
    const roleIndex = Math.floor(Math.random() * roles.length);
    // Type assertion to help TypeScript understand this will be a valid role
    const role = roles[roleIndex] as Staff["role"];

    const department =
      departments[Math.floor(Math.random() * departments.length)];

    // Calculate a random join date within the past 5 years
    const joinDate = new Date(
      Date.now() - Math.floor(Math.random() * 5 * 365 * 24 * 60 * 60 * 1000)
    );

    // Get a valid status with type assertion
    const statusIndex = Math.floor(Math.random() * statuses.length);
    const status = statuses[statusIndex] as Staff["status"];

    return {
      id,
      firstName: `First${i + 1}`,
      lastName: `Last${i + 1}`,
      email: `staff${i + 1}@healthcare.com`,
      contactNumber: `+1-555-${100 + i}`,
      role,
      specialization:
        role === "doctor" || role === "nurse" ? `Specialty${i % 5}` : undefined,
      department,
      joinDate: joinDate.toISOString().split("T")[0],
      workSchedule: generateMockSchedule(),
      qualifications: generateMockQualifications(), // This is calling a function that isn't defined
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
};

// Helper function to generate mock work schedules
const generateMockSchedule = () => {
  // Initialize with proper type annotation
  const days: Array<WorkSchedule["day"]> = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];
  const schedules: WorkSchedule[] = [];

  // Generate 3-5 work days
  const numDays = 3 + Math.floor(Math.random() * 3);
  const selectedDays = [...days]
    .sort(() => 0.5 - Math.random())
    .slice(0, numDays);

  for (const day of selectedDays) {
    schedules.push({
      day,
      startTime: "09:00",
      endTime: "17:00",
    });
  }

  // Ensure we always return at least one schedule if none were created
  if (schedules.length === 0) {
    schedules.push({
      day: "monday",
      startTime: "09:00",
      endTime: "17:00",
    });
  }

  return schedules;
};

// Helper function to generate mock qualifications
const generateMockQualifications = () => {
  const qualifications = [];
  const numQualifications = 1 + Math.floor(Math.random() * 3);

  for (let i = 0; i < numQualifications; i++) {
    qualifications.push({
      degree: ["MD", "PhD", "BSN", "MS", "MBA"][Math.floor(Math.random() * 5)],
      institution: [
        "University Medical School",
        "State College",
        "Medical Institute",
      ][Math.floor(Math.random() * 3)],
      year: `${2000 + Math.floor(Math.random() * 22)}`,
      certification: Math.random() > 0.5 ? "Board Certified" : "",
    });
  }

  return qualifications;
};
