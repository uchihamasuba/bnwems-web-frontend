'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
}

const ADMIN_NAV: NavItem[] = [
  { label: 'Tổng quan', href: '/admin/dashboard' },
  { label: 'Danh mục', href: '/admin/catalog' },
  { label: 'Chính sách', href: '/admin/policies' },
  { label: 'Audit đơn hàng', href: '/admin/orders_audit' },
  { label: 'Báo cáo', href: '/admin/reports/revenue' },
  { label: 'Cài đặt', href: '/admin/settings/users' },
];

const MANAGER_NAV: NavItem[] = [
  { label: 'Tổng quan', href: '/manager/dashboard' },
  { label: 'Khách hàng', href: '/manager/customers' },
  { label: 'Báo giá', href: '/manager/quotations' },
  { label: 'Đơn hàng', href: '/manager/orders' },
  { label: 'Khảo sát', href: '/manager/survey' },
  { label: 'Lịch trình', href: '/manager/schedule/plans' },
  { label: 'Tồn kho', href: '/manager/inventory/pick-lists' },
  { label: 'Nhà cung cấp', href: '/manager/suppliers' },
  { label: 'Mua sắm', href: '/manager/procurement' },
  { label: 'Hiện trường', href: '/manager/field-ops/handovers' },
  { label: 'Thanh toán', href: '/manager/payments/deposits' },
  { label: 'Công & lương', href: '/manager/wages' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const items = user?.role === 'Admin' ? ADMIN_NAV : MANAGER_NAV;

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col bg-slate-900 text-slate-300">
      <div className="px-5 py-5 text-lg font-semibold text-white">BNWEMS</div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
