import React, { useState } from 'react';
import { Search, Bell, User, Key, LogOut, HelpCircle } from 'lucide-react';

interface TopbarProps {
  currentRoute: string;
  currentMenu: string;
  setCurrentRoute: (route: string) => void;
  setCurrentMenu: (menu: string) => void;
  managerName: string;
  onSearch: (term: string) => void;
  notificationCount: number;
  toggleNotifications: () => void;
}

export default function Topbar({
  currentRoute,
  currentMenu,
  setCurrentRoute,
  setCurrentMenu,
  managerName,
  onSearch,
  notificationCount,
  toggleNotifications,
}: TopbarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header id="topbar" className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 right-0 left-[260px] z-20 shadow-xs">
      {/* Left: Search & Navigation Tabs */}
      <div className="flex items-center gap-8">
        {/* Search Box */}
        <div className="relative w-64">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm hệ thống..."
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 font-medium text-slate-700"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 h-14 text-sm font-semibold text-slate-600">
          <button 
            onClick={() => { setCurrentMenu('dashboard'); setCurrentRoute('dashboard'); }}
            className={`h-full border-b-2 px-1 transition-all flex items-center cursor-pointer ${
              currentRoute === 'dashboard' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Hệ thống
          </button>
          <button 
            onClick={() => { setCurrentMenu('orders'); setCurrentRoute('orders'); }}
            className={`h-full border-b-2 px-1 transition-all flex items-center cursor-pointer ${
              currentMenu === 'orders' || currentMenu === 'schedule' || currentMenu === 'inventory' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Vận hành
          </button>
          <button 
            onClick={() => { setCurrentMenu('wages'); setCurrentRoute('wages'); }}
            className={`h-full border-b-2 px-1 transition-all flex items-center cursor-pointer ${
              currentRoute === 'wages' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Báo cáo
          </button>
        </div>
      </div>

      {/* Right actions: Bell, Help, Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          onClick={toggleNotifications}
          className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
          title="Thông báo"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          )}
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* Help Button */}
        <button
          onClick={() => alert("Trợ giúp: Hệ thống Quản lý Vận hành & Cung ứng Thiết bị Sự kiện (WEMS).\nMọi thắc mắc vui lòng liên hệ Ban quản trị qua email: support@binhnguyenwems.com")}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
          title="Hỗ trợ"
        >
          <HelpCircle className="w-5 h-5 text-slate-600" />
        </button>

        {/* Manager User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-full transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              {managerName ? managerName.charAt(0) : 'M'}
            </div>
          </button>

          {/* User Dropdown Panel */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-slate-200 shadow-xl py-1 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800">{managerName}</p>
                <p className="text-xs text-slate-400">vutuyettrinh2004@gmail.com</p>
              </div>

              <button
                onClick={() => {
                  setCurrentMenu('');
                  setCurrentRoute('profile');
                  setShowUserDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                Hồ sơ cá nhân
              </button>

              <button
                onClick={() => {
                  setCurrentMenu('');
                  setCurrentRoute('profile'); // holds the change password card
                  setShowUserDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Key className="w-4 h-4 text-slate-400" />
                Đổi mật khẩu
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={() => {
                  setShowUserDropdown(false);
                  alert("Đã đăng xuất khỏi hệ thống!");
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
