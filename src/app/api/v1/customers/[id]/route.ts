import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockCustomers } from '@/mocks/seed';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = mockCustomers.find((c) => c.id === id);
  if (!customer) {
    return mockFailure('Customer not found', { status: 404 });
  }
  return mockSuccess(customer);
}

// UC 2.9 — PUT /api/v1/customers/:id (docs/api/07-customers.md)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = mockCustomers.find((c) => c.id === id);
  if (!customer) {
    return mockFailure('Customer not found', { status: 404 });
  }

  const body = await request.json();
  if (body.fullName) customer.fullName = body.fullName;
  if (body.email != null) customer.email = body.email;
  if (body.address != null) customer.address = body.address;
  customer.updatedAt = new Date().toISOString();

  return mockSuccess(null, { message: 'Customer updated successfully.' });
}
