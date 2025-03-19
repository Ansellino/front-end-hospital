import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Person,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  LocalHospital as LocalHospitalIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Staff, WorkSchedule } from "../../interfaces/staff";
import * as staffService from "../../services/staffService";
import { useAuth } from "../../contexts/AuthContext";

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
      id={`staff-tabpanel-${index}`}
      aria-labelledby={`staff-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StaffDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await staffService.getStaffById(id);
        setStaff(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching staff data:", err);
        setError("Failed to load staff information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get role color based on role
  const getRoleColor = (role: string) => {
    switch (role) {
      case "doctor":
        return "primary";
      case "nurse":
        return "secondary";
      case "admin":
        return "info";
      case "receptionist":
        return "success";
      case "pharmacist":
        return "warning";
      default:
        return "default";
    }
  };

  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "on-leave":
        return "warning";
      default:
        return "default";
    }
  };

  // Format the work schedule for display
  const formatScheduleDay = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const formatScheduleTime = (timeStr: string): string => {
    try {
      // Handle ISO time strings or time-only strings
      const dateObj = timeStr.includes("T")
        ? new Date(timeStr)
        : new Date(`2023-01-01T${timeStr}`);

      return format(dateObj, "h:mm a");
    } catch (error) {
      return timeStr;
    }
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
          onClick={() => navigate("/staff")}
          sx={{ mt: 2 }}
        >
          Back to Staff Directory
        </Button>
      </Container>
    );
  }

  if (!staff) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Staff member not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/staff")}
          sx={{ mt: 2 }}
        >
          Back to Staff Directory
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
            onClick={() => navigate("/staff")}
            sx={{ mr: 2 }}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Staff Details
          </Typography>
        </Box>

        {hasPermission("edit:staff") && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/staff/${id}/edit`)}
          >
            Edit Staff
          </Button>
        )}
      </Box>

      {/* Staff summary card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: getRoleColor(staff.role) as any,
                }}
              >
                {staff.firstName[0]}
                {staff.lastName[0]}
              </Avatar>
            </Grid>
            <Grid item xs={12} sm>
              <Typography variant="h5">
                {staff.role === "doctor" ? "Dr. " : ""}
                {staff.firstName} {staff.lastName}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                <Chip
                  size="small"
                  label={
                    staff.role.charAt(0).toUpperCase() + staff.role.slice(1)
                  }
                  color={getRoleColor(staff.role) as any}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={staff.department}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={
                    staff.status.charAt(0).toUpperCase() +
                    staff.status.slice(1).replace("-", " ")
                  }
                  color={getStatusColor(staff.status) as any}
                />
                <Chip
                  size="small"
                  label={`ID: ${staff.id}`}
                  variant="outlined"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "flex-start", sm: "flex-end" },
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Joined: {format(new Date(staff.joinDate), "MMM d, yyyy")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated:{" "}
                  {format(new Date(staff.updatedAt), "MMM d, yyyy")}
                </Typography>
              </Box>
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
            aria-label="staff information tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<Person />}
              iconPosition="start"
              label="Personal Information"
            />
            <Tab
              icon={<WorkIcon />}
              iconPosition="start"
              label="Professional Details"
            />
            <Tab
              icon={<ScheduleIcon />}
              iconPosition="start"
              label="Schedule"
            />
            <Tab
              icon={<SchoolIcon />}
              iconPosition="start"
              label="Qualifications"
            />
            {staff.role === "doctor" && (
              <Tab
                icon={<LocalHospitalIcon />}
                iconPosition="start"
                label="Patients"
              />
            )}
            <Tab
              icon={<AssignmentIcon />}
              iconPosition="start"
              label="Documents"
            />
          </Tabs>
        </Box>

        {/* Personal Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  <ListItem>
                    <ListItemText primary="Email" secondary={staff.email} />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Phone"
                      secondary={staff.contactNumber}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Employment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  <ListItem>
                    <ListItemText
                      primary="Department"
                      secondary={staff.department}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Role"
                      secondary={
                        staff.role.charAt(0).toUpperCase() + staff.role.slice(1)
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={
                        staff.status.charAt(0).toUpperCase() +
                        staff.status.slice(1).replace("-", " ")
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Join Date"
                      secondary={format(
                        new Date(staff.joinDate),
                        "MMMM d, yyyy"
                      )}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Professional Details Tab */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Professional Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ListItem>
                  <ListItemText
                    primary="Department"
                    secondary={staff.department}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Role"
                    secondary={
                      staff.role.charAt(0).toUpperCase() + staff.role.slice(1)
                    }
                  />
                </ListItem>
                {staff.specialization && (
                  <ListItem>
                    <ListItemText
                      primary="Specialization"
                      secondary={staff.specialization}
                    />
                  </ListItem>
                )}
                {staff.role === "doctor" && (
                  <ListItem>
                    <ListItemText
                      primary="License Number"
                      secondary="LIC-12345678" // This would come from staff data in a real app
                    />
                  </ListItem>
                )}
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Schedule Tab */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Work Schedule
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {staff.workSchedule && staff.workSchedule.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Hours</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staff.workSchedule.map((schedule, index) => {
                      const startTime = new Date(
                        `2023-01-01T${schedule.startTime}`
                      );
                      const endTime = new Date(
                        `2023-01-01T${schedule.endTime}`
                      );
                      // Calculate hours (this is simplified)
                      const hours =
                        endTime.getHours() -
                        startTime.getHours() +
                        (endTime.getMinutes() - startTime.getMinutes()) / 60;

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {formatScheduleDay(schedule.day)}
                          </TableCell>
                          <TableCell>
                            {formatScheduleTime(schedule.startTime)}
                          </TableCell>
                          <TableCell>
                            {formatScheduleTime(schedule.endTime)}
                          </TableCell>
                          <TableCell>{hours.toFixed(1)} hrs</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No schedule information available
              </Typography>
            )}
          </Paper>
        </TabPanel>

        {/* Qualifications Tab */}
        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Education & Qualifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {staff.qualifications && staff.qualifications.length > 0 ? (
              <Grid container spacing={3}>
                {staff.qualifications.map((qualification, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {qualification.degree}
                      </Typography>
                      <Typography variant="body2">
                        {qualification.institution} • {qualification.year}
                      </Typography>
                      {qualification.certification && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Certification: {qualification.certification}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No qualification information available
              </Typography>
            )}
          </Paper>
        </TabPanel>

        {/* Patients Tab (only for doctors) */}
        {staff.role === "doctor" && (
          <TabPanel value={tabValue} index={4}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body1">
                Assigned patients will be displayed here.
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate("/patients")}
              >
                View All Patients
              </Button>
            </Paper>
          </TabPanel>
        )}

        {/* Documents Tab */}
        <TabPanel value={tabValue} index={staff.role === "doctor" ? 5 : 4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body1">
              Staff documents and forms will be displayed here.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} disabled>
              Upload New Document
            </Button>
          </Paper>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default StaffDetail;
