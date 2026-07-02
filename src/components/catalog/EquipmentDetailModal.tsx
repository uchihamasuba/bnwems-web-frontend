'use client';

import { ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import type { EquipmentItem } from '@/types/equipment';

interface EquipmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: EquipmentItem | null;
}

function DetailRow({ label, value }: Readonly<{ label: string; value: ReactNode }>) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

export function EquipmentDetailModal({ isOpen, onClose, item }: Readonly<EquipmentDetailModalProps>) {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết thiết bị">
      <div className="flex flex-col">
        <DetailRow label="Mã thiết bị" value={item.code} />
        <DetailRow label="Tên thiết bị" value={item.name} />
        <DetailRow label="Danh mục" value={item.category || '—'} />
        <DetailRow label="Đơn vị tính" value={item.unit} />
        <DetailRow label="Giá thuê" value={formatCurrency(item.rentalPrice)} />
        <DetailRow label="Giá vốn" value={formatCurrency(item.costPrice)} />
        <DetailRow label="Giá trị đền bù" value={formatCurrency(item.replacementValue)} />
        <DetailRow
          label="Trạng thái"
          value={
            <Badge variant={getStatusBadgeVariant(item.status === 'active' ? 'ACTIVE' : 'INACTIVE')}>
              {item.status === 'active' ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
            </Badge>
          }
        />
        <DetailRow label="Ngày tạo" value={formatDate(item.createdAt)} />
      </div>
    </Modal>
  );
}

export default EquipmentDetailModal;
