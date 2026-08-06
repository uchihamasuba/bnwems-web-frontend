import type { SupplierStatus } from '@/types/supplier';

// Trang /admin/suppliers ("Danh sách Nhà cung cấp đối tác") và /admin/suppliers/purchase-orders
// ("Hợp đồng & Đơn thuê ngoài đối tác") code THUẦN GIAO DIỆN theo mục 0 CLAUDE.md — dùng dữ liệu ảo
// dưới đây, không gọi supplierApiService/procurementApiService (xem src/app/manager/suppliers/page.tsx
// để tham khảo cách gọi API thật khi backend sẵn sàng). "Dư nợ công nợ" ở đây là số dư mock trực tiếp
// trên từng đối tác để khớp ảnh mẫu — thực tế công nợ Supplier được suy ra từ các giao dịch mua/thuê
// chưa thanh toán (xem src/services/debt.service.ts), chưa có field lưu sẵn trên Supplier. Mỗi giao
// dịch thuê/mua (SupplierTransactionSummary) nằm trong `transactions` của từng đối tác — trang
// purchase-orders hiển thị danh sách gộp (flatten) từ toàn bộ đối tác qua getAllSupplierTransactions().
// Không liên kết với src/mocks/supplierServicesMock.ts (mock khác, dùng tên NCC/mã hạng mục riêng cho
// trang /admin/catalog/supplier-services).

export type SupplierTransactionStatus = 'NEW' | 'RECEIVED' | 'CANCELLED';

export const SUPPLIER_TRANSACTION_STATUS_META: Record<SupplierTransactionStatus, { label: string; badgeClass: string }> = {
  NEW: { label: 'Mới', badgeClass: 'bg-amber-100 text-amber-700' },
  RECEIVED: { label: 'Đã nhận hàng', badgeClass: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Đã hủy', badgeClass: 'bg-slate-100 text-slate-500' },
};

export type SupplierOrderType = 'RENT' | 'BUY';

export const SUPPLIER_ORDER_TYPE_META: Record<SupplierOrderType, { label: string; fullLabel: string; badgeClass: string }> = {
  RENT: { label: 'Thuê', fullLabel: 'Thuê mướn', badgeClass: 'bg-blue-100 text-blue-700' },
  BUY: { label: 'Mua', fullLabel: 'Mua sắm', badgeClass: 'bg-violet-100 text-violet-700' },
};

export interface SupplierTransactionLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface SupplierTransactionSummary {
  requestCode: string;
  title: string;
  customerLabel: string;
  /** Mã đơn đặt cưới nội bộ liên kết (VD: ORD001) — hiển thị ở modal chi tiết đơn hàng. */
  orderLinkCode: string;
  /** Ngày đặt / ngày thực hiện yêu cầu — hiển thị "Ngày thực hiện" ở hồ sơ đối tác, "Ngày đặt" ở trang đơn thuê/mua. */
  executionDate: string;
  /** Ngày dự kiến giao/hoàn thành — chỉ hiển thị ở trang đơn thuê/mua. */
  expectedDate: string;
  orderType: SupplierOrderType;
  value: number;
  status: SupplierTransactionStatus;
  lineItems: SupplierTransactionLineItem[];
  /** Số tiền đã trả cho NCC (giảm dư nợ) — dùng ở modal chi tiết đơn hàng và trang công nợ. */
  paidAmount: number;
  /** Bồi thường PHÁT SINH THÊM cho NCC (VD: mình làm hỏng thiết bị của họ) — TĂNG dư nợ. Chỉ hiển thị
   * ở modal chi tiết đơn hàng (purchase-orders). Khác chiều với `supplierDeduction`. */
  compensationAmount: number;
  /** Đền bù/giảm trừ TỪ phía NCC (VD: họ giao thiếu/trễ/lỗi) — GIẢM dư nợ phải trả. Chỉ hiển thị ở
   * trang Công nợ nhà cung cấp (/admin/reports/debts). */
  supplierDeduction: number;
}

/** Dư nợ còn lại của 1 giao dịch NCC = giá trị đơn + bồi thường phát sinh - đền bù từ NCC - đã trả. */
export function getSupplierTransactionRemainingDebt(t: SupplierTransactionSummary): number {
  return t.value + t.compensationAmount - t.supplierDeduction - t.paidAmount;
}

export interface SupplierCatalogItem {
  itemCode: string;
  itemName: string;
  price: number;
  unit: string;
}

export interface AdminSupplier {
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  phone: string;
  email: string;
  address: string;
  serviceType: string;
  debtBalance: number;
  status: SupplierStatus;
  transactions: SupplierTransactionSummary[];
  catalogItems: SupplierCatalogItem[];
}

const SEED_SUPPLIERS: AdminSupplier[] = [
  {
    supplierId: 'sup-1',
    supplierCode: 'SUP002',
    supplierName: 'Ánh Sáng Pro',
    phone: '0978 123 456',
    email: 'proline.av@yahoo.com',
    address: 'Hoàng Mai, Hà Nội',
    serviceType: 'Âm thanh biểu diễn',
    debtBalance: 12_500_000,
    status: 'ACTIVE',
    transactions: [
      {
        requestCode: 'P0250601-001',
        title: 'Bộ âm thanh ánh sáng tiệc cưới chuyên nghiệp',
        customerLabel: 'KH: Lễ cưới Minh Anh - Thu Hà',
        orderLinkCode: 'ORD001',
        executionDate: '2025-06-01',
        expectedDate: '2025-06-12',
        orderType: 'RENT',
        value: 12_500_000,
        status: 'NEW',
        lineItems: [
          { name: 'Loa Full Array sân khấu lớn', quantity: 4, unitPrice: 2_000_000 },
          { name: 'Đèn Moving Head Beam 450W', quantity: 9, unitPrice: 500_000 },
        ],
        paidAmount: 0,
        compensationAmount: 0,
        supplierDeduction: 0,
      },
      {
        requestCode: 'P0250607-008',
        title: 'Hệ thống âm thanh biểu diễn ngoài trời công suất cao',
        customerLabel: 'KH: Lễ cưới Hoàng Giang - Ngọc Trinh',
        orderLinkCode: 'ORD008',
        executionDate: '2025-06-07',
        expectedDate: '2025-06-14',
        orderType: 'RENT',
        value: 55_050_000,
        status: 'NEW',
        lineItems: [{ name: 'Hệ thống âm thanh biểu diễn ngoài trời công suất cao', quantity: 1, unitPrice: 55_050_000 }],
        paidAmount: 0,
        compensationAmount: 0,
        supplierDeduction: 0,
      },
    ],
    catalogItems: [
      { itemCode: 'TB-0001', itemName: 'Bàn tiệc tròn 1.6m', price: 120_000, unit: 'cái' },
      { itemCode: 'TB-0002', itemName: 'Ghế Tiffany', price: 45_000, unit: 'cái' },
    ],
  },
  {
    supplierId: 'sup-2',
    supplierCode: 'SUP_TL',
    supplierName: 'Tùng Lâm Decor',
    phone: '0987 654 321',
    email: 'tunglamdecor@gmail.com',
    address: 'Thanh Xuân, Hà Nội',
    serviceType: 'Hoa tươi cắm tiệc',
    debtBalance: 8_750_000,
    status: 'ACTIVE',
    transactions: [
      {
        requestCode: 'P0250602-002',
        title: 'Trang trí hoa cổng và sảnh tiệc cưới',
        customerLabel: 'KH: Lễ cưới Quốc Phong - Bảo Trân',
        orderLinkCode: 'ORD002',
        executionDate: '2025-06-02',
        expectedDate: '2025-06-10',
        orderType: 'BUY',
        value: 8_750_000,
        status: 'NEW',
        lineItems: [
          { name: 'Cổng hoa lụa cao cấp', quantity: 1, unitPrice: 1_500_000 },
          { name: 'Trang trí hoa tươi sảnh tiệc cưới', quantity: 1, unitPrice: 7_250_000 },
        ],
        paidAmount: 0,
        compensationAmount: 0,
        supplierDeduction: 0,
      },
    ],
    catalogItems: [
      { itemCode: 'HD-0001', itemName: 'Cổng hoa lụa cao cấp', price: 1_500_000, unit: 'bộ' },
      { itemCode: 'HD-0002', itemName: 'Hoa cầm tay cô dâu', price: 350_000, unit: 'bó' },
    ],
  },
  {
    supplierId: 'sup-3',
    supplierCode: 'SUP_HD',
    supplierName: 'Hoàng Duy Audio',
    phone: '0912 345 678',
    email: 'hoangduyaudio@gmail.com',
    address: 'Hai Bà Trưng, Hà Nội',
    serviceType: 'Âm thanh biểu diễn',
    debtBalance: 17_500_000,
    status: 'ACTIVE',
    transactions: [
      {
        requestCode: 'P0250603-003',
        title: 'Dàn âm thanh sân khấu ngoài trời',
        customerLabel: 'KH: Tiệc cưới Hữu Nghĩa - Mỹ Linh',
        orderLinkCode: 'ORD003',
        executionDate: '2025-06-03',
        expectedDate: '2025-06-18',
        orderType: 'RENT',
        value: 20_000_000,
        status: 'RECEIVED',
        lineItems: [{ name: 'Dàn âm thanh sân khấu ngoài trời', quantity: 1, unitPrice: 20_000_000 }],
        paidAmount: 0,
        compensationAmount: 0,
        supplierDeduction: 2_500_000,
      },
    ],
    catalogItems: [{ itemCode: 'AT-0001', itemName: 'Loa full đôi JBL', price: 2_800_000, unit: 'bộ' }],
  },
  {
    supplierId: 'sup-4',
    supplierCode: 'SUP_NC',
    supplierName: 'Nội Thất Ngọc Châu',
    phone: '0902 456 679',
    email: 'ngocchaunoithat@gmail.com',
    address: 'Ba Đình, Hà Nội',
    serviceType: 'Yến tiệc cưới ẩm thực',
    debtBalance: 0,
    status: 'ACTIVE',
    transactions: [
      {
        requestCode: 'P0250603-004',
        title: 'Bàn tròn 10 người phục vụ tiệc cưới',
        customerLabel: 'KH: Lễ cưới Thành Đạt - Phương Vy',
        orderLinkCode: 'ORD004',
        executionDate: '2025-06-03',
        expectedDate: '2025-06-15',
        orderType: 'BUY',
        value: 6_200_000,
        status: 'RECEIVED',
        lineItems: [{ name: 'Bàn tròn 10 người phục vụ tiệc cưới', quantity: 1, unitPrice: 6_200_000 }],
        paidAmount: 6_200_000,
        compensationAmount: 0,
        supplierDeduction: 0,
      },
    ],
    catalogItems: [{ itemCode: 'BG-0001', itemName: 'Bàn tròn 10 người', price: 180_000, unit: 'cái' }],
  },
  {
    supplierId: 'sup-5',
    supplierCode: 'SUP_MP',
    supplierName: 'Minh Phát Flowers',
    phone: '0933 789 123',
    email: 'minhphatflowers@gmail.com',
    address: 'Cầu Giấy, Hà Nội',
    serviceType: 'Hoa tươi cắm tiệc',
    debtBalance: 0,
    status: 'ACTIVE',
    transactions: [
      {
        requestCode: 'P0250604-005',
        title: 'Trang trí hoa tươi tiệc cưới trọn gói',
        customerLabel: 'KH: Tiệc cưới Trung Kiên - Diệu Linh',
        orderLinkCode: 'ORD005',
        executionDate: '2025-06-04',
        expectedDate: '2025-06-23',
        orderType: 'RENT',
        value: 7_800_000,
        status: 'RECEIVED',
        lineItems: [{ name: 'Trang trí hoa tươi tiệc cưới trọn gói', quantity: 1, unitPrice: 7_800_000 }],
        paidAmount: 7_800_000,
        compensationAmount: 0,
        supplierDeduction: 0,
      },
    ],
    catalogItems: [{ itemCode: 'HD-0003', itemName: 'Trang trí bàn tiệc hoa tươi', price: 250_000, unit: 'bàn' }],
  },
  {
    supplierId: 'sup-6',
    supplierCode: 'SUP_VP',
    supplierName: 'Việt Phát Furniture',
    phone: '0977 234 567',
    email: 'vietphatfurniture@gmail.com',
    address: 'Đống Đa, Hà Nội',
    serviceType: 'Nội thất bàn ghế',
    debtBalance: 9_450_000,
    status: 'ACTIVE',
    transactions: [
      {
        requestCode: 'P0250620-006',
        title: 'Bàn ghế tiệc cưới trọn gói 40 bàn',
        customerLabel: 'KH: Lễ cưới Đình Khang - Cao Yến',
        orderLinkCode: 'ORD006',
        executionDate: '2025-06-20',
        expectedDate: '2025-06-28',
        orderType: 'BUY',
        value: 9_450_000,
        status: 'NEW',
        lineItems: [{ name: 'Bàn ghế tiệc cưới trọn gói 40 bàn', quantity: 1, unitPrice: 9_450_000 }],
        paidAmount: 0,
        compensationAmount: 0,
        supplierDeduction: 0,
      },
    ],
    catalogItems: [
      { itemCode: 'BG-0002', itemName: 'Ghế Chiavari vàng', price: 45_000, unit: 'cái' },
      { itemCode: 'BG-0003', itemName: 'Bàn chữ nhật 1.8m', price: 150_000, unit: 'cái' },
    ],
  },
  {
    supplierId: 'sup-7',
    supplierCode: 'SUP_TT',
    supplierName: 'Thiên Trường Rạp Cưới',
    phone: '0966 345 678',
    email: 'thientruongrap@gmail.com',
    address: 'Long Biên, Hà Nội',
    serviceType: 'Khung rạp & bạt che',
    debtBalance: 4_200_000,
    status: 'INACTIVE',
    transactions: [
      {
        requestCode: 'P0250510-007',
        title: 'Nhà rạp che sân sự kiện 6x12m',
        customerLabel: 'KH: Lễ cưới Anh Khoa - Thanh Trúc',
        orderLinkCode: 'ORD007',
        executionDate: '2025-05-10',
        expectedDate: '2025-05-16',
        orderType: 'RENT',
        value: 4_200_000,
        status: 'CANCELLED',
        lineItems: [{ name: 'Nhà rạp che sân sự kiện 6x12m', quantity: 1, unitPrice: 4_200_000 }],
        paidAmount: 0,
        compensationAmount: 0,
        supplierDeduction: 0,
      },
    ],
    catalogItems: [{ itemCode: 'KR-0001', itemName: 'Khung sắt 2.5m', price: 50_000, unit: 'cái' }],
  },
];

let store: AdminSupplier[] = SEED_SUPPLIERS;
let supplierSeq = SEED_SUPPLIERS.length;
let transactionSeq = SEED_SUPPLIERS.reduce((sum, s) => sum + s.transactions.length, 0);

export function getAdminSuppliers(): AdminSupplier[] {
  return store;
}

export function getAdminSupplierById(id: string): AdminSupplier | undefined {
  return store.find((s) => s.supplierId === id);
}

export interface AdminSupplierFormValues {
  supplierCode: string;
  supplierName: string;
  phone: string;
  address: string;
  serviceType: string;
}

export function createAdminSupplier(values: AdminSupplierFormValues): AdminSupplier {
  supplierSeq += 1;
  const supplier: AdminSupplier = {
    supplierId: `sup-${supplierSeq}`,
    supplierCode: values.supplierCode,
    supplierName: values.supplierName,
    phone: values.phone,
    email: '',
    address: values.address,
    serviceType: values.serviceType,
    debtBalance: 0,
    status: 'ACTIVE',
    transactions: [],
    catalogItems: [],
  };
  store = [supplier, ...store];
  return supplier;
}

export function updateAdminSupplier(id: string, values: AdminSupplierFormValues): void {
  store = store.map((s) => (s.supplierId === id ? { ...s, ...values } : s));
}

export function toggleAdminSupplierStatus(id: string): void {
  store = store.map((s) => (s.supplierId === id ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : s));
}

export interface FlatSupplierTransaction extends SupplierTransactionSummary {
  supplierId: string;
  supplierName: string;
}

/** Danh sách gộp toàn bộ giao dịch thuê/mua ngoài của mọi đối tác — dùng cho trang purchase-orders. */
export function getAllSupplierTransactions(): FlatSupplierTransaction[] {
  return store.flatMap((s) => s.transactions.map((t) => ({ ...t, supplierId: s.supplierId, supplierName: s.supplierName })));
}

export interface SupplierTransactionFormValues {
  supplierId: string;
  title: string;
  customerLabel: string;
  executionDate: string;
  expectedDate: string;
  orderType: SupplierOrderType;
  value: number;
  status: SupplierTransactionStatus;
  paidAmount: number;
  compensationAmount: number;
  supplierDeduction: number;
}

let orderLinkSeq = store.reduce((max, s) => {
  const nums = s.transactions.map((t) => Number(t.orderLinkCode.replace(/\D/g, '')) || 0);
  return Math.max(max, ...nums, 0);
}, 0);

function nextTransactionCode(executionDate: string): string {
  transactionSeq += 1;
  const d = new Date(executionDate);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `P${yy}${mm}${dd}-${String(transactionSeq).padStart(3, '0')}`;
}

function nextOrderLinkCode(): string {
  orderLinkSeq += 1;
  return `ORD${String(orderLinkSeq).padStart(3, '0')}`;
}

export function createSupplierTransaction(values: SupplierTransactionFormValues): FlatSupplierTransaction {
  const requestCode = nextTransactionCode(values.executionDate);
  const transaction: SupplierTransactionSummary = {
    requestCode,
    title: values.title,
    customerLabel: values.customerLabel,
    orderLinkCode: nextOrderLinkCode(),
    executionDate: values.executionDate,
    expectedDate: values.expectedDate,
    orderType: values.orderType,
    value: values.value,
    status: values.status,
    lineItems: [{ name: values.title, quantity: 1, unitPrice: values.value }],
    paidAmount: values.paidAmount,
    compensationAmount: values.compensationAmount,
    supplierDeduction: values.supplierDeduction,
  };
  store = store.map((s) => (s.supplierId === values.supplierId ? { ...s, transactions: [transaction, ...s.transactions] } : s));
  const supplier = store.find((s) => s.supplierId === values.supplierId);
  return { ...transaction, supplierId: values.supplierId, supplierName: supplier?.supplierName ?? '' };
}

export function updateSupplierTransaction(supplierId: string, requestCode: string, values: SupplierTransactionFormValues): void {
  store = store.map((s) =>
    s.supplierId === supplierId
      ? {
          ...s,
          transactions: s.transactions.map((t) =>
            t.requestCode === requestCode
              ? {
                  ...t,
                  title: values.title,
                  customerLabel: values.customerLabel,
                  executionDate: values.executionDate,
                  expectedDate: values.expectedDate,
                  orderType: values.orderType,
                  value: values.value,
                  status: values.status,
                  paidAmount: values.paidAmount,
                  compensationAmount: values.compensationAmount,
                  supplierDeduction: values.supplierDeduction,
                }
              : t,
          ),
        }
      : s,
  );
}

export interface RecordSupplierPaymentInput {
  amount: number;
  date: string;
  evidenceFileName: string;
}

/** Ghi nhận thêm 1 khoản đã trả cho NCC ở 1 giao dịch — cộng dồn vào `paidAmount` hiện có. */
export function recordSupplierPayment(supplierId: string, requestCode: string, input: RecordSupplierPaymentInput): void {
  store = store.map((s) =>
    s.supplierId === supplierId
      ? {
          ...s,
          transactions: s.transactions.map((t) =>
            t.requestCode === requestCode ? { ...t, paidAmount: t.paidAmount + input.amount } : t,
          ),
        }
      : s,
  );
}
