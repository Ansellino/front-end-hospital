import React, { useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { format, parseISO, isToday } from "date-fns";
import { DayWithAppointments } from "../types";
import { Appointment } from "../../../interfaces/appointment";
import { statusColors } from "../constants";

interface WeekViewProps {
  days: DayWithAppointments[];
  onAppointmentClick: (appointment: Appointment) => void;
}

// Start and end hours for the week view (8AM to 7PM)
const START_HOUR = 8;
const END_HOUR = 19;
const MIN_APPOINTMENT_HEIGHT = 20; // Minimum height for very short appointments

const WeekView: React.FC<WeekViewProps> = ({ days, onAppointmentClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Track which appointment is being hovered
  const [hoveredAppointmentId, setHoveredAppointmentId] = useState<
    string | null
  >(null);

  // Create time slots for the day (hourly intervals)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      slots.push({
        hour,
        formattedTime: format(new Date().setHours(hour, 0, 0, 0), "h:mm a"),
      });
    }
    return slots;
  }, []);

  // Calculate appointment position and height based on time
  const getAppointmentStyle = (appointment: Appointment) => {
    const startTime = parseISO(appointment.startTime);

    // Calculate start position
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const startPosition = (startHour - START_HOUR) * 60 + startMinute;

    // Responsive sizing: increase mobile size
    const hourHeight = isMobile ? 50 : isTablet ? 50 : 60; // px per hour
    const minuteHeight = hourHeight / 60; // px per minute
    const top = startPosition * minuteHeight;

    // Use fixed height instead of calculating based on duration
    const FIXED_HEIGHT = isMobile ? 40 : 50; // Fixed height in pixels

    return {
      top: `${top}px`,
      height: `${FIXED_HEIGHT}px`, // Fixed height for all appointments
      backgroundColor: statusColors[appointment.status] || "#ccc",
    };
  };

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
    <Paper elevation={1} className="overflow-hidden">
      {/* Color Legend */}
      {renderColorLegend()}

      {/* Header row with days of week */}
      <Grid container>
        {/* Empty cell for time column */}
        <Grid
          item
          sx={{
            width: isMobile ? "40px" : "60px",
            borderRight: 1,
            borderBottom: 1,
            borderColor: "divider",
          }}
        />

        {/* Day headers */}
        {days.map((day) => (
          <Grid
            item
            xs
            key={day.date.toString()}
            sx={{
              py: isMobile ? 0.5 : 1,
              px: isMobile ? 0.5 : 1,
              textAlign: "center",
              borderBottom: 1,
              borderRight: 1,
              borderColor: "divider",
              backgroundColor: isToday(day.date)
                ? "action.selected"
                : "action.hover",
              "&:last-child": {
                borderRight: 0,
              },
            }}
          >
            <Typography
              variant={isMobile ? "caption" : "subtitle2"}
              fontWeight={isToday(day.date) ? "bold" : "normal"}
            >
              {format(day.date, isMobile ? "dd" : "EEE")}
            </Typography>
            {!isMobile && (
              <Typography variant="caption">
                {format(day.date, "MMM d")}
              </Typography>
            )}
          </Grid>
        ))}
      </Grid>

      {/* Time grid */}
      <Box
        className="relative flex overflow-y-auto scrollbar-hide"
        sx={{ height: "calc(100vh - 200px)" }}
      >
        {/* Time column */}
        <Box
          sx={{
            width: isMobile ? "40px" : "60px",
            borderRight: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          {timeSlots.map((slot) => (
            <Box
              key={slot.hour}
              sx={{
                height: isMobile ? "45px" : isTablet ? "50px" : "60px",
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                pt: 0.5,
              }}
            >
              <Typography
                variant={isMobile ? "caption" : "body2"}
                color="text.secondary"
                sx={{ fontSize: isMobile ? "0.65rem" : undefined }}
              >
                {isMobile
                  ? format(new Date().setHours(slot.hour, 0, 0, 0), "ha")
                  : slot.formattedTime}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Days columns with appointments */}
        <Grid container sx={{ flexGrow: 1 }}>
          {days.map((day) => (
            <Grid
              item
              xs
              key={day.date.toString()}
              sx={{
                borderRight: 1,
                borderColor: "divider",
                height: "100%",
                position: "relative",
                "&:last-child": {
                  borderRight: 0,
                },
              }}
            >
              {/* Time slot backgrounds */}
              {timeSlots.map((slot, index) => (
                <Box
                  key={index}
                  sx={{
                    height: isMobile ? "45px" : isTablet ? "50px" : "60px",
                    borderBottom: 1,
                    borderColor: "divider",
                    backgroundColor:
                      index % 2 === 0 ? "background.paper" : "action.hover",
                    opacity: 0.7,
                  }}
                />
              ))}

              {/* Color-coded Appointments (with text) */}
              {day.appointments.map((appointment) => {
                const isHovered = hoveredAppointmentId === appointment.id;
                const appointmentStartTime = parseISO(appointment.startTime);
                const appointmentEndTime = parseISO(appointment.endTime);
                // Calculate duration to determine how much information to show
                const durationMinutes =
                  (appointmentEndTime.getTime() -
                    appointmentStartTime.getTime()) /
                  (1000 * 60);

                return (
                  <Tooltip
                    key={appointment.id}
                    title={`${appointment.title} (${format(
                      appointmentStartTime,
                      "h:mm a"
                    )} - ${format(appointmentEndTime, "h:mm a")}) - ${
                      appointment.status
                    }`}
                    placement="top"
                    arrow
                    followCursor
                  >
                    <Box
                      className={`
                        absolute rounded-md cursor-pointer 
                        transition-all duration-200
                        ${isHovered ? "shadow-lg z-50" : "shadow-sm z-10"}
                        active:opacity-90 touch-action-manipulation
                        overflow-hidden
                      `}
                      sx={{
                        left: "2px",
                        right: "2px",
                        ...getAppointmentStyle(appointment),
                        transform: isHovered ? "scale(1.02)" : "none",
                        boxShadow: isHovered
                          ? "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)"
                          : "0 2px 4px rgba(0,0,0,0.1)",
                        transition:
                          "transform 0.2s ease, box-shadow 0.2s ease, z-index 0s",
                        "&:hover": { opacity: 0.95 },
                        "&:before": {
                          content: '""',
                          position: "absolute",
                          top: "-10px",
                          left: "-10px",
                          right: "-10px",
                          bottom: "-10px",
                          zIndex: -1,
                        },
                      }}
                      onClick={() => onAppointmentClick(appointment)}
                      onMouseEnter={() =>
                        setHoveredAppointmentId(appointment.id)
                      }
                      onMouseLeave={() => setHoveredAppointmentId(null)}
                      onFocus={() => setHoveredAppointmentId(appointment.id)}
                      onBlur={() => setHoveredAppointmentId(null)}
                    >
                      {/* Display content based on fixed height */}
                      <Box className="flex flex-col justify-between h-full p-1">
                        {/* Title */}
                        <Box className="flex items-center gap-1">
                          <Typography
                            variant="caption"
                            className="font-medium text-white truncate"
                            sx={{
                              fontSize: isMobile ? "0.75rem" : "0.75rem",
                              lineHeight: 1.2,
                              fontWeight: 600,
                              textShadow: "0px 1px 2px rgba(0,0,0,0.2)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {appointment.title}
                          </Typography>
                        </Box>

                        {/* Time always visible now that height is fixed */}
                        <Typography
                          variant="caption"
                          className="text-white"
                          sx={{
                            fontSize: isMobile ? "0.65rem" : "0.65rem",
                            lineHeight: 1,
                            opacity: 0.9,
                            fontWeight: 500,
                          }}
                        >
                          {format(appointmentStartTime, "h:mm a")}
                        </Typography>
                      </Box>

                      {/* Show dot for very short appointments only when hovered */}
                      {durationMinutes <= (isMobile ? 15 : 20) && isHovered && (
                        <Box
                          className="absolute inset-0 flex items-center justify-center"
                          sx={{
                            backgroundColor: "rgba(255,255,255,0.2)",
                            borderRadius: "inherit",
                          }}
                        >
                          <Box
                            className="w-1.5 h-1.5 rounded-full"
                            sx={{ backgroundColor: "white" }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                );
              })}

              {/* No appointments indicator */}
              {day.appointments.length === 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {isMobile ? "No appts" : "No appointments"}
                  </Typography>
                </Box>
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

export default WeekView;
