/* 
Create billing components:

InvoiceList - List of all invoices
InvoiceDetails - Detailed view of an invoice
InvoiceGenerator - Create new invoices
PaymentProcessor - Record and process payments
BillingDashboard - Overview of financial metrics
*/

export interface Invoice {
  id: string;
  patientId: string;
  appointmentId?: string;
  items: InvoiceItem[];
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: "draft" | "sent" | "paid" | "overdue" | "canceled";
  dueDate: string;
  paidDate?: string;
  paymentMethod?: "cash" | "credit" | "insurance" | "check";
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  serviceCode?: string;
  taxRate?: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: "cash" | "credit" | "insurance" | "check";
  transactionId?: string;
  notes: string;
  processedBy: string;
  processedDate: string;
}
