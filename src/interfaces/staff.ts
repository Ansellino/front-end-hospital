/* 
Create staff components:

StaffDirectory - List all staff members
StaffDetail - View/edit staff information
ScheduleManager - Manage staff schedules
RolePermissionManager - Manage role-based access
*/

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  role: "doctor" | "nurse" | "admin" | "receptionist" | "pharmacist";
  specialization?: string;
  department: string;
  joinDate: string;
  workSchedule: WorkSchedule[];
  qualifications: Qualification[];
  status: "active" | "inactive" | "on-leave";
  createdAt: string;
  updatedAt: string;
}

export interface WorkSchedule {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  startTime: string;
  endTime: string;
}

export interface Qualification {
  degree: string;
  institution: string;
  year: string;
  certification: string;
}
