// Dữ liệu giả lập dùng cho src/app/api/v1/** — KHÔNG dùng cho production.
// Theo mẫu response trong docs/api/{07-customers,03-catalog,09-orders,08-quotations}.md

export const mockCustomers = [
  {
    id: 1,
    full_name: 'Trần Thị B',
    phone: '0908765432',
    email: 'b@example.com',
    address: '123 Lê Lợi, Q1',
    notes: 'Khách quen, ưu tiên tông trắng',
    status: 'active',
    created_by: { id: 5, full_name: 'Nguyễn Văn A' },
    updated_by: { id: 5, full_name: 'Nguyễn Văn A' },
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-02-01T08:00:00Z',
  },
  {
    id: 2,
    full_name: 'Lê Văn C',
    phone: '0911222333',
    email: 'c@example.com',
    address: '45 Hai Bà Trưng, Q3',
    notes: '',
    status: 'active',
    created_by: { id: 5, full_name: 'Nguyễn Văn A' },
    updated_by: { id: 5, full_name: 'Nguyễn Văn A' },
    created_at: '2026-02-05T08:00:00Z',
    updated_at: '2026-02-05T08:00:00Z',
  },
];

export const mockCatalogItems = [
  {
    id: 10,
    code: 'TB-001',
    name: 'Loa Bose L1',
    category_id: 3,
    category_name: 'Âm thanh',
    unit: 'Cái',
    status: 'active',
    current_price: 500000,
  },
  {
    id: 15,
    code: 'TB-002',
    name: 'Cổng hoa',
    category_id: 4,
    category_name: 'Trang trí',
    unit: 'Bộ',
    status: 'active',
    current_price: 3000000,
  },
];

export const mockOrders = [
  {
    id: 10,
    code: 'ORD-010',
    customer_id: 1,
    customer: { id: 1, full_name: 'Trần Thị B' },
    event_type: 'Tiệc cưới',
    event_date: '2026-07-01',
    event_end_date: '2026-07-01',
    venue_name: 'Trung tâm tiệc cưới X',
    venue_address: '789 Cách Mạng Tháng 8',
    guest_count: 300,
    notes: 'Tông màu trắng - xanh',
    status: 'confirmed',
    created_by: 5,
    updated_by: 5,
    created_at: '2026-06-10T08:00:00Z',
    updated_at: '2026-06-15T09:00:00Z',
  },
];

export const mockQuotations = [
  {
    id: 30,
    order_id: 10,
    version: 1,
    total_amount: 5000000,
    discount_amount: 200000,
    final_amount: 4800000,
    notes: 'Báo giá lần 1',
    status: 'draft',
    created_by: { id: 5, full_name: 'Nguyễn Văn A' },
    created_at: '2026-06-18T09:30:00Z',
    lines: [
      { catalog_item_id: 10, item_name: 'Loa Bose L1', quantity: 4, unit_price: 500000 },
      { catalog_item_id: 15, item_name: 'Cổng hoa', quantity: 1, unit_price: 3000000 },
    ],
  },
];

export const mockUsers = [
  { id: 1, username: 'admin01', password: 'Admin@123', full_name: 'Quản trị viên', role: 'Admin' },
  { id: 5, username: 'manager01', password: 'Manager@123', full_name: 'Nguyễn Văn A', role: 'Manager' },
];

let nextCustomerId = 3;
let nextOrderId = 11;
let nextQuotationId = 31;

export function nextId(kind: 'customer' | 'order' | 'quotation') {
  if (kind === 'customer') return nextCustomerId++;
  if (kind === 'order') return nextOrderId++;
  return nextQuotationId++;
}
