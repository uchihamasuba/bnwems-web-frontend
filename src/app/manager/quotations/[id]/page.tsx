'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Printer, Check, Pencil, Trash2 } from 'lucide-react';
import { quotationApiService } from '@/services/quotation.service';
import { customerApiService } from '@/services/customer.service';
import { catalogApiService } from '@/services/catalog.service';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import CreateQuotationModal from '@/components/orders/CreateQuotationModal';
import DeleteQuotationModal from '@/components/orders/DeleteQuotationModal';
import { formatCurrency, formatCurrencyInWords } from '@/utils/formatCurrency';
import { formatDate, formatTime } from '@/utils/formatDate';
import { usePermission } from '@/hooks/usePermission';
import type { Quotation, QuotationDetail } from '@/types/quotation';
import type { Customer } from '@/types/customer';

const STATUS_LABEL: Record<Quotation['status'], string> = {
  DRAFT: 'Nháp',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

interface ItemInfo {
  name: string;
  unit: string;
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { can } = usePermission();
  const canManage = can('orders:manage');

  const [detail, setDetail] = useState<QuotationDetail | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [versions, setVersions] = useState<Quotation[]>([]);
  const [itemById, setItemById] = useState<Map<string, ItemInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    setNotFound(false);
    quotationApiService
      .getQuotation(id)
      .then(async (res) => {
        const d: QuotationDetail = res.data;
        setDetail(d);
        const [customerRes, versionsRes] = await Promise.all([
          customerApiService.getCustomer(d.customerId),
          quotationApiService.getCustomerQuotations(d.customerId, { limit: 50 }),
        ]);
        setCustomer(customerRes.data);
        setVersions(versionsRes.data ?? []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    catalogApiService.getItems({ limit: 200 }).then((res) => {
      const items: { itemId: string; itemName: string; unit: string }[] = res.data ?? [];
      setItemById(new Map(items.map((item) => [item.itemId, { name: item.itemName, unit: item.unit }])));
    });
  }, []);

  const totals = useMemo(() => {
    if (!detail) return null;
    return { subtotal: detail.subtotal, discountTotal: detail.discountTotal, totalAmount: detail.totalAmount };
  }, [detail]);

  const handleEditSuccess = async () => {
    const res = await quotationApiService.getQuotation(id);
    setDetail(res.data);
  };

  const handleDeleteSuccess = () => {
    router.push('/manager/quotations');
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    setConfirmError(null);
    try {
      await quotationApiService.updateQuotationStatus(id, { status: 'APPROVED' });
      const res = await quotationApiService.getQuotation(id);
      setDetail(res.data);
      setIsConfirmModalOpen(false);
    } catch {
      setConfirmError('Không thể xác nhận báo giá. Vui lòng thử lại.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-400">Đang tải...</p>
      </div>
    );
  }

  if (notFound || !detail || !customer) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">Không tìm thấy báo giá này.</p>
        <Link href="/manager/quotations" className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline">
          Quay lại danh sách báo giá
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 print:p-0">
      {/* Breadcrumb + back link — ẩn khi in */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/manager/quotations" className="hover:text-slate-700">
            Báo giá
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-slate-900">{detail.quotationCode}</span>
        </nav>
        <Link href="/manager/quotations" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* CỘT TRÁI — hóa đơn báo giá dạng in */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.25 }}
          className="space-y-8 rounded-none border border-slate-300 bg-white p-8 shadow-md lg:col-span-8 sm:p-12 print:border-0 print:shadow-none"
        >
          <div className="flex flex-col items-start justify-between gap-4 text-xs sm:flex-row">
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900">BN Wedding &amp; Event</h2>
              <p className="mt-0.5 font-medium text-slate-500">Đông Anh, Hà Nội</p>
              <p className="font-medium text-slate-500">Hotline: 0901 234 567</p>
            </div>
            <div className="text-left font-medium sm:text-right">
              <p className="text-slate-800">
                <span className="text-slate-400">Mã báo giá:</span> <strong className="text-slate-950">{detail.quotationCode}</strong>
              </p>
              <p className="mt-0.5 text-slate-400">
                Ngày tạo: <span className="font-semibold text-slate-700">{formatDate(detail.createdAt)}</span>
              </p>
            </div>
          </div>

          <div className="border-b-2 border-slate-800" />

          <div className="text-center">
            <h3 className="text-2xl font-black tracking-widest text-slate-950">PHIẾU BÁO GIÁ</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-800">
            <div className="flex items-end gap-1.5">
              <span className="whitespace-nowrap text-slate-400">Tên khách hàng:</span>
              <span className="flex-1 border-b border-dotted border-slate-300 pb-0.5 font-bold text-slate-900">{customer.customerName}</span>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="whitespace-nowrap text-slate-400">Địa chỉ:</span>
              <span className="flex-1 border-b border-dotted border-slate-300 pb-0.5 font-semibold text-slate-800">{customer.address || '—'}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-t-2 border-slate-800 text-[11px] font-bold uppercase text-slate-900">
                  <th className="w-12 px-3 py-2 text-center">STT</th>
                  <th className="px-3 py-2 text-left">Tên hạng mục</th>
                  <th className="w-16 px-3 py-2 text-center">ĐVT</th>
                  <th className="w-16 px-3 py-2 text-center">SL</th>
                  <th className="w-28 px-3 py-2 text-right">Đơn giá</th>
                  <th className="w-28 px-3 py-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                {detail.items.map((item, index) => {
                  const itemInfo = itemById.get(item.itemId);
                  return (
                    <tr key={item.quotationItemId ?? `${item.itemId}-${index}`}>
                      <td className="px-3 py-3 text-center font-medium text-slate-400">{index + 1}</td>
                      <td className="px-3 py-3 font-semibold leading-snug text-slate-950">
                        {itemInfo?.name ?? item.itemName ?? `#${item.itemId}`}
                      </td>
                      <td className="px-3 py-3 text-center font-medium text-slate-500">{itemInfo?.unit ?? 'bộ'}</td>
                      <td className="px-3 py-3 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="px-3 py-3 text-right font-semibold text-slate-600">{formatCurrency(item.price)}</td>
                      <td className="px-3 py-3 text-right font-extrabold text-slate-950">
                        {formatCurrency(item.lineTotal ?? item.quantity * item.price - (item.discount ?? 0))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totals && (
            <div className="flex justify-end">
              <div className="w-72 space-y-2 text-xs font-medium text-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tổng tiền hàng:</span>
                  <span className="font-bold text-slate-950">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span className="text-slate-500">Giảm giá:</span>
                  <span className="font-bold">-{formatCurrency(totals.discountTotal)}</span>
                </div>
                <div className="my-1 border-b-2 border-slate-800" />
                <div className="flex justify-between pt-1 text-sm font-black text-slate-950">
                  <span>Tổng cộng:</span>
                  <span className="text-base font-black">{formatCurrency(totals.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-12 border-t border-slate-100 pt-8">
            <div className="space-y-2 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-400">Số tiền bằng chữ:</span>{' '}
                <span className="font-bold italic text-slate-800">{formatCurrencyInWords(detail.totalAmount)}</span>
              </p>
              <p className="italic text-slate-500">
                Báo giá có hiệu lực 07 ngày kể từ ngày lập, chưa bao gồm phụ phí phát sinh tại hiện trường (nếu có).
              </p>
            </div>

            <div className="grid grid-cols-2 pt-4 text-center">
              <div className="space-y-14">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-900">Khách hàng</p>
                <p className="text-[11px] italic text-slate-400">(Ký, ghi rõ họ tên)</p>
              </div>
              <div className="space-y-14">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-900">Người lập báo giá</p>
                <p className="text-[11px] italic text-slate-400">(Ký, ghi rõ họ tên)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CỘT PHẢI — trạng thái, tài chính, thao tác, lịch sử phiên bản — ẩn khi in */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="space-y-6 lg:col-span-4 print:hidden"
        >
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Trạng thái báo giá</h3>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(detail.status)}>{STATUS_LABEL[detail.status]}</Badge>
            </div>

            {versions.length > 1 ? (
              <Select
                label="Phiên bản"
                value={detail.quotationId}
                onChange={(e) => router.push(`/manager/quotations/${e.target.value}`)}
                options={versions.map((v) => ({ value: v.quotationId, label: `Phiên bản ${v.version} — ${STATUS_LABEL[v.status]}` }))}
              />
            ) : (
              <p className="text-xs font-semibold text-slate-600">Phiên bản {detail.version}</p>
            )}

            <div className="space-y-2.5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Khách hàng:</span>
                <Link href={`/manager/customers/${customer.customerId}`} className="font-semibold text-blue-600 hover:underline">
                  {customer.customerName}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ngày cập nhật:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(detail.updatedAt)} {formatTime(detail.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Tóm tắt tài chính</h3>
            <div className="space-y-2.5 text-xs font-medium text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Tổng tiền hàng:</span>
                <span className="font-bold text-slate-800">{formatCurrency(detail.subtotal)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span className="text-slate-400">Giảm giá:</span>
                <span className="font-bold">-{formatCurrency(detail.discountTotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-500">Thành tiền:</span>
                <span className="text-lg font-black text-blue-600">{formatCurrency(detail.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <Button className="w-full" variant="primary" onClick={() => globalThis.print()}>
              <Printer className="h-4 w-4" />
              In / Xuất PDF
            </Button>
            {canManage && detail.status === 'DRAFT' && (
              <Button className="w-full" variant="secondary" onClick={() => setIsEditModalOpen(true)}>
                <Pencil className="h-4 w-4" />
                Sửa báo giá
              </Button>
            )}
            {canManage && detail.status === 'DRAFT' && (
              <Button className="w-full" variant="secondary" onClick={() => setIsConfirmModalOpen(true)}>
                <Check className="h-4 w-4" />
                Xác nhận & duyệt báo giá
              </Button>
            )}
            {canManage && detail.status === 'DRAFT' && (
              <Button className="w-full" variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Xóa báo giá
              </Button>
            )}
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Lịch sử phiên bản</h3>
            <div className="relative space-y-6 pl-6 before:absolute before:bottom-1.5 before:left-2 before:top-1.5 before:w-0.5 before:bg-slate-100 before:content-['']">
              {versions.map((v) => (
                <div key={v.quotationId} className="relative">
                  <div
                    className={`absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      v.quotationId === detail.quotationId ? 'bg-blue-600 ring-4 ring-blue-50' : 'bg-slate-300'
                    }`}
                  />
                  <div>
                    <Link
                      href={`/manager/quotations/${v.quotationId}`}
                      className={`text-xs font-bold leading-none hover:underline ${v.quotationId === detail.quotationId ? 'text-blue-600' : 'text-slate-900'}`}
                    >
                      Phiên bản {v.version} — {STATUS_LABEL[v.status]}
                    </Link>
                    <p className="mt-1.5 text-[10px] font-semibold text-slate-400">{formatDate(v.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => (isConfirming ? null : setIsConfirmModalOpen(false))}
        title="Xác nhận & duyệt báo giá"
        subtitle="Báo giá sau khi duyệt sẽ không thể chỉnh sửa hoặc xóa."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)} disabled={isConfirming}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleConfirm} isLoading={isConfirming}>
              Xác nhận duyệt
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-slate-600">
            Duyệt báo giá <strong>{detail.quotationCode}</strong> (phiên bản {detail.version}) với tổng tiền{' '}
            <strong>{formatCurrency(detail.totalAmount)}</strong> cho khách hàng <strong>{customer.customerName}</strong>?
          </p>
          {confirmError && <p className="text-sm text-red-600">{confirmError}</p>}
        </div>
      </Modal>

      <CreateQuotationModal
        isOpen={isEditModalOpen}
        customerId={detail.customerId}
        editingQuotation={detail}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />

      <DeleteQuotationModal
        isOpen={isDeleteModalOpen}
        quotation={detail}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
