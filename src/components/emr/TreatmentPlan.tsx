import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Button,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Tooltip,
  ListItem,
  List,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  FlagCircle as FlagCircleIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import * as patientService from "../../services/patientService";
import * as medicalRecordService from "../../services/medicalRecordService";

// Define interfaces for treatment plan data
interface TreatmentGoal {
  id: string;
  description: string;
  targetDate: Date | null;
  status: "pending" | "in-progress" | "achieved" | "discontinued";
  notes: string;
}

interface TreatmentActivity {
  id: string;
  type: "medication" | "therapy" | "exercise" | "diet" | "monitoring" | "other";
  description: string;
  frequency: string;
  duration: string;
  notes: string;
  isCompleted: boolean;
}

interface TreatmentPlanData {
  id?: string;
  patientId: string;
  medicalRecordId?: string;
  primaryDiagnosis: string;
  startDate: Date;
  endDate: Date | null;
  goals: TreatmentGoal[];
  activities: TreatmentActivity[];
  notes: string;
  status: "active" | "completed" | "discontinued";
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TreatmentPlanProps {
  patientId: string;
  medicalRecordId?: string;
  doctorId: string;
  onSave?: (plan: TreatmentPlanData) => void;
  existingPlan?: TreatmentPlanData;
  readOnly?: boolean;
}

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

const TreatmentPlan: React.FC<TreatmentPlanProps> = ({
  patientId,
  medicalRecordId,
  doctorId,
  onSave,
  existingPlan,
  readOnly = false,
}) => {
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for treatment plan data
  const [plan, setPlan] = useState<TreatmentPlanData>({
    patientId,
    medicalRecordId,
    primaryDiagnosis: "",
    startDate: new Date(),
    endDate: null,
    goals: [],
    activities: [],
    notes: "",
    status: "active",
    createdBy: doctorId,
  });

  // State for form inputs
  const [newGoal, setNewGoal] = useState<Omit<TreatmentGoal, "id">>({
    description: "",
    targetDate: null,
    status: "pending",
    notes: "",
  });

  const [newActivity, setNewActivity] = useState<Omit<TreatmentActivity, "id">>(
    {
      type: "medication",
      description: "",
      frequency: "",
      duration: "",
      notes: "",
      isCompleted: false,
    }
  );

  // Dialog state
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        const data = await patientService.getPatientById(patientId);
        setPatientInfo(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to load patient information");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // Initialize with existing plan if provided
  useEffect(() => {
    if (existingPlan) {
      setPlan({
        ...existingPlan,
        startDate: new Date(existingPlan.startDate),
        endDate: existingPlan.endDate ? new Date(existingPlan.endDate) : null,
      });
    }
  }, [existingPlan]);

  // Goal dialog handlers
  const handleOpenGoalDialog = (index?: number) => {
    if (index !== undefined) {
      // Use destructuring to remove the id property when setting the state
      const { id, ...goalWithoutId } = plan.goals[index];
      setNewGoal(goalWithoutId);
      setEditingIndex(index);
    } else {
      setNewGoal({
        description: "",
        targetDate: null,
        status: "pending",
        notes: "",
      });
      setEditingIndex(null);
    }
    setGoalDialogOpen(true);
  };

  const handleCloseGoalDialog = () => {
    setGoalDialogOpen(false);
  };

  const handleSaveGoal = () => {
    if (!newGoal.description) return;

    const goals = [...plan.goals];
    const goalToSave = { ...newGoal, id: generateId() };

    if (editingIndex !== null) {
      goalToSave.id = goals[editingIndex].id;
      goals[editingIndex] = goalToSave;
    } else {
      goals.push(goalToSave);
    }

    setPlan({ ...plan, goals });
    handleCloseGoalDialog();
  };

  // Activity dialog handlers
  const handleOpenActivityDialog = (index?: number) => {
    if (index !== undefined) {
      // Use destructuring to remove the id property
      const { id, ...activityWithoutId } = plan.activities[index];
      setNewActivity(activityWithoutId);
      setEditingIndex(index);
    } else {
      setNewActivity({
        type: "medication",
        description: "",
        frequency: "",
        duration: "",
        notes: "",
        isCompleted: false,
      });
      setEditingIndex(null);
    }
    setActivityDialogOpen(true);
  };

  const handleCloseActivityDialog = () => {
    setActivityDialogOpen(false);
  };

  const handleSaveActivity = () => {
    if (!newActivity.description) return;

    const activities = [...plan.activities];
    const activityToSave = { ...newActivity, id: generateId() };

    if (editingIndex !== null) {
      activityToSave.id = activities[editingIndex].id;
      activities[editingIndex] = activityToSave;
    } else {
      activities.push(activityToSave);
    }

    setPlan({ ...plan, activities });
    handleCloseActivityDialog();
  };

  // Delete handlers
  const handleDeleteGoal = (index: number) => {
    const goals = [...plan.goals];
    goals.splice(index, 1);
    setPlan({ ...plan, goals });
  };

  const handleDeleteActivity = (index: number) => {
    const activities = [...plan.activities];
    activities.splice(index, 1);
    setPlan({ ...plan, activities });
  };

  // Toggle activity completion
  const handleToggleActivityCompletion = (index: number) => {
    const activities = [...plan.activities];
    activities[index] = {
      ...activities[index],
      isCompleted: !activities[index].isCompleted,
    };
    setPlan({ ...plan, activities });
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPlan({ ...plan, [name]: value });
  };

  const handleStatusChange = (e: any) => {
    setPlan({ ...plan, status: e.target.value });
  };

  // Save the treatment plan
  const handleSavePlan = async () => {
    if (!plan.primaryDiagnosis) {
      setError("Primary diagnosis is required");
      return;
    }

    try {
      setSaveLoading(true);

      // In a real application, you would save the plan to the backend
      // const savedPlan = await medicalRecordService.saveTreatmentPlan(plan);

      // For now, we'll just simulate a successful save
      setTimeout(() => {
        if (onSave) {
          onSave(plan);
        }

        setSuccessMessage("Treatment plan saved successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
        setSaveLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error saving treatment plan:", err);
      setError("Failed to save treatment plan");
      setSaveLoading(false);
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "primary";
      case "completed":
        return "success";
      case "discontinued":
        return "error";
      case "pending":
        return "warning";
      case "in-progress":
        return "info";
      case "achieved":
        return "success";
      default:
        return "default";
    }
  };

  // Helper function to get activity type color
  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "medication":
        return "#3f51b5";
      case "therapy":
        return "#9c27b0";
      case "exercise":
        return "#4caf50";
      case "diet":
        return "#ff9800";
      case "monitoring":
        return "#2196f3";
      default:
        return "#757575";
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Treatment Plan Header */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5">
              <AssignmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Treatment Plan
            </Typography>
            <Chip
              label={plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              color={getStatusColor(plan.status) as any}
              variant="outlined"
            />
          </Box>

          {patientInfo && (
            <Box
              sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Typography variant="body1">
                <strong>Patient:</strong> {patientInfo.firstName}{" "}
                {patientInfo.lastName}
              </Typography>
              <Typography variant="body2">
                <strong>DOB:</strong>{" "}
                {format(new Date(patientInfo.dateOfBirth), "MMMM d, yyyy")}
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Primary Diagnosis"
                name="primaryDiagnosis"
                value={plan.primaryDiagnosis}
                onChange={handleInputChange}
                disabled={readOnly}
                required
                error={!plan.primaryDiagnosis}
                helperText={!plan.primaryDiagnosis ? "Required" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={plan.status}
                  label="Status"
                  onChange={handleStatusChange}
                  disabled={readOnly}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="discontinued">Discontinued</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={plan.startDate}
                onChange={(date) =>
                  date && setPlan({ ...plan, startDate: date })
                }
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date (if known)"
                value={plan.endDate}
                onChange={(date) => setPlan({ ...plan, endDate: date })}
                disabled={readOnly}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Treatment Goals Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">
              <FlagCircleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Treatment Goals
            </Typography>
            {!readOnly && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenGoalDialog()}
              >
                Add Goal
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />

          {plan.goals.length > 0 ? (
            <List>
              {plan.goals.map((goal, index) => (
                <Paper
                  key={goal.id}
                  variant="outlined"
                  sx={{ mb: 2, p: 2, position: "relative" }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={7}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {goal.description}
                      </Typography>
                      {goal.notes && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {goal.notes}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <Stack direction="column" spacing={1}>
                        {goal.targetDate && (
                          <Typography variant="body2">
                            <DateRangeIcon
                              sx={{
                                fontSize: 16,
                                mr: 0.5,
                                verticalAlign: "middle",
                              }}
                            />
                            Target:{" "}
                            {format(new Date(goal.targetDate), "MMM d, yyyy")}
                          </Typography>
                        )}
                        <Chip
                          size="small"
                          label={
                            goal.status.charAt(0).toUpperCase() +
                            goal.status.slice(1).replace("-", " ")
                          }
                          color={getStatusColor(goal.status) as any}
                        />
                      </Stack>
                    </Grid>
                  </Grid>

                  {!readOnly && (
                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenGoalDialog(index)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteGoal(index)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Paper>
              ))}
            </List>
          ) : (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", py: 3 }}
            >
              No treatment goals defined
            </Typography>
          )}
        </Paper>

        {/* Treatment Activities Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">
              <AccessTimeIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Treatment Activities
            </Typography>
            {!readOnly && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenActivityDialog()}
              >
                Add Activity
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />

          {plan.activities.length > 0 ? (
            <List>
              {plan.activities.map((activity, index) => (
                <Paper
                  key={activity.id}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    p: 2,
                    position: "relative",
                    opacity: activity.isCompleted ? 0.7 : 1,
                    textDecoration: activity.isCompleted
                      ? "line-through"
                      : "none",
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={7}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={
                            activity.type.charAt(0).toUpperCase() +
                            activity.type.slice(1)
                          }
                          size="small"
                          sx={{
                            backgroundColor: getActivityTypeColor(
                              activity.type
                            ),
                            color: "#fff",
                            minWidth: 80,
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {activity.description}
                          </Typography>
                          {activity.notes && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1 }}
                            >
                              {activity.notes}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <Stack direction="column" spacing={1}>
                        <Typography variant="body2">
                          <strong>Frequency:</strong> {activity.frequency}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Duration:</strong> {activity.duration}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>

                  {!readOnly && (
                    <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleActivityCompletion(index)}
                        color={activity.isCompleted ? "success" : "default"}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenActivityDialog(index)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteActivity(index)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Paper>
              ))}
            </List>
          ) : (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", py: 3 }}
            >
              No treatment activities defined
            </Typography>
          )}
        </Paper>

        {/* Notes Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Notes
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <TextField
            fullWidth
            multiline
            rows={4}
            name="notes"
            value={plan.notes}
            onChange={handleInputChange}
            disabled={readOnly}
            placeholder="Enter any additional notes, instructions, or considerations for this treatment plan..."
          />
        </Paper>

        {/* Save Button */}
        {!readOnly && (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSavePlan}
              disabled={saveLoading || !plan.primaryDiagnosis}
            >
              {saveLoading ? (
                <CircularProgress size={24} />
              ) : (
                "Save Treatment Plan"
              )}
            </Button>
          </Box>
        )}

        {/* Goal Dialog */}
        <Dialog
          open={goalDialogOpen}
          onClose={handleCloseGoalDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingIndex !== null ? "Edit Goal" : "Add New Goal"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Goal Description"
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                }
                sx={{ mb: 3 }}
                required
              />

              <DatePicker
                label="Target Date"
                value={newGoal.targetDate}
                onChange={(date) =>
                  setNewGoal({ ...newGoal, targetDate: date })
                }
                sx={{ mb: 3, width: "100%" }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newGoal.status}
                  label="Status"
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, status: e.target.value as any })
                  }
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="achieved">Achieved</MenuItem>
                  <MenuItem value="discontinued">Discontinued</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={newGoal.notes}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, notes: e.target.value })
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseGoalDialog}>Cancel</Button>
            <Button
              onClick={handleSaveGoal}
              variant="contained"
              disabled={!newGoal.description}
            >
              {editingIndex !== null ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Activity Dialog */}
        <Dialog
          open={activityDialogOpen}
          onClose={handleCloseActivityDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingIndex !== null ? "Edit Activity" : "Add New Activity"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Activity Type</InputLabel>
                <Select
                  value={newActivity.type}
                  label="Activity Type"
                  onChange={(e) =>
                    setNewActivity({
                      ...newActivity,
                      type: e.target.value as any,
                    })
                  }
                >
                  <MenuItem value="medication">Medication</MenuItem>
                  <MenuItem value="therapy">Therapy</MenuItem>
                  <MenuItem value="exercise">Exercise</MenuItem>
                  <MenuItem value="diet">Diet</MenuItem>
                  <MenuItem value="monitoring">Monitoring</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Description"
                value={newActivity.description}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    description: e.target.value,
                  })
                }
                sx={{ mb: 3 }}
                required
              />

              <TextField
                fullWidth
                label="Frequency"
                value={newActivity.frequency}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, frequency: e.target.value })
                }
                sx={{ mb: 3 }}
                placeholder="e.g., Twice daily, Every morning, 3 times per week"
              />

              <TextField
                fullWidth
                label="Duration"
                value={newActivity.duration}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, duration: e.target.value })
                }
                sx={{ mb: 3 }}
                placeholder="e.g., 2 weeks, 30 days, Until next visit"
              />

              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={newActivity.notes}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, notes: e.target.value })
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseActivityDialog}>Cancel</Button>
            <Button
              onClick={handleSaveActivity}
              variant="contained"
              disabled={!newActivity.description}
            >
              {editingIndex !== null ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TreatmentPlan;
