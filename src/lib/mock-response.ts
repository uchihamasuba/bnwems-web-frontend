import { NextResponse } from 'next/server';

export function mockSuccess<T>(
  data: T,
  opts?: { code?: string; message?: string; meta?: Record<string, unknown>; status?: number }
) {
  return NextResponse.json(
    {
      success: true,
      ...(opts?.code ? { code: opts.code } : {}),
      ...(opts?.message ? { message: opts.message } : {}),
      data,
      ...(opts?.meta ? { meta: opts.meta } : {}),
    },
    { status: opts?.status ?? 200 }
  );
}

export function mockFailure(message: string, opts?: { status?: number; code?: string }) {
  return NextResponse.json(
    { success: false, ...(opts?.code ? { code: opts.code } : {}), message },
    { status: opts?.status ?? 400 }
  );
}
