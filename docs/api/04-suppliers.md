# 04. Nhà cung cấp & Công nợ — API

> **UC:** 28–31, 71–74 · **Vai trò:** Admin (master), Manager (giao dịch) · **Nền tảng:** Web
> Quy ước chung & template: [README.md](./README.md)
> Prefix MSG: thuê/nhận NCC **MSG-SR**, mua NCC **MSG-SPU**, thanh toán NCC **MSG-SPAY**, công nợ **MSG-SD** (mục 8). NCC (CRUD) chưa có prefix → đề xuất **MSG-SUP**.

> ⚠️ **Cần xác nhận (DB lệch):** `documents.md`/`ERD.md` có *Supplier Transaction* (loại **Thuê/Mua**) tách khỏi *Supplier Payable*. `database.md` **gộp** lại thành `supplier_payables` với `transaction_type` = `purchase | return | adjustment` — **không có loại "thuê" (rental)**. → UC-71 (thuê thiết bị) chưa có chỗ mô hình hóa đúng. Mẫu dưới bám `database.md` và đánh dấu ⚠️ tại UC-71.

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| UC-28 | Xem danh sách nhà cung cấp | `GET /suppliers` | Admin | ✅ |
| UC-29 | Tạo nhà cung cấp | `POST /suppliers` | Admin | ✅ |
| UC-30 | Cập nhật nhà cung cấp | `PUT /suppliers/{id}` | Admin | ✅ |
| UC-31 | Vô hiệu hóa nhà cung cấp | `PATCH /suppliers/{id}/status` | Admin | ✅ |
| UC-71 | Ghi nhận thuê thiết bị NCC | `POST /supplier-payables` ⚠️ | Manager | ✅ |
| UC-72 | Ghi nhận mua hàng NCC | `POST /supplier-payables` | Manager | ✅ |
| UC-73 | Giám sát công nợ NCC | `GET /supplier-payables` | Manager | ✅ |
| UC-74 | Ghi nhận thanh toán NCC | `POST /supplier-payments` | Manager | ✅ |

---

## Chi tiết endpoint

### `[UC-28]` Danh sách · `[UC-29]` Tạo · `[UC-30]` Cập nhật · `[UC-31]` Vô hiệu hóa nhà cung cấp

`GET /suppliers` · `POST /suppliers` · `PUT /suppliers/{id}` · `PATCH /suppliers/{id}/status`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-28 → UC-31 |
| **Mô tả** | CRUD hồ sơ nhà cung cấp (`suppliers`). |

**POST request body**

```json
{
  "name": "Công ty Âm thanh ABC",
  "contact_person": "Anh Hùng",
  "phone": "0934567890",
  "email": "abc@supplier.vn",
  "address": "12 Trường Chinh"
}
```

**Response `201`**

```json
{ "success": true, "code": "MSG-SUP-01", "message": "Tạo nhà cung cấp thành công", "data": { "id": 3, "name": "Công ty Âm thanh ABC", "status": "active" } }
```

---

### `[UC-72]` Ghi nhận mua hàng NCC `[UC-71]` Ghi nhận thuê thiết bị NCC

`POST /supplier-payables`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-72 · BR-SPU01–04 · UC-71 · BR-SR01–04 |
| **Mô tả** | Ghi nhận một chứng từ mua/nhập từ NCC (`supplier_payables` + `supplier_payable_items`). Có thể gắn với đơn hàng. Tạo công nợ phải trả (`status=unpaid`). |

**Request body**

```json
{
  "supplier_id": 3,
  "order_id": 10,
  "transaction_type": "purchase",
  "transaction_date": "2026-06-20",
  "due_date": "2026-07-20",
  "reference_code": "HD-ABC-001",
  "items": [
    { "catalog_item_id": 10, "quantity": 5, "unit_price": 400000 }
  ]
}
```
*(Lưu ý: `transaction_type` có thể nhận các giá trị: `"purchase" | "return" | "adjustment" | "rental"`. Trường `order_id` là tùy chọn, nhưng bắt buộc nếu đây là giao dịch nhập/thuê cho một đơn hàng cụ thể).*

**Response `201`**

```json
{
  "success": true,
  "code": "MSG-SPU-01",
  "message": "Ghi nhận mua hàng NCC thành công",
  "data": { "id": 8, "supplier_id": 3, "total_amount": 2000000, "paid_amount": 0, "status": "unpaid" }
}
```

**Lỗi:** `400 MSG-SPU-02` — số tiền ≤ 0 / không có item; `404` — NCC không tồn tại.

> ⚠️ **Lưu ý DB:** API yêu cầu DB phải bổ sung giá trị `rental` vào ENUM `transaction_type` và cột `order_id` (nullable FK) vào bảng `supplier_payables` để xử lý trọn vẹn UC-71 và hỗ trợ báo cáo theo đơn hàng.

---

### `[UC-73]` Giám sát công nợ NCC

`GET /supplier-payables`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC** | UC-73 |
| **Mô tả** | Danh sách công nợ NCC, lọc theo NCC/trạng thái thanh toán; hiển thị `total_amount`, `paid_amount`, còn lại. |

**Query params:** `?supplier_id=3&status=unpaid&page=1&limit=20`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "supplier": { "id": 3, "name": "Công ty Âm thanh ABC" },
      "total_amount": 2000000,
      "paid_amount": 500000,
      "remaining": 1500000,
      "due_date": "2026-07-20",
      "status": "partial"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 8, "total_pages": 1 }
}
```

---

### `[UC-74]` Ghi nhận thanh toán NCC

`POST /supplier-payments`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-74 · BR-SPAY01–04 |
| **Mô tả** | Ghi nhận một đợt chi trả cho NCC (`supplier_payments`). Có thể trả đích danh cho một chứng từ nợ. Số tiền > 0 và ≤ dư nợ; cập nhật `paid_amount`/`status` của công nợ. |

**Request body**

```json
{
  "supplier_id": 3,
  "supplier_payable_id": 8,
  "amount": 1500000,
  "payment_date": "2026-07-10T10:00:00Z",
  "payment_method": "bank_transfer",
  "reference_code": "UNC-0710"
}
```

**Response `201`**

```json
{
  "success": true,
  "code": "MSG-SPAY-01",
  "message": "Ghi nhận thanh toán NCC thành công",
  "data": { "id": 12, "supplier_payable_id": 8, "amount": 1500000, "payable_status": "paid" }
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-SPAY-02 | Số tiền ≤ 0 |
| 409 | MSG-SPAY-03 | Số tiền vượt quá dư nợ (BR-SPAY02) |
