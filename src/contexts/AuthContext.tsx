import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../interfaces/auth";
import * as mockAuthService from "../services/mockAuthServices";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is already logged in (on app load)
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Use mock service to validate the token and get user
          const user = await mockAuthService.getCurrentUser(token);
          if (user) {
            setCurrentUser(user);
          } else {
            // If token is invalid, remove it
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth error:", error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      // Use the mock service for login
      const { user, token } = await mockAuthService.login(email, password);

      // Store the token in localStorage
      localStorage.setItem("token", token);

      // Set the current user
      setCurrentUser(user);

      return user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    hasPermission,
  };

  if (isLoading) {
    // Return a loading indicator while checking auth status
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
