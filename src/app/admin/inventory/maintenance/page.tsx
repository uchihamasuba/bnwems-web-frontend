'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { equipmentApiService } from '@/services/equipment.service';
import { inventoryApiService } from '@/services/inventory.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { useDebounce } from '@/hooks/useDebounce';
import type { EquipmentItem } from '@/types/equipment';
import type { InventoryRow } from '@/types/inventory';

interface MaintenanceRow {
  inventoryId: string;
  itemId: string;
  itemName: string;
  damagedQuantity: number;
  totalQuantity: number;
}

export default function Page() {
  const [rows, setRows] = useState<MaintenanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    Promise.all([equipmentApiService.getEquipment({ limit: 200 }), inventoryApiService.getInventory({ limit: 500 })])
      .then(([itemsRes, inventoryRes]) => {
        const itemsById = new Map((itemsRes.data as EquipmentItem[]).map((item) => [item.equipmentItemId, item]));

        const maintenanceRows: MaintenanceRow[] = (inventoryRes.data as InventoryRow[])
          .filter((row) => row.damagedQuantity > 0)
          .map((row) => ({
            inventoryId: row.inventoryId,
            itemId: row.equipmentItemId,
            itemName: itemsById.get(row.equipmentItemId)?.name ?? row.equipmentItemId,
            damagedQuantity: row.damagedQuantity,
            totalQuantity: row.totalQuantity,
          }));

        setRows(maintenanceRows);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRows = useMemo(
    () => rows.filter((row) => row.itemName.toLowerCase().includes(debouncedSearch.trim().toLowerCase())),
    [rows, debouncedSearch]
  );

  const columns: TableColumn<MaintenanceRow>[] = [
    { key: 'itemId', label: 'Mã thiết bị' },
    { key: 'itemName', label: 'Tên thiết bị' },
    { key: 'damagedQuantity', label: 'Số lượng hỏng' },
    { key: 'totalQuantity', label: 'Tổng số lượng' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: () => <Badge variant={getStatusBadgeVariant('MAINTENANCE')}>Đang sửa chữa</Badge>,
    },
  ];

  return (
    <div className="p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Thiết bị đang bảo trì</h1>
        <p className="mt-1 text-sm text-slate-500">
          Thiết bị có số lượng hỏng cần sửa chữa, không được dùng cho đơn hàng mới (UC 2.13).
        </p>
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Input
              placeholder="Tìm theo tên thiết bị..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <Table
            columns={columns}
            rows={filteredRows}
            rowKey={(row) => row.inventoryId}
            isLoading={isLoading}
            emptyText="Không có thiết bị nào đang bảo trì."
          />
        </div>
      </div>
    </div>
  );
}
