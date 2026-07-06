import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  ShoppingBag, 
  ChevronLeft, 
  X, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { Customer, Order } from '../mockData';

interface CustomersViewProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  orders: Order[];
  onNavigate: (route: string, menu: string) => void;
  onSelectCustomer: (customerId: string) => void;
  selectedCustomerId: string | null;
  onSelectOrder: (orderId: string) => void;
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
}

export default function CustomersView({
  customers,
  setCustomers,
  orders,
  onNavigate,
  onSelectCustomer,
  selectedCustomerId,
  onSelectOrder,
  currentRoute,
  setCurrentRoute,
}: CustomersViewProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  // Filtered customer list
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get active customer details
  const activeCustomer = customers.find(c => c.id === selectedCustomerId);
  // Get active customer's orders
  const customerOrders = orders.filter(o => o.customerId === selectedCustomerId);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormNotes('');
    setFormStatus('Active');
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormPhone(cust.phone);
    setFormEmail(cust.email);
    setFormAddress(cust.address);
    setFormNotes(cust.notes);
    setFormStatus(cust.status);
    setShowModal(true);
  };

  // Handle Save (Create or Update)
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      alert("Vui lòng điền họ tên và số điện thoại.");
      return;
    }

    if (editingCustomer) {
      // Edit mode
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? {
        ...c,
        name: formName,
        phone: formPhone,
        email: formEmail,
        address: formAddress,
        notes: formNotes,
        status: formStatus
      } : c));
    } else {
      // Create mode
      const newId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
      const newCust: Customer = {
        id: newId,
        name: formName,
        phone: formPhone,
        email: formEmail,
        address: formAddress,
        notes: formNotes,
        status: formStatus,
        ordersCount: 0,
        lastOrderDate: 'N/A'
      };
      setCustomers(prev => [...prev, newCust]);
    }
    setShowModal(false);
  };

  const handleCreateOrderForCustomer = (cust: Customer) => {
    onSelectCustomer(cust.id);
    onNavigate('order-create', 'orders');
  };

  // Render Customer List
  if (currentRoute === 'customers') {
    return (
      <div id="customers-list-view" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Danh sách khách hàng</h1>
            <p className="text-gray-500 text-sm mt-0.5">Quản lý hồ sơ thông tin và theo dõi lịch sử dịch vụ của khách hàng.</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-100 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo khách hàng
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên khách hàng hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Active">Đang hoạt động (Active)</option>
              <option value="Inactive">Ngừng hoạt động (Inactive)</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                  <th className="px-6 py-4">Mã khách</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Địa chỉ</th>
                  <th className="px-6 py-4 text-center">Đơn hàng</th>
                  <th className="px-6 py-4">Đơn gần nhất</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      Không tìm thấy khách hàng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#2563EB]">{cust.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{cust.name}</div>
                        <div className="text-xs text-gray-400 font-medium">Được quản lý bởi BNWEMS</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {cust.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {cust.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-gray-500">{cust.address}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-md text-xs">{cust.ordersCount}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{cust.lastOrderDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          cust.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}>
                          {cust.status === 'Active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { onSelectCustomer(cust.id); setCurrentRoute('customer-detail'); }}
                            className="p-1.5 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className="p-1.5 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCreateOrderForCustomer(cust)}
                            className="p-1.5 hover:bg-green-50 text-gray-500 hover:text-green-600 rounded-lg transition-colors cursor-pointer"
                            title="Tạo đơn hàng"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="bg-slate-50 px-6 py-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Hiển thị 1-{filteredCustomers.length} của {filteredCustomers.length} khách hàng</span>
            <div className="flex gap-1.5">
              <button disabled className="px-2.5 py-1 bg-white border border-gray-200 rounded text-gray-400 cursor-not-allowed">Trước</button>
              <button className="px-2.5 py-1 bg-[#2563EB] text-white rounded font-bold">1</button>
              <button disabled className="px-2.5 py-1 bg-white border border-gray-200 rounded text-gray-400 cursor-not-allowed">Sau</button>
            </div>
          </div>
        </div>

        {/* Embed Modal */}
        {showModal && renderModal()}
      </div>
    );
  }

  // Render Customer Detail View
  if (currentRoute === 'customer-detail' && activeCustomer) {
    // Total spent computation
    const totalSpent = customerOrders
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const completedOrdersCount = customerOrders.filter(o => o.orderStatus === 'Completed').length;

    return (
      <div id="customer-detail-view" className="space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={() => setCurrentRoute('customers')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 font-semibold text-sm bg-white border border-gray-200 px-3 py-2 rounded-xl hover:shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenEdit(activeCustomer)}
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              <Edit className="w-4 h-4 text-amber-500" />
              Chỉnh sửa thông tin
            </button>
            <button
              onClick={() => handleCreateOrderForCustomer(activeCustomer)}
              className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-blue-100"
            >
              <ShoppingBag className="w-4 h-4" />
              Tạo đơn hàng mới
            </button>
          </div>
        </div>

        {/* Customer banner */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-[#2563EB] rounded-2xl flex items-center justify-center font-bold text-2xl border border-blue-200 shadow-inner">
              {activeCustomer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-800">{activeCustomer.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeCustomer.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                  {activeCustomer.status === 'Active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">Mã định danh: {activeCustomer.id} | Ngày tham gia: 2026</p>
            </div>
          </div>
          
          {/* Spend Summary */}
          <div className="flex gap-6 border-l border-gray-100 pl-6 hidden md:flex">
            <div>
              <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Tổng giá trị chi tiêu</span>
              <span className="text-xl font-bold text-gray-800 mt-0.5 block">{totalSpent.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>

        {/* Grid customer details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card left: Info */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2">Thông tin khách hàng</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <Phone className="w-4.5 h-4.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 block">Số điện thoại</span>
                    <span className="text-gray-700 font-semibold">{activeCustomer.phone}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Mail className="w-4.5 h-4.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 block">Email cá nhân</span>
                    <span className="text-gray-700 font-semibold">{activeCustomer.email}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="w-4.5 h-4.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-gray-400 block">Địa chỉ liên hệ</span>
                    <span className="text-gray-700 font-medium">{activeCustomer.address}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400 block font-semibold mb-1">Ghi chú quản lý</span>
                  <p className="text-xs text-gray-600 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50 italic leading-relaxed">
                    {activeCustomer.notes || 'Không có ghi chú.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats panel */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <span className="text-gray-400 text-xs block font-bold">Tổng đơn</span>
                <span className="text-xl font-bold text-gray-800 mt-1 block">{customerOrders.length}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <span className="text-gray-400 text-xs block font-bold">Hoàn thành</span>
                <span className="text-xl font-bold text-green-600 mt-1 block">{completedOrdersCount}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <span className="text-gray-400 text-xs block font-bold">Huỷ bỏ</span>
                <span className="text-xl font-bold text-red-500 mt-1 block">
                  {customerOrders.filter(o => o.orderStatus === 'Cancelled').length}
                </span>
              </div>
            </div>
          </div>

          {/* Card right: Order History */}
          <div className="md:col-span-7">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-50 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                Lịch sử đơn hàng của khách hàng
              </h3>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 uppercase font-bold">
                      <th className="px-4 py-3">Mã đơn</th>
                      <th className="px-4 py-3">Loại sự kiện</th>
                      <th className="px-4 py-3">Ngày sự kiện</th>
                      <th className="px-4 py-3">Giá trị</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Xem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {customerOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-400">
                          Khách hàng này chưa có đơn hàng nào khởi tạo.
                        </td>
                      </tr>
                    ) : (
                      customerOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-[#2563EB]">{order.id}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-800">{order.eventType}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]">{order.location}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-500">{order.eventDate}</td>
                          <td className="px-4 py-3 font-bold text-gray-800">{order.totalAmount.toLocaleString('vi-VN')} đ</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.orderStatus === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                              order.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-200' :
                              order.orderStatus === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                              'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => { onSelectOrder(order.id); onNavigate('order-detail', 'orders'); }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal embeds */}
        {showModal && renderModal()}
      </div>
    );
  }

  return null;

  // Render modal component
  function renderModal() {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
          {/* Title */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
            <h2 className="text-lg font-bold text-gray-800">
              {editingCustomer ? 'Chỉnh sửa thông tin khách hàng' : 'Thêm mới đối tác khách hàng'}
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveCustomer} className="p-6 space-y-4 flex-1 overflow-y-auto text-sm">
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 block">Họ và tên khách hàng <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nguyễn Thị Hoa"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Số điện thoại <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  placeholder="0912xxxxxx"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Email</label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 block">Địa chỉ liên hệ</label>
              <input
                type="text"
                placeholder="Số nhà, Tên đường, Quận, Thành phố..."
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 block">Ghi chú quản lý</label>
              <textarea
                placeholder="Yêu cầu đặc biệt, sở thích hoa hoặc decor..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-gray-700 block">Trạng thái hoạt động</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    checked={formStatus === 'Active'}
                    onChange={() => setFormStatus('Active')}
                    className="text-[#2563EB] focus:ring-[#2563EB] h-4 w-4"
                  />
                  Đang hoạt động (Active)
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    checked={formStatus === 'Inactive'}
                    onChange={() => setFormStatus('Inactive')}
                    className="text-[#2563EB] focus:ring-[#2563EB] h-4 w-4"
                  />
                  Ngừng hoạt động (Inactive)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm cursor-pointer"
              >
                {editingCustomer ? 'Cập nhật' : 'Lưu khách hàng'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
