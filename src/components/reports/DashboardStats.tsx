import React from 'react';
import { type LucideIcon } from 'lucide-react';

export interface KpiCardItem {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  iconColor?: 'blue' | 'amber' | 'red' | 'green';
  changeLabel?: string;
  changeDirection?: 'up' | 'down';
}

interface DashboardStatsProps {
  items: KpiCardItem[];
}

const ICON_BG: Record<NonNullable<KpiCardItem['iconColor']>, string> = {
  blue: 'bg-blue-100 text-blue-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  green: 'bg-green-100 text-green-600',
};

// Map số lượng KPI card -> grid cols để hàng luôn cân đối (vd 3 card thì chia đều 3 cột,
// không để 1 ô trống lệch khi grid cố định 4 cột).
const GRID_COLS: Record<number, string> = {
  1: 'sm:grid-cols-1 lg:grid-cols-1',
  2: 'sm:grid-cols-2 lg:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
};

export default function DashboardStats({ items }: Readonly<DashboardStatsProps>) {
  const gridClass = GRID_COLS[items.length] ?? 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid grid-cols-1 gap-4 ${gridClass}`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm text-slate-500">{item.label}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${ICON_BG[item.iconColor ?? 'blue']}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
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
        );
      })}
    </div>
  );
}
