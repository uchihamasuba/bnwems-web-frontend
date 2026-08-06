import type { BadgeVariant } from '@/components/ui/Badge';

// Trang /admin/catalog/packages ("Gói sản phẩm & dịch vụ") và /admin/inventory/stock-status ("Tồn kho
// doanh nghiệp") hiện code THUẦN GIAO DIỆN theo mục 0 CLAUDE.md, port từ docs/components/
// ProductsAndEquipmentView.tsx (catalog chi tiết) và docs/components/EnterpriseModulesView.tsx (case
// 'catalog-equipment-inventory'). Hai trang này cùng đọc chung một store mock ở đây vì bản chất là
// cùng một danh mục thiết bị sự kiện, chỉ khác lát cắt hiển thị (catalog quản trị đầy đủ vs. tổng quan
// tồn kho). /admin/inventory/outbound ("Xuất kho", xem adminWarehouseOutboundMock.ts) cũng trừ kho qua
// store này khi xác nhận xuất kho, để 3 màn hình luôn khớp số liệu với nhau trong phiên làm việc.

export type EquipmentStatus = 'active' | 'inactive';

export const EQUIPMENT_STATUS_META: Record<EquipmentStatus, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Đang hoạt động', variant: 'success' },
  inactive: { label: 'Ngừng kinh doanh', variant: 'neutral' },
};

export type StockLogType = 'nhap_kho' | 'xuat_kho' | 'bao_tri' | 'dieu_chinh';

export const STOCK_LOG_TYPE_META: Record<StockLogType, { label: string; variant: BadgeVariant }> = {
  nhap_kho: { label: 'Nhập kho', variant: 'success' },
  xuat_kho: { label: 'Xuất kho', variant: 'info' },
  bao_tri: { label: 'Đưa đi bảo trì', variant: 'warning' },
  dieu_chinh: { label: 'Điều chỉnh kiểm kê', variant: 'neutral' },
};

export interface StockLog {
  id: string;
  time: string; // YYYY-MM-DD HH:mm
  type: StockLogType;
  quantity: number;
  reason: string;
  reference: string;
}

export interface AdminEquipment {
  id: string; // BG005
  name: string;
  category: string;
  unit: string;
  price: number;
  status: EquipmentStatus;
  totalStock: number;
  availableStock: number;
  rentedStock: number; // đang đi tiệc / đang xuất kho phục vụ sự kiện
  maintenanceStock: number; // hỏng / đang sửa chữa
  location: string;
  specs: string;
  dimensions: string;
  material: string;
  replacementValue: number;
  installRequired: boolean;
  updatedAt: string; // YYYY-MM-DD
  logs: StockLog[];
}

export const EQUIPMENT_CATEGORY_OPTIONS = [
  'Bàn ghế',
  'Khăn bàn & Áo ghế',
  'Ấm chén & Cốc',
  'Quạt',
  'Khung nhà rạp',
  'Bạt trắng & Rèm',
  'Đèn & Thảm',
  'Cổng hoa & Hoa giả',
];

const SEED_EQUIPMENT: AdminEquipment[] = [
  {
    id: 'BG001',
    name: 'Bàn loại to (Hộp chữ nhật 1.8m x 0.9m)',
    category: 'Bàn ghế',
    unit: 'Cái',
    price: 150_000,
    status: 'active',
    totalStock: 80,
    availableStock: 65,
    rentedStock: 15,
    maintenanceStock: 0,
    location: 'Khu A - Tầng 1',
    specs: 'Mặt gỗ MDF phủ melamine chống nước, chân sắt gập tiện lợi',
    dimensions: '1.8m x 0.9m x 0.75m',
    material: 'Gỗ công nghiệp & Sắt',
    replacementValue: 1_200_000,
    installRequired: false,
    updatedAt: '2026-07-11',
    logs: [],
  },
  {
    id: 'BG002',
    name: 'Bàn loại nhỏ (Hộp chữ nhật 1.2m x 0.6m)',
    category: 'Bàn ghế',
    unit: 'Cái',
    price: 100_000,
    status: 'active',
    totalStock: 120,
    availableStock: 100,
    rentedStock: 20,
    maintenanceStock: 0,
    location: 'Khu A - Tầng 1',
    specs: 'Mặt gỗ trắng chân gấp gọn gàng, phù hợp bàn tiếp nước lễ ăn hỏi',
    dimensions: '1.2m x 0.6m x 0.75m',
    material: 'Gỗ & Sắt sơn tĩnh điện',
    replacementValue: 800_000,
    installRequired: false,
    updatedAt: '2026-07-11',
    logs: [],
  },
  {
    id: 'BG003',
    name: 'Ghế đẩu',
    category: 'Bàn ghế',
    unit: 'Cái',
    price: 15_000,
    status: 'active',
    totalStock: 500,
    availableStock: 450,
    rentedStock: 50,
    maintenanceStock: 0,
    location: 'Khu A - Tầng 1',
    specs: 'Ghế đẩu nhựa đúc tròn xếp chồng gọn gàng',
    dimensions: 'H: 45cm x D: 30cm',
    material: 'Nhựa PP cao cấp',
    replacementValue: 50_000,
    installRequired: false,
    updatedAt: '2026-07-11',
    logs: [],
  },
  {
    id: 'BG004',
    name: 'Ghế inox',
    category: 'Bàn ghế',
    unit: 'Cái',
    price: 20_000,
    status: 'active',
    totalStock: 400,
    availableStock: 350,
    rentedStock: 48,
    maintenanceStock: 2,
    location: 'Khu A - Tầng 1',
    specs: 'Ghế inox tròn có đệm hoặc inox trơn siêu bền',
    dimensions: 'H: 45cm x D: 30cm',
    material: 'Inox 304 không gỉ',
    replacementValue: 120_000,
    installRequired: false,
    updatedAt: '2026-07-11',
    logs: [],
  },
  {
    id: 'BG005',
    name: 'Ghế chiavari',
    category: 'Bàn ghế',
    unit: 'Cái',
    price: 120_000,
    status: 'active',
    totalStock: 300,
    availableStock: 260,
    rentedStock: 38,
    maintenanceStock: 2,
    location: 'Khu A - Tầng 1',
    specs: 'Ghế tiffany cao cấp sang trọng kèm đệm lót nỉ nhung êm ái',
    dimensions: 'H: 92cm x W: 40cm x D: 40cm',
    material: 'Sắt sơn tĩnh điện hoặc nhôm mạ',
    replacementValue: 1_200_000,
    installRequired: false,
    updatedAt: '2026-07-11',
    logs: [
      { id: 'BG005-L1', time: '2026-07-05 09:20', type: 'nhap_kho', quantity: 50, reason: 'Nhập bổ sung đầu quý', reference: 'PN-2607-01' },
      { id: 'BG005-L2', time: '2026-07-08 14:10', type: 'bao_tri', quantity: 2, reason: 'Sứt chân ghế sau tiệc', reference: 'HD2507-003' },
    ],
  },
  {
    id: 'KB001',
    name: 'Khăn bàn màu đỏ',
    category: 'Khăn bàn & Áo ghế',
    unit: 'Cái',
    price: 50_000,
    status: 'active',
    totalStock: 150,
    availableStock: 130,
    rentedStock: 20,
    maintenanceStock: 0,
    location: 'Khu D - Kệ vải',
    specs: 'Vải gấm đỏ dày dặn dập nổi hoa văn rồng phượng tinh xảo',
    dimensions: '2.5m x 1.6m',
    material: 'Vải gấm cao cấp',
    replacementValue: 250_000,
    installRequired: false,
    updatedAt: '2026-07-10',
    logs: [],
  },
  {
    id: 'KB007',
    name: 'Áo ghế',
    category: 'Khăn bàn & Áo ghế',
    unit: 'Cái',
    price: 15_000,
    status: 'active',
    totalStock: 500,
    availableStock: 450,
    rentedStock: 50,
    maintenanceStock: 0,
    location: 'Khu D - Kệ vải',
    specs: 'Áo bọc ghế co giãn vừa vặn các loại ghế chiavari hoặc ghế đệm vuông',
    dimensions: 'Co giãn tiêu chuẩn',
    material: 'Vải thun mút cao cấp co giãn 4 chiều',
    replacementValue: 60_000,
    installRequired: false,
    updatedAt: '2026-07-10',
    logs: [],
  },
  {
    id: 'AC001',
    name: 'Cốc, chén, ấm nước',
    category: 'Ấm chén & Cốc',
    unit: 'Bộ',
    price: 250_000,
    status: 'active',
    totalStock: 120,
    availableStock: 105,
    rentedStock: 14,
    maintenanceStock: 1,
    location: 'Khu E',
    specs: 'Bộ ấm sứ trắng viền vàng (1 ấm, 6 chén, 6 đĩa lót kèm bình thủy tinh đựng cốc nước tiếp khách)',
    dimensions: 'Tiêu chuẩn bàn trà 6 người',
    material: 'Sứ xương cao cấp & Thủy tinh chịu nhiệt',
    replacementValue: 600_000,
    installRequired: false,
    updatedAt: '2026-07-09',
    logs: [],
  },
  {
    id: 'QT001',
    name: 'Quạt công nghiệp',
    category: 'Quạt',
    unit: 'Cái',
    price: 200_000,
    status: 'active',
    totalStock: 45,
    availableStock: 38,
    rentedStock: 6,
    maintenanceStock: 1,
    location: 'Khu B',
    specs: 'Quạt đứng sải cánh rộng công suất lớn làm mát nhanh chóng diện tích rộng',
    dimensions: 'Cao 1.5m, đường kính cánh 75cm',
    material: 'Thân thép sơn tĩnh điện, lồng sắt bảo vệ',
    replacementValue: 1_800_000,
    installRequired: false,
    updatedAt: '2026-07-08',
    logs: [{ id: 'QT001-L1', time: '2026-07-01 08:00', type: 'bao_tri', quantity: 1, reason: 'Motor kêu to bất thường', reference: 'Kiểm tra định kỳ' }],
  },
  {
    id: 'QT002',
    name: 'Quạt hơi nước',
    category: 'Quạt',
    unit: 'Cái',
    price: 400_000,
    status: 'active',
    totalStock: 25,
    availableStock: 20,
    rentedStock: 4,
    maintenanceStock: 1,
    location: 'Khu B',
    specs: 'Quạt điều hòa làm mát bằng hơi nước, dung tích bình chứa lớn 60L',
    dimensions: 'Cao 1.2m x Rộng 0.6m',
    material: 'Vỏ nhựa ABS siêu bền, động cơ lõi đồng',
    replacementValue: 4_500_000,
    installRequired: false,
    updatedAt: '2026-07-08',
    logs: [],
  },
  {
    id: 'KR001',
    name: 'Thanh sắt 2.5m (Cột đứng rạp)',
    category: 'Khung nhà rạp',
    unit: 'Cái',
    price: 50_000,
    status: 'active',
    totalStock: 200,
    availableStock: 170,
    rentedStock: 30,
    maintenanceStock: 0,
    location: 'Khu C - Bãi ngoài',
    specs: 'Thanh sắt tròn mạ kẽm phi 48 dày 1.8 ly chịu lực cao chống biến dạng',
    dimensions: 'Dài 2.5m x phi 48mm',
    material: 'Sắt mạ kẽm hòa phát',
    replacementValue: 200_000,
    installRequired: true,
    updatedAt: '2026-07-07',
    logs: [],
  },
  {
    id: 'KR004',
    name: 'Cột chống nhà rạp',
    category: 'Khung nhà rạp',
    unit: 'Cái',
    price: 100_000,
    status: 'active',
    totalStock: 80,
    availableStock: 70,
    rentedStock: 10,
    maintenanceStock: 0,
    location: 'Khu C - Bãi ngoài',
    specs: 'Cột chống chịu lực có tăng đơ nâng hạ độ cao linh hoạt',
    dimensions: 'Cao tùy chỉnh 2.2m - 3.5m',
    material: 'Thép ống lồng mạ kẽm dày dặn',
    replacementValue: 500_000,
    installRequired: true,
    updatedAt: '2026-07-07',
    logs: [],
  },
  {
    id: 'BT001',
    name: 'Bạt trắng (6x7)',
    category: 'Bạt trắng & Rèm',
    unit: 'Tấm',
    price: 500_000,
    status: 'active',
    totalStock: 30,
    availableStock: 26,
    rentedStock: 4,
    maintenanceStock: 0,
    location: 'Khu C - Tầng lửng',
    specs: 'Vải bạt tapulin Hàn Quốc 3 lớp chống mưa tuyệt đối cách nhiệt tốt',
    dimensions: '6m x 7m',
    material: 'PVC Tarpaulin dày 0.38mm',
    replacementValue: 3_500_000,
    installRequired: true,
    updatedAt: '2026-07-06',
    logs: [],
  },
  {
    id: 'DT001',
    name: 'Đèn nhấp nháy',
    category: 'Đèn & Thảm',
    unit: 'Dây',
    price: 50_000,
    status: 'active',
    totalStock: 200,
    availableStock: 175,
    rentedStock: 25,
    maintenanceStock: 0,
    location: 'Khu B - Kệ 3',
    specs: 'Dây đèn led đom đóm nhấp nháy chống nước thả rèm lấp lánh',
    dimensions: 'Dài 10m',
    material: 'Lõi đồng bọc silicon, bóng led tiết kiệm điện',
    replacementValue: 150_000,
    installRequired: true,
    updatedAt: '2026-07-06',
    logs: [],
  },
  {
    id: 'DT006',
    name: 'Thảm đỏ',
    category: 'Đèn & Thảm',
    unit: 'm²',
    price: 50_000,
    status: 'active',
    totalStock: 400,
    availableStock: 350,
    rentedStock: 50,
    maintenanceStock: 0,
    location: 'Khu C - Tầng lửng',
    specs: 'Thảm nỉ đỏ tươi chuyên dụng cho lễ cưới lộng lẫy trải từ ngõ vào sảnh',
    dimensions: 'Khổ rộng 2m',
    material: 'Vải nỉ không dệt dai bền bắt mắt',
    replacementValue: 100_000,
    installRequired: true,
    updatedAt: '2026-07-05',
    logs: [],
  },
  {
    id: 'CH001',
    name: 'Khung cổng hình tròn',
    category: 'Cổng hoa & Hoa giả',
    unit: 'Cái',
    price: 300_000,
    status: 'active',
    totalStock: 15,
    availableStock: 13,
    rentedStock: 2,
    maintenanceStock: 0,
    location: 'Khu C - Bãi ngoài',
    specs: 'Khung sắt đôi hình tròn lắp ráp 4 mảnh sơn tĩnh điện làm cốt cắm cổng hoa',
    dimensions: 'Đường kính 2.4m',
    material: 'Sắt mạ kẽm hộp',
    replacementValue: 1_500_000,
    installRequired: true,
    updatedAt: '2026-07-04',
    logs: [],
  },
  {
    id: 'CH006',
    name: 'Hoa giả tone trắng',
    category: 'Cổng hoa & Hoa giả',
    unit: 'Cụm',
    price: 150_000,
    status: 'inactive',
    totalStock: 120,
    availableStock: 100,
    rentedStock: 20,
    maintenanceStock: 0,
    location: 'Khu E',
    specs: 'Cụm hoa hồng, tú cầu, lan hồ điệp giả màu trắng tuyết dải cắm sẵn dây leo tự nhiên',
    dimensions: 'Dài 1.2m',
    material: 'Hoa lụa dập nổi chân thật, cành nhựa lõi thép',
    replacementValue: 400_000,
    installRequired: true,
    updatedAt: '2026-06-28',
    logs: [{ id: 'CH006-L1', time: '2026-06-28 10:00', type: 'dieu_chinh', quantity: 0, reason: 'Ngừng kinh doanh mẫu cũ, chờ thay mẫu 2026', reference: 'Quyết định danh mục' }],
  },
];

let store: AdminEquipment[] = SEED_EQUIPMENT;

export function getAdminEquipment(): AdminEquipment[] {
  return store;
}

export function getAdminEquipmentById(id: string): AdminEquipment | undefined {
  return store.find((e) => e.id === id);
}

export function getAdminEquipmentCategories(): { category: string; count: number }[] {
  return EQUIPMENT_CATEGORY_OPTIONS.map((category) => ({ category, count: store.filter((e) => e.category === category).length })).filter(
    (c) => c.count > 0,
  );
}

function nextEquipmentId(category: string): string {
  const prefix = category
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'TB';
  const existingNums = store.filter((e) => e.id.startsWith(prefix)).map((e) => Number(e.id.slice(prefix.length)) || 0);
  const nextNum = (existingNums.length > 0 ? Math.max(...existingNums) : 0) + 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

export interface CreateEquipmentInput {
  name: string;
  category: string;
  unit: string;
  price: number;
  specs: string;
  dimensions: string;
  material: string;
  replacementValue: number;
  installRequired: boolean;
  status: EquipmentStatus;
  initialStock: number;
  location: string;
}

export function createAdminEquipment(input: CreateEquipmentInput): AdminEquipment {
  const id = nextEquipmentId(input.category);
  const today = new Date().toISOString().slice(0, 10);
  const equipment: AdminEquipment = {
    id,
    name: input.name,
    category: input.category,
    unit: input.unit,
    price: input.price,
    status: input.status,
    totalStock: input.initialStock,
    availableStock: input.initialStock,
    rentedStock: 0,
    maintenanceStock: 0,
    location: input.location,
    specs: input.specs,
    dimensions: input.dimensions,
    material: input.material,
    replacementValue: input.replacementValue,
    installRequired: input.installRequired,
    updatedAt: today,
    logs: [{ id: `${id}-L1`, time: `${today} 00:00`, type: 'nhap_kho', quantity: input.initialStock, reason: 'Khởi tạo tồn kho ban đầu', reference: 'Thêm sản phẩm mới' }],
  };
  store = [equipment, ...store];
  return equipment;
}

export function updateAdminEquipment(id: string, patch: Partial<AdminEquipment>): void {
  const today = new Date().toISOString().slice(0, 10);
  store = store.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: today } : e));
}

export function deleteAdminEquipment(id: string): void {
  store = store.filter((e) => e.id !== id);
}

/** Điều chỉnh tồn kho thủ công hoặc do xuất/hoàn kho tự động, đồng thời ghi log biến động. */
export function adjustAdminEquipmentStock(id: string, type: StockLogType, quantity: number, reason: string, reference: string): void {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const timeStr = `${dateStr} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  store = store.map((e) => {
    if (e.id !== id) return e;
    let { availableStock, rentedStock, maintenanceStock, totalStock } = e;
    switch (type) {
      case 'nhap_kho':
        availableStock += quantity;
        totalStock += quantity;
        break;
      case 'xuat_kho':
        availableStock = Math.max(0, availableStock - quantity);
        rentedStock += quantity;
        break;
      case 'bao_tri':
        availableStock = Math.max(0, availableStock - quantity);
        maintenanceStock += quantity;
        break;
      case 'dieu_chinh':
        availableStock = Math.max(0, availableStock + quantity);
        totalStock = Math.max(0, totalStock + quantity);
        break;
    }
    const log: StockLog = { id: `${id}-L${e.logs.length + 1}-${Date.now()}`, time: timeStr, type, quantity, reason, reference };
    return { ...e, availableStock, rentedStock, maintenanceStock, totalStock, updatedAt: dateStr, logs: [log, ...e.logs] };
  });
}

/** Trả thiết bị "đang đi tiệc" về lại kho khả dụng (dùng khi hoàn kho sau sự kiện). */
export function returnAdminEquipmentStock(id: string, quantity: number, reason: string, reference: string): void {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const timeStr = `${dateStr} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  store = store.map((e) => {
    if (e.id !== id) return e;
    const rentedStock = Math.max(0, e.rentedStock - quantity);
    const availableStock = e.availableStock + quantity;
    const log: StockLog = { id: `${id}-L${e.logs.length + 1}-${Date.now()}`, time: timeStr, type: 'nhap_kho', quantity, reason, reference };
    return { ...e, availableStock, rentedStock, updatedAt: dateStr, logs: [log, ...e.logs] };
  });
}
