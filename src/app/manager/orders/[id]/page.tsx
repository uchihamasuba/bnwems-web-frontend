'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderDetailHeader from '@/components/orders/OrderDetailHeader';
import OrderLifecycleStepper from '@/components/orders/OrderLifecycleStepper';
import OrderTabs, { OrderTabItem } from '@/components/orders/OrderTabs';
import EventOverviewCard from '@/components/orders/EventOverviewCard';
import CustomerProfileCard from '@/components/orders/CustomerProfileCard';
import FinalQuotation from '@/components/orders/FinalQuotation';
import PaymentHistoryCard from '@/components/orders/PaymentHistoryCard';
import SettlementSummaryCard from '@/components/orders/SettlementSummaryCard';
import RequestPaymentModal from '@/components/orders/RequestPaymentModal';
import CancelOrderModal from '@/components/orders/CancelOrderModal';
import EditOrderModal from '@/components/orders/EditOrderModal';
import ChangeEventDateModal from '@/components/orders/ChangeEventDateModal';
import SurveyPersonnelTab from '@/components/orders/SurveyPersonnelTab';
import OrderStatusHistoryTab from '@/components/orders/OrderStatusHistoryTab';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { paymentApiService } from '@/services/payment.service';
import { settlementApiService } from '@/services/settlement.service';
import { quotationApiService } from '@/services/quotation.service';
import { usePermission } from '@/hooks/usePermission';
import type { OrderDetail } from '@/types/order';
import type { Customer } from '@/types/customer';
import type { Payment } from '@/types/payment';
import type { SettlementPreviewMock } from '@/types/settlement';

const TABS: OrderTabItem[] = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'quotation', label: 'Báo giá' },
  { key: 'settlement', label: 'Thanh toán & Quyết toán' },
  { key: 'survey', label: 'Khảo sát & Nhân sự' },
  { key: 'history', label: 'Lịch sử trạng thái' },
];

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { can } = usePermission();
  const canManage = can('orders:manage');

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settlement');

  const [quotationTotal, setQuotationTotal] = useState<number | null>(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);

  const [settlementPreview, setSettlementPreview] = useState<SettlementPreviewMock | null>(null);
  const [isSettlementConfirmed, setIsSettlementConfirmed] = useState(false);
  const [isSubmittingSettlement, setIsSubmittingSettlement] = useState(false);

  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; mode: 'request' | 'record' }>({
    isOpen: false,
    mode: 'request',
  });
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangeDateModalOpen, setIsChangeDateModalOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    orderApiService
      .getOrder(id)
      .then((res) => {
        const detail: OrderDetail = res.data;
        setOrder(detail);
        return customerApiService.getCustomer(detail.customerId).then((custRes) => setCustomer(custRes.data));
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const [quotationRefreshToken, setQuotationRefreshToken] = useState(0);

  useEffect(() => {
    quotationApiService
      .getOrderQuotations(id)
      .then((res) => {
        const list = res.data ?? [];
        // getOrderQuotations sắp version desc — phần tử đầu (không phải cuối) là phiên bản mới nhất.
        const latest = list[0];
        setQuotationTotal(latest ? latest.totalAmount : null);
      })
      .catch((err) => console.error('[quotations]', err?.response?.data ?? err));
  }, [id, quotationRefreshToken]);

  useEffect(() => {
    // Mock-only — backend không có GET cho settlement theo orderId, xem docs/more-require.md (a).
    settlementApiService.getSettlementPreviewMock(id).then((res) => setSettlementPreview(res.data ?? null));
  }, [id]);

  const [paymentsRefreshToken, setPaymentsRefreshToken] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoadingPayments(true);
    paymentApiService
      .getPaymentsByOrder(id)
      .then((res) => setPayments(res.data ?? []))
      .catch((err) => console.error('[payments]', err?.response?.data ?? err))
      .finally(() => setIsLoadingPayments(false));
  }, [id, paymentsRefreshToken]);

  const refreshPayments = () => setPaymentsRefreshToken((t) => t + 1);

  const totalCollected = payments.filter((p) => p.status === 'success').reduce((sum, p) => sum + Number(p.amount), 0);

  const refreshOrder = () => {
    orderApiService.getOrder(id).then((res) => setOrder(res.data));
  };

  const handleConfirmSettlement = async () => {
    if (!settlementPreview) return;
    setIsSubmittingSettlement(true);
    try {
      const customerOwedCompensation = settlementPreview.damageLines
        .filter((l) => l.responsible === 'customer')
        .reduce((sum, l) => sum + l.amount, 0);
      // remainingAmount gửi backend KHÔNG trừ discount — backend không có field này, xem docs/more-require.md (k)
      const remainingAmount =
        settlementPreview.originalValue + settlementPreview.additionalFees - customerOwedCompensation - settlementPreview.totalPaid;

      const recordRes = await settlementApiService.recordSettlement(id, {
        originalValue: settlementPreview.originalValue,
        additionalFees: settlementPreview.additionalFees,
        compensation: customerOwedCompensation,
        paidAmount: settlementPreview.totalPaid,
        remainingAmount,
      });
      await settlementApiService.confirmSettlement(recordRes.data.settlementId, { status: 'confirmed' });
      // Không có GET nào để refetch trạng thái settlement vừa confirm — cập nhật state cục bộ.
      setIsSettlementConfirmed(true);
    } finally {
      setIsSubmittingSettlement(false);
    }
  };

  if (isLoading || !order || !customer) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-400">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <OrderDetailHeader
        order={order}
        customerName={customer.fullName}
        canManage={canManage}
        onCancelOrder={() => setIsCancelModalOpen(true)}
        onEditOrder={() => setIsEditModalOpen(true)}
        onChangeEventDate={() => setIsChangeDateModalOpen(true)}
      />

      <div className="mb-8">
        <OrderLifecycleStepper status={order.status} />
      </div>

      <OrderTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EventOverviewCard
              order={order}
              quotationTotal={quotationTotal}
              paymentCollected={totalCollected}
              paymentTotal={quotationTotal ?? 0}
            />
          </div>
          <CustomerProfileCard customer={customer} />
        </div>
      )}

      {activeTab === 'quotation' && (
        <FinalQuotation orderId={id} canManage={canManage} onQuotationChanged={() => setQuotationRefreshToken((t) => t + 1)} />
      )}

      {activeTab === 'settlement' && (
        <div className="space-y-6">
          <PaymentHistoryCard
            payments={payments}
            totalDue={quotationTotal ?? 0}
            isLoading={isLoadingPayments}
            onOpenRequestPayment={() => setPaymentModal({ isOpen: true, mode: 'request' })}
          />
          {settlementPreview ? (
            <SettlementSummaryCard
              preview={settlementPreview}
              canManage={canManage}
              isConfirmed={isSettlementConfirmed}
              isSubmitting={isSubmittingSettlement}
              onConfirmSettlement={handleConfirmSettlement}
              onRecordPayment={() => setPaymentModal({ isOpen: true, mode: 'record' })}
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400 shadow-sm">
              Chưa có dữ liệu quyết toán cho đơn hàng này.
            </div>
          )}
        </div>
      )}

      {activeTab === 'survey' && <SurveyPersonnelTab orderId={id} canManage={canManage} />}
      {activeTab === 'history' && <OrderStatusHistoryTab order={order} />}

      <RequestPaymentModal
        isOpen={paymentModal.isOpen}
        orderId={id}
        mode={paymentModal.mode}
        onClose={() => setPaymentModal((m) => ({ ...m, isOpen: false }))}
        onSuccess={refreshPayments}
      />

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        order={order}
        customerName={customer.fullName}
        depositCollected={totalCollected}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={refreshOrder}
      />

      <EditOrderModal
        isOpen={isEditModalOpen}
        order={order}
        customerName={customer.fullName}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={refreshOrder}
      />

      <ChangeEventDateModal
        isOpen={isChangeDateModalOpen}
        order={order}
        onClose={() => setIsChangeDateModalOpen(false)}
        onSuccess={refreshOrder}
      />
    </div>
  );
}
