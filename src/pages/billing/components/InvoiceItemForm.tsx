import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { InvoiceItem } from "../../../interfaces/billing";
import { v4 as uuidv4 } from "uuid";

interface InvoiceItemFormProps {
  items: (Omit<InvoiceItem, "id"> & { tempId: string })[];
  onChange: (items: (Omit<InvoiceItem, "id"> & { tempId: string })[]) => void;
  readOnly?: boolean;
  showTaxRate?: boolean;
}

// Common medical services for quick selection
const COMMON_SERVICES = [
  { name: "Office Visit", price: 150, code: "OV-100" },
  { name: "Consultation", price: 200, code: "CONS-200" },
  { name: "Lab Test - Basic", price: 120, code: "LAB-100" },
  { name: "Lab Test - Comprehensive", price: 250, code: "LAB-200" },
  { name: "X-Ray", price: 300, code: "XR-100" },
  { name: "MRI", price: 800, code: "MRI-100" },
  { name: "Physical Therapy Session", price: 150, code: "PT-100" },
  { name: "Medication Administration", price: 80, code: "MED-100" },
];

// Default empty invoice item
const emptyInvoiceItem: Omit<InvoiceItem, "id"> & { tempId: string } = {
  tempId: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  amount: 0,
  serviceCode: "",
  taxRate: 0,
};

const InvoiceItemForm: React.FC<InvoiceItemFormProps> = ({
  items,
  onChange,
  readOnly = false,
  showTaxRate = false,
}) => {
  // State to track quick service menu visibility
  const [showQuickServices, setShowQuickServices] = useState(false);

  // Add a new item to the list
  const handleAddItem = () => {
    const newItem = {
      ...emptyInvoiceItem,
      tempId: uuidv4(),
    };
    onChange([...items, newItem]);
  };

  // Remove an item from the list
  const handleRemoveItem = (tempId: string) => {
    if (items.length === 1) {
      // If it's the last item, just reset it instead of removing
      onChange([{ ...emptyInvoiceItem, tempId: uuidv4() }]);
    } else {
      onChange(items.filter((item) => item.tempId !== tempId));
    }
  };

  // Update a specific field in an item
  const handleUpdateItem = (
    tempId: string,
    field: keyof Omit<InvoiceItem, "id">,
    value: any
  ) => {
    const updatedItems = items.map((item) => {
      if (item.tempId === tempId) {
        const updatedItem = { ...item, [field]: value };

        // Recalculate amount if quantity or unit price changes
        if (field === "quantity" || field === "unitPrice") {
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
        }

        return updatedItem;
      }
      return item;
    });

    onChange(updatedItems);
  };

  // Add a common service as a new item
  const handleAddCommonService = (service: (typeof COMMON_SERVICES)[0]) => {
    const newItem = {
      ...emptyInvoiceItem,
      tempId: uuidv4(),
      description: service.name,
      unitPrice: service.price,
      amount: service.price, // Quantity defaults to 1
      serviceCode: service.code,
    };

    onChange([...items, newItem]);
    setShowQuickServices(false);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Initialize with at least one empty item if none provided
  useEffect(() => {
    if (items.length === 0 && !readOnly) {
      handleAddItem();
    }
  }, []);

  return (
    <Box>
      {/* Item list */}
      <Paper variant="outlined" sx={{ mb: 3, overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: "rgba(0, 0, 0, 0.04)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <Grid container>
            <Grid item xs={5}>
              <Typography variant="subtitle2">Description</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle2" align="center">
                Quantity
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle2" align="center">
                Unit Price
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subtitle2" align="center">
                Amount
              </Typography>
            </Grid>
            {!readOnly && (
              <Grid item xs={1}>
                <Typography variant="subtitle2" align="center">
                  Actions
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Item rows */}
        {items.map((item) => (
          <Box
            key={item.tempId}
            sx={{ p: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.12)" }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Description */}
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Description"
                  value={item.description}
                  onChange={(e) =>
                    handleUpdateItem(item.tempId, "description", e.target.value)
                  }
                  disabled={readOnly}
                  variant={readOnly ? "filled" : "outlined"}
                  InputProps={{
                    endAdornment: item.serviceCode ? (
                      <InputAdornment position="end">
                        <Tooltip title="Service Code">
                          <Typography variant="caption" color="textSecondary">
                            {item.serviceCode}
                          </Typography>
                        </Tooltip>
                      </InputAdornment>
                    ) : null,
                  }}
                />
                {!readOnly && (
                  <TextField
                    size="small"
                    label="Service Code"
                    value={item.serviceCode || ""}
                    onChange={(e) =>
                      handleUpdateItem(
                        item.tempId,
                        "serviceCode",
                        e.target.value
                      )
                    }
                    sx={{ mt: 3, width: "60%" }} // Changed from mt: 1 to mt: 2 for more space
                  />
                )}
              </Grid>

              {/* Quantity */}
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Qty"
                  inputProps={{ min: 1, step: 1 }}
                  value={item.quantity}
                  onChange={(e) =>
                    handleUpdateItem(
                      item.tempId,
                      "quantity",
                      Math.max(1, parseInt(e.target.value) || 0)
                    )
                  }
                  disabled={readOnly}
                  variant={readOnly ? "filled" : "outlined"}
                />
              </Grid>

              {/* Unit Price */}
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Price"
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleUpdateItem(
                      item.tempId,
                      "unitPrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  disabled={readOnly}
                  variant={readOnly ? "filled" : "outlined"}
                />
              </Grid>

              {/* Amount (calculated) */}
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Amount"
                  value={formatCurrency(item.amount)}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="filled"
                />
              </Grid>

              {/* Actions */}
              {!readOnly && (
                <Grid item xs={1} sx={{ textAlign: "center" }}>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveItem(item.tempId)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              )}

              {/* Tax Rate (optional) */}
              {showTaxRate && !readOnly && (
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    size="small"
                    type="number"
                    label="Tax Rate (%)"
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    value={item.taxRate || 0}
                    onChange={(e) =>
                      handleUpdateItem(
                        item.tempId,
                        "taxRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        ))}
      </Paper>

      {/* Add buttons */}
      {!readOnly && (
        <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
          <Box>
            {showQuickServices ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {COMMON_SERVICES.map((service) => (
                  <Button
                    key={service.code}
                    size="small"
                    variant="outlined"
                    onClick={() => handleAddCommonService(service)}
                  >
                    {service.name}
                  </Button>
                ))}
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setShowQuickServices(false)}
                >
                  Close
                </Button>
              </Box>
            ) : (
              <Button
                size="small"
                onClick={() => setShowQuickServices(true)}
                startIcon={<InfoIcon />}
              >
                Quick Add Services
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default InvoiceItemForm;
