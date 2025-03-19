import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Box,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TablePagination,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import * as patientService from "../../services/patientService";
import { Patient } from "../../interfaces/patient";
import { useAuth } from "../../contexts/AuthContext";

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState("all");
  const [insuranceFilter, setInsuranceFilter] = useState("all");
  const [ageRangeFilter, setAgeRangeFilter] = useState("all");
  const [insuranceProviders, setInsuranceProviders] = useState<string[]>([]);

  // Fetch patients data
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await patientService.getPatients();
        setPatients(data);
        setFilteredPatients(data);

        // Extract unique insurance providers for filtering
        const uniqueProviders = Array.from(
          new Set(data.map((p: Patient) => p.insuranceInfo.provider))
        ) as string[]; // Add explicit type assertion here
        setInsuranceProviders(uniqueProviders);

        setError(null);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to load patients. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...patients];

    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(query) ||
          patient.lastName.toLowerCase().includes(query) ||
          patient.email.toLowerCase().includes(query) ||
          patient.contactNumber.includes(query)
      );
    }

    // Apply gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter((patient) => patient.gender === genderFilter);
    }

    // Apply insurance provider filter
    if (insuranceFilter !== "all") {
      filtered = filtered.filter(
        (patient) => patient.insuranceInfo.provider === insuranceFilter
      );
    }

    // Apply age range filter
    if (ageRangeFilter !== "all") {
      filtered = filtered.filter((patient) => {
        const age = calculateAge(patient.dateOfBirth);
        switch (ageRangeFilter) {
          case "0-18":
            return age >= 0 && age <= 18;
          case "19-35":
            return age >= 19 && age <= 35;
          case "36-50":
            return age >= 36 && age <= 50;
          case "51-65":
            return age >= 51 && age <= 65;
          case "65+":
            return age >= 65;
          default:
            return true;
        }
      });
    }

    setFilteredPatients(filtered);
    setPage(0); // Reset to first page when filters change
  }, [searchQuery, patients, genderFilter, insuranceFilter, ageRangeFilter]);

  // Handle filter changes
  const handleGenderFilterChange = (event: SelectChangeEvent) => {
    setGenderFilter(event.target.value);
  };

  const handleInsuranceFilterChange = (event: SelectChangeEvent) => {
    setInsuranceFilter(event.target.value);
  };

  const handleAgeRangeFilterChange = (event: SelectChangeEvent) => {
    setAgeRangeFilter(event.target.value);
  };

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page on search
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewPatient = (id: string) => {
    navigate(`/patients/${id}`);
  };

  const handleEditPatient = (id: string) => {
    navigate(`/patients/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setPatientToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      await patientService.deletePatient(patientToDelete);
      setPatients(patients.filter((p: Patient) => p.id !== patientToDelete));
      setFilteredPatients(
        filteredPatients.filter((p: Patient) => p.id !== patientToDelete)
      );
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError("Failed to delete patient. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  // Calculate age from DOB
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Render loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Patients
        </Typography>

        {hasPermission("create:patients") && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/patients/add")}
          >
            Add New Patient
          </Button>
        )}
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", sm: "50%", md: "30%" } }}
          />

          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            Filters
          </Button>
        </Box>

        {/* Filter options */}
        {showFilters && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="gender-filter-label">Gender</InputLabel>
                <Select
                  labelId="gender-filter-label"
                  id="gender-filter"
                  value={genderFilter}
                  label="Gender"
                  onChange={handleGenderFilterChange}
                >
                  <MenuItem value="all">All Genders</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="insurance-filter-label">
                  Insurance Provider
                </InputLabel>
                <Select
                  labelId="insurance-filter-label"
                  id="insurance-filter"
                  value={insuranceFilter}
                  label="Insurance Provider"
                  onChange={handleInsuranceFilterChange}
                >
                  <MenuItem value="all">All Providers</MenuItem>
                  {insuranceProviders.map((provider) => (
                    <MenuItem key={provider} value={provider}>
                      {provider}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="age-filter-label">Age Range</InputLabel>
                <Select
                  labelId="age-filter-label"
                  id="age-filter"
                  value={ageRangeFilter}
                  label="Age Range"
                  onChange={handleAgeRangeFilterChange}
                >
                  <MenuItem value="all">All Ages</MenuItem>
                  <MenuItem value="0-18">0-18 years</MenuItem>
                  <MenuItem value="19-35">19-35 years</MenuItem>
                  <MenuItem value="36-50">36-50 years</MenuItem>
                  <MenuItem value="51-65">51-65 years</MenuItem>
                  <MenuItem value="65+">65+ years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Insurance</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography variant="body1">
                            {patient.lastName}, {patient.firstName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            DOB:{" "}
                            {format(
                              new Date(patient.dateOfBirth),
                              "MMM d, yyyy"
                            )}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            patient.gender.charAt(0).toUpperCase() +
                            patient.gender.slice(1)
                          }
                          color={
                            patient.gender === "male"
                              ? "primary"
                              : patient.gender === "female"
                              ? "secondary"
                              : "default"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{patient.contactNumber}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>
                        <Tooltip
                          title={`Policy: ${patient.insuranceInfo.policyNumber}`}
                        >
                          <Typography variant="body2">
                            {patient.insuranceInfo.provider}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewPatient(patient.id)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>

                          {hasPermission("edit:patients") && (
                            <Tooltip title="Edit Patient">
                              <IconButton
                                size="small"
                                onClick={() => handleEditPatient(patient.id)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {hasPermission("delete:patients") && (
                            <Tooltip title="Delete Patient">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(patient.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPatients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this patient record? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientList;
