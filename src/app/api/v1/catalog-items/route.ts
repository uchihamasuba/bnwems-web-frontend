import { mockSuccess } from '@/lib/mock-response';
import { mockCatalogItems } from '@/mocks/seed';

export async function GET() {
  return mockSuccess(mockCatalogItems, {
    meta: { page: 1, limit: 20, total: mockCatalogItems.length, total_pages: 1 },
  });
}
