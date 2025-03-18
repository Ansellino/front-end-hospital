import React from "react";
import {
  Paper,
  Grid,
  Typography,
  Box,
  Chip,
  Tooltip,
  Badge,
} from "@mui/material";
import { format, isSameMonth, isToday } from "date-fns";
import { DayWithAppointments } from "../types";
import { statusColors, typeColors } from "../constants";
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
  // Get days grouped by weeks (7 days per row)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <Paper elevation={1}>
      {/* Calendar header - Days of week */}
      <Grid container>
        {[
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].map((dayName) => (
          <Grid
            item
            xs
            key={dayName}
            sx={{
              py: 1,
              textAlign: "center",
              borderBottom: 1,
              borderRight: 1,
              borderColor: "divider",
              backgroundColor: "action.hover",
              "&:last-child": {
                borderRight: 0,
              },
            }}
          >
            <Typography variant="subtitle2">{dayName}</Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <Grid container key={weekIndex} sx={{ minHeight: 120 }}>
          {week.map((day) => (
            <Grid
              item
              xs
              key={day.date.toString()}
              onClick={() => onDayClick(day.date)}
              sx={{
                position: "relative",
                height: "100%",
                p: 1,
                borderBottom: weekIndex < weeks.length - 1 ? 1 : 0,
                borderRight: 1,
                borderColor: "divider",
                backgroundColor: isToday(day.date)
                  ? "action.selected"
                  : day.isCurrentMonth
                  ? "background.paper"
                  : "action.disabledBackground",
                "&:hover": {
                  backgroundColor: "action.hover",
                  cursor: "pointer",
                },
                "&:last-child": {
                  borderRight: 0,
                },
                overflow: "hidden",
              }}
            >
              {/* Day number */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: isToday(day.date) ? "bold" : "normal",
                  color: day.isCurrentMonth ? "text.primary" : "text.secondary",
                  mb: 1,
                }}
              >
                {format(day.date, "d")}
              </Typography>

              {/* Appointment list */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  maxHeight: 100,
                  overflowY: "auto",
                }}
              >
                {day.appointments.length > 0
                  ? day.appointments.slice(0, 3).map((appointment) => (
                      <Tooltip
                        key={appointment.id}
                        title={`${appointment.title} - ${format(
                          new Date(appointment.startTime),
                          "h:mm a"
                        )}`}
                        placement="top"
                      >
                        <Chip
                          size="small"
                          label={`${format(
                            new Date(appointment.startTime),
                            "h:mm a"
                          )} ${appointment.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(appointment);
                          }}
                          sx={{
                            backgroundColor:
                              statusColors[appointment.status] || "#ccc",
                            color: "white",
                            fontSize: "0.75rem",
                            height: "22px",
                            width: "100%",
                            textAlign: "left",
                            "& .MuiChip-label": {
                              px: 0.5,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            },
                          }}
                        />
                      </Tooltip>
                    ))
                  : null}

                {/* Show indicator if there are more appointments that can't be displayed */}
                {day.appointments.length > 3 && (
                  <Typography variant="caption" sx={{ textAlign: "center" }}>
                    {`+${day.appointments.length - 3} more`}
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
