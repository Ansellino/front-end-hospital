import React, { useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Tooltip,
  Divider,
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

const WeekView: React.FC<WeekViewProps> = ({ days, onAppointmentClick }) => {
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
    const endTime = parseISO(appointment.endTime);

    // Calculate start position
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const startPosition = (startHour - START_HOUR) * 60 + startMinute;

    // Calculate height based on duration
    const durationMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    // Each hour is 60px in height
    const top = (startPosition / 60) * 60;
    const height = Math.max((durationMinutes / 60) * 60, 20);

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: statusColors[appointment.status] || "#ccc",
    };
  };

  return (
    <Paper elevation={1}>
      {/* Header row with days of week */}
      <Grid container>
        {/* Empty cell for time column */}
        <Grid
          item
          sx={{
            width: "60px",
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
              py: 1,
              px: 1,
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
              variant="subtitle2"
              fontWeight={isToday(day.date) ? "bold" : "normal"}
            >
              {format(day.date, "EEE")}
            </Typography>
            <Typography variant="caption">
              {format(day.date, "MMM d")}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Time grid */}
      <Box sx={{ display: "flex", minHeight: "600px" }}>
        {/* Time column */}
        <Box
          sx={{
            width: "60px",
            borderRight: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          {timeSlots.map((slot) => (
            <Box
              key={slot.hour}
              sx={{
                height: "60px",
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                pt: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {slot.formattedTime}
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
                    height: "60px",
                    borderBottom: 1,
                    borderColor: "divider",
                    backgroundColor:
                      index % 2 === 0 ? "background.paper" : "action.hover",
                    opacity: 0.7,
                  }}
                />
              ))}

              {/* Appointments */}
              {day.appointments.map((appointment) => (
                <Tooltip
                  key={appointment.id}
                  title={`${appointment.title} (${format(
                    parseISO(appointment.startTime),
                    "h:mm a"
                  )} - ${format(parseISO(appointment.endTime), "h:mm a")})`}
                  placement="top"
                >
                  <Box
                    sx={{
                      position: "absolute",
                      left: "2px",
                      right: "2px",
                      ...getAppointmentStyle(appointment),
                      borderRadius: 1,
                      p: 0.5,
                      color: "white",
                      cursor: "pointer",
                      overflow: "hidden",
                      boxShadow: 1,
                      fontSize: "0.75rem",
                      "&:hover": {
                        opacity: 0.9,
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => onAppointmentClick(appointment)}
                  >
                    <Typography variant="caption" noWrap>
                      {format(parseISO(appointment.startTime), "h:mm a")}
                    </Typography>
                    <Typography
                      variant="body2"
                      noWrap
                      fontWeight="bold"
                      sx={{ fontSize: "0.75rem" }}
                    >
                      {appointment.title}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}

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
                    No appointments
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
