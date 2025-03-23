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
import MedicalRecordService from "../../services/medicalRecordService";
import { MedicalRecord } from "../../interfaces/emr";
import { useAuth } from "../../contexts/AuthContext";

const MedicalRecordList: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [followUpFilter, setFollowUpFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // Fetch medical records data
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const data = await MedicalRecordService.getAllMedicalRecords();
        setRecords(data);
        setFilteredRecords(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching medical records:", err);
        setError("Failed to load medical records. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...records];

    // Apply doctor filter
    if (doctorFilter !== "all") {
      result = result.filter((record) => record.doctorId === doctorFilter);
    }

    // Apply follow-up filter
    if (followUpFilter !== "all") {
      if (followUpFilter === "required") {
        result = result.filter((record) => record.followUpRecommended);
      } else if (followUpFilter === "not-required") {
        result = result.filter((record) => !record.followUpRecommended);
      }
    }

    // Apply date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      switch (dateRangeFilter) {
        case "last-30-days":
          result = result.filter(
            (record) => new Date(record.visitDate) >= thirtyDaysAgo
          );
          break;
        case "last-90-days":
          result = result.filter(
            (record) => new Date(record.visitDate) >= ninetyDaysAgo
          );
          break;
        case "last-year":
          result = result.filter(
            (record) => new Date(record.visitDate) >= oneYearAgo
          );
          break;
      }
    }

    // Apply search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (record) =>
          record.chiefComplaint.toLowerCase().includes(lowerCaseQuery) ||
          record.patientId.toLowerCase().includes(lowerCaseQuery) ||
          record.doctorId.toLowerCase().includes(lowerCaseQuery) ||
          record.visitId.toLowerCase().includes(lowerCaseQuery)
      );
    }

    setFilteredRecords(result);
    setPage(0); // Reset to first page when filters change
  }, [records, doctorFilter, followUpFilter, dateRangeFilter, searchQuery]);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle filter changes
  const handleDoctorFilterChange = (event: SelectChangeEvent) => {
    setDoctorFilter(event.target.value);
  };

  const handleFollowUpFilterChange = (event: SelectChangeEvent) => {
    setFollowUpFilter(event.target.value);
  };

  const handleDateRangeFilterChange = (event: SelectChangeEvent) => {
    setDateRangeFilter(event.target.value);
  };

  // Pagination handlers
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Action handlers
  const handleViewRecord = (id: string) => {
    navigate(`/medical-records/${id}`);
  };

  const handleEditRecord = (id: string) => {
    navigate(`/medical-records/edit/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      await MedicalRecordService.deleteMedicalRecord(recordToDelete);
      setRecords(records.filter((record) => record.id !== recordToDelete));
      setError(null);
    } catch (err) {
      console.error("Error deleting medical record:", err);
      setError("Failed to delete medical record. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
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
          Medical Records
        </Typography>

        {hasPermission("create:medical-records") && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/medical-records/add")}
          >
            Add New Record
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
            flexWrap: "wrap",
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search records..."
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
                <InputLabel id="doctor-filter-label">Doctor</InputLabel>
                <Select
                  labelId="doctor-filter-label"
                  id="doctor-filter"
                  value={doctorFilter}
                  label="Doctor"
                  onChange={handleDoctorFilterChange}
                >
                  <MenuItem value="all">All Doctors</MenuItem>
                  {/* In a real app, you would populate this with actual doctor options */}
                  <MenuItem value="doc-1">Dr. Sarah Johnson</MenuItem>
                  <MenuItem value="doc-2">Dr. Michael Chen</MenuItem>
                  <MenuItem value="doc-3">Dr. Emily Rodriguez</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="followup-filter-label">Follow-up</InputLabel>
                <Select
                  labelId="followup-filter-label"
                  id="followup-filter"
                  value={followUpFilter}
                  label="Follow-up"
                  onChange={handleFollowUpFilterChange}
                >
                  <MenuItem value="all">All Records</MenuItem>
                  <MenuItem value="required">Follow-up Required</MenuItem>
                  <MenuItem value="not-required">No Follow-up</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="date-filter-label">Date Range</InputLabel>
                <Select
                  labelId="date-filter-label"
                  id="date-filter"
                  value={dateRangeFilter}
                  label="Date Range"
                  onChange={handleDateRangeFilterChange}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="last-30-days">Last 30 Days</MenuItem>
                  <MenuItem value="last-90-days">Last 90 Days</MenuItem>
                  <MenuItem value="last-year">Last Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Visit Date</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Chief Complaint</TableCell>
              <TableCell>Diagnosis</TableCell>
              <TableCell>Follow-up</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No medical records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{record.patientId}</TableCell>
                    <TableCell>
                      {format(new Date(record.visitDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{record.doctorId}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {record.chiefComplaint}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {record.diagnosis.length > 0 ? (
                        <Chip
                          size="small"
                          label={record.diagnosis[0].description}
                          color="info"
                          variant="outlined"
                        />
                      ) : (
                        "None"
                      )}
                    </TableCell>
                    <TableCell>
                      {record.followUpRecommended ? (
                        <Chip
                          size="small"
                          label={
                            record.followUpDate
                              ? format(
                                  new Date(record.followUpDate),
                                  "MMM d, yyyy"
                                )
                              : "Required"
                          }
                          color="warning"
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="None"
                          color="default"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewRecord(record.id)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>

                        {hasPermission("edit:medical-records") && (
                          <Tooltip title="Edit Record">
                            <IconButton
                              size="small"
                              onClick={() => handleEditRecord(record.id)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}

                        {hasPermission("delete:medical-records") && (
                          <Tooltip title="Delete Record">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(record.id)}
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
        count={filteredRecords.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this medical record? This action
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

export default MedicalRecordList;
