# 05. Kho & Tồn kho — API

> **UC:** 32–33, 66–70 · **Vai trò:** Admin (kho), Manager (tồn kho) · **Nền tảng:** Web
> Quy ước chung & template: [README.md](./README.md)
> Prefix MSG: kiểm tra tồn kho **MSG-IA**, kiểm tra lại **MSG-RI**, phiếu xuất kho **MSG-PL**, trạng thái hoàn trả **MSG-VR**, xác nhận hoàn trả **MSG-CIR** (mục 8). Kho (CRUD) chưa có prefix → đề xuất **MSG-WH**.

> **Đa kho:** `database.md` hỗ trợ nhiều kho (`warehouses` + `inventory.warehouse_id`), nhưng nghiệp vụ thực tế chỉ 1 kho chính (`ERD.md` nguyên tắc 14).

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| UC-32 | Xem thông tin kho | `GET /warehouses` | Admin | ✅ |
| UC-33 | Cập nhật thông tin kho | `PUT /warehouses/{id}` | Admin | ✅ |
| — | Xem tồn kho theo kho | `GET /warehouses/{id}/inventory` | Admin/Manager | ✅ |
| UC-66 | Kiểm tra sơ bộ tồn kho | `GET /inventory/availability` | Manager | ✅ |
| UC-67 | Kiểm tra lại tồn kho sau khảo sát | `GET /inventory/availability` | Manager | ✅ |
| UC-68 | Tạo phiếu xuất kho | `POST /orders/{id}/pick-lists` | Manager | ✅ |
| UC-69 | Xem trạng thái hoàn trả kho | `GET /orders/{id}/return-status` | Manager | ✅ |
| UC-70 | Xác nhận hoàn trả kho | `POST /orders/{id}/confirm-return` | Manager | ✅ |

---

## Chi tiết endpoint

### `[UC-32]` Xem thông tin kho · `[UC-33]` Cập nhật thông tin kho

`GET /warehouses` · `PUT /warehouses/{id}`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-32, UC-33 |
| **Mô tả** | Xem danh sách kho và cập nhật thông tin kho (`warehouses`). |

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Kho Tổng", "address": "KCN Tân Bình", "status": "active" }
  ]
}
```

---

### `[UC-66/67]` Kiểm tra tồn kho theo ngày

`GET /inventory/availability`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-66, UC-67 · BR-IA01–04, BR-RI01–03 |
| **Mô tả** | Kiểm tra số lượng còn trống (chưa đặt chỗ) cho một `event_date` và danh sách hàng hóa. **KHÔNG tạo đặt chỗ**. Hàng đã đặt chỗ cho ngày đó không được tính là khả dụng. UC-67 dùng lại endpoint này để kiểm tra lại sau khảo sát. |

**Query params:** `?event_date=2026-07-01&item_ids[]=10&item_ids[]=15&item_ids[]=20`

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "catalog_item_id": 10, "name": "Loa Bose L1", "quantity_total": 20, "reserved_on_date": 8, "quantity_available_today": 12 },
    { "catalog_item_id": 15, "name": "Cổng hoa", "quantity_total": 5, "reserved_on_date": 5, "quantity_available_today": 0 }
  ]
}
```
*(Ghi chú: `quantity_available_today = quantity_total - reserved_on_date`, đây là kết quả kiểm tra theo ngày cụ thể, khác với `inventory.quantity_available` là trạng thái real-time trong DB).*

---

### `[UC-68]` Tạo phiếu xuất kho

`POST /orders/{id}/pick-lists`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-68 · BR-PL01–04 |
| **Mô tả** | Tạo phiếu xuất kho (`pick_lists` + `pick_list_items`) cho một nhiệm vụ vận hành. Có thể gắn cho một `assignment` (nhân sự chịu trách nhiệm). Nhân viên chỉ xem phiếu của nhiệm vụ được phân công. |

**Request body**

```json
{
  "assignment_id": 25,
  "warehouse_id": 1,
  "items": [
    { "catalog_item_id": 10, "quantity_required": 4 },
    { "catalog_item_id": 15, "quantity_required": 2 }
  ]
}
```
*(Ghi chú: `warehouse_id` nếu không truyền sẽ lấy mặc định là kho chính).*

**Response `201`**

```json
{
  "success": true,
  "code": "MSG-PL-01",
  "message": "Tạo phiếu xuất kho thành công",
  "data": { "id": 33, "order_id": 10, "assignment_id": 25, "warehouse_id": 1, "status": "pending" }
}
```

**Lỗi:** `400 MSG-PL-02` — phiếu không có hàng hóa; `404` — đơn/assignment không tồn tại.

---

### `[UC-69]` Xem trạng thái hoàn trả kho

`GET /orders/{id}/return-status`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC** | UC-69 |
| **Mô tả** | Tổng hợp tình trạng thiết bị đã xuất / đã thu hồi / đã hoàn trả của đơn, để Manager xác nhận hoàn trả. |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "order_id": 10,
    "items": [
      { "catalog_item_id": 10, "pick_list_id": 33, "checked_out": 4, "returned": 4, "damaged": 0, "missing": 0 },
      { "catalog_item_id": 15, "pick_list_id": 33, "checked_out": 2, "returned": 1, "damaged": 1, "missing": 0 }
    ]
  }
}
```

---

### `[UC-70]` Xác nhận hoàn trả kho

`POST /orders/{id}/confirm-return`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-70 · BR-CIR01–05 |
| **Mô tả** | Manager xác nhận hoàn trả: cập nhật tồn kho (`inventory` + `inventory_transactions` type `in`). Số lượng hoàn trả ≤ số đã xuất; hư hỏng/mất mát cần biên bản đã xác nhận. Bắt buộc hoàn tất trước khi đóng đơn. |

**Response `200`**

```json
{ "success": true, "code": "MSG-CIR-01", "message": "Đã xác nhận hoàn trả kho", "data": { "order_id": 10, "status": "returned" } }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 409 | MSG-CIR-02 | Số hoàn trả > số đã xuất kho (BR-CIR02) |
| 409 | MSG-CIR-03 | Hư hỏng/mất mát chưa có biên bản xác nhận (BR-CIR03) |
