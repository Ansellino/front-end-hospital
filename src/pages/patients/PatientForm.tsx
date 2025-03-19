import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Divider,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  FormHelperText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import * as patientService from "../../services/patientService";
import { Patient } from "../../interfaces/patient";

const validationSchema = Yup.object({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  dateOfBirth: Yup.date().required("Date of birth is required"),
  gender: Yup.string()
    .oneOf(["male", "female", "other"], "Invalid gender")
    .required("Gender is required"),
  contactNumber: Yup.string().required("Contact number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  address: Yup.object({
    street: Yup.string().required("Street address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    zipCode: Yup.string().required("Zip code is required"),
    country: Yup.string().required("Country is required"),
  }),
  emergencyContact: Yup.object({
    name: Yup.string().required("Emergency contact name is required"),
    relationship: Yup.string().required("Relationship is required"),
    contactNumber: Yup.string().required("Contact number is required"),
  }),
  insuranceInfo: Yup.object({
    provider: Yup.string().required("Provider is required"),
    policyNumber: Yup.string().required("Policy number is required"),
    groupNumber: Yup.string().required("Group number is required"),
    validUntil: Yup.date().required("Validity date is required"),
  }),
});

const PatientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For dynamic medical history fields
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");

  const initialValues: Omit<Patient, "id" | "createdAt" | "updatedAt"> = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male",
    contactNumber: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    emergencyContact: {
      name: "",
      relationship: "",
      contactNumber: "",
    },
    medicalHistory: {
      allergies: [],
      chronicConditions: [],
      surgeries: [],
      medications: [],
    },
    insuranceInfo: {
      provider: "",
      policyNumber: "",
      groupNumber: "",
      validUntil: "",
    },
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        if (id) {
          await patientService.updatePatient(id, values);
        } else {
          await patientService.createPatient(values);
        }
        navigate("/patients");
      } catch (err) {
        console.error("Error saving patient:", err);
        setError("Failed to save patient data. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch patient data if in edit mode
  useEffect(() => {
    if (id) {
      setLoading(true);
      patientService
        .getPatientById(id)
        .then((data) => {
          // We need to clean the data object to match our form structure
          // Remove id, createdAt, updatedAt fields that are not in the form
          const { id: _, createdAt: __, updatedAt: ___, ...formData } = data;
          formik.setValues(formData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching patient:", err);
          setError("Failed to load patient data. Please try again.");
          setLoading(false);
        });
    }
  }, [id, formik]);

  // Helper functions for dynamic medical history fields
  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      formik.setFieldValue("medicalHistory.allergies", [
        ...formik.values.medicalHistory.allergies,
        newAllergy.trim(),
      ]);
      setNewAllergy("");
    }
  };

  const handleDeleteAllergy = (index: number) => {
    const allergies = [...formik.values.medicalHistory.allergies];
    allergies.splice(index, 1);
    formik.setFieldValue("medicalHistory.allergies", allergies);
  };

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      formik.setFieldValue("medicalHistory.chronicConditions", [
        ...formik.values.medicalHistory.chronicConditions,
        newCondition.trim(),
      ]);
      setNewCondition("");
    }
  };

  const handleDeleteCondition = (index: number) => {
    const conditions = [...formik.values.medicalHistory.chronicConditions];
    conditions.splice(index, 1);
    formik.setFieldValue("medicalHistory.chronicConditions", conditions);
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
          {id ? "Edit Patient" : "Add New Patient"}
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
                <DatePicker
                  label="Date of Birth"
                  value={
                    formik.values.dateOfBirth
                      ? new Date(formik.values.dateOfBirth)
                      : null
                  }
                  onChange={(date) => {
                    formik.setFieldValue(
                      "dateOfBirth",
                      date?.toISOString().split("T")[0] || ""
                    );
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.dateOfBirth &&
                        Boolean(formik.errors.dateOfBirth),
                      helperText:
                        formik.touched.dateOfBirth && formik.errors.dateOfBirth,
                      onBlur: formik.handleBlur,
                      name: "dateOfBirth",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={formik.touched.gender && Boolean(formik.errors.gender)}
                >
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {formik.touched.gender && formik.errors.gender && (
                    <FormHelperText>{formik.errors.gender}</FormHelperText>
                  )}
                </FormControl>
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
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Address
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address.street"
                  name="address.street"
                  label="Street Address"
                  value={formik.values.address.street}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.address?.street &&
                    Boolean(formik.errors.address?.street)
                  }
                  helperText={
                    formik.touched.address?.street &&
                    formik.errors.address?.street
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="address.city"
                  name="address.city"
                  label="City"
                  value={formik.values.address.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.address?.city &&
                    Boolean(formik.errors.address?.city)
                  }
                  helperText={
                    formik.touched.address?.city && formik.errors.address?.city
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="address.state"
                  name="address.state"
                  label="State/Province"
                  value={formik.values.address.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.address?.state &&
                    Boolean(formik.errors.address?.state)
                  }
                  helperText={
                    formik.touched.address?.state &&
                    formik.errors.address?.state
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="address.zipCode"
                  name="address.zipCode"
                  label="Zip/Postal Code"
                  value={formik.values.address.zipCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.address?.zipCode &&
                    Boolean(formik.errors.address?.zipCode)
                  }
                  helperText={
                    formik.touched.address?.zipCode &&
                    formik.errors.address?.zipCode
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="address.country"
                  name="address.country"
                  label="Country"
                  value={formik.values.address.country}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.address?.country &&
                    Boolean(formik.errors.address?.country)
                  }
                  helperText={
                    formik.touched.address?.country &&
                    formik.errors.address?.country
                  }
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Emergency Contact
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="emergencyContact.name"
                  name="emergencyContact.name"
                  label="Full Name"
                  value={formik.values.emergencyContact.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.emergencyContact?.name &&
                    Boolean(formik.errors.emergencyContact?.name)
                  }
                  helperText={
                    formik.touched.emergencyContact?.name &&
                    formik.errors.emergencyContact?.name
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="emergencyContact.relationship"
                  name="emergencyContact.relationship"
                  label="Relationship"
                  value={formik.values.emergencyContact.relationship}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.emergencyContact?.relationship &&
                    Boolean(formik.errors.emergencyContact?.relationship)
                  }
                  helperText={
                    formik.touched.emergencyContact?.relationship &&
                    formik.errors.emergencyContact?.relationship
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="emergencyContact.contactNumber"
                  name="emergencyContact.contactNumber"
                  label="Contact Number"
                  value={formik.values.emergencyContact.contactNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.emergencyContact?.contactNumber &&
                    Boolean(formik.errors.emergencyContact?.contactNumber)
                  }
                  helperText={
                    formik.touched.emergencyContact?.contactNumber &&
                    formik.errors.emergencyContact?.contactNumber
                  }
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Medical History
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Allergies
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {formik.values.medicalHistory.allergies.map(
                    (allergy, index) => (
                      <Chip
                        key={`allergy-${index}`}
                        label={allergy}
                        onDelete={() => handleDeleteAllergy(index)}
                      />
                    )
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add allergy"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAllergy();
                      }
                    }}
                  />
                  <IconButton onClick={handleAddAllergy} color="primary">
                    <AddIcon />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Chronic Conditions
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {formik.values.medicalHistory.chronicConditions.map(
                    (condition, index) => (
                      <Chip
                        key={`condition-${index}`}
                        label={condition}
                        onDelete={() => handleDeleteCondition(index)}
                      />
                    )
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add condition"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCondition();
                      }
                    }}
                  />
                  <IconButton onClick={handleAddCondition} color="primary">
                    <AddIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Insurance Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="insuranceInfo.provider"
                  name="insuranceInfo.provider"
                  label="Insurance Provider"
                  value={formik.values.insuranceInfo.provider}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.insuranceInfo?.provider &&
                    Boolean(formik.errors.insuranceInfo?.provider)
                  }
                  helperText={
                    formik.touched.insuranceInfo?.provider &&
                    formik.errors.insuranceInfo?.provider
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="insuranceInfo.policyNumber"
                  name="insuranceInfo.policyNumber"
                  label="Policy Number"
                  value={formik.values.insuranceInfo.policyNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.insuranceInfo?.policyNumber &&
                    Boolean(formik.errors.insuranceInfo?.policyNumber)
                  }
                  helperText={
                    formik.touched.insuranceInfo?.policyNumber &&
                    formik.errors.insuranceInfo?.policyNumber
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="insuranceInfo.groupNumber"
                  name="insuranceInfo.groupNumber"
                  label="Group Number"
                  value={formik.values.insuranceInfo.groupNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.insuranceInfo?.groupNumber &&
                    Boolean(formik.errors.insuranceInfo?.groupNumber)
                  }
                  helperText={
                    formik.touched.insuranceInfo?.groupNumber &&
                    formik.errors.insuranceInfo?.groupNumber
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Valid Until"
                  value={
                    formik.values.insuranceInfo.validUntil
                      ? new Date(formik.values.insuranceInfo.validUntil)
                      : null
                  }
                  onChange={(date) => {
                    formik.setFieldValue(
                      "insuranceInfo.validUntil",
                      date?.toISOString().split("T")[0] || ""
                    );
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.insuranceInfo?.validUntil &&
                        Boolean(formik.errors.insuranceInfo?.validUntil),
                      helperText:
                        formik.touched.insuranceInfo?.validUntil &&
                        formik.errors.insuranceInfo?.validUntil,
                      onBlur: formik.handleBlur,
                      name: "insuranceInfo.validUntil",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/patients")}
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
              {id ? "Update Patient" : "Add Patient"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default PatientForm;
