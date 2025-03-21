// layouts/MainLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../contexts/ThemeContext";

// Import the dark mode styles if not already imported
import "../styles/darkmode.css";

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const { themeMode } = useTheme(); // Access theme mode

  // Determine if dark mode is active based on theme mode
  const isDarkMode =
    themeMode === "dark" ||
    (themeMode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
      className={isDarkMode ? "dark" : ""} // Apply dark class directly
    >
      <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: 2,
            px: 2,
            mt: 8,
            ml: sidebarCollapsed ? 8 : 32,
            transition: (theme) => theme.transitions.create("margin-left"),
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
