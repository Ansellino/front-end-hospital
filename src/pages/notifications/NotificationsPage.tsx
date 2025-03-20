import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Box,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Alert,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  MedicalServices as MedicalServicesIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

// Define interfaces
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "appointment" | "system" | "patient" | "billing" | "staff";
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  actionUrl?: string;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch from your API
        // const response = await api.get('/notifications');
        // setNotifications(response.data);

        // For demo purposes, we'll use mock data
        const mockNotifications = generateMockNotifications(30);
        setNotifications(mockNotifications);
        setFilteredNotifications(mockNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Generate mock notifications for demo purposes
  const generateMockNotifications = (count: number): Notification[] => {
    const types: (
      | "appointment"
      | "system"
      | "patient"
      | "billing"
      | "staff"
    )[] = ["appointment", "system", "patient", "billing", "staff"];

    const mockData: Notification[] = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const isRead = Math.random() > 0.3; // 30% chance of being unread
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(date.getHours() - hoursAgo);

      let title = "";
      let message = "";
      let relatedId = "";
      let actionUrl = "";

      switch (type) {
        case "appointment":
          title = "Appointment Reminder";
          message = `You have an appointment scheduled ${
            daysAgo === 0 ? "today" : "tomorrow"
          }`;
          relatedId = ``;
          actionUrl = `/appointments/${relatedId}`;
          break;
        case "system":
          title = "System Update";
          message = "System maintenance scheduled for this weekend";
          break;
        case "patient":
          title = "New Patient Record";
          message = "A new patient has been registered in the system";
          relatedId = `p-${1000 + i}`;
          actionUrl = `/patients/${relatedId}`;
          break;
        case "billing":
          title = "Invoice Generated";
          message = "A new invoice has been generated for patient";
          relatedId = `inv-${1000 + i}`;
          actionUrl = `/billing/${relatedId}`;
          break;
        case "staff":
          title = "Staff Update";
          message = "Dr. Johnson has updated their availability";
          relatedId = `s-${1000 + i}`;
          actionUrl = `/staff/${relatedId}`;
          break;
      }

      mockData.push({
        id: `notif-${i}`,
        title,
        message,
        type,
        isRead,
        createdAt: date.toISOString(),
        relatedId,
        actionUrl,
      });
    }

    // Sort by date (newest first)
    return mockData.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...notifications];

    // Filter by tab
    if (tabValue === 1) {
      result = result.filter((item) => !item.isRead);
    } else if (tabValue === 2) {
      result = result.filter((item) => item.isRead);
    }

    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter((item) => item.type === typeFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.message.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(result);
  }, [notifications, typeFilter, searchQuery, tabValue]);

  const handleMarkAsRead = async (id: string) => {
    try {
      // In a real app, you would call your API
      // await api.put(`/notifications/${id}/read`);

      // Update local state
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError("Failed to update notification. Please try again.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // In a real app, you would call your API
      // await api.put('/notifications/mark-all-read');

      // Update local state
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      setError("Failed to update notifications. Please try again.");
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      // In a real app, you would call your API
      // await api.delete(`/notifications/${id}`);

      // Update local state
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification. Please try again.");
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTypeFilterChange = (event: any) => {
    setTypeFilter(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const navigateToSettings = () => {
    navigate("/settings");
  };

  // Determine the current page of notifications to display
  const currentNotifications = filteredNotifications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <EventIcon />;
      case "system":
        return <AnnouncementIcon />;
      case "patient":
        return <MedicalServicesIcon />;
      case "billing":
        return <ReceiptIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "#3f51b5"; // Blue
      case "system":
        return "#ff9800"; // Orange
      case "patient":
        return "#4caf50"; // Green
      case "billing":
        return "#f44336"; // Red
      case "staff":
        return "#9c27b0"; // Purple
      default:
        return "#757575"; // Gray
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "appointment":
        return "Appointment";
      case "system":
        return "System";
      case "patient":
        return "Patient";
      case "billing":
        return "Billing";
      case "staff":
        return "Staff";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Notifications
        </Typography>
        <Box>
          {filteredNotifications.some((n) => !n.isRead) && (
            <Button
              variant="outlined"
              onClick={handleMarkAllAsRead}
              startIcon={<CheckCircleIcon />}
              sx={{ mr: 2 }}
            >
              Mark All as Read
            </Button>
          )}
          <Button variant="contained" onClick={navigateToSettings}>
            Notification Settings
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="notification tabs"
          >
            <Tab label="All" />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <span>Unread</span>
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <Chip
                      label={notifications.filter((n) => !n.isRead).length}
                      size="small"
                      color="primary"
                      sx={{ ml: 1, height: 20 }}
                    />
                  )}
                </Box>
              }
            />
            <Tab label="Read" />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search notifications"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="type-filter-label">Filter by Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  value={typeFilter}
                  label="Filter by Type"
                  onChange={handleTypeFilterChange}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="appointment">Appointments</MenuItem>
                  <MenuItem value="patient">Patients</MenuItem>
                  <MenuItem value="billing">Billing</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {filteredNotifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <NotificationsIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6">No notifications found</Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery || typeFilter !== "all"
              ? "Try adjusting your filters to see more results"
              : "You have no notifications at this time"}
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List sx={{ width: "100%" }}>
            {currentNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    backgroundColor: notification.isRead
                      ? "inherit"
                      : "rgba(63, 81, 181, 0.05)",
                    transition: "background-color 0.3s",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                  secondaryAction={
                    <Box>
                      {!notification.isRead && (
                        <IconButton
                          edge="end"
                          aria-label="mark as read"
                          onClick={() => handleMarkAsRead(notification.id)}
                          sx={{ mr: 1 }}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{ bgcolor: getNotificationColor(notification.type) }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          component="span"
                          variant="body1"
                          fontWeight={notification.isRead ? 400 : 500}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={getNotificationTypeLabel(notification.type)}
                          size="small"
                          sx={{
                            ml: 1,
                            backgroundColor: getNotificationColor(
                              notification.type
                            ),
                            color: "white",
                            height: 20,
                            fontSize: "0.7rem",
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          sx={{ display: "block" }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {notification.message}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 1,
                          }}
                        >
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </Typography>
                          {notification.actionUrl && (
                            <Button
                              size="small"
                              onClick={() => navigate(notification.actionUrl!)}
                              variant="text"
                            >
                              View Details
                            </Button>
                          )}
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>

          {filteredNotifications.length > itemsPerPage && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <Pagination
                count={Math.ceil(filteredNotifications.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default NotificationsPage;
