import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  MedicalServices as MedicalServicesIcon,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { Appointment } from "../../../interfaces/appointment";
import { statusColors, typeColors } from "../constants";
import api from "../../../services/api";

interface AppointmentDetailDialogProps {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

interface PatientDetails {
  id: string;
  firstName: string;
  lastName: string;
}

interface DoctorDetails {
  id: string;
  firstName: string;
  lastName: string;
}

const AppointmentDetailDialog: React.FC<AppointmentDetailDialogProps> = ({
  open,
  appointment,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Fetch additional patient and doctor details when appointment changes
  useEffect(() => {
    const fetchAdditionalDetails = async () => {
      if (!appointment) return;

      setLoading(true);
      try {
        // Fetch patient details
        try {
          const patientResponse = await api.get(
            `/patients/${appointment.patientId}`
          );
          setPatient({
            id: patientResponse.data.id,
            firstName: patientResponse.data.firstName,
            lastName: patientResponse.data.lastName,
          });
        } catch (error) {
          console.error("Error fetching patient details:", error);
          // Fallback for demo
          setPatient({
            id: appointment.patientId,
            firstName: "Demo",
            lastName: "Patient",
          });
        }

        // Fetch doctor details
        try {
          const doctorResponse = await api.get(
            `/staff/${appointment.doctorId}`
          );
          setDoctor({
            id: doctorResponse.data.id,
            firstName: doctorResponse.data.firstName,
            lastName: doctorResponse.data.lastName,
          });
        } catch (error) {
          console.error("Error fetching doctor details:", error);
          // Fallback for demo
          setDoctor({
            id: appointment.doctorId,
            firstName: "Dr.",
            lastName: "Provider",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (open && appointment) {
      fetchAdditionalDetails();
    } else {
      setPatient(null);
      setDoctor(null);
    }
  }, [appointment, open]);

  // Handle edit click
  const handleEdit = () => {
    if (appointment && onEdit) {
      onEdit(appointment.id);
    }
  };

  // Handle delete click
  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  // Confirm deletion
  const handleConfirmDelete = () => {
    if (appointment && onDelete) {
      onDelete(appointment.id);
      setDeleteConfirmOpen(false);
    }
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
  };

  if (!open || !appointment) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="appointment-detail-dialog-title"
      >
        <DialogTitle id="appointment-detail-dialog-title" sx={{ pr: 8 }}>
          Appointment Details
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Appointment Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {appointment.title}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={appointment.status}
                    size="small"
                    sx={{
                      bgcolor: statusColors[appointment.status] || "#ccc",
                      color: "white",
                    }}
                  />
                  <Chip
                    label={appointment.type}
                    size="small"
                    sx={{
                      bgcolor: typeColors[appointment.type] || "#ccc",
                      color: "white",
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Main appointment info */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <EventIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1">
                      {format(
                        parseISO(appointment.startTime),
                        "EEEE, MMMM d, yyyy"
                      )}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1">
                      {format(parseISO(appointment.startTime), "h:mm a")} -{" "}
                      {format(parseISO(appointment.endTime), "h:mm a")}
                    </Typography>
                  </Box>
                </Grid>

                {/* Patient Info */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="subtitle1">Patient</Typography>
                  </Box>
                  {patient ? (
                    <List dense disablePadding>
                      <ListItem disableGutters>
                        <ListItemText
                          primary={`${patient.firstName} ${patient.lastName}`}
                          secondary={`Patient ID: ${patient.id}`}
                        />
                      </ListItem>
                    </List>
                  ) : (
                    <Typography color="text.secondary">
                      Patient information not available
                    </Typography>
                  )}
                </Grid>

                {/* Doctor Info */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <MedicalServicesIcon
                      sx={{ mr: 1, color: "primary.main" }}
                    />
                    <Typography variant="subtitle1">Doctor</Typography>
                  </Box>
                  {doctor ? (
                    <List dense disablePadding>
                      <ListItem disableGutters>
                        <ListItemText
                          primary={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                          secondary={`Staff ID: ${doctor.id}`}
                        />
                      </ListItem>
                    </List>
                  ) : (
                    <Typography color="text.secondary">
                      Doctor information not available
                    </Typography>
                  )}
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Notes */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <AssignmentIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="subtitle1">Notes</Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    px: 1,
                    py: 2,
                    bgcolor: "background.default",
                    borderRadius: 1,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {appointment.notes ||
                    "No additional notes for this appointment."}
                </Typography>
              </Box>

              {/* Metadata */}
              <Box
                sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="caption" color="text.secondary">
                  Created:{" "}
                  {format(parseISO(appointment.createdAt), "MMM d, yyyy")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last Updated:{" "}
                  {format(parseISO(appointment.updatedAt), "MMM d, yyyy")}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
          <Box>
            {onDelete && (
              <Button
                onClick={handleDelete}
                color="error"
                startIcon={<DeleteIcon />}
                sx={{ mr: 1 }}
              >
                Delete
              </Button>
            )}
            {onEdit && (
              <Button
                onClick={handleEdit}
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-confirmation-dialog"
      >
        <DialogTitle id="delete-confirmation-dialog">
          Delete Appointment
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this appointment? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AppointmentDetailDialog;
