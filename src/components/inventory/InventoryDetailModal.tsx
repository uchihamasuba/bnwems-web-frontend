'use client';

import { ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatDate';
import type { InventoryRow } from '@/types/inventory';

interface InventoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: (InventoryRow & { itemName: string }) | null;
}

function DetailRow({ label, value }: Readonly<{ label: string; value: ReactNode }>) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

export function InventoryDetailModal({ isOpen, onClose, row }: Readonly<InventoryDetailModalProps>) {
  if (!row) return null;

  const totalQuantity =
    row.availableQuantity + row.reservedQuantity + row.checkedOutQuantity + row.damagedQuantity + row.lostQuantity;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết tồn kho">
      <div className="flex flex-col">
        <DetailRow label="Tên thiết bị" value={row.itemName} />
        <DetailRow label="Mã thiết bị" value={row.catalogItemId} />
        <DetailRow label="Mã kho" value={row.warehouseId} />
        <DetailRow label="Tổng số lượng" value={totalQuantity} />
        <DetailRow label="Có sẵn" value={row.availableQuantity} />
        <DetailRow label="Đã giữ chỗ" value={row.reservedQuantity} />
        <DetailRow label="Đang sử dụng" value={row.checkedOutQuantity} />
        <DetailRow label="Hỏng" value={row.damagedQuantity} />
        <DetailRow label="Mất" value={row.lostQuantity} />
        <DetailRow
          label="Trạng thái"
          value={
            <Badge variant={getStatusBadgeVariant(row.damagedQuantity > 0 ? 'MAINTENANCE' : 'ACTIVE')}>
              {row.damagedQuantity > 0 ? 'Có hỏng' : 'Bình thường'}
            </Badge>
          }
        />
        <DetailRow label="Cập nhật gần nhất" value={formatDate(row.updatedAt)} />
      </div>
    </Modal>
  );
}

export default InventoryDetailModal;
