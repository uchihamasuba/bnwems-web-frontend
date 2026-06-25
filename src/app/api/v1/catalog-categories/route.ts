import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockCatalogCategories, mockCatalogItems, nextId } from '@/mocks/seed';

function toCatalogCategoryResponse(category: (typeof mockCatalogCategories)[number]) {
  const totalEquipment = mockCatalogItems.filter((item) => item.categoryId === category.id).length;
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    displayOrder: category.displayOrder,
    notes: category.notes,
    isActive: category.isActive,
    totalEquipment,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

// UC 2.5 — GET /api/v1/catalog-categories (docs/api/03-catalog.md)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const isActiveParam = params.get('isActive');

  let result = [...mockCatalogCategories];

  if (search) {
    result = result.filter((category) => category.name.toLowerCase().includes(search));
  }
  if (isActiveParam !== null) {
    result = result.filter((category) => category.isActive === (isActiveParam === 'true'));
  }

  result.sort((a, b) => a.displayOrder - b.displayOrder);

  const totalCount = result.length;
  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit);

  return mockSuccess(paged.map((category) => toCatalogCategoryResponse(category)), { meta: { page, limit, totalCount } });
}

// UC 2.5 — POST /api/v1/catalog-categories (docs/api/03-catalog.md)
// BR-05-08: name bắt buộc và duy nhất. BR-05-09: displayOrder mặc định 0.
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC05-01' });
  }
  if (mockCatalogCategories.some((c) => c.name.toLowerCase() === (body.name as string).toLowerCase())) {
    return mockFailure('Required information is missing or invalid.', { status: 409, code: 'MSG-UC05-01' });
  }

  const now = new Date().toISOString();
  const newCategory = {
    id: nextId('catalogCategory'),
    name: body.name as string,
    description: (body.description as string) ?? '',
    displayOrder: body.displayOrder != null ? Number(body.displayOrder) : 0,
    notes: (body.notes as string | null) ?? null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  mockCatalogCategories.push(newCategory);

  return mockSuccess(
    { id: newCategory.id, name: newCategory.name, isActive: newCategory.isActive },
    { message: 'Catalog category created successfully.', status: 201 }
  );
}
