import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  CheckCircle, 
  Trash2, 
  Edit, 
  DollarSign, 
  User, 
  Calendar, 
  Briefcase, 
  X, 
  Clock, 
  Check 
} from 'lucide-react';
import { WageRecord, Order } from '../mockData';

interface WagesViewProps {
  orders: Order[];
  wages: WageRecord[];
  setWages: React.Dispatch<React.SetStateAction<WageRecord[]>>;
}

export default function WagesView({
  orders,
  wages,
  setWages,
}: WagesViewProps) {
  
  // List filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal creation states
  const [showWageModal, setShowWageModal] = useState(false);
  const [editingWage, setEditingWage] = useState<WageRecord | null>(null);
  const [formWageOrderId, setFormWageOrderId] = useState('');
  const [formWageStaffName, setFormWageStaffName] = useState('');
  const [formWageRole, setFormWageRole] = useState('Setup Nhân sự');
  const [formWageShifts, setFormWageShifts] = useState(1);
  const [formWageRate, setFormWageRate] = useState(300000);
  const [formWageStatus, setFormWageStatus] = useState<'Draft' | 'Pending Approval' | 'Confirmed' | 'Paid'>('Draft');
  const [formWageNotes, setFormWageNotes] = useState('');

  // Save wage record
  const handleSaveWage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWageOrderId || !formWageStaffName || formWageRate <= 0) {
      alert("Vui lòng điền đầy đủ dữ liệu ghi công.");
      return;
    }

    const totalAmount = formWageShifts * formWageRate;

    if (editingWage) {
      setWages(prev => prev.map(w => w.id === editingWage.id ? {
        ...w,
        orderId: formWageOrderId,
        staffName: formWageStaffName,
        role: formWageRole,
        shifts: formWageShifts,
        wageRate: formWageRate,
        totalWage: totalAmount,
        status: formWageStatus,
        notes: formWageNotes
      } : w));
      alert("Cập nhật phiếu công lương thành công!");
    } else {
      const newId = `WAG-${String(wages.length + 1).padStart(3, '0')}`;
      const newWage: WageRecord = {
        id: newId,
        orderId: formWageOrderId,
        staffName: formWageStaffName,
        role: formWageRole,
        shifts: formWageShifts,
        wageRate: formWageRate,
        totalWage: totalAmount,
        status: formWageStatus,
        notes: formWageNotes
      };
      setWages(prev => [newWage, ...prev]);
      alert("Đã ghi nhận ngày công mới cho nhân sự!");
    }
    setShowWageModal(false);
  };

  // Open Create Modal
  const handleOpenCreateWage = () => {
    setEditingWage(null);
    setFormWageOrderId(orders[0]?.id || '');
    setFormWageStaffName('');
    setFormWageRole('Setup Nhân sự');
    setFormWageShifts(1);
    setFormWageRate(300000);
    setFormWageStatus('Pending Approval');
    setFormWageNotes('');
    setShowWageModal(true);
  };

  // Open Edit Modal
  const handleOpenEditWage = (w: WageRecord) => {
    setEditingWage(w);
    setFormWageOrderId(w.orderId || '');
    setFormWageStaffName(w.staffName);
    setFormWageRole(w.role);
    setFormWageShifts(w.shifts);
    setFormWageRate(w.wageRate || 0);
    setFormWageStatus(w.status as any);
    setFormWageNotes(w.notes || '');
    setShowWageModal(true);
  };

  // Delete wage record
  const handleDeleteWage = (id: string) => {
    if (confirm("Xóa phiếu công lương này?")) {
      setWages(prev => prev.filter(w => w.id !== id));
    }
  };

  // Quick single-click approval to PAID
  const handleApproveWagePaid = (id: string) => {
    setWages(prev => prev.map(w => w.id === id ? { ...w, status: 'Paid' } : w));
    alert(`Đã hoàn tất thanh toán chuyển khoản công lương cho mã ${id}!`);
  };

  // Filter list
  const filteredWages = wages.filter(w => {
    const matchesSearch = w.staffName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (w.orderId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate wages stats
  const totalWagesBill = wages.reduce((sum, w) => sum + (w.totalWage || 0), 0);
  const pendingWagesBill = wages.filter(w => w.status !== 'Paid').reduce((sum, w) => sum + (w.totalWage || 0), 0);
  const paidWagesBill = wages.filter(w => w.status === 'Paid').reduce((sum, w) => sum + (w.totalWage || 0), 0);

  return (
    <div id="wages-view" className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bảng công & Lương sự kiện</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-semibold">Ghi nhận ngày công công nhật của thợ trang trí, kỹ thuật âm thanh ánh sáng và Leader điều phối.</p>
        </div>

        <button
          onClick={handleOpenCreateWage}
          className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Ghi công nhân viên
        </button>
      </div>

      {/* Wage KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
          <span className="text-xs text-gray-400 font-bold block uppercase">Tổng tiền công phát sinh</span>
          <span className="text-xl font-bold text-gray-800 mt-1 block">{totalWagesBill.toLocaleString('vi-VN')} đ</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-amber-500 font-bold">
          <span className="text-xs text-gray-400 font-bold block uppercase">Chờ thanh toán (Pending)</span>
          <span className="text-xl font-bold text-amber-500 mt-1 block">{pendingWagesBill.toLocaleString('vi-VN')} đ</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500 font-bold">
          <span className="text-xs text-gray-400 font-bold block uppercase">Đã thanh toán (Paid)</span>
          <span className="text-xl font-bold text-green-600 mt-1 block">{paidWagesBill.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên nhân viên, mã hợp đồng đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="All">Tất cả trạng thái công</option>
            <option value="Draft">Draft</option>
            <option value="Pending Approval">Đang chờ duyệt</option>
            <option value="Confirmed">Đã chốt công</option>
            <option value="Paid">Đã chi trả lương</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                <th className="px-6 py-4">Mã chấm công</th>
                <th className="px-6 py-4">Mã sự kiện</th>
                <th className="px-6 py-4">Nhân sự thực hiện</th>
                <th className="px-6 py-4">Vai trò nghiệp vụ</th>
                <th className="px-6 py-4 text-center">Số ca diễn ra</th>
                <th className="px-6 py-4 text-right">Đơn giá ca công</th>
                <th className="px-6 py-4 text-right">Thành tiền công</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {filteredWages.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/20">
                  <td className="px-6 py-4 font-bold text-[#2563EB]">{w.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-500">{w.orderId || ''}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" /> {w.staffName}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">
                    <span className="bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded text-xs">{w.role}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-600">{w.shifts} ca</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-500">
                    {(w.wageRate || 0).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">
                    {(w.totalWage || 0).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      w.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' :
                      w.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>{w.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {w.status !== 'Paid' && (
                        <button
                          onClick={() => handleApproveWagePaid(w.id)}
                          className="px-2 py-1 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded text-xs font-bold transition-all cursor-pointer"
                          title="Chuyển khoản trả lương nhanh"
                        >
                          Duyệt Chi
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEditWage(w)}
                        className="p-1 hover:bg-amber-50 text-gray-400 hover:text-amber-500 rounded transition-colors"
                      >
                        <Edit className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWage(w.id)}
                        className="p-1 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded transition-colors"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT TIMEPUNCH MODAL */}
      {showWageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs text-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-gray-800 text-base">
                {editingWage ? `Sửa phiếu công lương ${editingWage.id}` : 'Thêm phiếu ghi nhận công nhật'}
              </h3>
              <button onClick={() => setShowWageModal(false)} className="p-1 hover:bg-gray-200 rounded text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveWage} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Sự kiện liên kết <span className="text-red-500">*</span></label>
                  <select
                    value={formWageOrderId}
                    onChange={(e) => setFormWageOrderId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white font-bold"
                  >
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} - {o.customerName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Tên nhân viên công nhật <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn Hùng..."
                    value={formWageStaffName}
                    onChange={(e) => setFormWageStaffName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Vai trò nghiệp vụ</label>
                  <select
                    value={formWageRole}
                    onChange={(e) => setFormWageRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="Setup Nhân sự">Setup Nhân sự</option>
                    <option value="Thi công Decor">Thi công Decor</option>
                    <option value="Kỹ thuật Âm thanh">Kỹ thuật Âm thanh</option>
                    <option value="Leader Điều phối">Leader Điều phối</option>
                    <option value="MC / Ca sĩ">MC / Ca sĩ</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Số ca làm việc (ca)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formWageShifts}
                    onChange={(e) => setFormWageShifts(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Đơn giá công / ca (đ) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    value={formWageRate}
                    onChange={(e) => setFormWageRate(parseInt(e.target.value) || 300000)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Trạng thái duyệt</label>
                  <select
                    value={formWageStatus}
                    onChange={(e) => setFormWageStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending Approval">Chờ duyệt (Pending Approval)</option>
                    <option value="Confirmed">Đã chốt công (Confirmed)</option>
                    <option value="Paid">Đã chi trả lương (Paid)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Ghi chú sự vụ</label>
                <textarea
                  placeholder="Làm ca tối thi công gem center, hỗ trợ bốc xếp tăng cường..."
                  value={formWageNotes}
                  onChange={(e) => setFormWageNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-5">
                <button
                  type="button"
                  onClick={() => setShowWageModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg cursor-pointer"
                >Hủy bỏ</button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >Lưu phiếu công</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
