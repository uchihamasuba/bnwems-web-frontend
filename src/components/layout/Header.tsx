'use client';

import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6">
      <div className="w-72">
        <Input placeholder="Tìm kiếm..." />
      </div>
      <div className="flex items-center gap-4">
        <button type="button" aria-label="Thông báo" className="text-slate-400 hover:text-slate-600">
          🔔
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {user?.full_name?.charAt(0) ?? '?'}
          </div>
          <span className="text-sm font-medium text-slate-700">{user?.full_name ?? 'Khách'}</span>
        </div>
      </div>
    </header>
  );
}
