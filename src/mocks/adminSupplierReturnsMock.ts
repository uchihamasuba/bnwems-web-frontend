// Trang /admin/suppliers/returns ("Trả thiết bị NCC") code THUẦN GIAO DIỆN theo mục 0 CLAUDE.md —
// dùng dữ liệu ảo dưới đây, không gọi API thật. Mỗi "phiếu trả thiết bị" ghi nhận việc hoàn trả thiết
// bị đã THUÊ NGOÀI từ một nhà cung cấp sau khi thi công xong, kèm số lượng nguyên vẹn/hỏng/mất và tiền
// đền bù cho NCC nếu có hư tổn. Đây là dữ liệu riêng cho tính năng này (mã đơn thuê "NCC-RENT-2026-
// 00xx" khác với mã P0xxxxxx-0xx ở src/mocks/adminSuppliersMock.ts) — tái dùng tên nhà cung cấp cho
// nhất quán nhưng không cộng dồn số liệu chéo giữa 2 mock để tránh phức tạp không cần thiết ở giai
// đoạn dựng UI.

export type SupplierReturnStatus = 'NEW' | 'APPROVED';

export const SUPPLIER_RETURN_STATUS_META: Record<SupplierReturnStatus, { listLabel: string; detailLabel: string; badgeClass: string }> = {
  NEW: { listLabel: 'Mới', detailLabel: 'Chờ duyệt (Mới)', badgeClass: 'bg-amber-100 text-amber-700' },
  APPROVED: { listLabel: 'Đã duyệt', detailLabel: 'Đã duyệt', badgeClass: 'bg-emerald-100 text-emerald-700' },
};

export interface SupplierRentalOrderItemRef {
  itemName: string;
  quantityRented: number;
  unitReplacementValue: number;
}

export interface SupplierRentalOrderRef {
  code: string;
  eventName: string;
  supplierName: string;
  rentalStart: string;
  rentalEnd: string;
  items: SupplierRentalOrderItemRef[];
}

const RENTAL_ORDERS: SupplierRentalOrderRef[] = [
  {
    code: 'NCC-RENT-2026-0012',
    eventName: 'Đám cưới Minh Anh & Thu Hà',
    supplierName: 'Ánh Sáng Pro',
    rentalStart: '2026-05-25',
    rentalEnd: '2026-05-29',
    items: [
      { itemName: 'Loa Full Array sân khấu lớn', quantityRented: 4, unitReplacementValue: 5_000_000 },
      { itemName: 'Đèn Moving Head Beam 450W', quantityRented: 9, unitReplacementValue: 3_500_000 },
    ],
  },
  {
    code: 'NCC-RENT-2026-0013',
    eventName: 'Đám cưới Thanh Tùng & Khánh Vy',
    supplierName: 'Tùng Lâm Decor',
    rentalStart: '2026-05-26',
    rentalEnd: '2026-05-30',
    items: [
      { itemName: 'Cổng hoa lụa cao cấp', quantityRented: 2, unitReplacementValue: 2_000_000 },
      { itemName: 'Bàn tiệc trang trí hoa tươi', quantityRented: 3, unitReplacementValue: 500_000 },
    ],
  },
  {
    code: 'NCC-RENT-2026-0014',
    eventName: 'Đám cưới Thế Anh & Mai Phương',
    supplierName: 'Hoàng Duy Audio',
    rentalStart: '2026-05-28',
    rentalEnd: '2026-05-31',
    items: [
      { itemName: 'Loa monitor JBL rước dâu', quantityRented: 2, unitReplacementValue: 4_000_000 },
      { itemName: 'Trọn gói thiết bị âm thanh ban nhạc', quantityRented: 1, unitReplacementValue: 15_000_000 },
    ],
  },
  {
    code: 'NCC-RENT-2026-0015',
    eventName: 'Đám cưới Trung Hiếu & Quỳnh Như',
    supplierName: 'Minh Phát Flowers',
    rentalStart: '2026-05-27',
    rentalEnd: '2026-05-31',
    items: [{ itemName: 'Trang trí hoa tươi sảnh tiệc', quantityRented: 1, unitReplacementValue: 3_000_000 }],
  },
  {
    code: 'NCC-RENT-2026-0016',
    eventName: 'Đám cưới Bảo Ngọc & Đức Long',
    supplierName: 'Việt Phát Furniture',
    rentalStart: '2026-05-27',
    rentalEnd: '2026-05-30',
    items: [{ itemName: 'Ghế Chiavari vàng', quantityRented: 50, unitReplacementValue: 45_000 }],
  },
];

export function getSupplierRentalOrders(): SupplierRentalOrderRef[] {
  return RENTAL_ORDERS;
}

export function getSupplierRentalOrderByCode(code: string): SupplierRentalOrderRef | undefined {
  return RENTAL_ORDERS.find((o) => o.code === code);
}

export interface SupplierReturnItem {
  itemName: string;
  quantityRented: number;
  intact: number;
  damaged: number;
  lost: number;
  compensationAmount: number;
}

export interface SupplierReturnSlip {
  id: string;
  orderCode: string;
  orderName: string;
  supplierName: string;
  status: SupplierReturnStatus;
  createdAt: string;
}

const SEED_SLIPS: (SupplierReturnSlip & { items: SupplierReturnItem[] })[] = [
  {
    id: 'THNCC-026',
    orderCode: 'NCC-RENT-2026-0012',
    orderName: 'Đám cưới Minh Anh & Thu Hà',
    supplierName: 'Ánh Sáng Pro',
    status: 'NEW',
    createdAt: '2026-07-12T18:28:00',
    items: [
      { itemName: 'Loa Full Array sân khấu lớn', quantityRented: 4, intact: 4, damaged: 0, lost: 0, compensationAmount: 0 },
      { itemName: 'Đèn Moving Head Beam 450W', quantityRented: 9, intact: 9, damaged: 0, lost: 0, compensationAmount: 0 },
    ],
  },
  {
    id: 'THNCC-001',
    orderCode: 'NCC-RENT-2026-0012',
    orderName: 'Đám cưới Minh Anh & Thu Hà',
    supplierName: 'Ánh Sáng Pro',
    status: 'NEW',
    createdAt: '2026-05-28T09:15:00',
    items: [
      { itemName: 'Loa Full Array sân khấu lớn', quantityRented: 4, intact: 4, damaged: 0, lost: 0, compensationAmount: 0 },
      { itemName: 'Đèn Moving Head Beam 450W', quantityRented: 9, intact: 9, damaged: 0, lost: 0, compensationAmount: 0 },
    ],
  },
  {
    id: 'THNCC-002',
    orderCode: 'NCC-RENT-2026-0013',
    orderName: 'Đám cưới Thanh Tùng & Khánh Vy',
    supplierName: 'Tùng Lâm Decor',
    status: 'APPROVED',
    createdAt: '2026-05-28T10:30:00',
    items: [
      { itemName: 'Cổng hoa lụa cao cấp', quantityRented: 2, intact: 2, damaged: 0, lost: 0, compensationAmount: 0 },
      { itemName: 'Bàn tiệc trang trí hoa tươi', quantityRented: 3, intact: 3, damaged: 0, lost: 0, compensationAmount: 0 },
    ],
  },
  {
    id: 'THNCC-003',
    orderCode: 'NCC-RENT-2026-0014',
    orderName: 'Đám cưới Thế Anh & Mai Phương',
    supplierName: 'Hoàng Duy Audio',
    status: 'NEW',
    createdAt: '2026-05-28T11:05:00',
    items: [
      { itemName: 'Loa monitor JBL rước dâu', quantityRented: 2, intact: 2, damaged: 0, lost: 0, compensationAmount: 0 },
      { itemName: 'Trọn gói thiết bị âm thanh ban nhạc', quantityRented: 1, intact: 1, damaged: 0, lost: 0, compensationAmount: 0 },
    ],
  },
  {
    id: 'THNCC-004',
    orderCode: 'NCC-RENT-2026-0015',
    orderName: 'Đám cưới Trung Hiếu & Quỳnh Như',
    supplierName: 'Minh Phát Flowers',
    status: 'APPROVED',
    createdAt: '2026-05-28T13:20:00',
    items: [{ itemName: 'Trang trí hoa tươi sảnh tiệc', quantityRented: 1, intact: 1, damaged: 0, lost: 0, compensationAmount: 0 }],
  },
  {
    id: 'THNCC-005',
    orderCode: 'NCC-RENT-2026-0016',
    orderName: 'Đám cưới Bảo Ngọc & Đức Long',
    supplierName: 'Việt Phát Furniture',
    status: 'NEW',
    createdAt: '2026-05-28T14:45:00',
    items: [{ itemName: 'Ghế Chiavari vàng', quantityRented: 50, intact: 48, damaged: 2, lost: 0, compensationAmount: 90_000 }],
  },
];

let store: (SupplierReturnSlip & { items: SupplierReturnItem[] })[] = SEED_SLIPS;

export function getSupplierReturnSlips(): SupplierReturnSlip[] {
  return store;
}

export function getSupplierReturnSlipById(id: string): (SupplierReturnSlip & { items: SupplierReturnItem[] }) | undefined {
  return store.find((s) => s.id === id);
}

function nextSlipId(): string {
  const maxNum = store.reduce((max, s) => Math.max(max, Number(s.id.replace(/\D/g, '')) || 0), 0);
  return `THNCC-${String(maxNum + 1).padStart(3, '0')}`;
}

export interface CreateSupplierReturnSlipInput {
  orderCode: string;
  orderName: string;
  items: SupplierReturnItem[];
}

export function createSupplierReturnSlip(input: CreateSupplierReturnSlipInput): SupplierReturnSlip {
  const order = getSupplierRentalOrderByCode(input.orderCode);
  const slip: SupplierReturnSlip & { items: SupplierReturnItem[] } = {
    id: nextSlipId(),
    orderCode: input.orderCode,
    orderName: input.orderName,
    supplierName: order?.supplierName ?? '',
    status: 'NEW',
    createdAt: new Date().toISOString(),
    items: input.items,
  };
  store = [slip, ...store];
  return slip;
}

export function approveSupplierReturnSlip(id: string): void {
  store = store.map((s) => (s.id === id ? { ...s, status: 'APPROVED' } : s));
}
