import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
  IconButton,
  Chip,
  Tooltip,
  Tab,
  Tabs,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  ContentCopy as ContentCopyIcon,
  AccessTime as TimeIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  MedicalInformation as MedicalIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";

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
      id={`visit-notes-tabpanel-${index}`}
      aria-labelledby={`visit-notes-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// SOAP note structure (Subjective, Objective, Assessment, Plan)
interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// Template choices for quick insertion
const SOAP_TEMPLATES = [
  {
    name: "Basic SOAP Note",
    content: {
      subjective: "Patient reports...",
      objective: "Vital signs: \nPhysical examination: \nLaboratory results: ",
      assessment: "Impression: \nDiagnosis: ",
      plan: "Treatment: \nMedications: \nFollow-up: ",
    },
  },
  {
    name: "Follow-up Template",
    content: {
      subjective:
        "Patient returns for follow-up. Since last visit... \nCurrent symptoms: \nMedication compliance: ",
      objective:
        "Vital signs: \nPhysical examination: \nResponse to treatment: ",
      assessment: "Progress: \nCurrent status: ",
      plan: "Continue current treatment: \nAdjustments: \nNext appointment: ",
    },
  },
  {
    name: "Medication Review",
    content: {
      subjective:
        "Patient reports effects from medications: \nSide effects: \nConcerns: ",
      objective:
        "Current medications: \nVital signs: \nRelevant physical findings: ",
      assessment: "Medication efficacy: \nSide effect assessment: ",
      plan: "Medication adjustments: \nLaboratory monitoring: \nFollow-up timeline: ",
    },
  },
];

interface VisitNotesProps {
  patientId?: string;
  visitId?: string;
  doctorId?: string;
  onSave?: (notes: SOAPNote) => void;
  existingNotes?: SOAPNote;
  readOnly?: boolean;
}

const VisitNotes: React.FC<VisitNotesProps> = ({
  patientId,
  visitId,
  doctorId,
  onSave,
  existingNotes,
  readOnly = false,
}) => {
  // State for component
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [autoSave, setAutoSave] = useState<boolean>(true);

  // SOAP note state
  const [notes, setNotes] = useState<SOAPNote>({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  // Template menu state
  const [templateAnchorEl, setTemplateAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const templateMenuOpen = Boolean(templateAnchorEl);

  // Reference for printing
  const printRef = React.useRef<HTMLDivElement>(null);

  // Initialize with existing notes if provided
  useEffect(() => {
    if (existingNotes) {
      setNotes(existingNotes);
    }
  }, [existingNotes]);

  // Fetch patient and doctor information
  useEffect(() => {
    const fetchData = async () => {
      if (!patientId && !doctorId) return;

      try {
        setLoading(true);
        setError(null);

        // In a real implementation, these would fetch from your API
        if (patientId) {
          // Mock patient data for now
          setPatientInfo({
            id: patientId,
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1985-05-15",
            gender: "male",
            contactNumber: "(555) 123-4567",
            address: {
              street: "123 Main St",
              city: "Anytown",
              state: "ST",
              zipCode: "12345",
            },
          });
        }

        if (doctorId) {
          // Mock doctor data
          setDoctorInfo({
            id: doctorId,
            firstName: "Sarah",
            lastName: "Johnson",
            specialization: "Internal Medicine",
            licenseNumber: "MD12345678",
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load patient or doctor information");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, doctorId]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || readOnly) return;

    const timeoutId = setTimeout(() => {
      if (
        notes.subjective ||
        notes.objective ||
        notes.assessment ||
        notes.plan
      ) {
        handleSaveNotes(true);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timeoutId);
  }, [notes, autoSave]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle notes change
  const handleNotesChange = (field: keyof SOAPNote, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle saving notes
  const handleSaveNotes = (isAutoSave: boolean = false) => {
    if (onSave) {
      onSave(notes);
      if (!isAutoSave) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    }
  };

  // Handle printing
  const handlePrint = useReactToPrint({
    documentTitle: `Visit-Notes-${patientInfo?.lastName || "Patient"}-${format(
      new Date(),
      "yyyyMMdd"
    )}`,
    contentRef: printRef,
  });

  // Template menu handlers
  const handleTemplateMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setTemplateAnchorEl(event.currentTarget);
  };

  const handleTemplateMenuClose = () => {
    setTemplateAnchorEl(null);
  };

  const applyTemplate = (templateIndex: number) => {
    const template = SOAP_TEMPLATES[templateIndex];
    setNotes(template.content);
    handleTemplateMenuClose();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {savedSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Notes saved successfully!
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            <AssignmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Clinical Visit Notes
          </Typography>
          <Box>
            {!readOnly && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                    />
                  }
                  label="Auto-save"
                  sx={{ mr: 2 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleTemplateMenuOpen}
                  sx={{ mr: 2 }}
                >
                  Use Template
                </Button>
                <Menu
                  anchorEl={templateAnchorEl}
                  open={templateMenuOpen}
                  onClose={handleTemplateMenuClose}
                >
                  {SOAP_TEMPLATES.map((template, index) => (
                    <MenuItem key={index} onClick={() => applyTemplate(index)}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
            <Button
              startIcon={<PrintIcon />}
              onClick={(e) => handlePrint()} // Wrap in arrow function to match expected event handler type
              sx={{ mr: 1 }}
            >
              Print
            </Button>
            {!readOnly && (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveNotes()}
              >
                Save
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Patient and Visit Information */}
        {patientInfo && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "rgba(0, 0, 0, 0.03)",
              borderRadius: 1,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  <strong>Patient:</strong> {patientInfo.firstName}{" "}
                  {patientInfo.lastName}
                </Typography>
                <Typography variant="body2">
                  <strong>DOB:</strong>{" "}
                  {format(new Date(patientInfo.dateOfBirth), "MMM d, yyyy")}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { md: "right" } }}>
                <Typography variant="body2">
                  <strong>Date:</strong> {format(new Date(), "MMMM d, yyyy")}
                </Typography>
                {doctorInfo && (
                  <Typography variant="body2">
                    <strong>Provider:</strong> Dr. {doctorInfo.firstName}{" "}
                    {doctorInfo.lastName}
                  </Typography>
                )}
                {visitId && (
                  <Typography variant="body2">
                    <strong>Visit ID:</strong> {visitId}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* SOAP Notes Tabs */}
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="SOAP notes tabs"
              variant="fullWidth"
            >
              <Tab label="Subjective" />
              <Tab label="Objective" />
              <Tab label="Assessment" />
              <Tab label="Plan" />
              <Tab label="Complete Note" />
            </Tabs>
          </Box>

          {/* Subjective Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="subtitle1" gutterBottom>
              Patient's Subjective Experience
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Document the patient's symptoms, concerns, and history in their
              own words.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={notes.subjective}
              onChange={(e) => handleNotesChange("subjective", e.target.value)}
              placeholder="Chief complaint, history of present illness, review of systems, etc."
              disabled={readOnly}
            />
          </TabPanel>

          {/* Objective Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="subtitle1" gutterBottom>
              Objective Findings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Document your observations, examination findings, and test
              results.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={notes.objective}
              onChange={(e) => handleNotesChange("objective", e.target.value)}
              placeholder="Vital signs, physical examination findings, lab/imaging results, etc."
              disabled={readOnly}
            />
          </TabPanel>

          {/* Assessment Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="subtitle1" gutterBottom>
              Assessment
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Document your clinical assessment, diagnoses, and clinical
              reasoning.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={notes.assessment}
              onChange={(e) => handleNotesChange("assessment", e.target.value)}
              placeholder="Diagnoses, differential diagnoses, clinical impression, etc."
              disabled={readOnly}
            />
          </TabPanel>

          {/* Plan Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="subtitle1" gutterBottom>
              Treatment Plan
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Document your treatment recommendations and follow-up plans.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={notes.plan}
              onChange={(e) => handleNotesChange("plan", e.target.value)}
              placeholder="Medications, therapies, procedures, patient education, follow-up instructions, etc."
              disabled={readOnly}
            />
          </TabPanel>

          {/* Complete Note Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box ref={printRef} sx={{ p: 2 }}>
              {/* Header for printed version */}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Box>
                  <Typography variant="h5" gutterBottom>
                    <MedicalIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Clinical Visit Note
                  </Typography>
                  {patientInfo && (
                    <>
                      <Typography variant="body1">
                        <strong>Patient:</strong> {patientInfo.firstName}{" "}
                        {patientInfo.lastName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>DOB:</strong>{" "}
                        {format(
                          new Date(patientInfo.dateOfBirth),
                          "MMM d, yyyy"
                        )}
                      </Typography>
                    </>
                  )}
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body1">
                    <strong>Date:</strong> {format(new Date(), "MMMM d, yyyy")}
                  </Typography>
                  {doctorInfo && (
                    <>
                      <Typography variant="body2">
                        <strong>Provider:</strong> Dr. {doctorInfo.firstName}{" "}
                        {doctorInfo.lastName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Specialty:</strong> {doctorInfo.specialization}
                      </Typography>
                    </>
                  )}
                  {visitId && (
                    <Typography variant="body2">
                      <strong>Visit ID:</strong> {visitId}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Subjective Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                  Subjective
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {notes.subjective || "No subjective information recorded."}
                </Typography>
              </Box>

              {/* Objective Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                  Objective
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {notes.objective || "No objective findings recorded."}
                </Typography>
              </Box>

              {/* Assessment Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                  Assessment
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {notes.assessment || "No assessment recorded."}
                </Typography>
              </Box>

              {/* Plan Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                  Plan
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {notes.plan || "No treatment plan recorded."}
                </Typography>
              </Box>

              {/* Signature line for printed version */}
              <Box
                sx={{
                  mt: 6,
                  pt: 6,
                  borderTop: "1px dashed rgba(0, 0, 0, 0.12)",
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        borderTop: "1px solid black",
                        width: "80%",
                        mt: 4,
                        pt: 1,
                      }}
                    >
                      <Typography variant="body2">
                        Physician Signature
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        borderTop: "1px solid black",
                        width: "80%",
                        mt: 4,
                        pt: 1,
                      }}
                    >
                      <Typography variant="body2">Date</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </TabPanel>
        </Box>

        {/* Auto-save indicator */}
        {autoSave && !readOnly && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              <TimeIcon
                sx={{ fontSize: "inherit", mr: 0.5, verticalAlign: "middle" }}
              />
              Auto-saving enabled
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default VisitNotes;
