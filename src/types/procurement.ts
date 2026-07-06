// UC 2.16 — Supplier Transactions (docs/api/04-suppliers.md)

export type SupplierTransactionType = 'rental' | 'purchase';
export type SupplierTransactionStatus =
  | 'draft'
  | 'approved'
  | 'waiting_for_approval'
  | 'received'
  | 'returned'
  | 'cancelled';

export interface SupplierTransaction {
  supplierTransactionId: string;
  supplierId: string;
  supplierName?: string; // join từ Supplier (MOCK — backend chỉ trả supplierId)
  orderId: string;
  transactionType: SupplierTransactionType;
  totalCost: number;
  depositAmount: number;
  itemDescription: string;
  status: SupplierTransactionStatus;
  createdAt: string;
}

export interface CreateSupplierTransactionPayload {
  supplierId: string;
  orderId: string;
  transactionType: SupplierTransactionType;
  totalCost: number;
  depositAmount: number;
  itemDescription: string;
}

export interface GetSupplierTransactionsQuery {
  page?: number;
  limit?: number;
  supplierId?: string;
  orderId?: string;
  status?: string;
}
