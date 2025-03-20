import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import BillingService from "../../services/billingService";
import { Invoice, Payment } from "../../interfaces/billing";
import * as patientService from "../../services/patientService";
import PaymentForm from "./components/PaymentForm";

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [patient, setPatient] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Fetch invoice data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const invoiceData = await BillingService.getInvoice(id);
        setInvoice(invoiceData);

        // Fetch related data in parallel
        const [patientData, paymentsData] = await Promise.all([
          patientService.getPatientById(invoiceData.patientId), // Use the correct method for a single patient
          BillingService.getInvoicePayments(id),
        ]);

        setPatient(patientData);
        setPayments(paymentsData);
      } catch (err: any) {
        console.error("Error fetching invoice:", err);
        setError(err.message || "Failed to load invoice data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle print functionality
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${invoice?.id}`,
  } as any);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "overdue":
        return "error";
      case "sent":
        return "primary";
      case "draft":
        return "default";
      case "canceled":
        return "warning";
      default:
        return "default";
    }
  };

  // Handle payment dialog
  const handlePaymentDialogOpen = () => {
    if (invoice) {
      setPaymentAmount(invoice.balance);
    }
    setOpenPaymentDialog(true);
  };

  const handlePaymentDialogClose = () => {
    setOpenPaymentDialog(false);
    setPaymentAmount(0);
    setPaymentMethod("cash");
    setPaymentNotes("");
  };

  // Submit payment
  const handlePaymentSubmit = async () => {
    if (!invoice || !id) return;

    try {
      setSubmittingPayment(true);

      const paymentData = {
        invoiceId: id,
        amount: paymentAmount,
        paymentMethod: paymentMethod as any,
        notes: paymentNotes,
        processedBy: "STAFF-001", // In a real app, get from auth context
      };

      await BillingService.recordPayment(paymentData);

      // Refresh data
      const [updatedInvoice, updatedPayments] = await Promise.all([
        BillingService.getInvoice(id),
        BillingService.getInvoicePayments(id),
      ]);

      setInvoice(updatedInvoice);
      setPayments(updatedPayments);
      handlePaymentDialogClose();
    } catch (err: any) {
      console.error("Error recording payment:", err);
      setError(err.message || "Failed to record payment");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Handle invoice deletion
  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      await BillingService.deleteInvoice(id);
      navigate("/billing");
    } catch (err: any) {
      console.error("Error deleting invoice:", err);
      setError(err.message || "Failed to delete invoice");
      setOpenDeleteDialog(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: Invoice["status"]) => {
    if (!invoice || !id) return;

    try {
      await BillingService.updateInvoice(id, { status: newStatus });

      // Refresh invoice data
      const updatedInvoice = await BillingService.getInvoice(id);
      setInvoice(updatedInvoice);
    } catch (err: any) {
      console.error("Error updating invoice status:", err);
      setError(err.message || "Failed to update invoice status");
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/billing")}
        >
          Back to Invoices
        </Button>
      </Container>
    );
  }

  if (!invoice) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Invoice not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/billing")}
          sx={{ mt: 2 }}
        >
          Back to Invoices
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Action Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/billing")}
        >
          Back to Invoices
        </Button>
        <Box>
          <Stack direction="row" spacing={2}>
            {invoice.status === "draft" && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/billing/edit/${id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  Delete
                </Button>
              </>
            )}
            {invoice.status === "draft" && (
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                onClick={() => handleStatusChange("sent")}
              >
                Mark as Sent
              </Button>
            )}
            {(invoice.status === "sent" || invoice.status === "overdue") && (
              <Button
                variant="contained"
                color="success"
                startIcon={<AttachMoneyIcon />}
                onClick={handlePaymentDialogOpen}
              >
                Record Payment
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={(e) => {
                e.preventDefault();
                handlePrint();
              }}
            >
              Print
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Invoice Content */}
      <Paper sx={{ p: 4, mb: 4 }} ref={printRef}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              INVOICE
            </Typography>
            <Typography variant="body2" color="text.secondary">
              # INV-{invoice.id.substring(0, 8)}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip
                label={
                  invoice.status.charAt(0).toUpperCase() +
                  invoice.status.slice(1)
                }
                color={getStatusColor(invoice.status) as any}
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="body2" align="right">
              <strong>Issue Date:</strong>{" "}
              {format(new Date(invoice.createdAt), "MMMM d, yyyy")}
            </Typography>
            <Typography variant="body2" align="right">
              <strong>Due Date:</strong>{" "}
              {format(new Date(invoice.dueDate), "MMMM d, yyyy")}
            </Typography>
            {invoice.paidDate && (
              <Typography variant="body2" align="right">
                <strong>Paid Date:</strong>{" "}
                {format(new Date(invoice.paidDate), "MMMM d, yyyy")}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Patient Info */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Bill To:
            </Typography>
            {patient ? (
              <>
                <Typography variant="body1">
                  <strong>
                    {patient.firstName} {patient.lastName}
                  </strong>
                </Typography>
                <Typography variant="body2">
                  {patient.address?.street || ""}
                </Typography>
                <Typography variant="body2">
                  {patient.address?.city || ""}, {patient.address?.state || ""}{" "}
                  {patient.address?.zipCode || ""}
                </Typography>
                <Typography variant="body2">{patient.contactNumber}</Typography>
                <Typography variant="body2">{patient.email}</Typography>
              </>
            ) : (
              <Typography variant="body2">
                Patient ID: {invoice.patientId}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom align="right">
              From:
            </Typography>
            <Typography variant="body1" align="right">
              <strong>Healthcare Management System</strong>
            </Typography>
            <Typography variant="body2" align="right">
              123 Medical Center Drive
            </Typography>
            <Typography variant="body2" align="right">
              Anytown, ST 12345
            </Typography>
            <Typography variant="body2" align="right">
              (555) 123-4567
            </Typography>
            <Typography variant="body2" align="right">
              billing@healthcare-mgmt.com
            </Typography>
          </Grid>
        </Grid>

        {/* Invoice Items */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
                <TableCell>
                  <strong>Description</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Qty</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Unit Price</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Amount</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.description}
                    {item.serviceCode && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        Service Code: {item.serviceCode}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals */}
        <Grid container>
          <Grid item xs={12} md={5} sx={{ ml: "auto" }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={7}>
                  <Typography variant="body1">Subtotal:</Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="body1" align="right">
                    {formatCurrency(invoice.totalAmount)}
                  </Typography>
                </Grid>

                <Grid item xs={7}>
                  <Typography variant="body1">Amount Paid:</Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="body1" align="right">
                    {formatCurrency(invoice.amountPaid)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={7}>
                  <Typography variant="h6">Balance Due:</Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="h6" align="right">
                    {formatCurrency(invoice.balance)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Payment Method */}
        {invoice.paymentMethod && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2">
              <strong>Payment Method:</strong>{" "}
              {invoice.paymentMethod.charAt(0).toUpperCase() +
                invoice.paymentMethod.slice(1)}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Payment History */}
      {payments.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Payment History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(new Date(payment.processedDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      {payment.paymentMethod.charAt(0).toUpperCase() +
                        payment.paymentMethod.slice(1)}
                    </TableCell>
                    <TableCell>{payment.transactionId || "-"}</TableCell>
                    <TableCell>{payment.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Payment Dialog */}
      <PaymentForm
        invoiceId={id!}
        invoiceNumber={invoice.id.substring(0, 8)}
        currentBalance={invoice.balance}
        isOpen={openPaymentDialog}
        onClose={handlePaymentDialogClose}
        onPaymentSuccess={async (payment) => {
          // Refresh invoice data
          const [updatedInvoice, updatedPayments] = await Promise.all([
            BillingService.getInvoice(id!),
            BillingService.getInvoicePayments(id!),
          ]);

          setInvoice(updatedInvoice);
          setPayments(updatedPayments);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this invoice? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InvoiceDetail;
