// Trang /admin/orders_audit/payments ("Đặt cọc & Thanh toán") code THUẦN GIAO DIỆN theo mục 0
// CLAUDE.md — dùng dữ liệu ảo dưới đây, không gọi API thật. Mỗi đơn có 1 hồ sơ đặt cọc (deposit) và 1
// hồ sơ quyết toán cuối kỳ (settlement) riêng, hiển thị qua 2 tab ở trang chi tiết
// /admin/orders_audit/payments/[id].

export type DepositStatus = 'RECEIVED' | 'PENDING';
export type SettlementStatus = 'UNSETTLED' | 'SETTLED';

export const DEPOSIT_STATUS_META: Record<DepositStatus, { label: string; badgeClass: string }> = {
  RECEIVED: { label: 'Đã nhận cọc', badgeClass: 'bg-emerald-100 text-emerald-700' },
  PENDING: { label: 'Chờ thanh toán', badgeClass: 'bg-amber-100 text-amber-700' },
};

export const SETTLEMENT_STATUS_META: Record<SettlementStatus, { label: string; badgeClass: string }> = {
  UNSETTLED: { label: 'Chưa quyết toán', badgeClass: 'bg-slate-100 text-slate-500' },
  SETTLED: { label: 'Đã thanh toán', badgeClass: 'bg-emerald-100 text-emerald-700' },
};

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'bank_transfer', label: 'Chuyển khoản Ngân hàng' },
  { value: 'cash', label: 'Tiền mặt' },
];

export interface DepositEvidence {
  fileName: string;
  note: string;
}

export interface AdminOrderPayment {
  orderId: string;
  orderCode: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  eventStatus: string;
  managerName: string;
  customerName: string;
  customerPhone: string;
  totalValue: number;
  depositAmount: number;
  /** true = số tiền cọc chỉ là ước tính từ báo giá, chưa có yêu cầu cọc thật (chưa có phương thức). */
  depositIsEstimated: boolean;
  depositEstimatedLabel?: string;
  depositCode: string;
  depositDueDate: string;
  depositPaymentDate?: string;
  depositStatus: DepositStatus;
  paymentMethod: string | null;
  depositEvidence?: DepositEvidence;
  accountantNote?: string;
  settlementStatus: SettlementStatus;
  settlementNote?: string;
}

function transferContentOf(order: Pick<AdminOrderPayment, 'depositCode' | 'orderCode'>): string {
  return `${order.depositCode} CHUYEN KHOAN DAT COC ${order.orderCode}`;
}

const SEED: AdminOrderPayment[] = [
  {
    orderId: 'order-1',
    orderCode: 'DH-001',
    eventTitle: 'Tiệc cưới cao cấp Gia đình An - Lan',
    eventDate: '2026-07-25',
    venue: 'Sảnh Platinum, White Palace',
    eventStatus: 'Processing',
    managerName: 'Trần Minh Quân',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0912345678',
    totalValue: 85_000_000,
    depositAmount: 40_000_000,
    depositIsEstimated: false,
    depositCode: 'DEP-001',
    depositDueDate: '2026-05-20',
    depositPaymentDate: '2026-05-18',
    depositStatus: 'RECEIVED',
    paymentMethod: 'bank_transfer',
    depositEvidence: { fileName: 'Minh_chung_chuyen_khoan.jpg', note: 'Sao kê điện tử chuẩn' },
    accountantNote: 'Khách hàng Nguyễn Văn An đã chuyển khoản chuẩn xác. Đã xác nhận cọc đợt 1 thành công.',
    settlementStatus: 'UNSETTLED',
  },
  {
    orderId: 'order-2',
    orderCode: 'DH-002',
    eventTitle: 'Hội nghị khách hàng thường niên Vietcombank',
    eventDate: '2026-06-20',
    venue: 'Trung tâm hội nghị Quốc gia',
    eventStatus: 'Completed',
    managerName: 'Trần Minh Quân',
    customerName: 'Trần Thị Bích',
    customerPhone: '0987654321',
    totalValue: 55_000_000,
    depositAmount: 55_000_000,
    depositIsEstimated: false,
    depositCode: 'DEP-002',
    depositDueDate: '2026-06-15',
    depositPaymentDate: '2026-06-14',
    depositStatus: 'RECEIVED',
    paymentMethod: 'bank_transfer',
    depositEvidence: { fileName: 'UNC_VCB_DEP002.pdf', note: 'Ủy nhiệm chi ngân hàng' },
    accountantNote: 'Đã đối soát khớp số tiền toàn bộ hợp đồng — thanh toán 1 lần.',
    settlementStatus: 'SETTLED',
    settlementNote: 'Đã quyết toán đủ 100% giá trị hợp đồng, không phát sinh phụ phí.',
  },
  {
    orderId: 'order-3',
    orderCode: 'DH-003',
    eventTitle: 'Tiệc sinh nhật ngoài trời sân vườn Ánh Dương',
    eventDate: '2026-07-18',
    venue: 'Sân vườn Ánh Dương',
    eventStatus: 'New',
    managerName: 'Trần Minh Quân',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0912345678',
    totalValue: 12_000_000,
    depositAmount: 5_000_000,
    depositIsEstimated: false,
    depositCode: 'DEP-003',
    depositDueDate: '2026-07-11',
    depositStatus: 'PENDING',
    paymentMethod: 'bank_transfer',
    settlementStatus: 'UNSETTLED',
  },
  {
    orderId: 'order-4',
    orderCode: 'DH-004',
    eventTitle: 'Sự kiện chốt từ báo giá BG-001',
    eventDate: '2026-08-02',
    venue: 'Đang cập nhật',
    eventStatus: 'New',
    managerName: 'Trần Minh Quân',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0912345678',
    totalValue: 85_000_000,
    depositAmount: 42_500_000,
    depositIsEstimated: false,
    depositCode: 'DEP-004',
    depositDueDate: '2026-07-12',
    depositStatus: 'PENDING',
    paymentMethod: 'bank_transfer',
    settlementStatus: 'UNSETTLED',
  },
  {
    orderId: 'order-5',
    orderCode: 'DH-005',
    eventTitle: 'Sự kiện chốt từ báo giá BG-001',
    eventDate: '2026-08-02',
    venue: 'Đang cập nhật',
    eventStatus: 'New',
    managerName: 'Trần Minh Quân',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0912345678',
    totalValue: 85_000_000,
    depositAmount: 42_500_000,
    depositIsEstimated: true,
    depositEstimatedLabel: 'Dự kiến 50%',
    depositCode: 'DEP-005',
    depositDueDate: '2026-07-19',
    depositStatus: 'PENDING',
    paymentMethod: null,
    settlementStatus: 'UNSETTLED',
  },
];

let store: AdminOrderPayment[] = SEED;

export function getAdminOrderPayments(): AdminOrderPayment[] {
  return store;
}

export function getAdminOrderPaymentById(orderId: string): AdminOrderPayment | undefined {
  return store.find((o) => o.orderId === orderId);
}

export function getDepositTransferContent(order: AdminOrderPayment): string {
  return transferContentOf(order);
}

// Chỉ cho sửa số tiền cọc khi hồ sơ còn "Chờ thanh toán" (PENDING) — cọc đã nhận (RECEIVED) thì
// khóa số tiền vì đã đối soát/lưu vết kế toán, tương tự ràng buộc ở khối "Xác nhận đã nhận cọc".
export function updateAdminOrderDepositAmount(orderId: string, depositAmount: number): void {
  store = store.map((o) => (o.orderId === orderId && o.depositStatus === 'PENDING' ? { ...o, depositAmount } : o));
}

export function confirmAdminOrderDeposit(orderId: string, paymentMethod: string): void {
  const today = new Date().toISOString().slice(0, 10);
  store = store.map((o) =>
    o.orderId === orderId
      ? {
          ...o,
          depositStatus: 'RECEIVED',
          depositIsEstimated: false,
          paymentMethod,
          depositPaymentDate: o.depositPaymentDate ?? today,
        }
      : o,
  );
}

export function confirmAdminOrderSettlement(orderId: string, note?: string): void {
  store = store.map((o) => (o.orderId === orderId ? { ...o, settlementStatus: 'SETTLED', settlementNote: note ?? o.settlementNote } : o));
}
