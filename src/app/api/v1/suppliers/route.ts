import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockSuppliers, nextSupplierId } from '@/mocks/seed';

// UC 2.16 — GET /api/v1/suppliers (docs/api/04-suppliers.md)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const search = params.get('search')?.toLowerCase() ?? '';
  const status = params.get('status') ?? '';

  let result = [...mockSuppliers];
  if (search) result = result.filter((s) => s.name.toLowerCase().includes(search) || s.serviceCategory.toLowerCase().includes(search));
  if (status) result = result.filter((s) => s.status === status);

  const totalCount = result.length;
  const paged = result.slice((page - 1) * limit, page * limit).map((s) => ({
    supplierId: s.id,
    name: s.name,
    contactPerson: s.contactPerson,
    phone: s.phone,
    email: s.email,
    address: s.address,
    serviceCategory: s.serviceCategory,
    rating: s.rating,
    status: s.status,
    createdAt: s.createdAt,
  }));

  return mockSuccess(paged, { meta: { page, limit, totalCount } });
}

// UC 2.16 — POST /api/v1/suppliers (docs/api/04-suppliers.md)
export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name?.trim() || !body.phone?.trim()) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC16-01' });
  }
  const existing = mockSuppliers.find((s) => s.name.toLowerCase() === body.name.trim().toLowerCase());
  if (existing) {
    return mockFailure('Tên nhà cung cấp đã tồn tại (BR-16-01).', { status: 409, code: 'MSG-UC16-02' });
  }
  const newSupplier = {
    id: nextSupplierId(),
    name: body.name.trim(),
    contactPerson: body.contactPerson?.trim() ?? '',
    phone: body.phone.trim(),
    email: body.email?.trim() ?? '',
    address: body.address?.trim() ?? '',
    serviceCategory: body.serviceCategory?.trim() ?? '',
    rating: 0,
    status: 'active' as const,
    createdAt: new Date().toISOString(),
  };
  mockSuppliers.push(newSupplier);
  return mockSuccess({ supplierId: newSupplier.id }, { status: 201, message: 'Supplier created successfully.' });
}
