// App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/patients/PatientList";
import PatientDetail from "./pages/patients/PatientDetail";
import AppointmentCalendar from "./pages/appointments/AppointmentCalender";
// Import other pages

const App: React.FC = () => {
  return (
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/patients"
              element={
                <ProtectedRoute requiredPermission="view:patients">
                  <PatientList />
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

            {/* Other routes */}
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
