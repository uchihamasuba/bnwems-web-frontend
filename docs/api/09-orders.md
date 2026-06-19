# 09. Đơn hàng (Vòng đời) — API

> **UC:** 39B, 53–60 · **Vai trò:** Manager · **Nền tảng:** Web
> Quy ước chung & template: [README.md](./README.md)
> Prefix MSG: tạo **MSG-CO**, cập nhật **MSG-UO**, xác nhận **MSG-COR**, đổi ngày **MSG-CED**, hủy **MSG-CAN** (mục 8).

> **Trạng thái đơn** (theo `database.md`): `new → surveyed → quoted → confirmed → in_progress → completed → cancelled`.

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| UC-39B | Dashboard vận hành | `GET /dashboard/operations` | Manager | ✅ |
| UC-53 | Xem danh sách đơn hàng | `GET /orders` | Manager | ✅ |
| UC-54 | Xem chi tiết đơn hàng | `GET /orders/{id}` | Manager | ✅ |
| UC-55 | Theo dõi trạng thái đơn | `GET /orders/{id}/status-history` | Manager | ✅ |
| UC-56 | Tạo đơn hàng | `POST /orders` | Manager | ✅ |
| UC-57 | Cập nhật đơn hàng | `PUT /orders/{id}` | Manager | ✅ |
| UC-58 | Xác nhận đơn hàng | `PATCH /orders/{id}/confirm` | Manager | ✅ |
| UC-59 | Đổi ngày sự kiện | `POST /orders/{id}/change-date` | Manager | ✅ |
| UC-60 | Hủy đơn hàng | `POST /orders/{id}/cancel` | Manager | ✅ |

> ⚠️ **Cần xác nhận (DB thiếu bảng):** `documents.md`/`ERD.md` có các entity riêng **Order Status History**, **Order Date Change**, **Order Cancellation**, nhưng `database.md` **không có bảng tương ứng**. Mẫu dưới giả định:
> - UC-55 đọc từ `audit_logs` (lọc `entity_type='orders'`).
> - UC-59/UC-60 cập nhật thẳng `orders` (+ tạo `payments` loại refund nếu hoàn cọc), **không lưu được lịch sử đổi ngày / lý do hủy / `refund_amount`**.
> Nếu cần lưu các thông tin này, phải bổ sung bảng vào DB.

---

## Chi tiết endpoint

### `[UC-53]` Xem danh sách đơn hàng

`GET /orders`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC** | UC-53 |
| **Mô tả** | Danh sách đơn hàng, lọc theo trạng thái/khách/khoảng ngày sự kiện, phân trang. |

**Query params:** `?page=1&limit=20&status=confirmed&customer_id=&from_date=&to_date=`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "code": "ORD-010",
      "customer": { "id": 1, "full_name": "Trần Thị B" },
      "event_type": "Tiệc cưới",
      "event_date": "2026-07-01",
      "venue_name": "Trung tâm tiệc cưới X",
      "status": "confirmed"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 53, "total_pages": 3 }
}
```

---

### `[UC-54]` Xem chi tiết đơn hàng

`GET /orders/{id}`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC** | UC-54 |
| **Mô tả** | Thông tin đầy đủ một đơn hàng. |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": 10,
    "code": "ORD-010",
    "customer_id": 1,
    "event_type": "Tiệc cưới",
    "event_date": "2026-07-01",
    "event_end_date": "2026-07-01",
    "venue_name": "Trung tâm tiệc cưới X",
    "venue_address": "789 Cách Mạng Tháng 8",
    "guest_count": 300,
    "notes": "Tông màu trắng - xanh",
    "status": "confirmed",
    "created_by": 5,
    "updated_by": 5,
    "created_at": "2026-06-10T08:00:00Z",
    "updated_at": "2026-06-15T09:00:00Z"
  }
}
```

**Lỗi:** `404` không tìm thấy đơn hàng.

---

### `[UC-55]` Theo dõi trạng thái đơn hàng

`GET /orders/{id}/status-history`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC** | UC-55 |
| **Mô tả** | Lịch sử chuyển trạng thái của đơn. Dữ liệu được đọc từ bảng `order_status_history`. |

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "from_status": "quoted", "to_status": "confirmed", "changed_by": 5, "changed_at": "2026-06-15T09:00:00Z" },
    { "from_status": "new", "to_status": "surveyed", "changed_by": 5, "changed_at": "2026-06-11T10:00:00Z" }
  ]
}
```

---

### `[UC-56]` Tạo đơn hàng

`POST /orders`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-56 · BR-CO01–05 |
| **Mô tả** | Tạo đơn hàng mới gắn với một khách hàng. `event_date` và địa điểm bắt buộc. Trạng thái khởi tạo `new`. |

**Request body**

```json
{
  "customer_id": 1,
  "event_type": "Tiệc cưới",
  "event_date": "2026-07-01",
  "event_end_date": "2026-07-01",
  "venue_name": "Trung tâm tiệc cưới X",
  "venue_address": "789 Cách Mạng Tháng 8",
  "guest_count": 300,
  "notes": "Tông màu trắng - xanh"
}
```

**Response `201`**

```json
{ "success": true, "code": "MSG-CO-01", "message": "Tạo đơn hàng thành công", "data": { "id": 10, "code": "ORD-010", "status": "new" } }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-CO-02 | Thiếu `event_date` hoặc địa điểm (BR-CO03) |
| 400 | MSG-CO-04 | `event_date` phải là ngày trong tương lai (lớn hơn ngày hiện tại) |
| 404 | MSG-CO-03 | `customer_id` không tồn tại |

**Ghi chú:** Ghi audit log (BR-CO05).

---

### `[UC-57]` Cập nhật đơn hàng

`PUT /orders/{id}`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-57 · BR-UO01–04 |
| **Mô tả** | Cập nhật thông tin đơn khi trạng thái còn cho phép. Đổi ngày sự kiện dùng riêng UC-59. |

**Response `200`**

```json
{ "success": true, "code": "MSG-UO-01", "message": "Cập nhật đơn hàng thành công", "data": { "id": 10 } }
```

**Lỗi:** `409 MSG-UO-02` — trạng thái không cho phép cập nhật.

---

### `[UC-58]` Xác nhận đơn hàng

`PATCH /orders/{id}/confirm`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-58 · BR-COR01–05 |
| **Mô tả** | Khóa đơn sau khi **báo giá đã `approved`** và **đặt cọc đã `confirmed`**. Hệ thống đặt chỗ tồn kho theo `event_date`; kho đã giữ bị khóa cho ngày đó. |

**Response `200`**

```json
{ "success": true, "code": "MSG-COR-01", "message": "Xác nhận đơn hàng thành công", "data": { "id": 10, "status": "confirmed" } }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 409 | MSG-COR-02 | Chưa có báo giá `approved` (BR-COR01) |
| 409 | MSG-COR-03 | Chưa có đặt cọc `confirmed` (BR-COR01) |
| 409 | MSG-COR-04 | Tồn kho không đủ để đặt chỗ |

**Ghi chú:** Tạo bản ghi `inventory_reservations` cho từng hàng hóa; ghi audit log (BR-COR05).

---

### `[UC-59]` Đổi ngày sự kiện

`POST /orders/{id}/change-date`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-59 · BR-CED01–04 |
| **Mô tả** | Đổi `event_date` theo Chính sách đổi ngày. Kiểm tra lại tồn kho cho ngày mới; chỉ giải phóng đặt chỗ cũ **sau khi** xác nhận ngày mới khả dụng. |

**Request body**

```json
{ "new_event_date": "2026-07-15", "reason": "Khách dời lịch" }
```

**Response `200`**

```json
{ 
  "success": true, 
  "code": "MSG-CED-01", 
  "message": "Đổi ngày sự kiện thành công", 
  "data": { 
    "id": 10, 
    "old_date": "2026-07-01", 
    "new_date": "2026-07-15", 
    "reason": "Khách dời lịch", 
    "changed_at": "2026-06-20T10:00:00Z" 
  } 
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 409 | MSG-CED-02 | Vi phạm chính sách đổi ngày |
| 409 | MSG-CED-03 | Tồn kho ngày mới không đủ |

> ⚠️ **Lưu ý DB:** Dữ liệu đổi ngày được lưu vào bảng `order_date_changes`.

---

### `[UC-60]` Hủy đơn hàng

`POST /orders/{id}/cancel`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-60 · BR-CAN01–05 |
| **Mô tả** | Hủy đơn khi trạng thái cho phép. Áp dụng chính sách hủy đơn (tính hoàn cọc), giải phóng tồn kho đã đặt chỗ. Lý do hủy bắt buộc. |

**Request body**

```json
{ "reason": "Khách hủy tiệc" }
```

**Response `200`**

```json
{ 
  "success": true, 
  "code": "MSG-CAN-01", 
  "message": "Hủy đơn hàng thành công", 
  "data": { 
    "id": 10, 
    "status": "cancelled",
    "refund_amount": 500000,
    "policy_applied": "CANCEL_REFUND_7D"
  } 
}
```

**Lỗi:** `409 MSG-CAN-02` — trạng thái không cho phép hủy.

> ⚠️ **Lưu ý DB:** Chi tiết hủy đơn được lưu vào bảng `order_cancellations`. Hoàn cọc có thể ghi qua `payments` loại `refund`.

---

### `[B-01]` Quản lý hạng mục đơn hàng (Order Items)

`GET /orders/{id}/items` · `POST /orders/{id}/items`

| | |
|---|---|
| **Vai trò** | Manager |
| **Mô tả** | Lấy danh sách hoặc thêm mới các hạng mục (Order Item) vào đơn hàng. |

**POST Request body**

```json
{
  "items": [
    { "catalog_item_id": 10, "quantity": 4, "unit_price": 500000 }
  ]
}
```

**Response `201`**

```json
{
  "success": true,
  "code": "MSG-CO-05",
  "message": "Thêm hạng mục đơn hàng thành công",
  "data": { "order_id": 10, "items_count": 1 }
}
```

---

### `[UC-39B]` Dashboard vận hành

`GET /dashboard/operations`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC** | UC-39B |
| **Mô tả** | Số liệu tổng hợp cho Manager: tổng sự kiện, đơn đang hoạt động, doanh thu tháng, yêu cầu chờ xử lý. |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "total_events": 12,
    "active_orders": 8,
    "monthly_revenue": 250000000,
    "pending_requests": 3
  }
}
```
