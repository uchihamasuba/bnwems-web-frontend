import { mockSuccess } from '@/lib/mock-response';

// UC 2.1 — POST /api/v1/auth/forgot-password (docs/api/01-auth.md)
// Doc mới: fire-and-forget, không còn luồng OTP/verify/reset-token riêng như bản cũ.
export async function POST() {
  return mockSuccess(null, { message: 'If the account exists, a recovery email has been sent.' });
}
