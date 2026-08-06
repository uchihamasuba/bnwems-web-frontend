// Trang /manager/dashboard THUẦN GIAO DIỆN theo mục 0 CLAUDE.md — dữ liệu ảo cố định, chưa nối
// reportApiService thật. Khác Administrative Dashboard của Admin (thiên về doanh thu/audit),
// Operational Dashboard của Manager tập trung vào trạng thái order/task/thanh toán/kho và đặc biệt
// là "hàng đợi chờ xác nhận" — phần lớn dữ liệu hiện trường do Leader Staff (mobile) ghi nhận trước,
// Manager chỉ xác nhận (confirm) trên web (xem mục 1 CLAUDE.md, phần Vai trò & phân quyền).

export const MOCK_MANAGER_KPIS = {
  activeOrders: 24,
  activeOrdersChange: '+4 tuần này',
  pendingConfirmations: 9,
  pendingConfirmationsChange: 'Cần xử lý',
  tasksToday: 12,
  tasksTodayChange: '3 nhóm hiện trường',
  inventoryAlerts: 3,
  inventoryAlertsChange: 'Thiếu hàng dự kiến',
};

export type ConfirmationType =
  | 'survey'
  | 'handover'
  | 'damage_loss'
  | 'settlement'
  | 'field_payment'
  | 'inventory_return';

export interface PendingConfirmation {
  type: ConfirmationType;
  label: string;
  description: string;
  count: number;
  href: string;
}

// Mỗi mục ứng với 1 loại biên bản Leader Staff ghi nhận tại hiện trường qua app mobile, chờ Manager
// xác nhận trên web trước khi coi là chính thức.
export const MOCK_PENDING_CONFIRMATIONS: PendingConfirmation[] = [
  {
    type: 'survey',
    label: 'Báo cáo khảo sát',
    description: 'Khảo sát viên đã nộp, chờ duyệt để lập báo giá',
    count: 3,
    href: '/manager/survey',
  },
  {
    type: 'field_payment',
    label: 'Chứng từ thanh toán tại hiện trường',
    description: 'Leader Staff ghi nhận cọc/quyết toán tiền mặt hoặc chuyển khoản',
    count: 2,
    href: '/manager/payments/deposits',
  },
  {
    type: 'handover',
    label: 'Biên bản nghiệm thu/bàn giao',
    description: 'Chờ xác nhận trước khi gửi khách hàng',
    count: 1,
    href: '/manager/field-ops/handovers',
  },
  {
    type: 'damage_loss',
    label: 'Ghi nhận hỏng/mất thiết bị',
    description: 'Chờ duyệt để tính đền bù theo giá mua',
    count: 2,
    href: '/manager/field-ops/handovers',
  },
  {
    type: 'settlement',
    label: 'Settlement cuối kỳ',
    description: 'Leader Staff ghi tại hiện trường, chờ quyết toán chính thức',
    count: 1,
    href: '/manager/orders',
  },
];
