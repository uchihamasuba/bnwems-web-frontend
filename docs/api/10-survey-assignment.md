# 10. Khảo sát, Phân công & Giám sát vận hành — API

> **UC:** 62–65, 75–82 · **Vai trò:** Manager · **Nền tảng:** Web
> Quy ước chung & template: [README.md](./README.md)
> Prefix MSG: khảo sát **MSG-SV**, phân công **MSG-AS**, lịch vận chuyển **MSG-TS**, xác nhận công việc **MSG-CW**, dữ liệu lương **MSG-WD**, giám sát hiện trường **MSG-MF**, yêu cầu thay đổi **MSG-CR**, bàn giao **MSG-HR**, hư hỏng/mất mát **MSG-DL** (mục 8).

> ⚠️ **Cần xác nhận (DB lệch nhiều) — đây là module rủi ro nhất:**
> - **Mô hình Assignment/Task đảo nghĩa:** `database.md` định nghĩa `assignments` (order_id, user_id, assigned_date, session_type, role_in_event) và `tasks` (checklist con của assignment). `documents.md`/`ERD.md` lại dùng *Work Task* (gắn order) ← *Assignment* (user↔task). **Mẫu dưới bám `database.md`.**
> - **Không có bảng** `order_schedules` (UC-76 lập lịch vận chuyển) và `task_progress_updates` (UC-79 giám sát tiến độ). Các endpoint liên quan được đánh dấu ⚠️.
> - Khảo sát **không có** "work task" riêng trong DB — `survey_reports` gắn thẳng `order_id` + `surveyed_by`.

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| UC-62 | Lên lịch khảo sát | `POST /orders/{id}/surveys` | Manager | ✅ |
| UC-63 | Phân công khảo sát | `POST /surveys/{id}/assign` | Manager | ✅ |
| UC-64 | Giám sát tiến độ khảo sát | `GET /orders/{id}/surveys` | Manager | ✅ |
| UC-65 | Xem báo cáo khảo sát | `GET /surveys/{id}` | Manager | ✅ |
| UC-75 | Phân công nhân sự | `POST /orders/{id}/assignments` | Manager | ✅ |
| UC-76 | Lập lịch vận chuyển | `POST /orders/{id}/schedules` ⚠️ | Manager | ✅ |
| UC-77 | Xác nhận công việc nhân sự | `POST /attendance/{id}/verify` | Manager | ✅ |
| UC-78 | Xác nhận dữ liệu lương | `POST /wage-summaries/{id}/approve` | Manager | ✅ |
| UC-79 | Giám sát tiến độ hiện trường | `GET /orders/{id}/progress` ⚠️ | Manager | ✅ |
| UC-80 | Duyệt yêu cầu thay đổi | `POST /change-requests/{id}/review` | Manager | ✅ |
| UC-81 | Xác nhận biên bản bàn giao | `POST /handovers/{id}/confirm` | Manager | ✅ |
| UC-82 | Xác nhận biên bản hư hỏng/mất mát | `POST /damage-loss-reports/{id}/confirm` | Manager | ✅ |

---

## Chi tiết endpoint

### `[UC-62]` Lên lịch khảo sát · `[UC-63]` Phân công khảo sát

`POST /orders/{id}/surveys` · `POST /surveys/{id}/assign`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-62, UC-63 · BR-SV01–05 |
| **Mô tả** | Tạo một lịch khảo sát cho đơn (chọn ngày) và phân công Leader Staff thực hiện. Tạo bản ghi `survey_reports` ở trạng thái `draft`. |

**POST request body**

```json
{ "survey_date": "2026-06-25", "surveyed_by": 12 }
```

**Response `201`**

```json
{ "success": true, "code": "MSG-SV-01", "message": "Đã lên lịch khảo sát", "data": { "id": 7, "order_id": 10, "survey_date": "2026-06-25", "surveyed_by": 12, "status": "draft" } }
```

---

### `[UC-64]` Giám sát tiến độ khảo sát · `[UC-65]` Xem báo cáo khảo sát

`GET /orders/{id}/surveys` · `GET /surveys/{id}`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC** | UC-64, UC-65 |
| **Mô tả** | Danh sách khảo sát của đơn (theo dõi trạng thái) và chi tiết một báo cáo khảo sát kèm các hạng mục (`survey_items`) và ảnh (`evidence_files`). |

**Response `200` (chi tiết)**

```json
{
  "success": true,
  "data": {
    "id": 7,
    "order_id": 10,
    "surveyed_by": 12,
    "survey_date": "2026-06-25",
    "venue_notes": "Sảnh dài 20m, trần cao 6m",
    "requirement_notes": "Tông trắng, cần 2 cổng hoa",
    "status": "submitted",
    "items": [
      { "id": 1, "catalog_item_id": 15, "item_name": "Cổng hoa", "quantity_required": 2 }
    ],
    "evidence_files": [ { "id": 40, "file_name": "sanh1.jpg", "file_type": "image/jpeg", "file_size": 250000, "file_url": "https://cdn/.../1.jpg" } ]
  }
}
```

---

### `[UC-75]` Phân công nhân sự

`POST /orders/{id}/assignments`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-75 · BR-AS01–04 |
| **Mô tả** | Phân công nhân sự (Leader/Technical) vào đơn theo ngày + ca làm. Chỉ nhân sự `active`, vai trò phù hợp; không double-booking khi xung đột lịch. Có thông báo sau phân công. |

**Request body**

```json
{ "user_id": 12, "assigned_date": "2026-07-01", "session_type": "morning", "role_in_event": "Thợ chính" }
```

**Response `201`**

```json
{ "success": true, "code": "MSG-AS-01", "message": "Phân công thành công", "data": { "id": 25, "order_id": 10, "user_id": 12, "assigned_date": "2026-07-01", "session_type": "morning", "status": "assigned" } }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 409 | MSG-AS-02 | Nhân sự bị trùng lịch (double-booking) (BR-AS03) |
| 409 | MSG-AS-03 | Nhân sự `inactive` hoặc sai vai trò (BR-AS01/02) |

---

### `[UC-76]` Lập lịch vận chuyển

`POST /orders/{id}/schedules`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-76 · BR-TS01–04 |
| **Mô tả** | Lập các mốc lịch vận hành (giao hàng trước lắp đặt; thu hồi + hoàn trả sau sự kiện). |

> ⚠️ **Lưu ý DB:** Yêu cầu tạo bảng `order_schedules` (`order_id`, `schedule_type`, `scheduled_at`, `notes`) trong Database để lưu lịch vận hành tách biệt theo đúng ERD E21.

**Response `201`** _(tạm thời)_

```json
{ "success": true, "code": "MSG-TS-01", "message": "Đã lập lịch vận chuyển", "data": { "order_id": 10 } }
```

---

### `[UC-77]` Xác nhận công việc nhân sự · `[UC-78]` Xác nhận dữ liệu lương

`POST /attendance/{id}/verify` · `POST /wage-summaries/{id}/approve`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-77 · BR-CW01–04 · UC-78 · BR-WD01–04 |
| **Mô tả** | Manager xác nhận điểm danh hợp lệ của Leader Staff (ca đã xác nhận mới được tính lương) và duyệt bảng tổng hợp lương tháng (`wage_summaries`). |

**Response `200` (verify attendance)**

```json
{ "success": true, "code": "MSG-CW-01", "message": "Đã xác nhận ca làm việc", "data": { "id": 60, "status": "verified" } }
```

**Response `200` (approve wage)**

```json
{ "success": true, "code": "MSG-WD-01", "message": "Đã duyệt dữ liệu lương", "data": { "id": 9, "status": "approved" } }
```

> **Liên quan:** quy tắc lương (UC-38) ở [06-policies-wage.md](./06-policies-wage.md); điểm danh do nhân viên ghi ở [12-mobile-field-ops.md](./12-mobile-field-ops.md).

---

### `[UC-79]` Giám sát tiến độ hiện trường

`GET /orders/{id}/progress`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-79 · BR-MF / BR-FP |
| **Mô tả** | Theo dõi tiến độ vận chuyển/lắp đặt/thu hồi theo thời gian thực. |

> ⚠️ **Lưu ý DB:** Yêu cầu tạo bảng `task_progress_updates` trong Database để lưu nhật ký tiến độ và bằng chứng theo từng mốc theo đúng ERD E25. Dữ liệu sẽ được đọc từ bảng này.

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "task_id": 80, "title": "Vận chuyển", "status": "done", "updated_at": "2026-07-01T06:00:00Z" },
    { "task_id": 81, "title": "Lắp đặt sân khấu", "status": "in_progress", "updated_at": "2026-07-01T08:30:00Z" }
  ]
}
```

---

### `[UC-80]` Duyệt yêu cầu thay đổi

`POST /change-requests/{id}/review`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-80 · BR-CR01–05 |
| **Mô tả** | Manager duyệt/từ chối yêu cầu thay đổi tại hiện trường do Leader nộp. Chỉ ảnh hưởng chi phí/kho **sau khi** duyệt. Từ chối cần lý do. |

**Request body**

```json
{ "decision": "approved", "review_notes": "Đồng ý thêm 2 bàn" }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-CR-01", "message": "Đã duyệt yêu cầu thay đổi", "data": { "id": 14, "status": "approved" } }
```

> ⚠️ **Lưu ý DB:** API yêu cầu tạo bảng `change_request_items` (`change_request_id`, `catalog_item_id`, `quantity`, `change_type`) trong Database để chi tiết hóa số lượng và tác động chi phí theo đúng ERD E36.

---

### `[UC-81]` Xác nhận biên bản bàn giao · `[UC-82]` Xác nhận biên bản hư hỏng/mất mát

`POST /handovers/{id}/confirm` · `POST /damage-loss-reports/{id}/confirm`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-81 · BR-HR01–04 · UC-82 · BR-DL01–04 |
| **Mô tả** | Manager xác nhận biên bản bàn giao và biên bản hư hỏng/mất mát do Leader nộp. Từ chối cần lý do. Biên bản hư hỏng đã xác nhận có thể kích hoạt tính bồi thường (khấu trừ lương). |

**Request body**

```json
{ "decision": "confirmed", "notes": "Đã kiểm tra, khớp thực tế" }
```

**Response `200` (handover)**

```json
{ "success": true, "code": "MSG-HR-01", "message": "Đã xác nhận biên bản bàn giao", "data": { "id": 18, "status": "confirmed" } }
```

**Response `200` (damage/loss)**

```json
{ "success": true, "code": "MSG-DL-01", "message": "Đã xác nhận biên bản hư hỏng/mất mát", "data": { "id": 5, "status": "confirmed" } }
```
