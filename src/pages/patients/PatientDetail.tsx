import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Divider,
  Box,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Person,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  MedicalServices,
  CalendarMonth,
  Receipt,
  LocalHospital,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Patient } from "../../interfaces/patient";
import * as patientService from "../../services/patientService";
import { useAuth } from "../../contexts/AuthContext";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await patientService.getPatientById(id);
        setPatient(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError("Failed to load patient data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/patients")}
          sx={{ mt: 2 }}
        >
          Back to Patients
        </Button>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Patient not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/patients")}
          sx={{ mt: 2 }}
        >
          Back to Patients
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header section */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => navigate("/patients")}
            sx={{ mr: 2 }}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Patient Details
          </Typography>
        </Box>

        {hasPermission("edit:patients") && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/patients/${id}/edit`)}
          >
            Edit Patient
          </Button>
        )}
      </Box>

      {/* Patient summary card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor:
                    patient.gender === "male"
                      ? "primary.main"
                      : "secondary.main",
                }}
              >
                {patient.firstName[0]}
                {patient.lastName[0]}
              </Avatar>
            </Grid>
            <Grid item xs={12} sm>
              <Typography variant="h5">
                {patient.firstName} {patient.lastName}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                <Chip
                  size="small"
                  label={`${calculateAge(patient.dateOfBirth)} years`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={
                    patient.gender.charAt(0).toUpperCase() +
                    patient.gender.slice(1)
                  }
                  color={
                    patient.gender === "male"
                      ? "primary"
                      : patient.gender === "female"
                      ? "secondary"
                      : "default"
                  }
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`ID: ${patient.id}`}
                  variant="outlined"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "flex-start", sm: "flex-end" },
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Patient since:{" "}
                  {format(new Date(patient.createdAt), "MMM d, yyyy")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated:{" "}
                  {format(new Date(patient.updatedAt), "MMM d, yyyy")}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="patient information tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<Person />}
              iconPosition="start"
              label="Personal Information"
            />
            <Tab
              icon={<MedicalServices />}
              iconPosition="start"
              label="Medical History"
            />
            <Tab
              icon={<LocalHospital />}
              iconPosition="start"
              label="Insurance"
            />
            <Tab
              icon={<CalendarMonth />}
              iconPosition="start"
              label="Appointments"
            />
            <Tab icon={<Receipt />} iconPosition="start" label="Billing" />
          </Tabs>
        </Box>

        {/* Personal Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  <ListItem>
                    <ListItemText primary="Email" secondary={patient.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Phone"
                      secondary={patient.contactNumber}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Date of Birth"
                      secondary={format(
                        new Date(patient.dateOfBirth),
                        "MMMM d, yyyy"
                      )}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Address
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  <ListItem>
                    <ListItemText
                      primary="Street"
                      secondary={patient.address.street}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="City"
                      secondary={patient.address.city}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="State"
                      secondary={patient.address.state}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Zip Code"
                      secondary={patient.address.zipCode}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Country"
                      secondary={patient.address.country}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Emergency Contact
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  <ListItem>
                    <ListItemText
                      primary="Name"
                      secondary={patient.emergencyContact.name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Relationship"
                      secondary={patient.emergencyContact.relationship}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Phone"
                      secondary={patient.emergencyContact.contactNumber}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Medical History Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Allergies
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {patient.medicalHistory.allergies.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {patient.medicalHistory.allergies.map((allergy, index) => (
                      <Chip key={index} label={allergy} />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No known allergies
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Chronic Conditions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {patient.medicalHistory.chronicConditions.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {patient.medicalHistory.chronicConditions.map(
                      (condition, index) => (
                        <Chip key={index} label={condition} />
                      )
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No chronic conditions
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Current Medications
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {patient.medicalHistory.medications.length > 0 ? (
                  <Box sx={{ overflowX: "auto" }}>
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2">Name</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2">Dosage</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2">Frequency</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2">Start Date</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                    </Grid>
                    {patient.medicalHistory.medications.map(
                      (medication, index) => (
                        <Grid container spacing={2} key={index} sx={{ mt: 1 }}>
                          <Grid item xs={3}>
                            <Typography variant="body2">
                              {medication.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="body2">
                              {medication.dosage}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="body2">
                              {medication.frequency}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="body2">
                              {format(
                                new Date(medication.startDate),
                                "MMM d, yyyy"
                              )}
                            </Typography>
                          </Grid>
                        </Grid>
                      )
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No current medications
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Previous Surgeries
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {patient.medicalHistory.surgeries.length > 0 ? (
                  <Box sx={{ overflowX: "auto" }}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Procedure</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="subtitle2">Date</Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <Typography variant="subtitle2">Notes</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                    </Grid>
                    {patient.medicalHistory.surgeries.map((surgery, index) => (
                      <Grid container spacing={2} key={index} sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                          <Typography variant="body2">
                            {surgery.procedure}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2">
                            {format(new Date(surgery.date), "MMM d, yyyy")}
                          </Typography>
                        </Grid>
                        <Grid item xs={5}>
                          <Typography variant="body2">
                            {surgery.notes}
                          </Typography>
                        </Grid>
                      </Grid>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No previous surgeries
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Insurance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Insurance Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <List disablePadding>
                  <ListItem>
                    <ListItemText
                      primary="Insurance Provider"
                      secondary={patient.insuranceInfo.provider}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Policy Number"
                      secondary={patient.insuranceInfo.policyNumber}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} sm={6}>
                <List disablePadding>
                  <ListItem>
                    <ListItemText
                      primary="Group Number"
                      secondary={patient.insuranceInfo.groupNumber}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Valid Until"
                      secondary={format(
                        new Date(patient.insuranceInfo.validUntil),
                        "MMMM d, yyyy"
                      )}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Appointments Tab - This would ideally fetch from an appointments service */}
        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body1">
              Appointment history will be displayed here.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() =>
                navigate("/appointments/new", {
                  state: { patientId: patient.id },
                })
              }
            >
              Schedule New Appointment
            </Button>
          </Paper>
        </TabPanel>

        {/* Billing Tab - This would ideally fetch from a billing service */}
        <TabPanel value={tabValue} index={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body1">
              Billing and invoice history will be displayed here.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() =>
                navigate("/billing", {
                  state: { patientId: patient.id },
                })
              }
            >
              Create New Invoice
            </Button>
          </Paper>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default PatientDetail;
