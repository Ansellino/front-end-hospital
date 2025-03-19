import React, { useMemo } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Tooltip,
  Divider,
  Button,
} from "@mui/material";
import { format, parseISO, addMinutes } from "date-fns";
import { Add as AddIcon } from "@mui/icons-material";
import { DayWithAppointments } from "../types";
import { Appointment } from "../../../interfaces/appointment";
import { statusColors } from "../constants";

interface DayViewProps {
  day: DayWithAppointments;
  onAppointmentClick: (appointment: Appointment) => void;
  onCreateAppointment: () => void;
}

// Start and end hours for the day view (8AM to 7PM)
const START_HOUR = 8;
const END_HOUR = 19;

const DayView: React.FC<DayViewProps> = ({
  day,
  onAppointmentClick,
  onCreateAppointment,
}) => {
  // Create time slots for the day (30-minute intervals)
  const timeSlots = useMemo(() => {
    const slots = [];
    const date = new Date(day.date);

    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      // First 30 minutes of the hour
      date.setHours(hour, 0, 0);
      slots.push({
        time: new Date(date),
        formattedTime: format(date, "h:mm a"),
        isHourStart: true,
      });

      // Last 30 minutes of the hour
      date.setHours(hour, 30, 0);
      slots.push({
        time: new Date(date),
        formattedTime: format(date, "h:mm a"),
        isHourStart: false,
      });
    }
    return slots;
  }, [day.date]);

  // Group appointments by their start time slot
  const appointmentsByTime = useMemo(() => {
    const appMap = new Map<string, Appointment[]>();

    day.appointments.forEach((appointment) => {
      const startTime = format(parseISO(appointment.startTime), "HH:mm");
      if (!appMap.has(startTime)) {
        appMap.set(startTime, []);
      }
      appMap.get(startTime)!.push(appointment);
    });

    return appMap;
  }, [day.appointments]);

  // Calculate appointment position and duration
  const getAppointmentStyle = (appointment: Appointment) => {
    const startTime = parseISO(appointment.startTime);
    const endTime = parseISO(appointment.endTime);

    // Calculate duration in minutes
    const durationMinutes = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    );

    // Calculate height based on duration (1 minute = 1.2px)
    const height = Math.max(durationMinutes * 1.2, 30);

    return {
      height: `${height}px`,
      backgroundColor: statusColors[appointment.status] || "#ccc",
    };
  };

  return (
    <Paper elevation={1}>
      {/* Day header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "action.hover",
        }}
      >
        <Typography variant="h6">
          {format(day.date, "EEEE, MMMM d, yyyy")}
        </Typography>
      </Box>

      <Divider />

      {/* Time slots grid */}
      <Box sx={{ display: "flex", height: "calc(100vh - 200px)" }}>
        {/* Time column */}
        <Box
          sx={{
            width: "80px",
            borderRight: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          {timeSlots.map((slot, index) => (
            <Box
              key={index}
              sx={{
                height: "60px",
                p: 1,
                borderBottom: slot.isHourStart ? 1 : 0,
                borderColor: "divider",
                display: "flex",
                alignItems: slot.isHourStart ? "flex-start" : "center",
                justifyContent: "center",
                backgroundColor: slot.isHourStart
                  ? "background.paper"
                  : "action.hover",
                opacity: slot.isHourStart ? 1 : 0.7,
              }}
            >
              {slot.isHourStart && (
                <Typography variant="body2">{slot.formattedTime}</Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* Appointments column */}
        <Box sx={{ flexGrow: 1, position: "relative", overflowY: "auto" }}>
          {/* Time slot backgrounds */}
          {timeSlots.map((slot, index) => (
            <Box
              key={index}
              sx={{
                height: "60px",
                borderBottom: slot.isHourStart ? 1 : 0,
                borderColor: "divider",
                backgroundColor:
                  index % 2 === 0 ? "background.paper" : "action.hover",
                opacity: 0.7,
              }}
            />
          ))}

          {/* Appointments */}
          {day.appointments.map((appointment) => {
            const startTime = parseISO(appointment.startTime);
            const startMinutes =
              startTime.getHours() * 60 + startTime.getMinutes();
            const slotStartMinutes = START_HOUR * 60;
            const topPosition = (startMinutes - slotStartMinutes) * (60 / 30);

            return (
              <Box
                key={appointment.id}
                sx={{
                  position: "absolute",
                  top: `${topPosition}px`,
                  left: "5px",
                  right: "5px",
                  ...getAppointmentStyle(appointment),
                  borderRadius: 1,
                  p: 1,
                  color: "white",
                  cursor: "pointer",
                  overflow: "hidden",
                  boxShadow: 1,
                  zIndex: 2,
                  "&:hover": {
                    opacity: 0.9,
                    boxShadow: 2,
                  },
                }}
                onClick={() => onAppointmentClick(appointment)}
              >
                <Tooltip
                  title={`${appointment.title} (${format(
                    parseISO(appointment.startTime),
                    "h:mm a"
                  )} - ${format(parseISO(appointment.endTime), "h:mm a")})`}
                >
                  <Box>
                    <Typography variant="subtitle2" noWrap>
                      {format(parseISO(appointment.startTime), "h:mm a")} -{" "}
                      {format(parseISO(appointment.endTime), "h:mm a")}
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {appointment.title}
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                    >
                      <Chip
                        size="small"
                        label={appointment.status}
                        sx={{
                          height: "18px",
                          fontSize: "0.625rem",
                          backgroundColor: "rgba(255,255,255,0.2)",
                        }}
                      />
                    </Box>
                  </Box>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Empty state */}
      {day.appointments.length === 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No appointments scheduled for this day
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DayView;
