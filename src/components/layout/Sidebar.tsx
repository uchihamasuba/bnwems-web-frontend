'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  FileText,
  ClipboardCheck,
  BarChart3,
  Users,
  ShoppingBag,
  MapPin,
  Calendar,
  Truck,
  HardHat,
  CreditCard,
  Wallet,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const ADMIN_NAV: NavItem[] = [
  { label: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Danh mục', href: '/admin/catalog', icon: Package },
  { label: 'Kho', href: '/admin/inventory/stock-status', icon: Boxes },
  { label: 'Chính sách', href: '/admin/policies', icon: FileText },
  { label: 'Audit đơn hàng', href: '/admin/orders_audit', icon: ClipboardCheck },
  { label: 'Báo cáo', href: '/admin/reports/revenue', icon: BarChart3 },
  { label: 'Người Dùng', href: '/admin/settings/users', icon: Users },
];

const MANAGER_NAV: NavItem[] = [
  { label: 'Tổng quan', href: '/manager/dashboard', icon: LayoutDashboard },
  { label: 'Khách hàng', href: '/manager/customers', icon: Users },
  { label: 'Báo giá', href: '/manager/quotations', icon: FileText },
  { label: 'Đơn hàng', href: '/manager/orders', icon: ShoppingBag },
  { label: 'Khảo sát', href: '/manager/survey', icon: MapPin },
  { label: 'Lịch trình', href: '/manager/schedule/plans', icon: Calendar },
  { label: 'Tồn kho', href: '/manager/inventory/stock-check', icon: Package },
  { label: 'Nhà cung cấp', href: '/manager/suppliers', icon: Truck },
  { label: 'Hiện trường', href: '/manager/field-ops/handovers', icon: HardHat },
  { label: 'Thanh toán', href: '/manager/payments/deposits', icon: CreditCard },
  { label: 'Công & lương', href: '/manager/wages', icon: Wallet },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user?.role.roleName === 'Admin';
  const items = isAdmin ? ADMIN_NAV : MANAGER_NAV;
  const basePath = isAdmin ? '/admin' : '/manager';

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <aside className="flex h-screen w-[260px] flex-shrink-0 flex-col border-r border-slate-800 bg-[#111827] text-slate-300">
      <div className="flex items-center gap-3 border-b border-slate-800 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 text-xl font-bold text-white">
          BN
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">BNWEMS</p>
          <p className="text-xs leading-tight text-slate-500">Wedding Event ERP</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150 ${
                isActive ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between border-t border-slate-800 p-4">
        <Link href={`${basePath}/profile`} className="group flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-700 text-xs font-medium text-white transition-colors duration-150 group-hover:border-blue-500">
            {user?.fullName?.charAt(0) ?? '?'}
          </div>
          <p className="truncate text-xs font-medium text-white transition-colors duration-150 group-hover:text-blue-400">
            {user?.fullName ?? 'Người dùng'}
          </p>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Đăng xuất"
          title="Đăng xuất"
          className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-800 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
