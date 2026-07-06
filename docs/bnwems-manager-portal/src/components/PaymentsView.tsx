import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  QrCode, 
  CheckCircle, 
  Send, 
  DollarSign, 
  Calendar, 
  FileText, 
  TrendingUp, 
  X, 
  Copy, 
  Check, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { 
  DepositRequest, 
  PaymentHistory, 
  Order 
} from '../mockData';

interface PaymentsViewProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  deposits: DepositRequest[];
  setDeposits: React.Dispatch<React.SetStateAction<DepositRequest[]>>;
  payments: PaymentHistory[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentHistory[]>>;
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  qrAmount: number;
  setQrAmount: (amt: number) => void;
  qrOrderId: string;
  setQrOrderId: (id: string) => void;
  depositModalOpen: boolean;
  setDepositModalOpen: (open: boolean) => void;
  depositOrderId: string;
  setDepositOrderId: (id: string) => void;
}

export default function PaymentsView({
  orders,
  setOrders,
  deposits,
  setDeposits,
  payments,
  setPayments,
  qrModalOpen,
  setQrModalOpen,
  qrAmount,
  setQrAmount,
  qrOrderId,
  setQrOrderId,
  depositModalOpen,
  setDepositModalOpen,
  depositOrderId,
  setDepositOrderId,
}: PaymentsViewProps) {
  
  // Tab within: 'requests' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'history'>('requests');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');

  // Create Deposit Request state inside modal
  const [formDepositAmount, setFormDepositAmount] = useState(0);
  const [formDepositDueDate, setFormDepositDueDate] = useState('2026-07-05');
  const [formDepositNotes, setFormDepositNotes] = useState('');

  // VNPay Simulation State
  const [copiedCode, setCopiedCode] = useState(false);

  // Filter requests
  const filteredDeposits = deposits.filter(d => {
    return d.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
           d.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
           d.customerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredHistory = payments.filter(p => {
    return p.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Action: Open deposit request modal
  const handleOpenCreateDeposit = () => {
    setDepositOrderId(orders[0]?.id || '');
    const matchedOrd = orders[0];
    const defaultAmt = matchedOrd ? Math.round(matchedOrd.totalAmount * 0.3) : 3000000;
    setFormDepositAmount(defaultAmt);
    setFormDepositDueDate('2026-07-05');
    setFormDepositNotes('Tiền đặt cọc giữ chỗ 30% sảnh cưới');
    setDepositModalOpen(true);
  };

  // Sync amount when order selection changes in deposit modal
  const handleDepositOrderChange = (ordId: string) => {
    setDepositOrderId(ordId);
    const matched = orders.find(o => o.id === ordId);
    if (matched) {
      setFormDepositAmount(Math.round(matched.totalAmount * 0.3));
    }
  };

  // Submit Deposit Request Creation
  const handleSaveDepositRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositOrderId || formDepositAmount <= 0) {
      alert("Vui lòng nhập đầy đủ thông tin yêu cầu cọc.");
      return;
    }

    const linkedOrder = orders.find(o => o.id === depositOrderId);
    if (!linkedOrder) return;

    // Create deposit
    const newId = `DEP-${String(deposits.length + 1).padStart(3, '0')}`;
    const newDep: DepositRequest = {
      id: newId,
      orderId: depositOrderId,
      customerName: linkedOrder.customerName,
      amount: formDepositAmount,
      dueDate: formDepositDueDate,
      status: 'Waiting for Deposit'
    };

    setDeposits(prev => [newDep, ...prev]);
    setDepositModalOpen(false);
    alert(`Đã lập yêu cầu đặt cọc ${newId} cho khách hàng thành công!`);
  };

  // Action: Instant Manual Confirm Payment
  const handleConfirmDepositManual = (dep: DepositRequest) => {
    if (confirm(`Xác nhận khách hàng đã chuyển đủ ${(dep.amount || 0).toLocaleString('vi-VN')} đ cho yêu cầu ${dep.id}?`)) {
      
      // 1. Update deposit status
      setDeposits(prev => prev.map(d => d.id === dep.id ? { ...d, status: 'Confirmed' } : d));

      // 2. Update order payment status
      setOrders(prev => prev.map(o => o.id === dep.orderId ? { 
        ...o, 
        paymentStatus: 'Deposit Paid',
        orderStatus: 'Confirmed'
      } : o));

      // 3. Add to payment history
      const newPayId = `PAY-${String(payments.length + 1).padStart(3, '0')}`;
      const newPay: PaymentHistory = {
        id: newPayId,
        orderId: dep.orderId,
        amount: dep.amount || 0,
        paymentType: 'Deposit',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer (Manual)',
        approvedBy: 'Manager Binh',
        status: 'Success'
      };
      setPayments(prev => [newPay, ...prev]);

      alert(`Đã chuyển đổi trạng thái đơn hàng ${dep.orderId} sang 'Confirmed' và ghi nhận dòng tiền đặt cọc thành công!`);
    }
  };

  // Simulated auto-payment from VNPay QR Code
  const handleSimulatedQrSuccess = () => {
    // Locate deposit request
    const matchedDep = deposits.find(d => d.orderId === qrOrderId);
    
    // 1. Update deposit status
    setDeposits(prev => prev.map(d => d.orderId === qrOrderId ? { ...d, status: 'Confirmed' } : d));

    // 2. Update order payment status
    setOrders(prev => prev.map(o => o.id === qrOrderId ? { 
      ...o, 
      paymentStatus: 'Deposit Paid',
      orderStatus: 'Confirmed'
    } : o));

    // 3. Add to payment history
    const newPayId = `PAY-${String(payments.length + 1).padStart(3, '0')}`;
    const newPay: PaymentHistory = {
      id: newPayId,
      orderId: qrOrderId,
      amount: qrAmount,
      paymentType: 'Deposit',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'VNPay QR Code Auto',
      approvedBy: 'System Auto-Duyệt',
      status: 'Success'
    };
    setPayments(prev => [newPay, ...prev]);

    setQrModalOpen(false);
    alert(`Cổng thanh toán VNPay xác nhận: Giao dịch đơn ${qrOrderId} thành công! Số tiền ${qrAmount.toLocaleString('vi-VN')} đ đã được hạch toán.`);
  };

  // Copy code simulation
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // KPIs
  const totalIncomingAmt = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalPaidAmt = payments.filter(p => p.status === 'Success').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div id="payments-view" className="space-y-6">
      
      {/* Tab select header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'requests' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="w-4.5 h-4.5" />
            Yêu cầu đặt cọc (Deposit Requests)
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'history' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4.5 h-4.5" />
            Lịch sử giao dịch thanh toán
          </button>
        </div>

        {activeSubTab === 'requests' && (
          <button
            onClick={handleOpenCreateDeposit}
            className="flex items-center gap-1 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thiết lập cọc mới
          </button>
        )}
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
          <span className="text-xs text-gray-400 font-bold block uppercase font-mono">Dòng tiền yêu cầu thu cọc</span>
          <span className="text-xl font-bold text-gray-800 mt-1 block">{totalIncomingAmt.toLocaleString('vi-VN')} đ</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
          <span className="text-xs text-gray-400 font-bold block uppercase font-mono">Doanh thu thực nhận (Hạch toán)</span>
          <span className="text-xl font-bold text-green-600 mt-1 block">{totalPaidAmt.toLocaleString('vi-VN')} đ</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-amber-500">
          <span className="text-xs text-gray-400 font-bold block uppercase font-mono">Số đơn đang chờ đóng cọc</span>
          <span className="text-xl font-bold text-amber-500 mt-1 block">
            {deposits.filter(d => d.status !== 'Confirmed').length} sự kiện
          </span>
        </div>
      </div>

      {/* Search filter bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã yêu cầu, mã đơn hàng hoặc tên khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>
      </div>

      {/* SUB TAB 1: DEPOSIT REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                  <th className="px-6 py-4">Mã yêu cầu</th>
                  <th className="px-6 py-4">Mã đơn hàng</th>
                  <th className="px-6 py-4">Tên khách hàng</th>
                  <th className="px-6 py-4 text-right">Số tiền đặt cọc</th>
                  <th className="px-6 py-4">Hạn đóng cọc</th>
                  <th className="px-6 py-4">Trạng thái cọc</th>
                  <th className="px-6 py-4 text-right">Thao tác nghiệp vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-50/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#2563EB]">{dep.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-500">{dep.orderId}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{dep.customerName}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                      {(dep.amount || 0).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-500">{dep.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        dep.status === 'Confirmed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>{dep.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {dep.status !== 'Confirmed' ? (
                          <>
                            <button
                              onClick={() => {
                                setQrOrderId(dep.orderId);
                                setQrAmount(dep.amount || 0);
                                setQrModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-blue-50 text-[#2563EB] hover:bg-[#2563EB] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="Tạo mã QR ngân hàng"
                            >
                              <QrCode className="w-3.5 h-3.5" /> QR Cọc
                            </button>
                            <button
                              onClick={() => handleConfirmDepositManual(dep)}
                              className="px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="Xác nhận khách đã gửi khoản tay"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Xác nhận cọc
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-green-600 flex items-center gap-1 py-1 px-2.5 bg-green-50/50 rounded">✓ Đã hạch toán</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 2: TRANSACTION HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                  <th className="px-6 py-4">Mã Giao Dịch</th>
                  <th className="px-6 py-4">Mã đơn hàng</th>
                  <th className="px-6 py-4 text-right">Số tiền GD</th>
                  <th className="px-6 py-4">Hạng mục chi trả</th>
                  <th className="px-6 py-4">Ngày giao dịch</th>
                  <th className="px-6 py-4">Phương thức hạch toán</th>
                  <th className="px-6 py-4">Duyệt chi bởi</th>
                  <th className="px-6 py-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {filteredHistory.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#2563EB]">{p.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-500">{p.orderId}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                      {p.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded text-xs font-bold">{p.paymentType}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-500">{p.paymentDate}</td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">{p.paymentMethod}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{p.approvedBy}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 font-bold border border-green-200 rounded text-xs">Success</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE DEPOSIT REQUEST MODAL */}
      {depositModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs text-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-gray-800 text-base">Thiết lập cọc mới cho Đơn hàng</h3>
              <button onClick={() => setDepositModalOpen(false)} className="p-1 hover:bg-gray-200 rounded text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveDepositRequest} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Chọn sự kiện liên đới <span className="text-red-500">*</span></label>
                <select
                  value={depositOrderId}
                  onChange={(e) => handleDepositOrderChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white font-bold"
                >
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} - {o.customerName} ({o.eventName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Số tiền thu cọc (đ) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    value={formDepositAmount}
                    onChange={(e) => setFormDepositAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Hạn nộp tiền cọc</label>
                  <input
                    type="date"
                    required
                    value={formDepositDueDate}
                    onChange={(e) => setFormDepositDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Ghi chú hạch toán cọc</label>
                <textarea
                  value={formDepositNotes}
                  onChange={(e) => setFormDepositNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-5">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg cursor-pointer"
                >Hủy bỏ</button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >Giao phiếu thu cọc</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC VNPAY QR CODE SIMULATOR MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs text-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-scale-up">
            
            {/* Header VNPay style */}
            <div className="p-5 bg-[#004A9C] text-white flex justify-between items-center relative">
              <div className="flex items-center gap-2">
                <div className="bg-red-500 text-white font-black text-xs px-2 py-1 rounded italic uppercase tracking-wider">VNPay</div>
                <div>
                  <h3 className="font-bold text-sm">Cổng thanh toán QR Code</h3>
                  <p className="text-[10px] text-blue-100 font-semibold">Tự động đồng bộ với TK hệ thống BNWEMS</p>
                </div>
              </div>
              <button 
                onClick={() => setQrModalOpen(false)} 
                className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Content */}
            <div className="p-6 space-y-5 text-center">
              <div>
                <span className="text-[10px] text-gray-400 block font-bold uppercase">Số tiền thanh toán</span>
                <span className="text-2xl font-black text-[#004A9C] mt-1 block">{qrAmount.toLocaleString('vi-VN')} đ</span>
              </div>

              {/* Graphical QR Simulation */}
              <div className="relative mx-auto w-48 h-48 bg-white border-2 border-dashed border-[#004A9C] rounded-2xl flex items-center justify-center p-3.5 shadow-sm">
                {/* QR grid simulation using styled CSS block */}
                <div className="w-full h-full relative opacity-90 select-none bg-slate-50 border border-gray-100 rounded-lg flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-4 border-gray-800 bg-white"></div>
                    <div className="w-8 h-8 border-4 border-gray-800 bg-white"></div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Centered logo icon */}
                    <div className="w-10 h-10 rounded-lg bg-[#004A9C] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                      BN
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-8 h-8 border-4 border-gray-800 bg-white"></div>
                    {/* Tiny QR squares */}
                    <div className="grid grid-cols-2 gap-0.5 w-6 h-6 bg-gray-800"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#2563EB]/10 to-transparent pointer-events-none animate-pulse"></div>
              </div>

              {/* Copy transfer instruction */}
              <div className="bg-slate-50 p-4 rounded-xl text-left border border-gray-100 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-semibold">Nội dung chuyển khoản:</span>
                  <button 
                    onClick={() => handleCopyCode(`BNWEMS COC ${qrOrderId}`)}
                    className="text-[#2563EB] hover:underline font-bold flex items-center gap-0.5"
                  >
                    {copiedCode ? <span className="text-green-600 font-bold flex items-center gap-0.5">✓ Đã copy</span> : <span className="flex items-center gap-0.5"><Copy className="w-3.5 h-3.5" /> Sao chép</span>}
                  </button>
                </div>
                <p className="font-mono font-bold text-gray-800 bg-white p-2 rounded border border-gray-200 select-all">BNWEMS COC {qrOrderId}</p>
                <div className="text-[10px] text-gray-400 mt-1 flex gap-1 items-start leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>Sử dụng app Ngân hàng quét mã QR trên để tự động ghi nhận giao dịch cọc và cập nhật tiến độ tự động trên hệ thống.</span>
                </div>
              </div>

              {/* Manual Simulation trigger */}
              <button
                type="button"
                onClick={handleSimulatedQrSuccess}
                className="w-full py-3 bg-[#004A9C] hover:bg-[#003875] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-100"
              >
                <Check className="w-4 h-4" /> [Mô phỏng] Đã quét chuyển khoản thành công
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
