import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { applyAssignmentMembers, mockUsers, type MockAssignmentMember } from '@/mocks/seed';

// UC 2.15.2 — POST /api/v1/tasks/:id/assignments (docs/api/10-survey-assignment.md)
// Ghi phân công vào mock store (để mock GET /orders/:id/assignments đọc lại được).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const assignments = body?.assignments;
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return mockFailure('Staff assignment information is missing.', { status: 400, code: 'MSG-UC53-05' });
  }

  const members: MockAssignmentMember[] = assignments.map((a: { userId: string; assignedRole: string }) => {
    const user = mockUsers.find((u) => u.id === a.userId);
    return {
      userId: a.userId,
      fullName: user?.fullName ?? a.userId,
      assignedRole: a.assignedRole,
      fieldStatus: 'pending' as const,
    };
  });

  applyAssignmentMembers(id, members);
  return mockSuccess(null, { message: 'Staff assigned and notified.' });
}
