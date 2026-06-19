# 12. Vận hành hiện trường (App Mobile) — API

> **UC:** 88–107 · **Vai trò:** Leader Staff, Technical Staff · **Nền tảng:** Mobile
> Quy ước chung & template: [README.md](./README.md)

> ⚠️ **Lưu ý prefix MSG bị trùng trong `documents.md` (mục 8):** `MSG-FP` được gán cho cả "Quên mật khẩu" (đã dùng ở [01-auth.md](./01-auth.md)) và "Tiến độ hiện trường" — UC-95 dưới đây đổi sang **MSG-FLDP** (tự đặt) để tránh đụng mã. Tương tự, mục 8 không có prefix riêng cho UC-94 "Trả thiết bị NCC" (chỉ có `MSG-SR` = "Thuê/Nhận") → đề xuất **MSG-SRT**.
>
> ⚠️ **Cần xác nhận (DB thiếu cột so với `handover_items`):** `supplier_payable_items` không có `quantity_actual`/`condition_notes` như `handover_items` đang có. UC-93 (Leader xác nhận nhận hàng NCC) cần các cột này để ghi số lượng/tình trạng thực tế — đề xuất bổ sung vào DB nếu muốn tách biệt với số liệu thương mại do Manager nhập (UC-71/72).
>
> ⚠️ **UC-99–102 (thu hồi → hoàn trả nội bộ → phân loại → nộp báo cáo)** không có entity riêng trong `database.md`. Mẫu dưới mô hình hóa cả 4 bước này quanh **một bản ghi `handovers` (`handover_type=post_event`)**, tái dùng đúng bảng đã có — nối tiếp với UC-69/70 (Manager xác nhận hoàn trả) ở [05-warehouse-inventory.md](./05-warehouse-inventory.md).
>
> **Upload bằng chứng (dùng chung cho mọi UC có ảnh/file):** xem [UC chung] *Tải file bằng chứng* ở cuối file — gọi 1 lần, lấy `evidence_file_id`, rồi đính `evidence_file_ids: []` vào body của endpoint nghiệp vụ liên quan.

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| UC-88 | Xem danh sách nhiệm vụ được phân công | `GET /my/assignments` | Leader + Tech | ✅ |
| UC-89 | Xem chi tiết nhiệm vụ | `GET /assignments/{id}` | Leader + Tech | ✅ |
| UC-90 | Xem phiếu xuất kho | `GET /pick-lists?assignment_id=` | Leader + Tech | ✅ |
| UC-91 | Thực hiện và nộp báo cáo khảo sát | `PUT /surveys/{id}` + `POST /surveys/{id}/submit` | Leader | ✅ |
| UC-92 | Xác nhận xuất kho | `POST /pick-lists/{id}/checkout` | Leader | ✅ |
| UC-93 | Ghi nhận nhận thiết bị NCC | `PATCH /supplier-payables/{id}/receipt` ⚠️ | Leader | ✅ |
| UC-94 | Ghi nhận trả thiết bị NCC | `POST /supplier-payables` (`type=return`) | Leader | ✅ |
| UC-95 | Cập nhật tiến độ hiện trường | `PATCH /tasks/{id}/progress` | Leader | ✅ |
| UC-96 | Ghi nhận bằng chứng bàn giao | `POST /orders/{id}/handovers` (`pre_event`) | Leader | ✅ |
| UC-97 | Nộp yêu cầu thay đổi | `POST /orders/{id}/change-requests` | Leader | ✅ |
| UC-98 | Ghi nhận biên bản hư hỏng/mất mát | `POST /orders/{id}/damage-loss-reports` | Leader | ✅ |
| UC-99 | Ghi nhận thiết bị đã thu hồi | `POST /orders/{id}/handovers` (`post_event`) | Leader | ✅ |
| UC-100 | Ghi nhận hoàn trả thiết bị nội bộ | `POST /handovers/{id}/warehouse-receipt` | Leader | ✅ |
| UC-101 | Phân loại thiết bị hoàn trả | `PATCH /handovers/{id}/items/{itemId}` | Leader | ✅ |
| UC-102 | Nộp báo cáo hoàn trả kho | `POST /handovers/{id}/submit` | Leader | ✅ |
| UC-103 | Ghi nhận điểm danh | `POST /attendance` + `PATCH /attendance/{id}/check-out` | Leader + Tech | ✅ |
| UC-104 | Xác nhận điểm danh Technical Staff | `POST /attendance/{id}/verify` | Leader | ✅ |
| UC-105 | Tải lên chứng từ thanh toán khách hàng | `POST /payments/{id}/evidence` | Leader | ✅ |
| UC-106 | Ghi nhận chi tiết quyết toán | `PUT /orders/{id}/settlement` | Leader | ✅ |
| UC-107 | Nộp quyết toán để Manager duyệt | `POST /settlements/{id}/submit` | Leader | ✅ |
| _(chung)_ | Tải file bằng chứng | `POST /evidence-files` | Tất cả (đã đăng nhập) | ✅ |

---

## Chi tiết endpoint

### `[UC-88]` Xem danh sách nhiệm vụ được phân công

`GET /my/assignments`

| | |
|---|---|
| **Vai trò** | Leader + Tech |
| **UC** | UC-88 |
| **Mô tả** | Danh sách ca/nhiệm vụ (`assignments`) của người đang đăng nhập, mới nhất theo `assigned_date`. |

**Query params:** `?page=1&limit=20&assigned_date=2026-07-01&status=assigned`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": 25,
      "order": { "id": 10, "code": "ORD-010", "event_date": "2026-07-01", "venue_name": "Trung tâm tiệc cưới X" },
      "assigned_date": "2026-07-01",
      "session_type": "morning",
      "role_in_event": "Thợ chính",
      "status": "assigned"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 6, "total_pages": 1 }
}
```

---

### `[UC-89]` Xem chi tiết nhiệm vụ

`GET /assignments/{id}`

| | |
|---|---|
| **Vai trò** | Leader + Tech (chỉ assignment của chính mình) |
| **UC** | UC-89 |
| **Mô tả** | Chi tiết một assignment kèm danh sách `tasks` (checklist con). |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": 25,
    "order_id": 10,
    "assigned_date": "2026-07-01",
    "session_type": "morning",
    "status": "assigned",
    "tasks": [
      { "id": 80, "title": "Vận chuyển thiết bị", "status": "todo", "priority": "high" },
      { "id": 81, "title": "Lắp đặt sân khấu", "status": "todo", "priority": "medium" }
    ]
  }
}
```

**Lỗi:** `403` — assignment không thuộc về người dùng hiện tại.

---

### `[UC-90]` Xem phiếu xuất kho

`GET /pick-lists?assignment_id={id}`

| | |
|---|---|
| **Vai trò** | Leader + Tech |
| **UC · BR** | UC-90 · BR-PL03 |
| **Mô tả** | Phiếu xuất kho gắn với assignment của mình. Không xem được phiếu của assignment khác (BR-PL03). |

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": 33,
      "order_id": 10,
      "status": "pending",
      "items": [
        { "catalog_item_id": 10, "name": "Loa Bose L1", "quantity_required": 4, "quantity_picked": 0 }
      ]
    }
  ]
}
```

---

### `[UC-91]` Thực hiện và nộp báo cáo khảo sát

`PUT /surveys/{id}` rồi `POST /surveys/{id}/submit`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC · BR** | UC-91 · BR-SV01–05 |
| **Mô tả** | Leader nhập kết quả khảo sát thực địa + ảnh, rồi nộp. Chỉ Leader được phân công mới nộp được. |

**PUT request body**

```json
{
  "venue_notes": "Sảnh dài 20m, trần cao 6m",
  "requirement_notes": "Tông trắng, cần 2 cổng hoa",
  "items": [ { "item_name": "Cổng hoa", "quantity_required": 2 } ],
  "evidence_file_ids": [40, 41]
}
```

**POST submit — Response `200`**

```json
{ "success": true, "code": "MSG-SV-02", "message": "Đã nộp báo cáo khảo sát", "data": { "id": 7, "status": "submitted" } }
```

**Lỗi:** `403 MSG-SV-03` — không phải Leader được phân công (BR-SV01); `400 MSG-SV-04` — thiếu ảnh bằng chứng nếu được yêu cầu (BR-SV03).

---

### `[UC-92]` Xác nhận xuất kho

`POST /pick-lists/{id}/checkout`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC · BR** | UC-92 · BR-WC01–05 |
| **Mô tả** | Ghi số lượng thực tế lấy ra so với phiếu. Chênh lệch phải có lý do. Tạo `inventory_transactions` (`type=out`) và cập nhật `inventory.quantity_available`. |

**Request body**

```json
{
  "items": [
    { "catalog_item_id": 10, "quantity_picked": 4 },
    { "catalog_item_id": 15, "quantity_picked": 1, "notes": "Kho chỉ còn 1, thiếu 1" }
  ]
}
```

**Response `200`**

```json
{ "success": true, "code": "MSG-WC-01", "message": "Đã xác nhận xuất kho", "data": { "id": 33, "status": "picked" } }
```

**Lỗi:** `400 MSG-WC-02` — chênh lệch số lượng nhưng thiếu `notes` lý do (BR-WC03).

---

### `[UC-93]` Ghi nhận nhận thiết bị NCC

`PATCH /supplier-payables/{id}/receipt`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC · BR** | UC-93 · BR-SR01–04 |
| **Mô tả** | Leader xác nhận số lượng/tình trạng thực tế nhận từ NCC, đối chiếu với chứng từ mua (`supplier_payables` do Manager tạo ở UC-72). |

**Request body**

```json
{
  "items": [
    { "supplier_payable_item_id": 16, "quantity_actual": 5, "condition_notes": "Đủ, còn mới" }
  ],
  "evidence_file_ids": [42]
}
```

**Response `200`**

```json
{ "success": true, "code": "MSG-SR-01", "message": "Đã ghi nhận nhận thiết bị NCC", "data": { "id": 8 } }
```

> ⚠️ Cần bổ sung cột `quantity_actual`, `condition_notes` vào `supplier_payable_items` (xem cảnh báo đầu file).

---

### `[UC-94]` Ghi nhận trả thiết bị NCC

`POST /supplier-payables`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC** | UC-94 |
| **Mô tả** | Tạo một chứng từ **trả hàng** cho NCC (`transaction_type=return` — giá trị có sẵn trong DB). Số lượng chênh lệch so với hàng đã nhận phải ghi lý do. |

**Request body**

```json
{
  "supplier_id": 3,
  "transaction_type": "return",
  "transaction_date": "2026-07-02",
  "items": [ { "catalog_item_id": 10, "quantity": 1, "unit_price": 400000, "notes": "Trả 1 cái bị lỗi" } ]
}
```

**Response `201`**

```json
{ "success": true, "code": "MSG-SRT-01", "message": "Đã ghi nhận trả thiết bị NCC", "data": { "id": 9, "transaction_type": "return" } }
```

---

### `[UC-95]` Cập nhật tiến độ hiện trường

`PATCH /tasks/{id}/progress`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC · BR** | UC-95 · BR-FP01–05 (mục Vận hành hiện trường) |
| **Mô tả** | Cập nhật trạng thái + ghi chú + bằng chứng cho một `task` (vận chuyển → lắp đặt → dựng…). Chỉ Leader được phân công; bằng chứng bắt buộc cho mốc quan trọng. |

**Request body**

```json
{ "status": "in_progress", "notes": "Đang lắp sân khấu", "evidence_file_ids": [43] }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-FLDP-01", "message": "Đã cập nhật tiến độ", "data": { "id": 81, "status": "in_progress" } }
```

---

### `[UC-96]` Ghi nhận bằng chứng bàn giao

`POST /orders/{id}/handovers`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC · BR** | UC-96 · BR-HO01–05 |
| **Mô tả** | Bàn giao thiết bị cho khách sau lắp đặt (`handover_type=pre_event`). Bằng chứng bắt buộc trước khi nộp. Manager xác nhận ở UC-81. |

**Request body**

```json
{
  "handover_type": "pre_event",
  "to_user_id": null,
  "handover_date": "2026-07-01T07:00:00Z",
  "notes": "Khách đã kiểm tra và đồng ý",
  "items": [ { "catalog_item_id": 10, "quantity_expected": 4, "quantity_actual": 4, "item_status": "ok" } ],
  "evidence_file_ids": [44]
}
```

**Response `201`**

```json
{ "success": true, "code": "MSG-HO-01", "message": "Đã ghi nhận bàn giao", "data": { "id": 18, "status": "pending" } }
```

**Lỗi:** `400 MSG-HO-02` — thiếu bằng chứng bắt buộc (BR-HO02).

---

### `[UC-97]` Nộp yêu cầu thay đổi

`POST /orders/{id}/change-requests`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC · BR** | UC-97 · BR-CR01–05 |
| **Mô tả** | Yêu cầu thêm/bớt/thay thế tại hiện trường. Leader nộp, không tự duyệt; Manager duyệt ở UC-80 ([10-survey-assignment.md](./10-survey-assignment.md)). |

**Request body**

```json
{
  "change_type": "add",
  "description": "Khách yêu cầu thêm 2 bàn tròn và 1 dàn đèn pha",
  "evidence_file_ids": [45]
}
```

**Response `201`**

```json
{ "success": true, "code": "MSG-CR-02", "message": "Đã nộp yêu cầu thay đổi", "data": { "id": 14, "status": "pending" } }
```

---

### `[UC-98]` Ghi nhận biên bản hư hỏng/mất mát

`POST /orders/{id}/damage-loss-reports`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC · BR** | UC-98 · BR-DL01–04 |
| **Mô tả** | Ghi nhận thiết bị hỏng/mất kèm bằng chứng. Số lượng ≤ số đã phân công/xuất kho. Manager xác nhận ở UC-82. |

**Request body**

```json
{
  "report_date": "2026-07-01",
  "description": "Vỡ 1 ly thủy tinh trang trí khi vận chuyển",
  "items": [
    { "catalog_item_id": 20, "quantity": 1, "damage_type": "damaged", "estimated_cost": 50000, "responsible_user_id": 12 }
  ],
  "evidence_file_ids": [46]
}
```

**Response `201`**

```json
{ "success": true, "code": "MSG-DL-01", "message": "Đã ghi nhận biên bản hư hỏng/mất mát", "data": { "id": 5, "status": "draft" } }
```

**Lỗi:** `400 MSG-DL-02` — số lượng vượt số đã phân công/xuất kho (BR-DL03); `400 MSG-DL-03` — thiếu bằng chứng (BR-DL02).

---

### `[UC-99]` Ghi nhận thiết bị đã thu hồi

`POST /orders/{id}/handovers`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC** | UC-99 |
| **Mô tả** | Ghi nhận thiết bị đã thu gom tại địa điểm sau sự kiện (`handover_type=post_event`, bước đầu — chưa nhập kho). Tạo bản ghi ở trạng thái `pending`. |

**Request body**

```json
{
  "handover_type": "post_event",
  "handover_date": "2026-07-02T08:00:00Z",
  "items": [ { "catalog_item_id": 10, "quantity_expected": 4, "quantity_actual": 4 } ]
}
```

**Response `201`**

```json
{ "success": true, "code": "MSG-CE-01", "message": "Đã ghi nhận thiết bị thu hồi", "data": { "id": 19, "handover_type": "post_event", "status": "pending" } }
```

---

### `[UC-100]` Ghi nhận hoàn trả thiết bị nội bộ

`POST /handovers/{id}/warehouse-receipt`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC** | UC-100 |
| **Mô tả** | Xác nhận thiết bị đã về đến kho — tạo `inventory_transactions` (`type=in`) cho từng item của handover (UC-99), `reference_type='handovers'`. |

**Response `200`**

```json
{ "success": true, "code": "MSG-IER-01", "message": "Đã ghi nhận hoàn trả kho nội bộ", "data": { "id": 19, "items_received": 1 } }
```

---

### `[UC-101]` Phân loại thiết bị hoàn trả

`PATCH /handovers/{id}/items/{itemId}`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC** | UC-101 |
| **Mô tả** | Gán tình trạng cho từng thiết bị trả về. `item_status` của `handover_items` chỉ có `ok/damaged/missing` — `Cần bảo trì`/`Cần vệ sinh` (theo `documents.md`) tạm map vào `condition_notes` dạng text. |

**Request body**

```json
{ "item_status": "damaged", "condition_notes": "Nứt chân loa, cần bảo trì" }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-CL-01", "message": "Đã phân loại thiết bị", "data": { "handover_id": 19, "catalog_item_id": 10, "item_status": "damaged" } }
```

> ⚠️ Nếu cần đúng 5 trạng thái (`Bình thường|Mất mát|Hư hỏng|Cần bảo trì|Cần vệ sinh`) như `documents.md`, phải mở rộng enum `item_status` trong DB.

---

### `[UC-102]` Nộp báo cáo hoàn trả kho

`POST /handovers/{id}/submit`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC** | UC-102 |
| **Mô tả** | Leader chốt và nộp toàn bộ kết quả hoàn trả (`status: pending → submitted`). Manager xác nhận tiếp ở **UC-70** (`POST /orders/{id}/confirm-return`, xem [05-warehouse-inventory.md](./05-warehouse-inventory.md)). |

**Response `200`**

```json
{ "success": true, "code": "MSG-IR-01", "message": "Đã nộp báo cáo hoàn trả kho", "data": { "id": 19, "status": "submitted" } }
```

---

### `[UC-103]` Ghi nhận điểm danh

`POST /attendance` (check-in) · `PATCH /attendance/{id}/check-out` (check-out)

| | |
|---|---|
| **Vai trò** | Leader + Tech |
| **UC · BR** | UC-103 · BR-RA01–04 |
| **Mô tả** | Ghi nhận giờ vào/ra cho một ca trong assignment được phân công. Không trùng lặp cho cùng `(assignment_id, work_date, session_type)`. |

**POST request body**

```json
{ "assignment_id": 25, "work_date": "2026-07-01", "session_type": "morning" }
```

**Response `201`**

```json
{ "success": true, "code": "MSG-RA-01", "message": "Đã ghi nhận điểm danh (check-in)", "data": { "id": 60, "check_in_time": "2026-07-01T06:00:00Z", "status": "present" } }
```

**Lỗi:** `409 MSG-RA-02` — đã có điểm danh cho ca này (BR-RA02).

---

### `[UC-104]` Xác nhận điểm danh Technical Staff

`POST /attendance/{id}/verify`

| | |
|---|---|
| **Vai trò** | Leader (xác nhận Tech trong task mình phụ trách) |
| **UC · BR** | UC-104 · BR-TA01–04 |
| **Mô tả** | Cùng endpoint với Manager xác nhận Leader ở [10-survey-assignment.md](./10-survey-assignment.md) UC-77 — backend phân biệt theo vai trò người gọi (Leader chỉ xác nhận Tech trong nhóm mình; không tự xác nhận chính mình). |

**Request body**

```json
{ "decision": "present", "notes": "" }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-TA-01", "message": "Đã xác nhận điểm danh", "data": { "id": 61, "status": "verified" } }
```

**Lỗi:** `403 MSG-TA-02` — Leader tự xác nhận chính mình, hoặc Tech không thuộc task mình quản lý (BR-TA02).

---

### `[UC-105]` Tải lên chứng từ thanh toán khách hàng

`POST /payments/{id}/evidence`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC** | UC-105 |
| **Mô tả** | Đính ảnh chuyển khoản/biên lai vào một khoản `payments` (tại hiện trường). Manager xác nhận ở UC-85 ([11-payments-settlement.md](./11-payments-settlement.md)). |

**Request body**

```json
{ "evidence_file_ids": [47] }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-PE-03", "message": "Đã tải lên chứng từ thanh toán", "data": { "payment_id": 40, "status": "pending" } }
```

---

### `[UC-106]` Ghi nhận chi tiết quyết toán

`PUT /orders/{id}/settlement`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC · BR** | UC-106 · BR-SA01–04 |
| **Mô tả** | Tạo/cập nhật `settlements` + `settlement_lines` (phụ phí, bồi thường…) cho đơn. Bắt buộc đầy đủ + có bằng chứng thanh toán đính kèm trước khi nộp (UC-107). |

**Request body**

```json
{
  "total_service_amount": 4800000,
  "lines": [ { "line_type": "extra_fee", "description": "Phụ phí tăng ca", "amount": 200000 } ]
}
```

**Response `200`**

```json
{ "success": true, "code": "MSG-ST-01", "message": "Đã ghi nhận chi tiết quyết toán", "data": { "id": 9, "order_id": 10, "balance": 3360000, "status": "draft" } }
```

---

### `[UC-107]` Nộp quyết toán để Manager duyệt

`POST /settlements/{id}/submit`

| | |
|---|---|
| **Vai trò** | Leader |
| **UC** | UC-107 |
| **Mô tả** | Chuyển `settlements.status: draft → pending_approval`. Manager duyệt tiếp ở **UC-86** (`POST /settlements/{id}/approve`, xem [11-payments-settlement.md](./11-payments-settlement.md)). |

**Response `200`**

```json
{ "success": true, "code": "MSG-SA-01", "message": "Đã nộp quyết toán", "data": { "id": 9, "status": "pending_approval" } }
```

**Lỗi:** `400 MSG-SA-02` — chưa có bằng chứng thanh toán đính kèm (BR-SA02).

---

### `[UC chung]` Tải file bằng chứng

`POST /evidence-files`

| | |
|---|---|
| **Vai trò** | Tất cả (đã đăng nhập) |
| **Mô tả** | Endpoint dùng chung cho **mọi** nghiệp vụ cần ảnh/file (khảo sát, bàn giao, hư hỏng/mất mát, yêu cầu thay đổi, chứng từ thanh toán, quyết toán). Upload trước, lấy `id`, rồi gửi `evidence_file_ids: [...]` trong body của endpoint nghiệp vụ — backend tạo bản ghi `evidence_attachments` polymorphic (`entity_type`, `entity_id`). |

**Request:** `multipart/form-data` — field `file`

**Response `201`**

```json
{
  "success": true,
  "data": { "id": 47, "file_name": "bienlai.jpg", "file_url": "https://cdn/.../47.jpg", "file_type": "image/jpeg", "file_size": 204800 }
}
```

**Lỗi:** `400` — sai loại file / vượt giới hạn dung lượng (giới hạn cụ thể: câu hỏi mở #5, cần chốt).
