# 11. Thanh toán & Quyết toán — API

> **UC:** 83–87 · **Vai trò:** Manager · **Nền tảng:** Web · **Tích hợp:** VNPay
> Quy ước chung & template: [README.md](./README.md)
> Prefix MSG: yêu cầu đặt cọc **MSG-DPR**, thanh toán QR **MSG-QR**, chứng từ thanh toán **MSG-PE**, chi tiết quyết toán **MSG-ST**, nộp quyết toán **MSG-SA** (mục 8).

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| UC-83 | Tạo yêu cầu thanh toán đặt cọc | `POST /orders/{id}/deposit-request` | Manager | ✅ |
| UC-84 | Tạo thanh toán QR (VNPay) | `POST /payments/{id}/qr-code` | Manager | ✅ |
| — | Callback VNPay | `POST /payments/vnpay/callback` | VNPay | ✅ |
| UC-85 | Xác nhận chứng từ thanh toán | `POST /payments/{id}/confirm` | Manager | ✅ |
| UC-86 | Xác nhận quyết toán | `POST /settlements/{id}/approve` | Manager | ✅ |
| UC-87 | Ghi nhận thanh toán cuối | `POST /orders/{id}/final-payment` | Manager | ✅ |
| — | Xem thanh toán / quyết toán của đơn | `GET /orders/{id}/payments` · `GET /orders/{id}/settlement` | Manager | ✅ |

> ⚠️ **Cần xác nhận:** `database.md` không có entity "Deposit Payment Request" riêng — gộp vào `payments` (loại `deposit`, `status=pending`). Luồng **callback VNPay** (IPN, chữ ký, return URL) chưa được đặc tả trong 3 file → endpoint callback dưới là khung đề xuất.

---

## Chi tiết endpoint

### `[UC-83]` Tạo yêu cầu thanh toán đặt cọc

`POST /orders/{id}/deposit-request`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-83 · BR-DPR01–04 |
| **Mô tả** | Sau khi báo giá `approved`, tạo yêu cầu đặt cọc — bản ghi `payments` loại `deposit`, `status=pending`. Số tiền tính theo Chính sách đặt cọc trên tổng báo giá. Không tạo trùng yêu cầu đặt cọc đang hoạt động. |

**Request body**

```json
{ "payment_method": "vnpay" }
```

**Response `201`**

```json
{
  "success": true,
  "code": "MSG-DPR-01",
  "message": "Tạo yêu cầu đặt cọc thành công",
  "data": { "id": 40, "order_id": 10, "payment_type": "deposit", "amount": 1440000, "status": "pending" }
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 409 | MSG-DPR-02 | Chưa có báo giá `approved` (BR-DPR01) |
| 409 | MSG-DPR-03 | Đã tồn tại yêu cầu đặt cọc đang hoạt động (BR-DPR03) |

---

### `[UC-84]` Tạo thanh toán QR (VNPay)

`POST /payments/{id}/qr-code`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-84 · BR-QR01–04 |
| **Mô tả** | Sinh link/mã QR VNPay cho một khoản thanh toán. Chỉ tạo khi VNPay khả dụng; lưu `transaction_ref`. Dự phòng: thanh toán thủ công kèm chứng từ nếu VNPay lỗi. |

**Response `200`**

```json
{
  "success": true,
  "code": "MSG-QR-01",
  "message": "Tạo mã QR thành công",
  "data": { "payment_id": 40, "qr_url": "https://sandbox.vnpayment.vn/...", "transaction_ref": "VNP16881234" }
}
```

---

### `[—]` Callback VNPay (IPN)

`POST /payments/vnpay/callback`

| | |
|---|---|
| **Vai trò** | VNPay (không qua token; xác thực bằng chữ ký) |
| **Mô tả** | VNPay gọi về (IPN) khi khách thanh toán xong. Hệ thống bắt buộc phải kiểm tra chữ ký `vnp_SecureHash` (thuật toán HMAC-SHA512) để xác minh tính toàn vẹn **trước khi** xử lý. Nếu hợp lệ, hệ thống đối chiếu `vnp_Amount`, kiểm tra `vnp_ResponseCode` và cập nhật `payments.status` (`confirmed`/`failed`) dựa trên `vnp_TxnRef` (chứa `payment_id` hoặc `order_id`). |

**Request Payload (x-www-form-urlencoded)**

```json
{
  "vnp_TxnRef": "PAY40",
  "vnp_Amount": "144000000",
  "vnp_ResponseCode": "00",
  "vnp_TransactionNo": "123456789",
  "vnp_SecureHash": "b2c9..."
}
```

**Response `200`**

```json
{ "RspCode": "00", "Message": "Confirm Success" }
```

---

### `[UC-85]` Xác nhận chứng từ thanh toán

`POST /payments/{id}/confirm`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-85 · BR-PE01–05 |
| **Mô tả** | Manager duyệt chứng từ thanh toán (ảnh chuyển khoản/biên lai do Leader tải lên — xem UC-105). Chứng từ phải khớp đơn + số tiền + phương thức. Từ chối cần lý do. Cập nhật `status=confirmed`. |

**Request body**

```json
{ "decision": "confirmed", "notes": "Khớp sao kê" }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-PE-01", "message": "Đã xác nhận chứng từ thanh toán", "data": { "id": 40, "status": "confirmed", "confirmed_by": 5 } }
```

**Lỗi:** `400 MSG-PE-02` — từ chối nhưng thiếu lý do (BR-PE03).

---

### `[UC-86]` Xác nhận quyết toán

`POST /settlements/{id}/approve`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-86 · BR-ST/BR-SA |
| **Mô tả** | Manager duyệt bảng quyết toán (`settlements`) do Leader nộp (UC-107, đơn ở status `pending_approval`). Sau khi `approved`, đơn mới đủ điều kiện ghi thanh toán cuối. |

**Response `200`**

```json
{ "success": true, "code": "MSG-STA-01", "message": "Đã xác nhận quyết toán", "data": { "id": 9, "order_id": 10, "balance": 3360000, "status": "approved" } }
```

> ⚠️ **Sửa mã lỗi:** mục 8 `documents.md` gán **MSG-ST = "Chi tiết quyết toán"** (hành động Leader ghi nhận, UC-106 — xem [12-mobile-field-ops.md](./12-mobile-field-ops.md)), không phải hành động Manager duyệt ở đây. Dùng **MSG-STA** (tự đặt, Settlement Approval) cho endpoint này để tránh đụng mã.

---

### `[UC-87]` Ghi nhận thanh toán cuối

`POST /orders/{id}/final-payment`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-87 · BR-FP01–05 |
| **Mô tả** | Ghi khoản thanh toán cuối (`payments` loại `final`). Chỉ sau khi quyết toán `approved`; số tiền khớp dư nợ. Sau thanh toán cuối + đủ dữ liệu vận hành → đơn chuyển `completed`. |

**Request body**

```json
{ "amount": 3360000, "payment_method": "cash" }
```

**Response `201`**

```json
{
  "success": true,
  "code": "MSG-FNL-01",
  "message": "Ghi nhận thanh toán cuối thành công",
  "data": { "payment_id": 41, "order_status": "completed" }
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 409 | MSG-FNL-02 | Quyết toán chưa `approved` (BR-FP01) |
| 409 | MSG-FNL-03 | Số tiền không khớp dư nợ / dữ liệu vận hành chưa hoàn chỉnh |

> ⚠️ **Sửa mã lỗi:** `documents.md` dùng chung **BR-FP01–05** cho cả "Quên mật khẩu" (mục Xác thực) và "Thanh toán cuối" (mục Thanh toán) — trùng số hiệu ở ngay tài liệu nguồn. Tương tự **MSG-FP** vừa là "Quên mật khẩu" vừa là "Tiến độ hiện trường" (mục 8). Để tránh đụng mã với [01-auth.md](./01-auth.md) (đã dùng `MSG-FP-01` cho quên mật khẩu), endpoint này đổi sang **MSG-FNL** (tự đặt, Final Payment).

---

### `[D-07]` Xem danh sách thanh toán của đơn hàng

`GET /orders/{id}/payments`

| | |
|---|---|
| **Vai trò** | Manager |
| **Mô tả** | Danh sách tất cả các khoản thanh toán (deposit, final, refund) liên quan đến đơn hàng. |

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "id": 40, "payment_type": "deposit", "amount": 1440000, "status": "confirmed", "created_at": "2026-06-20T10:00:00Z" }
  ]
}
```

---

### `[B-10]` Xem chi tiết quyết toán của đơn hàng

`GET /orders/{id}/settlement`

| | |
|---|---|
| **Vai trò** | Manager |
| **Mô tả** | Xem toàn bộ thông tin quyết toán của đơn hàng (sau khi hoàn tất sự kiện), bao gồm các hạng mục phát sinh (`settlement_lines`). |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": 9,
    "order_id": 10,
    "total_quotation_amount": 4800000,
    "deposit_paid": 1440000,
    "balance": 3360000,
    "status": "pending_approval",
    "lines": [
      { "id": 1, "description": "Phụ phí làm đêm", "amount": 500000 }
    ]
  }
}
```
