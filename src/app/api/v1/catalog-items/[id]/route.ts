import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockCatalogItems } from '@/mocks/seed';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = mockCatalogItems.find((c) => c.id === id);
  if (!item) {
    return mockFailure('Catalog item not found', { status: 404 });
  }
  return mockSuccess(item);
}

// UC 2.5 — PUT /api/v1/catalog-items/:id (docs/api/03-catalog.md)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = mockCatalogItems.find((c) => c.id === id);
  if (!item) {
    return mockFailure('Catalog item not found', { status: 404 });
  }

  const body = await request.json();
  if (body.basePrice != null && Number(body.basePrice) <= 0) {
    return mockFailure('Base price must be a positive number.', { status: 400, code: 'MSG-UC05-01' });
  }

  if (body.name) item.name = body.name;
  if (body.description != null) item.description = body.description;
  if (body.basePrice != null) item.basePrice = Number(body.basePrice);
  if ('categoryId' in body) item.categoryId = body.categoryId;
  item.updatedAt = new Date().toISOString();

  return mockSuccess(null, { message: 'Catalog item updated successfully.' });
}
