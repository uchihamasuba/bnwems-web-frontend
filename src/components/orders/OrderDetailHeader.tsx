import Link from 'next/link';
import { ArrowLeft, ChevronRight, Pencil, CalendarClock, Ban } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import OrderStatusBadge from './OrderStatusBadge';
import { formatDate } from '@/utils/formatDate';
import type { OrderDetail } from '@/types/order';

interface OrderDetailHeaderProps {
  order: OrderDetail;
  customerName: string;
}

export default function OrderDetailHeader({ order, customerName }: Readonly<OrderDetailHeaderProps>) {
  return (
    <div className="mb-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/manager/orders" className="hover:text-slate-700">
            Quản lý đơn hàng
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-slate-900">#{order.orderId}</span>
        </nav>
        <Link href="/manager/orders" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">#{order.orderId}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Avatar name={customerName} size="sm" />
              <span className="font-medium text-slate-900">{customerName}</span>
            </div>
            <span className="text-slate-400">{order.eventLocation}</span>
            <span>{formatDate(order.eventDate)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" title="Tính năng đang phát triển">
            <Pencil className="h-4 w-4" />
            Sửa đơn hàng
          </Button>
          <Button variant="secondary" size="sm" title="Tính năng đang phát triển">
            <CalendarClock className="h-4 w-4" />
            Đổi ngày sự kiện
          </Button>
          <Button variant="danger" size="sm" title="Tính năng đang phát triển">
            <Ban className="h-4 w-4" />
            Hủy đơn hàng
          </Button>
        </div>
      </div>
    </div>
  );
}
