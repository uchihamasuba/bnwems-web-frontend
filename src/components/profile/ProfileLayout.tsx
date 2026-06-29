'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function ProfileLayout({ children, basePath }: { children: React.ReactNode; basePath: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const navItems = [
    {
      href: `${basePath}/profile`,
      label: 'Thông tin cá nhân',
      icon: <User className="h-4 w-4" />,
      isActive: pathname === `${basePath}/profile`,
    },
    {
      href: `${basePath}/profile/change-password`,
      label: 'Thay đổi mật khẩu',
      icon: <Lock className="h-4 w-4" />,
      isActive: pathname === `${basePath}/profile/change-password`,
    },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt tài khoản</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý thông tin cá nhân và cấu hình bảo mật của bạn.</p>
      </div>

      <div className="flex flex-1 items-start gap-8">
        {/* Sidebar Menu */}
        <div className="flex w-64 flex-col gap-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  item.isActive
                    ? 'bg-white text-blue-600 shadow-sm border-l-4 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                style={item.isActive ? { borderLeftWidth: '4px' } : { paddingLeft: '20px' }} // 16px (px-4) + 4px border adjustment if needed
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-200 border-dashed pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg border border-dashed border-red-300 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
}
