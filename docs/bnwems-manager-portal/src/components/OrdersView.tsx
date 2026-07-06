import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clipboard, 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  QrCode, 
  UserCheck, 
  TrendingUp, 
  Clock, 
  CheckSquare,
  Printer,
  RefreshCw,
  FileText,
  AlertCircle,
  Info,
  Layers,
  Truck,
  Wrench
} from 'lucide-react';
import { 
  Customer, 
  Order, 
  Quotation, 
  DepositRequest, 
  SurveyReport, 
  InventoryItem, 
  PickList 
} from '../mockData';

interface OrdersViewProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  customers: Customer[];
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  deposits: DepositRequest[];
  setDeposits: React.Dispatch<React.SetStateAction<DepositRequest[]>>;
  reports: SurveyReport[];
  inventory: InventoryItem[];
  pickLists: PickList[];
  setPickLists: React.Dispatch<React.SetStateAction<PickList[]>>;
  onSelectOrder: (id: string | null) => void;
  selectedOrderId: string | null;
  onNavigate: (route: string, menu: string) => void;
  onSelectCustomer: (id: string) => void;
  onSelectQuotation: (id: string) => void;
  onSelectReport: (id: string) => void;
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  openQrModal: (orderId: string, amount: number) => void;
  openDepositModal: (orderId: string) => void;
}

export default function OrdersView({
  orders,
  setOrders,
  customers,
  quotations,
  setQuotations,
  deposits,
  setDeposits,
  reports,
  inventory,
  pickLists,
  setPickLists,
  onSelectOrder,
  selectedOrderId,
  onNavigate,
  onSelectCustomer,
  onSelectQuotation,
  onSelectReport,
  currentRoute,
  setCurrentRoute,
  openQrModal,
  openQrModal: openQrModalFromProp,
  openDepositModal,
}: OrdersViewProps) {

  // List states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setStartDateEnd] = useState('');

  // Creation/Edit state
  const [editMode, setEditMode] = useState(false);
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formEventType, setFormEventType] = useState('Tiệc Cưới Trọn Gói');
  const [formEventName, setFormEventName] = useState('');
  const [formEventDate, setFormEventDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formGuestCount, setFormGuestCount] = useState(200);
  const [formNotes, setFormNotes] = useState('');

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'quotation' | 'payment' | 'survey' | 'inventory' | 'history'>('overview');

  // Cancel Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [confirmCancelCheckbox, setConfirmCancelCheckbox] = useState(false);

  // States for "Tồn kho & Picklist" tab
  const [invSearchQuery, setInvSearchQuery] = useState('');
  const [invStatusSelection, setInvStatusSelection] = useState('Tất cả');
  const [invOnlyMissing, setInvOnlyMissing] = useState(false);
  const [invOnlyNotFullyPrepared, setInvOnlyNotFullyPrepared] = useState(false);
  const [invNotification, setInvNotification] = useState<string | null>(null);

  // States for interactive Survey & Staff tab
  const [acceptedChangeRequest, setAcceptedChangeRequest] = useState<boolean | null>(null);
  const [surveyStaff, setSurveyStaff] = useState('Nguyễn Văn An');
  const [constructionStaffList, setConstructionStaffList] = useState([
    { name: 'Trần Minh Quân', role: 'TRƯỞNG NHÓM', status: 'SẴN SÀNG', statusType: 'ready' },
    { name: 'Lê Hoàng Nam', role: 'KỸ THUẬT ÂM THANH', status: 'ĐANG SETUP', statusType: 'setup' },
    { name: 'Vũ Đình Tú', role: 'KỸ THUẬT ÁNH SÁNG', status: 'ĐANG SETUP', statusType: 'setup' }
  ]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('KỸ THUẬT VIÊN');

  // Load details
  const activeOrder = orders.find(o => o.id === selectedOrderId);
  const activeCustomer = activeOrder ? customers.find(c => c.id === activeOrder.customerId) : null;
  const activeQuotation = activeOrder ? quotations.find(q => q.orderId === activeOrder.id) : null;
  const activeDeposit = activeOrder ? deposits.find(d => d.orderId === activeOrder.id) : null;
  const activeSurveyReport = activeOrder ? reports.find(r => r.orderId === activeOrder.id) : null;
  const activePickList = activeOrder ? pickLists.find(p => p.orderId === activeOrder.id) : null;

  // Filter list
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : o.orderStatus === statusFilter;
    const matchesDate = startDate ? o.eventDate >= startDate : true;
    const matchesEndDate = endDate ? o.eventDate <= endDate : true;
    return matchesSearch && matchesStatus && matchesDate && matchesEndDate;
  });

  // KPI calculations
  const totalCount = orders.length;
  const newCount = orders.filter(o => o.orderStatus === 'New').length;
  const inProgressCount = orders.filter(o => o.orderStatus === 'In Progress' || o.orderStatus === 'Confirmed').length;
  const completedCount = orders.filter(o => o.orderStatus === 'Completed').length;

  // Sync edit values
  useEffect(() => {
    if (currentRoute === 'order-create' && selectedOrderId) {
      const o = orders.find(ord => ord.id === selectedOrderId);
      if (o) {
        setEditMode(true);
        setFormCustomerId(o.customerId);
        setFormEventType(o.eventType);
        setFormEventName(o.eventName);
        setFormEventDate(o.eventDate);
        setFormLocation(o.location);
        setFormGuestCount(o.guestCount);
        setFormNotes(o.notes);
      }
    } else if (currentRoute === 'order-create' && !selectedOrderId) {
      setEditMode(false);
      setFormCustomerId('');
      setFormEventType('Tiệc Cưới Trọn Gói');
      setFormEventName('');
      setFormEventDate('');
      setFormLocation('');
      setFormGuestCount(200);
      setFormNotes('');
    }
  }, [currentRoute, selectedOrderId]);

  // Stepper steps
  const steps = ['New', 'Quoted', 'Waiting for Deposit', 'Confirmed', 'In Progress', 'Completed'];

  // Save order
  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId || !formEventName || !formEventDate || !formLocation) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const customer = customers.find(c => c.id === formCustomerId);
    if (!customer) {
      alert("Khách học không hợp lệ.");
      return;
    }

    if (editMode && selectedOrderId) {
      setOrders(prev => prev.map(o => o.id === selectedOrderId ? {
        ...o,
        customerId: formCustomerId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        eventType: formEventType,
        eventName: formEventName,
        eventDate: formEventDate,
        location: formLocation,
        guestCount: formGuestCount,
        notes: formNotes,
      } : o));
      alert("Cập nhật đơn hàng thành công!");
    } else {
      const newId = `ORD-${String(orders.length + 1).padStart(3, '0')}`;
      const newOrd: Order = {
        id: newId,
        customerId: formCustomerId,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        eventType: formEventType,
        eventName: formEventName,
        eventDate: formEventDate,
        location: formLocation,
        guestCount: formGuestCount,
        notes: formNotes,
        totalAmount: 0,
        paymentStatus: 'Unpaid',
        orderStatus: 'New'
      };
      setOrders(prev => [newOrd, ...prev]);
      alert("Tạo đơn hàng mới thành công!");
    }
    onSelectOrder(null);
    setCurrentRoute('orders');
  };

  // Cancel order execution
  const handleCancelOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCancelCheckbox) {
      alert("Vui lòng xác nhận hủy đơn và giải phóng kho.");
      return;
    }
    if (!cancelReason) {
      alert("Vui lòng nhập lý do hủy đơn.");
      return;
    }

    setOrders(prev => prev.map(o => o.id === selectedOrderId ? {
      ...o,
      orderStatus: 'Cancelled'
    } : o));

    setShowCancelModal(false);
    alert(`Đã hủy đơn hàng ${selectedOrderId} thành công và giải phóng kho!`);
  };

  // Quick Picklist trigger
  const handleGeneratePickListQuick = () => {
    if (!activeOrder) return;
    const newPickId = `PICK-${String(pickLists.length + 1).padStart(3, '0')}`;
    const newPick: PickList = {
      id: newPickId,
      orderId: activeOrder.id,
      customerName: activeOrder.customerName,
      taskTitle: `Chuẩn bị thiết bị cho đơn ${activeOrder.id}`,
      itemCount: 2,
      prepareDate: activeOrder.eventDate,
      staffInCharge: 'Trần Anh Tuấn (Leader)',
      status: 'Pending',
      items: [
        { itemId: 'INV-001', itemName: 'Đèn Moving Head Beam 230W', unit: 'Cái', requestedQty: 12, availableQty: 12, preparedQty: 0, notes: 'Chuẩn bị chốt' },
        { itemId: 'INV-004', itemName: 'Cổng vòm sắt bán nguyệt nghệ thuật', unit: 'Bộ', requestedQty: 1, availableQty: 2, preparedQty: 0, notes: 'Trang trí sảnh' }
      ]
    };
    setPickLists(prev => [newPick, ...prev]);
    alert("Đã tự động khởi tạo Pick List và đồng bộ thiết bị khả dụng trong kho!");
  };

  // 1. ORDER LIST VIEW
  if (currentRoute === 'orders') {
    return (
      <div id="orders-list-view" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Danh sách đơn hàng</h1>
            <p className="text-gray-500 text-sm mt-0.5">Theo dõi dòng đời và thông số vận hành của từng hợp đồng sự kiện.</p>
          </div>
          <button
            onClick={() => { onSelectOrder(null); setCurrentRoute('order-create'); }}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo đơn hàng mới
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 font-bold block uppercase">Tổng đơn hàng</span>
            <span className="text-xl font-bold text-gray-800 mt-1 block">{totalCount}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
            <span className="text-xs text-gray-400 font-bold block uppercase">Hợp đồng mới (New)</span>
            <span className="text-xl font-bold text-[#2563EB] mt-1 block">{newCount}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-amber-500">
            <span className="text-xs text-gray-400 font-bold block uppercase">Đang thực hiện</span>
            <span className="text-xl font-bold text-amber-500 mt-1 block">{inProgressCount}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
            <span className="text-xs text-gray-400 font-bold block uppercase">Đã hoàn tất (Completed)</span>
            <span className="text-xl font-bold text-green-600 mt-1 block">{completedCount}</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, khách hàng hoặc tên sự kiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-semibold text-gray-700"
            >
              <option value="All">Tất cả trạng thái đơn</option>
              {steps.concat(['Cancelled']).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Từ ngày"
              className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        {/* Table representation */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                  <th className="px-6 py-4">Mã đơn hàng</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Sự kiện & Địa điểm</th>
                  <th className="px-6 py-4">Ngày sự kiện</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      Không tìm thấy hợp đồng đơn hàng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#2563EB]">{ord.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{ord.customerName}</div>
                        <div className="text-xs text-gray-400 font-medium">{ord.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 max-w-[220px]">
                        <div className="font-semibold text-gray-800 truncate">{ord.eventName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {ord.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">{ord.eventDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          ord.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                          ord.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-200' :
                          ord.orderStatus === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { onSelectOrder(ord.id); setCurrentRoute('order-detail'); setActiveTab('overview'); }}
                            className="p-1.5 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Quản lý chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { onSelectOrder(ord.id); setCurrentRoute('order-create'); }}
                            className="p-1.5 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                            title="Sửa đơn"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 2. ORDER DETAILS CORE WORKSPACE
  if (currentRoute === 'order-detail' && activeOrder) {
    const currentStepIndex = steps.indexOf(activeOrder.orderStatus);

    return (
      <div id="order-detail-view" className="space-y-6">
        {/* Toolbar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={() => setCurrentRoute('orders')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 font-semibold text-sm bg-white border border-gray-200 px-3.5 py-2 rounded-xl hover:shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại đơn hàng
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentRoute('order-create')}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-4 h-4 text-amber-500" /> Sửa thông tin sự kiện
            </button>
            {activeOrder.orderStatus !== 'Cancelled' && activeOrder.orderStatus !== 'Completed' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer rounded-xl"
              >
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Hủy bỏ đơn hàng
              </button>
            )}
          </div>
        </div>

        {/* Stepper progress tracker */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-800">Tiến trình vận hành: {activeOrder.id}</h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                activeOrder.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>{activeOrder.orderStatus}</span>
            </div>
            <span className="text-xs text-gray-400">Cập nhật lúc: Vừa xong</span>
          </div>

          {activeOrder.orderStatus === 'Cancelled' ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-red-800">HỢP ĐỒNG ĐÃ BỊ HUỶ BỎ</h4>
                <p className="text-xs text-red-600 mt-0.5">Mọi thiết bị giữ chỗ và lịch làm việc của nhân sự phụ trách đã được tự động giải phóng hoàn toàn về kho.</p>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 hidden md:block"></div>
              {steps.map((st, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={st} className="flex flex-row md:flex-col items-center gap-2 z-10 w-full md:w-auto">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                      isPassed ? 'bg-green-500 border-green-500 text-white' :
                      isCurrent ? 'bg-[#2563EB] border-[#2563EB] text-white ring-4 ring-blue-100' :
                      'bg-white border-gray-200 text-gray-400'
                    }`}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className={`text-xs font-bold ${isCurrent ? 'text-[#2563EB]' : isPassed ? 'text-green-600' : 'text-gray-400'}`}>{st}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Tổng quan sự kiện' },
            { id: 'quotation', label: 'Hồ sơ báo giá' },
            { id: 'payment', label: 'Đặt cọc & Thanh toán' },
            { id: 'survey', label: 'Khảo sát & Nhân sự' },
            { id: 'inventory', label: 'Tồn kho & Picklist' },
            { id: 'history', label: 'Lịch sử hoạt động' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="min-h-[300px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
              <div className="md:col-span-8 space-y-6">
                {/* Event info */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-800">Thông tin chi tiết sự kiện</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 block font-bold">Tên sự kiện</span>
                      <span className="font-bold text-gray-800 block mt-1">{activeOrder.eventName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold">Phân loại sự kiện</span>
                      <span className="bg-blue-50 text-[#2563EB] border border-blue-100 px-2 py-0.5 rounded text-xs font-bold inline-block mt-1">{activeOrder.eventType}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold">Thời gian tổ chức</span>
                      <span className="font-semibold text-gray-700 block mt-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" /> {activeOrder.eventDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-bold">Số lượng khách dự kiến</span>
                      <span className="font-semibold text-gray-700 block mt-1">{activeOrder.guestCount} khách</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-gray-400 block font-bold">Địa điểm tổ chức sự kiện</span>
                      <span className="font-semibold text-gray-700 mt-1 block flex items-center gap-1">
                        <MapPin className="w-4.5 h-4.5 text-gray-400" /> {activeOrder.location}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400 block font-bold mb-1">Ghi chú quản lý vận hành</span>
                    <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">{activeOrder.notes || 'Không ghi nhận ghi chú đặc biệt.'}</p>
                  </div>
                </div>
              </div>

              {/* Sidebar overview items */}
              <div className="md:col-span-4 space-y-6">
                {/* Customer card */}
                {activeCustomer && (
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2">Khách hàng liên hệ</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center font-bold text-[#2563EB]">
                        {activeCustomer.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{activeCustomer.name}</h4>
                        <p className="text-xs text-gray-400">{activeCustomer.phone}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1 bg-slate-50 p-2.5 rounded-lg">
                      <p><strong>Email:</strong> {activeCustomer.email}</p>
                      <p className="truncate"><strong>Địa chỉ:</strong> {activeCustomer.address}</p>
                    </div>
                    <button
                      onClick={() => { onSelectCustomer(activeCustomer.id); onNavigate('customer-detail', 'customers'); }}
                      className="w-full text-center py-2 border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 rounded-lg transition-colors cursor-pointer"
                    >
                      Xem trang khách hàng
                    </button>
                  </div>
                )}

                {/* Quick Status Block */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2">Trạng thái hồ sơ</h3>
                  <div className="text-xs space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-semibold">Hồ sơ báo giá:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeQuotation ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                      }`}>{activeQuotation ? 'Đã duyệt' : 'Chưa lập báo giá'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-semibold">Tình trạng thanh toán:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeOrder.paymentStatus === 'Fully Paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>{activeOrder.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-semibold">Khảo sát hiện trường:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeSurveyReport ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'
                      }`}>{activeSurveyReport ? 'Đã báo cáo' : 'Chưa khảo sát'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-semibold">Phiếu xuất kho (Picklist):</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activePickList ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>{activePickList ? 'Đã tạo' : 'Chưa lập phiếu'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Quotation */}
          {activeTab === 'quotation' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h3 className="font-bold text-gray-800">Phương án báo giá được phê duyệt</h3>
                {activeQuotation && (
                  <button
                    onClick={() => { onSelectQuotation(activeQuotation.id); setCurrentRoute('quotation-detail'); }}
                    className="text-xs text-[#2563EB] font-bold hover:underline"
                  >
                    Xem chi tiết báo giá gốc
                  </button>
                )}
              </div>

              {activeQuotation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 font-semibold block">Mã báo giá</span>
                      <span className="font-bold text-gray-800 mt-1 block">{activeQuotation.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block">Phiên bản chốt</span>
                      <span className="font-bold text-gray-800 mt-1 block">{activeQuotation.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold block">Tổng tiền dự toán</span>
                      <span className="font-bold text-[#2563EB] text-sm mt-0.5 block">{activeQuotation.totalAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-gray-500 uppercase font-bold">
                        <tr>
                          <th className="px-4 py-2.5">Hạng mục thiết bị/dịch vụ</th>
                          <th className="px-4 py-2.5 text-center">Đơn vị</th>
                          <th className="px-4 py-2.5 text-center">Số lượng</th>
                          <th className="px-4 py-2.5 text-right">Đơn giá</th>
                          <th className="px-4 py-2.5 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {activeQuotation.items.map(item => (
                          <tr key={item.id}>
                            <td className="px-4 py-2.5 font-bold text-gray-700">{item.name}</td>
                            <td className="px-4 py-2.5 text-center text-gray-400">{item.unit}</td>
                            <td className="px-4 py-2.5 text-center font-semibold">{item.quantity}</td>
                            <td className="px-4 py-2.5 text-right font-medium">{item.price.toLocaleString('vi-VN')} đ</td>
                            <td className="px-4 py-2.5 text-right font-bold text-gray-800">{((item.price - item.discount) * item.quantity).toLocaleString('vi-VN')} đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 space-y-4">
                  <p className="text-gray-400 text-sm">Đơn hàng này chưa được lập báo giá hoặc chưa được duyệt báo giá nháp.</p>
                  <button
                    onClick={() => { onSelectQuotation(null); setCurrentRoute('quotation-create'); }}
                    className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Khởi lập báo giá đầu tiên
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab Payment */}
          {activeTab === 'payment' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-8 animate-fade-in">
              {/* Header inside the Card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Dòng tiền đặt cọc & Thanh toán cuối</h3>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium">Theo dõi, quản lý tiến trình và lịch sử đối soát thanh toán của đơn hàng</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openDepositModal(activeOrder.id)}
                    className="px-4 py-2 border border-blue-600 hover:bg-blue-50 text-blue-600 font-bold text-xs rounded-lg transition-all cursor-pointer bg-white"
                  >
                    Thiết lập cọc
                  </button>
                  <button
                    onClick={() => openQrModal(activeOrder.id, activeOrder.totalAmount * 0.3)}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Tạo VNPay QR
                  </button>
                </div>
              </div>

              {/* 3 Blocks Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Columns 1 to 8: Flow between Deposit and Final Payment */}
                <div className="lg:col-span-8 bg-slate-50/40 border border-slate-200/60 rounded-2xl p-5 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tiến trình thanh toán lịch trình</span>
                    <span className="text-xs font-semibold text-slate-500">Hoàn thành: 30%</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                    
                    {/* Block 1: Đặt cọc */}
                    <div className="md:col-span-5 bg-emerald-50/40 border border-emerald-200 shadow-xs rounded-xl p-4.5 flex flex-col justify-between h-full space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 text-sm">Đặt cọc</h4>
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">30% giá trị báo giá</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Đã cọc
                        </span>
                      </div>

                      <div className="space-y-2 py-1.5 border-y border-emerald-100/60">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Số tiền cọc:</span>
                          <span className="font-bold text-slate-800">12.900.000đ</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Hạn thanh toán:</span>
                          <span className="font-semibold text-slate-600">20/06/2026</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Phương thức:</span>
                          <span className="font-semibold text-slate-600">VNPay QR</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Mã giao dịch:</span>
                          <span className="font-mono text-slate-600 bg-emerald-100/40 px-1 rounded text-[10px]">VNPAY-DEP-001</span>
                        </div>
                      </div>

                      <div className="pt-1 flex justify-start">
                        <button 
                          onClick={() => alert("Thông tin chi tiết giao dịch:\nMã đơn hàng: " + activeOrder.id + "\nMã GD: VNPAY-DEP-001\nSố tiền: 12.900.000đ\nNgân hàng: VNPAY\nThời gian: 18/06/2026 14:32:01")}
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
                        >
                          Xem giao dịch
                        </button>
                      </div>
                    </div>

                    {/* Connection Arrow indicator in-between */}
                    <div className="hidden md:flex md:col-span-1 flex-col items-center justify-center space-y-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold text-center leading-tight whitespace-nowrap">Sự kiện<br/>diễn ra</span>
                    </div>

                    {/* Block 2: Thanh toán cuối */}
                    <div className="md:col-span-5 bg-slate-50/50 border border-slate-200/80 shadow-xs rounded-xl p-4.5 flex flex-col justify-between h-full space-y-4 opacity-90">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">Thanh toán cuối</h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">70% còn lại sau sự kiện</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          Chờ hoàn tất sự kiện
                        </span>
                      </div>

                      <div className="space-y-2 py-1.5 border-y border-slate-200/60">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Số tiền:</span>
                          <span className="font-bold text-slate-800">30.100.000đ</span>
                        </div>
                        <div className="flex flex-col text-xs space-y-1">
                          <span className="text-slate-500 font-medium">Điều kiện giải tỏa:</span>
                          <span className="text-amber-700 bg-amber-50 border border-amber-100 p-1.5 rounded text-[10px] leading-tight font-medium flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>Chỉ tạo yêu cầu sau khi có phiếu quyết toán</span>
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Phương thức dự kiến:</span>
                          <span className="font-semibold text-slate-600 text-right">VNPay QR / Tiền mặt / Chuyển khoản</span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          disabled
                          className="w-full text-center py-2 bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs rounded-lg cursor-not-allowed"
                        >
                          Tạo yêu cầu thanh toán cuối
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Columns 9 to 12: Block 3 - Yêu cầu thanh toán hiện tại */}
                <div className="lg:col-span-4 bg-white border border-slate-200 shadow-xs rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Yêu cầu thanh toán hiện tại</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#DCFCE7] text-[#15803D]">
                        confirmed
                      </span>
                    </div>

                    <div className="space-y-2.5 mt-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Mã yêu cầu:</span>
                        <span className="font-bold text-slate-800">DEP-001</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Loại thanh toán:</span>
                        <span className="font-semibold text-slate-700">Đặt cọc</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Số tiền:</span>
                        <span className="font-bold text-slate-900">12.900.000đ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Phương thức:</span>
                        <span className="font-semibold text-slate-700">VNPay QR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Ngày tạo:</span>
                        <span className="font-semibold text-slate-600">18/06/2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Hạn thanh toán:</span>
                        <span className="font-semibold text-slate-600">20/06/2026</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => openQrModal(activeOrder.id, 12900000)}
                      className="w-full text-center py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Xem QR
                    </button>
                    <button
                      onClick={() => alert("Đã gửi lại liên kết thanh toán VNPay QR & thông tin hóa đơn cọc qua SMS/Email cho khách hàng!")}
                      className="w-full text-center py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Gửi lại cho khách
                    </button>
                  </div>
                </div>

              </div>

              {/* Lịch sử thanh toán table */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">Lịch sử thanh toán</h4>
                  <span className="text-[11px] text-slate-400 font-medium">Cập nhật 2 phút trước</span>
                </div>

                <div className="overflow-x-auto border border-slate-200/80 rounded-xl shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <th className="px-5 py-3">Loại thanh toán</th>
                        <th className="px-5 py-3">Số tiền</th>
                        <th className="px-5 py-3">Phương thức</th>
                        <th className="px-5 py-3">Mã giao dịch</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Ngày xác nhận</th>
                        <th className="px-5 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                      {/* Row 1: Đặt cọc */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-800">Đặt cọc</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">12.900.000đ</td>
                        <td className="px-5 py-3.5 text-slate-500">VNPay QR</td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono">VNPAY-DEP-001</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                            confirmed
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">18/06/2026</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => alert("Thông tin thanh toán cọc:\nMã GD: VNPAY-DEP-001\nSố tiền: 12.900.000đ\nTrạng thái: confirmed (Đã xác nhận)\nThời gian: 18/06/2026")}
                            className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                          >
                            Xem
                          </button>
                        </td>
                      </tr>

                      {/* Row 2: Thanh toán cuối */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-800">Thanh toán cuối</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">30.100.000đ</td>
                        <td className="px-5 py-3.5 text-slate-400">—</td>
                        <td className="px-5 py-3.5 text-slate-400">—</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F3F4F6] text-[#374151]">
                            waiting_event_completion
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">—</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            disabled
                            title="Sự kiện chưa diễn ra xong"
                            className="bg-slate-100 text-slate-400 border border-slate-200 px-3 py-1 rounded text-[10px] font-bold cursor-not-allowed"
                          >
                            Tạo yêu cầu
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Tab Staff & Survey */}
          {activeTab === 'survey' && (
            <div className="space-y-6 animate-fade-in text-sm text-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: SURVEY DETAILS & ROADMAP */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Card 1: Kết quả khảo sát */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                      <h3 className="font-bold text-gray-800 text-base">Kết quả khảo sát</h3>
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        ĐÃ NỘP
                      </span>
                    </div>

                    {/* Author section */}
                    <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                        {surveyStaff.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{surveyStaff}</p>
                        <p className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-300" />
                          Khảo sát lúc 14:30 - 05/10/2023
                        </p>
                      </div>
                    </div>

                    {/* Ghi chú kỹ thuật */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">GHI CHÚ KỸ THUẬT</span>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-medium text-gray-700 leading-relaxed">
                        Cổng vào hẹp, cần xe tải nhỏ trung chuyển. Điểm treo Rigging ổn định, tải trọng tối đa 500kg/điểm.
                      </div>
                    </div>

                    {/* Survey Photos Grid */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">HÌNH ẢNH HIỆN TRƯỜNG</span>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80', caption: 'Lối vào chính bốc dỡ đồ' },
                          { url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=400&q=80', caption: 'Lối vào sảnh chính' },
                          { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80', caption: 'Trần sảnh & Điểm treo rigging' },
                          { url: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=400&q=80', caption: 'Tủ điện nguồn tổng' }
                        ].map((photo, i) => (
                          <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 group cursor-pointer shadow-2xs">
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-3xs px-2.5 py-1.5 flex items-center justify-between text-[10px] text-white">
                              <span className="font-semibold truncate">{photo.caption}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Theo dõi thi công */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
                    <h3 className="font-bold text-gray-800 text-base pb-1">Theo dõi thi công</h3>
                    
                    <div className="space-y-3">
                      {/* Task 1 */}
                      <div className="flex items-center justify-between p-3.5 bg-green-50/20 border border-green-100/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">Vận chuyển thiết bị</p>
                            <p className="text-[11px] text-green-700 font-bold uppercase tracking-wider mt-0.5">Đas Hoàn Thành</p>
                          </div>
                        </div>
                        <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs shadow-sm">
                          ✓
                        </span>
                      </div>

                      {/* Task 2 */}
                      <div className="flex items-center justify-between p-3.5 bg-blue-50/20 border border-blue-100/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center">
                            <Wrench className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">Lắp đặt & Setup</p>
                            <p className="text-[11px] text-[#2563EB] font-bold uppercase tracking-wider mt-0.5">ĐANG THỰC HIỆN (70%)</p>
                          </div>
                        </div>
                        <div className="w-5 h-5 rounded-md border-2 border-blue-400 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs animate-pulse"></span>
                        </div>
                      </div>

                      {/* Task 3 */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center">
                            <RefreshCw className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-500 text-sm">Thu hồi & Hoàn trả</p>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Chưa bắt đầu</p>
                          </div>
                        </div>
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: PERSONNELASSIGNMENTS & FIELD ALERTS */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Card 1: Phân công khảo sát */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 text-sm">Phân công khảo sát</h3>
                      <button 
                        onClick={() => {
                          const newStaff = prompt("Nhập tên nhân viên khảo sát mới:", surveyStaff);
                          if (newStaff) setSurveyStaff(newStaff);
                        }}
                        className="px-2.5 py-1 text-xs border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer bg-white"
                      >
                        Đổi người
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>05/10/2023 - 14:00 - 17:00</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {surveyStaff.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{surveyStaff}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khảo sát viên</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold border border-green-100">
                        ĐÃ HOÀN THÀNH
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Phân công nhân sự thi công */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 text-sm">Phân công nhân sự thi công</h3>
                      <button 
                        onClick={() => setShowAddStaffModal(true)}
                        className="px-2.5 py-1 text-xs text-[#2563EB] hover:bg-blue-50 font-bold rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Phân công
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>02/11/2023 - Ca sáng (06:00 - 12:00)</span>
                    </div>

                    <div className="divide-y divide-slate-50 space-y-2.5">
                      {constructionStaffList.map((staff, idx) => (
                        <div key={idx} className="flex items-center justify-between pt-2.5 first:pt-0">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                              {staff.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{staff.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{staff.role}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            staff.statusType === 'ready' 
                              ? 'bg-green-50 text-green-700 border-green-100' 
                              : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {staff.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Yêu cầu thay đổi từ hiện trường */}
                  <div className="bg-[#FFFBEB] border border-amber-200 rounded-2xl p-5 space-y-4 shadow-3xs">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-amber-900 text-sm">Yêu cầu thay đổi từ hiện trường</h4>
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                          Khách hàng yêu cầu thêm 02 loa Monitor cho ban nhạc. Dự kiến phụ thu: <strong className="text-amber-950">500.000đ</strong>.
                        </p>
                      </div>
                    </div>

                    {acceptedChangeRequest === null ? (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            setAcceptedChangeRequest(false);
                          }}
                          className="w-full py-1.5 bg-white border border-amber-200 hover:bg-amber-50 text-amber-800 font-semibold rounded-lg text-xs cursor-pointer text-center"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => {
                            setAcceptedChangeRequest(true);
                            // Simulating adding 500k to the order's total
                            if (activeOrder) {
                              activeOrder.totalAmount += 500000;
                            }
                          }}
                          className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs cursor-pointer text-center shadow-2xs"
                        >
                          Chấp thuận
                        </button>
                      </div>
                    ) : acceptedChangeRequest === true ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5 animate-fade-in">
                        <span>✓ Đã chấp thuận thay đổi. Phụ thu +500.000đ được tự động đồng bộ vào hợp đồng.</span>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-1.5 animate-fade-in">
                        <span>✗ Đã từ chối yêu cầu thay đổi hiện trường.</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* Add Staff Modal overlay */}
              {showAddStaffModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-3xs flex items-center justify-center z-50 p-4 text-sm">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-100 p-5 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h4 className="font-black text-slate-800 text-sm">Phân công thêm nhân sự</h4>
                      <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-bold">Họ và tên nhân viên</label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Hoàng Văn Định"
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-500 font-bold">Vị trí đảm nhiệm</label>
                        <select
                          value={newStaffRole}
                          onChange={(e) => setNewStaffRole(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white font-medium focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="KỸ THUẬT VIÊN">KỸ THUẬT VIÊN</option>
                          <option value="KỸ THUẬT ÂM THANH">KỸ THUẬT ÂM THANH</option>
                          <option value="KỸ THUẬT ÁNH SÁNG">KỸ THUẬT ÁNH SÁNG</option>
                          <option value="TRƯỞNG NHÓM THI CÔNG">TRƯỞNG NHÓM THI CÔNG</option>
                          <option value="DECORATOR CHI TIẾT">DECORATOR CHI TIẾT</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                      <button
                        onClick={() => setShowAddStaffModal(false)}
                        className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                      >
                        Huỷ
                      </button>
                      <button
                        onClick={() => {
                          if (!newStaffName) {
                            alert("Vui lòng nhập tên nhân viên.");
                            return;
                          }
                          setConstructionStaffList(prev => [
                            ...prev,
                            { name: newStaffName, role: newStaffRole, status: 'SẴN SÀNG', statusType: 'ready' }
                          ]);
                          setNewStaffName('');
                          setShowAddStaffModal(false);
                        }}
                        className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                      >
                        Thêm phân công
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Inventory & Picklist */}
          {activeTab === 'inventory' && (() => {
            const defaultPickListItems = [
              { itemId: 'INV-001', itemName: 'Đèn Moving Head Beam 230W', unit: 'Cái', requestedQty: 12, availableQty: 15, preparedQty: 12, notes: 'Kiểm tra bóng và cổ xoay kỹ' },
              { itemId: 'INV-002', itemName: 'Khung Truss nhôm hộp 300x300mm', unit: 'Mét', requestedQty: 15, availableQty: 15, preparedQty: 15, notes: 'Truss nhôm dài 2m x 7 cây, 1m x 1 cây' },
              { itemId: 'INV-003', itemName: 'Micro không dây', unit: 'Bộ', requestedQty: 4, availableQty: 2, preparedQty: 0, notes: 'Cần thuê ngoài' },
              { itemId: 'INV-004', itemName: 'Máy phun khói', unit: 'Cái', requestedQty: 2, availableQty: 1, preparedQty: 1, notes: 'Ưu tiên lấy tại kho Q7' }
            ];

            const computedItems = defaultPickListItems.map(item => {
              const missingQty = Math.max(0, item.requestedQty - item.availableQty);
              let status = 'Đủ hàng';
              if (item.availableQty < item.requestedQty) {
                if (item.preparedQty > 0) {
                  status = 'Chuẩn bị một phần';
                } else {
                  status = 'Thiếu hàng';
                }
              } else {
                status = 'Đủ hàng';
              }
              return { ...item, missingQty, status };
            });

            const filteredInvItems = computedItems.filter(item => {
              // Search
              const matchesSearch = item.itemName.toLowerCase().includes(invSearchQuery.toLowerCase()) || 
                                    item.notes.toLowerCase().includes(invSearchQuery.toLowerCase());
              
              // Status filter: Tất cả / Đủ hàng / Thiếu hàng / Đã chuẩn bị
              let matchesStatus = true;
              if (invStatusSelection === 'Đủ hàng') {
                matchesStatus = item.status === 'Đủ hàng';
              } else if (invStatusSelection === 'Thiếu hàng') {
                matchesStatus = item.status === 'Thiếu hàng';
              } else if (invStatusSelection === 'Đã chuẩn bị') {
                matchesStatus = item.preparedQty === item.requestedQty;
              }

              // Checkbox 1: Chỉ hiện vật tư thiếu
              const matchesOnlyMissing = !invOnlyMissing || item.missingQty > 0;

              // Checkbox 2: Chỉ hiện vật tư chưa chuẩn bị đủ
              const matchesOnlyNotFullyPrepared = !invOnlyNotFullyPrepared || item.preparedQty < item.requestedQty;

              return matchesSearch && matchesStatus && matchesOnlyMissing && matchesOnlyNotFullyPrepared;
            });

            // Find overall missing items to show in the alert box
            const overallMissingItems = computedItems.filter(it => it.missingQty > 0);

            return (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
                {/* Header nội dung tab */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-950 text-lg">Tồn kho & Picklist</h3>
                    <p className="text-slate-500 text-xs mt-0.5 font-medium">
                      Kiểm tra khả dụng vật tư theo ngày sự kiện và theo dõi phiếu picklist chuẩn bị cho đơn hàng.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onNavigate('inventory-availability', 'inventory')}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 bg-white"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Kiểm tra tồn kho theo ngày
                    </button>
                    <button
                      onClick={() => {
                        setInvNotification("Đã đồng bộ dữ liệu tồn kho hiện tại và cập nhật phiếu Picklist PICK-001 thành công!");
                        setTimeout(() => setInvNotification(null), 5000);
                      }}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shadow-blue-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tạo / Cập nhật Picklist
                    </button>
                  </div>
                </div>

                {/* Toast Notification area */}
                {invNotification && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between transition-all animate-pulse">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{invNotification}</span>
                    </div>
                    <button onClick={() => setInvNotification(null)} className="text-emerald-500 hover:text-emerald-700 font-bold p-1 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Hàng summary card */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Tổng vật tư yêu cầu */}
                  <div className="bg-slate-50/50 p-4 border border-slate-200/80 rounded-xl flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0 border border-slate-200/60">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 leading-tight">24</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Tổng vật tư yêu cầu</p>
                    </div>
                  </div>

                  {/* Card 2: Đủ hàng */}
                  <div className="bg-emerald-50/20 p-4 border border-emerald-100/80 rounded-xl flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 border border-emerald-100">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-emerald-600 leading-tight">20</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Đủ hàng</p>
                    </div>
                  </div>

                  {/* Card 3: Thiếu hàng */}
                  <div className="bg-rose-50/20 p-4 border border-rose-100/80 rounded-xl flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0 border border-rose-100">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-rose-600 leading-tight">2</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Thiếu hàng</p>
                    </div>
                  </div>

                  {/* Card 4: Đã chuẩn bị */}
                  <div className="bg-blue-50/20 p-4 border border-blue-100/80 rounded-xl flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-100">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-blue-600 leading-tight">18</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Đã chuẩn bị</p>
                    </div>
                  </div>
                </div>

                {/* Card “Thông tin Picklist” */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Thông tin Picklist hiện tại</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D]">
                        Picked
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-400">Mã picklist:</span> <strong className="text-slate-800">PICK-001</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Ngày cần chuẩn bị:</span> <strong className="text-slate-800">13/07/2026</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Phụ trách:</span> <strong className="text-slate-800">Vũ Quốc Bảo</strong>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      <span className="text-slate-400 font-normal">Ghi chú:</span> Chuẩn bị trước 1 ngày, kiểm tra đèn và phụ kiện treo.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                    <button
                      onClick={() => {
                        alert("Chi tiết Phiếu Picklist PICK-001:\n- Người phụ trách: Vũ Quốc Bảo\n- Ngày hẹn chuẩn bị: 13/07/2026\n- Trạng thái: Picked (Đã lấy hàng)\n- Ghi chú: Chuẩn bị trước 1 ngày, kiểm tra kỹ lưỡng\n- Tổng số dòng thiết bị: 4");
                      }}
                      className="flex-1 md:flex-none px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 bg-white"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => {
                        setInvNotification("Đã gửi lệnh xuất in phiếu PICK-001 đến máy in bộ phận kho thành công!");
                        setTimeout(() => setInvNotification(null), 5000);
                      }}
                      className="flex-1 md:flex-none px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 bg-white"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-400" />
                      In Picklist
                    </button>
                    <button
                      onClick={() => {
                        setInvNotification("Đang kết nối kho để đồng bộ & kiểm tra cập nhật lại trạng thái vật tư...");
                        setTimeout(() => {
                          setInvNotification("Cập nhật đồng bộ phiếu xuất kho PICK-001 với tồn kho thời gian thực hoàn tất!");
                        }, 1200);
                        setTimeout(() => setInvNotification(null), 6000);
                      }}
                      className="flex-1 md:flex-none px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 bg-white"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      Cập nhật
                    </button>
                  </div>
                </div>

                {/* Filter bar */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    {/* Search input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={invSearchQuery}
                        onChange={(e) => setInvSearchQuery(e.target.value)}
                        placeholder="Tìm vật tư / thiết bị..."
                        className="w-full bg-white pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {invSearchQuery && (
                        <button onClick={() => setInvSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Dropdown trạng thái */}
                    <div className="w-full md:w-56 flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Trạng thái:</span>
                      <select
                        value={invStatusSelection}
                        onChange={(e) => setInvStatusSelection(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Tất cả">Tất cả</option>
                        <option value="Đủ hàng">Đủ hàng</option>
                        <option value="Thiếu hàng">Thiếu hàng</option>
                        <option value="Đã chuẩn bị">Đã chuẩn bị</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-slate-200/50">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={invOnlyMissing}
                        onChange={(e) => setInvOnlyMissing(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 font-semibold">Chỉ hiện vật tư thiếu</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={invOnlyNotFullyPrepared}
                        onChange={(e) => setInvOnlyNotFullyPrepared(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 font-semibold">Chỉ hiện vật tư chưa chuẩn bị đủ</span>
                    </label>
                  </div>
                </div>

                {/* Bảng vật tư */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          <th className="px-5 py-3">Tên vật tư / thiết bị</th>
                          <th className="px-5 py-3 text-center">Đơn vị</th>
                          <th className="px-5 py-3 text-center">Yêu cầu</th>
                          <th className="px-5 py-3 text-center">Khả dụng</th>
                          <th className="px-5 py-3 text-center">Đã chuẩn bị</th>
                          <th className="px-5 py-3 text-center">Thiếu</th>
                          <th className="px-5 py-3">Trạng thái</th>
                          <th className="px-5 py-3">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                        {filteredInvItems.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-10 text-slate-400 font-semibold">
                              Không tìm thấy vật tư / thiết bị nào phù hợp bộ lọc.
                            </td>
                          </tr>
                        ) : (
                          filteredInvItems.map((item, index) => {
                            let badgeStyle = "bg-[#DCFCE7] text-[#15803D]"; // Đủ hàng
                            if (item.status === "Thiếu hàng") {
                              badgeStyle = "bg-[#FEE2E2] text-[#B91C1C]";
                            } else if (item.status === "Chuẩn bị một phần") {
                              badgeStyle = "bg-[#FEF9C3] text-[#A16207]";
                            }

                            return (
                              <tr key={item.itemId || index} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-3.5 font-bold text-slate-900">{item.itemName}</td>
                                <td className="px-5 py-3.5 text-center text-slate-400 font-bold">{item.unit}</td>
                                <td className="px-5 py-3.5 text-center text-slate-900 font-bold">{item.requestedQty}</td>
                                <td className="px-5 py-3.5 text-center font-bold text-blue-600">{item.availableQty}</td>
                                <td className="px-5 py-3.5 text-center text-emerald-600 font-bold">{item.preparedQty}</td>
                                <td className={`px-5 py-3.5 text-center font-bold ${item.missingQty > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                  {item.missingQty}
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${badgeStyle}`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-slate-500 italic max-w-xs truncate" title={item.notes}>
                                  {item.notes}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Alert thiếu hàng */}
                {overallMissingItems.length > 0 && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-800 font-bold text-sm">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <h4>Có {overallMissingItems.length} vật tư đang thiếu</h4>
                      </div>
                      <div className="pl-5.5 text-xs text-rose-700 space-y-0.5">
                        {overallMissingItems.map((item, idx) => (
                          <p key={item.itemId || idx} className="font-semibold">
                            • {item.itemName}: <span className="font-bold underline">thiếu {item.missingQty} {item.unit}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                      <button
                        onClick={() => {
                          setInvNotification("Đang mở màn hình cấu hình danh mục Picklist...");
                          setTimeout(() => setInvNotification(null), 3000);
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 border border-rose-200 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-lg transition-colors cursor-pointer bg-white"
                      >
                        Điều chỉnh picklist
                      </button>
                      <button
                        onClick={() => {
                          alert("Gửi đề xuất thuê ngoài thành công cho các vật tư thiếu!\nYêu cầu đang được liên kết với phòng Mua sắm (Procurement).");
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs shadow-rose-100"
                      >
                        Đề xuất thuê ngoài
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Tab History Log */}
          {activeTab === 'history' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-50">Timeline lịch sử trạng thái</h3>
              
              <div className="relative border-l border-gray-100 ml-3 pl-6 space-y-6 text-xs">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  <p className="font-bold text-gray-800">Khách hàng xác nhận báo giá phương án v1.2</p>
                  <p className="text-gray-400 mt-0.5">2026-06-15 14:00 | Thực hiện bởi Nguyễn Văn Hải</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></span>
                  <p className="font-bold text-gray-800">Yêu cầu thanh toán cọc DEP-001 được khởi tạo và gửi link</p>
                  <p className="text-gray-400 mt-0.5">2026-06-12 11:00 | Thực hiện bởi Manager Binh</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-3 h-3 bg-gray-300 border-2 border-white rounded-full"></span>
                  <p className="font-bold text-gray-800">Báo giá nháp QUO-001 được cập nhật phiên bản v1.2</p>
                  <p className="text-gray-400 mt-0.5">2026-06-12 10:30 | Thực hiện bởi Manager Binh</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-3 h-3 bg-gray-300 border-2 border-white rounded-full"></span>
                  <p className="font-bold text-gray-800">Khởi tạo hợp đồng ban đầu {activeOrder.id}</p>
                  <p className="text-gray-400 mt-0.5">2026-06-10 09:00 | Hệ thống tự động kích hoạt</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cancel Order Modal embeds */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden text-sm">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-rose-50">
                <h3 className="text-lg font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-5 h-5 text-rose-500" /> Hủy bỏ đơn hàng & Giải phóng kho
                </h3>
                <button onClick={() => setShowCancelModal(false)} className="p-1 hover:bg-rose-100 rounded text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCancelOrderSubmit} className="p-6 space-y-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-xs leading-relaxed font-semibold">
                  Cảnh báo: Việc hủy bỏ đơn hàng sẽ tự động giải phóng tất cả lịch khảo sát, thi công của nhân viên, hoàn lại 100% thiết bị giữ chỗ về kho tổng. Vui lòng kiểm tra lại chính sách hoàn cọc.
                </div>

                <div className="space-y-1">
                  <p><strong>Mã đơn hàng:</strong> {activeOrder.id}</p>
                  <p><strong>Khách hàng:</strong> {activeOrder.customerName}</p>
                  <p><strong>Ngày sự kiện:</strong> {activeOrder.eventDate}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Lý do hủy đơn <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    placeholder="Bắt buộc nhập lý do khách quan/chủ quan hủy hợp đồng..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  ></textarea>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer font-medium text-xs text-gray-600 leading-relaxed select-none">
                  <input
                    type="checkbox"
                    required
                    checked={confirmCancelCheckbox}
                    onChange={(e) => setConfirmCancelCheckbox(e.target.checked)}
                    className="text-red-500 focus:ring-red-500 h-4 w-4 mt-0.5 rounded"
                  />
                  <span>Tôi xác nhận hủy đơn, đồng ý thực hiện theo đúng chính sách đền bù/hoàn cọc và giải phóng thiết bị đã giữ.</span>
                </label>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-5">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    Giữ lại đơn (Không hủy)
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Xác nhận hủy đơn hàng
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. CREATE / EDIT ORDER FORM
  if (currentRoute === 'order-create') {
    // Find details of the selected customer
    const selectedCustomerDetails = customers.find(c => c.id === formCustomerId);

    return (
      <div id="order-create-view" className="space-y-6 max-w-4xl mx-auto pb-12 text-sm text-gray-700">
        
        {/* Header bar with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {editMode ? `Sửa thông tin đơn hàng ${selectedOrderId}` : 'Tạo đơn hàng'}
            </h1>
            <p className="text-gray-500 text-xs mt-1">Khởi tạo và quản lý hồ sơ thông tin sự kiện một cách chi tiết.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setCurrentRoute('orders')}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                if (!formCustomerId) {
                  alert("Vui lòng chọn khách hàng liên kết.");
                  return;
                }
                alert("Đã lưu nháp hồ sơ đơn hàng thành công!");
                setCurrentRoute('orders');
              }}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Lưu nháp
            </button>
            <button
              type="button"
              onClick={(e) => {
                // Manually trigger the form submit
                const formEl = document.getElementById('order-submit-form') as HTMLFormElement;
                if (formEl) formEl.requestSubmit();
              }}
              className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs shadow-blue-100"
            >
              Lưu đơn hàng
            </button>
          </div>
        </div>

        {/* Main form */}
        <form 
          id="order-submit-form" 
          onSubmit={(e) => {
            e.preventDefault();
            if (!formCustomerId) {
              alert("Vui lòng chọn khách hàng.");
              return;
            }
            if (!formEventDate) {
              alert("Vui lòng chọn ngày tổ chức.");
              return;
            }
            if (!formLocation) {
              alert("Vui lòng nhập địa điểm tổ chức.");
              return;
            }
            // If eventName is empty, construct a nice default
            const custName = selectedCustomerDetails ? selectedCustomerDetails.name : 'Khách hàng';
            const finalEventName = formEventName || `Sự kiện ${formEventType} - ${custName}`;
            
            // Call the standard save logic
            handleSaveOrder(e);
          }} 
          className="space-y-6"
        >
          {/* Section 1: Thông tin khách hàng */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-50">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <User className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Thông tin khách hàng</h3>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="space-y-1.5 flex-1 w-full">
                  <label className="font-bold text-gray-700 text-xs block">Khách hàng <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] bg-white font-medium text-xs text-gray-800"
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    // Quick modal/prompt to add new customer
                    const cName = prompt("Nhập họ và tên khách hàng mới:");
                    if (cName) {
                      const cPhone = prompt("Nhập số điện thoại khách hàng:");
                      const cEmail = prompt("Nhập địa chỉ Email khách hàng:") || `${cName.toLowerCase().replace(/\s/g, '')}@example.com`;
                      const cAddr = prompt("Nhập địa chỉ nhà riêng:") || "Hà Nội";
                      
                      const newCustId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
                      const newCust: Customer = {
                        id: newCustId,
                        name: cName,
                        phone: cPhone || '0987 654 321',
                        email: cEmail,
                        address: cAddr,
                        status: 'Active',
                        ordersCount: 0,
                        lastOrderDate: new Date().toISOString().split('T')[0],
                        notes: 'Tự động tạo từ biểu mẫu đơn hàng'
                      };
                      // Push to customers state (it will be saved to memory list)
                      customers.push(newCust);
                      setFormCustomerId(newCustId);
                      alert(`Đã thêm khách hàng ${cName} thành công!`);
                    }
                  }}
                  className="px-4 py-2.5 border border-blue-200 hover:bg-blue-50 text-[#2563EB] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 bg-white h-9 sm:h-auto w-full sm:w-auto flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Tạo khách hàng
                </button>
              </div>

              {/* Blue quick customer info card if a customer is selected */}
              {selectedCustomerDetails ? (
                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4.5 space-y-3.5 animate-fade-in text-xs font-medium text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Số điện thoại</span>
                      <span className="text-slate-900 font-bold mt-1 block">{selectedCustomerDetails.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Email</span>
                      <span className="text-slate-900 font-bold mt-1 block truncate">{selectedCustomerDetails.email}</span>
                    </div>
                    <div className="sm:col-span-1 md:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Địa chỉ</span>
                      <span className="text-slate-900 font-bold mt-1 block truncate" title={selectedCustomerDetails.address}>
                        {selectedCustomerDetails.address}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Trạng thái hoạt động</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] border border-green-100 inline-block mt-1">
                        Hoạt động
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#F8FAFC] border border-slate-200/60 rounded-xl p-6 text-center text-xs text-slate-400 font-semibold italic">
                  Vui lòng chọn một khách hàng liên kết để hiển thị thông tin hồ sơ liên lạc.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Thông tin đơn hàng */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-50">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Package className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Thông tin đơn hàng</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event type dropdown */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 text-xs block">Loại sự kiện <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formEventType}
                    onChange={(e) => setFormEventType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] bg-white font-semibold text-xs text-gray-700"
                  >
                    <option value="">Chọn loại sự kiện...</option>
                    <option value="Tiệc Cưới Trọn Gói">Tiệc Cưới Trọn Gói</option>
                    <option value="Tiệc Cưới Cao Cấp">Tiệc Cưới Cao Cấp</option>
                    <option value="Kỷ Niệm Ngày Cưới">Kỷ Niệm Ngày Cưới</option>
                    <option value="Tiệc Đính Hôn">Tiệc Đính Hôn</option>
                    <option value="Hội Nghị Khách Hàng">Hội Nghị Khách Hàng</option>
                  </select>
                </div>

                {/* Optional editable event name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 text-xs block">Tên sự kiện / Ghi danh hợp đồng</label>
                  <input
                    type="text"
                    placeholder="Nhập tên sự kiện (ví dụ: Đám cưới Thảo & Phong)"
                    value={formEventName}
                    onChange={(e) => setFormEventName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organise date */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 text-xs block">Ngày tổ chức <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-semibold text-gray-700"
                  />
                </div>

                {/* End date */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 text-xs block">Ngày kết thúc <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formEventDate ? (formEventDate) : ''}
                    onChange={(e) => {}} // Simple synced date
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-semibold text-gray-700 bg-slate-50 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 text-xs block">Tên địa điểm <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên nhà hàng, trung tâm..."
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-semibold text-gray-800 placeholder-slate-400"
                  />
                </div>

                {/* Guest count */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 text-xs block">Số lượng khách</label>
                  <input
                    type="number"
                    min="10"
                    placeholder="Nhập số lượng khách dự kiến"
                    value={formGuestCount}
                    onChange={(e) => setFormGuestCount(parseInt(e.target.value) || 200)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-semibold text-gray-700"
                  />
                </div>
              </div>

              {/* Initial notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 text-xs block">Ghi chú yêu cầu ban đầu</label>
                <textarea
                  placeholder="Yêu cầu riêng biệt về hoa tươi, phụ kiện treo, màu chủ đạo..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-xs resize-none placeholder-slate-400 font-medium leading-relaxed"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setCurrentRoute('orders')}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs shadow-blue-100"
            >
              {editMode ? 'Lưu cập nhật' : 'Tạo đơn hàng'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return null;
}
