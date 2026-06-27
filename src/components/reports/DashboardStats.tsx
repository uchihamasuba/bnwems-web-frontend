'use client';

import React from 'react';
import { motion } from 'framer-motion';
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

const GLOW_BG: Record<NonNullable<KpiCardItem['iconColor']>, string> = {
  blue: 'bg-blue-100',
  amber: 'bg-amber-100',
  red: 'bg-red-100',
  green: 'bg-green-100',
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
    <div className={`grid grid-cols-1 gap-3 ${gridClass}`}>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-md transition-shadow duration-200 hover:shadow-xl"
          >
            <span
              aria-hidden
              className={`absolute -right-3 -top-3 h-14 w-14 rounded-full opacity-60 blur-2xl ${GLOW_BG[item.iconColor ?? 'blue']}`}
            />
            <div className="relative flex items-start justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${ICON_BG[item.iconColor ?? 'blue']}`}>
                <Icon className="h-4 w-4" />
              </span>
              {item.changeLabel && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                    item.changeDirection === 'down' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}
                >
                  {item.changeLabel}
                </span>
              )}
            </div>
            <p className="relative mt-2.5 text-xs font-medium text-slate-500">{item.label}</p>
            <p className="relative mt-0.5 text-2xl font-bold tracking-tight text-slate-900">{item.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
