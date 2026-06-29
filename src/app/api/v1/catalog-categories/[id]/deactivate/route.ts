import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockCatalogCategories, mockCatalogItems } from '@/mocks/seed';

// UC 2.5 — PUT /api/v1/catalog-categories/:id/deactivate (docs/api/03-catalog.md)
// BR-05-13: không thể vô hiệu hóa category còn item active liên kết.
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = mockCatalogCategories.find((c) => c.id === id);
  if (!category) {
    return mockFailure('Catalog category not found', { status: 404 });
  }

  const body = await request.json();
  if (typeof body.isActive !== 'boolean') {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC05-01' });
  }

  if (!body.isActive && mockCatalogItems.some((item) => item.categoryId === id && item.isActive)) {
    return mockFailure('Cannot deactivate category; it still has active catalog items linked to it.', {
      status: 409,
      code: 'MSG-UC05-05',
    });
  }

  category.isActive = body.isActive;
  category.updatedAt = new Date().toISOString();

  return mockSuccess(null, { message: 'Catalog category status changed successfully.' });
}
