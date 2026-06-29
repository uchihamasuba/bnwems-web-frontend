'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RevenueReportPoint } from '@/types/report';
import { formatCurrency } from '@/utils/formatCurrency';

interface RevenueChartProps {
  data: RevenueReportPoint[];
}

export default function RevenueChart({ data }: Readonly<RevenueChartProps>) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Doanh thu theo tháng</h3>
      <p className="mt-0.5 text-xs text-slate-400">Nguồn: GET /reports/revenue (breakdownByMonth)</p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => `${value / 1_000_000}tr`}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
