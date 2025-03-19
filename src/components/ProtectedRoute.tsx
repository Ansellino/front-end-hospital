import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Alert } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
}) => {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page and save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permissions if a specific permission is required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        You don't have permission to access this page.
      </Alert>
    );
  }

  // If authenticated and authorized, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
