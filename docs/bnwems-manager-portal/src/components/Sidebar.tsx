import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingBag,
  Calendar,
  ClipboardList,
  Package,
  Truck,
  ShoppingCart,
  CreditCard,
  Coins,
  User,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentMenu: string;
  setCurrentMenu: (menu: string) => void;
  setCurrentRoute: (route: string) => void;
  managerName: string;
}

export default function Sidebar({
  currentMenu,
  setCurrentMenu,
  setCurrentRoute,
  managerName,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'quotations', label: 'Báo giá', icon: FileText },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
    { id: 'schedule', label: 'Lịch trình', icon: Calendar },
    { id: 'survey', label: 'Khảo sát', icon: ClipboardList },
    { id: 'inventory', label: 'Tồn kho', icon: Package },
    { id: 'suppliers', label: 'Nhà cung cấp', icon: Truck },
    { id: 'procurement', label: 'Mua sắm', icon: ShoppingCart },
    { id: 'payments', label: 'Thanh toán', icon: CreditCard },
    { id: 'wages', label: 'Công & lương', icon: Coins },
  ];

  const handleMenuClick = (menuId: string) => {
    setCurrentMenu(menuId);
    // Set standard route when main menu is clicked
    if (menuId === 'dashboard') setCurrentRoute('dashboard');
    else if (menuId === 'customers') setCurrentRoute('customers');
    else if (menuId === 'quotations') setCurrentRoute('quotations');
    else if (menuId === 'orders') setCurrentRoute('orders');
    else if (menuId === 'schedule') setCurrentRoute('schedule-calendar');
    else if (menuId === 'survey') setCurrentRoute('survey');
    else if (menuId === 'inventory') setCurrentRoute('inventory-availability');
    else if (menuId === 'suppliers') setCurrentRoute('suppliers');
    else if (menuId === 'procurement') setCurrentRoute('procurement');
    else if (menuId === 'payments') setCurrentRoute('payments-deposits');
    else if (menuId === 'wages') setCurrentRoute('wages');
  };

  return (
    <aside id="sidebar-left" className="w-[260px] bg-[#111827] text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-30">
      {/* Brand Logo & Name */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xl">
          BN
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">Binh Nguyen</h1>
          <p className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">WEMS System</p>
        </div>
      </div>

      {/* Menu List */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        <div className="px-3 text-[13px] space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMenu === item.id;
            return (
              <button
                key={item.id}
                id={`menu-item-${item.id}`}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-left group ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Footer Account Info */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div 
          onClick={() => {
            setCurrentMenu('');
            setCurrentRoute('profile');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-medium border border-slate-600 group-hover:border-blue-500 transition-colors">
            {managerName ? managerName.charAt(0) : 'M'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-white truncate max-w-[120px] group-hover:text-blue-400 transition-colors">{managerName || 'Manager'}</p>
            <p className="text-[10px] opacity-50 mt-0.5">v1.0.4-stable</p>
          </div>
        </div>
        <button 
          onClick={() => {
            alert("Đã đăng xuất khỏi hệ thống!");
          }}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
