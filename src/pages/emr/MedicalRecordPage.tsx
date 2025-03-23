import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Card,
  CardContent,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FileCopy as FileCopyIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import {
  MedicalRecord,
  Diagnosis,
  PrescribedMedication,
  Procedure,
  Attachment,
} from "../../interfaces/emr";
import MedicalRecordService from "../../services/medicalRecordService";
import * as patientService from "../../services/patientService";
import * as staffService from "../../services/staffService";

// Tab panel interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`medical-record-tab-${index}`}
      aria-labelledby={`medical-record-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const MedicalRecordPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [doctor, setDoctor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Fetch the medical record and related data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch the medical record
        const recordData = await MedicalRecordService.getMedicalRecord(id);
        setRecord(recordData);

        // Fetch patient and doctor information
        const [patientData, doctorData] = await Promise.all([
          patientService.getPatientById(recordData.patientId),
          staffService.getStaffById(recordData.doctorId),
        ]);

        setPatient(patientData);
        setDoctor(doctorData);
        setError(null);
      } catch (err) {
        console.error("Error fetching medical record:", err);
        setError("Failed to load medical record data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/medical-records/edit/${id}`);
  };

  // Format BMI
  const calculateBMI = (height: number, weight: number): string => {
    if (!height || !weight) return "N/A";
    const bmi = weight / ((height / 100) * (height / 100));
    return bmi.toFixed(1);
  };

  // Handle print medical record
  const handlePrint = () => {
    window.print();
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/medical-records")}
        >
          Back to Medical Records
        </Button>
      </Container>
    );
  }

  // Show not found state
  if (!record) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Medical record not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/medical-records")}
          sx={{ mt: 2 }}
        >
          Back to Medical Records
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
            onClick={() => navigate("/medical-records")}
            sx={{ mr: 2 }}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Medical Record
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
          {hasPermission("edit:medical-records") && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Record
            </Button>
          )}
        </Box>
      </Box>

      {/* Record summary card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                Visit: {format(new Date(record.visitDate), "MMMM d, yyyy")}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Visit ID: {record.visitId}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "flex-start", md: "flex-end" },
                }}
              >
                <Typography variant="body2">
                  <strong>Patient:</strong>{" "}
                  {patient
                    ? `${patient.firstName} ${patient.lastName}`
                    : record.patientId}
                </Typography>
                <Typography variant="body2">
                  <strong>Doctor:</strong>{" "}
                  {doctor
                    ? `Dr. ${doctor.firstName} ${doctor.lastName}`
                    : record.doctorId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {format(new Date(record.createdAt), "MMM d, yyyy")}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Chief Complaint</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {record.chiefComplaint}
              </Typography>
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
            aria-label="medical record information tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Vital Signs" />
            <Tab label="Diagnosis" />
            <Tab label="Medications" />
            <Tab label="Procedures" />
            <Tab label="Notes" />
            <Tab label="Attachments" />
          </Tabs>
        </Box>

        {/* Vital Signs Tab */}
        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vital Signs
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Temperature
                </Typography>
                <Typography variant="h6">
                  {record.vitalSigns.temperature} °C
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Blood Pressure
                </Typography>
                <Typography variant="h6">
                  {record.vitalSigns.bloodPressureSystolic}/
                  {record.vitalSigns.bloodPressureDiastolic} mmHg
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Heart Rate
                </Typography>
                <Typography variant="h6">
                  {record.vitalSigns.heartRate} bpm
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Respiratory Rate
                </Typography>
                <Typography variant="h6">
                  {record.vitalSigns.respiratoryRate} breaths/min
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Oxygen Saturation
                </Typography>
                <Typography variant="h6">
                  {record.vitalSigns.oxygenSaturation}%
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Height
                </Typography>
                <Typography variant="h6">
                  {record.vitalSigns.height} cm
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Weight
                </Typography>
                <Typography variant="h6">
                  {record.vitalSigns.weight} kg
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  BMI
                </Typography>
                <Typography variant="h6">
                  {calculateBMI(
                    record.vitalSigns.height,
                    record.vitalSigns.weight
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Diagnosis Tab */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Diagnosis
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {record.diagnosis.length > 0 ? (
              <Grid container spacing={3}>
                {record.diagnosis.map((diagnosis: Diagnosis, index: number) => (
                  <Grid item xs={12} key={index}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderLeft: 4,
                        borderColor:
                          diagnosis.type === "primary"
                            ? "primary.main"
                            : "secondary.main",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {diagnosis.description}
                        </Typography>
                        <Chip
                          size="small"
                          label={diagnosis.type}
                          color={
                            diagnosis.type === "primary"
                              ? "primary"
                              : "secondary"
                          }
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>ICD Code:</strong> {diagnosis.code}
                      </Typography>
                      {diagnosis.notes && (
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, fontStyle: "italic" }}
                        >
                          <strong>Notes:</strong> {diagnosis.notes}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                No diagnoses recorded
              </Typography>
            )}
          </Paper>
        </TabPanel>

        {/* Medications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Prescribed Medications
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {record.treatment.medications.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Medication</TableCell>
                      <TableCell>Dosage</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Refills</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {record.treatment.medications.map(
                      (med: PrescribedMedication, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{med.name}</TableCell>
                          <TableCell>{med.dosage}</TableCell>
                          <TableCell>{med.frequency}</TableCell>
                          <TableCell>{med.duration}</TableCell>
                          <TableCell>{med.quantity}</TableCell>
                          <TableCell>{med.refills}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">
                No medications prescribed
              </Typography>
            )}

            {record.treatment.medications.length > 0 &&
              record.treatment.instructions && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1">
                    Medication Instructions
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {record.treatment.instructions}
                  </Typography>
                </Box>
              )}
          </Paper>
        </TabPanel>

        {/* Procedures Tab */}
        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Procedures
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {record.treatment.procedures.length > 0 ? (
              <Grid container spacing={3}>
                {record.treatment.procedures.map(
                  (procedure: Procedure, index: number) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {procedure.name}
                        </Typography>
                        {procedure.code && (
                          <Typography variant="body2" color="text.secondary">
                            Code: {procedure.code}
                          </Typography>
                        )}
                        {procedure.notes && (
                          <Typography
                            variant="body2"
                            sx={{ mt: 1, fontStyle: "italic" }}
                          >
                            Notes: {procedure.notes}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  )
                )}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                No procedures performed
              </Typography>
            )}
          </Paper>
        </TabPanel>

        {/* Notes Tab */}
        <TabPanel value={tabValue} index={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Clinical Notes
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
              {record.notes || "No additional notes recorded"}
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Follow-up Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {record.followUpRecommended ? (
                <Box>
                  <Typography variant="subtitle1" color="warning.main">
                    Follow-up Recommended
                  </Typography>
                  {record.followUpDate && (
                    <Typography variant="body1">
                      Follow-up Date:{" "}
                      {format(new Date(record.followUpDate), "MMMM d, yyyy")}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body1">No follow-up required</Typography>
              )}
            </Box>
          </Paper>
        </TabPanel>

        {/* Attachments Tab */}
        <TabPanel value={tabValue} index={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Attachments
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {record.attachments.length > 0 ? (
              <Grid container spacing={3}>
                {record.attachments.map((attachment: Attachment) => (
                  <Grid item xs={12} sm={6} md={4} key={attachment.id}>
                    <Paper sx={{ p: 2, height: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          noWrap
                        >
                          {attachment.fileName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {attachment.fileType} •{" "}
                          {(attachment.fileSize / 1024).toFixed(1)} KB
                        </Typography>
                        <Typography variant="caption" sx={{ mt: 1 }}>
                          Uploaded on{" "}
                          {format(
                            new Date(attachment.uploadedOn),
                            "MMM d, yyyy"
                          )}
                        </Typography>
                        {attachment.description && (
                          <Typography
                            variant="body2"
                            sx={{ mt: 1, fontStyle: "italic" }}
                          >
                            {attachment.description}
                          </Typography>
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            href={attachment.url}
                            download={attachment.fileName}
                          >
                            Download
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<FileCopyIcon />}
                            component={Link}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary">
                No attachments added to this record
              </Typography>
            )}
          </Paper>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default MedicalRecordPage;
