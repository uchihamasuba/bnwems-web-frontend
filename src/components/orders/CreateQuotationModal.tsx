'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import { Plus, Trash2, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { quotationApiService } from '@/services/quotation.service';
import { equipmentApiService } from '@/services/equipment.service';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { QuotationDetail } from '@/types/quotation';
import type { EquipmentItem } from '@/types/equipment';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';

interface QuotationItemDraft {
  key: string;
  equipmentItemId: string;
  quantity: number;
  unitPrice: number;
}

interface CreateQuotationModalProps {
  isOpen: boolean;
  /**
   * Bỏ trống khi mở từ trang danh sách báo giá (chưa biết trước đơn hàng nào) — modal sẽ tự hiện
   * 2 select "Chọn khách hàng"/"Chọn đơn hàng" để người dùng chọn ngay trên popup này. Truyền vào
   * khi mở từ tab "Báo giá" trong chi tiết đơn hàng (orderId đã cố định theo ngữ cảnh trang đó).
   */
  orderId?: string;
  /** Truyền vào khi sửa bản nháp hiện có (chỉ hợp lệ khi status === 'draft', BR-10-04) — để trống để tạo phiên bản mới. */
  editingQuotation?: QuotationDetail | null;
  onClose: () => void;
  /** orderId của báo giá vừa tạo/sửa — dùng khi trang cha cần biết để refetch đúng đơn hàng (vd trang danh sách báo giá). */
  onSuccess: (orderId: string) => void;
}

let draftKeySeq = 0;
function nextDraftKey(): string {
  draftKeySeq += 1;
  return `item-${draftKeySeq}`;
}

// Quotation chỉ có 1 cột `tax` gộp chung (schema.prisma) — không có cột riêng cho từng loại phụ phí,
// nên 2 tuỳ chọn dưới đây chỉ là cách UI tách hiển thị, khi gửi lên BE sẽ cộng gộp vào `tax`.
const VAT_RATE = 0.08;
const SERVICE_CHARGE_RATE = 0.05;

export default function CreateQuotationModal({
  isOpen,
  orderId: fixedOrderId,
  editingQuotation,
  onClose,
  onSuccess,
}: Readonly<CreateQuotationModalProps>) {
  const isEditMode = Boolean(editingQuotation);
  // Chỉ hiện chọn khách hàng/đơn hàng ngay trên popup khi mở từ nơi chưa biết trước đơn hàng nào
  // (trang danh sách báo giá) — khi sửa hoặc khi mở từ tab "Báo giá" của 1 đơn hàng cụ thể thì
  // orderId đã cố định theo ngữ cảnh, không cho đổi.
  const needsOrderPicker = !fixedOrderId && !isEditMode;

  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [items, setItems] = useState<QuotationItemDraft[]>([]);
  const [includeVat, setIncludeVat] = useState(false);
  const [includeServiceCharge, setIncludeServiceCharge] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState<'draft' | 'confirm' | null>(null);

  const orderId = fixedOrderId ?? selectedOrderId;

  useEffect(() => {
    if (!isOpen) return;
    equipmentApiService.getEquipments({ limit: 200 }).then((res) => setEquipmentList(res.data ?? []));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !needsOrderPicker) return;
    customerApiService.getCustomers({ limit: 200 }).then((res) => setCustomers(res.data ?? []));
    orderApiService.getOrders({ limit: 200 }).then((res) => setOrders(res.data ?? []));
  }, [isOpen, needsOrderPicker]);

  useEffect(() => {
    if (!isOpen) return;
    if (!needsOrderPicker) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting the order picker when the modal (re)opens for a brand-new quotation, not a render loop
    setSelectedCustomerId('');
    setSelectedOrderId('');
  }, [isOpen, needsOrderPicker]);

  useEffect(() => {
    if (!isOpen) return;
    if (editingQuotation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting the item draft list when the modal opens or the edit target changes, not a render loop
      setItems(
        editingQuotation.items.map((item) => ({
          key: nextDraftKey(),
          equipmentItemId: item.equipmentItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      );
      // Dò lại tuỳ chọn phụ phí ban đầu theo giá trị `tax` đã lưu — chỉ khớp được nếu tax đúng bằng
      // 8%/5%/cả hai trên subtotal đã lưu (xem ghi chú VAT_RATE ở trên); nếu không khớp (tax tự nhập
      // thủ công trước đây) thì để trống, người dùng cần tick lại nếu muốn giữ phụ phí khi lưu.
      // ⚠️ subtotal/tax từ API là Decimal của Prisma, serialize thành STRING trong JSON dù type khai
      // báo `number` (xem types/quotation.ts) — phải Number(...) trước khi so sánh bằng `===`.
      const savedSubtotal = Number(editingQuotation.subtotal);
      const savedTax = Number(editingQuotation.tax);
      const vatAmount = Math.round(savedSubtotal * VAT_RATE);
      const serviceAmount = Math.round(savedSubtotal * SERVICE_CHARGE_RATE);
      setIncludeVat(savedTax === vatAmount || savedTax === vatAmount + serviceAmount);
      setIncludeServiceCharge(savedTax === serviceAmount || savedTax === vatAmount + serviceAmount);
    } else {
      setItems([]);
      setIncludeVat(false);
      setIncludeServiceCharge(false);
    }
    setItemsError(null);
    setSubmitError(null);
  }, [isOpen, editingQuotation]);

  const equipmentById = useMemo(() => new Map(equipmentList.map((e) => [e.equipmentItemId, e])), [equipmentList]);

  const equipmentOptions = useMemo(
    () => equipmentList.map((e) => ({ value: e.equipmentItemId, label: `${e.name} (${formatCurrency(e.rentalPrice)})` })),
    [equipmentList],
  );

  const customerOptions = useMemo(() => customers.map((c) => ({ value: c.customerId, label: `${c.fullName} (#${c.customerId})` })), [customers]);

  const filteredOrderOptions = useMemo(
    () =>
      orders
        .filter((o) => !selectedCustomerId || o.customerId === selectedCustomerId)
        .map((o) => ({ value: o.orderId, label: `#${o.orderId} — ${o.eventType ?? 'Sự kiện'} (${formatDate(o.eventDate)})` })),
    [orders, selectedCustomerId],
  );

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    // Đơn hàng đã chọn thuộc khách hàng khác thì bỏ chọn để tránh gửi nhầm đơn của khách khác.
    const currentOrder = orders.find((o) => o.orderId === selectedOrderId);
    if (currentOrder && currentOrder.customerId !== customerId) {
      setSelectedOrderId('');
    }
  };

  const resetAndClose = () => {
    setSubmitError(null);
    setItemsError(null);
    onClose();
  };

  const handleAddItem = () => {
    const first = equipmentList[0];
    setItems((prev) => [
      ...prev,
      { key: nextDraftKey(), equipmentItemId: first?.equipmentItemId ?? '', quantity: 1, unitPrice: first?.rentalPrice ?? 0 },
    ]);
  };

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleEquipmentChange = (key: string, equipmentItemId: string) => {
    const equipment = equipmentById.get(equipmentItemId);
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, equipmentItemId, unitPrice: equipment?.rentalPrice ?? item.unitPrice } : item)),
    );
  };

  const handleQuantityChange = (key: string, quantity: number) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, quantity } : item)));
  };

  const handleUnitPriceChange = (key: string, unitPrice: number) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, unitPrice } : item)));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vatAmount = includeVat ? Math.round(subtotal * VAT_RATE) : 0;
  const serviceChargeAmount = includeServiceCharge ? Math.round(subtotal * SERVICE_CHARGE_RATE) : 0;
  const taxAmount = vatAmount + serviceChargeAmount;
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async (thenConfirm: boolean) => {
    if (needsOrderPicker && !orderId) {
      setItemsError('Vui lòng chọn đơn hàng liên kết trước khi tạo báo giá.');
      return;
    }
    if (items.length === 0) {
      setItemsError('Vui lòng thêm ít nhất một hạng mục báo giá.');
      return;
    }
    if (items.some((item) => !item.equipmentItemId)) {
      setItemsError('Vui lòng chọn thiết bị/dịch vụ cho tất cả các hạng mục.');
      return;
    }
    if (items.some((item) => item.quantity < 1)) {
      setItemsError('Số lượng phải lớn hơn 0.');
      return;
    }
    setItemsError(null);

    const payload = {
      subtotal,
      tax: taxAmount,
      totalAmount,
      items: items.map((item) => ({ equipmentItemId: item.equipmentItemId, quantity: item.quantity, unitPrice: item.unitPrice })),
    };

    setSubmittingAction(thenConfirm ? 'confirm' : 'draft');
    setSubmitError(null);
    try {
      let targetId = editingQuotation?.quotationId;
      if (isEditMode && editingQuotation) {
        await quotationApiService.updateQuotation(editingQuotation.quotationId, payload);
      } else {
        const res = await quotationApiService.createQuotation(orderId, payload);
        targetId = res.data.id;
      }
      if (thenConfirm && targetId) {
        await quotationApiService.confirmQuotation(targetId);
      }
      onSuccess(orderId);
      resetAndClose();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setSubmitError(
        axiosError.response?.data?.message ??
          (isEditMode ? 'Không thể cập nhật báo giá. Vui lòng thử lại.' : 'Không thể tạo báo giá. Vui lòng thử lại.'),
      );
    } finally {
      setSubmittingAction(null);
    }
  };

  let subtitle: string;
  if (isEditMode) {
    subtitle = `Đơn hàng #${orderId}`;
  } else if (needsOrderPicker) {
    subtitle = 'Chọn khách hàng và đơn hàng, sau đó thêm hạng mục báo giá';
  } else {
    subtitle = `Đơn hàng #${orderId} — hệ thống sẽ tự tăng số phiên bản`;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={isEditMode ? `Sửa báo giá nháp — phiên bản ${editingQuotation?.version}` : 'Tạo báo giá mới'}
      subtitle={subtitle}
      size="2xl"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Hạng mục báo giá */}
        <div className="space-y-4 lg:col-span-8">
          {needsOrderPicker && (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Thông tin chung</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Chọn khách hàng liên kết"
                  value={selectedCustomerId}
                  placeholder="-- Chọn khách hàng --"
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  options={customerOptions}
                />
                <Select
                  label="Chọn đơn hàng liên kết *"
                  value={selectedOrderId}
                  placeholder="-- Chọn đơn hàng --"
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  options={filteredOrderOptions}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Hạng mục báo giá</h3>
            <Button type="button" variant="secondary" size="sm" onClick={handleAddItem} disabled={equipmentList.length === 0}>
              <Plus className="h-4 w-4" />
              Thêm hạng mục
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
              Chưa có hạng mục nào. Nhấn &quot;Thêm hạng mục&quot; để chọn thiết bị/dịch vụ.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const equipment = equipmentById.get(item.equipmentItemId);
                const lineTotal = item.quantity * item.unitPrice;
                return (
                  <div key={item.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
                      <div className="sm:col-span-5">
                        <Select
                          label={`Hạng mục #${idx + 1}`}
                          value={item.equipmentItemId}
                          placeholder="-- Chọn thiết bị/dịch vụ --"
                          onChange={(e) => handleEquipmentChange(item.key, e.target.value)}
                          options={equipmentOptions}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          type="number"
                          label="Số lượng"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.key, Math.max(1, Number(e.target.value) || 1))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          type="number"
                          label="Đơn giá (đ)"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => handleUnitPriceChange(item.key, Math.max(0, Number(e.target.value) || 0))}
                        />
                      </div>
                      <div className="sm:col-span-2 text-sm">
                        <span className="mb-1 block text-xs font-medium text-slate-500">Thành tiền</span>
                        <span className="font-bold text-slate-900">{formatCurrency(lineTotal)}</span>
                      </div>
                      <div className="flex justify-end sm:col-span-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.key)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Xóa hạng mục"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {equipment && (
                      <p className="mt-2 text-xs text-slate-400">
                        Đơn vị: {equipment.unit ?? 'bộ'}
                        {equipment.category ? ` • Loại: ${equipment.category}` : ''}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {itemsError && <p className="text-sm text-red-600">{itemsError}</p>}
        </div>

        {/* Tổng hợp báo giá */}
        <div className="lg:col-span-4">
          <div className="sticky top-0 space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
              <h3 className="text-base font-extrabold text-slate-900">Tổng hợp báo giá</h3>
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-blue-600">
                {isEditMode ? 'Cập nhật' : 'Tạo mới'}
              </span>
            </div>

            <div className="space-y-1 border-b border-slate-50 pb-3">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Tuỳ chọn phụ phí</span>
              <label className="flex cursor-pointer select-none items-center gap-2.5 py-1.5">
                <input
                  type="checkbox"
                  checked={includeVat}
                  onChange={(e) => setIncludeVat(e.target.checked)}
                  aria-label="Thuế VAT (8%)"
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs">
                  <span className="block font-bold text-slate-800">Thuế VAT (8%)</span>
                  <span className="block text-[10px] font-semibold text-slate-400">Cộng thêm 8% vào tổng thanh toán</span>
                </span>
              </label>
              <label className="flex cursor-pointer select-none items-center gap-2.5 py-1.5">
                <input
                  type="checkbox"
                  checked={includeServiceCharge}
                  onChange={(e) => setIncludeServiceCharge(e.target.checked)}
                  aria-label="Phí phục vụ (5%)"
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs">
                  <span className="block font-bold text-slate-800">Phí phục vụ (5%)</span>
                  <span className="block text-[10px] font-semibold text-slate-400">Cộng phí quản lý và phục vụ 5%</span>
                </span>
              </label>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính:</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {includeVat && (
                <div className="flex justify-between text-slate-600">
                  <span>Thuế GTGT (VAT 8%):</span>
                  <span className="font-bold text-slate-900">+{formatCurrency(vatAmount)}</span>
                </div>
              )}
              {includeServiceCharge && (
                <div className="flex justify-between text-slate-600">
                  <span>Phí phục vụ (5%):</span>
                  <span className="font-bold text-slate-900">+{formatCurrency(serviceChargeAmount)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                <span className="text-sm font-black text-slate-800">Tổng tiền cuối:</span>
                <span className="text-xl font-black tracking-tight text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <div className="space-y-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => handleSubmit(false)}
                isLoading={submittingAction === 'draft'}
                disabled={submittingAction === 'confirm'}
              >
                Lưu bản nháp (Draft)
              </Button>
              <Button
                type="button"
                className="w-full"
                onClick={() => handleSubmit(true)}
                isLoading={submittingAction === 'confirm'}
                disabled={submittingAction === 'draft'}
              >
                <Check className="h-4 w-4" />
                Xác nhận &amp; Duyệt báo giá
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={resetAndClose} disabled={submittingAction !== null}>
                Hủy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
