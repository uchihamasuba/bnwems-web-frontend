'use client';

import Link from 'next/link';
import { Bell, HelpCircle, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';

export default function Header() {
  const { user } = useAuth();

  const basePath = user?.role.roleName === 'Admin' ? '/admin' : '/manager';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6">
      <div className="w-80">
        <Input
          placeholder="Tìm kiếm hệ thống..."
          icon={<Search className="h-4 w-4" />}
          className="border-slate-200 bg-slate-50 shadow-none transition-colors duration-150 focus:bg-white"
        />
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Thông báo"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-600"
        >
          <Bell className="h-5 w-5" />
          {/* Số tĩnh — docs/api/ chưa có endpoint danh sách thông báo, chưa thể lấy số thật */}
          <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
            3
          </span>
        </button>
        <button
          type="button"
          aria-label="Trợ giúp"
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-600"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="mx-2 h-6 w-px bg-slate-200" />

        <Link
          href={`${basePath}/profile`}
          className="flex items-center gap-2 rounded-full p-1 pr-2.5 transition-colors duration-150 hover:bg-slate-50"
        >
          {/* Default to a generic user image for mockup or use initials */}
          <div className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-slate-200">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" 
              alt="Avatar" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-900">{user?.fullName ?? 'Lê Minh Bliss'}</span>
            <span className="text-xs font-medium text-slate-500">{user?.role?.roleName ?? 'Quản trị viên'}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
