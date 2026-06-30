import AnalyticsCard from '@/components/dashboard/AnalyticsCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatTime } from '@/utils/formatDate';
import type { SurveyReport } from '@/types/survey';

interface SurveyResultCardProps {
  report: SurveyReport | null;
  surveyorName?: string;
  isLoading: boolean;
}

export default function SurveyResultCard({ report, surveyorName, isLoading }: Readonly<SurveyResultCardProps>) {
  return (
    <AnalyticsCard title="Kết quả khảo sát">
      {isLoading ? (
        <p className="text-sm text-slate-400">Đang tải...</p>
      ) : !report ? (
        <p className="text-sm text-slate-500">Chưa có báo cáo khảo sát cho đơn hàng này.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={report.surveyedBy ?? surveyorName ?? 'KSV'} size="md" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{report.surveyedBy ?? surveyorName ?? 'Khảo sát viên'}</p>
                <p className="text-xs text-slate-400">
                  Khảo sát lúc {formatTime(report.submittedAt)} - {formatDate(report.submittedAt)}
                </p>
              </div>
            </div>
            <Badge variant="success">ĐÃ NỘP</Badge>
          </div>

          <div>
            <p className="mb-1 text-xs font-bold uppercase text-slate-400">Ghi chú kỹ thuật</p>
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{report.notes}</p>
          </div>

          {report.evidences.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {report.evidences.map((ev, idx) => (
                // eslint-disable-next-line @next/next/no-img-element -- ảnh minh chứng từ URL ngoài, không dùng next/image để tránh cấu hình remotePatterns
                <img
                  key={ev.fileUrl + idx}
                  src={ev.fileUrl}
                  alt={`Ảnh khảo sát ${idx + 1}`}
                  className="h-20 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </AnalyticsCard>
  );
}
