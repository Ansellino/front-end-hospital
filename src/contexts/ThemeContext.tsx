import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
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
        // Enhanced dark mode colors
        ...(actualMode === "dark" && {
          primary: {
            main: "#90caf9", // lighter blue for dark mode
            dark: "#64b5f6",
            light: "#bbdefb",
            contrastText: "#fff",
          },
          secondary: {
            main: "#f48fb1", // lighter pink for dark mode
            dark: "#f06292",
            light: "#f8bbd0",
            contrastText: "#fff",
          },
          background: {
            default: "#121212",
            paper: "#1e1e1e",
          },
          text: {
            primary: "#ffffff",
            secondary: "#e0e0e0",
          },
          action: {
            active: "#ffffff",
            hover: "rgba(255, 255, 255, 0.08)",
          },
        }),
        // Light mode colors remain the same
      },
      components: {
        ...baseTheme.components,
        // Override components for dark mode
        ...(actualMode === "dark" && {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: "#1e1e1e",
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: "#272727",
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: "#1a1a1a",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
              },
              head: {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            },
          },
          // Enhance chip styling for gender display
          MuiChip: {
            styleOverrides: {
              root: {
                color: "#ffffff",
                "&.MuiChip-outlined": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&.MuiChip-colorPrimary": {
                  color: "#90caf9",
                  borderColor: "#90caf9",
                },
                "&.MuiChip-colorSecondary": {
                  color: "#f48fb1",
                  borderColor: "#f48fb1",
                },
              },
            },
          },
          // Enhance typography for better readability
          MuiTypography: {
            styleOverrides: {
              h5: {
                color: "#ffffff",
                fontWeight: 500,
              },
              body1: {
                color: "#e0e0e0",
              },
              body2: {
                color: "#e0e0e0",
              },
            },
          },
        }),
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
