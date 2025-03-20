import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Import your base theme
import baseTheme from "../theme";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize from localStorage or default to "light"
  const [themeMode, setThemeModeSetting] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem("themeMode") as ThemeMode;
    return savedMode || "light";
  });

  // Keep track of the actual mode (accounting for system preference)
  const [actualMode, setActualMode] = useState<"light" | "dark">("light");

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode]);

  // Listen for system theme preference changes if using "system" mode
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const determineTheme = () => {
      if (themeMode === "system") {
        setActualMode(mediaQuery.matches ? "dark" : "light");
      } else {
        setActualMode(themeMode as "light" | "dark");
      }
    };

    // Initial determination
    determineTheme();

    // Listen for changes
    const handler = () => determineTheme();
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, [themeMode]);

  // Create the actual MUI theme based on the mode
  const theme = React.useMemo(() => {
    // Create a theme with the appropriate mode
    const newTheme = createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        mode: actualMode,
        // Adjust background colors based on mode
        background: {
          default: actualMode === "light" ? "#f5f5f5" : "#121212",
          paper: actualMode === "light" ? "#ffffff" : "#1e1e1e",
        },
      },
    });

    return newTheme;
  }, [actualMode]);

  // Add dark mode class to document for Tailwind
  useEffect(() => {
    if (actualMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [actualMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeSetting(mode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
