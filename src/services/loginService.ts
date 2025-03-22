import api from "./api";
import { User } from "../interfaces/auth";
import * as mockAuthService from "./mockAuthServices";

/**
 * Service for handling authentication and login-related operations
 */
const LoginService = {
  /**
   * Authenticate user with email and password
   */
  login: async (
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> => {
    try {
      // Try to authenticate with real API
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      console.error("API login failed, using mock authentication:", error);
      // Fallback to mock authentication for development/demo
      return mockAuthService.login(email, password);
    }
  },

  /**
   * Get the current authenticated user using token
   */
  getCurrentUser: async (token: string): Promise<User | null> => {
    try {
      // Try to get user from real API
      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error(
        "API token validation failed, using mock validation:",
        error
      );
      // Fallback to mock validation for development/demo
      return mockAuthService.getCurrentUser(token);
    }
  },

  /**
   * Log out the current user
   */
  logout: async (): Promise<void> => {
    try {
      // Try to log out from real API
      await api.post("/auth/logout");
    } catch (error) {
      console.error("API logout failed:", error);
    }

    // Always clear local token
    localStorage.removeItem("token");
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<boolean> => {
    try {
      await api.post("/auth/password-reset-request", { email });
      return true;
    } catch (error) {
      console.error("Password reset request failed:", error);
      return false;
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      await api.post("/auth/password-reset", { token, newPassword });
      return true;
    } catch (error) {
      console.error("Password reset failed:", error);
      return false;
    }
  },
};

export default LoginService;
