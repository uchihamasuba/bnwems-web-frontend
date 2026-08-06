import type { BadgeVariant } from '@/components/ui/Badge';
import { getAdminQuotations } from '@/mocks/adminQuotationsMock';

// Trang /admin/contracts (Hợp đồng) hiện code THUẦN GIAO DIỆN theo mục 0 CLAUDE.md, port từ
// docs/components/ContractsView.tsx + ContractDetailView.tsx. Không có model "Contract" thật nào
// khác trong repo — đây là store mock riêng, module-scope, cho list/thêm/xóa/đổi trạng thái hoạt
// động qua lại trong phiên làm việc. Modal tạo hợp đồng có liên kết tới store mock báo giá
// (adminQuotationsMock) để mô phỏng đúng luồng "khởi tạo hợp đồng từ báo giá đã duyệt" như bản
// tham chiếu — vẫn hoàn toàn mock, không phải tích hợp nghiệp vụ thật.

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'completed';

export const CONTRACT_STATUS_META: Record<ContractStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: 'Nháp', variant: 'neutral' },
  sent: { label: 'Đã gửi', variant: 'info' },
  signed: { label: 'Đã ký', variant: 'success' },
  completed: { label: 'Đã thanh lý', variant: 'success' },
};

export type ContractItemStatus = 'confirmed' | 'preparing' | 'pending' | 'optional';

export const CONTRACT_ITEM_STATUS_META: Record<ContractItemStatus, { label: string; variant: BadgeVariant }> = {
  confirmed: { label: 'Đã xác nhận', variant: 'success' },
  preparing: { label: 'Đang chuẩn bị', variant: 'info' },
  pending: { label: 'Chờ xử lý', variant: 'warning' },
  optional: { label: 'Tùy chọn', variant: 'neutral' },
};

export type InstallmentStatus = 'paid' | 'upcoming' | 'pending';

export const INSTALLMENT_STATUS_META: Record<InstallmentStatus, { label: string; variant: BadgeVariant }> = {
  paid: { label: 'Đã thanh toán', variant: 'success' },
  upcoming: { label: 'Sắp đến hạn', variant: 'warning' },
  pending: { label: 'Chưa đến hạn', variant: 'neutral' },
};

export interface ContractItem {
  id: string;
  category: string;
  name: string;
  description: string;
  qty: number;
  price: number;
  status: ContractItemStatus;
}

export interface PaymentInstallment {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: InstallmentStatus;
}

export interface ContractTimelineStep {
  id: string;
  name: string;
  date: string;
  state: 'done' | 'current' | 'upcoming';
}

export interface AdminContract {
  id: string; // HD2507-001
  quotationId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCompany: string;
  customerAddress: string;
  eventName: string;
  guestCount: number;
  weddingDate: string; // YYYY-MM-DD
  packageType: string;
  venue: string;
  eventNotes: string;
  createdAt: string;
  signedDate: string;
  validUntil: string;
  coordinatorName: string;
  status: ContractStatus;
  subTotal: number;
  discount: number;
  deposit: number;
  vatRate: number;
  grandTotal: number;
  items: ContractItem[];
  installments: PaymentInstallment[];
  timeline: ContractTimelineStep[];
}

export const CONTRACT_COORDINATOR_OPTIONS = ['Vũ Hoàng Long', 'Lê Minh Dũng', 'Nguyễn Thị Hương'];

const VENUE_POOL = ['Sảnh Hera', 'Sảnh Artemis', 'Sảnh Zeus', 'Sảnh Aphrodite'];
const CUSTOMER_EXTRA_POOL = [
  { email: 'tuan.tran@gmail.com', company: 'Công ty TNHH Minh Tuấn', address: '123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP. Hồ Chí Minh' },
  { email: 'thao.le@gmail.com', company: 'Công ty Cổ phần Thương mại Phú Gia', address: '45 Lê Lợi, P. Bến Thành, Q.1, TP. Hồ Chí Minh' },
  { email: 'nam.pham@gmail.com', company: '', address: '78 Nguyễn Văn Cừ, P.4, Q.5, TP. Hồ Chí Minh' },
];

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const TIMELINE_LABELS = ['Khởi tạo hợp đồng', 'Gửi khách duyệt', 'Khách ký hợp đồng', 'Thanh lý hợp đồng'];

function buildTimeline(status: ContractStatus, createdAt: string): ContractTimelineStep[] {
  const order: ContractStatus[] = ['draft', 'sent', 'signed', 'completed'];
  const reachedIndex = order.indexOf(status);
  const base = new Date(createdAt);
  return TIMELINE_LABELS.map((name, index) => ({
    id: `${index}`,
    name,
    date: index <= reachedIndex ? addDays(base, index * 3) : '',
    state: (index < reachedIndex ? 'done' : index === reachedIndex ? 'current' : 'upcoming') as ContractTimelineStep['state'],
  }));
}

function buildItems(id: string, subTotal: number, tableCount: number): ContractItem[] {
  const banquet = Math.round(subTotal * 0.55);
  const decor = Math.round(subTotal * 0.2);
  const mc = Math.round(subTotal * 0.15);
  const filming = subTotal - banquet - decor - mc;
  return [
    { id: `${id}-1`, category: 'Tiệc bàn', name: 'Thực đơn tiệc cưới', description: `Phục vụ ${tableCount} bàn tiệc cao cấp`, qty: tableCount, price: Math.round(banquet / tableCount), status: 'confirmed' },
    { id: `${id}-2`, category: 'Trang trí', name: 'Trang trí sảnh & sân khấu', description: 'Trang trí theo phong cách đã thống nhất với khách', qty: 1, price: decor, status: 'preparing' },
    { id: `${id}-3`, category: 'Âm thanh - MC', name: 'MC & dàn âm thanh ánh sáng', description: 'MC song ngữ, hệ thống âm thanh ánh sáng sân khấu', qty: 1, price: mc, status: 'confirmed' },
    { id: `${id}-4`, category: 'Ghi hình', name: 'Quay phim & chụp ảnh', description: 'Ê-kíp phóng sự cưới trọn gói', qty: 1, price: Math.max(filming, 0), status: 'optional' },
  ];
}

function buildInstallments(id: string, grandTotal: number, deposit: number, status: ContractStatus): PaymentInstallment[] {
  const remaining = grandTotal - deposit;
  const secondPortion = Math.round(remaining * 0.5);
  const finalPortion = remaining - secondPortion;
  const depositStatus: InstallmentStatus = status === 'draft' ? 'pending' : 'paid';
  const secondStatus: InstallmentStatus = status === 'signed' || status === 'completed' ? 'paid' : status === 'sent' ? 'upcoming' : 'pending';
  const finalStatus: InstallmentStatus = status === 'completed' ? 'paid' : 'pending';
  return [
    { id: `${id}-dep`, name: 'Đặt cọc đợt 1', amount: deposit, dueDate: '2026-07-15', status: depositStatus },
    { id: `${id}-mid`, name: 'Thanh toán đợt 2', amount: secondPortion, dueDate: '2026-08-01', status: secondStatus },
    { id: `${id}-final`, name: 'Thanh toán cuối cùng', amount: finalPortion, dueDate: '2026-08-10', status: finalStatus },
  ];
}

function generateMockContracts(): AdminContract[] {
  const today = new Date('2026-07-10');
  const statusSequence: ContractStatus[] = [
    ...Array(6).fill('draft'),
    ...Array(7).fill('sent'),
    ...Array(12).fill('signed'),
    ...Array(5).fill('completed'),
  ];

  return statusSequence.map((status, index) => {
    const extra = CUSTOMER_EXTRA_POOL[index % CUSTOMER_EXTRA_POOL.length];
    const guestCount = 150 + ((index * 43) % 350);
    const tableCount = Math.max(1, Math.round(guestCount / 10));
    const subTotal = 200_000_000 + ((index * 17_500_000) % 400_000_000);
    const discount = index % 4 === 0 ? 10_000_000 : 0;
    const deposit = 30_000_000;
    const vatRate = 0.08;
    const grandTotal = Math.round((subTotal - discount) * (1 + vatRate));
    const createdAt = addDays(today, -(index * 4));
    const id = `HD2507-${String(index + 1).padStart(3, '0')}`;

    return {
      id,
      quotationId: `bg-${index + 1}`,
      customerName: `Khách hàng hợp đồng ${index + 1}`,
      customerPhone: `09${String(40_000_000 + index * 157).slice(0, 8)}`,
      customerEmail: extra.email,
      customerCompany: extra.company,
      customerAddress: extra.address,
      eventName: `Lễ cưới khách hàng hợp đồng ${index + 1}`,
      guestCount,
      weddingDate: addDays(today, 20 + index * 2),
      packageType: `Gói Tiệc Kim Cương Luxury ${index + 1}`,
      venue: VENUE_POOL[index % VENUE_POOL.length],
      eventNotes: index % 3 === 0 ? 'Bố trí sảnh tiệc rộng rãi, khu vực chụp ảnh riêng cho cô dâu chú rể.' : '',
      createdAt,
      signedDate: status === 'signed' || status === 'completed' ? addDays(new Date(createdAt), 3) : '',
      validUntil: addDays(today, 45 + index),
      coordinatorName: CONTRACT_COORDINATOR_OPTIONS[index % CONTRACT_COORDINATOR_OPTIONS.length],
      status,
      subTotal,
      discount,
      deposit,
      vatRate,
      grandTotal,
      items: buildItems(id, subTotal, tableCount),
      installments: buildInstallments(id, grandTotal, deposit, status),
      timeline: buildTimeline(status, createdAt),
    };
  });
}

let store: AdminContract[] = generateMockContracts();

export function getAdminContracts(): AdminContract[] {
  return store;
}

export function getAdminContractById(id: string): AdminContract | undefined {
  return store.find((c) => c.id === id);
}

export function addAdminContract(contract: AdminContract): void {
  store = [contract, ...store];
}

export function updateAdminContract(id: string, patch: Partial<AdminContract>): void {
  store = store.map((c) => (c.id === id ? { ...c, ...patch } : c));
}

export function deleteAdminContract(id: string): void {
  store = store.filter((c) => c.id !== id);
}

export function nextAdminContractId(): string {
  const maxNum = store.reduce((max, c) => {
    const num = Number(c.id.split('-').pop());
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 0);
  return `HD2507-${String(maxNum + 1).padStart(3, '0')}`;
}

// Báo giá khả dụng để khởi tạo hợp đồng (đã duyệt và chưa có hợp đồng liên kết).
export function getAvailableQuotationsForContract() {
  const linkedIds = new Set(store.map((c) => c.quotationId));
  return getAdminQuotations().filter((q) => q.status === 'approved' && !linkedIds.has(q.quotationId));
}

export function createContractFromQuotation(quotationId: string, coordinatorName: string): AdminContract {
  const quotation = getAdminQuotations().find((q) => q.quotationId === quotationId);
  const today = new Date('2026-07-10');
  const id = nextAdminContractId();
  const guestCount = quotation?.guestCount ?? 200;
  const tableCount = Math.max(1, Math.round(guestCount / 10));
  const subTotal = quotation?.totalAmount ?? 250_000_000;
  const discount = 10_000_000;
  const deposit = 30_000_000;
  const vatRate = 0.08;
  const grandTotal = Math.round((subTotal - discount) * (1 + vatRate));
  const createdAt = today.toISOString().slice(0, 10);

  return {
    id,
    quotationId,
    customerName: quotation?.customerName ?? 'Khách hàng chưa xác định',
    customerPhone: quotation?.customerPhone ?? '',
    customerEmail: '',
    customerCompany: '',
    customerAddress: '',
    eventName: `Lễ cưới ${quotation?.customerName ?? ''}`.trim(),
    guestCount,
    weddingDate: addDays(today, 45),
    packageType: quotation?.servicePackage ?? 'Gói tiệc cưới',
    venue: VENUE_POOL[0],
    eventNotes: '',
    createdAt,
    signedDate: '',
    validUntil: addDays(today, 60),
    coordinatorName,
    status: 'draft',
    subTotal,
    discount,
    deposit,
    vatRate,
    grandTotal,
    items: buildItems(id, subTotal, tableCount),
    installments: buildInstallments(id, grandTotal, deposit, 'draft'),
    timeline: buildTimeline('draft', createdAt),
  };
}
