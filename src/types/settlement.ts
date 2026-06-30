// UC 2.19 & 2.30 (docs/api/11-payments-settlement.md)
// Backend thật KHÔNG có GET để lấy lại Settlement theo id hoặc orderId — xem docs/more-require.md mục (a).
export type SettlementStatus = 'draft' | 'recorded' | 'confirmed';

// POST /api/v1/orders/:orderId/settlement — body khớp D:\bnwems-backend-api\src\validators\settlement.validator.ts
// (additionalFees số nhiều — đã xác nhận khớp validator thật, không phải lỗi đánh máy).
export interface RecordSettlementPayload {
  originalValue: number;
  additionalFees?: number;
  compensation?: number;
  paidAmount?: number;
  remainingAmount: number; // phải = originalValue + additionalFees - compensation - paidAmount (sai > 0.1 → 400 MSG-UC30-01)
  evidences?: { fileUrl: string }[];
}

// POST .../settlement — response data thật: { settlementId } (KHÔNG phải "id")
export interface RecordSettlementResult {
  settlementId: string;
}

// PUT /api/v1/settlements/:id/confirm — body
export interface ConfirmSettlementPayload {
  status: 'confirmed';
}

// ===== MOCK-ONLY — backend không có GET cho Settlement/Damage-Loss, xem docs/more-require.md =====
// Các interface dưới đây chỉ phục vụ route handler mock tại
// src/app/api/v1/orders/[id]/settlement-preview/route.ts, KHÔNG map 1:1 với Prisma Settlement thật.
export interface SettlementSurchargeLineMock {
  reason: string;
  amount: number;
}

export interface SettlementDamageLineMock {
  damageLossItemId: string;
  icon: string; // tên icon lucide-react, vd "WineOff", "Mic"
  itemName: string;
  amount: number;
  responsible: 'customer' | 'staff_wage_deduction';
  responsibleStaffName?: string; // chỉ có khi responsible === 'staff_wage_deduction'
}

export interface SettlementPreviewMock {
  orderId: string;
  originalValue: number;
  additionalFees: number;
  discount: number; // "Giảm trừ/Ưu đãi" — KHÔNG có field tương ứng trong API thật, chỉ hiển thị — xem docs/more-require.md mục (k)
  totalPaid: number;
  surchargeLines: SettlementSurchargeLineMock[];
  damageLines: SettlementDamageLineMock[];
}
