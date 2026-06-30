import AnalyticsCard from '@/components/dashboard/AnalyticsCard';
import { Button } from '@/components/ui/Button';
import DamageCompensationBreakdown from './DamageCompensationBreakdown';
import { formatCurrency } from '@/utils/formatCurrency';
import type { SettlementPreviewMock } from '@/types/settlement';

interface SettlementSummaryCardProps {
  preview: SettlementPreviewMock;
  canManage: boolean;
  isConfirmed: boolean;
  isSubmitting: boolean;
  onConfirmSettlement: () => void;
  onRecordPayment: () => void;
}

export default function SettlementSummaryCard({
  preview,
  canManage,
  isConfirmed,
  isSubmitting,
  onConfirmSettlement,
  onRecordPayment,
}: Readonly<SettlementSummaryCardProps>) {
  const customerOwedCompensation = preview.damageLines
    .filter((l) => l.responsible === 'customer')
    .reduce((sum, l) => sum + l.amount, 0);

  // Hiển thị có trừ "discount" cho khớp thiết kế — nhưng API thật KHÔNG có field này (xem
  // docs/more-require.md mục k), nên số gửi lên backend (settlement.service.ts xử lý trong
  // page.tsx khi submit) sẽ KHÔNG trừ discount, lệch với số hiển thị ở đây đúng bằng phần discount.
  const finalAmountDue =
    preview.originalValue + preview.additionalFees - preview.discount + customerOwedCompensation - preview.totalPaid;

  return (
    <AnalyticsCard title="Phiếu quyết toán dự kiến" isPlaceholder>
      <div className="mb-4 flex justify-end">
        {isConfirmed ? (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">ĐÃ XÁC NHẬN QUYẾT TOÁN</span>
        ) : (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">CHỜ DUYỆT QUYẾT TOÁN</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Giá trị dịch vụ chính:</span>
            <span className="font-semibold">{formatCurrency(preview.originalValue)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Phụ thu phát sinh:</span>
            <span className="font-semibold text-orange-600">+{formatCurrency(preview.additionalFees)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Giảm trừ/Ưu đãi (*):</span>
            <span className="font-semibold text-green-600">-{formatCurrency(preview.discount)}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Bồi thường hư hỏng (khách đền bù):</span>
              <span className="font-semibold text-orange-600">+{formatCurrency(customerOwedCompensation)}</span>
            </div>
            <p className="text-[10px] text-slate-400">Không gồm khoản trừ lương nội bộ — xem chi tiết bên phải</p>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3">
            <span className="font-bold text-slate-900">Đã thu:</span>
            <span className="font-bold text-slate-900">-{formatCurrency(preview.totalPaid)}</span>
          </div>
          <div className="flex items-center justify-between border-t-2 border-slate-900 pt-4">
            <span className="text-lg font-extrabold text-slate-900">Cần thu cuối:</span>
            <span className="text-2xl font-extrabold text-blue-600">{formatCurrency(finalAmountDue)}</span>
          </div>
          <p className="text-[10px] text-slate-400">(*) Giảm trừ/Ưu đãi chưa có field tương ứng trong API quyết toán — xem docs/more-require.md.</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase text-slate-400">Chi tiết phụ thu</p>
            <div className="space-y-2 rounded-lg bg-slate-50 p-4">
              {preview.surchargeLines.map((line) => (
                <div key={line.reason} className="flex justify-between text-xs">
                  <span className="text-slate-600">{line.reason}:</span>
                  <span className="font-bold">{formatCurrency(line.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <DamageCompensationBreakdown lines={preview.damageLines} />

          {canManage && !isConfirmed && (
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" disabled={isSubmitting} onClick={onConfirmSettlement}>
                Xác nhận quyết toán
              </Button>
              <Button variant="secondary" className="flex-1" disabled={isSubmitting} onClick={onRecordPayment}>
                Ghi nhận thanh toán
              </Button>
            </div>
          )}
        </div>
      </div>
    </AnalyticsCard>
  );
}
