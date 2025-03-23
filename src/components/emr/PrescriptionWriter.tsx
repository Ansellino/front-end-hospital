import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Autocomplete,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  LocalPharmacy as PharmacyIcon,
  MedicalServices as MedicalServicesIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { PrescribedMedication } from "../../interfaces/emr";
import * as patientService from "../../services/patientService";

// Common medication frequencies
const FREQUENCIES = [
  "Once daily",
  "Twice daily (BID)",
  "Three times daily (TID)",
  "Four times daily (QID)",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed (PRN)",
  "With meals",
  "Before meals",
  "After meals",
  "At bedtime",
];

// Common durations
const DURATIONS = [
  "3 days",
  "5 days",
  "7 days",
  "10 days",
  "14 days",
  "30 days",
  "60 days",
  "90 days",
  "6 months",
  "1 year",
  "Indefinitely",
];

// Common medications with dosage options
const COMMON_MEDICATIONS = [
  {
    id: "med1",
    name: "Amoxicillin",
    dosages: ["250mg", "500mg", "875mg"],
    category: "Antibiotic",
    interactions: ["Allopurinol", "Probenecid", "Warfarin"],
  },
  {
    id: "med2",
    name: "Lisinopril",
    dosages: ["5mg", "10mg", "20mg", "40mg"],
    category: "ACE Inhibitor",
    interactions: ["Potassium supplements", "NSAIDs", "Aliskiren"],
  },
  {
    id: "med3",
    name: "Atorvastatin",
    dosages: ["10mg", "20mg", "40mg", "80mg"],
    category: "Statin",
    interactions: ["Grapefruit juice", "Cyclosporine", "Clarithromycin"],
  },
  {
    id: "med4",
    name: "Metformin",
    dosages: ["500mg", "850mg", "1000mg"],
    category: "Antidiabetic",
    interactions: ["Alcohol", "Contrast dyes", "Cimetidine"],
  },
  {
    id: "med5",
    name: "Sertraline",
    dosages: ["25mg", "50mg", "100mg"],
    category: "SSRI",
    interactions: ["MAOIs", "NSAIDs", "Warfarin"],
  },
  {
    id: "med6",
    name: "Albuterol",
    dosages: ["90mcg/inh", "108mcg/inh"],
    category: "Bronchodilator",
    interactions: ["Beta-blockers", "Diuretics", "Digoxin"],
  },
  {
    id: "med7",
    name: "Prednisone",
    dosages: ["5mg", "10mg", "20mg", "50mg"],
    category: "Corticosteroid",
    interactions: ["NSAIDs", "Vaccines", "Warfarin"],
  },
  {
    id: "med8",
    name: "Levothyroxine",
    dosages: [
      "25mcg",
      "50mcg",
      "75mcg",
      "88mcg",
      "100mcg",
      "112mcg",
      "125mcg",
      "137mcg",
      "150mcg",
    ],
    category: "Thyroid Hormone",
    interactions: ["Calcium supplements", "Iron supplements", "Antacids"],
  },
  {
    id: "med9",
    name: "Hydrochlorothiazide",
    dosages: ["12.5mg", "25mg", "50mg"],
    category: "Diuretic",
    interactions: ["Lithium", "Digoxin", "NSAIDs"],
  },
  {
    id: "med10",
    name: "Omeprazole",
    dosages: ["10mg", "20mg", "40mg"],
    category: "Proton Pump Inhibitor",
    interactions: ["Clopidogrel", "Iron supplements", "Methotrexate"],
  },
];

interface PrescriptionWriterProps {
  patientId?: string;
  doctorId?: string;
  onSave?: (prescriptions: PrescribedMedication[]) => void;
  existingPrescriptions?: PrescribedMedication[];
  readOnly?: boolean;
}

const PrescriptionWriter: React.FC<PrescriptionWriterProps> = ({
  patientId,
  doctorId,
  onSave,
  existingPrescriptions = [],
  readOnly = false,
}) => {
  // State for component
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<PrescribedMedication[]>(
    existingPrescriptions
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // State for current prescription being edited
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [dosage, setDosage] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [refills, setRefills] = useState<number>(0);
  const [instructions, setInstructions] = useState<string>("");
  const [showInteraction, setShowInteraction] = useState<boolean>(false);

  // Reference for printing
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch patient and doctor information
  useEffect(() => {
    const fetchData = async () => {
      if (!patientId && !doctorId) return;

      try {
        setLoading(true);
        setError(null);

        if (patientId) {
          const patient = await patientService.getPatientById(patientId);
          setPatientInfo(patient);
        }

        if (doctorId) {
          // In a real implementation, fetch doctor data from staffService
          // For now, using mock data
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

  // Check for potential drug interactions
  useEffect(() => {
    if (selectedMedication && prescriptions.length > 0) {
      // Basic interaction check - in a real app, this would use a more sophisticated API
      const hasInteraction = prescriptions.some((prescription) =>
        selectedMedication.interactions?.some((interaction: string) =>
          prescription.name.toLowerCase().includes(interaction.toLowerCase())
        )
      );

      setShowInteraction(hasInteraction);
    } else {
      setShowInteraction(false);
    }
  }, [selectedMedication, prescriptions]);

  // Handle adding a prescription
  const handleAddPrescription = () => {
    if (!selectedMedication || !dosage || !frequency || !duration) return;

    const newPrescription: PrescribedMedication = {
      medicationId: selectedMedication.id,
      name: selectedMedication.name,
      dosage,
      frequency,
      duration,
      quantity,
      refills,
      instructions,
    };

    setPrescriptions([...prescriptions, newPrescription]);

    // Reset form
    setSelectedMedication(null);
    setDosage("");
    setFrequency("");
    setDuration("");
    setQuantity(0);
    setRefills(0);
    setInstructions("");
    setShowInteraction(false);
  };

  // Handle deleting a prescription
  const handleDeletePrescription = (index: number) => {
    const updatedPrescriptions = [...prescriptions];
    updatedPrescriptions.splice(index, 1);
    setPrescriptions(updatedPrescriptions);
  };

  // Handle saving prescriptions
  const handleSavePrescriptions = () => {
    if (onSave) {
      onSave(prescriptions);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  // Handle printing
  const handlePrint = useReactToPrint({
    documentTitle: `Prescription-${patientInfo?.lastName || "Patient"}-${format(
      new Date(),
      "yyyyMMdd"
    )}`,
    contentRef: printRef,
  });

  // Handle medication selection
  const handleMedicationSelect = (medication: any) => {
    setSelectedMedication(medication);
    if (medication?.dosages && medication.dosages.length > 0) {
      setDosage(medication.dosages[0]);
    } else {
      setDosage("");
    }
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
          Prescriptions saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Prescription Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Write Prescription
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Medication selection */}
            <Autocomplete
              options={COMMON_MEDICATIONS}
              getOptionLabel={(option) => option.name || ""}
              onChange={(_, value) => handleMedicationSelect(value)}
              value={selectedMedication}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Medication"
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                  required
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PharmacyIcon fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.category}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
              disabled={readOnly}
            />

            {/* Show interaction warning */}
            {showInteraction && (
              <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
                Potential drug interaction detected! Review patient's current
                medications.
              </Alert>
            )}

            {/* Dosage selection */}
            {selectedMedication && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="dosage-label">Dosage</InputLabel>
                <Select
                  labelId="dosage-label"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  label="Dosage"
                  required
                  disabled={readOnly}
                >
                  {selectedMedication.dosages?.map((dose: string) => (
                    <MenuItem key={dose} value={dose}>
                      {dose}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Frequency selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="frequency-label">Frequency</InputLabel>
              <Select
                labelId="frequency-label"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                label="Frequency"
                required
                disabled={readOnly}
              >
                {FREQUENCIES.map((freq) => (
                  <MenuItem key={freq} value={freq}>
                    {freq}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Duration selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="duration-label">Duration</InputLabel>
              <Select
                labelId="duration-label"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                label="Duration"
                required
                disabled={readOnly}
              >
                {DURATIONS.map((dur) => (
                  <MenuItem key={dur} value={dur}>
                    {dur}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Quantity and refills */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  label="Quantity"
                  type="number"
                  fullWidth
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                  disabled={readOnly}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Refills"
                  type="number"
                  fullWidth
                  value={refills}
                  onChange={(e) => setRefills(parseInt(e.target.value) || 0)}
                  inputProps={{ min: 0 }}
                  disabled={readOnly}
                />
              </Grid>
            </Grid>

            {/* Instructions */}
            <TextField
              label="Special Instructions"
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 3 }}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Special instructions for patient"
              disabled={readOnly}
            />

            {/* Add button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              onClick={handleAddPrescription}
              disabled={
                !selectedMedication ||
                !dosage ||
                !frequency ||
                !duration ||
                readOnly
              }
            >
              Add to Prescription
            </Button>
          </Paper>
        </Grid>

        {/* Prescription Preview */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Prescription</Typography>
              <Box>
                <Button
                  startIcon={<PrintIcon />}
                  onClick={(e) => handlePrint()}
                  disabled={prescriptions.length === 0}
                  sx={{ mr: 1 }}
                >
                  Print
                </Button>
                {!readOnly && onSave && (
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSavePrescriptions}
                    disabled={prescriptions.length === 0}
                  >
                    Save
                  </Button>
                )}
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Printable prescription area */}
            <Box ref={printRef} sx={{ p: 2, minHeight: 400 }}>
              {/* Prescription header */}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Box>
                  <Typography variant="h5" gutterBottom>
                    <MedicalServicesIcon
                      sx={{ mr: 1, verticalAlign: "middle" }}
                    />
                    Healthcare Management System
                  </Typography>
                  <Typography variant="body2">
                    123 Medical Center Drive
                  </Typography>
                  <Typography variant="body2">Anytown, ST 12345</Typography>
                  <Typography variant="body2">Phone: (555) 123-4567</Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2">
                    <strong>Date:</strong> {format(new Date(), "MMMM d, yyyy")}
                  </Typography>
                  {doctorInfo && (
                    <>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>
                          Dr. {doctorInfo.firstName} {doctorInfo.lastName}
                        </strong>
                      </Typography>
                      <Typography variant="body2">
                        {doctorInfo.specialization}
                      </Typography>
                      <Typography variant="body2">
                        License: {doctorInfo.licenseNumber}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              {/* Patient information */}
              {patientInfo && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(0, 0, 0, 0.03)",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1">
                    <strong>Patient:</strong> {patientInfo.firstName}{" "}
                    {patientInfo.lastName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>DOB:</strong>{" "}
                    {format(new Date(patientInfo.dateOfBirth), "MMM d, yyyy")}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong> {patientInfo.address?.street},{" "}
                    {patientInfo.address?.city}, {patientInfo.address?.state}{" "}
                    {patientInfo.address?.zipCode}
                  </Typography>
                </Box>
              )}

              {/* Rx Symbol */}
              <Typography
                variant="h5"
                sx={{ mb: 3, fontFamily: "serif", fontStyle: "italic" }}
              >
                Rx
              </Typography>

              {/* Prescriptions list */}
              {prescriptions.length > 0 ? (
                <Box>
                  {prescriptions.map((prescription, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      variant="outlined"
                      sx={{ p: 2, mb: 2, position: "relative" }}
                    >
                      {!readOnly && (
                        <IconButton
                          size="small"
                          color="error"
                          sx={{ position: "absolute", top: 8, right: 8 }}
                          onClick={() => handleDeletePrescription(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}

                      <Typography variant="subtitle1" gutterBottom>
                        <strong>{prescription.name}</strong>{" "}
                        {prescription.dosage}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Take:</strong> {prescription.frequency}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>For:</strong> {prescription.duration}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Dispense:</strong> {prescription.quantity}{" "}
                            units
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Refills:</strong> {prescription.refills}
                          </Typography>
                        </Grid>

                        {prescription.instructions && (
                          <Grid item xs={12}>
                            <Typography
                              variant="body2"
                              sx={{ fontStyle: "italic" }}
                            >
                              <strong>Special Instructions:</strong>{" "}
                              {prescription.instructions}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary">
                    No medications added to this prescription yet.
                  </Typography>
                </Box>
              )}

              {/* Signature line */}
              {prescriptions.length > 0 && (
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
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PrescriptionWriter;
