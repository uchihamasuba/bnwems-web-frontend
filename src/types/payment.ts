// UC 2.19 (docs/api/11-payments-settlement.md)
// Lưu ý: response thật của GET .../payments MỎNG hơn doc — đọc trực tiếp
// D:\bnwems-backend-api\src\services\payment.service.ts (getPaymentsByOrder →
// prisma.payment.findMany) xác nhận KHÔNG có paymentType, KHÔNG có evidences[] lồng nhau.
export type PaymentMethod = 'cash' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'success' | 'failed';

// GET /api/v1/orders/:orderId/payments
export interface Payment {
  paymentId: string;
  paymentRequestId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  confirmedBy: string;
  confirmedAt: string | null;
  createdAt: string;
}

export type PaymentType = 'deposit' | 'final';

// POST /api/v1/orders/:orderId/payments/request — body
export interface RequestPaymentPayload {
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod | 'VNPAY_QR'; // 'VNPAY_QR' phải viết hoa đúng — payment.controller.ts so khớp chuỗi chính xác để trả paymentUrl
}

// POST .../payments/request — response data thật: { id, paymentUrl } (KHÔNG phải paymentRequestId)
export interface RequestPaymentResult {
  id: string;
  paymentUrl: string | null;
}

// PUT /api/v1/payments/:id/confirm — body
// CHÚ Ý: :id ở route này là paymentRequestId (id trả về từ RequestPaymentResult), KHÔNG phải
// paymentId xuất hiện trong các dòng của GET .../payments — xem payment.service.ts confirmPaymentRequest().
export interface ConfirmPaymentPayload {
  status: 'completed';
  evidenceUrl?: string;
}
