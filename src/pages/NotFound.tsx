import React from "react";
import { Box, Button, Container, Typography, Paper } from "@mui/material";
import {
  SentimentDissatisfied as SadFaceIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper
        sx={{
          p: 6,
          borderRadius: 2,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        elevation={3}
      >
        <SadFaceIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />

        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          404
        </Typography>

        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: "60ch" }}
        >
          The page you are looking for doesn't exist or has been moved. Please
          check the URL or navigate back to a known location.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            size="large"
          >
            Go Back
          </Button>

          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/dashboard")}
            size="large"
          >
            Go to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;
