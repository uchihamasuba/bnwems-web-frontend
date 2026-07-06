'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Package, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatDate';
import type { WorkTask } from '@/types/workTask';
import type { SurveyReport } from '@/types/survey';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';

export interface SurveyRow {
  task: WorkTask;
  order?: Order;
  customer?: Customer;
  report: SurveyReport | null;
  surveyorName?: string;
  /**
   * Ngày khảo sát — MOCK, không phải dữ liệu thật. WorkTask thật không có cột ngày dự kiến; ngày
   * dự kiến thật nằm ở model Schedule riêng nhưng GET /schedules chưa được backend triển khai (501).
   * Xem docs/more-require.md mục (bb). Luôn hiển thị in nghiêng để phân biệt với dữ liệu thật.
   */
  mockSurveyDate: string;
}

interface SurveyReportDrawerProps {
  row: SurveyRow | null;
  onClose: () => void;
}

interface ProposedItem {
  name: string;
  qty: number;
  note: string;
}

// Deterministic seed từ string để mock data ổn định qua reload
function strSeed(s: string): number {
  return s.split('').reduce((acc, c) => acc + (c.codePointAt(0) ?? 0), 0);
}

// MOCK: số đo kỹ thuật — backend thật không trả các field này (xem docs/more-require.md)
function mockMeasurements(taskId: string) {
  const seed = strSeed(taskId);
  const length = (15 + (seed % 16)) + (seed % 2 === 0 ? 0.4 : 0);
  const width = (8 + (seed % 10)) + (seed % 3 === 0 ? 0.2 : 0);
  const area = Math.round(length * width);
  return { length, width, area };
}

// MOCK: hành lang bốc dỡ thiết bị
const MOCK_CORRIDORS = [
  'Lối đi thang máy vận chuyển hàng rộng 2.2m, cao 2.4m. Rất thuận tiện.',
  'Cửa hậu sảnh rộng 3m, không có bậc thềm. Xe tải nhỏ vào được.',
  'Thang máy hàng 2×2m, tải trọng 1 tấn. Cần tháo rời thiết bị lớn trước khi đưa lên.',
];

// MOCK: giới hạn lắp đặt
const MOCK_CONSTRAINTS = [
  'Không được khoan đục vào tường/trần của khách sạn. Setup khung Truss tự đứng.',
  'Không được dán băng keo lên sàn gỗ. Dùng đế cao su bảo vệ.',
  'Nguồn điện tối đa 50A/3 pha. Kiểm tra phụ tải trước khi kết nối.',
];

// MOCK: yêu cầu bổ sung của khách
const MOCK_EXTRA_REQUESTS = [
  'Khách muốn bổ sung thêm 2 đèn rọi follow sân khấu.',
  'Khách yêu cầu thêm màn hình 55 inch tại khu vực đón khách.',
  'Khách đề nghị trang bị thêm hệ thống âm thanh ngoài trời cho khu sân vườn.',
];

// MOCK: đề xuất thiết bị sau khảo sát
const ALL_PROPOSED: ProposedItem[] = [
  { name: 'Khung Truss nhôm tự đứng 8x4m', qty: 1, note: 'Gia cố chân sắt chịu lực nặng' },
  { name: 'Đèn Follow Spot 2500W', qty: 2, note: 'Đặt ở ban công kỹ thuật cuối phòng' },
  { name: 'Màn chiếu LED P3 8x4m', qty: 1, note: 'Phía sau sân khấu, treo Truss' },
  { name: 'Máy phun khói Haze 1500W', qty: 2, note: 'Hiệu ứng sân khấu' },
  { name: 'Loa monitor sân khấu 15"', qty: 4, note: 'Bổ sung theo yêu cầu khách' },
];

function mockProposedItems(taskId: string): ProposedItem[] {
  const seed = strSeed(taskId);
  return ALL_PROPOSED.slice(0, 2 + (seed % 2));
}

function pickMock<T>(arr: T[], taskId: string): T {
  return arr[strSeed(taskId) % arr.length];
}

// Tạo mã báo cáo dạng SRV-XXX từ orderId
function surveyReportCode(orderId: string): string {
  const num = orderId.replace(/\D/g, '').padStart(3, '0').slice(-3);
  return `SRV-${num}`;
}

export default function SurveyReportDrawer({ row, onClose }: Readonly<SurveyReportDrawerProps>) {
  return (
    <AnimatePresence>
      {row && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <button type="button" className="flex-1 cursor-default" aria-label="Đóng" onClick={onClose} />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2 }}
            className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl"
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Hồ sơ định vị khảo sát
                </span>
                <div className="mt-1 flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Báo cáo khảo sát {surveyReportCode(row.task.orderId)}
                  </h2>
                  {row.report ? (
                    <Badge variant="success">Đã nộp</Badge>
                  ) : (
                    <Badge variant="warning">Chờ duyệt</Badge>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Scrollable body ─────────────────────────────────────────── */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">

              {/* Thông tin chung sự kiện */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Thông tin chung sự kiện
                </p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">Khách hàng:</span>{' '}
                    <span className="text-slate-900">
                      {row.customer?.fullName ?? '—'}
                    </span>
                    {' '}
                    <span className="text-slate-400 text-xs">
                      (Mã đơn:{' '}
                      <Link
                        href={`/manager/orders/${row.task.orderId}`}
                        onClick={onClose}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {row.task.orderId}
                      </Link>
                      )
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Ngày tiến hành:</span>{' '}
                    <span
                      className="italic text-slate-600"
                      title="Dữ liệu minh họa — chưa có API ngày khảo sát thật"
                    >
                      {formatDate(row.mockSurveyDate)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold text-slate-700">Địa điểm đo đạc:</span>{' '}
                    <span className="text-slate-900">{row.order?.eventLocation ?? '—'}</span>
                  </div>
                </div>
              </div>

              {/* Số đo kỹ thuật — MOCK italic */}
              {(() => {
                const m = mockMeasurements(row.task.workTaskId);
                return (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-800">
                      Số đo kỹ thuật mặt bằng sảnh
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          { label: 'Chiều dài', value: `${m.length} m` },
                          { label: 'Chiều rộng', value: `${m.width} m` },
                          { label: 'Diện tích sảnh', value: `${m.area} m²` },
                        ] as const
                      ).map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-xs"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {metric.label}
                          </p>
                          <p
                            className="mt-1 text-2xl font-bold italic text-slate-800"
                            title="Dữ liệu minh họa"
                          >
                            {metric.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      <span className="font-semibold">Lối đi bốc xếp thiết bị:</span>{' '}
                      <span
                        className="italic text-slate-500"
                        title="Dữ liệu minh họa"
                      >
                        {pickMock(MOCK_CORRIDORS, row.task.workTaskId)}
                      </span>
                    </p>
                  </div>
                );
              })()}

              {/* Ràng buộc & Ghi chú — notes từ backend thật */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Ràng buộc &amp; Ghi chú thực tế sảnh
                </h3>

                {row.report?.notes ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm italic text-amber-800">
                    {row.report.notes}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm italic text-slate-400">
                    Chưa có ghi chú khảo sát.
                  </div>
                )}

                <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold">Giới hạn lắp đặt:</span>{' '}
                    <span className="italic text-slate-500" title="Dữ liệu minh họa">
                      {pickMock(MOCK_CONSTRAINTS, row.task.workTaskId)}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">Yêu cầu bổ sung của khách:</span>{' '}
                    <span className="italic text-slate-500" title="Dữ liệu minh họa">
                      {pickMock(MOCK_EXTRA_REQUESTS, row.task.workTaskId)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Hình ảnh hiện trường — evidences từ backend thật */}
              {row.report && row.report.evidences.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <span>🖼️</span> Hình ảnh hiện trường (Ghi chú khảo sát)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {row.report.evidences.map((ev, idx) => (
                      <div
                        key={ev.fileUrl + idx}
                        className="relative overflow-hidden rounded-xl border border-slate-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh từ URL ngoài, không dùng next/image để tránh cấu hình remotePatterns */}
                        <img
                          src={ev.fileUrl}
                          alt={`Hình ảnh hiện trường ${idx + 1}`}
                          className="h-40 w-full object-cover"
                        />
                        {idx > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="rounded-md bg-black/40 px-2 py-0.5 text-sm font-semibold text-white">
                              Hình ảnh #{idx + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Đề xuất bổ sung thiết bị — MOCK italic */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Đề xuất bổ sung thiết bị sau khảo sát
                </h3>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Tên thiết bị đề xuất
                        </th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Số lượng
                        </th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Mục đích sử dụng / Ghi chú
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockProposedItems(row.task.workTaskId).map((item) => (
                        <tr key={item.name} className="hover:bg-slate-50/50">
                          <td
                            className="px-4 py-3 font-medium italic text-slate-700"
                            title="Dữ liệu minh họa"
                          >
                            {item.name}
                          </td>
                          <td
                            className="px-4 py-3 text-center font-bold italic text-blue-600"
                            title="Dữ liệu minh họa"
                          >
                            {item.qty}
                          </td>
                          <td
                            className="px-4 py-3 italic text-slate-500"
                            title="Dữ liệu minh họa"
                          >
                            {item.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-6 py-4">
              <Link
                href={`/manager/orders/${row.task.orderId}`}
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Quay lại xem đơn hàng
              </Link>
              <Link
                href="/manager/inventory/stock-status"
                onClick={onClose}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Package className="h-3.5 w-3.5" />
                Kiểm tra lại tồn kho
              </Link>
              <Link
                href={`/manager/orders/${row.task.orderId}?tab=quotation`}
                onClick={onClose}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <FileText className="h-3.5 w-3.5" />
                Cập nhật báo giá
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
