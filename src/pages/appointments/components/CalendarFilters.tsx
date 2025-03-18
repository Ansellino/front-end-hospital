import React from "react";
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  SelectChangeEvent,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface Doctor {
  id: string;
  name: string;
}

interface CalendarFiltersProps {
  doctors: Doctor[];
  filterDoctor: string;
  filterStatus: string;
  filterType: string;
  searchQuery: string;
  onDoctorFilterChange: (event: SelectChangeEvent) => void;
  onStatusFilterChange: (event: SelectChangeEvent) => void;
  onTypeFilterChange: (event: SelectChangeEvent) => void;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  doctors,
  filterDoctor,
  filterStatus,
  filterType,
  searchQuery,
  onDoctorFilterChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onSearchChange,
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4} md={2.67}>
          <FormControl fullWidth size="small">
            <InputLabel id="doctor-filter-label">Doctor</InputLabel>
            <Select
              labelId="doctor-filter-label"
              id="doctor-filter"
              value={filterDoctor}
              label="Doctor"
              onChange={onDoctorFilterChange}
            >
              <MenuItem value="all">All Doctors</MenuItem>
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={2.67}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={filterStatus}
              label="Status"
              onChange={onStatusFilterChange}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="canceled">Canceled</MenuItem>
              <MenuItem value="no-show">No Show</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={2.67}>
          <FormControl fullWidth size="small">
            <InputLabel id="type-filter-label">Type</InputLabel>
            <Select
              labelId="type-filter-label"
              id="type-filter"
              value={filterType}
              label="Type"
              onChange={onTypeFilterChange}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="follow-up">Follow-up</MenuItem>
              <MenuItem value="new-patient">New Patient</MenuItem>
              <MenuItem value="emergency">Emergency</MenuItem>
              <MenuItem value="routine">Routine</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CalendarFilters;
