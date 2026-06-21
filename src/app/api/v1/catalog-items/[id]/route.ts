import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockCatalogItems } from '@/mocks/seed';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = mockCatalogItems.find((c) => c.id === Number(id));
  if (!item) {
    return mockFailure('Không tìm thấy hàng hóa', { status: 404 });
  }
  return mockSuccess(item);
}
