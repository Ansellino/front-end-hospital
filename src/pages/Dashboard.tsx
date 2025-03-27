import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as dashboardService from "../services/dashboardService";
import { DashboardStats } from "../services/dashboardService";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingInvoices: 0,
    monthlySummary: [],
    recentAppointments: [],
    staffPerformance: [],
    inventoryAlerts: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pie chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Move fetchDashboardData outside useEffect so it can be called from anywhere
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchDashboardData()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="p-4 dashboard sm:p-6">
      <Typography
        variant="h4"
        component="h1"
        className="mb-6 text-xl sm:text-2xl md:text-3xl"
      >
        Dashboard
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Stats cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Card className="h-full transition-all duration-200 hover:shadow-md">
            <CardContent className="flex flex-col items-start justify-between p-4 sm:flex-row sm:items-center sm:p-5">
              <Box>
                <Typography
                  variant="h6"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Total Patients
                </Typography>
                <Typography
                  variant="h3"
                  className="mt-1 text-2xl font-bold sm:text-3xl"
                >
                  {stats.totalPatients}
                </Typography>
              </Box>
              <PersonIcon
                className="mt-2 text-primary-500 sm:mt-0"
                fontSize="large"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card className="h-full transition-all duration-200 hover:shadow-md">
            <CardContent className="flex flex-col items-start justify-between p-4 sm:flex-row sm:items-center sm:p-5">
              <div>
                <Typography
                  variant="h6"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Today's Appointments
                </Typography>
                <Typography
                  variant="h3"
                  className="mt-1 text-2xl font-bold sm:text-3xl"
                >
                  {stats.todayAppointments}
                </Typography>
              </div>
              <PersonIcon
                className="mt-2 text-primary-500 sm:mt-0"
                fontSize="large"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card className="h-full transition-all duration-200 hover:shadow-md">
            <CardContent className="flex flex-col items-start justify-between p-4 sm:flex-row sm:items-center sm:p-5">
              <div>
                <Typography
                  variant="h6"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Pending Invoices
                </Typography>
                <Typography
                  variant="h3"
                  className="mt-1 text-2xl font-bold sm:text-3xl"
                >
                  {stats.pendingInvoices}
                </Typography>
              </div>
              <PersonIcon
                className="mt-2 text-primary-500 sm:mt-0"
                fontSize="large"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Appointments Chart */}
        <Grid item xs={12} md={6}>
          <Card className="h-full">
            <CardContent className="p-4 sm:p-5">
              <Typography variant="h6" gutterBottom className="mb-3">
                Monthly Appointments
              </Typography>
              <Divider className="mb-4" />
              <div className="h-[250px] sm:h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.monthlySummary}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="appointments"
                      name="Appointments"
                      fill="#8884d8"
                    />
                    <Bar
                      dataKey="newPatients"
                      name="New Patients"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Card className="h-full">
            <CardContent className="p-4 sm:p-5">
              <Typography variant="h6" gutterBottom className="mb-3">
                Monthly Revenue
              </Typography>
              <Divider className="mb-4" />
              <div className="h-[250px] sm:h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.monthlySummary}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#ff7300"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Staff Performance */}
        {stats.staffPerformance && stats.staffPerformance.length > 0 && (
          <Grid item xs={12} md={6} sx={{ mb: 4 }}>
            {" "}
            {/* Added bottom margin here */}
            <Card>
              <CardContent sx={{ pb: 4 }}>
                {" "}
                {/* Existing bottom padding */}
                <Typography variant="h6" gutterBottom>
                  Staff Performance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.staffPerformance}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="appointmentsCompleted"
                      nameKey="name"
                      label={(entry) => entry.name}
                    >
                      {stats.staffPerformance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `${value} appointments`,
                        "Completed",
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Appointments */}
        {stats.recentAppointments && stats.recentAppointments.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Appointments
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                  {stats.recentAppointments.map((appointment, index) => (
                    <Box
                      key={appointment.id || index}
                      sx={{ mb: 2, p: 1, borderBottom: "1px solid #eee" }}
                    >
                      <Typography variant="subtitle2">
                        {appointment.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(
                          new Date(appointment.startTime),
                          "MMM d, h:mm a"
                        )}{" "}
                        - {appointment.status}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ pb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box className="flex flex-wrap gap-3">
                <Button
                  component={Link}
                  to="/medical-records/add"
                  startIcon={<AddIcon />}
                  variant="contained"
                  className="flex-grow transition-all duration-200 sm:flex-grow-0"
                  size="medium"
                >
                  New Medical Record
                </Button>

                <Button
                  component={Link}
                  to="/appointments/new"
                  startIcon={<EventIcon />}
                  variant="outlined"
                  className="flex-grow transition-all duration-200 sm:flex-grow-0"
                  size="medium"
                >
                  New Appointment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
