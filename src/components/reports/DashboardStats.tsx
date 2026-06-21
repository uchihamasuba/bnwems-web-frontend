import React from 'react';

export interface KpiCardItem {
  label: string;
  value: React.ReactNode;
  changeLabel?: string;
  changeDirection?: 'up' | 'down';
}

interface DashboardStatsProps {
  items: KpiCardItem[];
}

export default function DashboardStats({ items }: Readonly<DashboardStatsProps>) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{item.value}</p>
          <p className="mt-1 text-sm text-slate-500">{item.label}</p>
          {item.changeLabel && (
            <p
              className={`mt-2 text-xs font-medium ${
                item.changeDirection === 'down' ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {item.changeLabel}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
