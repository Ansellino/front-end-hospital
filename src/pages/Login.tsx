import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  MedicalServices as MedicalServicesIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import * as yup from "yup";
import { useForm } from "../hooks/useForm";
import LoginService from "../services/loginService"; // Add this import

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password should be of minimum 8 characters length")
    .required("Password is required"),
});

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  // Get the page to redirect to after login (if any)
  const from = location.state?.from?.pathname || "/dashboard";

  const { formik, isSubmitting, error } = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // You can use LoginService directly here if you prefer
        // const { user } = await LoginService.login(values.email, values.password);
        // return user;

        // Or continue using the login function from useAuth
        return await login(values.email, values.password);
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      navigate(from, { replace: true });
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Redirect if already logged in (after all hooks are called)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
            <MedicalServicesIcon fontSize="large" />
          </Avatar>

          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Healthcare Management System
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              margin="normal"
              autoComplete="email"
              autoFocus
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              margin="normal"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </form>

          {/* Demo credentials */}
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              For demo purposes:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: admin@healthcare.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Password: admin123
            </Typography>
          </Box>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          © {new Date().getFullYear()} Healthcare Management System
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
