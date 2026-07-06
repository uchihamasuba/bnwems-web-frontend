export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: 'Active' | 'Inactive';
  ordersCount: number;
  lastOrderDate: string;
  notes: string;
}

export interface QuotationItem {
  id: string;
  name: string;
  category: string; // e.g. Decor, Audio, Tableware
  unit: string;
  quantity: number;
  price: number;
  discount: number;
}

export interface Quotation {
  id: string;
  orderId?: string;
  customerName: string;
  customerId: string;
  version: string;
  totalAmount: number;
  subtotal: number;
  discountTotal: number;
  createdAt: string;
  createdBy: string;
  status: 'Draft' | 'Approved' | 'Rejected';
  notes: string;
  items: QuotationItem[];
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: string; // e.g., Wedding, Engagement, Gala
  eventName: string;
  eventDate: string;
  endDate?: string;
  location: string;
  guestCount: number;
  totalAmount: number;
  paymentStatus: 'Unpaid' | 'Deposit Paid' | 'Fully Paid' | 'Pending';
  orderStatus: 'New' | 'Quoted' | 'Waiting for Deposit' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  notes: string;
}

export interface SchedulePlan {
  id: string;
  orderId: string;
  customerName: string;
  type: 'Survey' | 'Preparation' | 'Transport' | 'Construction' | 'Retrieval' | 'Return';
  startTime: string;
  endTime: string;
  location: string;
  responsibleStaff: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  notes: string;
}

export interface WorkTask {
  id: string;
  title: string;
  orderId: string;
  type: 'Survey' | 'Preparation' | 'Transport' | 'Construction' | 'Retrieval' | 'Return';
  assignedLeader: string;
  assignedTechnical: string;
  dueTime: string;
  location: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Assigned' | 'In Progress' | 'Completed';
  notes: string;
}

export interface SurveyReport {
  id: string;
  orderId: string;
  customerName: string;
  location: string;
  surveyDate: string;
  staffName: string;
  status: 'Submitted' | 'Draft' | 'Needs Review';
  // Measurements
  length: number;
  width: number;
  area: number;
  entrance: string;
  notes: string;
  siteConstraints: string;
  additionalRequests: string;
  images: string[];
  proposedItems: { name: string; quantity: number; notes: string }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  totalQty: number;
  availableQty: number;
  reservedQty: number;
  missingQty: number;
  rentalPrice: number;
  notes: string;
}

export interface PickList {
  id: string;
  orderId: string;
  customerName: string;
  taskTitle: string;
  itemCount: number;
  prepareDate: string;
  staffInCharge: string;
  status: 'Pending' | 'Picked' | 'Short' | 'Completed';
  items: {
    itemId: string;
    itemName: string;
    unit: string;
    requestedQty: number;
    availableQty: number;
    preparedQty: number;
    notes: string;
  }[];
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'Active' | 'Inactive';
  notes: string;
  serviceType?: string;
  rating?: number;
}

export interface ProcurementRequest {
  id: string;
  orderId: string;
  supplierId: string;
  supplierName: string;
  serviceTitle: string;
  estimatedCost: number;
  depositAmount: number;
  status: 'Waiting for Approval' | 'Approved' | 'Rejected' | 'Paid';
  notes: string;
}

export interface PaymentHistory {
  id: string;
  orderId: string;
  amount: number;
  paymentType: string;
  paymentDate: string;
  paymentMethod: string;
  approvedBy: string;
  status: 'Success' | 'Failed';
}

export interface ProcurementOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  orderId: string;
  type: 'Rental' | 'Purchase';
  itemCount: number;
  totalCost: number;
  deliveryDate: string;
  status: 'Draft' | 'Confirmed' | 'Received' | 'Completed' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  items: {
    name: string;
    quantity: number;
    price: number;
    notes: string;
  }[];
  notes: string;
}

export interface SupplierDebt {
  id: string;
  supplierName: string;
  supplierId: string;
  procurementId: string;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Overdue' | 'Unpaid';
}

export interface SupplierPaymentRecord {
  id: string;
  supplierName: string;
  procurementId: string;
  amount: number;
  method: 'Cash' | 'Bank Transfer';
  transactionCode: string;
  date: string;
  notes: string;
}

export interface WageRecord {
  id: string;
  staffName: string;
  role: string;
  status: 'Draft' | 'Pending Approval' | 'Confirmed' | 'Paid' | 'Pending' | 'Rejected';
  shifts: any;

  orderId?: string;
  wageRate?: number;
  totalWage?: number;
  notes?: string;

  shiftsCount?: number;
  tasksCompleted?: number;
  baseSalary?: number;
  deduction?: number;
  estimatedWage?: number;
}

export interface DepositRequest {
  id: string;
  orderId: string;
  customerName: string;
  totalAmount?: number;
  depositRate?: number; // e.g. 30 for 30%
  depositAmount?: number;
  dueDate: string;
  status: 'Pending QR' | 'Pending Payment' | 'Confirmed' | 'Overdue' | 'Waiting for Deposit';
  notes?: string;
  amount?: number;
}

// Initial seed data
export const initialCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Nguyễn Văn Hải',
    phone: '0901234567',
    email: 'vanhai.nguyen@gmail.com',
    address: '12 Cầu Giấy, Hà Nội',
    status: 'Active',
    ordersCount: 2,
    lastOrderDate: '2026-06-15',
    notes: 'Khách hàng VIP, chuộng phong cách hiện đại tinh tế, yêu cầu hỗ trợ nhanh.',
  },
  {
    id: 'CUST-002',
    name: 'Trần Thị Thảo',
    phone: '0918765432',
    email: 'thaotran94@gmail.com',
    address: '456 Lê Lợi, Quận 1, TP. HCM',
    status: 'Active',
    ordersCount: 1,
    lastOrderDate: '2026-06-20',
    notes: 'Yêu cầu decor hoa tươi cao cấp tone hồng pastel.',
  },
  {
    id: 'CUST-003',
    name: 'Phạm Minh Đức',
    phone: '0934567890',
    email: 'ducpm.wedding@gmail.com',
    address: '78 Phố Huế, Hai Bà Trưng, Hà Nội',
    status: 'Active',
    ordersCount: 1,
    lastOrderDate: '2026-05-10',
    notes: 'Sự kiện kỷ niệm ngày cưới ngoài trời, cần phương án dự phòng trời mưa.',
  },
  {
    id: 'CUST-004',
    name: 'Lê Minh Hương',
    phone: '0987654321',
    email: 'huonglm.event@hotmail.com',
    address: '124 Nguyễn Huệ, TP. Huế',
    status: 'Inactive',
    ordersCount: 0,
    lastOrderDate: 'N/A',
    notes: 'Hỏi thông tin báo giá tiệc đính hôn nhưng chưa chốt.',
  },
];

export const initialQuotations: Quotation[] = [
  {
    id: 'QUO-001',
    orderId: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'Nguyễn Văn Hải',
    version: 'v1.2',
    subtotal: 45000000,
    discountTotal: 2000000,
    totalAmount: 43000000,
    createdAt: '2026-06-12',
    createdBy: 'Manager Binh',
    status: 'Approved',
    notes: 'Báo giá decor tiệc cưới trọn gói tại khách sạn Melia.',
    items: [
      { id: 'QI-1', name: 'Backdrop hoa lụa cao cấp 4x3m', category: 'Decor', unit: 'Gói', quantity: 1, price: 15000000, discount: 500000 },
      { id: 'QI-2', name: 'Hệ thống ánh sáng moving head sân khấu', category: 'Audio/Video', unit: 'Set', quantity: 1, price: 12000000, discount: 500000 },
      { id: 'QI-3', name: 'Bàn Gallery đón khách chủ đề Rustic', category: 'Decor', unit: 'Gói', quantity: 1, price: 8000000, discount: 1000000 },
      { id: 'QI-4', name: 'Âm thanh Line Array d&b audiotechnik', category: 'Audio/Video', unit: 'Buổi', quantity: 1, price: 10000000, discount: 0 }
    ]
  },
  {
    id: 'QUO-002',
    orderId: 'ORD-002',
    customerId: 'CUST-002',
    customerName: 'Trần Thị Thảo',
    version: 'v2.1',
    subtotal: 82000000,
    discountTotal: 4000000,
    totalAmount: 78000000,
    createdAt: '2026-06-18',
    createdBy: 'Manager Binh',
    status: 'Draft',
    notes: 'Phương án hoa tươi nhập khẩu 100% kèm cổng vòm pha lê.',
    items: [
      { id: 'QI-5', name: 'Cổng vòm pha lê & hoa tươi nhập khẩu', category: 'Decor', unit: 'Bộ', quantity: 1, price: 35000000, discount: 2000000 },
      { id: 'QI-6', name: 'Đường dẫn lối đi sân khấu rải cánh hoa hồng', category: 'Decor', unit: 'Gói', quantity: 1, price: 12000000, discount: 0 },
      { id: 'QI-7', name: 'Trang trí bàn tiệc VIP (10 bàn)', category: 'Decor', unit: 'Bàn', quantity: 10, price: 2000000, discount: 100000 },
      { id: 'QI-8', name: 'Màn hình LED P3 Outdoor cabin nhôm', category: 'Audio/Video', unit: 'm2', quantity: 15, price: 1000000, discount: 1000000 }
    ]
  },
  {
    id: 'QUO-003',
    orderId: 'ORD-003',
    customerId: 'CUST-003',
    customerName: 'Phạm Minh Đức',
    version: 'v1.0',
    subtotal: 25000000,
    discountTotal: 0,
    totalAmount: 25000000,
    createdAt: '2026-06-22',
    createdBy: 'Manager Binh',
    status: 'Rejected',
    notes: 'Báo giá tiệc kỷ niệm đính hôn ngoài trời tại nhà hàng ven sông.',
    items: [
      { id: 'QI-9', name: 'Nhà bạt trong suốt khung truss 10x15m', category: 'Logistics', unit: 'Set', quantity: 1, price: 18000000, discount: 0 },
      { id: 'QI-10', name: 'Hệ thống đèn fairy light lung linh', category: 'Decor', unit: 'Gói', quantity: 1, price: 7000000, discount: 0 }
    ]
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ORD-1024',
    customerId: 'CUST-001',
    customerName: 'Nguyễn Thị Mai',
    customerPhone: '0901234567',
    customerEmail: 'vutuyettrinh2004@gmail.com',
    eventType: 'Tiệc Cưới',
    eventName: 'Tiệc cưới - Nguyễn Thị Mai',
    eventDate: '2024-06-12',
    endDate: '2024-06-12',
    location: 'Nhà văn hóa Đông Anh',
    guestCount: 300,
    totalAmount: 35000000,
    paymentStatus: 'Deposit Paid',
    orderStatus: 'In Progress',
    notes: 'Ca: Setup đêm. Trần Minh Quân (Trưởng nhóm thi công)'
  },
  {
    id: 'ORD-1025',
    customerId: 'CUST-002',
    customerName: 'Trần Văn Hùng',
    customerPhone: '0918765432',
    customerEmail: 'thaotran94@gmail.com',
    eventType: 'Lễ ăn hỏi',
    eventName: 'Lễ ăn hỏi - Trần Văn Hùng',
    eventDate: '2024-06-12',
    endDate: '2024-06-12',
    location: 'Tư gia khách hàng',
    guestCount: 150,
    totalAmount: 22000000,
    paymentStatus: 'Fully Paid',
    orderStatus: 'Confirmed',
    notes: 'Ca: Chiếu. Lê Hoàng Nam (Kỹ thuật âm thanh)'
  },
  {
    id: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'Nguyễn Văn Hải',
    customerPhone: '0901234567',
    customerEmail: 'vanhai.nguyen@gmail.com',
    eventType: 'Tiệc Cưới Trọn Gói',
    eventName: 'Lễ Thành Hôn Hải & Linh',
    eventDate: '2026-07-15',
    endDate: '2026-07-15',
    location: 'Melia Hanoi Hotel, Grand Ballroom',
    guestCount: 350,
    totalAmount: 43000000,
    paymentStatus: 'Deposit Paid',
    orderStatus: 'Confirmed',
    notes: 'Yêu cầu setup hoàn thành trước 11:00 AM ngày 15/07. Check kỹ cổng hoa lụa.'
  },
  {
    id: 'ORD-002',
    customerId: 'CUST-002',
    customerName: 'Trần Thị Thảo',
    customerPhone: '0918765432',
    customerEmail: 'thaotran94@gmail.com',
    eventType: 'Tiệc Cưới Cao Cấp',
    eventName: 'Hôn Lễ Thảo & Phong',
    eventDate: '2026-07-28',
    endDate: '2026-07-28',
    location: 'GEM Center, Quận 1, TP. HCM',
    guestCount: 500,
    totalAmount: 78000000,
    paymentStatus: 'Unpaid',
    orderStatus: 'New',
    notes: 'Hoa tươi cao cấp nhập khẩu hồng pastel. Cần khảo sát kỹ sảnh trước ngày 15/07.'
  },
  {
    id: 'ORD-003',
    customerId: 'CUST-003',
    customerName: 'Phạm Minh Đức',
    customerPhone: '0934567890',
    customerEmail: 'ducpm.wedding@gmail.com',
    eventType: 'Kỷ Niệm Ngày Cưới',
    eventName: 'Kỷ Niệm 10 Năm Ngày Cưới Đức & An',
    eventDate: '2026-08-02',
    endDate: '2026-08-02',
    location: 'Nhà Hàng Ven Sông Thảo Điền',
    guestCount: 120,
    totalAmount: 25000000,
    paymentStatus: 'Unpaid',
    orderStatus: 'Waiting for Deposit',
    notes: 'Tổ chức ngoài trời. Cần trang bị hệ thống dù che mưa dự phòng.'
  }
];

export const initialSchedulePlans: SchedulePlan[] = [
  {
    id: 'PLAN-1024',
    orderId: 'ORD-1024',
    customerName: 'Nguyễn Thị Mai',
    type: 'Construction',
    startTime: '2024-06-12T00:00',
    endTime: '2024-06-12T06:00',
    location: 'Nhà văn hóa Đông Anh',
    responsibleStaff: 'Trần Minh Quân (Trưởng nhóm thi công)',
    status: 'In Progress',
    notes: 'Ca: Setup đêm'
  },
  {
    id: 'PLAN-1025',
    orderId: 'ORD-1025',
    customerName: 'Trần Văn Hùng',
    type: 'Construction',
    startTime: '2024-06-12T13:00',
    endTime: '2024-06-12T17:00',
    location: 'Tư gia khách hàng',
    responsibleStaff: 'Lê Hoàng Nam (Kỹ thuật âm thanh)',
    status: 'Completed',
    notes: 'Ca: Chiều'
  },
  {
    id: 'PLAN-001',
    orderId: 'ORD-001',
    customerName: 'Nguyễn Văn Hải',
    type: 'Survey',
    startTime: '2026-07-02T09:00',
    endTime: '2026-07-02T11:30',
    location: 'Melia Hanoi Hotel, Grand Ballroom',
    responsibleStaff: 'Trần Anh Tuấn (Leader)',
    status: 'Completed',
    notes: 'Đã hoàn thành khảo sát kích thước sân khấu và đường đi của dây cáp âm thanh.'
  },
  {
    id: 'PLAN-002',
    orderId: 'ORD-001',
    customerName: 'Nguyễn Văn Hải',
    type: 'Construction',
    startTime: '2026-07-14T18:00',
    endTime: '2026-07-15T06:00',
    location: 'Melia Hanoi Hotel, Grand Ballroom',
    responsibleStaff: 'Nguyễn Tiến Hoàng (Leader)',
    status: 'Pending',
    notes: 'Setup qua đêm. Cần phối hợp với ban quản lý khách sạn để bàn giao sảnh.'
  },
  {
    id: 'PLAN-003',
    orderId: 'ORD-002',
    customerName: 'Trần Thị Thảo',
    type: 'Survey',
    startTime: '2026-07-10T14:00',
    endTime: '2026-07-10T16:00',
    location: 'GEM Center, Sảnh Pollux',
    responsibleStaff: 'Trần Anh Tuấn (Leader)',
    status: 'In Progress',
    notes: 'Khảo sát lối vào sảnh và vị trí đặt cổng hoa tươi pha lê cỡ lớn.'
  }
];

export const initialTasks: WorkTask[] = [
  {
    id: 'TASK-1024',
    title: 'Vận chuyển thiết bị',
    orderId: 'ORD-1024',
    type: 'Transport',
    assignedLeader: 'Trần Minh Quân (Trưởng nhóm thi công)',
    assignedTechnical: 'Phạm Hồng Thái (Technical)',
    dueTime: '2024-06-12T10:00',
    location: 'Nhà văn hóa Đông Anh',
    priority: 'High',
    status: 'Draft',
    notes: 'Vận chuyển thiết bị từ kho'
  },
  {
    id: 'TASK-1025',
    title: 'Lắp đặt sân khấu',
    orderId: 'ORD-1024',
    type: 'Construction',
    assignedLeader: 'Trần Minh Quân (Trưởng nhóm thi công)',
    assignedTechnical: 'Đỗ Văn Nam (Technical)',
    dueTime: '2024-06-12T12:00',
    location: 'Nhà văn hóa Đông Anh',
    priority: 'High',
    status: 'In Progress',
    notes: 'Lắp đặt sân khấu tiệc cưới'
  },
  {
    id: 'TASK-1026',
    title: 'Kiểm tra âm thanh',
    orderId: 'ORD-1025',
    type: 'Preparation',
    assignedLeader: 'Lê Hoàng Nam (Kỹ thuật âm thanh)',
    assignedTechnical: 'Phạm Hồng Thái (Technical)',
    dueTime: '2024-06-12T14:00',
    location: 'Tư gia khách hàng',
    priority: 'Medium',
    status: 'Draft',
    notes: 'Kiểm tra âm thanh lễ ăn hỏi'
  },
  {
    id: 'TASK-001',
    title: 'Khảo sát kỹ thuật kích thước sảnh & nguồn điện Melia',
    orderId: 'ORD-001',
    type: 'Survey',
    assignedLeader: 'Trần Anh Tuấn (Leader)',
    assignedTechnical: 'Phạm Hồng Thái (Technical)',
    dueTime: '2026-07-02T11:30',
    location: 'Melia Hanoi Hotel, Grand Ballroom',
    priority: 'High',
    status: 'Completed',
    notes: 'Cần đo chính xác nguồn điện 3 pha cho hệ thống ánh sáng công suất lớn.'
  },
  {
    id: 'TASK-002',
    title: 'Bảo dưỡng & vệ sinh 12 đèn Moving Head',
    orderId: 'ORD-001',
    type: 'Preparation',
    assignedLeader: 'Phạm Hồng Thái (Technical)',
    assignedTechnical: 'Đỗ Văn Nam (Technical)',
    dueTime: '2026-07-12T17:00',
    location: 'Kho tổng Binh Nguyen WEMS',
    priority: 'Medium',
    status: 'Assigned',
    notes: 'Đảm bảo hoạt động trơn tru không phát ra tiếng ồn.'
  },
  {
    id: 'TASK-003',
    title: 'Thi công cắm cổng vòm pha lê & hoa tươi',
    orderId: 'ORD-002',
    type: 'Construction',
    assignedLeader: 'Lê Thu Trang (Decorator Leader)',
    assignedTechnical: 'Hoàng Văn Huy (Decorator)',
    dueTime: '2026-07-28T08:00',
    location: 'GEM Center, Sảnh Pollux',
    priority: 'High',
    status: 'Draft',
    notes: 'Cổng hoa tươi nhập khẩu đắt tiền, thi công sát giờ để hoa tươi nhất.'
  },
  {
    id: 'TASK-004',
    title: 'Thu hồi thiết bị và dọn dẹp sảnh Melia',
    orderId: 'ORD-001',
    type: 'Retrieval',
    assignedLeader: 'Nguyễn Tiến Hoàng (Leader)',
    assignedTechnical: 'Vũ Quốc Bảo (Logistics)',
    dueTime: '2026-07-15T23:30',
    location: 'Melia Hanoi Hotel, Grand Ballroom',
    priority: 'Medium',
    status: 'Draft',
    notes: 'Thực hiện thu hồi nhanh gọn, tránh phạt phí quá giờ từ khách sạn.'
  }
];

export const initialSurveyReports: SurveyReport[] = [
  {
    id: 'SRV-001',
    orderId: 'ORD-001',
    customerName: 'Nguyễn Văn Hải',
    location: 'Melia Hanoi Hotel, Grand Ballroom',
    surveyDate: '2026-07-02',
    staffName: 'Trần Anh Tuấn (Leader)',
    status: 'Submitted',
    length: 25.4,
    width: 15.2,
    area: 386,
    entrance: 'Lối đi thang máy vận chuyển hàng rộng 2.2m, cao 2.4m. Rất thuận tiện.',
    notes: 'Sân khấu có sẵn của Melia cao 0.8m, kích thước 8x4m. Nguồn điện 3 pha 50A nằm ngay góc trái phía sau sân khấu.',
    siteConstraints: 'Không được khoan đục vào tường/trần của khách sạn. Setup khung Truss tự đứng.',
    additionalRequests: 'Khách muốn bổ sung thêm 2 đèn rọi follow sân khấu.',
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=400'
    ],
    proposedItems: [
      { name: 'Khung Truss nhôm tự đứng 8x4m', quantity: 1, notes: 'Gia cố chân sắt chịu lực nặng' },
      { name: 'Đèn Follow Spot 2500W', quantity: 2, notes: 'Đặt ở ban công kỹ thuật cuối phòng' }
    ]
  },
  {
    id: 'SRV-002',
    orderId: 'ORD-002',
    customerName: 'Trần Thị Thảo',
    location: 'GEM Center, Sảnh Pollux',
    surveyDate: '2026-07-10',
    staffName: 'Trần Anh Tuấn (Leader)',
    status: 'Needs Review',
    length: 30,
    width: 20,
    area: 600,
    entrance: 'Thang nâng cơ giới đưa trực tiếp lên tầng 5. Trọng tải tối đa 2.5 tấn.',
    notes: 'Trần sảnh cực cao (8m), có nhiều điểm treo hook tải trọng 500kg/điểm.',
    siteConstraints: 'Phải trải thảm bảo vệ thảm sàn gỗ của GEM Center trước khi lăn bánh xe thiết bị.',
    additionalRequests: 'Khách yêu cầu thêm cụm mây khói CO2 khi cô dâu chú rể bước lên sân khấu.',
    images: [
      'https://images.unsplash.com/photo-1507504038482-762618aba83e?auto=format&fit=crop&q=80&w=400'
    ],
    proposedItems: [
      { name: 'Máy tạo khói nặng CO2', quantity: 2, notes: 'Dùng đá khô để giữ khói sát sàn' }
    ]
  }
];

export const initialInventory: InventoryItem[] = [
  { id: 'INV-001', name: 'Đèn Moving Head Beam 230W', category: 'Audio/Video', unit: 'Cái', totalQty: 24, availableQty: 12, reservedQty: 12, missingQty: 0, rentalPrice: 500000, notes: 'Đèn hoạt động tốt, đã được hiệu chỉnh gobo.' },
  { id: 'INV-002', name: 'Khung Truss nhôm hộp 300x300mm', category: 'Logistics', unit: 'Mét', totalQty: 120, availableQty: 80, reservedQty: 40, missingQty: 0, rentalPrice: 100000, notes: 'An toàn, chắc chắn, chốt nối đầy đủ.' },
  { id: 'INV-003', name: 'Màn hình LED P3 Cabin nhôm siêu nhẹ', category: 'Audio/Video', unit: 'm2', totalQty: 40, availableQty: 15, reservedQty: 15, missingQty: 10, rentalPrice: 800000, notes: 'Cần thuê ngoài thêm 10m2 cho đơn của khách Trần Thị Thảo.' },
  { id: 'INV-004', name: 'Cổng vòm sắt bán nguyệt nghệ thuật', category: 'Decor', unit: 'Bộ', totalQty: 4, availableQty: 2, reservedQty: 2, missingQty: 0, rentalPrice: 1500000, notes: 'Sơn phủ trắng tĩnh điện.' },
  { id: 'INV-005', name: 'Máy khói lạnh CO2 công suất lớn', category: 'Logistics', unit: 'Cái', totalQty: 6, availableQty: 4, reservedQty: 2, missingQty: 0, rentalPrice: 1200000, notes: 'Bao gồm cả bình khí CO2 dự phòng.' },
  { id: 'INV-006', name: 'Bàn Gallery gỗ sồi Rustic', category: 'Decor', unit: 'Bộ', totalQty: 3, availableQty: 1, reservedQty: 2, missingQty: 0, rentalPrice: 2000000, notes: 'Màu gỗ nâu trầm, phụ kiện trang trí đi kèm đầy đủ.' }
];

export const initialPickLists: PickList[] = [
  {
    id: 'PICK-001',
    orderId: 'ORD-001',
    customerName: 'Nguyễn Văn Hải',
    taskTitle: 'Bảo dưỡng & vệ sinh 12 đèn Moving Head',
    itemCount: 2,
    prepareDate: '2026-07-13',
    staffInCharge: 'Vũ Quốc Bảo (Logistics)',
    status: 'Picked',
    items: [
      { itemId: 'INV-001', itemName: 'Đèn Moving Head Beam 230W', unit: 'Cái', requestedQty: 12, availableQty: 12, preparedQty: 12, notes: 'Kiểm tra bóng và cơ xoay kỹ' },
      { itemId: 'INV-002', itemName: 'Khung Truss nhôm hộp 300x300mm', unit: 'Mét', requestedQty: 15, availableQty: 80, preparedQty: 15, notes: 'Truss nhôm dài 2m x 7 cây, 1m x 1 cây' }
    ]
  },
  {
    id: 'PICK-002',
    orderId: 'ORD-002',
    customerName: 'Trần Thị Thảo',
    taskTitle: 'Thi công cắm cổng vòm pha lê & hoa tươi',
    itemCount: 2,
    prepareDate: '2026-07-26',
    staffInCharge: 'Đỗ Văn Nam (Technical)',
    status: 'Pending',
    items: [
      { itemId: 'INV-004', itemName: 'Cổng vòm sắt bán nguyệt nghệ thuật', unit: 'Bộ', requestedQty: 1, availableQty: 2, preparedQty: 0, notes: 'Đã giữ chỗ, chuẩn bị xuất kho' },
      { itemId: 'INV-003', itemName: 'Màn hình LED P3 Cabin nhôm siêu nhẹ', unit: 'm2', requestedQty: 15, availableQty: 15, preparedQty: 0, notes: '15m2 cabin kèm cáp tín hiệu' }
    ]
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Công ty Hoa tươi Đà Lạt Hasfarm',
    contactPerson: 'Nguyễn Thị Bích Hoa',
    phone: '02633831234',
    email: 'info@dalathasfarm.com',
    address: '450 Nguyên Tử Lực, Đà Lạt, Lâm Đồng',
    status: 'Active',
    notes: 'NCC hoa tươi nhập khẩu lớn nhất, cam kết tươi 100%, có hỗ trợ đổi trả nếu lỗi.'
  },
  {
    id: 'SUP-002',
    name: 'Âm thanh Ánh sáng Việt Media',
    contactPerson: 'Lê Văn Khôi',
    phone: '0977888999',
    email: 'khoi.le@vietmedia.vn',
    address: '109 Phố Vọng, Hai Bà Trưng, Hà Nội',
    status: 'Active',
    notes: 'Chuyên cung ứng thiết bị âm thanh ánh sáng ngoài kho của BNWEMS, chiết khấu 15% cho hệ thống Line Array.'
  },
  {
    id: 'SUP-003',
    name: 'Kho thiết bị sự kiện Đại Phát',
    contactPerson: 'Phạm Đại Phát',
    phone: '0909999888',
    email: 'daiphat.event@gmail.com',
    address: 'Đường Kha Vạn Cân, Thủ Đức, TP. HCM',
    status: 'Active',
    notes: 'Cung cấp nhà bạt truss nhôm, dù tròn lớn và thảm trải sàn số lượng lớn.'
  },
  {
    id: 'SUP-004',
    name: 'Hỷ Lâm Môn Wedding Decor',
    contactPerson: 'Trần Ngọc Hân',
    phone: '0933112233',
    email: 'hylammon@outlook.com',
    address: '32 Pasteur, Quận 1, TP. HCM',
    status: 'Inactive',
    notes: 'Ngừng hợp tác do chậm giao hàng và chất lượng lụa bạc màu.'
  }
];

export const initialProcurements: ProcurementOrder[] = [
  {
    id: 'PROC-001',
    supplierId: 'SUP-001',
    supplierName: 'Công ty Hoa tươi Đà Lạt Hasfarm',
    orderId: 'ORD-002',
    type: 'Purchase',
    itemCount: 2,
    totalCost: 15000000,
    deliveryDate: '2026-07-27',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    items: [
      { name: 'Hoa hồng Ecuador Pink Floyd (cành)', quantity: 500, price: 20000, notes: 'Yêu cầu bông to nở đều' },
      { name: 'Cẩm tú cầu Đà Lạt xanh nhạt (bông)', quantity: 200, price: 25000, notes: 'Chọn bông to tròn trịa' }
    ],
    notes: 'Đơn hàng hoa phục vụ tiệc cưới Thảo & Phong tại GEM Center.'
  },
  {
    id: 'PROC-002',
    supplierId: 'SUP-002',
    supplierName: 'Âm thanh Ánh sáng Việt Media',
    orderId: 'ORD-002',
    type: 'Rental',
    itemCount: 1,
    totalCost: 8000000,
    deliveryDate: '2026-07-27',
    status: 'Draft',
    paymentStatus: 'Unpaid',
    items: [
      { name: 'Màn hình LED P3 Cabin Outdoor bổ sung (m2)', quantity: 10, price: 800000, notes: 'Thuê bù phần thiếu hụt trong kho để đủ 25m2' }
    ],
    notes: 'Cần nhận thiết bị sớm tại sảnh Pollux GEM Center để ráp cùng màn hình chính.'
  }
];

export const initialSupplierDebts: SupplierDebt[] = [
  { id: 'DEBT-001', supplierName: 'Công ty Hoa tươi Đà Lạt Hasfarm', supplierId: 'SUP-001', procurementId: 'PROC-001', totalAmount: 15000000, paidAmount: 15000000, debtAmount: 0, dueDate: '2026-07-30', status: 'Paid' },
  { id: 'DEBT-002', supplierName: 'Âm thanh Ánh sáng Việt Media', supplierId: 'SUP-002', procurementId: 'PROC-002', totalAmount: 8000000, paidAmount: 0, debtAmount: 8000000, dueDate: '2026-08-05', status: 'Unpaid' }
];

export const initialSupplierPayments: SupplierPaymentRecord[] = [
  { id: 'SPAY-001', supplierName: 'Công ty Hoa tươi Đà Lạt Hasfarm', procurementId: 'PROC-001', amount: 15000000, method: 'Bank Transfer', transactionCode: 'FT2618938210', date: '2026-06-25', notes: 'Thanh toán 100% giá trị đơn hàng hoa cưới.' }
];

export const initialWages: WageRecord[] = [
  {
    id: 'WAGE-001',
    staffName: 'Trần Anh Tuấn',
    role: 'Leader Staff',
    shiftsCount: 12,
    tasksCompleted: 8,
    baseSalary: 6000000, // 500k/ca
    deduction: 0,
    estimatedWage: 6000000,
    status: 'Pending',
    shifts: [
      { id: 'S-1', orderId: 'ORD-001', date: '2026-07-02', shiftType: 'Ca Sáng (08:00 - 12:00)', checkIn: '07:55', checkOut: '12:05', approver: 'Manager Binh', notes: 'Khảo sát Melia Hotel' },
      { id: 'S-2', orderId: 'ORD-002', date: '2026-07-10', shiftType: 'Ca Chiều (13:00 - 17:00)', checkIn: '12:50', checkOut: '17:15', approver: 'Manager Binh', notes: 'Khảo sát GEM Center' }
    ]
  },
  {
    id: 'WAGE-002',
    staffName: 'Phạm Hồng Thái',
    role: 'Technical Staff',
    shiftsCount: 15,
    tasksCompleted: 12,
    baseSalary: 5250000, // 350k/ca
    deduction: 200000, // phạt muộn hoặc hư hại nhẹ
    estimatedWage: 5050000,
    status: 'Confirmed',
    shifts: [
      { id: 'S-3', orderId: 'ORD-001', date: '2026-07-02', shiftType: 'Ca Sáng (08:00 - 12:00)', checkIn: '08:15', checkOut: '12:00', approver: 'Manager Binh', notes: 'Đi muộn 15 phút' }
    ]
  }
];

export const initialDepositRequests: DepositRequest[] = [
  { id: 'DEP-001', orderId: 'ORD-001', customerName: 'Nguyễn Văn Hải', totalAmount: 43000000, depositRate: 30, depositAmount: 12900000, dueDate: '2026-06-20', status: 'Confirmed', notes: 'Cọc 30% để giữ lịch thi công.' },
  { id: 'DEP-002', orderId: 'ORD-002', customerName: 'Trần Thị Thảo', totalAmount: 78000000, depositRate: 30, depositAmount: 23400000, dueDate: '2026-07-10', status: 'Pending QR', notes: 'Đang đợi tạo QR thanh toán cho khách.' },
  { id: 'DEP-003', orderId: 'ORD-003', customerName: 'Phạm Minh Đức', totalAmount: 25000000, depositRate: 50, depositAmount: 12500000, dueDate: '2026-07-05', status: 'Pending Payment', notes: 'Đã gửi link yêu cầu cọc 50%.' }
];
