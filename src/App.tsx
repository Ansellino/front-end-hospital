import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";

// Layout
import MainLayout from "./layouts/MainLayout";

// Auth
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

// Pages
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/patients/PatientList";
import PatientDetail from "./pages/patients/PatientDetail";
import PatientForm from "./pages/patients/PatientForm";
import AppointmentCalendar from "./pages/appointments/appointmentCalendars";
import AppointmentForm from "./pages/appointments/AppointmentForm";
import StaffList from "./pages/staff/StaffList";
import StaffDetail from "./pages/staff/StaffDetail";
import StaffForm from "./pages/staff/StaffForm";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BillingPage from "./pages/billing/BillingPages";
import InvoiceForm from "./pages/billing/InvoiceForm";
import InvoiceDetail from "./pages/billing/InvoiceDetail"; // Add this line
import NotificationsPage from "./pages/notifications/NotificationsPage"; // Add this import at the top

// Theme
import theme from "./theme";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Patient routes */}
                <Route
                  path="/patients"
                  element={
                    <ProtectedRoute requiredPermission="view:patients">
                      <PatientList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patients/add"
                  element={
                    <ProtectedRoute requiredPermission="create:patients">
                      <PatientForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patients/:id"
                  element={
                    <ProtectedRoute requiredPermission="view:patients">
                      <PatientDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patients/:id/edit"
                  element={
                    <ProtectedRoute requiredPermission="edit:patients">
                      <PatientForm />
                    </ProtectedRoute>
                  }
                />
                {/* Appointment routes */}
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute requiredPermission="view:appointments">
                      <AppointmentCalendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments/new"
                  element={
                    <ProtectedRoute requiredPermission="create:appointments">
                      <AppointmentForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments/:id/edit"
                  element={
                    <ProtectedRoute requiredPermission="edit:appointments">
                      <AppointmentForm />
                    </ProtectedRoute>
                  }
                />
                {/* Staff routes */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute requiredPermission="view:staff">
                      <StaffList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/new"
                  element={
                    <ProtectedRoute requiredPermission="create:staff">
                      <StaffForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/:id"
                  element={
                    <ProtectedRoute requiredPermission="view:staff">
                      <StaffDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/:id/edit"
                  element={
                    <ProtectedRoute requiredPermission="edit:staff">
                      <StaffForm />
                    </ProtectedRoute>
                  }
                />
                {/* Billing routes */}
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/billing/new-invoice" element={<InvoiceForm />} />
                <Route path="/billing/:id" element={<InvoiceDetail />} />{" "}
                {/* Add this line */}
                {/* Notifications route - FIXED */}
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                {/* Settings route */}
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
