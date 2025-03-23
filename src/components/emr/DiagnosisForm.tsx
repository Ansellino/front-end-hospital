import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Typography,
  Divider,
  Grid,
  IconButton,
  Chip,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Diagnosis } from "../../interfaces/emr";

// Common ICD-10 codes for quick selection
const COMMON_ICD_CODES = [
  { code: "J03.9", description: "Acute tonsillitis, unspecified" },
  { code: "J40", description: "Bronchitis, not specified as acute or chronic" },
  { code: "I10", description: "Essential (primary) hypertension" },
  {
    code: "E11.9",
    description: "Type 2 diabetes mellitus without complications",
  },
  { code: "M54.5", description: "Low back pain" },
  { code: "J45.909", description: "Unspecified asthma, uncomplicated" },
  { code: "N39.0", description: "Urinary tract infection, site not specified" },
  { code: "B34.9", description: "Viral infection, unspecified" },
  { code: "K29.70", description: "Gastritis, unspecified, without bleeding" },
  { code: "R51", description: "Headache" },
];

interface DiagnosisFormProps {
  initialDiagnoses?: Diagnosis[];
  onSave: (diagnoses: Diagnosis[]) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

const validationSchema = Yup.object({
  code: Yup.string().required("ICD code is required"),
  description: Yup.string().required("Description is required"),
  type: Yup.string()
    .oneOf(["primary", "secondary"], "Invalid diagnosis type")
    .required("Type is required"),
  notes: Yup.string(),
});

const DiagnosisForm: React.FC<DiagnosisFormProps> = ({
  initialDiagnoses = [],
  onSave,
  onCancel,
  readOnly = false,
}) => {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>(initialDiagnoses);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Initialize formik for diagnosis form
  const formik = useFormik({
    initialValues: {
      code: "",
      description: "",
      type: "primary",
      notes: "",
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      if (editIndex !== null) {
        // Update existing diagnosis
        const updatedDiagnoses = [...diagnoses];
        updatedDiagnoses[editIndex] = values as Diagnosis; // Add type assertion
        setDiagnoses(updatedDiagnoses);
        setEditIndex(null);
      } else {
        // Add new diagnosis
        setDiagnoses([...diagnoses, values as Diagnosis]); // Add type assertion
      }
      resetForm();
      setIsEditing(false);
    },
  });

  // Handle edit diagnosis
  const handleEditDiagnosis = (index: number) => {
    setEditIndex(index);
    setIsEditing(true);
    formik.setValues(diagnoses[index]);
  };

  // Handle delete diagnosis
  const handleDeleteDiagnosis = (index: number) => {
    const updatedDiagnoses = [...diagnoses];
    updatedDiagnoses.splice(index, 1);
    setDiagnoses(updatedDiagnoses);
  };

  // Handle cancel button
  const handleCancel = () => {
    formik.resetForm();
    setIsEditing(false);
    setEditIndex(null);
    if (onCancel) onCancel();
  };

  // Handle save diagnoses
  const handleSaveDiagnoses = () => {
    setLoading(true);
    try {
      onSave(diagnoses);
    } finally {
      setLoading(false);
    }
  };

  // Handle select ICD code from autocomplete
  const handleSelectIcdCode = (
    value: { code: string; description: string } | null
  ) => {
    if (value) {
      formik.setValues({
        ...formik.values,
        code: value.code,
        description: value.description,
      });
    }
  };

  return (
    <Box>
      {/* Diagnoses List */}
      {diagnoses.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Diagnoses
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {diagnoses.map((diagnosis, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                border: "1px solid rgba(0, 0, 0, 0.12)",
                bgcolor:
                  diagnosis.type === "primary"
                    ? "rgba(63, 81, 181, 0.08)"
                    : "inherit",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      {diagnosis.description}
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        diagnosis.type === "primary" ? "Primary" : "Secondary"
                      }
                      color={
                        diagnosis.type === "primary" ? "primary" : "default"
                      }
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    ICD Code: {diagnosis.code}
                  </Typography>
                  {diagnosis.notes && (
                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                      Notes: {diagnosis.notes}
                    </Typography>
                  )}
                </Box>
                {!readOnly && (
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditDiagnosis(index)}
                      color="primary"
                      aria-label="edit diagnosis"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteDiagnosis(index)}
                      color="error"
                      aria-label="delete diagnosis"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Paper>
          ))}
        </Paper>
      )}

      {/* Add/Edit Form */}
      {!readOnly && (isEditing || diagnoses.length === 0) && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {editIndex !== null ? "Edit Diagnosis" : "Add Diagnosis"}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={COMMON_ICD_CODES}
                  getOptionLabel={(option) =>
                    `${option.code} - ${option.description}`
                  }
                  onChange={(_, value) => handleSelectIcdCode(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select ICD-10 Code"
                      fullWidth
                      placeholder="Search for an ICD code or enter manually"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="code"
                  name="code"
                  label="ICD Code"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.code && Boolean(formik.errors.code)}
                  helperText={formik.touched.code && formik.errors.code}
                  placeholder="e.g., J03.9"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={formik.touched.type && Boolean(formik.errors.type)}
                >
                  <InputLabel id="diagnosis-type-label">
                    Diagnosis Type
                  </InputLabel>
                  <Select
                    labelId="diagnosis-type-label"
                    id="type"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    label="Diagnosis Type"
                  >
                    <MenuItem value="primary">Primary</MenuItem>
                    <MenuItem value="secondary">Secondary</MenuItem>
                  </Select>
                  {formik.touched.type && formik.errors.type && (
                    <FormHelperText>{formik.errors.type}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                  placeholder="e.g., Acute tonsillitis"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes"
                  multiline
                  rows={3}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.notes && Boolean(formik.errors.notes)}
                  helperText={formik.touched.notes && formik.errors.notes}
                  placeholder="Add any additional notes about this diagnosis"
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                  <Button variant="outlined" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained">
                    {editIndex !== null ? "Update" : "Add"} Diagnosis
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* Action Buttons */}
      {!readOnly && diagnoses.length > 0 && !isEditing && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setIsEditing(true)}
            variant="outlined"
          >
            Add Another Diagnosis
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveDiagnoses}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Save Diagnoses
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DiagnosisForm;
