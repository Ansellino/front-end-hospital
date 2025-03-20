import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Payment } from "../../../interfaces/billing";
import BillingService from "../../../services/billingService";

interface PaymentFormProps {
  invoiceId: string;
  invoiceNumber: string;
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (payment: Payment) => void;
  mode?: "dialog" | "inline";
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  invoiceId,
  invoiceNumber,
  currentBalance,
  isOpen,
  onClose,
  onPaymentSuccess,
  mode = "dialog",
}) => {
  const [paymentAmount, setPaymentAmount] = useState<number>(currentBalance);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [transactionId, setTransactionId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Reset form to initial state
  const resetForm = () => {
    setPaymentAmount(currentBalance);
    setPaymentMethod("cash");
    setTransactionId("");
    setNotes("");
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (paymentAmount <= 0 || paymentAmount > currentBalance) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const paymentData = {
        invoiceId,
        amount: paymentAmount,
        paymentMethod: paymentMethod as
          | "cash"
          | "credit"
          | "insurance"
          | "check",
        transactionId: transactionId || undefined,
        notes,
        processedBy: "STAFF-001", // In a real app, get from auth context
      };

      const result = await BillingService.recordPayment(paymentData);

      if (result) {
        onPaymentSuccess(result);
        if (mode === "dialog") {
          onClose();
        } else {
          resetForm();
        }
      }
    } catch (err: any) {
      console.error("Error processing payment:", err);
      setError(err.message || "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog close (for dialog mode)
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Determine if payment method requires transaction ID
  const requiresTransactionId =
    paymentMethod === "credit" || paymentMethod === "insurance";

  const formContent = (
    <>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            error={paymentAmount <= 0 || paymentAmount > currentBalance}
            helperText={
              paymentAmount <= 0
                ? "Amount must be greater than 0"
                : paymentAmount > currentBalance
                ? `Amount cannot exceed the balance of ${formatCurrency(
                    currentBalance
                  )}`
                : ""
            }
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="credit">Credit Card</MenuItem>
              <MenuItem value="insurance">Insurance</MenuItem>
              <MenuItem value="check">Check</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {requiresTransactionId && (
          <Grid item xs={12}>
            <TextField
              label={
                paymentMethod === "credit" ? "Transaction ID" : "Claim Number"
              }
              fullWidth
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            label="Notes"
            fullWidth
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any relevant details about this payment"
          />
        </Grid>
      </Grid>
    </>
  );

  // Render as dialog or inline form based on mode prop
  if (mode === "dialog") {
    return (
      <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Record a payment for invoice #{invoiceNumber}
          </DialogContentText>
          {formContent}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              loading ||
              paymentAmount <= 0 ||
              paymentAmount > currentBalance ||
              (requiresTransactionId && !transactionId)
            }
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Inline form mode
  return (
    <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Record Payment
      </Typography>
      {formContent}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            loading ||
            paymentAmount <= 0 ||
            paymentAmount > currentBalance ||
            (requiresTransactionId && !transactionId)
          }
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Record Payment
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentForm;
