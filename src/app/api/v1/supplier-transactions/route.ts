import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockSupplierTransactions, mockSuppliers, nextTransactionId } from '@/mocks/seed';

// UC 2.16 — GET /api/v1/supplier-transactions
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const search = params.get('search')?.toLowerCase() ?? '';
  const supplierId = params.get('supplierId') ?? '';
  const orderId = params.get('orderId') ?? '';
  const status = params.get('status') ?? '';

  const supplierById = new Map(mockSuppliers.map((s) => [s.id, s]));

  let result = [...mockSupplierTransactions];
  if (supplierId) result = result.filter((t) => t.supplierId === supplierId);
  if (orderId) result = result.filter((t) => t.orderId === orderId);
  if (status) result = result.filter((t) => t.status === status);
  if (search) {
    result = result.filter((t) => {
      const supplier = supplierById.get(t.supplierId);
      return (
        t.itemDescription.toLowerCase().includes(search) ||
        t.orderId.toLowerCase().includes(search) ||
        (supplier?.name.toLowerCase().includes(search) ?? false)
      );
    });
  }

  const totalCount = result.length;
  const paged = result.slice((page - 1) * limit, page * limit).map((t, i) => ({
    supplierTransactionId: `PROC-${String(i + 1).padStart(3, '0')}`,
    supplierId: t.supplierId,
    supplierName: supplierById.get(t.supplierId)?.name ?? t.supplierId,
    orderId: t.orderId,
    transactionType: t.transactionType,
    totalCost: t.totalCost,
    depositAmount: t.depositAmount,
    itemDescription: t.itemDescription,
    status: t.status,
    createdAt: t.createdAt,
  }));

  return mockSuccess(paged, { meta: { page, limit, totalCount } });
}

// UC 2.16 — POST /api/v1/supplier-transactions
export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.supplierId || !body.orderId || !body.totalCost) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC16-01' });
  }
  const newTx = {
    id: nextTransactionId(),
    supplierId: String(body.supplierId),
    orderId: String(body.orderId),
    transactionType: (body.transactionType ?? 'purchase') as 'rental' | 'purchase',
    totalCost: Number(body.totalCost),
    depositAmount: Number(body.depositAmount ?? 0),
    itemDescription: body.itemDescription?.trim() ?? '',
    status: 'waiting_for_approval' as const,
    createdAt: new Date().toISOString(),
  };
  mockSupplierTransactions.push(newTx);
  return mockSuccess({ supplierTransactionId: newTx.id }, { status: 201, message: 'Supplier transaction created.' });
}
