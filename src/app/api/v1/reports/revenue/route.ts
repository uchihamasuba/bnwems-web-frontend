import { mockSuccess } from '@/lib/mock-response';

// UC 2.7 — GET /api/v1/reports/revenue (docs/api/13-reports.md)
export async function GET() {
  const breakdownByMonth = [
    { month: '2026-01', revenue: 220000000 },
    { month: '2026-02', revenue: 260000000 },
    { month: '2026-03', revenue: 310000000 },
    { month: '2026-04', revenue: 280000000 },
    { month: '2026-05', revenue: 150000000 },
    { month: '2026-06', revenue: 200000000 },
  ];

  return mockSuccess({
    totalRevenue: breakdownByMonth.reduce((sum, m) => sum + m.revenue, 0),
    breakdownByMonth,
    topCustomers: [
      { customerId: 'cust-1', revenue: 10000000 },
      { customerId: 'cust-2', revenue: 4800000 },
    ],
  });
}
