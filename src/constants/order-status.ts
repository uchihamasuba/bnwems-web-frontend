// Nhãn hiển thị cho trạng thái Order — theo enum thật của backend (prisma/schema.prisma model
// Order), KHÔNG khớp hoàn toàn với docs/api/09-orders.md (doc có "quoted" nhưng backend không có,
// backend có "cancelled" nhưng doc không nhắc) — cần đồng bộ lại doc khi có dịp.
// deposit_paid / settlement_pending là giá trị runtime ghi bởi payment/settlement service
// (chưa được khai báo trong schema comment nhưng xuất hiện thực tế — xem more-require.md mục h).
export const ORDER_STATUS_LABEL: Record<string, string> = {
  draft: 'Nháp',
  confirmed: 'Đã xác nhận',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  deposit_paid: 'Đã đặt cọc',
  settlement_pending: 'Chờ quyết toán',
};
