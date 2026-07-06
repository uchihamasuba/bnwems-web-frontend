// Dữ liệu giả lập dùng cho src/app/api/v1/** — KHÔNG dùng cho production.
// Theo schema mới trong docs/api/ (đồng bộ lại 2026-06-23 từ repo Trintrin0408/Context,
// branch feature/fix-api_v1): id dạng string, field camelCase, enum chữ hoa.

export type UserRole = 'Admin' | 'Manager' | 'LEADER_STAFF' | 'TECHNICAL_STAFF';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

const ROLE_ID_BY_ROLE: Record<UserRole, string> = {
  Admin: '1',
  Manager: '2',
  LEADER_STAFF: '3',
  TECHNICAL_STAFF: '4',
};

export function roleIdFor(role: UserRole): string {
  return ROLE_ID_BY_ROLE[role];
}

// docs/api/02-users-roles.md (UC 2.4) — không còn entity `role`/`roles` riêng, role là enum cố định.
// roleId chỉ dùng để dựng response dạng { roleId, roleName } cho /auth/login và /auth/profile
// (docs/api/01-auth.md) — không ảnh hưởng tới shape role/status (vẫn chữ hoa) của module /users.
export interface MockUser {
  id: string;
  roleId: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

interface UserMockStore {
  users: MockUser[];
  nextUserSeq: number;
}

// Next.js dev server có thể "dispose" rồi compile lại route handler sau một khoảng thời
// gian không có request (onDemandEntries), khiến state khai báo ở module-level (mảng/biến
// thường) bị reset về giá trị ban đầu — các thay đổi tạo/sửa trước đó "biến mất". Lưu state
// trên globalThis để nó sống sót qua các lần recompile này trong dev.
declare global {
  var __bnwemsUserStore: UserMockStore | undefined;
  var __bnwemsCustomerStore: CustomerMockStore | undefined;
  var __bnwemsCatalogCategoryStore: CatalogCategoryMockStore | undefined;
  var __bnwemsCatalogStore: CatalogMockStore | undefined;
  var __bnwemsOrderStore: OrderMockStore | undefined;
  var __bnwemsQuotationStore: QuotationMockStore | undefined;
  var __bnwemsWarehouseStore: WarehouseMockStore | undefined;
  var __bnwemsInventoryStore: InventoryMockStore | undefined;
  var __bnwemsWarehouseHistoryStore: WarehouseHistoryMockStore | undefined;
  var __bnwemsChangeRequestStore: ChangeRequestMockStore | undefined;
  var __bnwemsWorkTaskStore: WorkTaskMockStore | undefined;
  var __bnwemsOrderAssignmentStore: OrderAssignmentMockStore | undefined;
}

function createInitialUserStore(): UserMockStore {
  return {
    users: [
      {
        id: 'usr-1',
        roleId: '1',
        username: 'admin01',
        password: 'Admin@123',
        fullName: 'Quản trị viên',
        role: 'Admin',
        status: 'ACTIVE',
        createdAt: '2026-01-01T08:00:00Z',
      },
      {
        id: 'usr-2',
        roleId: '2',
        username: 'manager01',
        password: 'Manager@123',
        fullName: 'Nguyễn Văn A',
        role: 'Manager',
        status: 'ACTIVE',
        createdAt: '2026-01-05T08:00:00Z',
      },
      {
        id: 'usr-3',
        roleId: '3',
        username: 'leader01',
        password: 'Leader@123',
        fullName: 'Trần Văn D',
        role: 'LEADER_STAFF',
        status: 'ACTIVE',
        createdAt: '2026-02-10T08:00:00Z',
      },
      {
        id: 'usr-4',
        roleId: '4',
        username: 'tech01',
        password: 'Tech@123',
        fullName: 'Phạm Thị E',
        role: 'TECHNICAL_STAFF',
        status: 'INACTIVE',
        createdAt: '2026-03-01T08:00:00Z',
      },
    ],
    nextUserSeq: 5,
  };
}

const userStore = globalThis.__bnwemsUserStore ?? (globalThis.__bnwemsUserStore = createInitialUserStore());

export const mockUsers = userStore.users;

// docs/api/07-customers.md (UC 2.9)
export interface MockCustomer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerMockStore {
  customers: MockCustomer[];
  nextCustomerSeq: number;
}

function createInitialCustomerStore(): CustomerMockStore {
  return {
    customers: [
      {
        id: 'cust-1',
        fullName: 'Trần Thị B',
        phone: '0908765432',
        email: 'b@example.com',
        address: '123 Lê Lợi, Q1',
        createdAt: '2026-02-01T08:00:00Z',
        updatedAt: '2026-02-01T08:00:00Z',
      },
      {
        id: 'cust-2',
        fullName: 'Lê Văn C',
        phone: '0911222333',
        email: 'c@example.com',
        address: '45 Hai Bà Trưng, Q3',
        createdAt: '2026-02-05T08:00:00Z',
        updatedAt: '2026-02-05T08:00:00Z',
      },
    ],
    nextCustomerSeq: 3,
  };
}

const customerStore =
  globalThis.__bnwemsCustomerStore ?? (globalThis.__bnwemsCustomerStore = createInitialCustomerStore());

export const mockCustomers = customerStore.customers;

// docs/api/03-catalog.md (UC 2.5) — CatalogCategory nhóm CatalogItem theo loại; categoryId
// trên item là optional (item không gắn category vẫn hợp lệ).
export interface MockCatalogCategory {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CatalogCategoryMockStore {
  categories: MockCatalogCategory[];
  nextCategorySeq: number;
}

function createInitialCatalogCategoryStore(): CatalogCategoryMockStore {
  return {
    categories: [
      {
        id: 'cat-1',
        name: 'Wedding Stage',
        description: 'Platform and backdrop setups',
        displayOrder: 1,
        notes: null,
        isActive: true,
        createdAt: '2026-01-10T08:00:00Z',
        updatedAt: '2026-01-10T08:00:00Z',
      },
      {
        id: 'cat-2',
        name: 'Sound System',
        description: 'Audio equipment and PA systems',
        displayOrder: 2,
        notes: null,
        isActive: true,
        createdAt: '2026-01-12T08:00:00Z',
        updatedAt: '2026-01-12T08:00:00Z',
      },
      {
        id: 'cat-3',
        name: 'LED Screen',
        description: 'Visual display panels',
        displayOrder: 3,
        notes: null,
        isActive: false,
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: '2026-01-15T08:00:00Z',
      },
      {
        id: 'cat-4',
        name: 'Wedding Chairs',
        description: 'High-quality ergonomic and decorative chairs for wedding receptions.',
        displayOrder: 4,
        notes: 'Requires careful handling during transport.',
        isActive: true,
        createdAt: '2026-01-20T08:00:00Z',
        updatedAt: '2026-01-20T08:00:00Z',
      },
    ],
    nextCategorySeq: 5,
  };
}

const catalogCategoryStore =
  globalThis.__bnwemsCatalogCategoryStore ?? (globalThis.__bnwemsCatalogCategoryStore = createInitialCatalogCategoryStore());

export const mockCatalogCategories = catalogCategoryStore.categories;

// docs/api/03-catalog.md (UC 2.5) — không còn unit/code/quantity/warehouse trên item;
// thay bằng itemType (enum) + basePrice trực tiếp, và categoryId (optional) tham chiếu CatalogCategory.
export type CatalogItemType = 'SERVICE' | 'EQUIPMENT' | 'MATERIAL' | 'PACKAGE';

export interface MockCatalogItem {
  id: string;
  name: string;
  description: string;
  itemType: CatalogItemType;
  basePrice: number;
  categoryId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CatalogMockStore {
  items: MockCatalogItem[];
  nextItemSeq: number;
}

function createInitialCatalogStore(): CatalogMockStore {
  return {
    items: [
      {
        id: 'item-1',
        name: 'Loa Bose L1',
        description: 'Loa array công suất lớn',
        itemType: 'EQUIPMENT',
        basePrice: 500000,
        categoryId: 'cat-2',
        isActive: true,
        createdAt: '2026-02-01T08:00:00Z',
        updatedAt: '2026-02-01T08:00:00Z',
      },
      {
        id: 'item-2',
        name: 'Cổng hoa',
        description: 'Cổng hoa trang trí lễ cưới',
        itemType: 'EQUIPMENT',
        basePrice: 3000000,
        categoryId: 'cat-1',
        isActive: true,
        createdAt: '2026-02-10T08:00:00Z',
        updatedAt: '2026-02-10T08:00:00Z',
      },
      {
        id: 'item-3',
        name: 'Bàn tròn 10 ghế',
        description: 'Bàn tròn kèm 10 ghế bọc nệm',
        itemType: 'EQUIPMENT',
        basePrice: 800000,
        categoryId: null,
        isActive: false,
        createdAt: '2026-03-01T08:00:00Z',
        updatedAt: '2026-03-01T08:00:00Z',
      },
      {
        id: 'item-4',
        name: 'Trang trí tiệc cưới trọn gói',
        description: 'Gói trang trí gồm cổng hoa, backdrop, bàn tiệc',
        itemType: 'PACKAGE',
        basePrice: 12000000,
        categoryId: null,
        isActive: true,
        createdAt: '2026-03-05T08:00:00Z',
        updatedAt: '2026-03-05T08:00:00Z',
      },
      {
        id: 'item-5',
        name: 'MC dẫn chương trình',
        description: 'Dịch vụ MC chuyên nghiệp cho tiệc cưới',
        itemType: 'SERVICE',
        basePrice: 2000000,
        categoryId: null,
        isActive: true,
        createdAt: '2026-03-08T08:00:00Z',
        updatedAt: '2026-03-08T08:00:00Z',
      },
      {
        id: 'item-6',
        name: 'Ghế Tiffany mạ vàng',
        description: 'Ghế Tiffany khung mạ vàng cho tiệc cưới',
        itemType: 'EQUIPMENT',
        basePrice: 45000,
        categoryId: 'cat-4',
        isActive: true,
        createdAt: '2026-03-12T08:00:00Z',
        updatedAt: '2026-03-12T08:00:00Z',
      },
      {
        id: 'item-7',
        name: 'Ghế Tiffany mạ bạc',
        description: 'Ghế Tiffany khung mạ bạc cho tiệc cưới',
        itemType: 'EQUIPMENT',
        basePrice: 40000,
        categoryId: 'cat-4',
        isActive: true,
        createdAt: '2026-03-13T08:00:00Z',
        updatedAt: '2026-03-13T08:00:00Z',
      },
      {
        id: 'item-8',
        name: 'Ghế Chiavari trắng',
        description: 'Ghế Chiavari gỗ sơn trắng',
        itemType: 'EQUIPMENT',
        basePrice: 35000,
        categoryId: 'cat-4',
        isActive: true,
        createdAt: '2026-03-14T08:00:00Z',
        updatedAt: '2026-03-14T08:00:00Z',
      },
    ],
    nextItemSeq: 9,
  };
}

const catalogStore = globalThis.__bnwemsCatalogStore ?? (globalThis.__bnwemsCatalogStore = createInitialCatalogStore());

export const mockCatalogItems = catalogStore.items;

// docs/api/05-warehouse-inventory.md (UC 2.13 / UC 2.23) — kho vật lý.
// Doc API hiện tại KHÔNG có endpoint liệt kê kho (GET /warehouses) — store này chỉ dùng
// nội bộ để các route mock (inventory, warehouse/checkout, warehouse/return,
// warehouse-histories) có warehouseId hợp lệ để tham chiếu.
export interface MockWarehouse {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

interface WarehouseMockStore {
  warehouses: MockWarehouse[];
  nextWarehouseSeq: number;
}

function createInitialWarehouseStore(): WarehouseMockStore {
  return {
    warehouses: [
      { id: 'wh-1', name: 'Main Warehouse A', address: '123 Industrial Park Rd', isActive: true },
      { id: 'wh-2', name: 'Main Warehouse B', address: '456 Logistics Ave', isActive: true },
      { id: 'wh-3', name: 'Secondary Storage', address: '789 Backlot St', isActive: true },
    ],
    nextWarehouseSeq: 4,
  };
}

const warehouseStore =
  globalThis.__bnwemsWarehouseStore ?? (globalThis.__bnwemsWarehouseStore = createInitialWarehouseStore());

export const mockWarehouses = warehouseStore.warehouses;

// docs/api/05-warehouse-inventory.md (UC 2.13) — tồn kho theo (warehouseId, catalogItemId).
export interface MockInventory {
  id: string;
  warehouseId: string;
  catalogItemId: string;
  availableQuantity: number;
  reservedQuantity: number;
  checkedOutQuantity: number;
  damagedQuantity: number;
  lostQuantity: number;
  updatedAt: string;
}

interface InventoryMockStore {
  rows: MockInventory[];
  nextInventorySeq: number;
}

function createInitialInventoryStore(): InventoryMockStore {
  return {
    rows: [
      {
        id: 'inv-1',
        warehouseId: 'wh-1',
        catalogItemId: 'item-6',
        availableQuantity: 150,
        reservedQuantity: 0,
        checkedOutQuantity: 50,
        damagedQuantity: 0,
        lostQuantity: 0,
        updatedAt: '2026-06-20T08:00:00Z',
      },
      {
        id: 'inv-2',
        warehouseId: 'wh-2',
        catalogItemId: 'item-7',
        availableQuantity: 120,
        reservedQuantity: 0,
        checkedOutQuantity: 30,
        damagedQuantity: 0,
        lostQuantity: 0,
        updatedAt: '2026-06-20T08:00:00Z',
      },
      {
        id: 'inv-3',
        warehouseId: 'wh-3',
        catalogItemId: 'item-8',
        availableQuantity: 50,
        reservedQuantity: 0,
        checkedOutQuantity: 30,
        damagedQuantity: 20,
        lostQuantity: 0,
        updatedAt: '2026-06-20T08:00:00Z',
      },
    ],
    nextInventorySeq: 4,
  };
}

const inventoryStore =
  globalThis.__bnwemsInventoryStore ?? (globalThis.__bnwemsInventoryStore = createInitialInventoryStore());

export const mockInventory = inventoryStore.rows;

// docs/api/05-warehouse-inventory.md (UC 2.23) — log giao dịch checkout/return/adjustment.
export type WarehouseTransactionType = 'CHECKOUT' | 'RETURN' | 'ADJUSTMENT';

export interface MockWarehouseHistory {
  id: string;
  warehouseId: string;
  transactionType: WarehouseTransactionType;
  performedBy: string;
  createdAt: string;
}

interface WarehouseHistoryMockStore {
  histories: MockWarehouseHistory[];
  nextHistorySeq: number;
}

function createInitialWarehouseHistoryStore(): WarehouseHistoryMockStore {
  return {
    histories: [
      { id: 'wh-tx-1', warehouseId: 'wh-1', transactionType: 'CHECKOUT', performedBy: 'usr-1', createdAt: '2026-06-20T08:00:00Z' },
    ],
    nextHistorySeq: 2,
  };
}

const warehouseHistoryStore =
  globalThis.__bnwemsWarehouseHistoryStore ??
  (globalThis.__bnwemsWarehouseHistoryStore = createInitialWarehouseHistoryStore());

export const mockWarehouseHistories = warehouseHistoryStore.histories;

export function nextWarehouseHistoryId(): string {
  return `wh-tx-${warehouseHistoryStore.nextHistorySeq++}`;
}

// docs/api/09-orders.md (UC 2.11) — status/field theo backend thật, xem comment ở types/order.ts
export type OrderStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface MockOrder {
  id: string;
  customerId: string;
  eventDate: string;
  eventLocation: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

interface OrderMockStore {
  orders: MockOrder[];
  nextOrderSeq: number;
}

function createInitialOrderStore(): OrderMockStore {
  return {
    orders: [
      {
        id: 'order-1',
        customerId: 'cust-1',
        eventDate: '2026-07-01T00:00:00Z',
        eventLocation: '789 Cách Mạng Tháng 8',
        status: 'confirmed',
        createdAt: '2026-06-10T08:00:00Z',
        updatedAt: '2026-06-15T09:00:00Z',
      },
      {
        id: 'order-2',
        customerId: 'cust-2',
        eventDate: '2026-07-20T00:00:00Z',
        eventLocation: '12 Nguyễn Huệ, Q1',
        status: 'in_progress',
        createdAt: '2026-06-12T08:00:00Z',
        updatedAt: '2026-06-18T09:00:00Z',
      },
      {
        id: 'order-3',
        customerId: 'cust-1',
        eventDate: '2026-05-10T00:00:00Z',
        eventLocation: '56 Trần Hưng Đạo, Q5',
        status: 'completed',
        createdAt: '2026-04-01T08:00:00Z',
        updatedAt: '2026-05-12T09:00:00Z',
      },
      {
        id: 'order-4',
        customerId: 'cust-2',
        eventDate: '2026-08-05T00:00:00Z',
        eventLocation: '200 Điện Biên Phủ, Bình Thạnh',
        status: 'cancelled',
        createdAt: '2026-06-20T08:00:00Z',
        updatedAt: '2026-06-20T08:00:00Z',
      },
      {
        id: 'order-5',
        customerId: 'cust-1',
        eventDate: '2026-09-01T00:00:00Z',
        eventLocation: '8 Lý Tự Trọng, Q1',
        status: 'draft',
        createdAt: '2026-06-22T08:00:00Z',
        updatedAt: '2026-06-22T08:00:00Z',
      },
    ],
    nextOrderSeq: 6,
  };
}

const orderStore = globalThis.__bnwemsOrderStore ?? (globalThis.__bnwemsOrderStore = createInitialOrderStore());

export const mockOrders = orderStore.orders;

// docs/api/08-quotations.md (UC 2.10)
export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED';

export interface MockQuotationItem {
  catalogItemId: string;
  quantity: number;
  price: number;
}

export interface MockQuotation {
  id: string;
  orderId: string;
  version: number;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  details: { items: MockQuotationItem[] };
  status: QuotationStatus;
  createdAt: string;
  updatedAt: string;
}

interface QuotationMockStore {
  quotations: MockQuotation[];
  nextQuotationSeq: number;
}

function createInitialQuotationStore(): QuotationMockStore {
  return {
    quotations: [
      {
        id: 'quote-1',
        orderId: 'order-1',
        version: 1,
        subtotal: 5000000,
        tax: 0,
        discount: 200000,
        totalAmount: 4800000,
        details: {
          items: [
            { catalogItemId: 'item-1', quantity: 4, price: 500000 },
            { catalogItemId: 'item-2', quantity: 1, price: 3000000 },
          ],
        },
        status: 'ACCEPTED',
        createdAt: '2026-06-18T09:30:00Z',
        updatedAt: '2026-06-18T09:30:00Z',
      },
    ],
    nextQuotationSeq: 2,
  };
}

const quotationStore =
  globalThis.__bnwemsQuotationStore ?? (globalThis.__bnwemsQuotationStore = createInitialQuotationStore());

export const mockQuotations = quotationStore.quotations;

// docs/api/09-orders.md (UC 2.27)
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected';
export type MockChangeRequestType = 'add' | 'remove' | 'replace';

export interface MockChangeRequestItem {
  catalogItemId: string;
  quantity: number;
  action: 'add' | 'remove';
}

export interface MockChangeRequest {
  id: string;
  orderId: string;
  type: MockChangeRequestType;
  items: MockChangeRequestItem[];
  status: ChangeRequestStatus;
  createdAt: string;
}

interface ChangeRequestMockStore {
  changeRequests: MockChangeRequest[];
  nextChangeRequestSeq: number;
}

function createInitialChangeRequestStore(): ChangeRequestMockStore {
  return {
    changeRequests: [
      {
        id: 'cr-1',
        orderId: 'order-1',
        type: 'add',
        items: [{ catalogItemId: 'item-1', quantity: 2, action: 'add' }],
        status: 'pending',
        createdAt: '2026-06-24T09:00:00Z',
      },
      {
        id: 'cr-2',
        orderId: 'order-1',
        type: 'remove',
        items: [{ catalogItemId: 'item-2', quantity: 1, action: 'remove' }],
        status: 'pending',
        createdAt: '2026-06-23T14:30:00Z',
      },
    ],
    nextChangeRequestSeq: 3,
  };
}

const changeRequestStore =
  globalThis.__bnwemsChangeRequestStore ?? (globalThis.__bnwemsChangeRequestStore = createInitialChangeRequestStore());

export const mockChangeRequests = changeRequestStore.changeRequests;

// docs/api/10-survey-assignment.md (UC 2.14, 2.15)
export type WorkTaskStatus = 'pending' | 'in_progress' | 'completed';

export interface MockWorkTask {
  id: string;
  orderId: string;
  taskType: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: WorkTaskStatus;
}

interface WorkTaskMockStore {
  tasks: MockWorkTask[];
  nextWorkTaskSeq: number;
}

// Giờ trong ngày hôm nay (theo giờ máy chủ) — để demo "Lịch trình hôm nay" luôn có dữ liệu
// dù chạy vào ngày nào, không hardcode ngày cụ thể như các seed khác (order/quotation).
function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function createInitialWorkTaskStore(): WorkTaskMockStore {
  return {
    tasks: [
      {
        id: 'task-1',
        orderId: 'order-1',
        taskType: 'preparation',
        scheduledStart: todayAt(8, 0),
        scheduledEnd: todayAt(9, 30),
        status: 'completed',
      },
      {
        id: 'task-2',
        orderId: 'order-1',
        taskType: 'installation',
        scheduledStart: todayAt(9, 30),
        scheduledEnd: todayAt(12, 0),
        status: 'in_progress',
      },
      {
        id: 'task-3',
        orderId: 'order-1',
        taskType: 'collection',
        scheduledStart: todayAt(16, 0),
        scheduledEnd: todayAt(18, 0),
        status: 'pending',
      },
      // order-2 (order demo của settlement-preview) — đủ task để tab "Khảo sát & Nhân sự" khớp mockup.
      {
        id: 'task-s2',
        orderId: 'order-2',
        taskType: 'survey',
        scheduledStart: '2026-07-05T07:00:00Z',
        scheduledEnd: '2026-07-05T10:00:00Z',
        status: 'completed',
      },
      {
        id: 'task-t2',
        orderId: 'order-2',
        taskType: 'transport',
        scheduledStart: '2026-07-20T00:00:00Z',
        scheduledEnd: '2026-07-20T01:30:00Z',
        status: 'completed',
      },
      {
        id: 'task-i2',
        orderId: 'order-2',
        taskType: 'installation',
        scheduledStart: '2026-07-20T01:30:00Z',
        scheduledEnd: '2026-07-20T05:00:00Z',
        status: 'in_progress',
      },
      {
        id: 'task-c2',
        orderId: 'order-2',
        taskType: 'collection',
        scheduledStart: '2026-07-20T15:00:00Z',
        scheduledEnd: '2026-07-20T17:00:00Z',
        status: 'pending',
      },
    ],
    nextWorkTaskSeq: 4,
  };
}

const workTaskStore = globalThis.__bnwemsWorkTaskStore ?? (globalThis.__bnwemsWorkTaskStore = createInitialWorkTaskStore());

export const mockWorkTasks = workTaskStore.tasks;

// docs/api/10-survey-assignment.md (UC 2.12) — GET /tasks/:id/survey-report.
// surveyedBy KHÔNG có trong response thật (xem docs/more-require.md mục o) — chỉ để hiển thị tên KSV.
export interface MockSurveyReport {
  workTaskId: string;
  notes: string;
  evidences: { fileUrl: string }[];
  submittedAt: string;
  surveyedBy?: string;
}

export const mockSurveyReports: MockSurveyReport[] = [
  {
    workTaskId: 'task-s2', // survey task của order-2
    notes: 'Cổng vào hẹp, cần xe tải nhỏ trung chuyển. Điểm treo Rigging ổn định, tải trọng tối đa 500kg/điểm.',
    evidences: [
      { fileUrl: 'https://picsum.photos/seed/survey-a/240/180' },
      { fileUrl: 'https://picsum.photos/seed/survey-b/240/180' },
      { fileUrl: 'https://picsum.photos/seed/survey-c/240/180' },
      { fileUrl: 'https://picsum.photos/seed/survey-d/240/180' },
    ],
    submittedAt: '2026-07-05T07:30:00Z',
    surveyedBy: 'Nguyễn Văn An',
  },
];

// ===== MOCK-ONLY: Phân công nhân sự (survey + execution) =====
// Backend thật chỉ có POST /tasks/:id/assignments — KHÔNG có GET đọc lại phân công, không lưu
// field-status theo từng staff (xem docs/more-require.md mục n, p). Store dùng globalThis để giữ
// state qua các lần recompile dev (giống các store khác) và để mock POST ghi vào được.
export type MockFieldStatus = 'pending' | 'ready' | 'in_setup' | 'completed';

export interface MockAssignmentMember {
  userId: string;
  fullName: string;
  assignedRole: string;
  fieldStatus?: MockFieldStatus;
}

export interface MockAssignmentGroup {
  taskId: string;
  scheduledStart: string;
  scheduledEnd: string;
  shiftLabel?: string;
  members: MockAssignmentMember[];
}

export interface MockOrderAssignment {
  orderId: string;
  survey: MockAssignmentGroup | null;
  execution: MockAssignmentGroup | null;
}

interface OrderAssignmentMockStore {
  byOrder: MockOrderAssignment[];
}

function createInitialOrderAssignmentStore(): OrderAssignmentMockStore {
  return {
    byOrder: [
      {
        orderId: 'order-2',
        survey: {
          taskId: 'task-s2',
          scheduledStart: '2026-07-05T07:00:00Z',
          scheduledEnd: '2026-07-05T10:00:00Z',
          members: [
            { userId: 'usr-3', fullName: 'Nguyễn Văn An', assignedRole: 'Khảo sát viên', fieldStatus: 'completed' },
          ],
        },
        execution: {
          taskId: 'task-i2',
          scheduledStart: '2026-07-20T01:30:00Z',
          scheduledEnd: '2026-07-20T05:00:00Z',
          shiftLabel: 'Ca sáng (06:00 - 12:00)',
          members: [
            { userId: 'usr-3', fullName: 'Trần Minh Quân', assignedRole: 'Trưởng nhóm', fieldStatus: 'ready' },
            { userId: 'usr-4', fullName: 'Lê Hoàng Nam', assignedRole: 'Kỹ thuật âm thanh', fieldStatus: 'in_setup' },
            { userId: 'usr-4', fullName: 'Vũ Đình Tú', assignedRole: 'Kỹ thuật ánh sáng', fieldStatus: 'in_setup' },
          ],
        },
      },
    ],
  };
}

const orderAssignmentStore =
  globalThis.__bnwemsOrderAssignmentStore ??
  (globalThis.__bnwemsOrderAssignmentStore = createInitialOrderAssignmentStore());

export const mockOrderAssignments = orderAssignmentStore.byOrder;

// Ghi phân công từ mock POST /tasks/:id/assignments: tìm group theo taskId.
// Group khảo sát (1 KSV) → thay thế ("Đổi người"); group thi công → nối thêm ("+ Phân công").
export function applyAssignmentMembers(taskId: string, members: MockAssignmentMember[]): boolean {
  for (const entry of orderAssignmentStore.byOrder) {
    if (entry.survey?.taskId === taskId) {
      entry.survey.members = members;
      return true;
    }
    if (entry.execution?.taskId === taskId) {
      entry.execution.members = [...entry.execution.members, ...members];
      return true;
    }
  }
  return false;
}

// ===== MOCK-ONLY: Settlement preview & breakdown hỏng/mất =====
// Lý do tồn tại: backend thật KHÔNG có GET cho Settlement (theo id hoặc orderId) và KHÔNG có GET
// cho danh sách Damage-Loss theo orderId (đọc trực tiếp
// D:\bnwems-backend-api\src\routes\{settlement,damageloss}.route.ts — chỉ có POST/PUT, không
// GET). Backend cũng không lưu lại field "responsible" (khách đền bù hay trừ lương nhân viên)
// khi ghi nhận damage-loss. Dữ liệu dưới đây chỉ phục vụ hiển thị tab "Thanh toán & Quyết toán"
// cho tới khi backend bổ sung — xem docs/more-require.md mục (a)(b)(c). KHÔNG dùng cho mục đích
// khác, không mutate qua route handler nào nên không cần globalThis store như các mock khác.
export interface MockSettlementSurcharge {
  reason: string;
  amount: number;
}

export interface MockSettlementDamageLine {
  damageLossItemId: string;
  icon: string;
  itemName: string;
  amount: number;
  responsible: 'customer' | 'staff_wage_deduction';
  responsibleStaffName?: string;
}

export interface MockSettlementPreview {
  orderId: string;
  originalValue: number;
  additionalFees: number;
  discount: number;
  totalPaid: number;
  surchargeLines: MockSettlementSurcharge[];
  damageLines: MockSettlementDamageLine[];
}

export const mockSettlementPreviews: MockSettlementPreview[] = [
  {
    orderId: 'order-2', // order đang in_progress — khớp trạng thái "Đang xử lý" của mockup gốc
    originalValue: 50_000_000,
    additionalFees: 2_500_000,
    discount: 500_000,
    totalPaid: 25_000_000,
    surchargeLines: [
      { reason: 'Gia hạn thời gian (2h)', amount: 1_500_000 },
      { reason: 'Thêm 5 set teabreak', amount: 1_000_000 },
    ],
    damageLines: [
      {
        damageLossItemId: 'dmg-1',
        icon: 'WineOff',
        itemName: 'Vỡ 3 ly thủy tinh',
        amount: 450_000,
        responsible: 'customer',
      },
      {
        damageLossItemId: 'dmg-2',
        icon: 'Mic',
        itemName: 'Mất 1 micro không dây',
        amount: 800_000,
        responsible: 'staff_wage_deduction',
        responsibleStaffName: 'Vũ Đình Tú',
      },
    ],
  },
];

// ===== Supplier & SupplierTransaction (UC 2.16 — docs/api/04-suppliers.md) =====
export type SupplierStatus = 'active' | 'inactive';
export type SupplierTransactionStatus = 'draft' | 'approved' | 'waiting_for_approval' | 'received' | 'returned' | 'cancelled';
export type SupplierTransactionType = 'rental' | 'purchase';

export interface MockSupplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  serviceCategory: string; // MOCK — không có trong docs/api/04-suppliers.md
  rating: number;          // MOCK — không có trong docs/api/04-suppliers.md
  status: SupplierStatus;
  createdAt: string;
}

export interface MockSupplierTransaction {
  id: string;
  supplierId: string;
  orderId: string;
  transactionType: SupplierTransactionType;
  totalCost: number;
  depositAmount: number;
  itemDescription: string;
  status: SupplierTransactionStatus;
  createdAt: string;
}

interface SupplierMockStore {
  suppliers: MockSupplier[];
  nextSupplierSeq: number;
}

interface SupplierTransactionMockStore {
  transactions: MockSupplierTransaction[];
  nextTransactionSeq: number;
}

declare global {
  var __bnwemsSupplierStore: SupplierMockStore | undefined;
  var __bnwemsSupplierTransactionStore: SupplierTransactionMockStore | undefined;
}

function createInitialSupplierStore(): SupplierMockStore {
  return {
    suppliers: [
      {
        id: 'sup-1',
        name: 'Công ty Hoa tươi Đà Lạt Hasfarm',
        contactPerson: 'Nguyễn Thị Lan',
        phone: '02633831234',
        email: 'hasfarm@gmail.com',
        address: '450 Nguyễn Từ Lực, Đà Lạt, Lâm Đồng',
        serviceCategory: 'Hoa tươi & trang trí',
        rating: 4,
        status: 'active',
        createdAt: '2026-01-10T08:00:00Z',
      },
      {
        id: 'sup-2',
        name: 'Âm thanh Ánh sáng Việt Media',
        contactPerson: 'Trần Văn Minh',
        phone: '0977888999',
        email: 'vietmedia@gmail.com',
        address: '109 Phố Vọng, Hai Bà Trưng, Hà Nội',
        serviceCategory: 'Âm thanh & ánh sáng',
        rating: 4,
        status: 'active',
        createdAt: '2026-01-15T08:00:00Z',
      },
      {
        id: 'sup-3',
        name: 'Kho thiết bị sự kiện Đại Phát',
        contactPerson: 'Lê Đức Thọ',
        phone: '0909999888',
        email: 'daiphat@gmail.com',
        address: 'Đường Kha Vạn Cân, Thủ Đức, TP.HCM',
        serviceCategory: 'Thiết bị sự kiện',
        rating: 3,
        status: 'active',
        createdAt: '2026-02-01T08:00:00Z',
      },
      {
        id: 'sup-4',
        name: 'Hỷ Lâm Môn Wedding Decor',
        contactPerson: 'Phạm Thị Hương',
        phone: '0933112233',
        email: 'hylamon@gmail.com',
        address: '32 Pasteur, Quận 1, TP.HCM',
        serviceCategory: 'Trang trí tiệc cưới',
        rating: 5,
        status: 'inactive',
        createdAt: '2026-02-20T08:00:00Z',
      },
    ],
    nextSupplierSeq: 5,
  };
}

function createInitialSupplierTransactionStore(): SupplierTransactionMockStore {
  return {
    transactions: [
      {
        id: 'proc-1',
        supplierId: 'sup-1',
        orderId: 'order-2',
        transactionType: 'purchase',
        totalCost: 15_000_000,
        depositAmount: 4_500_000,
        itemDescription: 'Hoa hồng Ecuador Pink Floyd (cành)',
        status: 'approved',
        createdAt: '2026-06-10T08:00:00Z',
      },
      {
        id: 'proc-2',
        supplierId: 'sup-2',
        orderId: 'order-2',
        transactionType: 'rental',
        totalCost: 8_000_000,
        depositAmount: 2_400_000,
        itemDescription: 'Màn hình LED P3 Cabin Outdoor bổ sung (m2)',
        status: 'waiting_for_approval',
        createdAt: '2026-06-12T08:00:00Z',
      },
    ],
    nextTransactionSeq: 3,
  };
}

const supplierStore =
  globalThis.__bnwemsSupplierStore ?? (globalThis.__bnwemsSupplierStore = createInitialSupplierStore());

const supplierTransactionStore =
  globalThis.__bnwemsSupplierTransactionStore ??
  (globalThis.__bnwemsSupplierTransactionStore = createInitialSupplierTransactionStore());

export const mockSuppliers = supplierStore.suppliers;
export const mockSupplierTransactions = supplierTransactionStore.transactions;

export function nextSupplierId(): string {
  return `sup-${supplierStore.nextSupplierSeq++}`;
}
export function nextTransactionId(): string {
  return `proc-${supplierTransactionStore.nextTransactionSeq++}`;
}

export function nextId(
  kind: 'customer' | 'order' | 'quotation' | 'user' | 'catalogItem' | 'catalogCategory' | 'inventory'
): string {
  if (kind === 'customer') return `cust-${customerStore.nextCustomerSeq++}`;
  if (kind === 'order') return `order-${orderStore.nextOrderSeq++}`;
  if (kind === 'user') return `usr-${userStore.nextUserSeq++}`;
  if (kind === 'catalogItem') return `item-${catalogStore.nextItemSeq++}`;
  if (kind === 'catalogCategory') return `cat-${catalogCategoryStore.nextCategorySeq++}`;
  if (kind === 'inventory') return `inv-${inventoryStore.nextInventorySeq++}`;
  return `quote-${quotationStore.nextQuotationSeq++}`;
}
