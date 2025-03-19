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
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format, addHours, parseISO } from "date-fns";
import api from "../../services/api";
import { Appointment } from "../../interfaces/appointment";

// Validation schema
const validationSchema = Yup.object({
  patientId: Yup.string().required("Patient is required"),
  doctorId: Yup.string().required("Doctor is required"),
  title: Yup.string().required("Title is required"),
  startTime: Yup.date().required("Start time is required"),
  endTime: Yup.date()
    .required("End time is required")
    .test("is-greater", "End time must be after start time", function (value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      return new Date(value) > new Date(startTime);
    }),
  status: Yup.string()
    .oneOf(["scheduled", "completed", "canceled", "no-show"])
    .required("Status is required"),
  type: Yup.string()
    .oneOf(["follow-up", "new-patient", "emergency", "routine"])
    .required("Type is required"),
  notes: Yup.string(),
});

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
}

const AppointmentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Check if we're in edit mode
  const isEditMode = !!id;

  // Check if there's a pre-selected patient (from patient detail page)
  const preSelectedPatient = location.state?.patientId;

  const initialValues: Omit<Appointment, "id" | "createdAt" | "updatedAt"> = {
    patientId: preSelectedPatient || "",
    doctorId: "",
    title: "",
    startTime: new Date().toISOString(),
    endTime: addHours(new Date(), 1).toISOString(),
    status: "scheduled",
    type: "routine",
    notes: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        if (isEditMode) {
          await api.put(`/appointments/${id}`, values);
        } else {
          await api.post("/appointments", values);
        }
        navigate("/appointments");
      } catch (err) {
        console.error("Error saving appointment:", err);
        setError("Failed to save appointment. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Fetch patients and doctors
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch patients
        const patientsResponse = await api.get("/patients");
        setPatients(patientsResponse.data);

        // Fetch doctors
        const doctorsResponse = await api.get("/staff", {
          params: { role: "doctor" },
        });
        setDoctors(doctorsResponse.data);

        // If in edit mode, fetch appointment data
        if (isEditMode) {
          const appointmentResponse = await api.get(`/appointments/${id}`);
          const appointmentData = appointmentResponse.data;

          // Prepare data for form
          formik.setValues({
            patientId: appointmentData.patientId,
            doctorId: appointmentData.doctorId,
            title: appointmentData.title,
            startTime: appointmentData.startTime,
            endTime: appointmentData.endTime,
            status: appointmentData.status,
            type: appointmentData.type,
            notes: appointmentData.notes || "",
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");

        // For demo purposes, set mock data if API calls fail
        setPatients([
          { id: "p-001", firstName: "John", lastName: "Doe" },
          { id: "p-002", firstName: "Jane", lastName: "Smith" },
          { id: "p-003", firstName: "Robert", lastName: "Johnson" },
        ]);
        setDoctors([
          { id: "d-001", firstName: "Sarah", lastName: "Johnson" },
          { id: "d-002", firstName: "Michael", lastName: "Chen" },
          { id: "d-003", firstName: "Emily", lastName: "Rodriguez" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Handle date-time changes
  const handleStartTimeChange = (date: Date | null) => {
    if (date) {
      formik.setFieldValue("startTime", date.toISOString());

      // If end time is before new start time, update end time to be 1 hour after start time
      const endTime = new Date(formik.values.endTime);
      if (endTime <= date) {
        formik.setFieldValue("endTime", addHours(date, 1).toISOString());
      }
    }
  };

  const handleEndTimeChange = (date: Date | null) => {
    if (date) {
      formik.setFieldValue("endTime", date.toISOString());
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEditMode ? "Edit Appointment" : "Schedule New Appointment"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
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
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  placeholder="e.g., Annual Check-up, Follow-up Consultation"
                />
              </Grid>

              {/* Patient Select */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={
                    formik.touched.patientId && Boolean(formik.errors.patientId)
                  }
                >
                  <InputLabel id="patient-select-label">Patient</InputLabel>
                  <Select
                    labelId="patient-select-label"
                    id="patientId"
                    name="patientId"
                    value={formik.values.patientId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Patient"
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {`${patient.firstName} ${patient.lastName}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.patientId && formik.errors.patientId && (
                    <FormHelperText>{formik.errors.patientId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Doctor Select */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={
                    formik.touched.doctorId && Boolean(formik.errors.doctorId)
                  }
                >
                  <InputLabel id="doctor-select-label">Doctor</InputLabel>
                  <Select
                    labelId="doctor-select-label"
                    id="doctorId"
                    name="doctorId"
                    value={formik.values.doctorId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Doctor"
                  >
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {`Dr. ${doctor.firstName} ${doctor.lastName}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.doctorId && formik.errors.doctorId && (
                    <FormHelperText>{formik.errors.doctorId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Date & Time
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* Start Time */}
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Start Time"
                  value={
                    formik.values.startTime
                      ? new Date(formik.values.startTime)
                      : null
                  }
                  onChange={handleStartTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.startTime &&
                        Boolean(formik.errors.startTime),
                      helperText:
                        formik.touched.startTime && formik.errors.startTime,
                      onBlur: formik.handleBlur,
                      name: "startTime",
                    },
                  }}
                />
              </Grid>

              {/* End Time */}
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="End Time"
                  value={
                    formik.values.endTime
                      ? new Date(formik.values.endTime)
                      : null
                  }
                  onChange={handleEndTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.endTime &&
                        Boolean(formik.errors.endTime),
                      helperText:
                        formik.touched.endTime && formik.errors.endTime,
                      onBlur: formik.handleBlur,
                      name: "endTime",
                    },
                  }}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Status"
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="canceled">Canceled</MenuItem>
                    <MenuItem value="no-show">No Show</MenuItem>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <FormHelperText>{formik.errors.status}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Type */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={formik.touched.type && Boolean(formik.errors.type)}
                >
                  <InputLabel id="type-select-label">
                    Appointment Type
                  </InputLabel>
                  <Select
                    labelId="type-select-label"
                    id="type"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Appointment Type"
                  >
                    <MenuItem value="follow-up">Follow-up</MenuItem>
                    <MenuItem value="new-patient">New Patient</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                    <MenuItem value="routine">Routine</MenuItem>
                  </Select>
                  {formik.touched.type && formik.errors.type && (
                    <FormHelperText>{formik.errors.type}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Notes
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <TextField
              fullWidth
              id="notes"
              name="notes"
              label="Additional Notes"
              multiline
              rows={4}
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
              placeholder="Enter any additional information about this appointment"
            />
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/appointments")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {isEditMode ? "Update Appointment" : "Schedule Appointment"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AppointmentForm;
