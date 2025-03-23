import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Button,
  IconButton,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  MonitorHeart as MonitorHeartIcon,
} from "@mui/icons-material";
import { VitalSigns as VitalSignsInterface } from "../../interfaces/emr";

// Default vital sign values
const DEFAULT_VITAL_SIGNS: VitalSignsInterface = {
  temperature: 37.0,
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 80,
  heartRate: 72,
  respiratoryRate: 16,
  oxygenSaturation: 98,
  height: 170,
  weight: 70,
};

// Vital sign ranges for validation
const VITAL_SIGN_RANGES = {
  temperature: { min: 34, max: 42, step: 0.1, unit: "°C" },
  bloodPressureSystolic: { min: 70, max: 250, step: 1, unit: "mmHg" },
  bloodPressureDiastolic: { min: 40, max: 150, step: 1, unit: "mmHg" },
  heartRate: { min: 40, max: 200, step: 1, unit: "bpm" },
  respiratoryRate: { min: 8, max: 40, step: 1, unit: "breaths/min" },
  oxygenSaturation: { min: 70, max: 100, step: 1, unit: "%" },
  height: { min: 30, max: 250, step: 1, unit: "cm" },
  weight: { min: 1, max: 300, step: 0.1, unit: "kg" },
};

interface VitalSignsProps {
  initialValues?: VitalSignsInterface;
  readOnly?: boolean;
  onChange?: (vitalSigns: VitalSignsInterface) => void;
  onSave?: (vitalSigns: VitalSignsInterface) => void;
  showCard?: boolean;
  title?: string;
  loading?: boolean;
}

const VitalSigns: React.FC<VitalSignsProps> = ({
  initialValues = DEFAULT_VITAL_SIGNS,
  readOnly = false,
  onChange,
  onSave,
  showCard = false,
  title = "Vital Signs",
  loading = false,
}) => {
  const [vitalSigns, setVitalSigns] =
    useState<VitalSignsInterface>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Calculate BMI from height and weight
  const calculateBMI = useCallback((height: number, weight: number): string => {
    if (!height || !weight) return "N/A";
    const bmi = weight / ((height / 100) * (height / 100));
    return bmi.toFixed(1);
  }, []);

  // Update vital signs when initialValues changes
  useEffect(() => {
    setVitalSigns(initialValues);
  }, [initialValues]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);

    // Validate input
    const range = VITAL_SIGN_RANGES[name as keyof VitalSignsInterface];
    let error = "";

    if (isNaN(numericValue)) {
      error = "Please enter a valid number";
    } else if (
      range &&
      (numericValue < range.min || numericValue > range.max)
    ) {
      error = `Value must be between ${range.min} and ${range.max}`;
    }

    // Update errors
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    // Update vital signs
    const updatedVitalSigns = {
      ...vitalSigns,
      [name]: numericValue,
    };

    setVitalSigns(updatedVitalSigns);

    // Notify parent of changes if no errors
    if (!error && onChange) {
      onChange(updatedVitalSigns);
    }
  };

  // Handle save
  const handleSave = () => {
    // Check for any errors
    if (Object.values(errors).some((error) => error !== "")) {
      return;
    }

    if (onSave) {
      onSave(vitalSigns);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Handle reset to default values
  const handleReset = () => {
    setVitalSigns(initialValues);
    setErrors({});
  };

  // Render the vital signs content
  const renderContent = () => (
    <>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Vital signs saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Temperature */}
        <Grid item xs={12} sm={6} md={4}>
          {readOnly ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Temperature
              </Typography>
              <Typography variant="h6">
                {vitalSigns.temperature} {VITAL_SIGN_RANGES.temperature.unit}
              </Typography>
            </Box>
          ) : (
            <TextField
              fullWidth
              id="temperature"
              name="temperature"
              label={`Temperature (${VITAL_SIGN_RANGES.temperature.unit})`}
              type="number"
              InputProps={{
                inputProps: {
                  min: VITAL_SIGN_RANGES.temperature.min,
                  max: VITAL_SIGN_RANGES.temperature.max,
                  step: VITAL_SIGN_RANGES.temperature.step,
                },
              }}
              value={vitalSigns.temperature}
              onChange={handleInputChange}
              error={!!errors.temperature}
              helperText={errors.temperature}
              disabled={readOnly}
            />
          )}
        </Grid>

        {/* Blood Pressure - Systolic */}
        <Grid item xs={12} sm={6} md={4}>
          {readOnly ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Blood Pressure
              </Typography>
              <Typography variant="h6">
                {vitalSigns.bloodPressureSystolic}/
                {vitalSigns.bloodPressureDiastolic}{" "}
                {VITAL_SIGN_RANGES.bloodPressureSystolic.unit}
              </Typography>
            </Box>
          ) : (
            <TextField
              fullWidth
              id="bloodPressureSystolic"
              name="bloodPressureSystolic"
              label={`Blood Pressure (Systolic) (${VITAL_SIGN_RANGES.bloodPressureSystolic.unit})`}
              type="number"
              InputProps={{
                inputProps: {
                  min: VITAL_SIGN_RANGES.bloodPressureSystolic.min,
                  max: VITAL_SIGN_RANGES.bloodPressureSystolic.max,
                  step: VITAL_SIGN_RANGES.bloodPressureSystolic.step,
                },
              }}
              value={vitalSigns.bloodPressureSystolic}
              onChange={handleInputChange}
              error={!!errors.bloodPressureSystolic}
              helperText={errors.bloodPressureSystolic}
              disabled={readOnly}
            />
          )}
        </Grid>

        {/* Blood Pressure - Diastolic */}
        {!readOnly && (
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              id="bloodPressureDiastolic"
              name="bloodPressureDiastolic"
              label={`Blood Pressure (Diastolic) (${VITAL_SIGN_RANGES.bloodPressureDiastolic.unit})`}
              type="number"
              InputProps={{
                inputProps: {
                  min: VITAL_SIGN_RANGES.bloodPressureDiastolic.min,
                  max: VITAL_SIGN_RANGES.bloodPressureDiastolic.max,
                  step: VITAL_SIGN_RANGES.bloodPressureDiastolic.step,
                },
              }}
              value={vitalSigns.bloodPressureDiastolic}
              onChange={handleInputChange}
              error={!!errors.bloodPressureDiastolic}
              helperText={errors.bloodPressureDiastolic}
              disabled={readOnly}
            />
          </Grid>
        )}

        {/* Heart Rate */}
        <Grid item xs={12} sm={6} md={4}>
          {readOnly ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Heart Rate
              </Typography>
              <Typography variant="h6">
                {vitalSigns.heartRate} {VITAL_SIGN_RANGES.heartRate.unit}
              </Typography>
            </Box>
          ) : (
            <TextField
              fullWidth
              id="heartRate"
              name="heartRate"
              label={`Heart Rate (${VITAL_SIGN_RANGES.heartRate.unit})`}
              type="number"
              InputProps={{
                inputProps: {
                  min: VITAL_SIGN_RANGES.heartRate.min,
                  max: VITAL_SIGN_RANGES.heartRate.max,
                  step: VITAL_SIGN_RANGES.heartRate.step,
                },
              }}
              value={vitalSigns.heartRate}
              onChange={handleInputChange}
              error={!!errors.heartRate}
              helperText={errors.heartRate}
              disabled={readOnly}
            />
          )}
        </Grid>

        {/* Respiratory Rate */}
        <Grid item xs={12} sm={6} md={4}>
          {readOnly ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Respiratory Rate
              </Typography>
              <Typography variant="h6">
                {vitalSigns.respiratoryRate}{" "}
                {VITAL_SIGN_RANGES.respiratoryRate.unit}
              </Typography>
            </Box>
          ) : (
            <TextField
              fullWidth
              id="respiratoryRate"
              name="respiratoryRate"
              label={`Respiratory Rate (${VITAL_SIGN_RANGES.respiratoryRate.unit})`}
              type="number"
              InputProps={{
                inputProps: {
                  min: VITAL_SIGN_RANGES.respiratoryRate.min,
                  max: VITAL_SIGN_RANGES.respiratoryRate.max,
                  step: VITAL_SIGN_RANGES.respiratoryRate.step,
                },
              }}
              value={vitalSigns.respiratoryRate}
              onChange={handleInputChange}
              error={!!errors.respiratoryRate}
              helperText={errors.respiratoryRate}
              disabled={readOnly}
            />
          )}
        </Grid>

        {/* Oxygen Saturation */}
        <Grid item xs={12} sm={6} md={4}>
          {readOnly ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Oxygen Saturation
              </Typography>
              <Typography variant="h6">
                {vitalSigns.oxygenSaturation}{" "}
                {VITAL_SIGN_RANGES.oxygenSaturation.unit}
              </Typography>
            </Box>
          ) : (
            <TextField
              fullWidth
              id="oxygenSaturation"
              name="oxygenSaturation"
              label={`Oxygen Saturation (${VITAL_SIGN_RANGES.oxygenSaturation.unit})`}
              type="number"
              InputProps={{
                inputProps: {
                  min: VITAL_SIGN_RANGES.oxygenSaturation.min,
                  max: VITAL_SIGN_RANGES.oxygenSaturation.max,
                  step: VITAL_SIGN_RANGES.oxygenSaturation.step,
                },
              }}
              value={vitalSigns.oxygenSaturation}
              onChange={handleInputChange}
              error={!!errors.oxygenSaturation}
              helperText={errors.oxygenSaturation}
              disabled={readOnly}
            />
          )}
        </Grid>

        {/* Height */}
        <Grid item xs={12} sm={6} md={4}>
          {readOnly ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Height
              </Typography>
              <Typography variant="h6">
                {vitalSigns.height} {VITAL_SIGN_RANGES.height.unit}
              </Typography>
            </Box>
          ) : (
            <TextField
              fullWidth
              id="height"
              name="height"
              label={`Height (${VITAL_SIGN_RANGES.height.unit})`}
              type="number"
              InputProps={{
                inputProps: {
                  min: VITAL_SIGN_RANGES.height.min,
                  max: VITAL_SIGN_RANGES.height.max,
                  step: VITAL_SIGN_RANGES.height.step,
                },
              }}
              value={vitalSigns.height}
              onChange={handleInputChange}
              error={!!errors.height}
              helperText={errors.height}
              disabled={readOnly}
            />
          )}
        </Grid>

        {/* Weight */}
        <Grid item xs={12} sm={6} md={4}>
          {readOnly ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Weight
              </Typography>
              <Typography variant="h6">
                {vitalSigns.weight} {VITAL_SIGN_RANGES.weight.unit}
              </Typography>
            </Box>
          ) : (
            <TextField
              fullWidth
              id="weight"
              name="weight"
              label={`Weight (${VITAL_SIGN_RANGES.weight.unit})`}
              type="number"
              InputProps={{
                inputProps: {
                  min: VITAL_SIGN_RANGES.weight.min,
                  max: VITAL_SIGN_RANGES.weight.max,
                  step: VITAL_SIGN_RANGES.weight.step,
                },
              }}
              value={vitalSigns.weight}
              onChange={handleInputChange}
              error={!!errors.weight}
              helperText={errors.weight}
              disabled={readOnly}
            />
          )}
        </Grid>

        {/* BMI (calculated) */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            id="bmi"
            name="bmi"
            label="BMI"
            value={calculateBMI(vitalSigns.height, vitalSigns.weight)}
            InputProps={{ readOnly: true }}
            variant="filled"
          />
        </Grid>
      </Grid>

      {/* Action buttons for editable mode */}
      {!readOnly && onSave && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            sx={{ mr: 2 }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={Object.values(errors).some((error) => error !== "")}
          >
            Save Vital Signs
          </Button>
        </Box>
      )}
    </>
  );

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render with or without card container
  if (showCard) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <MonitorHeartIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {renderContent()}
        </CardContent>
      </Card>
    );
  }

  return renderContent();
};

export default VitalSigns;
