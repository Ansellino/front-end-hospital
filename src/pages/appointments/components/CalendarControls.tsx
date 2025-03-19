import React from "react";
import {
  IconButton,
  Button,
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
    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
      <div className="flex items-center">
        <IconButton
          onClick={navigatePrevious}
          aria-label="previous period"
          className="text-gray-600"
        >
          <ArrowBackIcon />
        </IconButton>

        <Button
          onClick={navigateToday}
          variant="outlined"
          startIcon={<CalendarTodayIcon />}
          className="mx-2"
          size="small"
        >
          Today
        </Button>

        <IconButton
          onClick={navigateNext}
          aria-label="next period"
          className="text-gray-600"
        >
          <ArrowForwardIcon />
        </IconButton>

        <h2 className="ml-4 text-lg font-medium hidden sm:block">
          {getDateDisplayText()}
        </h2>
      </div>

      {/* Display date for mobile */}
      <div className="text-center sm:hidden mb-2">
        <h2 className="text-lg font-medium">{getDateDisplayText()}</h2>
      </div>

      <div className="flex justify-center md:justify-end">
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newValue) => newValue && onViewModeChange(newValue)}
          aria-label="calendar view mode"
          size="small"
          className="self-center"
        >
          <ToggleButton
            value={ViewMode.Day}
            aria-label="day view"
            className="px-3 py-1"
          >
            <ViewDayIcon className="mr-1" fontSize="small" />
            <span className="hidden sm:inline">Day</span>
          </ToggleButton>
          <ToggleButton
            value={ViewMode.Week}
            aria-label="week view"
            className="px-3 py-1"
          >
            <ViewWeekIcon className="mr-1" fontSize="small" />
            <span className="hidden sm:inline">Week</span>
          </ToggleButton>
          <ToggleButton
            value={ViewMode.Month}
            aria-label="month view"
            className="px-3 py-1"
          >
            <ViewMonthIcon className="mr-1" fontSize="small" />
            <span className="hidden sm:inline">Month</span>
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  );
};

export default CalendarControls;
