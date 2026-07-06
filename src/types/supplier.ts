// UC 2.16 — Supplier Master Data (docs/api/04-suppliers.md)

export type SupplierStatus = 'active' | 'inactive';

export interface Supplier {
  supplierId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  serviceCategory: string; // MOCK — không có trong docs/api/04-suppliers.md, ghi vào more-require.md nếu cần backend bổ sung
  rating: number;          // MOCK — không có trong docs/api/04-suppliers.md
  status: SupplierStatus;
  createdAt: string;
}

export interface CreateSupplierPayload {
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  serviceCategory?: string;
}

export interface GetSuppliersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
