import { User } from "../interfaces/auth";

// Simulate delay for API calls
const simulateDelay = (ms: number = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// List of dummy users for development
const dummyUsers = [
  {
    id: "1",
    email: "admin@healthcare.com",
    password: "admin123",
    role: "admin",
    permissions: [
      "view:patients",
      "create:patients",
      "edit:patients",
      "delete:patients",
      "view:appointments",
      "create:appointments",
      "edit:appointments",
      "delete:appointments",
      "view:staff",
      "edit:staff",
      "view:billing",
    ],
    staffId: "ADMIN-001",
  },
  {
    id: "2",
    email: "doctor@healthcare.com",
    password: "doctor123",
    role: "doctor",
    permissions: [
      "view:patients",
      "edit:patients",
      "view:appointments",
      "create:appointments",
      "edit:appointments",
    ],
    staffId: "DOC-001",
  },
  {
    id: "3",
    email: "nurse@healthcare.com",
    password: "nurse123",
    role: "nurse",
    permissions: ["view:patients", "view:appointments"],
    staffId: "NURSE-001",
  },
  {
    id: "4",
    email: "reception@healthcare.com",
    password: "reception123",
    role: "receptionist",
    permissions: [
      "view:patients",
      "create:patients",
      "view:appointments",
      "create:appointments",
    ],
    staffId: "REC-001",
  },
];

/**
 * Mock login function that simulates server-side authentication
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  await simulateDelay();

  const user = dummyUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error(
      "Invalid credentials. Please check your email and password."
    );
  }

  // Create a mock JWT token
  const token = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: new Date().getTime() + 24 * 60 * 60 * 1000, // 24 hours
    })
  );

  // Return user without password and token
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword as User,
    token,
  };
};

/**
 * Mock function to get current user from token
 */
export const getCurrentUser = async (token: string): Promise<User | null> => {
  await simulateDelay();

  try {
    // Decode the token
    const decoded = JSON.parse(atob(token));

    // Check if token is expired
    if (decoded.exp < new Date().getTime()) {
      return null;
    }

    // Find the user
    const user = dummyUsers.find((u) => u.id === decoded.sub);

    if (!user) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    return null;
  }
};
