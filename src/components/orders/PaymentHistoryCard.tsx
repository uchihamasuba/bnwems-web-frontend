import { Plus } from 'lucide-react';
import { Table, TableColumn } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Payment } from '@/types/payment';

const METHOD_LABEL: Record<Payment['method'], string> = {
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
};

const STATUS_LABEL: Record<Payment['status'], string> = {
  pending: 'Chờ xử lý',
  success: 'Đã xác nhận',
  failed: 'Thất bại',
};

interface PaymentHistoryCardProps {
  payments: Payment[];
  totalDue: number;
  isLoading: boolean;
  onOpenRequestPayment: () => void;
}

export default function PaymentHistoryCard({
  payments,
  totalDue,
  isLoading,
  onOpenRequestPayment,
}: Readonly<PaymentHistoryCardProps>) {
  const totalCollected = payments.filter((p) => p.status === 'success').reduce((sum, p) => sum + Number(p.amount), 0);
  const progressPercent = totalDue > 0 ? Math.min(100, Math.round((totalCollected / totalDue) * 100)) : 0;

  const columns: TableColumn<Payment>[] = [
    { key: 'amount', label: 'Số tiền', render: (row) => <span className="font-bold text-slate-900">{formatCurrency(row.amount)}</span> },
    { key: 'method', label: 'Phương thức', render: (row) => METHOD_LABEL[row.method] ?? row.method },
    { key: 'paidAt', label: 'Ngày', render: (row) => (row.paidAt ? formatDate(row.paidAt) : '—') },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => <Badge variant={getStatusBadgeVariant(row.status.toUpperCase())}>{STATUS_LABEL[row.status] ?? row.status}</Badge>,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Lịch sử thanh toán</h3>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-slate-400">Đã thu / Tổng</p>
            <p className="text-sm font-bold text-slate-900">
              {formatCurrency(totalCollected)} / {formatCurrency(totalDue)}
            </p>
          </div>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-green-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Table columns={columns} rows={payments} rowKey={(row) => row.paymentId} isLoading={isLoading} emptyText="Chưa có thanh toán nào" />
      </div>

      <Button onClick={onOpenRequestPayment}>
        <Plus className="h-4 w-4" />
        Tạo yêu cầu thanh toán mới
      </Button>
    </div>
  );
}
