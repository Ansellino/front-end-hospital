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
  Assignment as AssignmentIcon,
  Event as EventIcon, // Add this import
  Add as AddIcon, // Add this import
} from "@mui/icons-material";
import { format } from "date-fns";
import { Patient } from "../../interfaces/patient";
import * as patientService from "../../services/patientService";
import MedicalRecordService from "../../services/medicalRecordService";
import { useAuth } from "../../contexts/AuthContext";
import VitalSigns from "../../components/emr/VitalSigns";
import { VitalSigns as VitalSignsInterface } from "../../interfaces/emr";
import PatientChart from "../../components/emr/PatientChart";

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

// Add this function to fix the error
function a11yProps(index: number) {
  return {
    id: `patient-tab-${index}`,
    "aria-controls": `patient-tabpanel-${index}`,
  };
}

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [latestVitalSigns, setLatestVitalSigns] =
    useState<VitalSignsInterface | null>(null);

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

  useEffect(() => {
    if (id) {
      const fetchLatestVitalSigns = async () => {
        try {
          // Get latest medical record with vital signs
          const records = await MedicalRecordService.getPatientMedicalRecords(
            id
          );
          if (records && records.length > 0) {
            // Assuming records are sorted by date, newest first
            setLatestVitalSigns(records[0].vitalSigns);
          }
        } catch (err) {
          console.error("Error fetching vital signs:", err);
        }
      };

      fetchLatestVitalSigns();
    }
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
    <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-[1200px] mx-auto">
      {/* Header with back button and actions */}
      <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:items-center">
        <div className="flex items-center">
          <IconButton
            onClick={() => navigate("/patients")}
            className="mr-2 -ml-2"
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            className="text-xl font-medium sm:text-2xl md:text-3xl"
          >
            Patient Details
          </Typography>
        </div>

        <div className="flex flex-wrap w-full gap-2 sm:w-auto">
          {hasPermission("create:appointments") && (
            <Button
              variant="outlined"
              startIcon={<EventIcon />}
              onClick={() => navigate(`/appointments/new?patientId=${id}`)}
              className="flex-grow sm:flex-grow-0"
            >
              Schedule
            </Button>
          )}
          {hasPermission("edit:patients") && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/patients/${id}/edit`)}
              className="flex-grow sm:flex-grow-0"
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Patient summary card */}
      <Card className="mb-4 overflow-hidden transition-shadow duration-200 shadow-sm hover:shadow-md">
        <CardContent className="p-4 sm:p-6">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={1}>
              <Avatar
                className="w-16 h-16 mx-auto sm:w-20 sm:h-20 sm:mx-0"
                sx={{
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

            <Grid
              item
              xs={12}
              sm={8}
              className="mt-2 text-center sm:text-left sm:mt-0"
            >
              <Typography variant="h5" className="text-xl sm:text-2xl">
                {patient.firstName} {patient.lastName}
              </Typography>

              <div className="flex flex-wrap justify-center gap-1 mt-2 sm:justify-start">
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
                  color={patient.gender === "male" ? "primary" : "secondary"}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`ID: ${patient.id}`}
                  variant="outlined"
                />
              </div>

              <div className="mt-2 space-y-1 text-center sm:text-left">
                <Typography variant="body2">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Email:
                  </span>{" "}
                  {patient.email}
                </Typography>
                <Typography variant="body2">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Phone:
                  </span>{" "}
                  {patient.contactNumber}
                </Typography>
              </div>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
              className="mt-2 text-center sm:text-right sm:mt-0"
            >
              <Typography variant="body2" color="textSecondary">
                Patient since:{" "}
                {format(new Date(patient.createdAt), "MMM d, yyyy")}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last updated:{" "}
                {format(new Date(patient.updatedAt), "MMM d, yyyy")}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs section */}
      <Box className="w-full">
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
              label="Overview"
              className="min-w-0 px-2 sm:px-3"
              {...a11yProps(0)}
            />
            <Tab
              icon={<MedicalServices />}
              iconPosition="start"
              label="Medical Records"
              className="min-w-0 px-2 sm:px-3"
              {...a11yProps(1)}
            />
            <Tab
              icon={<CalendarMonth />}
              iconPosition="start"
              label="Appointments"
              className="min-w-0 px-2 sm:px-3"
              {...a11yProps(2)}
            />
            <Tab
              icon={<AssignmentIcon />}
              iconPosition="start"
              label="Insurance"
              className="min-w-0 px-2 sm:px-3"
              {...a11yProps(3)}
            />
            <Tab
              icon={<Receipt />}
              iconPosition="start"
              label="Billing"
              className="min-w-0 px-2 sm:px-3"
              {...a11yProps(4)}
            />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card className="h-full">
                <CardContent className="p-4">
                  <Typography variant="h6" className="mb-3">
                    Personal Information
                  </Typography>
                  <Divider className="mb-4" />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Date of Birth
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(patient.dateOfBirth), "MMMM d, yyyy")}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Gender
                      </Typography>
                      <Typography variant="body1" className="capitalize">
                        {patient.gender}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {patient.address.street}
                      </Typography>
                      <Typography variant="body1">
                        {patient.address.city}, {patient.address.state}{" "}
                        {patient.address.zipCode}
                      </Typography>
                      <Typography variant="body1">
                        {patient.address.country}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="h-full">
                <CardContent className="p-4">
                  <Typography variant="h6" className="mb-3">
                    Emergency Contact
                  </Typography>
                  <Divider className="mb-4" />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {patient.emergencyContact.name}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Relationship
                      </Typography>
                      <Typography variant="body1">
                        {patient.emergencyContact.relationship}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {patient.emergencyContact.contactNumber}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="h-full">
                <CardContent className="p-4">
                  <Typography variant="h6" className="mb-3">
                    Insurance Information
                  </Typography>
                  <Divider className="mb-4" />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Provider
                      </Typography>
                      <Typography variant="body1">
                        {patient.insuranceInfo.provider}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Policy Number
                      </Typography>
                      <Typography variant="body1">
                        {patient.insuranceInfo.policyNumber}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="subtitle2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        Group Number
                      </Typography>
                      <Typography variant="body1">
                        {patient.insuranceInfo.groupNumber}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Medical Records Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:items-center">
                <Typography variant="h6">Medical History</Typography>

                {hasPermission("create:medical-records") && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      navigate(`/medical-records/add?patientId=${id}`)
                    }
                    className="w-full sm:w-auto"
                  >
                    Add Medical Record
                  </Button>
                )}
              </div>

              <Divider className="mb-4" />

              {patient.medicalHistory && (
                <div className="space-y-4">
                  <div>
                    <Typography
                      variant="subtitle1"
                      className="mb-2 font-medium"
                    >
                      Allergies
                    </Typography>
                    <div className="flex flex-wrap gap-1">
                      {patient.medicalHistory.allergies.length > 0 ? (
                        patient.medicalHistory.allergies.map(
                          (allergy, index) => (
                            <Chip key={index} label={allergy} size="small" />
                          )
                        )
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No known allergies
                        </Typography>
                      )}
                    </div>
                  </div>

                  <div>
                    <Typography
                      variant="subtitle1"
                      className="mb-2 font-medium"
                    >
                      Chronic Conditions
                    </Typography>
                    <div className="flex flex-wrap gap-1">
                      {patient.medicalHistory.chronicConditions.length > 0 ? (
                        patient.medicalHistory.chronicConditions.map(
                          (condition, index) => (
                            <Chip key={index} label={condition} size="small" />
                          )
                        )
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No chronic conditions
                        </Typography>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Appointments Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:items-center">
                <Typography variant="h6">Appointments</Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    navigate("/appointments/new", {
                      state: { patientId: patient.id },
                    })
                  }
                  className="w-full sm:w-auto"
                >
                  Schedule New Appointment
                </Button>
              </div>

              <Divider className="mb-4" />

              <Typography variant="body1" className="py-4 text-center">
                Appointment history will be displayed here.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Insurance Tab */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardContent className="p-4">
              <Typography variant="h6">Insurance Details</Typography>
              <Divider className="mb-4" />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    variant="subtitle2"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Insurance Provider
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {patient.insuranceInfo.provider}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    variant="subtitle2"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Policy Number
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {patient.insuranceInfo.policyNumber}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    variant="subtitle2"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Effective Date
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {patient.insuranceInfo.validUntil
                      ? format(
                          new Date(patient.insuranceInfo.validUntil),
                          "MMMM d, yyyy"
                        )
                      : "Not specified"}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Billing Tab */}
        <TabPanel value={tabValue} index={4}>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:items-center">
                <Typography variant="h6">Billing Information</Typography>

                <Button
                  variant="contained"
                  onClick={() =>
                    navigate("/billing", { state: { patientId: patient.id } })
                  }
                  className="w-full sm:w-auto"
                >
                  Create New Invoice
                </Button>
              </div>

              <Divider className="mb-4" />

              <Typography variant="body1" className="py-4 text-center">
                Billing and invoice history will be displayed here.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </div>
  );
};

export default PatientDetail;
