import type { BadgeVariant } from '@/components/ui/Badge';
import { BOOKING_STATUS_META, BookingStatus } from '@/mocks/adminOrdersMock';

// Trang /admin/customers (Khách hàng) hiện code THUẦN GIAO DIỆN theo mục 0 CLAUDE.md (giai đoạn
// dựng UI, tạm không đối chiếu docs/api/database) — port từ docs/components/CustomersView.tsx.
// Không dùng chung với src/types/customer.ts / customer.service.ts (model đó phục vụ luồng chọn
// khách hàng thật khi tạo báo giá bên Manager) — đây là store mock riêng, module-scope, để
// list/thêm/sửa/xóa hoạt động qua lại trong phiên làm việc (mất khi reload).

export type AdminCustomerStatus = 'active' | 'inactive';

export const CUSTOMER_STATUS_META: Record<AdminCustomerStatus, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Đang hoạt động', variant: 'success' },
  inactive: { label: 'Tạm ngưng', variant: 'neutral' },
};

export interface AdminCustomer {
  customerId: string; // KH001
  customerName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: AdminCustomerStatus;
  totalBookings: number;
  totalSpent: number;
}

const NAME_POOL = [
  'Nguyễn Minh Trí', 'Trần Thu Thảo', 'Phạm Hải Nam', 'Đỗ Anh Khoa', 'Vũ Ngọc Lan',
  'Hoàng Gia Bảo', 'Bùi Thanh Hà', 'Ngô Quốc Huy', 'Lý Diễm My', 'Đặng Văn Phúc',
  'Phan Thảo Vy', 'Trương Đình Khang', 'Mai Thu Hương', 'Đinh Công Danh', 'Lâm Bảo Châu',
  'Cao Xuân Sơn', 'Tô Kim Ngân', 'Dương Nhật Minh', 'Huỳnh Gia Hân', 'Vương Đức Anh',
];

const ADDRESS_POOL = [
  '123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP. Hồ Chí Minh',
  '45 Lê Lợi, P. Bến Thành, Q.1, TP. Hồ Chí Minh',
  '78 Nguyễn Văn Cừ, P.4, Q.5, TP. Hồ Chí Minh',
  '12 Hoàng Diệu, P. Linh Trung, TP. Thủ Đức',
  '256 Cách Mạng Tháng 8, Q.3, TP. Hồ Chí Minh',
  '89 Điện Biên Phủ, Q. Bình Thạnh, TP. Hồ Chí Minh',
];

const NOTES_POOL = [
  'Khách quen, ưu tiên tư vấn gói cao cấp.',
  'Yêu cầu liên hệ qua Zalo thay vì gọi điện.',
  'Đã từng đặt tiệc sinh nhật, hài lòng về dịch vụ.',
  '',
  '',
];

function slugifyEmail(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase()
    .split(/\s+/);
  const last = normalized[normalized.length - 1] ?? 'khach';
  const initials = normalized.slice(0, -1).map((p) => p[0]).join('');
  return `${last}.${initials}@gmail.com`;
}

function generateMockCustomers(): AdminCustomer[] {
  return Array.from({ length: 42 }, (_, i) => {
    const name = NAME_POOL[i % NAME_POOL.length];
    const isInactive = i % 7 === 0;
    return {
      customerId: `KH${String(i + 1).padStart(3, '0')}`,
      customerName: i >= NAME_POOL.length ? `${name} ${Math.floor(i / NAME_POOL.length) + 1}` : name,
      phone: `09${String(10_000_000 + i * 173).slice(0, 8)}`,
      email: slugifyEmail(name),
      address: ADDRESS_POOL[i % ADDRESS_POOL.length],
      notes: NOTES_POOL[i % NOTES_POOL.length],
      status: isInactive ? 'inactive' : 'active',
      totalBookings: 1 + (i % 6),
      totalSpent: 15_000_000 + ((i * 3_700_000) % 500_000_000),
    };
  });
}

let store: AdminCustomer[] = generateMockCustomers();

export function getAdminCustomers(): AdminCustomer[] {
  return store;
}

export function getAdminCustomerById(id: string): AdminCustomer | undefined {
  return store.find((c) => c.customerId === id);
}

export function addAdminCustomer(customer: AdminCustomer): void {
  store = [customer, ...store];
}

export function updateAdminCustomer(id: string, patch: Partial<AdminCustomer>): void {
  store = store.map((c) => (c.customerId === id ? { ...c, ...patch } : c));
}

export function deleteAdminCustomer(id: string): void {
  store = store.filter((c) => c.customerId !== id);
}

export function nextAdminCustomerId(): string {
  const maxNum = store.reduce((max, c) => {
    const num = Number(c.customerId.replace(/\D/g, ''));
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 0);
  return `KH${String(maxNum + 1).padStart(3, '0')}`;
}

// ---------------------------------------------------------------------------
// Chi tiết khách hàng — sinh danh sách đơn hàng, lịch sử tương tác, công nợ/thanh toán từ
// AdminCustomer, port từ docs/components/CustomerDetailView.tsx.
// ---------------------------------------------------------------------------

export interface CustomerOrderSummary {
  id: string;
  event: string;
  date: string; // YYYY-MM-DD
  value: number;
  status: BookingStatus;
  contract: string;
  coordinator: string;
}

export interface AdminCustomerDetail {
  customer: AdminCustomer;
  clientType: string;
  source: string;
  tier: string;
  createdAt: string;
  coordinatorName: string;
  orders: CustomerOrderSummary[];
  totalValue: number;
  remainingDebt: number;
  paidAmount: number;
  paymentRate: number;
  activeOrdersCount: number;
  signedContractsCount: number;
}

const COORDINATOR_POOL = ['Vũ Hoàng Long', 'Lê Minh Dũng', 'Nguyễn Thị Hương', 'Trần Anh Tuấn', 'Phạm Thị Mai'];
const SOURCE_POOL = ['Facebook Ads', 'Hotline', 'Giới thiệu', 'Website', 'Zalo OA'];
const EVENT_POOL = [
  'Lễ cưới - Gói Platinum', 'Lễ đính hôn - Gói Silver', 'Tiệc cưới - Gói Diamond',
  'Hội nghị khách hàng - Gói Business', 'Gala dinner', 'Lễ kỷ niệm công ty',
];

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getAdminCustomerDetail(id: string): AdminCustomerDetail | undefined {
  const customer = getAdminCustomerById(id);
  if (!customer) return undefined;

  const seedIndex = Number(customer.customerId.replace(/\D/g, '')) || 0;
  const today = new Date('2026-07-10');
  const coordinatorName = COORDINATOR_POOL[seedIndex % COORDINATOR_POOL.length];
  const isVip = customer.totalSpent >= 300_000_000;

  const orderCount = Math.max(1, customer.totalBookings);
  const orders: CustomerOrderSummary[] = Array.from({ length: orderCount }, (_, i) => {
    const isMostRecent = i === 0;
    const status: BookingStatus =
      customer.status === 'inactive' && isMostRecent
        ? 'CANCELLED'
        : isMostRecent
          ? 'NEW'
          : i === 1
            ? 'IN_PROGRESS'
            : 'COMPLETED';
    const dayOffset = status === 'NEW' ? 20 + i * 10 : -(10 + i * 30);
    return {
      id: `DD${String(2507 - i * 3).padStart(4, '0')}-${String(seedIndex).padStart(3, '0')}`,
      event: EVENT_POOL[(seedIndex + i) % EVENT_POOL.length],
      date: addDays(today, dayOffset),
      value: Math.round((customer.totalSpent / orderCount) * (0.7 + ((i * 13) % 6) / 10)),
      status,
      contract: status === 'CANCELLED' ? '—' : `HD${String(2507 - i * 3).padStart(4, '0')}-${String(seedIndex).padStart(3, '0')}`,
      coordinator: COORDINATOR_POOL[(seedIndex + i) % COORDINATOR_POOL.length],
    };
  });

  const totalValue = customer.totalSpent;
  const remainingDebt = customer.status === 'inactive' ? 0 : Math.round(totalValue * (0.05 + ((seedIndex * 7) % 15) / 100));
  const paidAmount = totalValue - remainingDebt;
  const paymentRate = totalValue > 0 ? Math.round((paidAmount / totalValue) * 100) : 100;

  return {
    customer,
    clientType: isVip ? 'Doanh nghiệp' : 'Cá nhân',
    source: SOURCE_POOL[seedIndex % SOURCE_POOL.length],
    tier: isVip ? 'VIP' : 'Standard',
    createdAt: addDays(today, -(120 + seedIndex * 5)),
    coordinatorName,
    orders,
    totalValue,
    remainingDebt,
    paidAmount,
    paymentRate,
    activeOrdersCount: orders.filter((o) => o.status === 'NEW' || o.status === 'IN_PROGRESS').length,
    signedContractsCount: orders.filter((o) => o.status !== 'CANCELLED').length,
  };
}

export { BOOKING_STATUS_META as CUSTOMER_ORDER_STATUS_META };
