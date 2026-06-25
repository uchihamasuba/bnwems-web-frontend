import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockInventory } from '@/mocks/seed';

const EDITABLE_FIELDS = [
  'availableQuantity',
  'reservedQuantity',
  'checkedOutQuantity',
  'damagedQuantity',
  'lostQuantity',
] as const;

// PUT /api/v1/inventory/:id — KHÔNG có trong docs/api/05-warehouse-inventory.md (xem ghi chú
// trong types/inventory.ts). Thêm tạm để hỗ trợ UI "Sửa tồn kho" ở /admin/inventory/stock-status.
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = mockInventory.find((r) => r.id === id);
  if (!row) {
    return mockFailure('Inventory record not found', { status: 404 });
  }

  const body = await request.json();
  for (const field of EDITABLE_FIELDS) {
    if (body[field] == null || Number(body[field]) < 0) {
      return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC13-01' });
    }
  }

  for (const field of EDITABLE_FIELDS) {
    row[field] = Number(body[field]);
  }
  row.updatedAt = new Date().toISOString();

  return mockSuccess(row, { message: 'Cập nhật tồn kho thành công.' });
}
