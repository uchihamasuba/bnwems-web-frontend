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
  ShoppingCart,
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
  { label: 'Tồn kho', href: '/manager/inventory/pick-lists', icon: Package },
  { label: 'Nhà cung cấp', href: '/manager/suppliers', icon: Truck },
  { label: 'Mua sắm', href: '/manager/procurement', icon: ShoppingCart },
  { label: 'Hiện trường', href: '/manager/field-ops/handovers', icon: HardHat },
  { label: 'Thanh toán', href: '/manager/payments/deposits', icon: CreditCard },
  { label: 'Công & lương', href: '/manager/wages', icon: Wallet },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const items = user?.role === 'ADMIN' ? ADMIN_NAV : MANAGER_NAV;

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          BN
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-white">BNWEMS</p>
          <p className="text-xs leading-tight text-slate-400">Wedding Event ERP</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
