import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  FormHelperText,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import * as staffService from "../../services/staffService";
import { Staff, WorkSchedule, Qualification } from "../../interfaces/staff";

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  contactNumber: Yup.string().required("Contact number is required"),
  role: Yup.string()
    .oneOf(
      ["doctor", "nurse", "admin", "receptionist", "pharmacist"],
      "Invalid role"
    )
    .required("Role is required"),
  specialization: Yup.string().when("role", {
    is: (val: string) => val === "doctor" || val === "nurse",
    then: () => Yup.string().required("Specialization is required"),
    otherwise: () => Yup.string(),
  }),
  department: Yup.string().required("Department is required"),
  joinDate: Yup.date().required("Join date is required"),
  status: Yup.string()
    .oneOf(["active", "inactive", "on-leave"], "Invalid status")
    .required("Status is required"),
  workSchedule: Yup.array().of(
    Yup.object({
      day: Yup.string().required("Day is required"),
      startTime: Yup.string().required("Start time is required"),
      endTime: Yup.string().required("End time is required"),
    })
  ),
  qualifications: Yup.array().of(
    Yup.object({
      degree: Yup.string().required("Degree is required"),
      institution: Yup.string().required("Institution is required"),
      year: Yup.string().required("Year is required"),
      certification: Yup.string(),
    })
  ),
});

const StaffForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Departments for dropdown
  const departmentsRef = useRef([
    "Cardiology",
    "Dermatology",
    "Emergency",
    "General Medicine",
    "Neurology",
    "Obstetrics",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Administration",
  ]);
  const departments = departmentsRef.current;

  const initialValues: Omit<Staff, "id" | "createdAt" | "updatedAt"> = {
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    role: "doctor",
    specialization: "",
    department: "",
    joinDate: format(new Date(), "yyyy-MM-dd"),
    workSchedule: [],
    qualifications: [],
    status: "active",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (id) {
          await staffService.updateStaff(id, values);
        } else {
          await staffService.createStaff(values);
        }
        navigate("/staff");
      } catch (err) {
        console.error("Error saving staff:", err);
        setError("Failed to save staff data. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch staff data if in edit mode
  useEffect(() => {
    if (id) {
      setLoading(true);
      staffService
        .getStaffById(id)
        .then((data) => {
          // We need to clean the data object to match our form structure
          const { id: _, createdAt: __, updatedAt: ___, ...formData } = data;
          formik.setValues(formData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching staff:", err);
          setError("Failed to load staff data. Please try again.");
          setLoading(false);
        });
    }
  }, [id, formik]);

  // Helper functions for work schedule
  const handleAddSchedule = () => {
    const newSchedule: WorkSchedule = {
      day: "monday",
      startTime: "09:00",
      endTime: "17:00",
    };
    formik.setFieldValue("workSchedule", [
      ...formik.values.workSchedule,
      newSchedule,
    ]);
  };

  const handleDeleteSchedule = (index: number) => {
    const schedules = [...formik.values.workSchedule];
    schedules.splice(index, 1);
    formik.setFieldValue("workSchedule", schedules);
  };

  const handleScheduleChange = (
    index: number,
    field: keyof WorkSchedule,
    value: string
  ) => {
    const updatedSchedules = [...formik.values.workSchedule];

    // Use a type assertion for the day field to tell TypeScript this value is safe
    if (field === "day") {
      updatedSchedules[index][field] = value as WorkSchedule["day"];
    } else {
      updatedSchedules[index][field] = value;
    }

    formik.setFieldValue("workSchedule", updatedSchedules);
  };

  // Helper functions for qualifications
  const handleAddQualification = () => {
    const newQualification: Qualification = {
      degree: "",
      institution: "",
      year: "",
      certification: "",
    };
    formik.setFieldValue("qualifications", [
      ...formik.values.qualifications,
      newQualification,
    ]);
  };

  const handleDeleteQualification = (index: number) => {
    const qualifications = [...formik.values.qualifications];
    qualifications.splice(index, 1);
    formik.setFieldValue("qualifications", qualifications);
  };

  const handleQualificationChange = (
    index: number,
    field: keyof Qualification,
    value: string
  ) => {
    const updatedQualifications = [...formik.values.qualifications];
    updatedQualifications[index][field] = value;
    formik.setFieldValue("qualifications", updatedQualifications);
  };

  // Format day name for display
  const formatDay = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {id ? "Edit Staff Member" : "Add New Staff Member"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.firstName && Boolean(formik.errors.firstName)
                  }
                  helperText={
                    formik.touched.firstName && formik.errors.firstName
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.lastName && Boolean(formik.errors.lastName)
                  }
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="contactNumber"
                  name="contactNumber"
                  label="Contact Number"
                  value={formik.values.contactNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.contactNumber &&
                    Boolean(formik.errors.contactNumber)
                  }
                  helperText={
                    formik.touched.contactNumber && formik.errors.contactNumber
                  }
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Professional Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={formik.touched.role && Boolean(formik.errors.role)}
                >
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Role"
                  >
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="nurse">Nurse</MenuItem>
                    <MenuItem value="admin">Administrator</MenuItem>
                    <MenuItem value="receptionist">Receptionist</MenuItem>
                    <MenuItem value="pharmacist">Pharmacist</MenuItem>
                  </Select>
                  {formik.touched.role && formik.errors.role && (
                    <FormHelperText>{formik.errors.role}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="specialization"
                  name="specialization"
                  label="Specialization"
                  value={formik.values.specialization}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.specialization &&
                    Boolean(formik.errors.specialization)
                  }
                  helperText={
                    formik.touched.specialization &&
                    formik.errors.specialization
                  }
                  disabled={!["doctor", "nurse"].includes(formik.values.role)}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={
                    formik.touched.department &&
                    Boolean(formik.errors.department)
                  }
                >
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    name="department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Department"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.department && formik.errors.department && (
                    <FormHelperText>{formik.errors.department}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Join Date"
                  value={
                    formik.values.joinDate
                      ? new Date(formik.values.joinDate)
                      : null
                  }
                  onChange={(date) => {
                    formik.setFieldValue(
                      "joinDate",
                      date ? format(date, "yyyy-MM-dd") : ""
                    );
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.joinDate &&
                        Boolean(formik.errors.joinDate),
                      helperText:
                        formik.touched.joinDate && formik.errors.joinDate,
                      onBlur: formik.handleBlur,
                      name: "joinDate",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="on-leave">On Leave</MenuItem>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <FormHelperText>{formik.errors.status}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 3,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Work Schedule
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddSchedule}
                variant="outlined"
                size="small"
              >
                Add Schedule
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {formik.values.workSchedule.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography color="text.secondary">
                  No work schedule added
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddSchedule}
                  sx={{ mt: 1 }}
                >
                  Add Schedule
                </Button>
              </Box>
            ) : (
              formik.values.workSchedule.map((schedule, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{ p: 2, mb: 2, position: "relative" }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteSchedule(index)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel id={`day-label-${index}`}>Day</InputLabel>
                        <Select
                          labelId={`day-label-${index}`}
                          id={`day-${index}`}
                          value={schedule.day}
                          onChange={(e) =>
                            handleScheduleChange(index, "day", e.target.value)
                          }
                          label="Day"
                        >
                          <MenuItem value="monday">Monday</MenuItem>
                          <MenuItem value="tuesday">Tuesday</MenuItem>
                          <MenuItem value="wednesday">Wednesday</MenuItem>
                          <MenuItem value="thursday">Thursday</MenuItem>
                          <MenuItem value="friday">Friday</MenuItem>
                          <MenuItem value="saturday">Saturday</MenuItem>
                          <MenuItem value="sunday">Sunday</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        id={`startTime-${index}`}
                        label="Start Time"
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) =>
                          handleScheduleChange(
                            index,
                            "startTime",
                            e.target.value
                          )
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          step: 300, // 5 min
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        id={`endTime-${index}`}
                        label="End Time"
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) =>
                          handleScheduleChange(index, "endTime", e.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          step: 300, // 5 min
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))
            )}
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 3,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Qualifications
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddQualification}
                variant="outlined"
                size="small"
              >
                Add Qualification
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {formik.values.qualifications.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography color="text.secondary">
                  No qualifications added
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddQualification}
                  sx={{ mt: 1 }}
                >
                  Add Qualification
                </Button>
              </Box>
            ) : (
              formik.values.qualifications.map((qualification, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{ p: 2, mb: 2, position: "relative" }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteQualification(index)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Degree"
                        value={qualification.degree}
                        onChange={(e) =>
                          handleQualificationChange(
                            index,
                            "degree",
                            e.target.value
                          )
                        }
                        placeholder="e.g., MD, Ph.D., BSN"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Institution"
                        value={qualification.institution}
                        onChange={(e) =>
                          handleQualificationChange(
                            index,
                            "institution",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Harvard Medical School"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Year"
                        value={qualification.year}
                        onChange={(e) =>
                          handleQualificationChange(
                            index,
                            "year",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 2015"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Certification"
                        value={qualification.certification}
                        onChange={(e) =>
                          handleQualificationChange(
                            index,
                            "certification",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Board Certified"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))
            )}
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/staff")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {id ? "Update Staff Member" : "Add Staff Member"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default StaffForm;
