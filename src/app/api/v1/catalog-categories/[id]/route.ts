import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockCatalogCategories, mockCatalogItems } from '@/mocks/seed';

// UC 2.5 — GET /api/v1/catalog-categories/:id (docs/api/03-catalog.md)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = mockCatalogCategories.find((c) => c.id === id);
  if (!category) {
    return mockFailure('Catalog category not found', { status: 404 });
  }

  const totalEquipment = mockCatalogItems.filter((item) => item.categoryId === category.id).length;
  return mockSuccess({ ...category, totalEquipment });
}

// UC 2.5 — PUT /api/v1/catalog-categories/:id (docs/api/03-catalog.md)
// BR-05-11: kiểm tra trùng tên loại trừ chính category đang sửa.
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = mockCatalogCategories.find((c) => c.id === id);
  if (!category) {
    return mockFailure('Catalog category not found', { status: 404 });
  }

  const body = await request.json();
  if (
    body.name &&
    mockCatalogCategories.some((c) => c.id !== id && c.name.toLowerCase() === (body.name as string).toLowerCase())
  ) {
    return mockFailure('Required information is missing or invalid.', { status: 409, code: 'MSG-UC05-01' });
  }

  if (body.name) category.name = body.name;
  if (body.description != null) category.description = body.description;
  if (body.displayOrder != null) category.displayOrder = Number(body.displayOrder);
  if ('notes' in body) category.notes = body.notes;
  category.updatedAt = new Date().toISOString();

  return mockSuccess(null, { message: 'Catalog category updated successfully.' });
}
