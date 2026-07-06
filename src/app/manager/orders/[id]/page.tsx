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
import RecordDepositModal from '@/components/orders/RecordDepositModal';
import RecordSettlementModal from '@/components/orders/RecordSettlementModal';
import CancelOrderModal from '@/components/orders/CancelOrderModal';
import SurveyPersonnelTab from '@/components/orders/SurveyPersonnelTab';
import OrderStatusHistoryTab from '@/components/orders/OrderStatusHistoryTab';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { paymentApiService } from '@/services/payment.service';
import { settlementApiService } from '@/services/settlement.service';
import { usePermission } from '@/hooks/usePermission';
import type { OrderDetail } from '@/types/order';
import type { Customer } from '@/types/customer';
import type { Deposit } from '@/types/payment';
import type { Settlement } from '@/types/settlement';

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

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(true);

  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [isSubmittingSettlement, setIsSubmittingSettlement] = useState(false);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

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

  const [settlementRefreshToken, setSettlementRefreshToken] = useState(0);

  useEffect(() => {
    settlementApiService.getOrderSettlement(id).then((res) => setSettlement(res.data ?? null));
  }, [id, settlementRefreshToken]);

  const [depositsRefreshToken, setDepositsRefreshToken] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoadingDeposits(true);
    paymentApiService
      .getOrderDeposits(id)
      .then((res) => setDeposits(res.data ?? []))
      .catch((err) => console.error('[deposits]', err?.response?.data ?? err))
      .finally(() => setIsLoadingDeposits(false));
  }, [id, depositsRefreshToken]);

  const refreshDeposits = () => setDepositsRefreshToken((t) => t + 1);
  const refreshSettlement = () => setSettlementRefreshToken((t) => t + 1);

  const totalCollected = deposits.filter((d) => d.status === 'SUCCESS').reduce((sum, d) => sum + Number(d.amount), 0);

  const refreshOrder = () => {
    orderApiService.getOrder(id).then((res) => setOrder(res.data));
  };

  const handleConfirmSettlement = async () => {
    if (!settlement) return;
    setIsSubmittingSettlement(true);
    try {
      await settlementApiService.confirmSettlement(settlement.settlementId, { status: 'CONFIRMED' });
      refreshSettlement();
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
        customerName={customer.customerName}
        canManage={canManage}
        onCancelOrder={() => setIsCancelModalOpen(true)}
      />

      <div className="mb-8">
        <OrderLifecycleStepper status={order.orderStatus} />
      </div>

      <OrderTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EventOverviewCard
              order={order}
              quotationTotal={order.totalAmount}
              paymentCollected={totalCollected}
              paymentTotal={order.totalAmount}
            />
          </div>
          <CustomerProfileCard customer={customer} />
        </div>
      )}

      {activeTab === 'quotation' && (
        <FinalQuotation
          quotationId={order.quotationId}
          customerId={order.customerId}
          canManage={canManage}
        />
      )}

      {activeTab === 'settlement' && (
        <div className="space-y-6">
          <PaymentHistoryCard
            deposits={deposits}
            totalDue={order.totalAmount}
            isLoading={isLoadingDeposits}
            onOpenRequestPayment={() => setIsDepositModalOpen(true)}
          />
          <SettlementSummaryCard
            settlement={settlement}
            orderTotal={order.totalAmount}
            depositCollected={totalCollected}
            canManage={canManage}
            isSubmitting={isSubmittingSettlement}
            onOpenRecordSettlement={() => setIsSettlementModalOpen(true)}
            onConfirmSettlement={handleConfirmSettlement}
          />
        </div>
      )}

      {activeTab === 'survey' && <SurveyPersonnelTab orderId={id} canManage={canManage} />}
      {activeTab === 'history' && <OrderStatusHistoryTab order={order} />}

      <RecordDepositModal
        isOpen={isDepositModalOpen}
        orderId={id}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={refreshDeposits}
      />

      <RecordSettlementModal
        isOpen={isSettlementModalOpen}
        orderId={id}
        orderTotal={order.totalAmount}
        depositCollected={totalCollected}
        onClose={() => setIsSettlementModalOpen(false)}
        onSuccess={refreshSettlement}
      />

      <CancelOrderModal
        isOpen={isCancelModalOpen}
        order={order}
        customerName={customer.customerName}
        depositCollected={totalCollected}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={refreshOrder}
      />
    </div>
  );
}
