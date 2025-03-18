import React from "react";
import {
  Box,
  IconButton,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarTodayIcon,
  ViewDay as ViewDayIcon,
  ViewWeek as ViewWeekIcon,
  ViewModule as ViewMonthIcon,
} from "@mui/icons-material";
import {
  format,
  addDays,
  subDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
} from "date-fns";
import { ViewMode } from "../types";

interface CalendarControlsProps {
  currentDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({
  currentDate,
  viewMode,
  onDateChange,
  onViewModeChange,
}) => {
  // Navigate to today
  const navigateToday = () => {
    onDateChange(new Date());
  };

  // Navigate to previous period
  const navigatePrevious = () => {
    if (viewMode === ViewMode.Day) {
      onDateChange(subDays(currentDate, 1));
    } else if (viewMode === ViewMode.Week) {
      onDateChange(subWeeks(currentDate, 1));
    } else {
      onDateChange(subMonths(currentDate, 1));
    }
  };

  // Navigate to next period
  const navigateNext = () => {
    if (viewMode === ViewMode.Day) {
      onDateChange(addDays(currentDate, 1));
    } else if (viewMode === ViewMode.Week) {
      onDateChange(addWeeks(currentDate, 1));
    } else {
      onDateChange(addMonths(currentDate, 1));
    }
  };

  // Format the title based on the current view
  const getDateDisplayText = () => {
    if (viewMode === ViewMode.Day) {
      return format(currentDate, "MMMM d, yyyy");
    } else if (viewMode === ViewMode.Week) {
      return `Week of ${format(currentDate, "MMMM d, yyyy")}`;
    } else {
      return format(currentDate, "MMMM yyyy");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", md: "center" },
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={navigatePrevious} aria-label="previous period">
          <ArrowBackIcon />
        </IconButton>

        <Button
          onClick={navigateToday}
          variant="outlined"
          startIcon={<CalendarTodayIcon />}
          sx={{ mx: 1 }}
        >
          Today
        </Button>

        <IconButton onClick={navigateNext} aria-label="next period">
          <ArrowForwardIcon />
        </IconButton>

        <Typography variant="h6" sx={{ ml: 2 }}>
          {getDateDisplayText()}
        </Typography>
      </Box>

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(_, newValue) => newValue && onViewModeChange(newValue)}
        aria-label="calendar view mode"
      >
        <ToggleButton value={ViewMode.Day} aria-label="day view">
          <ViewDayIcon sx={{ mr: 1 }} /> Day
        </ToggleButton>
        <ToggleButton value={ViewMode.Week} aria-label="week view">
          <ViewWeekIcon sx={{ mr: 1 }} /> Week
        </ToggleButton>
        <ToggleButton value={ViewMode.Month} aria-label="month view">
          <ViewMonthIcon sx={{ mr: 1 }} /> Month
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default CalendarControls;
