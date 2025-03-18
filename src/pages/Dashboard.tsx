// pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as dashboardService from "../services/dashboardService";
import { DashboardStats } from "../services/dashboardService";

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <Grid container spacing={3}>
        {/* Stats cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Patients</Typography>
              <Typography variant="h3">{stats.totalPatients}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Other stat cards */}

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Monthly Appointments</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlySummary}>
                  {/* Chart configuration */}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        {/* Other charts */}
      </Grid>
    </div>
  );
};

export default Dashboard;
