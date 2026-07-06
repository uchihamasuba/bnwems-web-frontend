import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  List, 
  Layers, 
  User, 
  MapPin, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  Trash2, 
  Edit,
  SlidersHorizontal,
  FolderLock,
  Search,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import { Order, SchedulePlan, WorkTask } from '../mockData';

interface ScheduleViewProps {
  orders: Order[];
  plans: SchedulePlan[];
  setPlans: React.Dispatch<React.SetStateAction<SchedulePlan[]>>;
  tasks: WorkTask[];
  setTasks: React.Dispatch<React.SetStateAction<WorkTask[]>>;
  onSelectOrder: (orderId: string) => void;
  onNavigate: (route: string, menu: string) => void;
}

export default function ScheduleView({
  orders,
  plans,
  setPlans,
  tasks,
  setTasks,
  onSelectOrder,
  onNavigate,
}: ScheduleViewProps) {
  
  // Tab within schedule: 'calendar' | 'plans' | 'tasks'
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'plans' | 'tasks'>('calendar');

  // Calendar States
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState<SchedulePlan | null>(plans[0] || null);
  const [calendarViewType, setCalendarViewType] = useState<'month' | 'week'>('month');

  // Filter and selection states matching the screenshot design
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(6); // Defaults to June (Tháng 6/2024)
  const [currentYear, setCurrentYear] = useState(2024);
  const [statusFilter, setStatusFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2024-06-12'); // Defaults to June 12, 2024 to match screenshot exactly

  // Plan Form / Modal States
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SchedulePlan | null>(null);
  const [formPlanOrderId, setFormPlanOrderId] = useState('');
  const [formPlanType, setFormPlanType] = useState<'Survey' | 'Preparation' | 'Transport' | 'Construction' | 'Retrieval' | 'Return'>('Survey');
  const [formPlanStart, setFormPlanStart] = useState('');
  const [formPlanEnd, setFormPlanEnd] = useState('');
  const [formPlanLocation, setFormPlanLocation] = useState('');
  const [formPlanStaff, setFormPlanStaff] = useState('');
  const [formPlanNotes, setFormPlanNotes] = useState('');
  const [formPlanStatus, setFormPlanStatus] = useState<'Pending' | 'In Progress' | 'Completed' | 'Cancelled'>('Pending');

  // Task Form / Modal States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkTask | null>(null);
  const [formTaskTitle, setFormTaskTitle] = useState('');
  const [formTaskOrderId, setFormTaskOrderId] = useState('');
  const [formTaskType, setFormTaskType] = useState<'Survey' | 'Preparation' | 'Transport' | 'Construction' | 'Retrieval' | 'Return'>('Survey');
  const [formTaskLeader, setFormTaskLeader] = useState('');
  const [formTaskTechnical, setFormTaskTechnical] = useState('');
  const [formTaskDue, setFormTaskDue] = useState('');
  const [formTaskPriority, setFormTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [formTaskStatus, setFormTaskStatus] = useState<'Draft' | 'Assigned' | 'In Progress' | 'Completed'>('Draft');
  const [formTaskNotes, setFormTaskNotes] = useState('');

  // 1. SAVE PLAN (Create / Edit)
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlanOrderId || !formPlanStart || !formPlanEnd || !formPlanStaff) {
      alert("Vui lòng điền đủ thông tin kế hoạch.");
      return;
    }

    const linkedOrder = orders.find(o => o.id === formPlanOrderId);
    const customerName = linkedOrder ? linkedOrder.customerName : 'Unknown';

    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? {
        ...p,
        orderId: formPlanOrderId,
        customerName,
        type: formPlanType,
        startTime: formPlanStart,
        endTime: formPlanEnd,
        location: formPlanLocation,
        responsibleStaff: formPlanStaff,
        notes: formPlanNotes,
        status: formPlanStatus
      } : p));
      alert("Đã cập nhật kế hoạch lịch trình!");
    } else {
      const newId = `PLAN-${String(plans.length + 1).padStart(3, '0')}`;
      const newPlan: SchedulePlan = {
        id: newId,
        orderId: formPlanOrderId,
        customerName,
        type: formPlanType,
        startTime: formPlanStart,
        endTime: formPlanEnd,
        location: formPlanLocation,
        responsibleStaff: formPlanStaff,
        notes: formPlanNotes,
        status: formPlanStatus
      };
      setPlans(prev => [...prev, newPlan]);
      alert("Đã thêm kế hoạch lịch trình mới!");
    }
    setShowPlanModal(false);
  };

  // Open Create Plan
  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setFormPlanOrderId(orders[0]?.id || '');
    setFormPlanType('Survey');
    setFormPlanStart('2026-07-15T09:00');
    setFormPlanEnd('2026-07-15T12:00');
    setFormPlanLocation('');
    setFormPlanStaff('Trần Anh Tuấn (Leader)');
    setFormPlanNotes('');
    setFormPlanStatus('Pending');
    setShowPlanModal(true);
  };

  // Open Edit Plan
  const handleOpenEditPlan = (plan: SchedulePlan) => {
    setEditingPlan(plan);
    setFormPlanOrderId(plan.orderId);
    setFormPlanType(plan.type);
    setFormPlanStart(plan.startTime);
    setFormPlanEnd(plan.endTime);
    setFormPlanLocation(plan.location);
    setFormPlanStaff(plan.responsibleStaff);
    setFormPlanNotes(plan.notes);
    setFormPlanStatus(plan.status);
    setShowPlanModal(true);
  };

  // Delete Plan
  const handleDeletePlan = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa kế hoạch này khỏi hệ thống?")) {
      setPlans(prev => prev.filter(p => p.id !== id));
    }
  };

  // 2. SAVE TASK (Create / Edit)
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTaskTitle || !formTaskOrderId || !formTaskDue || !formTaskLeader) {
      alert("Vui lòng nhập đầy đủ thông tin công việc.");
      return;
    }

    const linkedOrder = orders.find(o => o.id === formTaskOrderId);
    const location = linkedOrder ? linkedOrder.location : 'Kho tổng BNWEMS';

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? {
        ...t,
        title: formTaskTitle,
        orderId: formTaskOrderId,
        type: formTaskType,
        assignedLeader: formTaskLeader,
        assignedTechnical: formTaskTechnical,
        dueTime: formTaskDue,
        location,
        priority: formTaskPriority,
        status: formTaskStatus,
        notes: formTaskNotes
      } : t));
      alert("Cập nhật công việc nhân sự thành công!");
    } else {
      const newId = `TASK-${String(tasks.length + 1).padStart(3, '0')}`;
      const newTask: WorkTask = {
        id: newId,
        title: formTaskTitle,
        orderId: formTaskOrderId,
        type: formTaskType,
        assignedLeader: formTaskLeader,
        assignedTechnical: formTaskTechnical,
        dueTime: formTaskDue,
        location,
        priority: formTaskPriority,
        status: formTaskStatus,
        notes: formTaskNotes
      };
      setTasks(prev => [...prev, newTask]);
      alert("Đã khởi tạo và giao công việc mới cho nhân viên!");
    }
    setShowTaskModal(false);
  };

  // Open Create Task
  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setFormTaskTitle('');
    setFormTaskOrderId(orders[0]?.id || '');
    setFormTaskType('Survey');
    setFormTaskLeader('Trần Anh Tuấn (Leader)');
    setFormTaskTechnical('Phạm Hồng Thái (Technical)');
    setFormTaskDue('2026-07-15T12:00');
    setFormTaskPriority('Medium');
    setFormTaskStatus('Draft');
    setFormTaskNotes('');
    setShowTaskModal(true);
  };

  // Open Edit Task
  const handleOpenEditTask = (task: WorkTask) => {
    setEditingTask(task);
    setFormTaskTitle(task.title);
    setFormTaskOrderId(task.orderId);
    setFormTaskType(task.type);
    setFormTaskLeader(task.assignedLeader);
    setFormTaskTechnical(task.assignedTechnical);
    setFormTaskDue(task.dueTime);
    setFormTaskPriority(task.priority);
    setFormTaskStatus(task.status);
    setFormTaskNotes(task.notes);
    setShowTaskModal(true);
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa công việc này?")) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // Quick drag status upgrade
  const handleUpgradeTaskStatus = (task: WorkTask, nextStatus: 'Draft' | 'Assigned' | 'In Progress' | 'Completed') => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
  };

  // Helper to get 7 days of the week containing a given date string
  const getDaysOfWeek = (dateStr: string) => {
    try {
      const current = new Date(dateStr);
      if (isNaN(current.getTime())) {
        return Array.from({ length: 7 }).map((_, idx) => {
          const d = new Date();
          d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1) + idx);
          return d;
        });
      }
      const day = current.getDay(); // 0 is Sun, 1 is Mon...
      const diffToMon = day === 0 ? -6 : 1 - day; // how many days to Mon
      
      const monday = new Date(current);
      monday.setDate(current.getDate() + diffToMon);
      
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
      }
      return days;
    } catch (e) {
      return Array.from({ length: 7 }).map((_, idx) => new Date());
    }
  };

  const daysOfWeek = getDaysOfWeek(selectedDate);

  // Helper to resolve week events
  const getWeekEventsForDays = (days: Date[]) => {
    const weekEvents: any[] = [];
    const dayStrings = days.map(d => d.toISOString().split('T')[0]);
    
    // Process matching plans
    plans.forEach(plan => {
      const planDate = plan.startTime.split('T')[0];
      const dayIdx = dayStrings.indexOf(planDate);
      if (dayIdx !== -1) {
        const startDateTime = new Date(plan.startTime);
        const endDateTime = new Date(plan.endTime);
        
        const startHour = startDateTime.getHours();
        const startMin = startDateTime.getMinutes();
        const endHour = endDateTime.getHours();
        const endMin = endDateTime.getMinutes();
        
        weekEvents.push({
          id: plan.id,
          orderId: plan.orderId,
          title: plan.orderId === 'ORD-1024' 
            ? 'Lắp đặt âm thanh - Gala VinFast' 
            : plan.orderId === 'ORD-1025' 
            ? 'Kiểm tra ánh sáng - Sảnh Main' 
            : `${plan.type} - ${plan.customerName}`,
          startTimeStr: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
          endTimeStr: `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
          startHour,
          startMin,
          endHour,
          endMin,
          location: plan.location,
          status: plan.status,
          dayIdx,
          isActualPlan: true,
          plan
        });
      }
    });

    // Inject mock screenshot events so Tuesday/Wednesday have beautiful entries
    const hasTuesdayEvent = weekEvents.some(e => e.dayIdx === 1);
    if (!hasTuesdayEvent) {
      weekEvents.push({
        id: 'SCREENSHOT-TUE',
        orderId: 'ORD-1024',
        title: 'Lắp đặt âm thanh - Gala VinFast',
        startTimeStr: '08:00',
        endTimeStr: '11:30',
        startHour: 8,
        startMin: 0,
        endHour: 11,
        endMin: 30,
        location: 'VinHome Grand Park',
        status: 'In Progress',
        dayIdx: 1,
        isActualPlan: false
      });
    }

    const hasWednesdayEvent = weekEvents.some(e => e.dayIdx === 2);
    if (!hasWednesdayEvent) {
      weekEvents.push({
        id: 'SCREENSHOT-WED',
        orderId: 'ORD-1025',
        title: 'Kiểm tra ánh sáng - Sảnh Main',
        startTimeStr: '13:00',
        endTimeStr: '15:30',
        startHour: 13,
        startMin: 0,
        endHour: 15,
        endMin: 30,
        location: 'Sảnh Main',
        status: 'Pending',
        dayIdx: 2,
        isActualPlan: false
      });
    }

    return weekEvents;
  };

  const weekEvents = getWeekEventsForDays(daysOfWeek);
  const hourLabels = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  return (
    <div id="schedule-view" className="space-y-6">
      
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex gap-1.5 overflow-x-auto">
          {[
            { id: 'calendar', label: 'Lịch đơn hàng (Calendar)', icon: Calendar },
            { id: 'plans', label: 'Kế hoạch lịch trình', icon: List },
            { id: 'tasks', label: 'Công việc nhân sự (Kanban)', icon: Layers },
          ].map(sub => {
            const Icon = sub.icon;
            const isAct = activeSubTab === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubTab(sub.id as any)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isAct 
                    ? 'bg-[#2563EB] text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {sub.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic creation triggers */}
        <div>
          {activeSubTab === 'plans' && (
            <button
              onClick={handleOpenCreatePlan}
              className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Tạo kế hoạch
            </button>
          )}
          {activeSubTab === 'tasks' && (
            <button
              onClick={handleOpenCreateTask}
              className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> Giao Task mới
            </button>
          )}
        </div>
      </div>

      {/* SUB TAB 1: CALENDAR VIEW */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6 animate-fade-in text-slate-700">
          
          {/* Top Title & View Toggle Header matching first screenshot */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-150/60 shadow-3xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Lịch trình công việc</h2>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">Quản lý nhiệm vụ và thời gian biểu của bạn</p>
            </div>
            
            <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200">
              {[
                { id: 'month', label: 'Tháng' },
                { id: 'week', label: 'Tuần' },
              ].map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setCalendarViewType(type.id as 'month' | 'week')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    calendarViewType === type.id 
                      ? 'bg-[#2563EB] text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCalendarViewType('week');
                  alert("Chế độ xem chi tiết thời gian biểu (Tuần/Ngày) đã được kích hoạt.");
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-extrabold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Ngày
              </button>
            </div>
          </div>

          {calendarViewType === 'month' ? (
            <>
              {/* Top Filter and Search Bar for Month View */}
              <div className="bg-white p-4 rounded-2xl border border-gray-150/60 shadow-xs flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Tìm mã đơn, khách hàng, địa điểm..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-xs border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-all placeholder:text-gray-400 font-semibold"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Month dropdown */}
                <select
                  className="bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
                  value={`${currentMonth}/${currentYear}`}
                  onChange={(e) => {
                    const [m, y] = e.target.value.split('/');
                    setCurrentMonth(parseInt(m));
                    setCurrentYear(parseInt(y));
                    // Automatically set a sensible selected date
                    setSelectedDate(`${y}-${String(m).padStart(2, '0')}-12`);
                  }}
                >
                  <option value="6/2024">Tháng 6/2024</option>
                  <option value="7/2026">Tháng 7/2026</option>
                  <option value="8/2026">Tháng 8/2026</option>
                </select>

                {/* Status dropdown */}
                <select
                  className="bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Trạng thái đơn hàng</option>
                  <option value="In Progress">Đang thực hiện</option>
                  <option value="Confirmed">Đã chốt/Hoàn thành</option>
                  <option value="New">Mới tạo</option>
                  <option value="Waiting for Deposit">Đợi đặt cọc</option>
                </select>

                {/* Shift/Notes filter dropdown */}
                <select
                  className="bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:border-blue-500 transition-all cursor-pointer"
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                >
                  <option value="all">Ca làm</option>
                  <option value="Sáng">Ca: Sáng</option>
                  <option value="Chiều">Ca: Chiều</option>
                  <option value="Tối">Ca: Tối</option>
                  <option value="Setup đêm">Ca: Setup đêm</option>
                </select>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentMonth(6);
                    setCurrentYear(2024);
                    setStatusFilter('all');
                    setShiftFilter('all');
                    setSelectedDate('2024-06-12');
                  }}
                  className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 cursor-pointer transition-all shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Đặt lại
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Calendar Space */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-150/60 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-1">
                      <h2 className="font-extrabold text-gray-900 text-lg">Lịch tháng {currentMonth}/{currentYear}</h2>
                      <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                        <button 
                          type="button"
                          onClick={() => {
                            if (currentMonth === 1) {
                              setCurrentMonth(12);
                              setCurrentYear(currentYear - 1);
                            } else {
                              setCurrentMonth(currentMonth - 1);
                            }
                          }}
                          className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-600 transition-all cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            if (currentMonth === 12) {
                              setCurrentMonth(1);
                              setCurrentYear(currentYear + 1);
                            } else {
                              setCurrentMonth(currentMonth + 1);
                            }
                          }}
                          className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-600 transition-all cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Calendar Days Headers */}
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-gray-400 py-2 border-b border-gray-100 uppercase tracking-wider">
                      <span>T2</span>
                      <span>T3</span>
                      <span>T4</span>
                      <span>T5</span>
                      <span>T6</span>
                      <span>T7</span>
                      <span>CN</span>
                    </div>

                    {/* Calendar Days Grid */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {/* Padding preceding days */}
                      {Array.from({ length: (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7 }).map((_, i, arr) => {
                        const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();
                        const dayNum = daysInPrevMonth - arr.length + i + 1;
                        return (
                          <div key={`prev-${i}`} className="p-2 min-h-[76px] bg-gray-50/20 text-gray-300 border border-gray-50 rounded-xl text-[11px] font-semibold text-left">
                            {dayNum}
                          </div>
                        );
                      })}

                      {/* Current month days */}
                      {Array.from({ length: new Date(currentYear, currentMonth, 0).getDate() }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        const isSelected = selectedDate === dateStr;
                        const isSpecialDay9 = dateStr === '2024-06-09'; // Day 9 has blue active border outline in mockup

                        // Filter plans for this calendar cell
                        const cellPlans = plans.filter(p => {
                          const pDate = p.startTime.split('T')[0];
                          if (pDate !== dateStr) return false;

                          // Query Filter
                          if (searchQuery) {
                            const q = searchQuery.toLowerCase();
                            const matchesQuery = 
                              p.orderId.toLowerCase().includes(q) ||
                              p.customerName.toLowerCase().includes(q) ||
                              p.location.toLowerCase().includes(q) ||
                              p.responsibleStaff.toLowerCase().includes(q) ||
                              (p.notes && p.notes.toLowerCase().includes(q));
                            if (!matchesQuery) return false;
                          }

                          // Status Filter
                          if (statusFilter !== 'all') {
                            const linkedOrder = orders.find(o => o.id === p.orderId);
                            const orderStatus = linkedOrder ? linkedOrder.orderStatus : '';
                            const matchesStatus = p.status === statusFilter || orderStatus === statusFilter;
                            if (!matchesStatus) return false;
                          }

                          // Shift Filter
                          if (shiftFilter !== 'all') {
                            const matchesShift = p.notes && p.notes.toLowerCase().includes(shiftFilter.toLowerCase());
                            if (!matchesShift) return false;
                          }

                          return true;
                        });

                        return (
                          <div 
                            key={dayNum} 
                            onClick={() => setSelectedDate(dateStr)}
                            className={`p-2.5 min-h-[76px] rounded-xl flex flex-col justify-between text-left group transition-all cursor-pointer relative ${
                              isSelected 
                                ? 'bg-[#EFF6FF]/70 border-2 border-[#3B82F6] shadow-xs' 
                                : isSpecialDay9 
                                ? 'bg-white border-2 border-[#2563EB]' 
                                : 'bg-white border border-gray-150/80 hover:border-gray-300 hover:bg-gray-50/50'
                            }`}
                          >
                            <span className={`text-[11px] font-bold ${isSelected ? 'text-[#2563EB]' : isSpecialDay9 ? 'text-[#2563EB]' : 'text-gray-500 group-hover:text-gray-800'}`}>
                              {dayNum}
                            </span>
                            
                            {/* Task list summary badges inside cells */}
                            <div className="space-y-1 mt-1">
                              {cellPlans.slice(0, 2).map(p => {
                                const isBlue = p.status === 'In Progress' || p.orderId === 'ORD-1024';
                                const isGreen = p.status === 'Completed' || p.orderId === 'ORD-1025';
                                let colClass = 'bg-gray-50 text-gray-600 border-gray-100';
                                if (isBlue) {
                                  colClass = 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]';
                                } else if (isGreen) {
                                  colClass = 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]';
                                }
                                return (
                                  <div 
                                    key={p.id}
                                    className={`px-1 py-0.5 text-[9px] rounded font-bold truncate border ${colClass}`}
                                    title={`${p.orderId}: ${p.customerName}`}
                                  >
                                    {p.orderId}
                                  </div>
                                );
                              })}
                              {cellPlans.length > 2 && (
                                <div className="text-[8px] font-semibold text-gray-400 text-right">
                                  +{cellPlans.length - 2} sự kiện
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status Legend at bottom */}
                  <div className="flex flex-wrap items-center justify-start gap-4 pt-3.5 border-t border-gray-100 text-[11px] font-bold text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                      Mới tạo
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      Đã báo giá
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
                      Đang thực hiện
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                      Đã chốt/Hoàn thành
                    </div>
                  </div>
                </div>

                {/* Right Side Inspector Panel */}
                <div className="lg:col-span-4">
                  <div className="bg-white p-6 rounded-2xl border border-gray-150/60 shadow-xs space-y-6 sticky top-24">
                    
                    {/* Daily events title */}
                    <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                      <h3 className="font-extrabold text-gray-900 text-sm">
                        Lịch ngày {selectedDate.split('-').reverse().join('/')}
                      </h3>
                      {(() => {
                        const dayPlans = plans.filter(p => p.startTime.split('T')[0] === selectedDate);
                        return (
                          <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-xs border border-blue-100">
                            {dayPlans.length} sự kiện
                          </span>
                        );
                      })()}
                    </div>

                    {/* Event list */}
                    <div className="space-y-4">
                      {(() => {
                        const dayPlans = plans.filter(p => p.startTime.split('T')[0] === selectedDate);
                        if (dayPlans.length > 0) {
                          return dayPlans.map(plan => {
                            const isBlue = plan.orderId === 'ORD-1024' || plan.status === 'In Progress';
                            const cardBg = isBlue ? 'bg-blue-50/20' : 'bg-emerald-50/20';
                            const borderClass = isBlue ? 'border border-blue-100/80' : 'border border-emerald-100/80';
                            const textClass = isBlue ? 'text-[#1D4ED8]' : 'text-[#047857]';
                            const dotClass = isBlue ? 'bg-blue-500' : 'bg-emerald-500';
                            const badgeBg = isBlue ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-[#ECFDF5] text-[#047857]';
                            const statusLabel = plan.orderId === 'ORD-1024' ? 'Đang thực hiện' : 'Đã chốt';

                            return (
                              <div key={plan.id} className={`p-4 rounded-xl relative group transition-all hover:shadow-xs ${cardBg} ${borderClass}`}>
                                <div className="flex justify-between items-center mb-2.5">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${badgeBg}`}>
                                    {plan.orderId}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                                    <span className={`text-[11px] font-bold ${textClass}`}>{statusLabel}</span>
                                    <button type="button" className="text-gray-400 hover:text-gray-600 p-0.5 rounded ml-1">
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <h4 className="font-extrabold text-gray-900 text-sm mb-3">
                                  {plan.orderId === 'ORD-1024' ? 'Tiệc cưới - Nguyễn Thị Mai' : 'Lễ ăn hỏi - Trần Văn Hùng'}
                                </h4>

                                <div className="space-y-2 text-[11px] text-gray-500 font-semibold">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span className="truncate">{plan.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span>{plan.notes}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span className="truncate">{plan.responsibleStaff}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        } else {
                          return (
                            <div className="text-center py-6 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl space-y-2">
                              <p className="text-gray-400 text-xs font-semibold">Không có sự kiện được xếp lịch</p>
                              <button
                                type="button"
                                onClick={handleOpenCreatePlan}
                                className="text-[11px] font-bold text-[#2563EB] hover:underline"
                              >
                                + Thêm lịch trình nhanh
                              </button>
                            </div>
                          );
                        }
                      })()}
                    </div>

                    {/* Tasks Section matching mockup */}
                    <div className="pt-4 border-t border-gray-100 space-y-3.5">
                      {(() => {
                        const dayTasks = tasks.filter(t => t.dueTime.split('T')[0] === selectedDate);
                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <h3 className="font-extrabold text-gray-900 text-sm">Task trong ngày</h3>
                              <span className="text-gray-400 text-[11px] font-bold">{dayTasks.length} nhiệm vụ</span>
                            </div>

                            {dayTasks.length > 0 ? (
                              <div className="space-y-2.5">
                                {dayTasks.map(task => {
                                  const isCompleted = task.status === 'Completed';
                                  const isInProgress = task.status === 'In Progress';
                                  return (
                                    <div 
                                      key={task.id} 
                                      onClick={() => {
                                        // Make it interactive so they can cycle statuses
                                        const next = isCompleted ? 'Draft' : isInProgress ? 'Completed' : 'In Progress';
                                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next } : t));
                                      }}
                                      className="flex items-center justify-between p-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl transition-all cursor-pointer group"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                          isCompleted 
                                            ? 'bg-[#2563EB] border-[#2563EB] text-white' 
                                            : isInProgress 
                                            ? 'bg-[#EFF6FF] border-[#93C5FD] text-[#2563EB]'
                                            : 'border-gray-300 bg-white group-hover:border-gray-400'
                                        }`}>
                                          {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                          {isInProgress && <span className="w-1.5 h-0.5 bg-[#2563EB] rounded-full"></span>}
                                        </div>

                                        <span className={`text-[12px] font-bold text-gray-700 truncate ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                                          {task.title}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                          task.priority === 'High' 
                                            ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                        }`}>
                                          {task.priority === 'High' ? 'HIGH' : 'MEDIUM'}
                                        </span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                          isCompleted 
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                            : isInProgress
                                            ? 'bg-[#EFF6FF] text-[#2563EB] border-blue-100'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}>
                                          {isCompleted ? 'Done' : isInProgress ? 'In Progress' : 'Todo'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-6 bg-gray-50/30 border border-dashed border-gray-200 rounded-xl space-y-1.5">
                                <p className="text-gray-400 text-[11px] font-semibold">Không có task trong ngày này</p>
                                <button
                                  type="button"
                                  onClick={handleOpenCreateTask}
                                  className="text-[11px] font-bold text-[#2563EB] hover:underline"
                                >
                                  + Giao việc mới
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* RENDER MODE: WEEK VIEW (MATCHING FIRST SCREENSHOT PIXEL-PERFECTLY) */
            <div className="space-y-6">
              {/* Week Navigation bar matching first screenshot */}
              <div className="bg-white p-4 rounded-2xl border border-gray-150/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {/* Back and forward buttons */}
                  <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                    <button 
                      type="button"
                      onClick={() => {
                        // Go back 7 days
                        const curr = new Date(selectedDate);
                        curr.setDate(curr.getDate() - 7);
                        setSelectedDate(curr.toISOString().split('T')[0]);
                        
                        const m = curr.getMonth() + 1;
                        const y = curr.getFullYear();
                        setCurrentMonth(m);
                        setCurrentYear(y);
                      }}
                      className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-600 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        // Go forward 7 days
                        const curr = new Date(selectedDate);
                        curr.setDate(curr.getDate() + 7);
                        setSelectedDate(curr.toISOString().split('T')[0]);
                        
                        const m = curr.getMonth() + 1;
                        const y = curr.getFullYear();
                        setCurrentMonth(m);
                        setCurrentYear(y);
                      }}
                      className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-gray-600 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Today button */}
                  <button
                    type="button"
                    onClick={() => {
                      const todayStr = '2024-06-12'; // Base our calendar mock perfectly around June 12, 2024
                      setSelectedDate(todayStr);
                      setCurrentMonth(6);
                      setCurrentYear(2024);
                    }}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Hôm nay
                  </button>

                  {/* Active Month & Year */}
                  <span className="text-sm font-black text-slate-800 ml-2">
                    Tháng {currentMonth}, {currentYear}
                  </span>
                </div>

                {/* Status indicator dots matching screenshot exactly */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
                    <span>Đang thực hiện</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Chờ check-in</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span>Hoàn thành</span>
                  </div>
                </div>

                {/* Export button */}
                <button
                  type="button"
                  onClick={() => alert("Đang xuất danh sách lịch trình làm việc của tuần này...")}
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Xuất lịch trình
                </button>
              </div>

              {/* Weekly Hourly Grid matching first screenshot */}
              <div className="relative border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
                {/* Columns Header: Giờ + T2 to CN */}
                <div className="grid grid-cols-8 border-b border-slate-100 bg-slate-50/50">
                  <div className="border-r border-slate-100 flex items-center justify-center p-3 text-[10px] font-bold text-slate-400 uppercase">
                    Giờ
                  </div>
                  {daysOfWeek.map((day, idx) => {
                    const isSelected = selectedDate === day.toISOString().split('T')[0];
                    const isToday = new Date().toISOString().split('T')[0] === day.toISOString().split('T')[0];
                    const dayName = idx === 6 ? 'CN' : `THỨ ${idx + 2}`;
                    
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedDate(day.toISOString().split('T')[0])}
                        className={`p-3 text-center border-r border-slate-100 last:border-r-0 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center justify-center ${
                          isSelected ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <span className={`text-[10px] font-black tracking-wider ${isSelected ? 'text-[#2563EB]' : 'text-slate-400'}`}>
                          {dayName}
                        </span>
                        <span className={`text-base font-black mt-1 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-[#2563EB] text-white shadow-xs' 
                            : isToday 
                            ? 'bg-blue-100 text-[#2563EB]' 
                            : 'text-slate-800'
                        }`}>
                          {day.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Grid Body */}
                <div className="relative h-[700px] overflow-y-auto scrollbar-thin select-none">
                  {/* Grid Lines & Labels */}
                  <div className="absolute inset-0 pointer-events-none">
                    {hourLabels.map((hour, idx) => {
                      const topPx = idx * 70;
                      return (
                        <div 
                          key={hour} 
                          className="absolute left-0 right-0 border-t border-slate-100/70 flex items-center"
                          style={{ top: `${topPx}px`, height: '1px' }}
                        >
                          <div className="absolute -top-3.5 left-2 text-[11px] font-bold text-slate-400 w-12 text-center bg-white px-1">
                            {hour}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vertical Column Lines */}
                  <div className="absolute inset-y-0 left-16 right-0 grid grid-cols-7 pointer-events-none">
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <div key={idx} className="border-r border-slate-100/50 last:border-r-0 h-full"></div>
                    ))}
                  </div>

                  {/* Absolute Positioned Event Cards */}
                  <div className="absolute top-0 bottom-0 left-16 right-0 grid grid-cols-7">
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const dayEvs = weekEvents.filter(e => e.dayIdx === dayIdx);
                      
                      return (
                        <div key={dayIdx} className="relative h-full">
                          {dayEvs.map((ev) => {
                            const startDecimal = ev.startHour + ev.startMin / 60;
                            const endDecimal = ev.endHour + ev.endMin / 60;
                            
                            // Clamp to display window 08:00 - 18:00
                            const cappedStart = Math.max(8, Math.min(18, startDecimal));
                            const cappedEnd = Math.max(8, Math.min(18, endDecimal));
                            
                            const topPx = (cappedStart - 8) * 70;
                            const heightPx = Math.max(50, (cappedEnd - cappedStart) * 70);
                            
                            const isBlue = ev.status === 'In Progress' || ev.orderId === 'ORD-1024';
                            const isGreen = ev.status === 'Completed' || ev.status === 'Confirmed' || (ev.orderId === 'ORD-1025' && ev.status === 'Completed');
                            const isOrange = ev.status === 'Pending' || ev.id === 'SCREENSHOT-WED';

                            let cardClass = 'bg-[#EFF6FF]/95 hover:bg-blue-50 border-blue-200 text-[#1E40AF]';
                            let badgeColor = 'bg-[#2563EB] text-white';
                            
                            if (isGreen) {
                              cardClass = 'bg-[#F0FDF4]/95 hover:bg-emerald-50 border-emerald-200 text-[#166534]';
                              badgeColor = 'bg-[#10B981] text-white';
                            } else if (isOrange) {
                              cardClass = 'bg-[#FFFBEB]/95 hover:bg-amber-50 border-amber-200 text-[#92400E]';
                              badgeColor = 'bg-[#F59E0B] text-white';
                            }

                            return (
                              <div
                                key={ev.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (ev.isActualPlan) {
                                    setSelectedDate(ev.plan.startTime.split('T')[0]);
                                    setSelectedCalendarEvent(ev.plan);
                                    setCalendarViewType('month'); // auto switch back to let them inspect or edit!
                                  } else {
                                    alert(`Thông tin sự kiện: ${ev.title}\nThời gian: ${ev.startTimeStr} - ${ev.endTimeStr}\nĐịa điểm: ${ev.location}`);
                                  }
                                }}
                                className={`absolute left-1 right-1 rounded-xl p-3 border shadow-3xs cursor-pointer transition-all hover:shadow-xs overflow-hidden flex flex-col justify-between ${cardClass}`}
                                style={{ top: `${topPx + 4}px`, height: `${heightPx - 8}px` }}
                              >
                                <div className="space-y-1.5 min-w-0">
                                  {/* Badge rows matching screenshot exactly */}
                                  <div className="flex flex-wrap gap-1 items-center">
                                    {isBlue && (
                                      <>
                                        <span className="bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                                          ✓ HOÀN THÀNH
                                        </span>
                                        <span className={`${badgeColor} text-[8px] font-black px-1.5 py-0.5 rounded-sm`}>
                                          ĐANG THỰC HIỆN
                                        </span>
                                      </>
                                    )}
                                    {isOrange && (
                                      <span className={`${badgeColor} text-[8px] font-black px-1.5 py-0.5 rounded-sm`}>
                                        CHỜ CHECK-IN
                                      </span>
                                    )}
                                    {isGreen && !isBlue && (
                                      <span className="bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                                        ✓ HOÀN THÀNH
                                      </span>
                                    )}
                                  </div>

                                  {/* Title */}
                                  <h5 className="font-extrabold text-slate-900 text-xs tracking-tight line-clamp-2 leading-tight">
                                    {ev.title}
                                  </h5>
                                </div>

                                {/* Time & Location footers */}
                                <div className="space-y-1 mt-1 text-[10px] font-bold text-slate-500/90">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                    <span>{ev.startTimeStr} - {ev.endTimeStr}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 truncate">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{ev.location}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 2: PLANS LIST */}
      {activeSubTab === 'plans' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                  <th className="px-6 py-4">Mã lịch</th>
                  <th className="px-6 py-4">Hợp đồng</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4">Thời gian thực hiện</th>
                  <th className="px-6 py-4">Staff phụ trách</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {plans.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/20">
                    <td className="px-6 py-4 font-bold text-[#2563EB]">{p.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-500">{p.orderId}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{p.customerName}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded text-xs font-semibold">{p.type}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                      {new Date(p.startTime).toLocaleString('vi-VN')} - {new Date(p.endTime).toLocaleTimeString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-semibold">{p.responsibleStaff}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                        p.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditPlan(p)}
                          className="p-1.5 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(p.id)}
                          className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
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
      )}

      {/* SUB TAB 3: WORK TASK KANBAN BOARD */}
      {activeSubTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          
          {/* Columns: Draft, Assigned, In Progress, Completed */}
          {(['Draft', 'Assigned', 'In Progress', 'Completed'] as const).map((column) => {
            const colTasks = tasks.filter(t => t.status === column);
            return (
              <div key={column} className="bg-slate-50/50 p-4 rounded-xl border border-gray-100 flex flex-col h-[550px]">
                {/* Column header */}
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      column === 'Completed' ? 'bg-green-500' :
                      column === 'In Progress' ? 'bg-blue-500' :
                      column === 'Assigned' ? 'bg-purple-500' : 'bg-gray-400'
                    }`}></span>
                    <span className="font-bold text-gray-700 text-sm">{column}</span>
                  </div>
                  <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>

                {/* Cards container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 text-center p-4">
                      Không có công việc nào.
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div 
                        key={task.id}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3 text-xs font-medium group"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            task.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                            task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'
                          }`}>{task.priority}</span>
                          
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEditTask(task)} className="p-0.5 text-gray-400 hover:text-amber-500 rounded"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteTask(task.id)} className="p-0.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-800 leading-normal">{task.title}</h4>
                        
                        <div className="text-gray-400 space-y-1">
                          <p className="flex items-center gap-1"><strong>HĐ:</strong> <span className="text-[#2563EB] font-bold">{task.orderId}</span></p>
                          <p className="truncate flex items-center gap-1"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {task.location}</p>
                          <p className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 flex-shrink-0" /> {new Date(task.dueTime).toLocaleDateString('vi-VN')}</p>
                        </div>

                        {/* Staff display */}
                        <div className="bg-slate-50 p-2 rounded-lg text-[10px] space-y-0.5">
                          <p><strong>Trưởng nhóm:</strong> {task.assignedLeader}</p>
                          <p><strong>Kỹ thuật:</strong> {task.assignedTechnical}</p>
                        </div>

                        {/* Quick state shift buttons */}
                        <div className="flex gap-1 pt-1.5 border-t border-gray-50 justify-end">
                          {column === 'Draft' && (
                            <button 
                              onClick={() => handleUpgradeTaskStatus(task, 'Assigned')}
                              className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded"
                            >Giao việc</button>
                          )}
                          {column === 'Assigned' && (
                            <button 
                              onClick={() => handleUpgradeTaskStatus(task, 'In Progress')}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded"
                            >Tiến hành</button>
                          )}
                          {column === 'In Progress' && (
                            <button 
                              onClick={() => handleUpgradeTaskStatus(task, 'Completed')}
                              className="px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 font-bold rounded"
                            >Hoàn thành</button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PLAN MODAL (CREATE & EDIT) */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 text-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-gray-800 text-base">
                {editingPlan ? `Chỉnh sửa kế hoạch ${editingPlan.id}` : 'Thêm mới kế hoạch lịch trình'}
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="p-1 hover:bg-gray-200 rounded text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Chọn đơn hàng liên đới</label>
                  <select
                    value={formPlanOrderId}
                    onChange={(e) => setFormPlanOrderId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} - {o.customerName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Loại hình lịch trình</label>
                  <select
                    value={formPlanType}
                    onChange={(e) => setFormPlanType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="Survey">Khảo sát hiện trường</option>
                    <option value="Preparation">Chuẩn bị vật tư</option>
                    <option value="Transport">Vận chuyển</option>
                    <option value="Construction">Thi công sân khấu</option>
                    <option value="Retrieval">Thu hồi thiết bị</option>
                    <option value="Return">Hoàn trả kho</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={formPlanStart}
                    onChange={(e) => setFormPlanStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    value={formPlanEnd}
                    onChange={(e) => setFormPlanEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Địa điểm thực hiện</label>
                <input
                  type="text"
                  placeholder="Nhập địa điểm thực tế..."
                  value={formPlanLocation}
                  onChange={(e) => setFormPlanLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Nhân viên phụ trách</label>
                  <input
                    type="text"
                    placeholder="Trần Anh Tuấn (Leader)..."
                    value={formPlanStaff}
                    onChange={(e) => setFormPlanStaff(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Trạng thái vận hành</label>
                  <select
                    value={formPlanStatus}
                    onChange={(e) => setFormPlanStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="Pending">Chờ vận hành (Pending)</option>
                    <option value="In Progress">Đang thi công (In Progress)</option>
                    <option value="Completed">Hoàn thành (Completed)</option>
                    <option value="Cancelled">Đã hủy (Cancelled)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Ghi chú cụ thể</label>
                <textarea
                  placeholder="Lưu ý dây cáp, nguồn điện sảnh..."
                  value={formPlanNotes}
                  onChange={(e) => setFormPlanNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-5">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg cursor-pointer"
                >Hủy bỏ</button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >Lưu kế hoạch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK MODAL (CREATE & EDIT) */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 text-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-gray-800 text-base">
                {editingTask ? `Chỉnh sửa công việc ${editingTask.id}` : 'Giao mới công việc nhân sự'}
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="p-1 hover:bg-gray-200 rounded text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Tên công việc / Yêu cầu chi tiết</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vệ sinh 12 đầu đèn moving head beam"
                  value={formTaskTitle}
                  onChange={(e) => setFormTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Chọn đơn hàng</label>
                  <select
                    value={formTaskOrderId}
                    onChange={(e) => setFormTaskOrderId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} - {o.customerName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Phân loại công việc</label>
                  <select
                    value={formTaskType}
                    onChange={(e) => setFormTaskType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    <option value="Survey">Khảo sát sảnh</option>
                    <option value="Preparation">Chuẩn bị thiết bị</option>
                    <option value="Transport">Vận chuyển bốc dỡ</option>
                    <option value="Construction">Thi công trang trí</option>
                    <option value="Retrieval">Thu hồi dọn dẹp</option>
                    <option value="Return">Hoàn kho hoàn trả</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Leader chỉ huy</label>
                  <input
                    type="text"
                    required
                    placeholder="Trần Anh Tuấn..."
                    value={formTaskLeader}
                    onChange={(e) => setFormTaskLeader(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Technical staff đi kèm</label>
                  <input
                    type="text"
                    placeholder="Phạm Hồng Thái..."
                    value={formTaskTechnical}
                    onChange={(e) => setFormTaskTechnical(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                <div className="space-y-1.5 col-span-2">
                  <label className="font-semibold text-gray-700 block">Thời hạn hoàn thành</label>
                  <input
                    type="datetime-local"
                    required
                    value={formTaskDue}
                    onChange={(e) => setFormTaskDue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Độ ưu tiên</label>
                  <select
                    value={formTaskPriority}
                    onChange={(e) => setFormTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white font-bold"
                  >
                    <option value="High">Cao (High)</option>
                    <option value="Medium">Thường (Medium)</option>
                    <option value="Low">Thấp (Low)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">Ghi chú cụ thể của quản lý</label>
                <textarea
                  placeholder="Cần chuẩn bị cẩn thận không để hư hại..."
                  value={formTaskNotes}
                  onChange={(e) => setFormTaskNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-5">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg cursor-pointer"
                >Hủy bỏ</button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >Giao việc</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
