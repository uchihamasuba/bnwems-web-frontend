import type { Item, ItemCategory, ItemType } from '@/types/catalog';

// Backend hiện không gọi được (Network Error, xem docs/more-require.md mục (jj)) — trong giai đoạn
// tập trung thiết kế giao diện thuần, các trang catalog dùng dữ liệu ảo dưới đây thay vì gọi
// `catalogApiService`. Khôi phục lại các lệnh gọi API thật khi backend hoạt động bình thường trở lại.

const CATEGORY_NAMES = [
  'Bàn ghế',
  'Khăn bàn & Áo ghế',
  'Ấm chén & Cốc',
  'Quạt',
  'Khung nhà rạp',
  'Mẩu sắt nối',
  'Bạt trắng & Rèm',
  'Đèn & Thảm',
  'Cổng hoa & Hoa giả',
  'Phụ kiện gallery',
  'Phông ăn cưới hỏi',
];

export const MOCK_CATEGORIES: ItemCategory[] = CATEGORY_NAMES.map((name, index) => ({
  categoryId: `cat-${index + 1}`,
  categoryName: name,
}));

// Mỗi nhóm sản phẩm ứng với đúng 1 loại thiết bị (không chia nhỏ theo type) để khớp cột
// "Nhóm sản phẩm" hiển thị trực tiếp trên UI.
export const MOCK_TYPES: ItemType[] = MOCK_CATEGORIES.map((category) => ({
  typeId: `type-${category.categoryId}`,
  categoryId: category.categoryId,
  typeName: category.categoryName,
  categoryName: category.categoryName,
}));

function typeIdOfCategory(categoryName: string): string {
  const category = MOCK_CATEGORIES.find((c) => c.categoryName === categoryName);
  return category ? `type-${category.categoryId}` : '';
}

interface SeedProduct {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  totalStock: number;
  availableStock: number;
}

// Danh mục sản phẩm & thiết bị cho thuê thực tế của Bliss (đối chiếu ảnh mẫu "Sản phẩm & thiết bị").
const SEED_PRODUCTS: SeedProduct[] = [
  // Bàn ghế
  { id: 'BG001', name: 'Bàn loại to (Hộp chữ nhật 1.8m x 0.9m)', category: 'Bàn ghế', unit: 'Cái', price: 150000, totalStock: 80, availableStock: 65 },
  { id: 'BG002', name: 'Bàn loại nhỏ (Hộp chữ nhật 1.2m x 0.6m)', category: 'Bàn ghế', unit: 'Cái', price: 100000, totalStock: 120, availableStock: 100 },
  { id: 'BG003', name: 'Ghế đẩu', category: 'Bàn ghế', unit: 'Cái', price: 15000, totalStock: 500, availableStock: 450 },
  { id: 'BG004', name: 'Ghế inox', category: 'Bàn ghế', unit: 'Cái', price: 20000, totalStock: 400, availableStock: 350 },
  { id: 'BG005', name: 'Ghế chiavari', category: 'Bàn ghế', unit: 'Cái', price: 120000, totalStock: 300, availableStock: 260 },

  // Khăn bàn & Áo ghế
  { id: 'KB001', name: 'Khăn bàn màu đỏ', category: 'Khăn bàn & Áo ghế', unit: 'Cái', price: 50000, totalStock: 150, availableStock: 130 },
  { id: 'KB002', name: 'Khăn bàn màu vàng', category: 'Khăn bàn & Áo ghế', unit: 'Cái', price: 50000, totalStock: 150, availableStock: 135 },
  { id: 'KB003', name: 'Khăn bàn màu trắng', category: 'Khăn bàn & Áo ghế', unit: 'Cái', price: 50000, totalStock: 200, availableStock: 160 },
  { id: 'KB004', name: 'Khăn bàn màu xanh dương', category: 'Khăn bàn & Áo ghế', unit: 'Cái', price: 50000, totalStock: 100, availableStock: 90 },
  { id: 'KB005', name: 'Khăn bàn màu rêu', category: 'Khăn bàn & Áo ghế', unit: 'Cái', price: 50000, totalStock: 100, availableStock: 85 },
  { id: 'KB006', name: 'Runner (dải vải trải dọc giữa bàn)', category: 'Khăn bàn & Áo ghế', unit: 'Cái', price: 30000, totalStock: 300, availableStock: 270 },
  { id: 'KB007', name: 'Áo ghế', category: 'Khăn bàn & Áo ghế', unit: 'Cái', price: 15000, totalStock: 500, availableStock: 450 },
  { id: 'KB008', name: 'Nơ ghế', category: 'Khăn bàn & Áo ghế', unit: 'Cái', price: 10000, totalStock: 600, availableStock: 540 },

  // Ấm chén & Cốc
  { id: 'AC001', name: 'Cốc, chén, ấm nước', category: 'Ấm chén & Cốc', unit: 'Bộ', price: 250000, totalStock: 120, availableStock: 105 },

  // Quạt
  { id: 'QT001', name: 'Quạt công nghiệp', category: 'Quạt', unit: 'Cái', price: 200000, totalStock: 45, availableStock: 38 },
  { id: 'QT002', name: 'Quạt hơi nước', category: 'Quạt', unit: 'Cái', price: 400000, totalStock: 25, availableStock: 20 },

  // Khung nhà rạp
  { id: 'KR001', name: 'Thanh sắt 2.5m (Cột đứng rạp)', category: 'Khung nhà rạp', unit: 'Cái', price: 50000, totalStock: 200, availableStock: 170 },
  { id: 'KR002', name: 'Thanh sắt 3m (Thanh xà giằng)', category: 'Khung nhà rạp', unit: 'Cái', price: 60000, totalStock: 250, availableStock: 210 },
  { id: 'KR003', name: 'Thanh sắt 4m (Thanh xà dọc chính)', category: 'Khung nhà rạp', unit: 'Cái', price: 80000, totalStock: 150, availableStock: 130 },
  { id: 'KR004', name: 'Cột chống nhà rạp', category: 'Khung nhà rạp', unit: 'Cái', price: 100000, totalStock: 80, availableStock: 70 },
  { id: 'KR005', name: 'Kèo (Kèo lắp mái tam giác)', category: 'Khung nhà rạp', unit: 'Cái', price: 120000, totalStock: 60, availableStock: 52 },
  { id: 'KR006', name: 'Thanh sắt lắp nóc', category: 'Khung nhà rạp', unit: 'Cái', price: 70000, totalStock: 100, availableStock: 85 },

  // Mẩu sắt nối
  { id: 'MS001', name: 'Mẩu nối góc', category: 'Mẩu sắt nối', unit: 'Cái', price: 15000, totalStock: 300, availableStock: 270 },
  { id: 'MS002', name: 'Mẩu dấu +', category: 'Mẩu sắt nối', unit: 'Cái', price: 15000, totalStock: 250, availableStock: 230 },
  { id: 'MS003', name: 'Mẩu nối 2 thanh sắt', category: 'Mẩu sắt nối', unit: 'Cái', price: 10000, totalStock: 400, availableStock: 360 },
  { id: 'MS004', name: 'Mẩu nối thanh xà trên', category: 'Mẩu sắt nối', unit: 'Cái', price: 15000, totalStock: 180, availableStock: 160 },
  { id: 'MS005', name: 'Mẩu lắp nóc', category: 'Mẩu sắt nối', unit: 'Cái', price: 15000, totalStock: 120, availableStock: 105 },
  { id: 'MS006', name: 'Mẩu lắp kèo', category: 'Mẩu sắt nối', unit: 'Cái', price: 15000, totalStock: 120, availableStock: 110 },

  // Bạt trắng & Rèm
  { id: 'BT001', name: 'Bạt trắng (6x7)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 500000, totalStock: 30, availableStock: 26 },
  { id: 'BT002', name: 'Bạt trắng (6x9)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 600000, totalStock: 25, availableStock: 22 },
  { id: 'BT003', name: 'Bạt trắng (3x4)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 200000, totalStock: 50, availableStock: 45 },
  { id: 'BT004', name: 'Bạt trắng (4x5)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 300000, totalStock: 40, availableStock: 36 },
  { id: 'BT005', name: 'Bạt trắng (4x3)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 220000, totalStock: 40, availableStock: 35 },
  { id: 'BT006', name: 'Bạt trắng (4x4)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 250000, totalStock: 35, availableStock: 31 },
  { id: 'BT007', name: 'Bạt trắng (6x3)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 350000, totalStock: 30, availableStock: 25 },
  { id: 'BT008', name: 'Bạt trắng (6x4)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 400000, totalStock: 30, availableStock: 27 },
  { id: 'BT009', name: 'Bạt trắng (6x5)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 450000, totalStock: 30, availableStock: 25 },
  { id: 'BT010', name: 'Bạt trắng (8x3)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 500000, totalStock: 20, availableStock: 18 },
  { id: 'BT011', name: 'Bạt trắng (8x4)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 550000, totalStock: 20, availableStock: 17 },
  { id: 'BT012', name: 'Bạt trắng (8x5)', category: 'Bạt trắng & Rèm', unit: 'Tấm', price: 600000, totalStock: 20, availableStock: 16 },
  { id: 'BT013', name: 'Rèm quây xung quanh các màu', category: 'Bạt trắng & Rèm', unit: 'Bộ', price: 300000, totalStock: 80, availableStock: 70 },
  { id: 'BT014', name: 'Rèm tạo sóng', category: 'Bạt trắng & Rèm', unit: 'Bộ', price: 350000, totalStock: 60, availableStock: 52 },
  { id: 'BT015', name: 'Quây trần nhà rạp', category: 'Bạt trắng & Rèm', unit: 'Bộ', price: 800000, totalStock: 40, availableStock: 35 },

  // Đèn & Thảm
  { id: 'DT001', name: 'Đèn nhấp nháy', category: 'Đèn & Thảm', unit: 'Dây', price: 50000, totalStock: 200, availableStock: 175 },
  { id: 'DT002', name: 'Đèn chùm trang trí', category: 'Đèn & Thảm', unit: 'Cái', price: 300000, totalStock: 30, availableStock: 24 },
  { id: 'DT003', name: 'Đèn chạy dọc 20m', category: 'Đèn & Thảm', unit: 'Dây', price: 150000, totalStock: 50, availableStock: 42 },
  { id: 'DT004', name: 'Đèn chim', category: 'Đèn & Thảm', unit: 'Cái', price: 100000, totalStock: 60, availableStock: 52 },
  { id: 'DT005', name: 'Thảm cỏ', category: 'Đèn & Thảm', unit: 'm²', price: 40000, totalStock: 500, availableStock: 420 },
  { id: 'DT006', name: 'Thảm đỏ', category: 'Đèn & Thảm', unit: 'm²', price: 50000, totalStock: 400, availableStock: 350 },

  // Cổng hoa & Hoa giả
  { id: 'CH001', name: 'Khung cổng hình tròn', category: 'Cổng hoa & Hoa giả', unit: 'Cái', price: 300000, totalStock: 15, availableStock: 13 },
  { id: 'CH002', name: 'Khung cổng hình vuông', category: 'Cổng hoa & Hoa giả', unit: 'Cái', price: 300000, totalStock: 15, availableStock: 12 },
  { id: 'CH003', name: 'Khung cổng hình lục giác', category: 'Cổng hoa & Hoa giả', unit: 'Cái', price: 350000, totalStock: 10, availableStock: 8 },
  { id: 'CH004', name: 'Cổng vòm bằng sắt để gắn hoa', category: 'Cổng hoa & Hoa giả', unit: 'Cái', price: 400000, totalStock: 12, availableStock: 10 },
  { id: 'CH005', name: 'Cổng vòm bằng nhựa để gắn hoa', category: 'Cổng hoa & Hoa giả', unit: 'Cái', price: 300000, totalStock: 15, availableStock: 13 },
  { id: 'CH006', name: 'Hoa giả tone trắng', category: 'Cổng hoa & Hoa giả', unit: 'Cụm', price: 150000, totalStock: 120, availableStock: 100 },
  { id: 'CH007', name: 'Hoa giả tone hồng', category: 'Cổng hoa & Hoa giả', unit: 'Cụm', price: 150000, totalStock: 100, availableStock: 85 },
  { id: 'CH008', name: 'Hoa giả tone đỏ', category: 'Cổng hoa & Hoa giả', unit: 'Cụm', price: 150000, totalStock: 100, availableStock: 88 },
  { id: 'CH009', name: 'Hoa giả tone pastel', category: 'Cổng hoa & Hoa giả', unit: 'Cụm', price: 180000, totalStock: 80, availableStock: 68 },
  { id: 'CH010', name: 'Hoa giả tone sen đá', category: 'Cổng hoa & Hoa giả', unit: 'Cụm', price: 200000, totalStock: 50, availableStock: 45 },

  // Phụ kiện gallery
  { id: 'PK001', name: 'Khung ảnh trang trí', category: 'Phụ kiện gallery', unit: 'Cái', price: 15000, totalStock: 200, availableStock: 180 },
  { id: 'PK002', name: 'Hòm tiền mừng (hình ngôi nhà)', category: 'Phụ kiện gallery', unit: 'Cái', price: 150000, totalStock: 15, availableStock: 13 },
  { id: 'PK003', name: 'Hòm tiền mừng (hình hòm thư)', category: 'Phụ kiện gallery', unit: 'Cái', price: 150000, totalStock: 15, availableStock: 14 },
  { id: 'PK004', name: 'Hòm tiền mừng (hình hòm mica trong suốt)', category: 'Phụ kiện gallery', unit: 'Cái', price: 200000, totalStock: 12, availableStock: 10 },
  { id: 'PK005', name: 'Bình hoa thủy tinh đủ kích thước', category: 'Phụ kiện gallery', unit: 'Chiếc', price: 50000, totalStock: 150, availableStock: 132 },
  { id: 'PK006', name: 'Khay 3 tầng', category: 'Phụ kiện gallery', unit: 'Chiếc', price: 60000, totalStock: 30, availableStock: 26 },
  { id: 'PK007', name: 'Khay gỗ', category: 'Phụ kiện gallery', unit: 'Chiếc', price: 40000, totalStock: 40, availableStock: 35 },
  { id: 'PK008', name: 'Khay 2 tầng sứ để bánh kẹo', category: 'Phụ kiện gallery', unit: 'Chiếc', price: 50000, totalStock: 30, availableStock: 26 },

  // Phông ăn cưới hỏi
  { id: 'PC001', name: 'Chữ trên phông', category: 'Phông ăn cưới hỏi', unit: 'Bộ', price: 200000, totalStock: 50, availableStock: 42 },
  { id: 'PC002', name: 'Đèn sân khấu', category: 'Phông ăn cưới hỏi', unit: 'Cái', price: 300000, totalStock: 40, availableStock: 32 },
  { id: 'PC003', name: 'Tráp ăn cưới hỏi', category: 'Phông ăn cưới hỏi', unit: 'Bộ', price: 1500000, totalStock: 10, availableStock: 8 },
  { id: 'PC004', name: 'Phông quây', category: 'Phông ăn cưới hỏi', unit: 'Bộ', price: 800000, totalStock: 25, availableStock: 21 },
];

const UPDATED_AT = '2026-07-11T00:00:00Z';

export const MOCK_ITEMS: Item[] = SEED_PRODUCTS.map((product) => ({
  itemId: product.id,
  itemCode: product.id,
  itemName: product.name,
  typeId: typeIdOfCategory(product.category),
  typeName: product.category,
  unit: product.unit,
  rentalPrice: product.price,
  status: 'ACTIVE',
  inventory: { quantityTotal: product.totalStock, quantityAvailable: product.availableStock },
  createdAt: UPDATED_AT,
  updatedAt: UPDATED_AT,
}));
