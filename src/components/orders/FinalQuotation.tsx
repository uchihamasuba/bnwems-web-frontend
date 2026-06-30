'use client';

import { useEffect, useState } from 'react';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { Table, TableColumn } from '@/components/ui/Table';
import { quotationApiService } from '@/services/quotation.service';
import { catalogApiService } from '@/services/catalog.service';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Quotation, QuotationDetail, QuotationItem } from '@/types/quotation';

const STATUS_LABEL: Record<Quotation['status'], string> = {
  draft: 'Nháp',
  confirmed: 'Đã duyệt',
};

interface FinalQuotationProps {
  orderId: string;
}

// ⚠️ src/types/catalog.ts (file có từ trước, ngoài phạm vi sửa lần này) khai field catalog item
// là `id` — nhưng backend thật (prisma/schema.prisma model CatalogItem) dùng `catalogItemId`,
// không rename ở service. Không import type CatalogItem (sai field) — chỉ định nghĩa cục bộ đúng
// 2 field cần dùng ở đây để tránh lan sai field đó. Nên rà soát lại toàn bộ src/types/catalog.ts +
// các trang admin/catalog/* đang dùng type đó (ngoài phạm vi tab Báo giá này).
interface CatalogItemNameLookup {
  catalogItemId: string;
  name: string;
}

// Tab "Báo giá" — dữ liệu thật 100% qua quotationApiService, tự fetch ở component này.
// Backend thật chỉ cho phép tối đa 1 quotation/order (prisma.quotation.findUnique theo orderId) —
// không có versioning nhiều bản như doc nghiệp vụ mô tả, nên không cần dropdown chọn version —
// xem docs/more-require.md mục (m).
export default function FinalQuotation({ orderId }: Readonly<FinalQuotationProps>) {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [detail, setDetail] = useState<QuotationDetail | null>(null);
  const [itemNameById, setItemNameById] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    quotationApiService.getOrderQuotations(orderId).then((res) => {
      const list: Quotation[] = res.data ?? [];
      const latest = list.at(-1) ?? null;
      setQuotation(latest);
      setIsLoading(false);
      if (latest) {
        quotationApiService.getQuotation(latest.quotationId).then((detailRes) => setDetail(detailRes.data ?? null));
      }
    });
  }, [orderId]);

  useEffect(() => {
    catalogApiService.getCatalogItems({ limit: 200 }).then((res) => {
      const items: CatalogItemNameLookup[] = res.data ?? [];
      setItemNameById(new Map(items.map((item) => [item.catalogItemId, item.name])));
    });
  }, []);

  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400 shadow-sm">Đang tải...</div>;
  }

  if (!quotation) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400 shadow-sm">Chưa có báo giá nào.</div>;
  }

  const columns: TableColumn<QuotationItem>[] = [
    {
      key: 'catalogItemId',
      label: 'Hạng mục dịch vụ',
      render: (row) => itemNameById.get(row.catalogItemId) ?? `#${row.catalogItemId}`,
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
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-900">Phiên bản {quotation.version}</span>
          <Badge variant={getStatusBadgeVariant(quotation.status)}>{STATUS_LABEL[quotation.status]}</Badge>
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
    </div>
  );
}
