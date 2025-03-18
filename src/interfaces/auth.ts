
// interfaces/auth.ts
export interface User {
  id: string;
  email: string;
  role: "doctor" | "nurse" | "admin" | "receptionist";
  permissions: string[];
  staffId?: string;
}

