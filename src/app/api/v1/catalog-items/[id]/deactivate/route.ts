import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockCatalogItems } from '@/mocks/seed';

// UC 2.5 — PUT /api/v1/catalog-items/:id/deactivate (docs/api/03-catalog.md)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = mockCatalogItems.find((c) => c.id === id);
  if (!item) {
    return mockFailure('Catalog item not found', { status: 404 });
  }

  const body = await request.json();
  if (typeof body.isActive !== 'boolean') {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC05-01' });
  }

  item.isActive = body.isActive;
  item.updatedAt = new Date().toISOString();

  return mockSuccess(null, { message: 'Catalog item status changed successfully.' });
}
