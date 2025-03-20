import api from "./api";
import { Invoice, InvoiceItem, Payment } from "../interfaces/billing";
import { v4 as uuidv4 } from "uuid";
import { addDays, subDays, format } from "date-fns";

/**
 * Service for handling billing-related API operations
 */
const BillingService = {
  /**
   * Get all invoices with optional filtering
   */
  getInvoices: async (params?: any) => {
    try {
      const response = await api.get("/invoices", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      // Return mock data if API fails
      return generateMockInvoices();
    }
  },

  /**
   * Get a single invoice by ID
   */
  getInvoice: async (id: string) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      // Return mock data for demo purposes
      const mockInvoices = generateMockInvoices();
      return (
        mockInvoices.find((invoice) => invoice.id === id) || mockInvoices[0]
      );
    }
  },

  /**
   * Get invoices for a specific patient
   */
  getPatientInvoices: async (patientId: string) => {
    try {
      const response = await api.get(`/patients/${patientId}/invoices`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching invoices for patient ${patientId}:`, error);
      // Return filtered mock data
      return generateMockInvoices().filter(
        (invoice) => invoice.patientId === patientId
      );
    }
  },

  /**
   * Create a new invoice
   */
  createInvoice: async (
    data: Omit<Invoice, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await api.post("/invoices", data);
      return response.data;
    } catch (error) {
      console.error("Error creating invoice:", error);
      // Return mock data for demo purposes
      const mockId = `inv-${uuidv4().substring(0, 8)}`;
      return {
        id: mockId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Update an existing invoice
   */
  updateInvoice: async (id: string, data: Partial<Invoice>) => {
    try {
      const response = await api.put(`/invoices/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating invoice ${id}:`, error);
      // Return mock data for demo purposes
      return {
        id,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Delete an invoice
   */
  deleteInvoice: async (id: string) => {
    try {
      const response = await api.delete(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting invoice ${id}:`, error);
      // Return success response for demo purposes
      return { success: true };
    }
  },

  /**
   * Record a payment for an invoice
   */
  recordPayment: async (data: Omit<Payment, "id" | "processedDate">) => {
    try {
      const response = await api.post("/payments", data);

      // Update the invoice balance if successful
      if (response.data) {
        const invoice = await BillingService.getInvoice(data.invoiceId);
        const newBalance = invoice.balance - data.amount;
        const newStatus = newBalance <= 0 ? "paid" : invoice.status;

        await BillingService.updateInvoice(data.invoiceId, {
          balance: newBalance,
          amountPaid: invoice.amountPaid + data.amount,
          status: newStatus,
          paidDate: newBalance <= 0 ? new Date().toISOString() : undefined,
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error recording payment:", error);
      // Return mock data for demo purposes
      return {
        id: `pmt-${uuidv4().substring(0, 8)}`,
        ...data,
        processedDate: new Date().toISOString(),
      };
    }
  },

  /**
   * Get payment history for an invoice
   */
  getInvoicePayments: async (invoiceId: string) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/payments`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payments for invoice ${invoiceId}:`, error);
      // Return mock data for demo purposes
      return generateMockPayments(invoiceId, 1);
    }
  },

  /**
   * Get billing statistics
   */
  getBillingStats: async (startDate?: string, endDate?: string) => {
    try {
      const response = await api.get("/billing/stats", {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching billing stats:", error);
      // Return mock stats
      return {
        totalInvoiced: 25850.0,
        totalPaid: 18275.5,
        outstandingBalance: 7574.5,
        invoicesByStatus: {
          draft: 3,
          sent: 15,
          paid: 42,
          overdue: 8,
          canceled: 2,
        },
        recentPayments: generateMockPayments("", 5),
      };
    }
  },
};

/**
 * Generate mock invoices for development
 */
const generateMockInvoices = (count: number = 20): Invoice[] => {
  const invoices: Invoice[] = [];
  const statuses: Invoice["status"][] = [
    "draft",
    "sent",
    "paid",
    "overdue",
    "canceled",
  ];
  const paymentMethods: ("cash" | "credit" | "insurance" | "check")[] = [
    "cash",
    "credit",
    "insurance",
    "check",
  ];

  // Generate mock patient IDs
  const patientIds = Array.from(
    { length: 10 },
    (_, i) => `p-${String(i + 1).padStart(3, "0")}`
  );

  for (let i = 0; i < count; i++) {
    const id = `inv-${uuidv4().substring(0, 8)}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdDate = subDays(new Date(), Math.floor(Math.random() * 60));
    const dueDate = addDays(createdDate, 30);
    const patientId = patientIds[Math.floor(Math.random() * patientIds.length)];

    // Create mock items
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const items: InvoiceItem[] = [];
    let totalAmount = 0;

    // Common medical services and their price ranges
    const services = [
      { name: "Office Visit", minPrice: 100, maxPrice: 200 },
      { name: "Consultation", minPrice: 150, maxPrice: 300 },
      { name: "Lab Test", minPrice: 80, maxPrice: 250 },
      { name: "X-Ray", minPrice: 200, maxPrice: 400 },
      { name: "Vaccination", minPrice: 50, maxPrice: 150 },
      { name: "Physical Therapy", minPrice: 120, maxPrice: 180 },
      { name: "Medication", minPrice: 30, maxPrice: 120 },
      { name: "Surgery", minPrice: 1000, maxPrice: 5000 },
    ];

    for (let j = 0; j < itemCount; j++) {
      const service = services[Math.floor(Math.random() * services.length)];
      const unitPrice =
        Math.floor(Math.random() * (service.maxPrice - service.minPrice)) +
        service.minPrice;
      const quantity = Math.floor(Math.random() * 3) + 1;
      const amount = unitPrice * quantity;

      items.push({
        id: `item-${uuidv4().substring(0, 8)}`,
        description: service.name,
        quantity,
        unitPrice,
        amount,
        serviceCode: `SVC-${Math.floor(Math.random() * 1000)}`,
        taxRate: 0, // Assuming medical services are tax-exempt
      });

      totalAmount += amount;
    }

    // Calculate payment info based on status
    let amountPaid = 0;
    let balance = totalAmount;
    let paidDate = undefined;

    if (status === "paid") {
      amountPaid = totalAmount;
      balance = 0;
      paidDate = addDays(
        createdDate,
        Math.floor(Math.random() * 15)
      ).toISOString();
    } else if (status === "sent" || status === "overdue") {
      // Some invoices might be partially paid
      if (Math.random() > 0.5) {
        amountPaid = Math.floor(totalAmount * (Math.random() * 0.8));
        balance = totalAmount - amountPaid;
      }
    }

    // Create the invoice
    invoices.push({
      id,
      patientId,
      appointmentId:
        Math.random() > 0.3 ? `appt-${uuidv4().substring(0, 8)}` : undefined,
      items,
      totalAmount,
      amountPaid,
      balance,
      status,
      dueDate: dueDate.toISOString(),
      paidDate,
      paymentMethod:
        status === "paid"
          ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
          : undefined,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
    });
  }

  return invoices;
};

/**
 * Generate mock payments for development
 */
const generateMockPayments = (
  invoiceId: string,
  count: number = 3
): Payment[] => {
  const payments: Payment[] = [];
  const paymentMethods: Payment["paymentMethod"][] = [
    "cash",
    "credit",
    "insurance",
    "check",
  ];
  const staffIds = ["ADMIN-001", "REC-001", "REC-002"];

  // If no invoiceId provided, generate random IDs
  const invoiceIds = invoiceId
    ? [invoiceId]
    : Array.from({ length: count }, () => `inv-${uuidv4().substring(0, 8)}`);

  for (let i = 0; i < count; i++) {
    const date = subDays(new Date(), Math.floor(Math.random() * 30));
    const method =
      paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const amount = Math.floor(Math.random() * 1000) + 100;

    payments.push({
      id: `pmt-${uuidv4().substring(0, 8)}`,
      invoiceId: invoiceIds[Math.min(i, invoiceIds.length - 1)],
      amount,
      paymentMethod: method,
      transactionId:
        method === "credit" || method === "insurance"
          ? `tr-${uuidv4().substring(0, 8)}`
          : undefined,
      notes: `Payment received via ${method}`,
      processedBy: staffIds[Math.floor(Math.random() * staffIds.length)],
      processedDate: date.toISOString(),
    });
  }

  return payments;
};

export default BillingService;
