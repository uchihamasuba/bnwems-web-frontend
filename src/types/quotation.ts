// UC 2.10 (docs/api/08-quotations.md)

export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED';

export interface QuotationItem {
  catalogItemId: string;
  quantity: number;
  price: number;
}

// GET /api/v1/orders/:orderId/quotations
export interface Quotation {
  id: string;
  orderId: string;
  version: number;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: QuotationStatus;
  createdAt: string;
}

// GET /api/v1/quotations/:id
export interface QuotationDetail extends Quotation {
  details: { items: QuotationItem[] };
  updatedAt: string;
}

// POST /api/v1/orders/:orderId/quotations, PUT /api/v1/quotations/:id
export interface SaveQuotationPayload {
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  details: { items: QuotationItem[] };
}
