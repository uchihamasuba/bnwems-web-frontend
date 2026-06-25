// UC 2.9 (docs/api/07-customers.md)

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

// POST /api/v1/customers
export interface CreateCustomerPayload {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
}

// PUT /api/v1/customers/:id
export interface UpdateCustomerPayload {
  fullName?: string;
  email?: string;
  address?: string;
}
