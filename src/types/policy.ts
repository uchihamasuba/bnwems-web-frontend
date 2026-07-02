// UC 2.6 (docs/api/06-policies-wage.md)

// policyType là enum mở ("DEPOSIT, REFUND, CANCELLATION, etc.") — doc chưa liệt kê đủ danh sách
// nên giữ kiểu string thay vì union cứng để tránh loại bỏ nhầm giá trị hợp lệ.
export type PolicyType = string;

// GET /api/v1/policies
export interface Policy {
  policyId: string;
  policyType: PolicyType;
  name: string;
  rules: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}
