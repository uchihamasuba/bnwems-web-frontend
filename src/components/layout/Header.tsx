'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';

export default function Header() {
  const { user } = useAuth();
  const profilePath = user?.role.roleName === 'Admin' ? '/admin/profile' : '/manager/profile';

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6">
      <div className="w-72">
        <Input placeholder="Tìm kiếm..." />
      </div>
      <div className="flex items-center gap-4">
        <button type="button" aria-label="Thông báo" className="relative text-slate-400 hover:text-slate-600">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <Link href={profilePath} className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-slate-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {user?.fullName?.charAt(0) ?? '?'}
          </div>
          <span className="text-sm font-medium text-slate-700">{user?.fullName ?? 'Khách'}</span>
        </Link>
      </div>
    </header>
  );
}
