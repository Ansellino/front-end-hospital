import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] =
    useState<null | HTMLElement>(null);

  // Menu handling
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  // Logout handling
  const handleLogout = () => {
    logout();
    navigate("/login");
    handleMenuClose();
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Mobile menu button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* App title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Healthcare Management System
        </Typography>

        {/* Notification icon */}
        <Box sx={{ display: "flex" }}>
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationsOpen}>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notificationsAnchorEl}
            open={Boolean(notificationsAnchorEl)}
            onClose={handleNotificationsClose}
            PaperProps={{
              style: {
                width: "350px",
              },
            }}
          >
            <MenuItem onClick={handleNotificationsClose}>
              <Typography variant="body2">
                New appointment scheduled for today
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Typography variant="body2">
                Dr. Smith requested patient records
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleNotificationsClose}>
              <Typography color="primary" align="center" sx={{ width: "100%" }}>
                View all notifications
              </Typography>
            </MenuItem>
          </Menu>

          {/* Help button */}
          <Tooltip title="Help">
            <IconButton color="inherit">
              <HelpIcon />
            </IconButton>
          </Tooltip>

          {/* User profile */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Account settings">
              <IconButton onClick={handleProfileMenuOpen} color="inherit">
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
                >
                  {currentUser?.email?.[0].toUpperCase() || "U"}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Typography
              variant="body2"
              sx={{ ml: 1, display: { xs: "none", sm: "block" } }}
            >
              {currentUser?.email}
            </Typography>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigate("/profile")}>
              <AccountCircle sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={() => navigate("/settings")}>
              <SettingsIcon sx={{ mr: 1 }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
