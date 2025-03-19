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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
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
import * as staffService from "../../services/staffService";
import { Staff } from "../../interfaces/staff";
import { useAuth } from "../../contexts/AuthContext";

const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  // State for staff data
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);

  // List of unique departments for filtering
  const [departments, setDepartments] = useState<string[]>([]);

  // Fetch staff data
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const data = await staffService.getAllStaff();
        setStaff(data);
        setFilteredStaff(data);

        // Extract unique departments for filtering
        const uniqueDepartments = Array.from(
          new Set(data.map((s: Staff) => s.department))
        ) as string[];
        setDepartments(uniqueDepartments);

        setError(null);
      } catch (err) {
        console.error("Error fetching staff:", err);
        setError("Failed to load staff data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...staff];

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((s: Staff) => s.role === roleFilter);
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      result = result.filter((s: Staff) => s.department === departmentFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((s: Staff) => s.status === statusFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s: Staff) =>
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.contactNumber.includes(query) ||
          (s.specialization && s.specialization.toLowerCase().includes(query))
      );
    }

    setFilteredStaff(result);
    setPage(0); // Reset to first page when filters change
  }, [staff, roleFilter, departmentFilter, statusFilter, searchQuery]);

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
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

  const handleViewStaff = (id: string) => {
    navigate(`/staff/${id}`);
  };

  const handleEditStaff = (id: string) => {
    navigate(`/staff/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setStaffToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;

    try {
      await staffService.deleteStaff(staffToDelete);
      setStaff(staff.filter((s) => s.id !== staffToDelete));
      setFilteredStaff(filteredStaff.filter((s) => s.id !== staffToDelete));
    } catch (err) {
      console.error("Error deleting staff:", err);
      setError("Failed to delete staff. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
  };

  // Get status chip color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "on-leave":
        return "warning";
      default:
        return "default";
    }
  };

  // Get role color based on role
  const getRoleColor = (role: string) => {
    switch (role) {
      case "doctor":
        return "primary";
      case "nurse":
        return "secondary";
      case "admin":
        return "info";
      case "receptionist":
        return "success";
      case "pharmacist":
        return "warning";
      default:
        return "default";
    }
  };

  // Loading state
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
      {/* Header section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Staff Directory
        </Typography>

        {hasPermission("create:staff") && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/staff/new")}
          >
            Add New Staff
          </Button>
        )}
      </Box>

      {/* Error message */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Search and filters */}
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
            placeholder="Search staff..."
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
          >
            Filters
          </Button>
        </Box>

        {/* Filter options */}
        {showFilters && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="role-filter-label">Role</InputLabel>
                <Select
                  labelId="role-filter-label"
                  id="role-filter"
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="doctor">Doctors</MenuItem>
                  <MenuItem value="nurse">Nurses</MenuItem>
                  <MenuItem value="admin">Administrators</MenuItem>
                  <MenuItem value="receptionist">Receptionists</MenuItem>
                  <MenuItem value="pharmacist">Pharmacists</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="department-filter-label">Department</InputLabel>
                <Select
                  labelId="department-filter-label"
                  id="department-filter"
                  value={departmentFilter}
                  label="Department"
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <MenuItem value="all">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="on-leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Staff table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No staff found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((staffMember) => (
                    <TableRow key={staffMember.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography variant="body1">
                            {staffMember.firstName} {staffMember.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Joined:{" "}
                            {format(
                              new Date(staffMember.joinDate),
                              "MMM d, yyyy"
                            )}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            staffMember.role.charAt(0).toUpperCase() +
                            staffMember.role.slice(1)
                          }
                          color={getRoleColor(staffMember.role) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{staffMember.department}</TableCell>
                      <TableCell>
                        {staffMember.specialization || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography variant="body2">
                            {staffMember.contactNumber}
                          </Typography>
                          <Typography variant="caption">
                            {staffMember.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            staffMember.status.charAt(0).toUpperCase() +
                            staffMember.status.slice(1).replace("-", " ")
                          }
                          color={getStatusColor(staffMember.status) as any}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewStaff(staffMember.id)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>

                          {hasPermission("edit:staff") && (
                            <Tooltip title="Edit Staff">
                              <IconButton
                                size="small"
                                onClick={() => handleEditStaff(staffMember.id)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {hasPermission("delete:staff") && (
                            <Tooltip title="Delete Staff">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleDeleteClick(staffMember.id)
                                }
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
          count={filteredStaff.length}
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
            Are you sure you want to delete this staff member? This action
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

export default StaffList;
