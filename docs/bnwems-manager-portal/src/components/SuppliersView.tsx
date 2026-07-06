import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  User, 
  Phone, 
  MapPin, 
  Star, 
  DollarSign, 
  Clipboard, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Truck,
  Briefcase
} from 'lucide-react';
import { Supplier, ProcurementRequest, Order } from '../mockData';

interface SuppliersViewProps {
  orders: Order[];
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  procurements: ProcurementRequest[];
  setProcurements: React.Dispatch<React.SetStateAction<ProcurementRequest[]>>;
  onNavigate: (route: string, menu: string) => void;
}

export default function SuppliersView({
  orders,
  suppliers,
  setSuppliers,
  procurements,
  setProcurements,
  onNavigate,
}: SuppliersViewProps) {
  
  // Tab within: 'suppliers' | 'procurements'
  const [activeSubTab, setActiveSubTab] = useState<'suppliers' | 'procurements'>('suppliers');

  // Supplier Search & filter states
  const [supSearch, setSupSearch] = useState('');
  const [supCategory, setSupCategory] = useState('All');

  // Procurement Search & filter states
  const [proSearch, setProSearch] = useState('');

  // Supplier Modal States
  const [showSupModal, setShowSupModal] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);
  const [formSupName, setFormSupName] = useState('');
  const [formSupService, setFormSupService] = useState('Hoa tươi nhập khẩu');
  const [formSupPhone, setFormSupPhone] = useState('');
  const [formSupEmail, setFormSupEmail] = useState('');
  const [formSupAddress, setFormSupAddress] = useState('');
  const [formSupRating, setFormSupRating] = useState(5);
  const [formSupStatus, setFormSupStatus] = useState<'Active' | 'Inactive'>('Active');

  // Procurement Modal States
  const [showProModal, setShowProModal] = useState(false);
  const [editingPro, setEditingPro] = useState<ProcurementRequest | null>(null);
  const [formProOrderId, setFormProOrderId] = useState('');
  const [formProSupplierId, setFormProSupplierId] = useState('');
  const [formProServiceTitle, setFormProServiceTitle] = useState('');
  const [formProCost, setFormProCost] = useState(0);
  const [formProDeposit, setFormProDeposit] = useState(0);
  const [formProStatus, setFormProStatus] = useState<'Waiting for Approval' | 'Approved' | 'In Progress' | 'Completed' | 'Cancelled'>('Waiting for Approval');
  const [formProNotes, setFormProNotes] = useState('');

  // 1. SAVE SUPPLIER
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupName || !formSupPhone) {
      alert("Vui lòng điền đủ thông tin Nhà cung cấp.");
      return;
    }

    if (editingSup) {
      setSuppliers(prev => prev.map(s => s.id === editingSup.id ? {
        ...s,
        name: formSupName,
        serviceType: formSupService,
        phone: formSupPhone,
        email: formSupEmail,
        address: formSupAddress,
        rating: formSupRating,
        status: formSupStatus
      } : s));
      alert("Cập nhật Nhà cung cấp thành công!");
    } else {
      const newId = `SUP-${String(suppliers.length + 1).padStart(3, '0')}`;
      const newSup: Supplier = {
        id: newId,
        name: formSupName,
        serviceType: formSupService,
        phone: formSupPhone,
        email: formSupEmail,
        address: formSupAddress,
        rating: formSupRating,
        status: formSupStatus,
        contactPerson: '',
        notes: ''
      };
      setSuppliers(prev => [...prev, newSup]);
      alert("Thêm Nhà cung cấp mới thành công!");
    }
    setShowSupModal(false);
  };

  // Open Create Supplier
  const handleOpenCreateSup = () => {
    setEditingSup(null);
    setFormSupName('');
    setFormSupService('Hoa tươi sảnh cưới');
    setFormSupPhone('');
    setFormSupEmail('');
    setFormSupAddress('');
    setFormSupRating(5);
    setFormSupStatus('Active');
    setShowSupModal(true);
  };

  // Open Edit Supplier
  const handleOpenEditSup = (sup: Supplier) => {
    setEditingSup(sup);
    setFormSupName(sup.name);
    setFormSupService(sup.serviceType || '');
    setFormSupPhone(sup.phone);
    setFormSupEmail(sup.email);
    setFormSupAddress(sup.address);
    setFormSupRating(sup.rating || 5);
    setFormSupStatus(sup.status);
    setShowSupModal(true);
  };

  // Delete Supplier
  const handleDeleteSup = (id: string) => {
    if (confirm("Xóa nhà cung cấp này khỏi danh sách?")) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  // 2. SAVE PROCUREMENT REQUEST
  const handleSaveProcurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProOrderId || !formProSupplierId || !formProServiceTitle || formProCost <= 0) {
      alert("Vui lòng nhập đầy đủ chi tiết đơn mua sắm.");
      return;
    }

    const supplier = suppliers.find(s => s.id === formProSupplierId);
    const supplierName = supplier ? supplier.name : 'Unknown NCC';

    if (editingPro) {
      setProcurements(prev => prev.map(p => p.id === editingPro.id ? {
        ...p,
        orderId: formProOrderId,
        supplierId: formProSupplierId,
        supplierName,
        serviceTitle: formProServiceTitle,
        estimatedCost: formProCost,
        depositAmount: formProDeposit,
        status: formProStatus as any,
        notes: formProNotes
      } : p));
      alert("Đã cập nhật đơn hàng mua sắm/thuê ngoài!");
    } else {
      const newId = `PRO-${String(procurements.length + 1).padStart(3, '0')}`;
      const newPro: ProcurementRequest = {
        id: newId,
        orderId: formProOrderId,
        supplierId: formProSupplierId,
        supplierName,
        serviceTitle: formProServiceTitle,
        estimatedCost: formProCost,
        depositAmount: formProDeposit,
        status: formProStatus as any,
        notes: formProNotes
      };
      setProcurements(prev => [newPro, ...prev]);
      alert("Khởi tạo yêu cầu mua sắm/thuê ngoài NCC thành công!");
    }
    setShowProModal(false);
  };

  // Open Create Procurement
  const handleOpenCreatePro = () => {
    setEditingPro(null);
    setFormProOrderId(orders[0]?.id || '');
    setFormProSupplierId(suppliers[0]?.id || '');
    setFormProServiceTitle('');
    setFormProCost(5000000);
    setFormProDeposit(1500000);
    setFormProStatus('Waiting for Approval');
    setFormProNotes('');
    setShowProModal(true);
  };

  // Open Edit Procurement
  const handleOpenEditPro = (pro: ProcurementRequest) => {
    setEditingPro(pro);
    setFormProOrderId(pro.orderId);
    setFormProSupplierId(pro.supplierId);
    setFormProServiceTitle(pro.serviceTitle);
    setFormProCost(pro.estimatedCost);
    setFormProDeposit(pro.depositAmount);
    setFormProStatus(pro.status as any);
    setFormProNotes(pro.notes);
    setShowProModal(true);
  };

  // Delete Procurement
  const handleDeletePro = (id: string) => {
    if (confirm("Hủy đơn mua sắm/thuê ngoài NCC này?")) {
      setProcurements(prev => prev.filter(p => p.id !== id));
    }
  };

  // Filter lists
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(supSearch.toLowerCase()) ||
                          (s.serviceType || '').toLowerCase().includes(supSearch.toLowerCase());
    const matchesCategory = supCategory === 'All' ? true : (s.serviceType || '').includes(supCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredProcurements = procurements.filter(p => {
    return p.supplierName.toLowerCase().includes(proSearch.toLowerCase()) ||
           p.serviceTitle.toLowerCase().includes(proSearch.toLowerCase()) ||
           p.orderId.toLowerCase().includes(proSearch.toLowerCase());
  });

  // KPIs
  const activeSuns = suppliers.filter(s => s.status === 'Active').length;

  return (
    <div id="suppliers-view" className="space-y-6">
      
      {/* Tab Switcher Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('suppliers')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'suppliers' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="w-4.5 h-4.5" />
            Danh sách nhà cung cấp
          </button>
          <button
            onClick={() => setActiveSubTab('procurements')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'procurements' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Truck className="w-4.5 h-4.5" />
            Đơn mua sắm / Thuê NCC
          </button>
        </div>

        <div>
          {activeSubTab === 'suppliers' && (
            <button
              onClick={handleOpenCreateSup}
              className="flex items-center gap-1 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2.5 rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm Nhà cung cấp
            </button>
          )}
          {activeSubTab === 'procurements' && (
            <button
              onClick={handleOpenCreatePro}
              className="flex items-center gap-1 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2.5 rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Khởi tạo đơn mua sắm
            </button>
          )}
        </div>
      </div>

      {/* SUB TAB 1: SUPPLIER DIRECTORY */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-6 animate-fade-in">
          {/* Supplier KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-sm">
              <span className="text-xs text-gray-400 font-bold block uppercase">Đối tác liên kết</span>
              <span className="text-xl font-bold text-gray-800 mt-1 block">{suppliers.length} NCC</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500 text-sm">
              <span className="text-xs text-gray-400 font-bold block uppercase">Đang hoạt động (Active)</span>
              <span className="text-xl font-bold text-green-600 mt-1 block">{activeSuns} đối tác</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500 text-sm">
              <span className="text-xs text-gray-400 font-bold block uppercase">Xếp hạng 5 sao</span>
              <span className="text-xl font-bold text-blue-600 mt-1 block">
                {suppliers.filter(s => s.rating === 5).length} đối tác
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên nhà cung cấp hoặc dịch vụ cung cấp..."
                value={supSearch}
                onChange={(e) => setSupSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <select
                value={supCategory}
                onChange={(e) => setSupCategory(e.target.value)}
                className="px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="All">Tất cả danh mục dịch vụ</option>
                <option value="Hoa">Hoa tươi & Decor</option>
                <option value="Bàn">Sắp đặt bàn ghế</option>
                <option value="Âm thanh">Âm thanh & Ánh sáng</option>
                <option value="Cổng">Cổng hoa sảnh tiệc</option>
                <option value="Mâm quả">Mâm quả trọn gói</option>
              </select>
            </div>
          </div>

          {/* Suppliers Table directory */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                    <th className="px-6 py-4">Mã đối tác</th>
                    <th className="px-6 py-4">Tên nhà cung cấp</th>
                    <th className="px-6 py-4">Dịch vụ cung ứng</th>
                    <th className="px-6 py-4">Điện thoại liên hệ</th>
                    <th className="px-6 py-4">Địa chỉ trụ sở</th>
                    <th className="px-6 py-4 text-center">Đánh giá sao</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {filteredSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/20">
                      <td className="px-6 py-4 font-bold text-[#2563EB]">{s.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{s.name}</td>
                      <td className="px-6 py-4 font-semibold text-gray-600">
                        <span className="bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded text-xs">{s.serviceType}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{s.phone}</td>
                      <td className="px-6 py-4 text-gray-400 font-medium max-w-[200px] truncate">{s.address}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-0.5 text-amber-400">
                          {Array.from({ length: s.rating || 0 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          s.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-400'
                        }`}>{s.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditSup(s)}
                            className="p-1.5 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSup(s.id)}
                            className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: PROCUREMENT REQUESTS */}
      {activeSubTab === 'procurements' && (
        <div className="space-y-6 animate-fade-in text-sm">
          {/* Procurement Table list */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm đơn mua theo mã hợp đồng sự kiện, dịch vụ hoặc nhà cung cấp..."
                value={proSearch}
                onChange={(e) => setProSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                    <th className="px-6 py-4">Mã đơn mua</th>
                    <th className="px-6 py-4">Mã sự kiện liên kết</th>
                    <th className="px-6 py-4">Nhà cung cấp đối tác</th>
                    <th className="px-6 py-4">Hạng mục mua sắm/thuê ngoài</th>
                    <th className="px-6 py-4 text-right">Chi phí ước tính</th>
                    <th className="px-6 py-4 text-right">Chi đặt cọc NCC</th>
                    <th className="px-6 py-4">Trạng thái mua hàng</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {filteredProcurements.map((pro) => (
                    <tr key={pro.id} className="hover:bg-slate-50/20">
                      <td className="px-6 py-4 font-bold text-[#2563EB]">{pro.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-500">{pro.orderId}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{pro.supplierName}</td>
                      <td className="px-6 py-4 font-semibold text-gray-600">{pro.serviceTitle}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-800">
                        {pro.estimatedCost.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[#2563EB]">
                        {pro.depositAmount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          pro.status === 'Paid' || pro.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                          pro.status === 'Rejected' ? 'bg-red-50 text-red-600 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>{pro.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditPro(pro)}
                            className="p-1.5 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePro(pro.id)}
                            className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER PROFILE MODAL */}
      {showSupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs text-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-gray-800 text-base">
                {editingSup ? `Sửa hồ sơ đối tác ${editingSup.id}` : 'Thêm mới Nhà cung cấp'}
              </h3>
              <button onClick={() => setShowSupModal(false)} className="p-1 hover:bg-gray-200 rounded text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="font-semibold text-gray-700 block">Tên nhà cung cấp <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Công ty TNHH Dalat Hasfarm..."
                    value={formSupName}
                    onChange={(e) => setFormSupName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Danh mục cung ứng <span className="text-red-500">*</span></label>
                  <select
                    value={formSupService}
                    onChange={(e) => setFormSupService(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="Hoa tươi & Decor">Hoa tươi & Decor</option>
                    <option value="Mâm quả trọn gói">Mâm quả trọn gói</option>
                    <option value="Bàn ghế & Đồ sứ cao cấp">Bàn ghế & Đồ sứ cao cấp</option>
                    <option value="Âm thanh ánh sáng & LED">Âm thanh ánh sáng & LED</option>
                    <option value="Dịch vụ trang điểm">Dịch vụ trang điểm</option>
                    <option value="MC & Ban nhạc">MC & Ban nhạc</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="0912..."
                    value={formSupPhone}
                    onChange={(e) => setFormSupPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="font-semibold text-gray-700 block">Email liên hệ</label>
                  <input
                    type="email"
                    placeholder="contact@supplier.com..."
                    value={formSupEmail}
                    onChange={(e) => setFormSupEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Địa chỉ trụ sở</label>
                <input
                  type="text"
                  placeholder="Hà Đông, Hà Nội..."
                  value={formSupAddress}
                  onChange={(e) => setFormSupAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Độ xếp hạng sao</label>
                  <select
                    value={formSupRating}
                    onChange={(e) => setFormSupRating(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white font-bold text-amber-500"
                  >
                    <option value="5">★★★★★ (5 Sao)</option>
                    <option value="4">★★★★☆ (4 Sao)</option>
                    <option value="3">★★★☆☆ (3 Sao)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Trạng thái đối tác</label>
                  <select
                    value={formSupStatus}
                    onChange={(e) => setFormSupStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="Active">Liên kết (Active)</option>
                    <option value="Inactive">Ngưng hợp tác (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-5">
                <button
                  type="button"
                  onClick={() => setShowSupModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg cursor-pointer"
                >Hủy bỏ</button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROCUREMENT REQUEST MODAL */}
      {showProModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs text-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-gray-800 text-base">
                {editingPro ? `Sửa đơn mua sắm ${editingPro.id}` : 'Thêm đơn mua sắm/thuê ngoài NCC'}
              </h3>
              <button onClick={() => setShowProModal(false)} className="p-1 hover:bg-gray-200 rounded text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveProcurement} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Hợp đồng sự kiện <span className="text-red-500">*</span></label>
                  <select
                    value={formProOrderId}
                    onChange={(e) => setFormProOrderId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white font-bold"
                  >
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} - {o.customerName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Chọn nhà cung cấp dịch vụ <span className="text-red-500">*</span></label>
                  <select
                    value={formProSupplierId}
                    onChange={(e) => setFormProSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white font-bold text-blue-600"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.serviceType})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Hạng mục thuê mướn/Mua sắm cụ thể <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thuê 20 trụ hoa hồng Đà Lạt trang trí cổng vòm sảnh tiệc"
                  value={formProServiceTitle}
                  onChange={(e) => setFormProServiceTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Chi phí ước tính (đ) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    value={formProCost}
                    onChange={(e) => setFormProCost(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Đặt cọc trước cho NCC (đ)</label>
                  <input
                    type="number"
                    value={formProDeposit}
                    onChange={(e) => setFormProDeposit(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="font-semibold text-gray-700 block">Trạng thái đơn mua sắm</label>
                  <select
                    value={formProStatus}
                    onChange={(e) => setFormProStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="Waiting for Approval">Đợi phê duyệt chi (Waiting for Approval)</option>
                    <option value="Approved">Đã duyệt chi phí (Approved)</option>
                    <option value="In Progress">Đang thực hiện giao (In Progress)</option>
                    <option value="Completed">Hoàn tất hoàn trả (Completed)</option>
                    <option value="Cancelled">Đã hủy bỏ đơn (Cancelled)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Ghi chú bốc xếp, hoàn cọc sắm</label>
                <textarea
                  placeholder="Bao gồm xe tải chở đến gem center lầu 5 trước 10h sáng..."
                  value={formProNotes}
                  onChange={(e) => setFormProNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-5">
                <button
                  type="button"
                  onClick={() => setShowProModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg cursor-pointer"
                >Hủy bỏ</button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >Lưu đơn sắm</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
