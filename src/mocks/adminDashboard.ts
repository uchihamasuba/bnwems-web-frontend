import type { RevenueReportPoint } from '@/types/report';
import type { OrderStatus } from '@/types/order';

// Backend hiện không gọi được (Network Error, xem docs/more-require.md mục (jj)) — trong giai đoạn
// tập trung thiết kế giao diện thuần, trang /admin/dashboard dùng dữ liệu ảo cố định dưới đây thay
// vì gọi reportApiService. Khôi phục lại API thật khi backend hoạt động bình thường trở lại.
//
// Trạng thái đơn đặt dùng đúng enum OrderStatus thật (5 giá trị, xem constants/order-status.ts) để
// đồng bộ với trang danh sách/chi tiết đơn đặt — không tự bịa thêm trạng thái riêng cho dashboard.

export const MOCK_ADMIN_KPIS = {
  monthlyRevenue: 245_000_000,
  monthlyRevenueChange: '+18.6%',
  newOrders: 28,
  newOrdersChange: '+21.2%',
  pendingQuotations: 14,
  pendingQuotationsChange: '+12.5%',
  newCustomers: 36,
  newCustomersChange: '+20.0%',
};

export const MOCK_REVENUE_TREND: RevenueReportPoint[] = [
  { month: '12/2024', revenue: 150_000_000 },
  { month: '1/2025', revenue: 180_000_000 },
  { month: '2/2025', revenue: 210_000_000 },
  { month: '3/2025', revenue: 190_000_000 },
  { month: '4/2025', revenue: 230_000_000 },
  { month: '5/2025', revenue: 245_000_000 },
];

export interface OrderStatusSlice {
  label: string;
  count: number;
  color: string;
}

export const MOCK_ORDER_STATUS_BREAKDOWN: OrderStatusSlice[] = [
  { label: 'Mới', count: 6, color: '#94a3b8' },
  { label: 'Xác nhận', count: 28, color: '#3b82f6' },
  { label: 'Đang làm', count: 39, color: '#f97316' },
  { label: 'Hoàn thành', count: 48, color: '#22c55e' },
  { label: 'Đã hủy', count: 7, color: '#ef4444' },
];

export interface UpcomingEvent {
  day: number;
  month: string;
  title: string;
  time: string;
  venue: string;
  status: OrderStatus;
}

export const MOCK_UPCOMING_EVENTS: UpcomingEvent[] = [
  { day: 24, month: 'Tháng 5', title: 'Lễ cưới Minh & Hà', time: '17:00', venue: 'White Palace', status: 'IN_PROGRESS' },
  { day: 25, month: 'Tháng 5', title: 'Lễ cưới Quang & Thảo', time: '11:00', venue: 'Riverside Palace', status: 'COMPLETED' },
  { day: 26, month: 'Tháng 5', title: 'Lễ cưới Duy & Linh', time: '18:00', venue: 'Diamond Center', status: 'CONFIRMED' },
  { day: 27, month: 'Tháng 5', title: 'Lễ cưới Nam & Hương', time: '11:30', venue: 'Grand Palace', status: 'IN_PROGRESS' },
  { day: 28, month: 'Tháng 5', title: 'Lễ cưới Hùng & Trang', time: '17:00', venue: 'White Palace', status: 'COMPLETED' },
];

export interface RecentOrderRow {
  orderId: string;
  customerName: string;
  eventDate: string;
  value: number;
  status: OrderStatus;
  assignee: string;
}

export const MOCK_RECENT_ORDERS: RecentOrderRow[] = [
  { orderId: 'ĐD001', customerName: 'Nguyễn Minh Trí', eventDate: '15/08/2026', value: 350_000_000, status: 'IN_PROGRESS', assignee: 'Nguyễn Thị Hương' },
  { orderId: 'ĐD002', customerName: 'Trần Thu Thảo', eventDate: '20/09/2026', value: 420_000_000, status: 'CONFIRMED', assignee: 'Trần Anh Tuấn' },
  { orderId: 'ĐD003', customerName: 'Hoàng Thùy Linh', eventDate: '10/06/2026', value: 550_000_000, status: 'CONFIRMED', assignee: 'Nguyễn Thị Hương' },
  { orderId: 'ĐD004', customerName: 'Lê Quốc Khánh', eventDate: '18/05/2026', value: 120_000_000, status: 'COMPLETED', assignee: 'Lê Quang Vinh' },
];

export type StaffDutyStatus = 'busy' | 'processing' | 'off';

export interface StaffOnDuty {
  name: string;
  eventsCount: number;
  ordersCount: number;
  status: StaffDutyStatus;
}

export const MOCK_STAFF_ON_DUTY: StaffOnDuty[] = [
  { name: 'Trần Thị Bích', eventsCount: 3, ordersCount: 2, status: 'busy' },
  { name: 'Nguyễn Văn C', eventsCount: 2, ordersCount: 2, status: 'busy' },
  { name: 'Lê Minh Dũng', eventsCount: 2, ordersCount: 1, status: 'processing' },
  { name: 'Phạm Thị Mai', eventsCount: 1, ordersCount: 1, status: 'off' },
];
