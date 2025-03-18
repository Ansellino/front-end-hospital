/*
Create inventory components:

InventoryList - List all inventory items
StockLevelMonitor - Track stock levels
InventoryTransactions - Record stock adjustments
SupplierManagement - Manage suppliers
OrderManagement - Create purchase orders
*/

export interface InventoryItem {
  id: string;
  name: string;
  category: "medication" | "supply" | "equipment";
  sku: string;
  description: string;
  currentStock: number;
  reorderLevel: number;
  unitPrice: number;
  supplier: Supplier;
  location: string;
  expiryDate?: string;
  lastRestocked: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: "restock" | "use" | "dispose" | "transfer";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  transactionDate: string;
}
