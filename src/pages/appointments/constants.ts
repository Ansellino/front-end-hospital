// Updated type definition to accept hex color strings
export type ColorValue = string;

// Direct hex color mappings for status
export const statusColors: Record<string, ColorValue> = {
  scheduled: "#3f51b5", // Blue
  completed: "#4caf50", // Green
  canceled: "#f44336", // Red
  "no-show": "#ff9800", // Orange
};

// Direct hex color mappings for appointment types
export const typeColors: Record<string, ColorValue> = {
  "follow-up": "#2196f3", // Light blue
  "new-patient": "#3f51b5", // Blue
  emergency: "#f44336", // Red
  routine: "#9e9e9e", // Gray
};
