'use client';

import { ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import type { CatalogItem } from '@/types/catalog';

interface CatalogItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  categoryName?: string;
}

const ITEM_TYPE_LABEL: Record<string, string> = {
  EQUIPMENT: 'Thiết bị',
  SERVICE: 'Dịch vụ',
  MATERIAL: 'Vật tư',
  PACKAGE: 'Gói',
};

function DetailRow({ label, value }: Readonly<{ label: string; value: ReactNode }>) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

export function CatalogItemDetailModal({ isOpen, onClose, item, categoryName }: Readonly<CatalogItemDetailModalProps>) {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết thiết bị">
      <div className="flex flex-col">
        <DetailRow label="Tên thiết bị" value={item.name} />
        <DetailRow label="Loại" value={ITEM_TYPE_LABEL[item.itemType] ?? item.itemType} />
        <DetailRow label="Danh mục" value={categoryName ?? '—'} />
        <DetailRow label="Mô tả" value={item.description || '—'} />
        <DetailRow label="Đơn giá" value={formatCurrency(item.basePrice)} />
        <DetailRow
          label="Trạng thái"
          value={
            <Badge variant={getStatusBadgeVariant(item.isActive ? 'ACTIVE' : 'INACTIVE')}>
              {item.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
            </Badge>
          }
        />
        <DetailRow label="Ngày tạo" value={formatDate(item.createdAt)} />
      </div>
    </Modal>
  );
}

export default CatalogItemDetailModal;
