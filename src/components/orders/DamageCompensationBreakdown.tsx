import { WineOff, Mic, PackageX } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import type { SettlementDamageLineMock } from '@/types/settlement';

const ICON_MAP: Record<string, typeof PackageX> = {
  WineOff,
  Mic,
};

interface DamageCompensationBreakdownProps {
  lines: SettlementDamageLineMock[];
}

export default function DamageCompensationBreakdown({ lines }: Readonly<DamageCompensationBreakdownProps>) {
  const totalCustomerOwed = lines.filter((l) => l.responsible === 'customer').reduce((sum, l) => sum + l.amount, 0);

  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase text-slate-400">Chi tiết bồi thường hư hỏng/mất mát</p>
      <div className="space-y-3 rounded-lg bg-slate-50 p-4">
        {lines.map((line) => {
          const Icon = ICON_MAP[line.icon] ?? PackageX;
          const isCustomerOwed = line.responsible === 'customer';
          return (
            <div key={line.damageLossItemId} className="flex items-start justify-between gap-2">
              <div className="flex gap-2">
                <Icon className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-slate-900">{line.itemName}</p>
                  {isCustomerOwed ? (
                    <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-700">Khách đền bù</span>
                  ) : (
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                      Trừ lương: {line.responsibleStaffName}
                    </span>
                  )}
                </div>
              </div>
              <p className={`text-xs font-bold ${isCustomerOwed ? 'text-orange-600' : 'text-slate-400'}`}>{formatCurrency(line.amount)}</p>
            </div>
          );
        })}
        <div className="border-t border-slate-200 pt-2">
          <p className="text-right text-xs font-bold text-slate-900">Tổng khách đền bù: {formatCurrency(totalCustomerOwed)}</p>
        </div>
      </div>
    </div>
  );
}
