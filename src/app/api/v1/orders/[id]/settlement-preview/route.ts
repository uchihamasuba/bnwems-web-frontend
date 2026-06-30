import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockSettlementPreviews } from '@/mocks/seed';

// MOCK-ONLY — backend thật không có GET cho Settlement theo orderId, xem docs/more-require.md mục (a).
// XÓA route handler này (+ mockSettlementPreviews trong src/mocks/seed.ts) ngay khi backend bổ sung GET thật.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const preview = mockSettlementPreviews.find((p) => p.orderId === id);
  if (!preview) {
    return mockFailure('Settlement preview not found', { status: 404 });
  }

  return mockSuccess(preview);
}
