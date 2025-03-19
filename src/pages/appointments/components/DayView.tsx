import React, { useMemo, useState } from "react";
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
  onCreateAppointment: (startTime?: Date, endTime?: Date) => void;
}

const START_HOUR = 8;
const END_HOUR = 19;
const PX_PER_HOUR = 120; // 60px per 30 minutes
const TIME_SLOT_INTERVAL = 30; // 30 minutes interval for time slots
const MIN_APPOINTMENT_HEIGHT = 40; // Minimum height for very short appointments

const DayView: React.FC<DayViewProps> = ({
  day,
  onAppointmentClick,
  onCreateAppointment,
}) => {
  // Track which appointment is being hovered
  const [hoveredAppointmentId, setHoveredAppointmentId] = useState<
    string | null
  >(null);

  const totalHours = END_HOUR - START_HOUR;
  const totalHeight = totalHours * PX_PER_HOUR;

  // Create time labels for each hour
  const timeLabels = useMemo(() => {
    return Array.from({ length: totalHours }, (_, i) => {
      const hour = START_HOUR + i;
      const date = new Date(day.date);
      date.setHours(hour, 0, 0);
      return {
        time: date,
        topPosition: i * PX_PER_HOUR,
      };
    });
  }, [day.date, totalHours]);

  // Create time slots every 30 minutes
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i < totalHours; i++) {
      // First 30-minute slot of the hour
      const firstSlotTime = new Date(day.date);
      firstSlotTime.setHours(START_HOUR + i, 0, 0);
      slots.push({
        time: firstSlotTime,
        topPosition: i * PX_PER_HOUR,
        height: PX_PER_HOUR / 2,
      });

      // Second 30-minute slot of the hour
      const secondSlotTime = new Date(day.date);
      secondSlotTime.setHours(START_HOUR + i, 30, 0);
      slots.push({
        time: secondSlotTime,
        topPosition: i * PX_PER_HOUR + PX_PER_HOUR / 2,
        height: PX_PER_HOUR / 2,
      });
    }
    return slots;
  }, [day.date, totalHours]);

  // Calculate appointment position based on actual duration
  const getAppointmentStyle = (appointment: Appointment) => {
    const startTime = parseISO(appointment.startTime);
    const endTime = parseISO(appointment.endTime);

    // Calculate duration in minutes
    const durationMinutes = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    );

    // Calculate position based on start time
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const slotStartMinutes = START_HOUR * 60;
    const topPosition = (startMinutes - slotStartMinutes) * 2; // 2px per minute

    // Calculate height based on duration (2px per minute)
    // Ensure a minimum height for very short appointments
    const height = Math.max(durationMinutes * 2, MIN_APPOINTMENT_HEIGHT);

    return {
      top: `${topPosition}px`,
      height: `${height}px`,
      backgroundColor: statusColors[appointment.status] || "#ccc",
      position: "relative",
    };
  };

  // Handle click on a time slot
  const handleTimeSlotClick = (time: Date) => {
    // Create a new appointment with a default 30-minute duration
    const startTime = new Date(time);
    const endTime = addMinutes(startTime, TIME_SLOT_INTERVAL);
    onCreateAppointment(startTime, endTime);
  };

  return (
    <Paper
      elevation={2}
      className="flex flex-col h-full overflow-hidden rounded-lg shadow-md"
    >
      {/* Header */}
      <Box className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
        <Typography
          variant="h6"
          className="font-semibold text-gray-800 dark:text-gray-100"
        >
          {format(day.date, "EEEE, MMMM d, yyyy")}
        </Typography>
      </Box>

      <Divider />

      {/* Scrollable Container */}
      <Box
        className="relative flex overflow-y-auto"
        sx={{ height: "calc(100vh - 200px)" }}
      >
        {/* Time Column */}
        <Box
          className="relative flex-shrink-0 w-24 border-r border-gray-200 dark:border-gray-700"
          sx={{ height: totalHeight }}
        >
          {timeLabels.map((label, index) => (
            <Box
              key={index}
              className="absolute flex items-center justify-center w-full border-b border-gray-200 dark:border-gray-700"
              sx={{
                top: label.topPosition,
                height: PX_PER_HOUR,
              }}
            >
              <Typography
                variant="body2"
                className="font-medium text-gray-600 dark:text-gray-400"
              >
                {format(label.time, "h:mm a")}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Appointments Column */}
        <Box
          className="relative flex-1 bg-gray-50 dark:bg-gray-800"
          sx={{ height: totalHeight }}
        >
          {/* Clickable Time Slots */}
          {timeSlots.map((slot, index) => (
            <Box
              key={index}
              className="absolute left-0 right-0 transition-colors border-b border-gray-200 cursor-pointer dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              sx={{
                top: slot.topPosition,
                height: slot.height,
                zIndex: 1,
              }}
              onClick={() => handleTimeSlotClick(slot.time)}
              data-time={format(slot.time, "HH:mm")}
            />
          ))}

          {/* Hourly Background Stripes */}
          {timeLabels.map((label, index) => (
            <Box
              key={index}
              className="absolute left-0 right-0 border-b border-gray-200 pointer-events-none dark:border-gray-700"
              sx={{
                top: label.topPosition,
                height: PX_PER_HOUR,
                backgroundColor:
                  index % 2 === 0
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(0,0,0,0.02)",
              }}
            />
          ))}

          {/* Appointments */}
          {day.appointments.map((appointment) => {
            const isHovered = hoveredAppointmentId === appointment.id;
            const appointmentStartTime = parseISO(appointment.startTime);
            const appointmentEndTime = parseISO(appointment.endTime);

            // Calculate duration in minutes for display
            const durationMinutes = Math.round(
              (appointmentEndTime.getTime() - appointmentStartTime.getTime()) /
                (1000 * 60)
            );

            return (
              <Box
                key={appointment.id}
                className={`absolute left-2 right-2 rounded-md p-2 text-white cursor-pointer overflow-visible transition-all duration-200 ${
                  isHovered
                    ? "shadow-lg transform scale-[1.02] z-50"
                    : "shadow-sm z-10"
                } hover:opacity-95`}
                sx={{
                  ...getAppointmentStyle(appointment),
                  boxShadow: isHovered
                    ? "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)"
                    : "0 2px 4px rgba(0,0,0,0.1)",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease, z-index 0s",
                }}
                onClick={() => onAppointmentClick(appointment)}
                onMouseEnter={() => setHoveredAppointmentId(appointment.id)}
                onMouseLeave={() => setHoveredAppointmentId(null)}
                onFocus={() => setHoveredAppointmentId(appointment.id)}
                onBlur={() => setHoveredAppointmentId(null)}
              >
                <Tooltip
                  title={`${appointment.title} (${format(
                    appointmentStartTime,
                    "h:mm a"
                  )} - ${format(appointmentEndTime, "h:mm a")})`}
                  placement="top"
                  arrow
                >
                  <Box className="flex flex-col h-full">
                    <Typography
                      variant="subtitle2"
                      className="mb-1 font-bold text-white"
                      sx={{
                        fontSize: durationMinutes < 30 ? "0.75rem" : undefined,
                        lineHeight: 1.2,
                      }}
                    >
                      {appointment.title}
                    </Typography>

                    {durationMinutes >= 20 && (
                      <Box className="flex items-center justify-between">
                        <Typography
                          variant="caption"
                          className="font-medium"
                          sx={{
                            fontSize:
                              durationMinutes < 45 ? "0.65rem" : "0.75rem",
                          }}
                        >
                          {format(appointmentStartTime, "h:mm a")} -{" "}
                          {format(appointmentEndTime, "h:mm a")}
                        </Typography>

                        <Typography
                          variant="caption"
                          className="font-medium"
                          sx={{
                            fontSize:
                              durationMinutes < 45 ? "0.65rem" : "0.75rem",
                          }}
                        >
                          {durationMinutes} min
                        </Typography>
                      </Box>
                    )}

                    {durationMinutes >= 45 && (
                      <Box className="flex items-center justify-between pt-2 mt-auto">
                        <Chip
                          size="small"
                          label={appointment.status}
                          className="text-xs"
                          sx={{
                            backgroundColor: "rgba(255,255,255,0.25)",
                            color: "inherit",
                            fontWeight: 500,
                            height: "20px",
                            ".MuiChip-label": { px: 1 },
                          }}
                        />

                        <Chip
                          size="small"
                          label={appointment.type}
                          className="text-xs"
                          sx={{
                            backgroundColor: "rgba(255,255,255,0.15)",
                            color: "inherit",
                            fontWeight: 500,
                            height: "20px",
                            ".MuiChip-label": { px: 1 },
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Empty State */}
      {day.appointments.length === 0 && (
        <Box className="flex items-center justify-center w-full h-48">
          <Typography
            variant="body1"
            className="px-4 py-8 text-center text-gray-500 border border-gray-300 border-dashed rounded-lg dark:text-gray-400 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
          >
            No appointments scheduled for this day.
            <br />
            Click on a time slot to create an appointment.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DayView;
