'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { paymentApiService } from '@/services/payment.service';
import type { PaymentType } from '@/types/payment';

interface RequestPaymentModalProps {
  isOpen: boolean;
  orderId: string;
  /**
   * 'request' = tạo yêu cầu thanh toán mới (vd gửi QR cho khách, chưa chắc đã thu được tiền) —
   * chỉ tạo request, KHÔNG tự confirm.
   * 'record' = Manager ghi nhận một khoản đã thu thật tại văn phòng (tiền mặt/chuyển khoản) —
   * tạo request rồi confirm ngay, vì tiền đã thực nhận.
   */
  mode: 'request' | 'record';
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestPaymentModal({ isOpen, orderId, mode, onClose, onSuccess }: Readonly<RequestPaymentModalProps>) {
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('deposit');
  const [paymentMethod, setPaymentMethod] = useState<string>(mode === 'record' ? 'cash' : 'bank_transfer');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetAndClose = () => {
    setAmount('');
    setPaymentType('deposit');
    setEvidenceUrl('');
    setPaymentUrl(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const requestRes = await paymentApiService.requestPayment(orderId, {
        amount: numericAmount,
        paymentType,
        paymentMethod: paymentMethod as 'cash' | 'bank_transfer' | 'VNPAY_QR',
      });
      const newPaymentRequestId: string = requestRes.data.id;

      if (mode === 'record') {
        await paymentApiService.confirmPaymentRequest(newPaymentRequestId, {
          status: 'completed',
          evidenceUrl: evidenceUrl || undefined,
        });
        onSuccess();
        resetAndClose();
      } else if (requestRes.data.paymentUrl) {
        setPaymentUrl(requestRes.data.paymentUrl);
      } else {
        onSuccess();
        resetAndClose();
      }
    } catch {
      setError('Không thể xử lý thanh toán. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={mode === 'record' ? 'Ghi nhận thanh toán' : 'Tạo yêu cầu thanh toán mới'}
      footer={
        paymentUrl ? (
          <Button
            onClick={() => {
              onSuccess();
              resetAndClose();
            }}
          >
            Đóng
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={resetAndClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting}>
              {mode === 'record' ? 'Ghi nhận' : 'Tạo yêu cầu'}
            </Button>
          </>
        )
      }
    >
      {paymentUrl ? (
        <p className="text-sm text-slate-600">
          Đã tạo yêu cầu thanh toán qua VNPay. Đường dẫn QR: <span className="font-mono text-blue-600">{paymentUrl}</span>
        </p>
      ) : (
        <div className="space-y-4">
          <Select
            label="Loại thanh toán"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as PaymentType)}
            options={[
              { value: 'deposit', label: 'Đặt cọc' },
              { value: 'final', label: 'Cuối kỳ' },
            ]}
          />
          <Select
            label="Phương thức"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={
              mode === 'record'
                ? [
                    { value: 'cash', label: 'Tiền mặt' },
                    { value: 'bank_transfer', label: 'Chuyển khoản' },
                  ]
                : [
                    { value: 'bank_transfer', label: 'Chuyển khoản' },
                    { value: 'VNPAY_QR', label: 'QR VNPay' },
                  ]
            }
          />
          <Input
            type="number"
            label="Số tiền"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="VD: 25000000"
            required
          />
          {mode === 'record' && (
            <Input
              label="Đường dẫn chứng từ (không bắt buộc)"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://..."
              helpText="Phải là đường dẫn URL hợp lệ nếu nhập"
            />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
