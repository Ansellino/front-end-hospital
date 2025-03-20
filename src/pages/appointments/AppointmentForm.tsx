import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  IconButton,
  Stack,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addHours, format, parseISO, isValid } from "date-fns";
import AppointmentService from "../../services/appointmentService";
import { Appointment } from "../../interfaces/appointment";
import { useAuth } from "../../contexts/AuthContext";
import { ColorValue, statusColors, typeColors } from "./constants";

// Validation schema for appointment form
const validationSchema = Yup.object({
  patientId: Yup.string().required("Patient is required"),
  doctorId: Yup.string().required("Doctor is required"),
  title: Yup.string()
    .required("Title is required")
    .max(100, "Title must be at most 100 characters"),
  startTime: Yup.date().required("Start time is required"),
  endTime: Yup.date()
    .required("End time is required")
    .test("is-greater", "End time must be after start time", function (value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      return new Date(value) > new Date(startTime);
    }),
  status: Yup.string()
    .oneOf(["scheduled", "completed", "canceled", "no-show"], "Invalid status")
    .required("Status is required"),
  type: Yup.string()
    .oneOf(["follow-up", "new-patient", "emergency", "routine"], "Invalid type")
    .required("Type is required"),
  notes: Yup.string().max(500, "Notes must be at most 500 characters"),
});

// Define interfaces for Patient and Doctor
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  profileImage?: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  profileImage?: string;
}

const AppointmentForm: React.FC = () => {
  // Get URL parameters and hooks
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();

  // Set up component state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Determine if we're in edit mode
  const isEditMode = Boolean(id);
  const pageTitle = isEditMode ? "Edit Appointment" : "New Appointment";

  // Pull suggested start time from URL if present (from the calendar view)
  const getInitialStartTime = () => {
    const params = new URLSearchParams(location.search);
    const startParam = params.get("start");
    return startParam && isValid(parseISO(startParam))
      ? parseISO(startParam)
      : new Date();
  };

  // Set up formik for form management
  const formik = useFormik({
    initialValues: {
      patientId: "",
      doctorId: "",
      title: "",
      startTime: getInitialStartTime(),
      endTime: addHours(getInitialStartTime(), 1),
      status: "scheduled",
      type: "routine",
      notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);

        // Format the data for the API
        const appointmentData = formatAppointmentForApi(values);

        if (isEditMode) {
          await AppointmentService.updateAppointment(id!, appointmentData);
        } else {
          await AppointmentService.createAppointment(appointmentData);
        }

        setSuccess(true);
        setTimeout(() => {
          navigate("/appointments");
        }, 1500);
      } catch (err: any) {
        console.error("Error saving appointment:", err);
        setError(
          err.message || "Failed to save appointment. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Helper function to format appointment data for API
  const formatAppointmentForApi = (
    formData: typeof formik.values
  ): Omit<Appointment, "id" | "createdAt" | "updatedAt"> => {
    return {
      patientId: formData.patientId,
      doctorId: formData.doctorId,
      title: formData.title,
      startTime:
        formData.startTime instanceof Date
          ? formData.startTime.toISOString()
          : String(formData.startTime),
      endTime:
        formData.endTime instanceof Date
          ? formData.endTime.toISOString()
          : String(formData.endTime),
      status: formData.status as
        | "scheduled"
        | "completed"
        | "canceled"
        | "no-show",
      type: formData.type as
        | "follow-up"
        | "new-patient"
        | "emergency"
        | "routine",
      notes: formData.notes,
    };
  };

  // Fetch data needed for the form
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch patients and doctors in parallel for better performance
        const [patientsData, doctorsData] = await Promise.all([
          AppointmentService.getPatients(),
          AppointmentService.getDoctors(),
        ]);

        setPatients(patientsData);
        setDoctors(doctorsData);

        // If in edit mode, fetch the existing appointment data
        if (isEditMode && id) {
          const appointmentData = await AppointmentService.getAppointment(id);

          if (appointmentData) {
            // Update form with appointment data, ensuring proper date objects
            formik.setValues({
              patientId: appointmentData.patientId,
              doctorId: appointmentData.doctorId,
              title: appointmentData.title,
              startTime: new Date(appointmentData.startTime),
              endTime: new Date(appointmentData.endTime),
              status: appointmentData.status,
              type: appointmentData.type,
              notes: appointmentData.notes || "",
            });
          }
        }
      } catch (err: any) {
        console.error("Error fetching form data:", err);
        setError("Failed to load data. Please try again.");

        // Set fallback data if API fails
        setPatients([
          { id: "p-001", firstName: "John", lastName: "Doe" },
          { id: "p-002", firstName: "Jane", lastName: "Smith" },
        ]);

        setDoctors([
          {
            id: "d-001",
            firstName: "Dr. Emily",
            lastName: "Johnson",
            specialty: "Cardiology",
          },
          {
            id: "d-002",
            firstName: "Dr. Michael",
            lastName: "Williams",
            specialty: "Pediatrics",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Helper for field errors
  const hasError = (fieldName: string) =>
    Boolean(
      formik.touched[fieldName as keyof typeof formik.touched] &&
        formik.errors[fieldName as keyof typeof formik.errors]
    );

  // Get error message for a field
  const getErrorMessage = (fieldName: string): string =>
    hasError(fieldName)
      ? String(formik.errors[fieldName as keyof typeof formik.errors])
      : "";

  // Format doctor name with specialty
  const formatDoctorName = (doctor: Doctor) => {
    return `${doctor.firstName} ${doctor.lastName}${
      doctor.specialty ? ` (${doctor.specialty})` : ""
    }`;
  };

  // Get color for status and type chips
  const getStatusColor = (status: string): ColorValue =>
    statusColors[status as keyof typeof statusColors] || "#9e9e9e"; // Default gray
  const getTypeColor = (type: string): ColorValue =>
    typeColors[type as keyof typeof typeColors] || "#9e9e9e"; // Default gray

  if (!hasPermission("create:appointments")) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          You don't have permission to create or edit appointments.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/appointments")}
          sx={{ mt: 2 }}
        >
          Back to Appointments
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={() => navigate("/appointments")}
            sx={{ mr: 2 }}
            aria-label="back to appointments"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {pageTitle}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* First section: Basic details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Appointment Details
              </Typography>
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Appointment Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={hasError("title")}
                helperText={getErrorMessage("title")}
                placeholder="e.g., Annual Check-up, Follow-up Consultation"
                disabled={submitting}
              />
            </Grid>

            {/* Patient selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={hasError("patientId")}>
                <InputLabel id="patient-label">Patient</InputLabel>
                <Select
                  labelId="patient-label"
                  id="patientId"
                  name="patientId"
                  value={formik.values.patientId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Patient"
                  disabled={submitting}
                  renderValue={(selected) => {
                    const patient = patients.find((p) => p.id === selected);
                    if (!patient) return selected;
                    return (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          sx={{ width: 24, height: 24 }}
                          src={patient.profileImage}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Typography>
                          {patient.firstName} {patient.lastName}
                        </Typography>
                      </Stack>
                    );
                  }}
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          sx={{ width: 24, height: 24 }}
                          src={patient.profileImage}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography>
                            {patient.firstName} {patient.lastName}
                          </Typography>
                          {patient.dateOfBirth && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              DOB:{" "}
                              {format(
                                new Date(patient.dateOfBirth),
                                "MMM d, yyyy"
                              )}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                {hasError("patientId") && (
                  <FormHelperText>
                    {getErrorMessage("patientId")}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Doctor selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={hasError("doctorId")}>
                <InputLabel id="doctor-label">Doctor</InputLabel>
                <Select
                  labelId="doctor-label"
                  id="doctorId"
                  name="doctorId"
                  value={formik.values.doctorId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Doctor"
                  disabled={submitting}
                  renderValue={(selected) => {
                    const doctor = doctors.find((d) => d.id === selected);
                    return doctor ? formatDoctorName(doctor) : selected;
                  }}
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {formatDoctorName(doctor)}
                    </MenuItem>
                  ))}
                </Select>
                {hasError("doctorId") && (
                  <FormHelperText>{getErrorMessage("doctorId")}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Date & Time section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Date & Time
              </Typography>
            </Grid>

            {/* Start time */}
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Start Time"
                value={formik.values.startTime}
                onChange={(date) => {
                  formik.setFieldValue("startTime", date);
                  if (date) {
                    const newEndTime = addHours(date, 1);
                    formik.setFieldValue("endTime", newEndTime);
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: hasError("startTime"),
                    helperText: getErrorMessage("startTime") as string,
                    disabled: submitting,
                  },
                }}
              />
            </Grid>

            {/* End time */}
            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="End Time"
                value={formik.values.endTime}
                onChange={(date) => formik.setFieldValue("endTime", date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: hasError("endTime"),
                    helperText: getErrorMessage("endTime") as string,
                    disabled: submitting,
                  },
                }}
              />
            </Grid>

            {/* Type and Status */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Type & Status
              </Typography>
            </Grid>

            {/* Appointment type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={hasError("type")}>
                <InputLabel id="type-label">Appointment Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Appointment Type"
                  disabled={submitting}
                  renderValue={(selected) => (
                    <Chip
                      label={selected
                        .replace("-", " ")
                        .replace(
                          /\w\S*/g,
                          (txt) =>
                            txt.charAt(0).toUpperCase() +
                            txt.substr(1).toLowerCase()
                        )}
                      size="small"
                      sx={{
                        backgroundColor: getTypeColor(selected),
                        color: "white", // Ensure text is white for visibility
                      }}
                    />
                  )}
                >
                  <MenuItem value="new-patient">New Patient</MenuItem>
                  <MenuItem value="follow-up">Follow-up</MenuItem>
                  <MenuItem value="routine">Routine</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </Select>
                {hasError("type") && (
                  <FormHelperText>{getErrorMessage("type")}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Appointment status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={hasError("status")}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Status"
                  disabled={submitting}
                  renderValue={(selected) => (
                    <Chip
                      label={
                        selected.charAt(0).toUpperCase() + selected.slice(1)
                      }
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(selected),
                        color: "white", // Ensure text is white for visibility
                      }}
                    />
                  )}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="canceled">Canceled</MenuItem>
                  <MenuItem value="no-show">No Show</MenuItem>
                </Select>
                {hasError("status") && (
                  <FormHelperText>{getErrorMessage("status")}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Notes section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Additional Information
              </Typography>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={hasError("notes")}
                helperText={getErrorMessage("notes")}
                placeholder="Add any additional notes or information about this appointment"
                disabled={submitting}
              />
            </Grid>

            {/* Submit button */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/appointments")}
                  sx={{ mr: 2 }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting || !formik.isValid}
                  startIcon={
                    submitting ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                >
                  {submitting
                    ? "Saving..."
                    : isEditMode
                    ? "Update Appointment"
                    : "Create Appointment"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={5000}
        onClose={() => setSuccess(false)}
        message={
          isEditMode
            ? "Appointment updated successfully"
            : "Appointment created successfully"
        }
      />
    </Container>
  );
};

export default AppointmentForm;
