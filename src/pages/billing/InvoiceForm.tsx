import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Invoice, InvoiceItem } from "../../interfaces/billing";
import { useFormik } from "formik";
import * as Yup from "yup";
import { v4 as uuidv4 } from "uuid";
import { format, addDays } from "date-fns";
import InvoiceItemForm from "./components/InvoiceItemForm";

// Initial empty invoice item
const emptyInvoiceItem: Omit<InvoiceItem, "id"> = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  amount: 0,
  serviceCode: "",
  taxRate: 0,
};

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const patientId = location.state?.patientId;
  const appointmentId = location.state?.appointmentId;

  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<
    (Omit<InvoiceItem, "id"> & { tempId: string })[]
  >([]);

  // Fetch patient data if patientId is available
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        // Replace with your actual patient service call
        const response = await fetch(`/api/patients/${patientId}`);
        const data = await response.json();
        setPatient(data);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to load patient information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // Calculate total amount
  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  };

  // Handler for when items change
  const handleItemsChange = (
    updatedItems: (Omit<InvoiceItem, "id"> & { tempId: string })[]
  ) => {
    setInvoiceItems(updatedItems);

    // Update total amount if needed
    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    // Update your invoice state here with the new total
  };

  // Form validation schema
  const validationSchema = Yup.object({
    dueDate: Yup.date().required("Due date is required"),
    status: Yup.string().required("Status is required"),
  });

  // Form initialization
  const formik = useFormik({
    initialValues: {
      patientId: patientId || "",
      appointmentId: appointmentId || "",
      dueDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      status: "draft",
      paymentMethod: "",
      notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // Format invoice data
        const invoiceData: Partial<Invoice> = {
          patientId: values.patientId,
          appointmentId: values.appointmentId || undefined,
          items: invoiceItems.map((item) => ({
            id: uuidv4(),
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            serviceCode: item.serviceCode,
            taxRate: item.taxRate,
          })),
          totalAmount: calculateTotal(),
          amountPaid: 0,
          balance: calculateTotal(),
          status: values.status as any,
          dueDate: values.dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Submit invoice to API
        // Replace with your actual invoice service call
        const response = await fetch("/api/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
        });

        if (!response.ok) {
          throw new Error("Failed to create invoice");
        }

        // Navigate back to invoice list
        navigate("/billing");
      } catch (err: any) {
        console.error("Error creating invoice:", err);
        setError(err.message || "Failed to create invoice. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  if (loading && !invoiceItems) {
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Create New Invoice
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Patient Information */}
        {patient && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Patient Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography>
                  <strong>Name:</strong> {patient.firstName} {patient.lastName}
                </Typography>
                <Typography>
                  <strong>Patient ID:</strong> {patient.id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography>
                  <strong>Email:</strong> {patient.email}
                </Typography>
                <Typography>
                  <strong>Phone:</strong> {patient.contactNumber}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        <form onSubmit={formik.handleSubmit}>
          {/* Invoice Details */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Invoice Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Due Date"
                  value={new Date(formik.values.dueDate)}
                  onChange={(date) => {
                    if (date) {
                      formik.setFieldValue(
                        "dueDate",
                        format(date, "yyyy-MM-dd")
                      );
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error:
                        formik.touched.dueDate &&
                        Boolean(formik.errors.dueDate),
                      helperText:
                        formik.touched.dueDate && formik.errors.dueDate,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.status && Boolean(formik.errors.status)
                    }
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="sent">Sent</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Invoice Items */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Invoice Items</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() =>
                  setInvoiceItems([
                    ...invoiceItems,
                    { ...emptyInvoiceItem, tempId: uuidv4() },
                  ])
                }
                variant="outlined"
                size="small"
              >
                Add Item
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <InvoiceItemForm
              items={invoiceItems}
              onChange={handleItemsChange}
              showTaxRate={false} // Set to true if you want to include tax rates
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Typography variant="h6">
                Total: ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Notes */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Notes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField
              fullWidth
              multiline
              rows={3}
              name="notes"
              value={formik.values.notes}
              onChange={formik.handleChange}
              placeholder="Add any notes or special instructions for this invoice"
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {formik.values.status === "draft"
                ? "Save as Draft"
                : "Create Invoice"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default InvoiceForm;
