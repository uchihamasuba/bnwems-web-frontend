# 08. Báo giá — API

> **UC:** 50–52 · **Vai trò:** Manager · **Nền tảng:** Web
> Quy ước chung & template: [README.md](./README.md)
> Prefix MSG: tạo **MSG-QT**, cập nhật **MSG-UQ**, xác nhận **MSG-CQ** (mục 8).

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| — | Xem báo giá của đơn | `GET /orders/{orderId}/quotations` | Manager | ✅ |
| — | Xem chi tiết báo giá | `GET /quotations/{id}` | Manager | ✅ |
| UC-50 | Tạo báo giá | `POST /orders/{orderId}/quotations` | Manager | ✅ |
| UC-51 | Cập nhật báo giá (tạo version mới) | `PUT /quotations/{id}` | Manager | ✅ |
| UC-52 | Xác nhận báo giá | `POST /quotations/{id}/approve` | Manager | ✅ |

> **Versioning:** Theo `database.md`, `quotations` có `version` + `UNIQUE(order_id, version)` + status `superseded`. Mỗi lần sửa quan trọng → **tạo version mới**, version cũ chuyển `superseded` (giữ lịch sử). Một đơn chỉ có tối đa một báo giá `approved` tại một thời điểm.

---

## Chi tiết endpoint

### `[—]` Xem chi tiết báo giá

`GET /quotations/{id}`

| | |
|---|---|
| **Vai trò** | Manager |
| **Mô tả** | Xem chi tiết một báo giá bao gồm các hạng mục (`quotation_lines`) và người tạo báo giá. |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": 30,
    "order_id": 10,
    "version": 1,
    "total_amount": 5000000,
    "discount_amount": 200000,
    "final_amount": 4800000,
    "notes": "Báo giá lần 1",
    "status": "draft",
    "created_by": { "id": 5, "full_name": "Nguyễn Văn A" },
    "created_at": "2026-06-18T09:30:00Z",
    "lines": [
      { "catalog_item_id": 10, "item_name": "Loa Bose L1", "quantity": 4, "unit_price": 500000 },
      { "catalog_item_id": 15, "item_name": "Cổng hoa", "quantity": 1, "unit_price": 3000000 }
    ]
  }
}
```

---

### `[UC-50]` Tạo báo giá

`POST /orders/{orderId}/quotations`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-50 · BR-QT01–05 |
| **Mô tả** | Tạo báo giá (version đầu) cho một đơn hàng. Chỉ dùng hàng hóa đang `active`; đơn giá lấy từ bảng giá hiện hành. Hệ thống tính `total_amount`, `final_amount`. |

**Request body**

```json
{
  "discount_amount": 200000,
  "notes": "Báo giá lần 1",
  "lines": [
    { "catalog_item_id": 10, "quantity": 4, "unit_price": 500000 },
    { "catalog_item_id": 15, "quantity": 1, "unit_price": 3000000 }
  ]
}
```

**Response `201`**

```json
{
  "success": true,
  "code": "MSG-QT-01",
  "message": "Tạo báo giá thành công",
  "data": {
    "id": 30,
    "order_id": 10,
    "version": 1,
    "total_amount": 5000000,
    "discount_amount": 200000,
    "final_amount": 4800000,
    "status": "draft"
  }
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-QT-02 | Báo giá không có dòng nào |
| 404 | MSG-QT-03 | `order_id` hoặc `catalog_item_id` không tồn tại |
| 409 | MSG-QT-04 | Có hàng hóa `inactive` trong báo giá (BR-QT03) |

**Ghi chú:** `item_name` của từng dòng được lưu cứng (`quotation_lines.item_name`) tại thời điểm báo (BR-QT04). Ghi audit log (BR-QT05).

---

### `[UC-51]` Cập nhật báo giá (tạo version mới)

`PUT /quotations/{id}`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-51 · BR-UQ01–04 |
| **Mô tả** | Sửa báo giá khi đơn **chưa bị khóa bởi xác nhận đơn hàng**. Thay đổi quan trọng sẽ sinh version mới; bản cũ chuyển `superseded`. Tổng tiền tính lại. |

**Request body**

```json
{
  "discount_amount": 0,
  "notes": "Khách bỏ bớt 1 hạng mục",
  "lines": [ { "catalog_item_id": 10, "quantity": 4, "unit_price": 500000 } ]
}
```

**Response `200`**

```json
{
  "success": true,
  "code": "MSG-UQ-01",
  "message": "Cập nhật báo giá thành công (tạo version 2)",
  "data": { "id": 31, "order_id": 10, "version": 2, "final_amount": 2000000, "status": "draft" }
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-UQ-04 | `discount_amount` lớn hơn `total_amount` |
| 409 | MSG-UQ-02 | Đơn đã xác nhận, báo giá bị khóa (BR-UQ01) |
| 409 | MSG-UQ-03 | Có hàng hóa `inactive` (BR-UQ03) |

---

### `[UC-52]` Xác nhận báo giá

`POST /quotations/{id}/approve`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-52 · BR-CQ01–04 |
| **Mô tả** | Chốt báo giá (khách đã đồng ý ngoài hệ thống). Báo giá phải hoàn chỉnh. Đây là điều kiện bắt buộc trước khi tạo yêu cầu đặt cọc (UC-83). |

**Response `200`**

```json
{
  "success": true,
  "code": "MSG-CQ-01",
  "message": "Xác nhận báo giá thành công",
  "data": { "id": 31, "status": "approved", "approved_at": "2026-06-19T10:00:00Z" }
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 409 | MSG-CQ-02 | Báo giá không hoàn chỉnh / đã `superseded` |
| 409 | MSG-CQ-03 | Đơn đã xác nhận, không sửa/duyệt lại được (BR-CQ04) |
