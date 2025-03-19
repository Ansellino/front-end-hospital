import React, { useState } from "react";
import {
  Paper,
  Grid,
  Typography,
  Box,
  Chip,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { format, isToday } from "date-fns";
import { DayWithAppointments } from "../types";
import { statusColors } from "../constants";
import { Appointment } from "../../../interfaces/appointment";

interface MonthViewProps {
  days: DayWithAppointments[];
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  days,
  onDayClick,
  onAppointmentClick,
}) => {
  // Track which appointment is being hovered
  const [hoveredAppointmentId, setHoveredAppointmentId] = useState<
    string | null
  >(null);

  // Get theme and create responsive breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Get days grouped by weeks (7 days per row)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Calculate how many appointments to show based on screen size
  const maxVisibleAppointments = isMobile ? 1 : isTablet ? 2 : 3;

  // Format day names based on screen size
  const getDayNameFormat = () => (isMobile ? "ccc" : "cccc"); // 'Mon' on mobile, 'Monday' on desktop

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Legend for appointment status colors
  const renderColorLegend = () => {
    const legend = [
      { status: "scheduled", color: "#3f51b5", label: "Scheduled" },
      { status: "completed", color: "#4caf50", label: "Completed" },
      { status: "canceled", color: "#f44336", label: "Canceled" },
      { status: "no-show", color: "#ff9800", label: "No Show" },
    ];

    return (
      <Box className="px-2 py-1.5 mb-2 flex flex-wrap gap-2 justify-center items-center">
        <Typography
          variant="caption"
          className="mr-1 font-medium text-gray-600"
        >
          Status :
        </Typography>
        {legend.map((item) => (
          <Box key={item.status} className="flex items-center">
            <Box
              className="w-3 h-3 mr-1 rounded-sm"
              sx={{ backgroundColor: item.color }}
            />
            <Typography
              variant="caption"
              className="text-gray-700"
              sx={{ fontSize: isMobile ? "0.65rem" : "0.75rem" }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Paper elevation={1} className="w-full overflow-hidden">
      {/* Color Legend */}
      {renderColorLegend()}

      {/* Calendar header - Days of week */}
      <Grid container className="bg-gray-50 dark:bg-gray-800">
        {dayNames.map((dayName, index) => (
          <Grid
            item
            xs
            key={dayName}
            className={`
              py-1 md:py-2 
              text-center 
              border-b border-r border-gray-200 dark:border-gray-700
              ${index === 6 ? "border-r-0" : ""}
            `}
            sx={{
              backgroundColor: "action.hover",
            }}
          >
            <Typography
              variant="subtitle2"
              className="text-xs font-medium sm:text-sm md:text-base"
            >
              {isMobile ? dayName.substring(0, 3) : dayName}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <Grid
          container
          key={weekIndex}
          className={`min-h-[80px] sm:min-h-[100px] md:min-h-[120px] ${
            weekIndex % 2 === 0
              ? "bg-white dark:bg-gray-900"
              : "bg-gray-50 dark:bg-gray-800/30"
          }`}
        >
          {week.map((day) => (
            <Grid
              item
              xs
              key={day.date.toString()}
              onClick={() => onDayClick(day.date)}
              className={`
                relative
                border-b border-r border-gray-200 dark:border-gray-700
                transition-colors duration-200
                ${!day.isCurrentMonth ? "bg-gray-100 dark:bg-gray-800/50" : ""}
                hover:bg-blue-50 dark:hover:bg-blue-900/20
                cursor-pointer
                p-1 sm:p-1.5 md:p-2
                overflow-hidden
                flex flex-col
              `}
              sx={{
                backgroundColor: isToday(day.date)
                  ? "action.selected"
                  : day.isCurrentMonth
                  ? "background.paper"
                  : "action.disabledBackground",
                "&:last-child": {
                  borderRight: 0,
                },
              }}
            >
              {/* Day number */}
              <Typography
                variant="subtitle2"
                className={`
                  ${isToday(day.date) ? "font-bold" : "font-normal"}
                  ${
                    day.isCurrentMonth
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-400 dark:text-gray-500"
                  }
                  text-xs sm:text-sm
                  mb-1
                  ${
                    day.appointments.length > 0
                      ? "flex justify-between items-center"
                      : ""
                  }
                `}
              >
                <span>{format(day.date, "d")}</span>

                {/* Show appointment count badge on mobile */}
                {isMobile && day.appointments.length > 0 && (
                  <span className="bg-blue-500 text-white text-[10px] px-1 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {day.appointments.length}
                  </span>
                )}
              </Typography>

              {/* Appointment list */}
              <Box
                className={`
                  flex flex-col gap-0.5
                  max-h-[60px] sm:max-h-[80px] md:max-h-[100px]
                  overflow-y-auto
                  scrollbar-none
                  hover:scrollbar-none
                `}
                sx={{
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                  scrollbarWidth: "none" /* Firefox */,
                  msOverflowStyle: "none" /* IE and Edge */,
                }}
              >
                {day.appointments.length > 0
                  ? day.appointments
                      .slice(0, maxVisibleAppointments)
                      .map((appointment) => {
                        const isHovered =
                          hoveredAppointmentId === appointment.id;
                        return (
                          <Tooltip
                            key={appointment.id}
                            title={`${appointment.title} (${format(
                              new Date(appointment.startTime),
                              "h:mm a"
                            )} - ${format(
                              new Date(appointment.endTime),
                              "h:mm a"
                            )})`}
                            placement="top"
                          >
                            <Box
                              className={`
                                relative 
                                transition-all duration-200
                                ${
                                  isHovered
                                    ? "z-50 scale-[1.05]"
                                    : "z-10 scale-100"
                                }
                              `}
                              sx={{
                                boxShadow: isHovered
                                  ? "0 4px 8px rgba(0,0,0,0.15)"
                                  : "none",
                              }}
                              onMouseEnter={() =>
                                setHoveredAppointmentId(appointment.id)
                              }
                              onMouseLeave={() => setHoveredAppointmentId(null)}
                              onFocus={() =>
                                setHoveredAppointmentId(appointment.id)
                              }
                              onBlur={() => setHoveredAppointmentId(null)}
                            >
                              <Chip
                                size="small"
                                label={
                                  <div className="flex items-center justify-between w-full">
                                    <span className="truncate">
                                      {isMobile
                                        ? appointment.title.substring(0, 10) +
                                          (appointment.title.length > 10
                                            ? "..."
                                            : "")
                                        : `${format(
                                            new Date(appointment.startTime),
                                            "h:mm a"
                                          )} ${appointment.title}`}
                                    </span>
                                  </div>
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAppointmentClick(appointment);
                                }}
                                className={`
                                  w-full 
                                  text-left 
                                  h-[20px] sm:h-[22px] md:h-[24px] 
                                  text-white
                                `}
                                sx={{
                                  backgroundColor:
                                    statusColors[appointment.status] || "#ccc",
                                  fontSize: isMobile ? "0.65rem" : "0.75rem",
                                  "& .MuiChip-label": {
                                    px: 0.5,
                                    py: 0,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  },
                                }}
                              />
                            </Box>
                          </Tooltip>
                        );
                      })
                  : null}

                {/* Show indicator if there are more appointments that can't be displayed */}
                {day.appointments.length > maxVisibleAppointments && (
                  <Typography
                    variant="caption"
                    className="text-center text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs"
                  >
                    {`+${
                      day.appointments.length - maxVisibleAppointments
                    } more`}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      ))}
    </Paper>
  );
};

export default MonthView;
