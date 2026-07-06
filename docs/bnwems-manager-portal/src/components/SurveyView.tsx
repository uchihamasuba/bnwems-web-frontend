import React, { useState } from 'react';
import { 
  Eye, 
  MapPin, 
  Calendar, 
  User, 
  Clipboard, 
  ArrowLeft, 
  ChevronRight, 
  Search, 
  ImageIcon, 
  CheckCircle,
  Package,
  FileText,
  X
} from 'lucide-react';
import { SurveyReport, Order } from '../mockData';

interface SurveyViewProps {
  reports: SurveyReport[];
  setReports: React.Dispatch<React.SetStateAction<SurveyReport[]>>;
  orders: Order[];
  onSelectOrder: (orderId: string) => void;
  onNavigate: (route: string, menu: string) => void;
  selectedReportId: string | null;
  onSelectReport: (reportId: string | null) => void;
}

export default function SurveyView({
  reports,
  setReports,
  orders,
  onSelectOrder,
  onNavigate,
  selectedReportId,
  onSelectReport,
}: SurveyViewProps) {
  
  // List filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Find selected report
  const activeReport = reports.find(r => r.id === selectedReportId);

  // KPIs
  const totalReports = reports.length;
  const submittedCount = reports.filter(r => r.status === 'Submitted').length;
  const pendingCount = reports.filter(r => r.status === 'Needs Review' || r.status === 'Draft').length;

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="survey-view" className="space-y-6">
      
      {/* 1. LIST VIEW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Theo dõi khảo sát hiện trường</h1>
          <p className="text-gray-500 text-sm mt-0.5">Quản lý đo đạc mặt bằng sảnh tiệc, ghi nhận bốc dỡ và phát sinh kỹ thuật.</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase">Tổng khảo sát</span>
          <span className="text-xl font-bold text-gray-800 mt-1 block">{totalReports}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
          <span className="text-xs text-gray-400 font-bold block uppercase">Đã nộp báo cáo (Submitted)</span>
          <span className="text-xl font-bold text-green-600 mt-1 block">{submittedCount}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-amber-500">
          <span className="text-xs text-gray-400 font-bold block uppercase">Chờ duyệt / Nháp</span>
          <span className="text-xl font-bold text-amber-500 mt-1 block">{pendingCount}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-rose-500">
          <span className="text-xs text-gray-400 font-bold block uppercase">Khảo sát quá hạn</span>
          <span className="text-xl font-bold text-rose-500 mt-1 block">0</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, khách hàng hoặc địa điểm khảo sát..."
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
            <option value="All">Tất cả trạng thái</option>
            <option value="Submitted">Đã nộp báo cáo</option>
            <option value="Needs Review">Đang chờ duyệt</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Reports Table list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Địa điểm sảnh khảo sát</th>
                <th className="px-6 py-4">Ngày khảo sát</th>
                <th className="px-6 py-4">Nhân sự thực hiện</th>
                <th className="px-6 py-4 text-center">Tiến trình</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Xem báo cáo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {filteredReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#2563EB]">{rep.orderId}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{rep.customerName}</td>
                  <td className="px-6 py-4 font-semibold text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {rep.location}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{rep.surveyDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                      <User className="w-3.5 h-3.5 text-gray-400" /> {rep.staffName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden mx-auto">
                      <div className={`h-full ${rep.status === 'Submitted' ? 'bg-green-500 w-full' : 'bg-amber-400 w-2/3'}`}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      rep.status === 'Submitted' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>{rep.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSelectReport(rep.id)}
                      className="inline-flex items-center gap-1 text-xs bg-blue-50 text-[#2563EB] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> Xem báo cáo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. REPORT DETAIL DRAWER (SLIDE-OUT FROM RIGHT) */}
      {activeReport && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end backdrop-blur-xs animate-fade-in">
          {/* Overlay dismissal */}
          <div className="flex-1" onClick={() => onSelectReport(null)}></div>
          
          {/* Drawer Body */}
          <div className="w-full max-w-2xl bg-white h-screen shadow-2xl border-l border-gray-100 flex flex-col animate-slide-left overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Hồ sơ định vị khảo sát</span>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-lg font-bold text-gray-800">Báo cáo khảo sát {activeReport.id}</h2>
                  <span className="px-2.5 py-0.5 bg-green-50 border border-green-200 text-green-700 font-bold rounded-full text-xs">{activeReport.status}</span>
                </div>
              </div>
              <button 
                onClick={() => onSelectReport(null)}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 text-sm flex-1">
              
              {/* Event info block */}
              <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50 space-y-2">
                <h4 className="font-bold text-gray-800 uppercase text-xs">Thông tin chung sự kiện</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <p><strong>Khách hàng:</strong> {activeReport.customerName} (Mã đơn: <span className="font-bold text-[#2563EB]">{activeReport.orderId}</span>)</p>
                  <p><strong>Ngày tiến hành:</strong> {activeReport.surveyDate}</p>
                  <p className="col-span-2"><strong>Địa điểm đo đạc:</strong> {activeReport.location}</p>
                </div>
              </div>

              {/* Measurements Block */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-1.5">Số đo kỹ thuật mặt bằng sảnh</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Chiều dài</span>
                    <span className="text-base font-bold text-gray-800 mt-1 block">{activeReport.length} m</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Chiều rộng</span>
                    <span className="text-base font-bold text-gray-800 mt-1 block">{activeReport.width} m</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Diện tích sảnh</span>
                    <span className="text-base font-bold text-gray-800 mt-1 block">{activeReport.area} m²</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-gray-100 text-xs space-y-1">
                  <p><strong>Lối đi bốc xếp thiết bị:</strong> {activeReport.entrance}</p>
                </div>
              </div>

              {/* Site constraint notes */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-1.5">Ràng buộc & Ghi chú thực tế sảnh</h3>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-900 leading-relaxed italic">
                  {activeReport.notes}
                </div>
                <p className="text-xs font-semibold text-gray-700"><strong>Giới hạn lắp đặt:</strong> {activeReport.siteConstraints}</p>
                <p className="text-xs font-semibold text-gray-700"><strong>Yêu cầu bổ sung của khách:</strong> {activeReport.additionalRequests}</p>
              </div>

              {/* Image Gallery Mockup */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-4.5 h-4.5 text-blue-600" />
                  Hình ảnh hiện trường (Ghi chú khảo sát)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {activeReport.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 group">
                      <img src={img} alt="Survey location" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Hình ảnh #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposed items after survey */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-1.5">Đề xuất bổ sung thiết bị sau khảo sát</h3>
                <div className="border border-gray-100 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-gray-500 uppercase font-bold">
                      <tr>
                        <th className="px-4 py-2">Tên thiết bị đề xuất</th>
                        <th className="px-4 py-2 text-center">Số lượng</th>
                        <th className="px-4 py-2">Mục đích sử dụng / Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      {activeReport.proposedItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 font-bold text-gray-800">{item.name}</td>
                          <td className="px-4 py-2 text-center font-bold text-blue-600">{item.quantity}</td>
                          <td className="px-4 py-2 text-gray-500 italic">{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Direct operational actions */}
              <div className="pt-6 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => { onSelectOrder(activeReport.orderId); onNavigate('order-detail', 'orders'); onSelectReport(null); }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-center text-xs transition-colors cursor-pointer"
                >
                  Quay lại xem đơn hàng
                </button>
                <button
                  onClick={() => { onNavigate('inventory-availability', 'inventory'); onSelectReport(null); }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-center text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Package className="w-4 h-4" /> Kiểm tra lại tồn kho
                </button>
                <button
                  onClick={() => { onNavigate('quotation-create', 'quotations'); onSelectReport(null); }}
                  className="flex-1 py-2.5 bg-[#2563EB] text-white hover:bg-blue-700 font-bold rounded-xl text-center text-xs transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                >
                  <FileText className="w-4 h-4" /> Cập nhật báo giá
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
