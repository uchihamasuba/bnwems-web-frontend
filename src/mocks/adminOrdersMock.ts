import type { BadgeVariant } from '@/components/ui/Badge';
import { getStatusBadgeVariant } from '@/components/ui/Badge';
import { ORDER_STATUS_LABEL } from '@/constants/order-status';
import type { OrderStatus } from '@/types/order';
import { getAdminQuotations } from '@/mocks/adminQuotationsMock';

// Trang /admin/orders_audit (Đơn đặt) hiện code THUẦN GIAO DIỆN theo mục 0 CLAUDE.md, port từ
// docs/components/BookingsView.tsx + BookingDetailView.tsx. Đây là store mock riêng, module-scope,
// cho list/thêm/xóa/đổi trạng thái hoạt động qua lại trong phiên làm việc — nhưng trạng thái dùng
// đúng enum OrderStatus thật (5 giá trị, xem constants/order-status.ts) để đồng bộ với trang
// Tổng quan và trang Đơn hàng của Manager, không tự bịa thêm trạng thái "booking" riêng.

export type BookingStatus = OrderStatus;

export const BOOKING_STATUS_META: Record<BookingStatus, { label: string; variant: BadgeVariant; color: string }> = {
  NEW: { label: ORDER_STATUS_LABEL.NEW, variant: getStatusBadgeVariant('NEW'), color: '#94a3b8' },
  CONFIRMED: { label: ORDER_STATUS_LABEL.CONFIRMED, variant: getStatusBadgeVariant('CONFIRMED'), color: '#3b82f6' },
  IN_PROGRESS: { label: ORDER_STATUS_LABEL.IN_PROGRESS, variant: getStatusBadgeVariant('IN_PROGRESS'), color: '#f97316' },
  COMPLETED: { label: ORDER_STATUS_LABEL.COMPLETED, variant: getStatusBadgeVariant('COMPLETED'), color: '#22c55e' },
  CANCELLED: { label: ORDER_STATUS_LABEL.CANCELLED, variant: getStatusBadgeVariant('CANCELLED'), color: '#ef4444' },
};

export const VENUE_OPTIONS = ['Sảnh Hera', 'Sảnh Artemis', 'Sảnh Zeus', 'Sảnh Aphrodite'];
export const PACKAGE_OPTIONS = ['Lễ cưới - Gói Platinum', 'Lễ cưới - Gói Diamond', 'Lễ cưới - Gói Gold', 'Lễ cưới - Gói Silver', 'Lễ cưới - Gói Standard'];

export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface SurveyAssignment {
  assigneeName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
}

export type PaymentStatus = 'UNPAID' | 'DEPOSITED' | 'PAID';

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
  UNPAID: { label: 'Chưa đặt cọc', variant: 'warning' },
  DEPOSITED: { label: 'Đã đặt cọc 50%', variant: 'info' },
  PAID: { label: 'Đã thanh toán 100%', variant: 'success' },
};

export type OrderItemSource = 'internal' | 'external';

export const ORDER_ITEM_SOURCE_META: Record<OrderItemSource, { label: string; variant: BadgeVariant }> = {
  internal: { label: 'Kho nhà', variant: 'info' },
  external: { label: 'Thuê ngoài', variant: 'warning' },
};

export type OrderItemStatus = 'confirmed' | 'preparing' | 'pending' | 'optional';

export const ORDER_ITEM_STATUS_META: Record<OrderItemStatus, { label: string; variant: BadgeVariant }> = {
  confirmed: { label: 'Đã xác nhận', variant: 'success' },
  preparing: { label: 'Đang chuẩn bị', variant: 'info' },
  pending: { label: 'Chờ xử lý', variant: 'warning' },
  optional: { label: 'Tùy chọn', variant: 'neutral' },
};

export interface AdminOrderLineItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  status: OrderItemStatus;
  source: OrderItemSource;
  preparedQty: number;
  preparedBy: string;
}

export const LIVE_SHOW_CHECKLIST_ITEMS: { key: string; label: string }[] = [
  { key: 'backdrop', label: 'Bàn giao nghiệm thu bối cảnh khung Backdrop / LED' },
  { key: 'soundTest', label: 'Thử âm thanh (Sound-check) micro không dây tốt' },
  { key: 'powerBackup', label: 'Đấu nối tủ điện nguồn dự phòng khẩn cấp' },
  { key: 'operatorReady', label: 'Kỹ thuật viên đứng Mixer & bàn ánh sáng túc trực' },
];

export interface AdminOrderRow {
  orderId: string; // DD250709-001
  customerName: string;
  customerPhone: string;
  weddingDate: string; // YYYY-MM-DD
  venue: string;
  guestCount: number;
  totalPrice: number;
  depositAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  coordinatorName: string;
  packageType: string;
  notes: string;
  checklist: ChecklistItem[];
  surveyAssignment?: SurveyAssignment;
  quotationId?: string;
  items: AdminOrderLineItem[];
  liveChecklist: Record<string, boolean>;
  /** Thời điểm Manager đánh dấu đã xuất kho toàn bộ phiếu chuẩn bị (picklist) của đơn — dùng cho màn
   * hình "Pick-list xuất kho" độc lập, khác preparedQty vốn theo dõi tiến độ chuẩn bị từng hạng mục. */
  pickedUpAt?: string;
  /** Đóng đơn hàng — mốc cuối cùng trong vòng đời vận hành, khác trạng thái COMPLETED (có thể đã hoàn
   * thành sự kiện nhưng chưa chốt sổ). Khi đã đóng, không cho đổi trạng thái/hủy đơn nữa. */
  closedAt?: string;
  closedBy?: string;
  disputeLogs: DisputeLogEntry[];
}

/** Ghi log nội bộ khi xử lý tranh chấp với khách hàng — giao tiếp thật diễn ra ngoài hệ thống (gọi
 * điện, Zalo...), hệ thống chỉ lưu vết nội bộ (mục 1 CLAUDE.md: "Xử lý tranh chấp... chỉ ghi log nội
 * bộ"). */
export interface DisputeLogEntry {
  id: string;
  note: string;
  createdBy: string;
  createdAt: string;
  resolved: boolean;
}

const CUSTOMER_POOL = [
  'Nguyễn Minh Trí & Trần Ngọc Anh', 'Trần Thu Thảo & Lê Quốc Bảo', 'Phạm Hải Nam & Vũ Thị Hoa',
  'Đỗ Anh Khoa & Ngô Thanh Trúc', 'Vũ Ngọc Lan & Đặng Minh Quân', 'Hoàng Gia Bảo & Bùi Thị Kim',
  'Bùi Thanh Hà & Lý Văn Sơn', 'Ngô Quốc Huy & Phan Thị Nga', 'Lý Diễm My & Trương Đức Anh',
  'Đặng Văn Phúc & Mai Thị Lan', 'Phan Thảo Vy & Đinh Quốc Cường', 'Trương Đình Khang & Cao Thị Yến',
];

// Xuất ra để trang chi tiết đơn đặt tái dùng làm danh sách nhân viên có thể phân công khảo sát.
export const COORDINATOR_POOL = ['Vũ Hoàng Long', 'Lê Minh Dũng', 'Nguyễn Thị Hương', 'Trần Anh Tuấn', 'Phạm Thị Mai'];

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildChecklist(index: number): ChecklistItem[] {
  const tasks = ['Xác nhận thực đơn với khách', 'Chốt số lượng bàn tiệc', 'Kiểm tra thiết bị âm thanh', 'Xác nhận nhân sự phục vụ'];
  return tasks.map((task, i) => ({ id: `${index}-cl-${i}`, task, completed: (index + i) % 3 !== 0 }));
}

// Trạng thái đơn càng tiến xa thì càng có khả năng đã đóng cọc/thanh toán — mô phỏng hợp lý cho mock,
// không phải quy tắc nghiệp vụ thật (xem quy tắc thật trong CLAUDE.md nếu cần đối chiếu sau này).
function derivePaymentStatus(status: BookingStatus, index: number): PaymentStatus {
  if (status === 'COMPLETED') return 'PAID';
  if (status === 'CANCELLED') return 'UNPAID';
  if (status === 'IN_PROGRESS') return index % 4 === 0 ? 'PAID' : 'DEPOSITED';
  if (status === 'CONFIRMED') return index % 3 === 0 ? 'UNPAID' : 'DEPOSITED';
  return 'UNPAID';
}

// Xuất ra để trang tạo đơn đặt mới sinh sẵn hạng mục mặc định hợp lý (mock) cho đơn vừa tạo.
export function buildOrderItems(orderId: string, totalPrice: number, venue: string, status: BookingStatus): AdminOrderLineItem[] {
  const banquetCost = Math.round(totalPrice * 0.55);
  const decorCost = Math.round(totalPrice * 0.2);
  const mcSoundCost = Math.round(totalPrice * 0.15);
  const filmingCost = totalPrice - banquetCost - decorCost - mcSoundCost;
  const tableCount = Math.max(1, Math.round(totalPrice / 25_000_000));

  const isPrepared = status === 'IN_PROGRESS' || status === 'COMPLETED';

  return [
    {
      id: `${orderId}-1`,
      category: 'Tiệc bàn',
      description: `Thực đơn tiệc cưới cao cấp, phục vụ ${tableCount} bàn`,
      quantity: tableCount,
      unitPrice: Math.round(banquetCost / tableCount),
      status: 'confirmed',
      source: 'internal',
      preparedQty: isPrepared ? tableCount : 0,
      preparedBy: isPrepared ? 'Kho bếp trung tâm' : '',
    },
    {
      id: `${orderId}-2`,
      category: 'Trang trí sảnh',
      description: `Trang trí ${venue} theo phong cách đã chọn`,
      quantity: 1,
      unitPrice: decorCost,
      status: 'preparing',
      source: 'internal',
      preparedQty: isPrepared ? 1 : 0,
      preparedBy: isPrepared ? 'Tổ trang trí' : '',
    },
    {
      id: `${orderId}-3`,
      category: 'MC & âm thanh',
      description: 'MC dẫn chương trình, dàn âm thanh ánh sáng sân khấu',
      quantity: 1,
      unitPrice: mcSoundCost,
      status: 'confirmed',
      source: 'external',
      preparedQty: status === 'COMPLETED' ? 1 : 0,
      preparedBy: status === 'COMPLETED' ? 'Đối tác Âm thanh Gold' : '',
    },
    {
      id: `${orderId}-4`,
      category: 'Quay phim',
      description: 'Ê-kíp quay phim, chụp ảnh phóng sự cưới',
      quantity: 1,
      unitPrice: Math.max(filmingCost, 0),
      status: 'optional',
      source: 'external',
      preparedQty: 0,
      preparedBy: '',
    },
  ];
}

function generateMockOrders(): AdminOrderRow[] {
  const today = new Date('2026-07-10');
  const statusSequence: BookingStatus[] = [
    ...Array(10).fill('NEW'),
    ...Array(12).fill('CONFIRMED'),
    ...Array(20).fill('IN_PROGRESS'),
    ...Array(16).fill('COMPLETED'),
    ...Array(6).fill('CANCELLED'),
  ];

  return statusSequence.map((status, index) => {
    const customerName = CUSTOMER_POOL[index % CUSTOMER_POOL.length];
    const guestCount = 150 + ((index * 41) % 350);
    const totalPrice = 180_000_000 + ((index * 15_500_000) % 420_000_000);
    const dayOffset = status === 'COMPLETED' ? -(10 + index * 3) : 5 + index * 3;
    const venue = VENUE_OPTIONS[index % VENUE_OPTIONS.length];
    const orderId = `DD${String(index + 1).padStart(4, '0')}`;

    return {
      orderId,
      customerName,
      customerPhone: `09${String(30_000_000 + index * 149).slice(0, 8)}`,
      weddingDate: addDays(today, dayOffset),
      venue,
      guestCount,
      totalPrice,
      depositAmount: Math.round(totalPrice * 0.3),
      status,
      paymentStatus: derivePaymentStatus(status, index),
      coordinatorName: COORDINATOR_POOL[index % COORDINATOR_POOL.length],
      packageType: PACKAGE_OPTIONS[index % PACKAGE_OPTIONS.length],
      notes: index % 4 === 0 ? 'Khách yêu cầu trang trí tông màu pastel, có khu vực chụp ảnh riêng.' : '',
      checklist: buildChecklist(index),
      items: buildOrderItems(orderId, totalPrice, venue, status),
      liveChecklist: {},
      disputeLogs: [],
    };
  });
}

let store: AdminOrderRow[] = generateMockOrders();

export function getAdminOrders(): AdminOrderRow[] {
  return store;
}

export function getAdminOrderById(id: string): AdminOrderRow | undefined {
  return store.find((row) => row.orderId === id);
}

export function addAdminOrder(row: AdminOrderRow): void {
  store = [row, ...store];
}

export function updateAdminOrder(id: string, patch: Partial<AdminOrderRow>): void {
  store = store.map((row) => (row.orderId === id ? { ...row, ...patch } : row));
}

export function deleteAdminOrder(id: string): void {
  store = store.filter((row) => row.orderId !== id);
}

export function nextAdminOrderId(): string {
  const maxNum = store.reduce((max, row) => {
    const num = Number(row.orderId.replace(/\D/g, ''));
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 0);
  return `DD${String(maxNum + 1).padStart(4, '0')}`;
}

export function updateAdminOrderItem(orderId: string, itemId: string, patch: Partial<AdminOrderLineItem>): void {
  store = store.map((row) =>
    row.orderId === orderId ? { ...row, items: row.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)) } : row,
  );
}

export function prepareAllAdminOrderItems(orderId: string, preparedBy: string): void {
  store = store.map((row) =>
    row.orderId === orderId
      ? { ...row, items: row.items.map((item) => ({ ...item, preparedQty: item.quantity, preparedBy: item.preparedBy || preparedBy })) }
      : row,
  );
}

export function updateAdminOrderLiveChecklist(orderId: string, key: string, checked: boolean): void {
  store = store.map((row) => (row.orderId === orderId ? { ...row, liveChecklist: { ...row.liveChecklist, [key]: checked } } : row));
}

/** Đóng đơn hàng — mốc cuối cùng trong vòng đời vận hành, do Manager thực hiện thủ công sau khi đã
 * quyết toán + hoàn kho xong (mục 1 CLAUDE.md: "Mọi cột mốc quan trọng cần xác nhận thủ công bởi
 * Manager"). Khác trạng thái COMPLETED (sự kiện đã diễn ra xong nhưng có thể chưa chốt sổ). */
export function closeAdminOrder(orderId: string, closedBy: string): void {
  store = store.map((row) => (row.orderId === orderId ? { ...row, closedAt: new Date().toISOString(), closedBy } : row));
}

export function addAdminOrderDispute(orderId: string, note: string, createdBy: string): void {
  store = store.map((row) =>
    row.orderId === orderId
      ? {
          ...row,
          disputeLogs: [
            { id: `DSP-${orderId}-${row.disputeLogs.length + 1}`, note, createdBy, createdAt: new Date().toISOString(), resolved: false },
            ...row.disputeLogs,
          ],
        }
      : row,
  );
}

export function resolveAdminOrderDispute(orderId: string, disputeId: string): void {
  store = store.map((row) =>
    row.orderId === orderId
      ? { ...row, disputeLogs: row.disputeLogs.map((d) => (d.id === disputeId ? { ...d, resolved: true } : d)) }
      : row,
  );
}

// ---------------------------------------------------------------------------
// Phiếu chuẩn bị (Picklist) xuất kho theo đơn — tab "Thiết bị & Kho hàng" ở trang chi tiết đơn đặt
// thực chất là màn hình làm việc (working view) để chuẩn bị kho; phiếu này là bản chốt/xuất ra từ
// đúng dữ liệu hạng mục của đơn tại thời điểm bấm nút, dùng để in/giao cho tổ kho. Mã phiếu sinh 1 lần
// và giữ nguyên cho các lần xem lại sau trong phiên làm việc (Map module-scope, mất khi tải lại trang).
// ---------------------------------------------------------------------------

export interface OrderPicklist {
  code: string;
  orderId: string;
  createdAt: string;
}

const picklistStore = new Map<string, OrderPicklist>();
let picklistSeq = 0;

export function getOrCreateOrderPicklist(orderId: string): OrderPicklist {
  const existing = picklistStore.get(orderId);
  if (existing) return existing;
  picklistSeq += 1;
  const picklist: OrderPicklist = {
    code: `PKL-${orderId}-${String(picklistSeq).padStart(2, '0')}`,
    orderId,
    createdAt: new Date().toISOString(),
  };
  picklistStore.set(orderId, picklist);
  return picklist;
}

export interface OrderPicklistSummary {
  picklist: OrderPicklist;
  row: AdminOrderRow;
  totalItemsCount: number;
  preparedItemsCount: number;
}

// Đơn đủ điều kiện lập phiếu chuẩn bị xuất kho (đã xác nhận/đang thi công) — dùng cho màn hình
// "Pick-list xuất kho" độc lập của Manager, tổng hợp trạng thái chuẩn bị + xuất kho theo từng đơn thay
// vì phải mở từng trang chi tiết đơn đặt. Đáp ứng checklist "Kho & Supplier > Pick-list xuất kho".
export function getAdminOrderPicklists(): OrderPicklistSummary[] {
  return store
    .filter((row) => row.status === 'CONFIRMED' || row.status === 'IN_PROGRESS')
    .map((row) => ({
      picklist: getOrCreateOrderPicklist(row.orderId),
      row,
      totalItemsCount: row.items.reduce((sum, item) => sum + item.quantity, 0),
      preparedItemsCount: row.items.reduce((sum, item) => sum + item.preparedQty, 0),
    }));
}

export function markAdminOrderPickedUp(orderId: string): void {
  store = store.map((row) => (row.orderId === orderId ? { ...row, pickedUpAt: new Date().toISOString() } : row));
}

// Báo giá đã duyệt, chưa liên kết với đơn đặt nào — nguồn chọn khi liên kết thêm báo giá vào đơn đặt
// (mục "Báo giá & Hợp đồng liên đới" ở trang chi tiết). Không lọc theo tên khách hàng vì 2 kho mock
// (báo giá/đơn đặt) sinh tên khách theo 2 định dạng khác nhau (tên đơn lẻ vs "Tên A & Tên B"), không
// có FK thật để đối chiếu chính xác trong giai đoạn thuần giao diện này.
export function getLinkableQuotationsForOrder() {
  const linkedIds = new Set(store.filter((r) => r.quotationId).map((r) => r.quotationId));
  return getAdminQuotations().filter((q) => q.status === 'approved' && !linkedIds.has(q.quotationId));
}

export function linkQuotationToOrder(orderId: string, quotationId: string): void {
  const quotation = getAdminQuotations().find((q) => q.quotationId === quotationId);
  store = store.map((row) => {
    if (row.orderId !== orderId) return row;
    const mergedItems: AdminOrderLineItem[] = quotation
      ? [
          ...row.items,
          ...quotation.items.map((qi, idx) => ({
            id: `${orderId}-q-${quotationId}-${idx}`,
            category: qi.category,
            description: qi.name,
            quantity: qi.quantity,
            unitPrice: qi.unitPrice,
            status: 'confirmed' as OrderItemStatus,
            source: 'internal' as OrderItemSource,
            preparedQty: 0,
            preparedBy: '',
          })),
        ]
      : row.items;
    const totalPrice = mergedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    return { ...row, quotationId, items: mergedItems, totalPrice };
  });
}

export function unlinkQuotationFromOrder(orderId: string): void {
  store = store.map((row) => (row.orderId === orderId ? { ...row, quotationId: undefined } : row));
}

// ---------------------------------------------------------------------------
// Chi tiết đơn đặt — sinh dữ liệu mở rộng (hạng mục, tiến độ, nhân sự, lịch sử) từ AdminOrderRow.
// ---------------------------------------------------------------------------

export type OrderTimelineState = 'done' | 'current' | 'upcoming';

export interface AdminOrderTimelineStep {
  key: string;
  label: string;
  detail: string;
  state: OrderTimelineState;
}

export interface AdminOrderCrewMember {
  name: string;
  role: string;
}

export interface AdminOrderHistoryEntry {
  timestamp: string;
  actor: string;
  action: string;
}

export interface AdminOrderDetail {
  row: AdminOrderRow;
  eventName: string;
  location: string;
  timeWindow: string;
  createdAt: string;
  customerEmail: string;
  customerCompany: string;
  customerAddress: string;
  items: AdminOrderLineItem[];
  discount: number;
  surcharge: number;
  total: number;
  crew: AdminOrderCrewMember[];
  timeline: AdminOrderTimelineStep[];
  history: AdminOrderHistoryEntry[];
}

const TIMELINE_STEPS: { key: string; label: string }[] = [
  { key: 'created', label: 'Tạo đơn đặt' },
  { key: 'confirmed', label: 'Xác nhận dịch vụ' },
  { key: 'assigned', label: 'Phân công nhân sự' },
  { key: 'preparing', label: 'Chuẩn bị sự kiện' },
  { key: 'ongoing', label: 'Đang diễn ra' },
  { key: 'done', label: 'Hoàn tất sự kiện' },
];

function reachedIndexForStatus(status: BookingStatus): number {
  if (status === 'CANCELLED') return 0;
  if (status === 'NEW') return 1;
  if (status === 'CONFIRMED') return 2;
  if (status === 'IN_PROGRESS') return 4;
  return 5; // COMPLETED
}

function buildOrderTimeline(status: BookingStatus): AdminOrderTimelineStep[] {
  const reachedIndex = reachedIndexForStatus(status);
  return TIMELINE_STEPS.map((step, index) => ({
    key: step.key,
    label: step.label,
    detail: index <= reachedIndex ? 'Đã hoàn tất' : 'Chưa thực hiện',
    state: (index < reachedIndex ? 'done' : index === reachedIndex ? 'current' : 'upcoming') as OrderTimelineState,
  }));
}

function slugifyEmail(name: string): string {
  const first = name.split('&')[0].trim();
  const normalized = first
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .split(/\s+/);
  const last = normalized[normalized.length - 1] ?? 'khach';
  const initials = normalized.slice(0, -1).map((p) => p[0]).join('');
  return `${last}.${initials}@gmail.com`;
}

const ADDRESS_POOL = [
  '123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP. Hồ Chí Minh',
  '45 Lê Lợi, P. Bến Thành, Q.1, TP. Hồ Chí Minh',
  '78 Nguyễn Văn Cừ, P.4, Q.5, TP. Hồ Chí Minh',
];

const COMPANY_POOL = ['Công ty TNHH Minh Tuấn', 'Công ty Cổ phần Thương mại Phú Gia', '', ''];

const CREW_ROLE_POOL = ['Trưởng nhóm điều phối', 'Điều phối khách mời', 'Kỹ thuật âm thanh ánh sáng', 'Trang trí & setup'];

export function getAdminOrderDetail(id: string): AdminOrderDetail | undefined {
  const row = getAdminOrderById(id);
  if (!row) return undefined;

  const seedIndex = Number(row.orderId.replace(/\D/g, '')) || 0;

  const discount = seedIndex % 5 === 0 ? 10_000_000 : 0;
  const surcharge = 0;
  const total = row.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) - discount + surcharge;

  const crew: AdminOrderCrewMember[] = [row.coordinatorName, ...CREW_ROLE_POOL.slice(1).map((_, i) => COORDINATOR_POOL[(seedIndex + i + 1) % COORDINATOR_POOL.length])].map(
    (name, i) => ({ name, role: CREW_ROLE_POOL[i] }),
  );

  const history: AdminOrderHistoryEntry[] = [
    { timestamp: '10/07/2026 09:00', actor: row.coordinatorName, action: 'Thêm sự kiện' },
    { timestamp: '10/07/2026 09:30', actor: row.coordinatorName, action: 'Tạo đơn đặt' },
    { timestamp: '11/07/2026 14:00', actor: row.coordinatorName, action: 'Cập nhật hạng mục dịch vụ' },
    { timestamp: '12/07/2026 10:15', actor: row.coordinatorName, action: 'Phân công nhân sự phụ trách' },
  ];

  return {
    row,
    eventName: `Lễ cưới ${row.customerName}`,
    location: `Riverside Palace (${row.venue})`,
    timeWindow: `17:30 - 22:00, ${row.weddingDate.split('-').reverse().join('/')}`,
    createdAt: '10/07/2026',
    customerEmail: slugifyEmail(row.customerName),
    customerCompany: COMPANY_POOL[seedIndex % COMPANY_POOL.length],
    customerAddress: ADDRESS_POOL[seedIndex % ADDRESS_POOL.length],
    items: row.items,
    discount,
    surcharge,
    total,
    crew,
    timeline: buildOrderTimeline(row.status),
    history,
  };
}
