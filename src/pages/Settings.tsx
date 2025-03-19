import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Tabs,
  Tab,
  Divider,
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  CircularProgress,
} from "@mui/material";
import {
  Person,
  Notifications,
  Security,
  Palette,
  Visibility,
  VisibilityOff,
  Save,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Profile settings state
  const [profile, setProfile] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
  });

  // Security settings state
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    appointmentReminders: true,
    systemUpdates: true,
    newFeatures: false,
  });

  // Appearance settings state
  const [appearance, setAppearance] = useState({
    theme: "light",
    density: "comfortable",
    fontSize: "medium",
    highContrast: false,
  });

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Profile change handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // Security change handlers
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurity({
      ...security,
      [e.target.name]: e.target.value,
    });
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = (field: string) => {
    setSecurity({
      ...security,
      [field]: !security[field as keyof typeof security],
    });
  };

  // Notification change handlers
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked,
    });
  };

  // Appearance change handlers
  const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppearance({
      ...appearance,
      [e.target.name]: e.target.value,
    });
  };

  const handleAppearanceToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppearance({
      ...appearance,
      [e.target.name]: e.target.checked,
    });
  };

  // Save settings handler
  const handleSaveSettings = async () => {
    setLoading(true);

    try {
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would save to your API here
      // const response = await api.put('/settings', { profile, notifications, appearance });

      setSnackbar({
        open: true,
        message: "Settings saved successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setSnackbar({
        open: true,
        message: "Failed to save settings. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Change password handler
  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      setSnackbar({
        open: true,
        message: "New passwords don't match",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would call your API to change the password
      // const response = await api.put('/settings/password', {
      //   currentPassword: security.currentPassword,
      //   newPassword: security.newPassword
      // });

      setSecurity({
        ...security,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSnackbar({
        open: true,
        message: "Password changed successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      setSnackbar({
        open: true,
        message: "Failed to change password. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar handler
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Person />} iconPosition="start" label="Profile" />
            <Tab icon={<Security />} iconPosition="start" label="Security" />
            <Tab
              icon={<Notifications />}
              iconPosition="start"
              label="Notifications"
            />
            <Tab icon={<Palette />} iconPosition="start" label="Appearance" />
          </Tabs>
        </Box>

        {/* Profile Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={profile.firstName}
                onChange={handleProfileChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={profile.lastName}
                onChange={handleProfileChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                type="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Save />
                  }
                  onClick={handleSaveSettings}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Password & Security
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type={security.showCurrentPassword ? "text" : "password"}
                value={security.currentPassword}
                onChange={handleSecurityChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          handleTogglePasswordVisibility("showCurrentPassword")
                        }
                        edge="end"
                      >
                        {security.showCurrentPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type={security.showNewPassword ? "text" : "password"}
                value={security.newPassword}
                onChange={handleSecurityChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          handleTogglePasswordVisibility("showNewPassword")
                        }
                        edge="end"
                      >
                        {security.showNewPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={security.confirmPassword}
                onChange={handleSecurityChange}
                error={
                  security.newPassword !== security.confirmPassword &&
                  security.confirmPassword !== ""
                }
                helperText={
                  security.newPassword !== security.confirmPassword &&
                  security.confirmPassword !== ""
                    ? "Passwords don't match"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleChangePassword}
                  disabled={
                    loading ||
                    !security.currentPassword ||
                    !security.newPassword ||
                    !security.confirmPassword ||
                    security.newPassword !== security.confirmPassword
                  }
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Save />
                  }
                >
                  Update Password
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Notification Preferences
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Methods
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.email}
                    onChange={handleNotificationChange}
                    name="email"
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.sms}
                    onChange={handleNotificationChange}
                    name="sms"
                    color="primary"
                  />
                }
                label="SMS Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.push}
                    onChange={handleNotificationChange}
                    name="push"
                    color="primary"
                  />
                }
                label="Push Notifications"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Types
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.appointmentReminders}
                    onChange={handleNotificationChange}
                    name="appointmentReminders"
                    color="primary"
                  />
                }
                label="Appointment Reminders"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.systemUpdates}
                    onChange={handleNotificationChange}
                    name="systemUpdates"
                    color="primary"
                  />
                }
                label="System Updates"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.newFeatures}
                    onChange={handleNotificationChange}
                    name="newFeatures"
                    color="primary"
                  />
                }
                label="New Features & Services"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Save />
                  }
                  onClick={handleSaveSettings}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Appearance Settings */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Display Preferences
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Theme</FormLabel>
                <RadioGroup
                  name="theme"
                  value={appearance.theme}
                  onChange={handleAppearanceChange}
                >
                  <FormControlLabel
                    value="light"
                    control={<Radio />}
                    label="Light"
                  />
                  <FormControlLabel
                    value="dark"
                    control={<Radio />}
                    label="Dark"
                  />
                  <FormControlLabel
                    value="system"
                    control={<Radio />}
                    label="Use System Setting"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel>Text Size</FormLabel>
                <Select
                  name="fontSize"
                  value={appearance.fontSize}
                  onChange={(e) =>
                    setAppearance({ ...appearance, fontSize: e.target.value })
                  }
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel>Density</FormLabel>
                <Select
                  name="density"
                  value={appearance.density}
                  onChange={(e) =>
                    setAppearance({ ...appearance, density: e.target.value })
                  }
                >
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="comfortable">Comfortable</MenuItem>
                  <MenuItem value="spacious">Spacious</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={appearance.highContrast}
                    onChange={handleAppearanceToggle}
                    name="highContrast"
                    color="primary"
                  />
                }
                label="High Contrast Mode"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Save />
                  }
                  onClick={handleSaveSettings}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
