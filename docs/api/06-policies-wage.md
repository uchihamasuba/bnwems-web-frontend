# 06. Chính sách & Quy tắc lương — API

> **UC:** 34–38 · **Vai trò:** Admin · **Nền tảng:** Web
> Quy ước chung & template: [README.md](./README.md)
> Prefix MSG: đặt cọc **MSG-DP**, hủy đơn **MSG-CPOL**, phụ phí **MSG-AF**, quy tắc lương **MSG-WR** (mục 8). Bồi thường chưa có prefix → đề xuất **MSG-CMP**.

> ⚠️ **Cần xác nhận (DB đơn giản hơn yêu cầu):** `documents.md` (Entity 11) mô tả Business Policy có `rules_json` (quy tắc phức tạp, vd hủy đơn nhiều mức theo ngưỡng ngày). Nhưng bảng `business_policies` trong `database.md` chỉ có **một giá trị phẳng** (`policy_value` + `unit`). → Chính sách nhiều mức (hủy đơn, phụ phí nhiều loại) **không lưu đủ** trong cấu trúc hiện tại. Mẫu dưới theo `database.md` (mỗi chính sách = 1 dòng key-value).

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| — | Xem danh sách chính sách | `GET /business-policies` | Admin | ✅ |
| UC-34 | Cấu hình chính sách đặt cọc | `PUT /business-policies/{code}` | Admin | ✅ |
| UC-35 | Cấu hình chính sách hủy đơn | `PUT /business-policies/{code}` | Admin | ✅ |
| UC-36 | Cấu hình chính sách bồi thường | `PUT /business-policies/{code}` | Admin | ✅ |
| UC-37 | Cấu hình chính sách phụ phí | `PUT /business-policies/{code}` | Admin | ✅ |
| UC-38 | Xem/Cấu hình quy tắc lương | `GET/POST/PUT /wage-rules` | Admin | ✅ |

---

## Chi tiết endpoint

### `[—]` Xem danh sách chính sách

`GET /business-policies`

| | |
|---|---|
| **Vai trò** | Admin |
| **Mô tả** | Toàn bộ chính sách nghiệp vụ hiện hành (`business_policies`). |

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "code": "MIN_DEPOSIT", "name": "Tiền cọc tối thiểu", "policy_value": 30, "unit": "%" },
    { "code": "CANCEL_REFUND_7D", "name": "Hoàn cọc khi hủy trước 7 ngày", "policy_value": 50, "unit": "%" }
  ]
}
```

---

### `[UC-34/35/36/37]` Cấu hình chính sách

`PUT /business-policies/{code}`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC · BR** | UC-34 (BR-DP), UC-35 (BR-CPOL), UC-36 (bồi thường), UC-37 (BR-AF) |
| **Mô tả** | Cập nhật giá trị một chính sách theo `code`. Một bản ghi = một giá trị (vd tỷ lệ cọc, % hoàn, mức phụ phí). |

**Request body**

```json
{ "policy_value": 40.00, "unit": "%", "description": "Tăng tỷ lệ cọc tối thiểu lên 40%" }
```
*(Lưu ý: `policy_value` phải được truyền theo kiểu số thực (float/decimal), ví dụ: `40.00` thay vì `40` để nhất quán với Database `DECIMAL(15,2)`).*

**Response `200`**

```json
{ "success": true, "code": "MSG-DP-01", "message": "Cập nhật chính sách thành công", "data": { "code": "MIN_DEPOSIT", "policy_value": 40.00, "unit": "%" } }
```

**Lỗi:** `400` — giá trị ngoài phạm vi cho phép (vd % hoàn không trong 0–100).

> ⚠️ Chính sách nhiều mức (hủy đơn theo nhiều ngưỡng ngày, phụ phí nhiều loại) cần nhiều bản ghi `code` riêng, hoặc bổ sung `rules_json` vào DB.

---

### `[UC-38]` Quy tắc lương nhân sự

`GET /wage-rules` · `POST /wage-rules` · `PUT /wage-rules/{id}`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC · BR** | UC-38 · BR-WR01–07 |
| **Mô tả** | Cấu hình mức lương theo ca làm (`wage_rules`), theo vai trò + loại ca + ngày hiệu lực. Mức lương > 0; mỗi vai trò chỉ một quy tắc hiện hành tại một thời điểm. Manager xác nhận nhưng không cấu hình (xem UC-78). |

**POST request body**

```json
{
  "role_id": 3,
  "session_type": "night_setup",
  "wage_amount": 500000,
  "valid_from": "2026-07-01"
}
```

**Response `201`**

```json
{
  "success": true,
  "code": "MSG-WR-01",
  "message": "Tạo quy tắc lương thành công",
  "data": { "id": 6, "role_id": 3, "session_type": "night_setup", "wage_amount": 500000, "valid_from": "2026-07-01", "valid_to": null }
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-WR-02 | Mức lương ≤ 0 (BR-WR02) |
| 409 | MSG-WR-03 | Đã có quy tắc hiện hành cho vai trò + ca này (BR-WR04) |
