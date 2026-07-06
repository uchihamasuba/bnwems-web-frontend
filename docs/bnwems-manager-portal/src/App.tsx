import React, { useState } from 'react';
import { 
  initialCustomers, 
  initialOrders, 
  initialQuotations, 
  initialSchedulePlans, 
  initialTasks, 
  initialSurveyReports, 
  initialInventory, 
  initialPickLists, 
  initialSuppliers, 
  initialProcurements, 
  initialDepositRequests, 
  initialWages,
  Customer,
  Order,
  Quotation,
  SchedulePlan,
  WorkTask,
  SurveyReport,
  InventoryItem,
  PickList,
  Supplier,
  ProcurementRequest,
  DepositRequest,
  PaymentHistory,
  WageRecord
} from './mockData';

// Component Imports
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import CustomersView from './components/CustomersView';
import QuotationsView from './components/QuotationsView';
import OrdersView from './components/OrdersView';
import ScheduleView from './components/ScheduleView';
import SurveyView from './components/SurveyView';
import InventoryView from './components/InventoryView';
import SuppliersView from './components/SuppliersView';
import PaymentsView from './components/PaymentsView';
import WagesView from './components/WagesView';

// Self-contained Profile card to support use cases / passwords
function ProfileView() {
  const [passWord, setPassWord] = useState('*********');
  const [showPass, setShowPass] = useState(false);
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 max-w-xl animate-fade-in text-sm">
      <div className="border-b border-gray-50 pb-3">
        <h2 className="text-xl font-bold text-gray-800">Thông tin tài khoản Manager</h2>
        <p className="text-xs text-gray-400 mt-0.5">Quản lý định danh cá nhân và mật khẩu truy cập hệ thống WEMS.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 border border-blue-200 text-[#2563EB] font-black text-2xl flex items-center justify-center">
          T
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-base">Vũ Tuyết Trinh</h3>
          <p className="text-xs text-gray-400 font-medium">Vai trò: Trưởng phòng điều phối sự kiện (Manager)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-gray-400 font-bold block uppercase">Email liên hệ</span>
          <span className="font-semibold text-gray-700 mt-1 block">vutuyettrinh2004@gmail.com</span>
        </div>
        <div>
          <span className="text-gray-400 font-bold block uppercase">Số điện thoại</span>
          <span className="font-semibold text-gray-700 mt-1 block">0987 654 321</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400 font-bold block uppercase">Mật khẩu bảo mật</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono font-bold text-gray-700 bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
              {showPass ? 'TrinhVEMS2026!' : '••••••••••••'}
            </span>
            <button 
              onClick={() => setShowPass(!showPass)} 
              className="text-xs text-[#2563EB] hover:underline font-bold"
            >
              {showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Navigation Routing States
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  // Master Data States (all in memory to support dynamic mutations)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [plans, setPlans] = useState<SchedulePlan[]>(initialSchedulePlans);
  const [tasks, setTasks] = useState<WorkTask[]>(initialTasks);
  const [reports, setReports] = useState<SurveyReport[]>(initialSurveyReports);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [pickLists, setPickLists] = useState<PickList[]>(initialPickLists);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [procurements, setProcurements] = useState<ProcurementRequest[]>(
    initialProcurements.map(p => ({
      id: p.id,
      orderId: p.orderId,
      supplierId: p.supplierId,
      supplierName: p.supplierName,
      serviceTitle: p.items[0]?.name || 'Thuê dịch vụ',
      estimatedCost: p.totalCost,
      depositAmount: Math.round(p.totalCost * 0.3),
      status: p.status === 'Confirmed' ? 'Approved' : 'Waiting for Approval',
      notes: p.notes
    }))
  );
  const [deposits, setDeposits] = useState<DepositRequest[]>(
    initialDepositRequests.map(d => ({
      id: d.id,
      orderId: d.orderId,
      customerName: d.customerName,
      amount: d.depositAmount,
      dueDate: d.dueDate,
      status: d.status === 'Confirmed' ? 'Confirmed' : 'Waiting for Deposit'
    }))
  );
  const [payments, setPayments] = useState<PaymentHistory[]>([
    {
      id: 'PAY-001',
      orderId: 'ORD-001',
      amount: 12900000,
      paymentType: 'Deposit',
      paymentDate: '2026-06-15',
      paymentMethod: 'VNPay QR Code Auto',
      approvedBy: 'Hệ thống tự động',
      status: 'Success'
    }
  ]);
  const [wages, setWages] = useState<WageRecord[]>(
    initialWages.map(w => {
      const sCount = w.shiftsCount || 1;
      const bSalary = w.baseSalary || 300000;
      return {
        id: w.id,
        orderId: w.shifts?.[0]?.orderId || 'ORD-001',
        staffName: w.staffName,
        role: w.role === 'Leader Staff' ? 'Leader Điều phối' : 'Kỹ thuật Âm thanh',
        shifts: sCount,
        wageRate: Math.round(bSalary / sCount),
        totalWage: w.estimatedWage || bSalary,
        status: w.status === 'Confirmed' ? 'Confirmed' : 'Pending Approval',
        notes: w.shifts?.[0]?.notes || 'Làm ca công nhật'
      };
    })
  );

  // ID Focus States for Detail views
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Common Notification states
  const [notifications, setNotifications] = useState([
    { id: 'n-1', text: 'Có báo cáo khảo sát mới cho Đơn hàng ORD-002 sảnh Pollux', time: '5 phút trước' },
    { id: 'n-2', text: 'Yêu cầu thanh toán cọc DEP-002 vừa được tạo QR', time: '1 giờ trước' },
    { id: 'n-3', text: 'Hợp đồng ORD-001 được đặt lịch thi công ngày 14/07', time: '2 giờ trước' }
  ]);
  const [showNotificationsList, setShowNotificationsList] = useState(false);

  // Quick payment popup controls (shared from detail views)
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrAmount, setQrAmount] = useState(0);
  const [qrOrderId, setQrOrderId] = useState('');

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositOrderId, setDepositOrderId] = useState('');

  // Handle cross-navigation shortcut helpers
  const handleNavigate = (route: string, menu: string) => {
    setCurrentRoute(route);
    setCurrentMenu(menu);
  };

  const handleGlobalSearch = (term: string) => {
    console.log('Search dispatched:', term);
  };

  const toggleNotifications = () => {
    setShowNotificationsList(!showNotificationsList);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Left Sidebar Layout */}
      <Sidebar 
        currentMenu={currentMenu}
        setCurrentMenu={setCurrentMenu}
        setCurrentRoute={setCurrentRoute}
        managerName="Vũ Tuyết Trinh"
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 pl-[260px] pt-14 min-h-screen relative">
        <Topbar 
          currentRoute={currentRoute}
          currentMenu={currentMenu}
          setCurrentRoute={setCurrentRoute}
          setCurrentMenu={setCurrentMenu}
          managerName="Vũ Tuyết Trinh"
          onSearch={handleGlobalSearch}
          notificationCount={notifications.length}
          toggleNotifications={toggleNotifications}
        />

        {/* Floating Notification Popover */}
        {showNotificationsList && (
          <div className="absolute right-6 top-14 w-80 bg-white rounded-xl border border-gray-100 shadow-xl py-2 z-50 animate-fade-in text-xs text-gray-700">
            <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-slate-50">
              <h4 className="font-bold text-gray-800">Thông báo vận hành</h4>
              <button 
                onClick={() => setNotifications([])}
                className="text-[10px] text-blue-600 hover:underline font-bold"
              >
                Đánh dấu đã đọc
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-center py-6 text-gray-400">Không có thông báo mới.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(not => (
                  <div key={not.id} className="p-3 hover:bg-gray-50 transition-colors">
                    <p className="font-semibold leading-normal text-gray-800">{not.text}</p>
                    <span className="text-[10px] text-gray-400 block mt-1">{not.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dynamic Inner Body Container with large card padding */}
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            
            {/* 1. DASHBOARD OVERVIEW */}
            {currentRoute === 'dashboard' && (
              <DashboardView 
                orders={orders}
                quotations={quotations}
                tasks={tasks}
                plans={plans}
                reports={reports}
                inventory={inventory}
                wages={wages}
                onNavigate={handleNavigate}
                onSelectOrder={(id) => { setSelectedOrderId(id); handleNavigate('order-detail', 'orders'); }}
                onSelectCustomer={(id) => { setSelectedCustomerId(id); handleNavigate('customer-detail', 'customers'); }}
                onSelectReport={(id) => { setSelectedReportId(id); handleNavigate('survey-report', 'survey'); }}
              />
            )}

            {/* 2. CUSTOMERS VIEW */}
            {(currentRoute === 'customers' || currentRoute === 'customer-detail') && (
              <CustomersView 
                customers={customers}
                setCustomers={setCustomers}
                orders={orders}
                onNavigate={handleNavigate}
                onSelectCustomer={setSelectedCustomerId}
                selectedCustomerId={selectedCustomerId}
                onSelectOrder={(id) => { setSelectedOrderId(id); handleNavigate('order-detail', 'orders'); }}
                currentRoute={currentRoute}
                setCurrentRoute={setCurrentRoute}
              />
            )}

            {/* 3. QUOTATIONS VIEW */}
            {(currentRoute === 'quotations' || currentRoute === 'quotation-detail' || currentRoute === 'quotation-create') && (
              <QuotationsView 
                quotations={quotations}
                setQuotations={setQuotations}
                customers={customers}
                orders={orders}
                onSelectQuotation={setSelectedQuotationId}
                selectedQuotationId={selectedQuotationId}
                currentRoute={currentRoute}
                setCurrentRoute={setCurrentRoute}
              />
            )}

            {/* 4. ORDERS VIEW */}
            {(currentRoute === 'orders' || currentRoute === 'order-detail' || currentRoute === 'order-create') && (
              <OrdersView 
                orders={orders}
                setOrders={setOrders}
                customers={customers}
                quotations={quotations}
                setQuotations={setQuotations}
                deposits={deposits}
                setDeposits={setDeposits}
                reports={reports}
                inventory={inventory}
                pickLists={pickLists}
                setPickLists={setPickLists}
                onSelectOrder={setSelectedOrderId}
                selectedOrderId={selectedOrderId}
                onNavigate={handleNavigate}
                onSelectCustomer={(id) => { setSelectedCustomerId(id); handleNavigate('customer-detail', 'customers'); }}
                onSelectQuotation={(id) => { setSelectedQuotationId(id); handleNavigate('quotation-detail', 'quotations'); }}
                onSelectReport={(id) => { setSelectedReportId(id); handleNavigate('survey-report', 'survey'); }}
                currentRoute={currentRoute}
                setCurrentRoute={setCurrentRoute}
                openQrModal={(id, amt) => { setQrOrderId(id); setQrAmount(amt); setQrModalOpen(true); }}
                openDepositModal={(id) => { setDepositOrderId(id); setDepositModalOpen(true); }}
              />
            )}

            {/* 5. SCHEDULE VIEW (Calendar, Plans, Tasks unified) */}
            {(currentRoute === 'schedule-calendar' || currentRoute === 'schedule-plans' || currentRoute === 'schedule-tasks') && (
              <ScheduleView 
                orders={orders}
                plans={plans}
                setPlans={setPlans}
                tasks={tasks}
                setTasks={setTasks}
                onSelectOrder={(id) => { setSelectedOrderId(id); handleNavigate('order-detail', 'orders'); }}
                onNavigate={handleNavigate}
              />
            )}

            {/* 6. SURVEYS TRACKING */}
            {(currentRoute === 'survey' || currentRoute === 'survey-report') && (
              <SurveyView 
                reports={reports}
                setReports={setReports}
                orders={orders}
                onSelectOrder={(id) => { setSelectedOrderId(id); handleNavigate('order-detail', 'orders'); }}
                onNavigate={handleNavigate}
                selectedReportId={selectedReportId}
                onSelectReport={setSelectedReportId}
              />
            )}

            {/* 7. INVENTORY VIEWS */}
            {(currentRoute === 'inventory-availability' || currentRoute === 'pick-lists') && (
              <InventoryView 
                orders={orders}
                pickLists={pickLists}
                setPickLists={setPickLists}
                tasks={tasks}
                onNavigate={handleNavigate}
                inventory={inventory}
                setInventory={setInventory}
              />
            )}

            {/* 8. SUPPLIERS AND PROCUREMENT VIEWS */}
            {(currentRoute === 'suppliers' || currentRoute === 'procurement' || currentRoute === 'procurement-create') && (
              <SuppliersView 
                orders={orders}
                suppliers={suppliers}
                setSuppliers={setSuppliers}
                procurements={procurements}
                setProcurements={setProcurements}
                onNavigate={handleNavigate}
              />
            )}

            {/* 9. PAYMENTS VIEWS */}
            {(currentRoute === 'payments-deposits' || currentRoute === 'payments-debts') && (
              <PaymentsView 
                orders={orders}
                setOrders={setOrders}
                deposits={deposits}
                setDeposits={setDeposits}
                payments={payments}
                setPayments={setPayments}
                qrModalOpen={qrModalOpen}
                setQrModalOpen={setQrModalOpen}
                qrAmount={qrAmount}
                setQrAmount={setQrAmount}
                qrOrderId={qrOrderId}
                setQrOrderId={setQrOrderId}
                depositModalOpen={depositModalOpen}
                setDepositModalOpen={setDepositModalOpen}
                depositOrderId={depositOrderId}
                setDepositOrderId={setDepositOrderId}
              />
            )}

            {/* 10. WAGES VIEW */}
            {currentRoute === 'wages' && (
              <WagesView 
                orders={orders}
                wages={wages}
                setWages={setWages}
              />
            )}

            {/* 11. PROFILE VIEW */}
            {currentRoute === 'profile' && <ProfileView />}

          </div>
        </main>
      </div>
    </div>
  );
}
