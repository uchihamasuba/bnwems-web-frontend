import React, { useState } from 'react';
import { 
  Plus, 
  ShoppingBag, 
  Activity, 
  Clock, 
  AlertCircle, 
  CheckSquare, 
  Calendar, 
  ChevronRight, 
  FileText, 
  TrendingUp, 
  Download,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { Order, Quotation, WorkTask, SchedulePlan, SurveyReport, InventoryItem, WageRecord } from '../mockData';

interface DashboardViewProps {
  orders: Order[];
  quotations: Quotation[];
  tasks: WorkTask[];
  plans: SchedulePlan[];
  reports: SurveyReport[];
  inventory: InventoryItem[];
  wages: WageRecord[];
  onNavigate: (route: string, menu: string) => void;
  onSelectOrder: (orderId: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onSelectReport: (reportId: string) => void;
}

export default function DashboardView({
  orders,
  quotations,
  tasks,
  plans,
  reports,
  inventory,
  wages,
  onNavigate,
  onSelectOrder,
  onSelectCustomer,
  onSelectReport,
}: DashboardViewProps) {

  // Selected day state for the mini calendar (default to October 5th)
  const [selectedDay, setSelectedDay] = useState<number>(5);

  // Dynamic lists of pending approvals
  const [approvals, setApprovals] = useState([
    {
      id: 'app-1',
      title: 'Hợp đồng tiệc cưới',
      customer: 'Khách hàng: Trần Thị B',
      amount: '25.000.000đ',
      badge: null,
      badgeColor: null
    },
    {
      id: 'app-2',
      title: 'Tăng cường nhân sự sự kiện',
      customer: 'Dự án: Tech Conference 2023',
      amount: null,
      badge: '+5 nhân sự',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    {
      id: 'app-3',
      title: 'Yêu cầu thuê thêm loa',
      customer: 'Sự kiện: Gala Dinner InterCon',
      amount: null,
      badge: 'Khẩn cấp',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    }
  ]);

  // Toast status tracking
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle action on approvals
  const handleApprove = (id: string, title: string, action: 'approve' | 'reject') => {
    setApprovals(prev => prev.filter(item => item.id !== id));
    setToastMessage(
      action === 'approve' 
        ? `Đã phê duyệt "${title}" thành công!` 
        : `Đã từ chối yêu cầu "${title}".`
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Export report function with clean alert and mock download
  const handleExportReport = () => {
    setToastMessage('Đang trích xuất báo cáo vận hành hôm nay dưới dạng PDF...');
    setTimeout(() => {
      setToastMessage('Xuất báo cáo thành công! File Báo-cáo-vận-hành-WEMS.pdf đã được tải xuống.');
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    }, 1500);
  };

  // Mini Calendar grid representation for October 2023 (Sunday starts the row as per screenshot)
  // CN, T2, T3, T4, T5, T6, T7
  const calendarDays = [
    // September
    { dayNumber: 28, isFaded: true, hasDot: false, value: 28 },
    { dayNumber: 29, isFaded: true, hasDot: false, value: 29 },
    { dayNumber: 30, isFaded: true, hasDot: false, value: 30 },
    // October
    { dayNumber: 1, isFaded: false, hasDot: false, value: 1 },
    { dayNumber: 2, isFaded: false, hasDot: false, value: 2 },
    { dayNumber: 3, isFaded: false, hasDot: false, value: 3 },
    { dayNumber: 4, isFaded: false, hasDot: false, value: 4 },
    { dayNumber: 5, isFaded: false, hasDot: false, value: 5 },
    { dayNumber: 6, isFaded: false, hasDot: false, value: 6 },
    { dayNumber: 7, isFaded: false, hasDot: true, value: 7 },
    { dayNumber: 8, isFaded: false, hasDot: false, value: 8 },
    { dayNumber: 9, isFaded: false, hasDot: false, value: 9 },
    { dayNumber: 10, isFaded: false, hasDot: false, value: 10 },
    { dayNumber: 11, isFaded: false, hasDot: false, value: 11 },
    { dayNumber: 12, isFaded: false, hasDot: false, value: 12 },
    { dayNumber: 13, isFaded: false, hasDot: false, value: 13 },
    { dayNumber: 14, isFaded: false, hasDot: false, value: 14 },
    { dayNumber: 15, isFaded: false, hasDot: false, value: 15 },
    { dayNumber: 16, isFaded: false, hasDot: false, value: 16 },
    { dayNumber: 17, isFaded: false, hasDot: false, value: 17 },
    { dayNumber: 18, isFaded: false, hasDot: false, value: 18 },
    { dayNumber: 19, isFaded: false, hasDot: false, value: 19 },
    { dayNumber: 20, isFaded: false, hasDot: false, value: 20 },
    { dayNumber: 21, isFaded: false, hasDot: false, value: 21 },
    { dayNumber: 22, isFaded: false, hasDot: false, value: 22 },
    { dayNumber: 23, isFaded: false, hasDot: false, value: 23 },
    { dayNumber: 24, isFaded: false, hasDot: false, value: 24 },
    { dayNumber: 25, isFaded: false, hasDot: false, value: 25 },
    { dayNumber: 26, isFaded: false, hasDot: false, value: 26 },
    { dayNumber: 27, isFaded: false, hasDot: false, value: 27 },
    { dayNumber: 28, isFaded: false, hasDot: false, value: 28 },
    { dayNumber: 29, isFaded: false, hasDot: false, value: 29 },
    { dayNumber: 30, isFaded: false, hasDot: false, value: 30 },
    { dayNumber: 31, isFaded: false, hasDot: false, value: 31 },
    // November
    { dayNumber: 1, isFaded: true, hasDot: false, value: 1 },
    { dayNumber: 2, isFaded: true, hasDot: false, value: 2 },
    { dayNumber: 3, isFaded: true, hasDot: false, value: 3 },
    { dayNumber: 4, isFaded: true, hasDot: false, value: 4 }
  ];

  // Scheduled events mapping per selected day
  const getEventsForDay = (day: number) => {
    if (day === 5) {
      return [
        {
          id: 'ev-1',
          title: 'Khảo sát địa điểm - GEM Center',
          time: '09:00 - 11:30',
          badge: 'TRANG TRÍ',
          badgeStyle: 'bg-blue-100 text-blue-700'
        },
        {
          id: 'ev-2',
          title: 'Lắp đặt thiết bị - White Palace',
          time: '14:00 - 18:00',
          badge: 'ÂM THANH',
          badgeStyle: 'bg-indigo-100 text-indigo-700'
        },
        {
          id: 'ev-3',
          title: 'Thu hồi thiết bị - InterContinental',
          time: '22:00 - 01:00 (Sáng mai)',
          badge: 'VẬN CHUYỂN',
          badgeStyle: 'bg-slate-100 text-slate-700'
        }
      ];
    } else if (day === 7) {
      return [
        {
          id: 'ev-4',
          title: 'Kiểm tra kỹ thuật - Nhà hát Thành phố',
          time: '08:30 - 10:30',
          badge: 'KỸ THUẬT',
          badgeStyle: 'bg-amber-100 text-amber-700'
        },
        {
          id: 'ev-5',
          title: 'Lên đèn sân khấu - Sảnh Thống Nhất',
          time: '16:00 - 19:30',
          badge: 'ÁNH SÁNG',
          badgeStyle: 'bg-pink-100 text-pink-700'
        }
      ];
    }
    return []; // Empty list for other days with clean empty state helper
  };

  const selectedDayEvents = getEventsForDay(selectedDay);

  return (
    <div id="dashboard-view" className="space-y-6">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-bounce-short text-xs font-semibold">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Welcome header with screen layout as shown in the screenshot */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chào buổi sáng, Quản lý</h1>
          <p className="text-slate-500 text-sm mt-1">Dưới đây là tổng quan về hoạt động của hệ thống hôm nay.</p>
        </div>
        
        {/* Quick Actions at the far right */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Xuất báo cáo
          </button>
          
          <button
            onClick={() => onNavigate('order-create', 'orders')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            Tạo mới
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - 4 columns exactly like the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Tổng số đơn hàng */}
        <div 
          onClick={() => onNavigate('orders', 'orders')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              <span>+12.5%</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Tổng số đơn hàng</span>
            <span className="text-2xl font-bold text-slate-900">1,284</span>
          </div>
        </div>

        {/* KPI 2: Đơn hàng đang hoạt động */}
        <div 
          onClick={() => onNavigate('orders', 'orders')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              <span>+8%</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Đơn hàng đang hoạt động</span>
            <span className="text-2xl font-bold text-slate-900">42</span>
          </div>
        </div>

        {/* KPI 3: Doanh thu tháng này */}
        <div 
          onClick={() => onNavigate('payments-deposits', 'payments')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              <span>+15%</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Doanh thu tháng này</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">1.280</span>
              <span className="text-xs font-bold text-slate-500">Tr. VNĐ</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Yêu cầu cần xử lý */}
        <div 
          onClick={() => onNavigate('schedule-plans', 'schedule')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-orange-50 rounded-lg text-orange-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-orange-500 text-white rounded-full">CẦN CHÚ Ý</span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Yêu cầu cần xử lý</span>
            <span className="text-2xl font-bold text-amber-600">{approvals.length + 12}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left wider Column (Lịch trình & Hoạt động gần đây) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Lịch trình & Lịch sự kiện */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Lịch trình & Lịch sự kiện</h3>
              </div>
              <button 
                onClick={() => onNavigate('schedule-calendar', 'schedule')}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                Xem tất cả
              </button>
            </div>

            {/* Inner row split into: Mini Calendar (left) and Scheduled Events list (right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Mini Calendar block */}
              <div className="md:col-span-5 bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex flex-col">
                <h4 className="text-center font-bold text-xs text-slate-700 mb-2">Tháng 10, 2023</h4>
                
                {/* Weekdays header */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
                  <span>CN</span>
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                  <span>T7</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                  {calendarDays.map((day, idx) => {
                    const isSelected = !day.isFaded && day.value === selectedDay;
                    return (
                      <div 
                        key={idx} 
                        onClick={() => !day.isFaded && setSelectedDay(day.value)}
                        className="relative flex flex-col items-center justify-center py-1.5 cursor-pointer select-none rounded-md transition-colors"
                      >
                        <span className={`w-6 h-6 flex items-center justify-center font-semibold rounded-full ${
                          day.isFaded 
                            ? 'text-slate-300 pointer-events-none' 
                            : isSelected 
                              ? 'bg-blue-600 text-white shadow-xs font-bold' 
                              : 'text-slate-700 hover:bg-slate-200'
                        }`}>
                          {day.dayNumber}
                        </span>
                        
                        {/* Dot indicator under day 7 */}
                        {day.hasDot && !isSelected && (
                          <span className="absolute bottom-0.5 w-1 h-1 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scheduled list block */}
              <div className="md:col-span-7 flex flex-col space-y-4">
                {selectedDayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                    <Clock className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">Không có lịch trình</p>
                    <p className="text-[11px] text-slate-400 mt-1">Chọn ngày 5 hoặc 7 để xem lịch sự kiện mẫu.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-blue-100 ml-2 pl-4 space-y-4">
                    {selectedDayEvents.map((ev) => {
                      const isGrayCircle = ev.id === 'ev-3';
                      return (
                        <div key={ev.id} className="relative">
                          {/* Timeline customized dot */}
                          <div className={`absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white flex items-center justify-center ${
                            isGrayCircle ? 'bg-slate-400' : 'bg-blue-500'
                          }`}>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>

                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer">
                                {ev.title}
                              </p>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{ev.time}</span>
                              </div>
                            </div>

                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${ev.badgeStyle}`}>
                              {ev.badge}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Hoạt động gần đây */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Hoạt động gần đây</h3>
            
            <div className="space-y-4">
              {/* Item 1 */}
              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-100 text-green-700 rounded-full mt-0.5 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 leading-normal">
                    Đơn hàng <span className="font-bold text-slate-900 cursor-pointer hover:text-blue-600">#DH001</span> đã được giao thành công cho khách hàng Nguyễn Văn A.
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">15 phút trước</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-100 text-blue-700 rounded-full mt-0.5 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 leading-normal">
                    Báo giá <span className="font-bold text-slate-900 cursor-pointer hover:text-blue-600">#BG021</span> đã được duyệt bởi bộ phận kinh doanh.
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">30 phút trước</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right narrower Column (Yêu cầu chờ duyệt) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <div className="w-5 h-5 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-3 h-3" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Yêu cầu chờ duyệt</h3>
            </div>

            {/* List of approvals matching the screenshot visual design */}
            <div className="space-y-4 flex-1">
              {approvals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2 animate-pulse" />
                  <p className="text-sm font-bold text-slate-700">Tất cả đã được duyệt!</p>
                  <p className="text-xs mt-1 text-slate-400">Không có yêu cầu chờ xử lý.</p>
                </div>
              ) : (
                approvals.map((app) => (
                  <div key={app.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between gap-3 shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{app.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{app.customer}</p>
                      </div>
                      
                      {/* Amount or badge element right aligned */}
                      {app.amount ? (
                        <span className="text-xs font-bold text-blue-600 whitespace-nowrap flex-shrink-0">{app.amount}</span>
                      ) : app.badge ? (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap flex-shrink-0 ${app.badgeColor}`}>
                          {app.badge}
                        </span>
                      ) : null}
                    </div>

                    {/* Quick action decision buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button 
                        onClick={() => handleApprove(app.id, app.title, 'approve')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all text-center cursor-pointer"
                      >
                        Phê duyệt
                      </button>
                      <button 
                        onClick={() => handleApprove(app.id, app.title, 'reject')}
                        className="bg-white hover:bg-red-50 border border-red-200 text-red-600 font-bold text-[11px] py-1.5 px-3 rounded-lg transition-all text-center cursor-pointer"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
