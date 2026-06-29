import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockCatalogItems, nextId } from '@/mocks/seed';

function toCatalogItemResponse(item: (typeof mockCatalogItems)[number]) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    itemType: item.itemType,
    basePrice: item.basePrice,
    categoryId: item.categoryId,
    isActive: item.isActive,
    createdAt: item.createdAt,
  };
}

// UC 2.5 — GET /api/v1/catalog-items (docs/api/03-catalog.md)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const itemType = params.get('itemType');
  const isActiveParam = params.get('isActive');

  let result = [...mockCatalogItems];

  if (search) {
    result = result.filter((item) => item.name.toLowerCase().includes(search));
  }
  if (itemType) {
    result = result.filter((item) => item.itemType === itemType);
  }
  if (isActiveParam !== null) {
    result = result.filter((item) => item.isActive === (isActiveParam === 'true'));
  }

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalCount = result.length;
  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit);

  return mockSuccess(paged.map((item) => toCatalogItemResponse(item)), { meta: { page, limit, totalCount } });
}

// UC 2.5 — POST /api/v1/catalog-items (docs/api/03-catalog.md)
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name || !body.itemType || body.basePrice == null) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC05-01' });
  }
  if (Number(body.basePrice) <= 0) {
    return mockFailure('Base price must be a positive number.', { status: 400, code: 'MSG-UC05-01' });
  }

  const now = new Date().toISOString();
  const newItem = {
    id: nextId('catalogItem'),
    name: body.name as string,
    description: (body.description as string) ?? '',
    itemType: body.itemType,
    basePrice: Number(body.basePrice),
    categoryId: (body.categoryId as string | null | undefined) ?? null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  mockCatalogItems.push(newItem);

  return mockSuccess(
    {
      id: newItem.id,
      name: newItem.name,
      itemType: newItem.itemType,
      basePrice: newItem.basePrice,
      categoryId: newItem.categoryId,
      isActive: newItem.isActive,
    },
    { message: 'Catalog item created successfully.', status: 201 }
  );
}
