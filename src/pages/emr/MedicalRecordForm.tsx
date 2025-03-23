import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Chip,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import {
  MedicalRecord,
  VitalSigns as VitalSignsInterface,
  Diagnosis,
  Treatment,
  PrescribedMedication,
  Procedure,
  Attachment,
} from "../../interfaces/emr";
import MedicalRecordService from "../../services/medicalRecordService";
import * as patientService from "../../services/patientService";
import * as staffService from "../../services/staffService";
import DiagnosisForm from "../../components/emr/DiagnosisForm";
import PrescriptionWriter from "../../components/emr/PrescriptionWriter";
import VitalSigns from "../../components/emr/VitalSigns";

// Interface for tab panels
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component for tabbed content
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

// Default empty values
const initialVitalSigns: VitalSignsInterface = {
  temperature: 37.0,
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 80,
  heartRate: 72,
  respiratoryRate: 16,
  oxygenSaturation: 98,
  height: 170,
  weight: 70,
};

const initialTreatment: Treatment = {
  medications: [],
  procedures: [],
  instructions: "",
};

// Form validation schema
const validationSchema = Yup.object({
  patientId: Yup.string().required("Patient is required"),
  doctorId: Yup.string().required("Doctor is required"),
  visitDate: Yup.date().required("Visit date is required"),
  chiefComplaint: Yup.string().required("Chief complaint is required"),
  vitalSigns: Yup.object({
    temperature: Yup.number().required("Temperature is required"),
    bloodPressureSystolic: Yup.number().required("Systolic BP is required"),
    bloodPressureDiastolic: Yup.number().required("Diastolic BP is required"),
    heartRate: Yup.number().required("Heart rate is required"),
    respiratoryRate: Yup.number().required("Respiratory rate is required"),
    oxygenSaturation: Yup.number().required("Oxygen saturation is required"),
    height: Yup.number().required("Height is required"),
    weight: Yup.number().required("Weight is required"),
  }),
  notes: Yup.string(),
  followUpRecommended: Yup.boolean(),
  followUpDate: Yup.string().when("followUpRecommended", {
    is: true,
    then: (schema) => schema.required("Follow-up date is required"),
  }),
});

const MedicalRecordForm: React.FC = () => {
  // Hooks and state
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Medication state
  const [medications, setMedications] = useState<PrescribedMedication[]>([]);
  const [newMedication, setNewMedication] = useState<PrescribedMedication>({
    medicationId: "",
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: 0,
    refills: 0,
    instructions: "",
  });

  // Procedure state
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [newProcedure, setNewProcedure] = useState<Procedure>({
    code: "",
    name: "",
    notes: "",
  });

  // File upload state
  const [fileUploading, setFileUploading] = useState(false);

  // Determine if in edit mode
  const isEditMode = Boolean(id);
  const pageTitle = isEditMode ? "Edit Medical Record" : "New Medical Record";

  // Initialize form with default values
  const formik = useFormik({
    initialValues: {
      patientId: location.state?.patientId || "",
      doctorId: "",
      visitDate: new Date().toISOString(),
      chiefComplaint: "",
      vitalSigns: initialVitalSigns,
      treatment: initialTreatment,
      notes: "",
      followUpRecommended: false,
      followUpDate: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (
        !hasPermission(
          isEditMode ? "edit:medical-records" : "create:medical-records"
        )
      ) {
        setError("You don't have permission to perform this action");
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        const recordData = {
          ...values,
          visitId: `visit-${Date.now()}`, // Generate a unique visit ID
          diagnosis: diagnoses,
          treatment: {
            medications,
            procedures,
            instructions: values.treatment?.instructions || "",
          },
          attachments,
        };

        if (isEditMode && id) {
          await MedicalRecordService.updateMedicalRecord(id, recordData);
        } else {
          await MedicalRecordService.createMedicalRecord(recordData);
        }

        setSuccess(true);
        setTimeout(() => {
          navigate("/medical-records");
        }, 1500);
      } catch (err) {
        console.error("Error saving medical record:", err);
        setError("Failed to save medical record. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch data for the form
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch patients and doctors for dropdowns
        const [patientsData, doctorsData] = await Promise.all([
          patientService.getPatients(),
          staffService.getStaffByRole("doctor"),
        ]);

        setPatients(patientsData);
        setDoctors(doctorsData);

        // If editing, fetch the medical record
        if (isEditMode && id) {
          const record = await MedicalRecordService.getMedicalRecord(id);

          // Set form values
          formik.setValues({
            patientId: record.patientId,
            doctorId: record.doctorId,
            visitDate: record.visitDate,
            chiefComplaint: record.chiefComplaint,
            vitalSigns: record.vitalSigns,
            treatment: record.treatment,
            notes: record.notes,
            followUpRecommended: record.followUpRecommended,
            followUpDate: record.followUpRecommended
              ? record.followUpDate ?? ""
              : "",
          });

          // Set other state values
          setDiagnoses(record.diagnosis as Diagnosis[]);
          setMedications(record.treatment.medications);
          setProcedures(record.treatment.procedures);
          setAttachments(record.attachments);
        }
      } catch (err) {
        console.error("Error fetching form data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Helper functions for medications
  const handleAddMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      setMedications([
        ...medications,
        { ...newMedication, medicationId: `med-${Date.now()}` },
      ]);
      setNewMedication({
        medicationId: "",
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        quantity: 0,
        refills: 0,
        instructions: "",
      });
    }
  };

  const handleDeleteMedication = (index: number) => {
    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    setMedications(updatedMedications);
  };

  const handleUpdateMedications = (
    updatedMedications: PrescribedMedication[]
  ) => {
    setMedications(updatedMedications);
  };

  // Helper functions for procedures
  const handleAddProcedure = () => {
    if (newProcedure.name) {
      setProcedures([...procedures, { ...newProcedure }]);
      setNewProcedure({
        code: "",
        name: "",
        notes: "",
      });
    }
  };

  const handleDeleteProcedure = (index: number) => {
    const updatedProcedures = [...procedures];
    updatedProcedures.splice(index, 1);
    setProcedures(updatedProcedures);
  };

  // Handle diagnoses update from diagnosis form
  const handleDiagnosesUpdate = (updatedDiagnoses: Diagnosis[]) => {
    setDiagnoses(updatedDiagnoses);
  };

  // Handle file upload for attachments
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileUploading(true);

      try {
        // In a real app, you would upload the file to a server or storage service here
        // For this demo, we'll create a mock attachment
        const newAttachment: Attachment = {
          id: `att-${Date.now()}`,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedBy: "Current User", // Would use the current user's name in a real app
          uploadedOn: new Date().toISOString(),
          description: "",
          url: URL.createObjectURL(file), // In a real app, this would be the URL from your server
        };

        setAttachments([...attachments, newAttachment]);
      } catch (err) {
        console.error("Error uploading file:", err);
        setError("Failed to upload file. Please try again.");
      } finally {
        setFileUploading(false);
      }
    }
  };

  // Handle removing an attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((attachment) => attachment.id !== id));
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
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

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Medical record {isEditMode ? "updated" : "created"} successfully!
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          {/* Basic Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* Patient Selection */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={
                    formik.touched.patientId && Boolean(formik.errors.patientId)
                  }
                >
                  <InputLabel id="patient-label">Patient</InputLabel>
                  <Select
                    labelId="patient-label"
                    id="patientId"
                    name="patientId"
                    value={formik.values.patientId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Patient"
                    disabled={isEditMode || submitting}
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} (ID: {patient.id}
                        )
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.patientId && formik.errors.patientId && (
                    <FormHelperText>
                      {String(formik.errors.patientId)}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Doctor Selection */}
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={
                    formik.touched.doctorId && Boolean(formik.errors.doctorId)
                  }
                >
                  <InputLabel id="doctor-label">Doctor</InputLabel>
                  <Select
                    labelId="doctor-label"
                    id="doctorId"
                    name="doctorId"
                    value={formik.values.doctorId || ""} // Add fallback empty string
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Doctor"
                    disabled={submitting}
                  >
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName} (
                        {doctor.specialization})
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.doctorId && formik.errors.doctorId && (
                    <FormHelperText>{formik.errors.doctorId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Visit Date */}
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Visit Date"
                  value={new Date(formik.values.visitDate)}
                  onChange={(date) => {
                    if (date) {
                      formik.setFieldValue("visitDate", date.toISOString());
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.visitDate &&
                        Boolean(formik.errors.visitDate),
                      helperText:
                        formik.touched.visitDate && formik.errors.visitDate,
                      onBlur: formik.handleBlur,
                      name: "visitDate",
                    },
                  }}
                />
              </Grid>

              {/* Chief Complaint */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="chiefComplaint"
                  name="chiefComplaint"
                  label="Chief Complaint"
                  value={formik.values.chiefComplaint}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.chiefComplaint &&
                    Boolean(formik.errors.chiefComplaint)
                  }
                  helperText={
                    formik.touched.chiefComplaint &&
                    formik.errors.chiefComplaint
                  }
                  multiline
                  rows={2}
                  placeholder="Describe the patient's primary reason for visit"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Tabs for different sections */}
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="medical record sections"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Vital Signs" />
                <Tab label="Diagnosis" />
                <Tab label="Treatment" />
                <Tab label="Additional Notes" />
                <Tab label="Attachments" />
              </Tabs>
            </Box>

            {/* Vital Signs Tab */}
            <TabPanel value={tabValue} index={0}>
              <VitalSigns
                initialValues={formik.values.vitalSigns}
                onChange={(values) =>
                  formik.setFieldValue("vitalSigns", values)
                }
                onSave={() => {}}
                showCard={true}
              />
            </TabPanel>

            {/* Diagnosis Tab */}
            <TabPanel value={tabValue} index={1}>
              <DiagnosisForm
                initialDiagnoses={diagnoses}
                onSave={handleDiagnosesUpdate}
              />
            </TabPanel>

            {/* Treatment Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Medications
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <PrescriptionWriter
                patientId={formik.values.patientId}
                doctorId={formik.values.doctorId}
                existingPrescriptions={medications}
                onSave={handleUpdateMedications}
              />

              <Typography variant="h6" gutterBottom>
                Procedures
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Procedures List */}
              {procedures.length > 0 ? (
                <Box sx={{ mb: 3 }}>
                  {procedures.map((procedure, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 2,
                        border: "1px solid rgba(0, 0, 0, 0.12)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1">
                            {procedure.name}{" "}
                            {procedure.code && `(${procedure.code})`}
                          </Typography>
                          {procedure.notes && (
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, fontStyle: "italic" }}
                            >
                              Notes: {procedure.notes}
                            </Typography>
                          )}
                        </Box>
                        <IconButton
                          onClick={() => handleDeleteProcedure(index)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  No procedures added
                </Typography>
              )}

              {/* Add New Procedure Form */}
              <Paper sx={{ p: 2, mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Add Procedure
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Procedure Name"
                      value={newProcedure.name}
                      onChange={(e) =>
                        setNewProcedure({
                          ...newProcedure,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g., Blood Draw"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Procedure Code"
                      value={newProcedure.code}
                      onChange={(e) =>
                        setNewProcedure({
                          ...newProcedure,
                          code: e.target.value,
                        })
                      }
                      placeholder="e.g., 36415"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={2}
                      value={newProcedure.notes}
                      onChange={(e) =>
                        setNewProcedure({
                          ...newProcedure,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Additional notes about the procedure"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleAddProcedure}
                      startIcon={<AddIcon />}
                      disabled={!newProcedure.name}
                    >
                      Add Procedure
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* Treatment Instructions */}
              <Typography variant="h6" gutterBottom>
                Treatment Instructions
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <TextField
                fullWidth
                id="treatment.instructions"
                name="treatment.instructions"
                label="Treatment Instructions"
                multiline
                rows={4}
                value={formik.values.treatment?.instructions || ""}
                onChange={formik.handleChange}
                placeholder="Provide overall treatment instructions"
              />
            </TabPanel>

            {/* Additional Notes Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Clinical Notes"
                multiline
                rows={6}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
                placeholder="Add any additional notes about the patient's visit"
              />

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Follow-up
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.followUpRecommended}
                      onChange={(e) => {
                        formik.setFieldValue(
                          "followUpRecommended",
                          e.target.checked
                        );
                        if (!e.target.checked) {
                          formik.setFieldValue("followUpDate", undefined);
                        }
                      }}
                      name="followUpRecommended"
                    />
                  }
                  label="Follow-up Recommended"
                />

                {formik.values.followUpRecommended && (
                  <Box sx={{ mt: 2 }}>
                    <DatePicker
                      label="Follow-up Date"
                      value={
                        formik.values.followUpDate
                          ? new Date(formik.values.followUpDate)
                          : null
                      }
                      onChange={(date) => {
                        if (date) {
                          formik.setFieldValue(
                            "followUpDate",
                            date.toISOString()
                          );
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched.followUpDate &&
                            Boolean(formik.errors.followUpDate),
                          helperText:
                            formik.touched.followUpDate &&
                            formik.errors.followUpDate,
                          onBlur: formik.handleBlur,
                          name: "followUpDate",
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Attachments Tab */}
            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" gutterBottom>
                Attachments
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* File Upload */}
              <Box sx={{ mb: 3 }}>
                <input
                  accept="image/*, application/pdf, .doc, .docx, .xls, .xlsx"
                  style={{ display: "none" }}
                  id="attachment-upload"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={fileUploading}
                />
                <label htmlFor="attachment-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<AddIcon />}
                    disabled={fileUploading}
                  >
                    {fileUploading ? "Uploading..." : "Upload File"}
                  </Button>
                </label>
              </Box>

              {/* Attachments List */}
              {attachments.length > 0 ? (
                <Grid container spacing={2}>
                  {attachments.map((attachment) => (
                    <Grid item xs={12} sm={6} md={4} key={attachment.id}>
                      <Paper
                        sx={{
                          p: 2,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          sx={{ position: "absolute", top: 8, right: 8 }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                        <Typography variant="subtitle1" noWrap sx={{ mb: 1 }}>
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
                        <Box sx={{ flexGrow: 1 }} />
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No attachments added
                </Typography>
              )}
            </TabPanel>
          </Box>

          {/* Form Actions */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting ? <CircularProgress size={20} /> : <SaveIcon />
              }
            >
              {submitting
                ? "Saving..."
                : isEditMode
                ? "Update Medical Record"
                : "Create Medical Record"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default MedicalRecordForm;
