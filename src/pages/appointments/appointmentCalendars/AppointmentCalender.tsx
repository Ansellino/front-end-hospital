import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import {
  format,
  startOfWeek,
  endOfWeek,
  parseISO,
  isSameDay,
  addDays,
} from "date-fns";

import { useAuth } from "../../../contexts/AuthContext";
import { Appointment } from "../../../interfaces/appointment";
import api from "../../../services/api";

// Import components
import CalendarControls from "../components/CalendarControls";
import CalendarFilters from "../components/CalendarFilters";
import MonthView from "../components/MonthView";
import WeekView from "../components/WeekView";
import DayView from "../components/DayView";
import AppointmentDetailDialog from "../components/AppointmentDetailDialog";

// Import types and constants
import { ViewMode, DayWithAppointments } from "../types";
import { statusColors, typeColors } from "../constants";

const AppointmentCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for appointments data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
  const [calendarDays, setCalendarDays] = useState<DayWithAppointments[]>([]);

  // Filter state
  const [filterDoctor, setFilterDoctor] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string }>>(
    []
  );

  // Dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      // Fetch list of doctors for filtering
      const response = await api.get("/staff", {
        params: { role: "doctor" },
      });

      setDoctors(
        response.data.map((doctor: any) => ({
          id: doctor.id,
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        }))
      );
    } catch (err) {
      console.error("Error fetching doctors:", err);
      // For demo purposes, set mock doctors
      setDoctors([
        { id: "d-001", name: "Dr. Sarah Johnson" },
        { id: "d-002", name: "Dr. Michael Chen" },
        { id: "d-003", name: "Dr. Emily Rodriguez" },
      ]);
    }
  }, []);

  // Filter appointments when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [appointments, filterDoctor, filterStatus, filterType, searchQuery]);

  // Prepare calendar days when filtered appointments or date changes
  useEffect(() => {
    prepareCalendarDays();
  }, [filteredAppointments, currentDate, viewMode]);

  // Apply filters to appointments
  const applyFilters = useCallback(() => {
    let filtered = [...appointments];

    // Apply doctor filter
    if (filterDoctor !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.doctorId === filterDoctor
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.status === filterStatus
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.type === filterType
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          appointment.title.toLowerCase().includes(query) ||
          appointment.notes.toLowerCase().includes(query)
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, filterDoctor, filterStatus, filterType, searchQuery]);

  // Prepare calendar days based on current date and view mode
  const prepareCalendarDays = useCallback(() => {
    const days: DayWithAppointments[] = [];

    if (viewMode === ViewMode.Day) {
      // Single day view
      days.push({
        date: currentDate,
        appointments: filteredAppointments.filter((appointment) =>
          isSameDay(parseISO(appointment.startTime), currentDate)
        ),
      });
    } else if (viewMode === ViewMode.Week) {
      // Week view (7 days starting from Sunday)
      const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });

      for (let i = 0; i < 7; i++) {
        const day = addDays(startDate, i);
        days.push({
          date: day,
          appointments: filteredAppointments.filter((appointment) =>
            isSameDay(parseISO(appointment.startTime), day)
          ),
        });
      }
    } else {
      // Month view (full calendar grid with days from previous/next months)
      const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const startDate = startOfWeek(firstDay, { weekStartsOn: 0 });

      // 6 rows of 7 days (42 days total) to ensure we have enough days for any month
      for (let i = 0; i < 42; i++) {
        const day = addDays(startDate, i);
        days.push({
          date: day,
          appointments: filteredAppointments.filter((appointment) =>
            isSameDay(parseISO(appointment.startTime), day)
          ),
          isCurrentMonth: day.getMonth() === currentDate.getMonth(),
        });
      }
    }

    setCalendarDays(days);
  }, [filteredAppointments, currentDate, viewMode]);

  // Event handlers
  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleCreateAppointment = () => {
    navigate("/appointments/create");
  };

  const handleEditAppointment = (id: string) => {
    navigate(`/appointments/edit/${id}`);
    handleCloseDetailDialog();
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments(appointments.filter((a) => a.id !== id));
      handleCloseDetailDialog();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError("Failed to delete appointment. Please try again.");
    }
  };

  const handleDoctorFilterChange = (event: SelectChangeEvent) => {
    setFilterDoctor(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value);
  };

  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setFilterType(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Generate mock appointments for development/demo
  const generateMockAppointments = useCallback((): Appointment[] => {
    const mockAppointments: Appointment[] = [];
    const doctorIds = ["d-001", "d-002", "d-003"];
    const patientIds = ["p-001", "p-002", "p-003", "p-004", "p-005"];
    const statuses: ("scheduled" | "completed" | "canceled" | "no-show")[] = [
      "scheduled",
      "completed",
      "canceled",
      "no-show",
    ];
    const types: ("follow-up" | "new-patient" | "emergency" | "routine")[] = [
      "follow-up",
      "new-patient",
      "emergency",
      "routine",
    ];
    const appointmentTitles = [
      "Annual Check-up",
      "Prescription Refill",
      "Blood Test",
      "Vaccination",
      "Consultation",
      "Follow-up Visit",
      "Physical Examination",
    ];

    // Current date settings based on view mode
    let startDate, endDate;

    if (viewMode === ViewMode.Day) {
      startDate = new Date(currentDate);
      endDate = new Date(currentDate);
    } else if (viewMode === ViewMode.Week) {
      startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
    } else {
      const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      startDate = startOfWeek(firstDay, { weekStartsOn: 0 });
      endDate = endOfWeek(lastDay, { weekStartsOn: 0 });
    }

    // Generate random appointments
    const numAppointments =
      viewMode === ViewMode.Day ? 5 : viewMode === ViewMode.Week ? 20 : 35;

    for (let i = 0; i < numAppointments; i++) {
      // Random day between start and end dates
      const dayDiff = Math.floor(
        (Math.random() * (endDate.getTime() - startDate.getTime())) /
          (1000 * 60 * 60 * 24)
      );
      const appointmentDate = new Date(startDate);
      appointmentDate.setDate(appointmentDate.getDate() + dayDiff);

      // Random hour between 8am and 6pm
      const hour = 8 + Math.floor(Math.random() * 10);
      const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
      appointmentDate.setHours(hour, minute, 0, 0);

      // End time (30min to 1hr later)
      const endTime = new Date(appointmentDate);
      endTime.setMinutes(
        endTime.getMinutes() + (Math.random() > 0.5 ? 30 : 60)
      );

      mockAppointments.push({
        id: `app-${i}`,
        patientId: patientIds[Math.floor(Math.random() * patientIds.length)],
        doctorId: doctorIds[Math.floor(Math.random() * doctorIds.length)],
        title:
          appointmentTitles[
            Math.floor(Math.random() * appointmentTitles.length)
          ],
        startTime: appointmentDate.toISOString(),
        endTime: endTime.toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        type: types[Math.floor(Math.random() * types.length)],
        notes: "This is a mock appointment for demonstration purposes.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return mockAppointments;
  }, [currentDate, viewMode]); // Add dependencies here

  // Memoize fetch functions to prevent infinite loops
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);

      // Get date range based on view mode
      let startDate, endDate;

      if (viewMode === ViewMode.Day) {
        startDate = format(currentDate, "yyyy-MM-dd");
        endDate = format(currentDate, "yyyy-MM-dd");
      } else if (viewMode === ViewMode.Week) {
        startDate = format(
          startOfWeek(currentDate, { weekStartsOn: 0 }),
          "yyyy-MM-dd"
        );
        endDate = format(
          endOfWeek(currentDate, { weekStartsOn: 0 }),
          "yyyy-MM-dd"
        );
      } else {
        // Month view (we'll get a bit more data to show the full calendar grid)
        const firstDay = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const lastDay = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        // Get the first day of the week that contains the first day of the month
        startDate = format(
          startOfWeek(firstDay, { weekStartsOn: 0 }),
          "yyyy-MM-dd"
        );
        // Get the last day of the week that contains the last day of the month
        endDate = format(endOfWeek(lastDay, { weekStartsOn: 0 }), "yyyy-MM-dd");
      }

      try {
        const response = await api.get("/appointments", {
          params: { startDate, endDate },
        });

        setAppointments(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again.");
        // For demo purposes, let's generate some mock data
        setAppointments(generateMockAppointments());
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error in appointment fetching process:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }, [currentDate, viewMode, generateMockAppointments]); // Add generateMockAppointments here

  // Fetch appointments when date or view mode changes
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [currentDate, viewMode, fetchAppointments, fetchDoctors]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Appointment Calendar
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Calendar controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <CalendarControls
          currentDate={currentDate}
          viewMode={viewMode}
          onDateChange={handleDateChange}
          onViewModeChange={handleViewModeChange}
        />

        <CalendarFilters
          doctors={doctors}
          filterDoctor={filterDoctor}
          filterStatus={filterStatus}
          filterType={filterType}
          searchQuery={searchQuery}
          onDoctorFilterChange={handleDoctorFilterChange}
          onStatusFilterChange={handleStatusFilterChange}
          onTypeFilterChange={handleTypeFilterChange}
          onSearchChange={handleSearchChange}
        />
      </Paper>

      {/* Add appointment button */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        {hasPermission("create:appointments") && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateAppointment}
          >
            New Appointment
          </Button>
        )}
      </Box>

      {/* Calendar content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {viewMode === ViewMode.Month ? (
            <MonthView
              days={calendarDays}
              onDayClick={(date) => {
                setCurrentDate(date);
                setViewMode(ViewMode.Day);
              }}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : viewMode === ViewMode.Week ? (
            <WeekView
              days={calendarDays}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : (
            <DayView
              day={calendarDays[0]}
              onAppointmentClick={handleAppointmentClick}
              onCreateAppointment={handleCreateAppointment}
            />
          )}
        </>
      )}

      {/* Appointment detail dialog */}
      <AppointmentDetailDialog
        open={detailDialogOpen}
        appointment={selectedAppointment}
        onClose={handleCloseDetailDialog}
        onEdit={
          hasPermission("edit:appointments") ? handleEditAppointment : undefined
        }
        onDelete={
          hasPermission("delete:appointments")
            ? handleDeleteAppointment
            : undefined
        }
      />
    </Container>
  );
};

export default AppointmentCalendar;
