'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil, Plus } from 'lucide-react';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { Table, TableColumn } from '@/components/ui/Table';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import CreateQuotationModal from '@/components/orders/CreateQuotationModal';
import { quotationApiService } from '@/services/quotation.service';
import { equipmentApiService } from '@/services/equipment.service';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Quotation, QuotationDetail, QuotationItem } from '@/types/quotation';
import type { EquipmentItem } from '@/types/equipment';

const STATUS_LABEL: Record<Quotation['status'], string> = {
  draft: 'Nháp',
  confirmed: 'Đã duyệt',
};

interface FinalQuotationProps {
  orderId: string;
  canManage: boolean;
  /** Gọi lại sau khi tạo/sửa báo giá thành công, để trang cha refetch tổng tiền báo giá ở tab Tổng quan. */
  onQuotationChanged?: () => void;
}

// Tab "Báo giá" — dữ liệu thật 100% qua quotationApiService, tự fetch ở component này.
// Backend đã triển khai versioning thật cho quotation (rà soát lại 2026-07-04, xem
// docs/more-require.md mục (m)) — hiển thị dropdown chọn phiên bản thay vì chỉ phiên bản mới nhất.
export default function FinalQuotation({ orderId, canManage, onQuotationChanged }: Readonly<FinalQuotationProps>) {
  const [versions, setVersions] = useState<Quotation[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [detail, setDetail] = useState<QuotationDetail | null>(null);
  const [equipmentNameById, setEquipmentNameById] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    quotationApiService.getOrderQuotations(orderId, { limit: 50 }).then((res) => {
      const list: Quotation[] = res.data ?? [];
      // getOrderQuotations sắp version desc — phần tử đầu là phiên bản mới nhất.
      setVersions(list);
      setSelectedId(list[0]?.quotationId ?? '');
      setIsLoading(false);
    });
  }, [orderId, refreshToken]);

  useEffect(() => {
    if (!selectedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting detail when there is no version selected, not a render loop
      setDetail(null);
      return;
    }
    quotationApiService.getQuotation(selectedId).then((detailRes) => setDetail(detailRes.data ?? null));
  }, [selectedId, refreshToken]);

  const handleQuotationSaved = () => {
    setRefreshToken((t) => t + 1);
    onQuotationChanged?.();
  };

  useEffect(() => {
    equipmentApiService.getEquipments({ limit: 200 }).then((res) => {
      const items: EquipmentItem[] = res.data ?? [];
      setEquipmentNameById(new Map(items.map((item) => [item.equipmentItemId, item.name])));
    });
  }, []);

  const quotation = useMemo(() => versions.find((v) => v.quotationId === selectedId) ?? null, [versions, selectedId]);

  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400 shadow-sm">Đang tải...</div>;
  }

  if (!quotation) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-400">Chưa có báo giá nào cho đơn hàng này.</p>
        {canManage && (
          <Button className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Tạo báo giá mới
          </Button>
        )}
        <CreateQuotationModal
          isOpen={isCreateModalOpen}
          orderId={orderId}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleQuotationSaved}
        />
      </div>
    );
  }

  const columns: TableColumn<QuotationItem>[] = [
    {
      key: 'equipmentItemId',
      label: 'Hạng mục dịch vụ',
      render: (row) => equipmentNameById.get(row.equipmentItemId) ?? `#${row.equipmentItemId}`,
    },
    { key: 'quantity', label: 'Số lượng' },
    { key: 'unitPrice', label: 'Đơn giá', render: (row) => formatCurrency(row.unitPrice) },
    {
      key: 'lineTotal',
      label: 'Thành tiền',
      className: 'text-right font-bold text-slate-900',
      render: (row) => formatCurrency(row.lineTotal),
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          {versions.length > 1 ? (
            <Select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              options={versions.map((v) => ({ value: v.quotationId, label: `Phiên bản ${v.version}` }))}
              className="w-40"
            />
          ) : (
            <span className="text-sm font-bold text-slate-900">Phiên bản {quotation.version}</span>
          )}
          <Badge variant={getStatusBadgeVariant(quotation.status.toUpperCase())}>{STATUS_LABEL[quotation.status]}</Badge>
        </div>
        <div className="flex items-center gap-3">
          {canManage && quotation.status === 'draft' && (
            <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
              <Pencil className="h-3.5 w-3.5" />
              Sửa bản nháp
            </Button>
          )}
          {canManage && (
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Tạo phiên bản mới
            </Button>
          )}
          <Link
            href={`/manager/quotations/${quotation.quotationId}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
          >
            Xem đầy đủ / In báo giá
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Tiền hàng</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(quotation.subtotal)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Chiết khấu</p>
            <p className="text-lg font-bold text-red-600">-{formatCurrency(quotation.discount)}</p>
          </div>
          <div className="rounded-lg bg-blue-600 p-4">
            <p className="mb-1 text-[10px] font-bold uppercase text-white/70">Thực trả (Tổng)</p>
            <p className="text-xl font-extrabold text-white">{formatCurrency(quotation.totalAmount)}</p>
          </div>
        </div>

        <Table columns={columns} rows={detail?.items ?? []} rowKey={(row) => row.id} isLoading={!detail} />
      </div>

      <CreateQuotationModal
        isOpen={isCreateModalOpen}
        orderId={orderId}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleQuotationSaved}
      />
      <CreateQuotationModal
        isOpen={isEditModalOpen}
        orderId={orderId}
        editingQuotation={detail?.quotationId === quotation.quotationId ? detail : null}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleQuotationSaved}
      />
    </div>
  );
}
