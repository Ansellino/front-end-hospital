import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Person,
  Favorite,
  Assignment,
  Timeline,
  LocalHospital,
  MedicalServices,
  Medication,
  Event,
  ArrowForward,
} from "@mui/icons-material";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import * as patientService from "../../services/patientService";
import MedicalRecordService from "../../services/medicalRecordService";
import { Patient } from "../../interfaces/patient";
import { MedicalRecord, VitalSigns } from "../../interfaces/emr";

interface PatientChartProps {
  patientId: string;
}

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
      id={`patient-chart-tab-${index}`}
      aria-labelledby={`patient-chart-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const PatientChart: React.FC<PatientChartProps> = ({ patientId }) => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [vitalSigns, setVitalSigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Calculate age from DOB
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

  // Format BMI value
  const calculateBMI = useCallback((height: number, weight: number): string => {
    if (!height || !weight) return "N/A";
    const bmi = weight / ((height / 100) * (height / 100));
    return bmi.toFixed(1);
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Navigate to medical record
  const handleViewRecord = (recordId: string) => {
    navigate(`/medical-records/${recordId}`);
  };

  // Fetch patient data and medical records
  useEffect(() => {
    // Move processVitalSigns inside useEffect to avoid dependency issues
    const processVitalSigns = (records: MedicalRecord[]) => {
      return records
        .sort(
          (a, b) =>
            new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
        )
        .map((record) => ({
          date: format(new Date(record.visitDate), "MMM d, yyyy"),
          temperature: record.vitalSigns.temperature,
          systolic: record.vitalSigns.bloodPressureSystolic,
          diastolic: record.vitalSigns.bloodPressureDiastolic,
          heartRate: record.vitalSigns.heartRate,
          oxygenSaturation: record.vitalSigns.oxygenSaturation,
          weight: record.vitalSigns.weight,
          bmi: calculateBMI(record.vitalSigns.height, record.vitalSigns.weight),
        }));
    };

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch patient info and medical records in parallel
        const [patientData, medicalRecordsData] = await Promise.all([
          patientService.getPatientById(patientId),
          MedicalRecordService.getPatientMedicalRecords(patientId),
        ]);

        setPatient(patientData);
        setMedicalRecords(medicalRecordsData);

        // Process vital signs for charts
        const processedVitalSigns = processVitalSigns(medicalRecordsData);
        setVitalSigns(processedVitalSigns);

        setError(null);
      } catch (err) {
        console.error("Error fetching patient chart data:", err);
        setError("Failed to load patient chart data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchData();
    }
  }, [patientId, calculateBMI]); // Add calculateBMI to dependencies

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
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  // Show not found state
  if (!patient) {
    return <Alert severity="warning">Patient not found</Alert>;
  }

  // Get the latest medical record
  const latestRecord =
    medicalRecords.length > 0
      ? medicalRecords.sort(
          (a, b) =>
            new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
        )[0]
      : null;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Patient Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
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
            <Grid item xs>
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
                  color={patient.gender === "male" ? "primary" : "secondary"}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={patient.insuranceInfo.provider}
                  variant="outlined"
                  icon={<LocalHospital fontSize="small" />}
                />
              </Box>
            </Grid>

            <Grid item>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" color="text.secondary">
                  Patient ID: {patient.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  DOB: {format(new Date(patient.dateOfBirth), "MMMM d, yyyy")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {patient.contactNumber}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Latest Vitals Snapshot */}
      {latestRecord && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6">
              Latest Vitals
              <Typography variant="caption" sx={{ ml: 1 }}>
                {format(new Date(latestRecord.visitDate), "MMM d, yyyy")}
              </Typography>
            </Typography>
            <Button
              size="small"
              onClick={() => handleViewRecord(latestRecord.id)}
              endIcon={<ArrowForward />}
            >
              View Full Record
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Temperature
                </Typography>
                <Typography variant="h6">
                  {latestRecord.vitalSigns.temperature}°C
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  BP
                </Typography>
                <Typography variant="h6">
                  {latestRecord.vitalSigns.bloodPressureSystolic}/
                  {latestRecord.vitalSigns.bloodPressureDiastolic}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Heart Rate
                </Typography>
                <Typography variant="h6">
                  {latestRecord.vitalSigns.heartRate} bpm
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  O₂ Sat
                </Typography>
                <Typography variant="h6">
                  {latestRecord.vitalSigns.oxygenSaturation}%
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Weight
                </Typography>
                <Typography variant="h6">
                  {latestRecord.vitalSigns.weight} kg
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  BMI
                </Typography>
                <Typography variant="h6">
                  {calculateBMI(
                    latestRecord.vitalSigns.height,
                    latestRecord.vitalSigns.weight
                  )}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Main Content Tabs */}
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="patient chart tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<Favorite />}
              iconPosition="start"
              label="Vital Trends"
            />
            <Tab
              icon={<Assignment />}
              iconPosition="start"
              label="Medical Records"
            />
            <Tab
              icon={<MedicalServices />}
              iconPosition="start"
              label="Diagnoses"
            />
            <Tab
              icon={<Medication />}
              iconPosition="start"
              label="Medications"
            />
            <Tab icon={<Event />} iconPosition="start" label="Follow-ups" />
          </Tabs>
        </Box>

        {/* Vital Trends Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Temperature Trend */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="subtitle1" gutterBottom>
                  Temperature (°C)
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={vitalSigns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[35, 40]} />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#e74c3c"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Blood Pressure Trend */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="subtitle1" gutterBottom>
                  Blood Pressure (mmHg)
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={vitalSigns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[40, 200]} />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="#3498db"
                      name="Systolic"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="#2ecc71"
                      name="Diastolic"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Heart Rate Trend */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="subtitle1" gutterBottom>
                  Heart Rate (bpm)
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={vitalSigns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[40, 180]} />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#9b59b6"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Oxygen Saturation Trend */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="subtitle1" gutterBottom>
                  Oxygen Saturation (%)
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={vitalSigns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[90, 100]} />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="oxygenSaturation"
                      stroke="#f1c40f"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Weight Trend */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="subtitle1" gutterBottom>
                  Weight (kg)
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={vitalSigns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#e67e22"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* BMI Trend */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="subtitle1" gutterBottom>
                  BMI
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={vitalSigns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[15, 40]} />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="bmi"
                      stroke="#16a085"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Medical Records Tab */}
        <TabPanel value={tabValue} index={1}>
          {medicalRecords.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Visit Date</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Chief Complaint</TableCell>
                    <TableCell>Primary Diagnosis</TableCell>
                    <TableCell>Follow-up</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicalRecords
                    .sort(
                      (a, b) =>
                        new Date(b.visitDate).getTime() -
                        new Date(a.visitDate).getTime()
                    )
                    .map((record) => {
                      const primaryDiagnosis = record.diagnosis.find(
                        (d) => d.type === "primary"
                      );

                      return (
                        <TableRow key={record.id} hover>
                          <TableCell>
                            {format(new Date(record.visitDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{record.doctorId}</TableCell>
                          <TableCell>
                            <Tooltip title={record.chiefComplaint}>
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 150,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {record.chiefComplaint}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {primaryDiagnosis ? (
                              <Chip
                                size="small"
                                label={primaryDiagnosis.description}
                                color="primary"
                                variant="outlined"
                              />
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {record.followUpRecommended ? (
                              <Chip
                                size="small"
                                label={
                                  record.followUpDate
                                    ? format(
                                        new Date(record.followUpDate),
                                        "MMM d, yyyy"
                                      )
                                    : "Required"
                                }
                                color="warning"
                              />
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleViewRecord(record.id)}
                              color="primary"
                            >
                              <ArrowForward />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No medical records found for this patient.
            </Alert>
          )}
        </TabPanel>

        {/* Diagnoses Tab */}
        <TabPanel value={tabValue} index={2}>
          {medicalRecords.length > 0 ? (
            <Grid container spacing={3}>
              {medicalRecords
                .sort(
                  (a, b) =>
                    new Date(b.visitDate).getTime() -
                    new Date(a.visitDate).getTime()
                )
                .flatMap((record) =>
                  record.diagnosis.map((diagnosis) => ({
                    diagnosis,
                    visitDate: record.visitDate,
                    recordId: record.id,
                  }))
                )
                .map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        borderLeft: 4,
                        borderColor:
                          item.diagnosis.type === "primary"
                            ? "primary.main"
                            : "secondary.main",
                      }}
                    >
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          size="small"
                          label={format(
                            new Date(item.visitDate),
                            "MMM d, yyyy"
                          )}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={item.diagnosis.type}
                          color={
                            item.diagnosis.type === "primary"
                              ? "primary"
                              : "secondary"
                          }
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Typography variant="subtitle1" gutterBottom>
                        {item.diagnosis.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ICD: {item.diagnosis.code}
                      </Typography>
                      {item.diagnosis.notes && (
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, fontStyle: "italic" }}
                        >
                          {item.diagnosis.notes}
                        </Typography>
                      )}
                      <Box sx={{ mt: 2, textAlign: "right" }}>
                        <Button
                          size="small"
                          onClick={() => handleViewRecord(item.recordId)}
                        >
                          View Record
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          ) : (
            <Alert severity="info">No diagnoses found for this patient.</Alert>
          )}
        </TabPanel>

        {/* Medications Tab */}
        <TabPanel value={tabValue} index={3}>
          {medicalRecords.length > 0 ? (
            <Grid container spacing={3}>
              {/* Current Medications from Patient Profile */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Current Medications
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {patient.medicalHistory.medications.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Medication</TableCell>
                          <TableCell>Dosage</TableCell>
                          <TableCell>Frequency</TableCell>
                          <TableCell>Start Date</TableCell>
                          <TableCell>End Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {patient.medicalHistory.medications.map(
                          (medication, index) => (
                            <TableRow key={index}>
                              <TableCell>{medication.name}</TableCell>
                              <TableCell>{medication.dosage}</TableCell>
                              <TableCell>{medication.frequency}</TableCell>
                              <TableCell>
                                {format(
                                  new Date(medication.startDate),
                                  "MMM d, yyyy"
                                )}
                              </TableCell>
                              <TableCell>
                                {medication.endDate
                                  ? format(
                                      new Date(medication.endDate),
                                      "MMM d, yyyy"
                                    )
                                  : "Ongoing"}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">
                    No current medications recorded in patient profile.
                  </Typography>
                )}
              </Grid>

              {/* Prescribed Medications from Medical Records */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Medication History (Prescriptions)
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {medicalRecords.flatMap((record) =>
                  record.treatment.medications.map((med) => ({
                    medication: med,
                    visitDate: record.visitDate,
                    recordId: record.id,
                  }))
                ).length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Medication</TableCell>
                          <TableCell>Dosage</TableCell>
                          <TableCell>Frequency</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {medicalRecords
                          .sort(
                            (a, b) =>
                              new Date(b.visitDate).getTime() -
                              new Date(a.visitDate).getTime()
                          )
                          .flatMap((record) =>
                            record.treatment.medications.map((med) => ({
                              medication: med,
                              visitDate: record.visitDate,
                              recordId: record.id,
                            }))
                          )
                          .map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {format(
                                  new Date(item.visitDate),
                                  "MMM d, yyyy"
                                )}
                              </TableCell>
                              <TableCell>{item.medication.name}</TableCell>
                              <TableCell>{item.medication.dosage}</TableCell>
                              <TableCell>{item.medication.frequency}</TableCell>
                              <TableCell>{item.medication.duration}</TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleViewRecord(item.recordId)
                                  }
                                  color="primary"
                                >
                                  <ArrowForward />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">
                    No prescribed medications found in medical records.
                  </Typography>
                )}
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">
              No medication records found for this patient.
            </Alert>
          )}
        </TabPanel>

        {/* Follow-ups Tab */}
        <TabPanel value={tabValue} index={4}>
          {medicalRecords.filter((record) => record.followUpRecommended)
            .length > 0 ? (
            <Grid container spacing={3}>
              {/* Upcoming Follow-ups */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Follow-ups
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <List>
                    {medicalRecords
                      .filter(
                        (record) =>
                          record.followUpRecommended &&
                          record.followUpDate &&
                          new Date(record.followUpDate) >= new Date()
                      )
                      .sort(
                        (a, b) =>
                          new Date(a.followUpDate!).getTime() -
                          new Date(b.followUpDate!).getTime()
                      )
                      .map((record) => (
                        <Paper
                          key={record.id}
                          variant="outlined"
                          sx={{ mb: 2, p: 2 }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="subtitle2" color="primary">
                                {format(
                                  new Date(record.followUpDate!),
                                  "MMMM d, yyyy"
                                )}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Original visit:{" "}
                                {format(
                                  new Date(record.visitDate),
                                  "MMM d, yyyy"
                                )}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              {record.diagnosis.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Diagnosis:</strong>{" "}
                                    {record.diagnosis[0].description}
                                  </Typography>
                                </Box>
                              )}
                              <Typography variant="body2" noWrap>
                                <strong>Reason:</strong> {record.chiefComplaint}
                              </Typography>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sm={2}
                              sx={{
                                display: "flex",
                                justifyContent: { sm: "flex-end" },
                                alignItems: "center",
                              }}
                            >
                              <Button
                                size="small"
                                onClick={() => handleViewRecord(record.id)}
                              >
                                Details
                              </Button>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}

                    {medicalRecords.filter(
                      (record) =>
                        record.followUpRecommended &&
                        record.followUpDate &&
                        new Date(record.followUpDate) >= new Date()
                    ).length === 0 && (
                      <Typography color="text.secondary">
                        No upcoming follow-ups scheduled.
                      </Typography>
                    )}
                  </List>
                </Paper>
              </Grid>

              {/* Past Follow-ups */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    Past Follow-ups
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <List>
                    {medicalRecords
                      .filter(
                        (record) =>
                          record.followUpRecommended &&
                          record.followUpDate &&
                          new Date(record.followUpDate) < new Date()
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.followUpDate!).getTime() -
                          new Date(a.followUpDate!).getTime()
                      )
                      .map((record) => (
                        <Paper
                          key={record.id}
                          variant="outlined"
                          sx={{ mb: 2, p: 2 }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                {format(
                                  new Date(record.followUpDate!),
                                  "MMMM d, yyyy"
                                )}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Original visit:{" "}
                                {format(
                                  new Date(record.visitDate),
                                  "MMM d, yyyy"
                                )}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              {record.diagnosis.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Diagnosis:</strong>{" "}
                                    {record.diagnosis[0].description}
                                  </Typography>
                                </Box>
                              )}
                              <Typography variant="body2" noWrap>
                                <strong>Reason:</strong> {record.chiefComplaint}
                              </Typography>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sm={2}
                              sx={{
                                display: "flex",
                                justifyContent: { sm: "flex-end" },
                                alignItems: "center",
                              }}
                            >
                              <Button
                                size="small"
                                onClick={() => handleViewRecord(record.id)}
                                variant="text"
                              >
                                Details
                              </Button>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}

                    {medicalRecords.filter(
                      (record) =>
                        record.followUpRecommended &&
                        record.followUpDate &&
                        new Date(record.followUpDate) < new Date()
                    ).length === 0 && (
                      <Typography color="text.secondary">
                        No past follow-ups found.
                      </Typography>
                    )}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">No follow-ups found for this patient.</Alert>
          )}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default PatientChart;
