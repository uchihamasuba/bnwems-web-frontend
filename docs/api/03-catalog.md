# 03. Danh mục hàng hóa & Giá — API

> **UC:** 19–27 · **Vai trò:** Admin · **Nền tảng:** Web
> Quy ước chung & template: [README.md](./README.md)
> Prefix MSG: giá dùng **MSG-SP** (mục 8). Danh mục/hàng hóa chưa có prefix → đề xuất **MSG-CAT**.

> ⚠️ **Cần xác nhận (3 file lệch nhau):** `documents.md` tách **thiết bị** (UC-19–22) và **dịch vụ** (UC-23–26) theo trường `type`, nhưng bảng `catalog_items` trong `database.md` **chỉ có `category_id`**, không có cột `type`. → Mẫu dưới gộp thành **một bộ endpoint `catalog-items`**, phân biệt thiết bị/dịch vụ bằng **danh mục (category)**. Nếu muốn tách `type` thật sự thì phải thêm cột vào DB.

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| UC-19/23 | Xem danh mục thiết bị/dịch vụ | `GET /catalog-items` | Admin | ✅ |
| — | Xem chi tiết hàng hóa | `GET /catalog-items/{id}` | Admin | ✅ |
| UC-20/24 | Tạo thiết bị/dịch vụ | `POST /catalog-items` | Admin | ✅ |
| UC-21/25 | Cập nhật thiết bị/dịch vụ | `PUT /catalog-items/{id}` | Admin | ✅ |
| UC-22/26 | Vô hiệu hóa thiết bị/dịch vụ | `PATCH /catalog-items/{id}/status` | Admin | ✅ |
| — | Quản lý nhóm danh mục | `GET/POST/PUT /catalog-categories` | Admin | ✅ |
| UC-27 | Xem lịch sử giá | `GET /catalog-items/{id}/prices` | Admin | ✅ |
| UC-27 | Thiết lập giá mới | `POST /catalog-items/{id}/prices` | Admin | ✅ |

---

## Chi tiết endpoint

### `[UC-19/23]` Xem danh sách hàng hóa

`GET /catalog-items`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-19 (thiết bị), UC-23 (dịch vụ) |
| **Mô tả** | Danh sách hàng hóa, lọc theo danh mục/trạng thái. Lọc `category_id` để lấy riêng nhóm thiết bị hoặc dịch vụ. |

**Query params:** `?page=1&limit=20&search=&category_id=&status=active`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "code": "TB-001",
      "name": "Loa Bose L1",
      "category_id": 3,
      "category_name": "Âm thanh",
      "unit": "Cái",
      "status": "active",
      "current_price": 500000
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 120, "total_pages": 6 }
}
```

**Ghi chú:** `current_price` lấy từ `item_price_history` có `valid_to = NULL` (giá hiện hành). **Nếu item chưa được thiết lập giá, `current_price` sẽ trả về `null`.** Frontend cần lưu ý xử lý hiển thị case này.

---

### `[UC-20/24]` Tạo hàng hóa

`POST /catalog-items`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-20 (thiết bị), UC-24 (dịch vụ) |
| **Mô tả** | Tạo hàng hóa mới (thiết bị/dịch vụ/vật tư…) thuộc một danh mục. Mã `code` không được trùng. |

**Request body**

```json
{
  "code": "TB-001",
  "name": "Loa Bose L1",
  "category_id": 3,
  "unit": "Cái",
  "description": "Loa array công suất lớn"
}
```

**Response `201`**

```json
{ "success": true, "code": "MSG-CAT-01", "message": "Tạo hàng hóa thành công", "data": { "id": 10, "code": "TB-001", "status": "active" } }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-CAT-02 | Thiếu field bắt buộc |
| 404 | MSG-CAT-03 | `category_id` không tồn tại |
| 409 | MSG-CAT-04 | `code` đã tồn tại |

---

### `[UC-21/25]` Cập nhật hàng hóa

`PUT /catalog-items/{id}`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-21 (thiết bị), UC-25 (dịch vụ) |
| **Mô tả** | Cập nhật thông tin hàng hóa. |

**Request body**

```json
{ "name": "Loa Bose L1 Pro", "category_id": 3, "unit": "Cái", "description": "Bản nâng cấp" }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-CAT-05", "message": "Cập nhật hàng hóa thành công", "data": { "id": 10 } }
```

**Lỗi:** `404` không tìm thấy hàng hóa.

---

### `[UC-22/26]` Vô hiệu hóa hàng hóa

`PATCH /catalog-items/{id}/status`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-22 (thiết bị), UC-26 (dịch vụ) |
| **Mô tả** | Đổi trạng thái kinh doanh (`active`/`inactive`). Hàng `inactive` không được dùng cho báo giá mới và không cấu hình giá mới (BR-SP06). |

**Request body**

```json
{ "status": "inactive" }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-CAT-06", "message": "Đã cập nhật trạng thái hàng hóa", "data": { "id": 10, "status": "inactive" } }
```

---

### `[—]` Quản lý nhóm danh mục

`GET /catalog-categories` · `POST /catalog-categories` · `PUT /catalog-categories/{id}`

| | |
|---|---|
| **Vai trò** | Admin |
| **Mô tả** | CRUD nhóm phân loại hàng hóa (`catalog_categories`). |

**POST request body**

```json
{ "name": "Âm thanh", "description": "Thiết bị âm thanh, ánh sáng" }
```

**Response `201`**

```json
{ "success": true, "code": "MSG-CAT-07", "message": "Tạo danh mục thành công", "data": { "id": 3, "name": "Âm thanh", "status": "active" } }
```

---

### `[UC-27]` Xem lịch sử giá

`GET /catalog-items/{id}/prices`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC · BR** | UC-27 · BR-SP01–06 |
| **Mô tả** | Lịch sử giá của một hàng hóa (`item_price_history`). Bản ghi `valid_to = null` là giá hiện hành. |

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "id": 50, "price": 500000, "valid_from": "2026-06-01T00:00:00Z", "valid_to": null },
    { "id": 49, "price": 450000, "valid_from": "2026-01-01T00:00:00Z", "valid_to": "2026-06-01T00:00:00Z" }
  ]
}
```

---

### `[UC-27]` Thiết lập giá mới

`POST /catalog-items/{id}/prices`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC · BR** | UC-27 · BR-SP01–06 |
| **Mô tả** | Thêm mốc giá mới có hiệu lực. Hệ thống tự đóng `valid_to` của giá hiện hành cũ (giữ lịch sử, không xóa). *Lưu ý:* `valid_from` phải ở định dạng ISO-8601 UTC (theo README §A.6). |

**Request body**

```json
{ "price": 550000, "valid_from": "2026-07-01T00:00:00Z" }
```

**Response `201`**

```json
{ "success": true, "code": "MSG-SP-01", "message": "Thiết lập giá thành công", "data": { "id": 51, "price": 550000, "valid_from": "2026-07-01T00:00:00Z", "valid_to": null } }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-SP-02 | Giá ≤ 0 hoặc thiếu `valid_from` (BR-SP02/03) |
| 409 | MSG-SP-03 | Hàng hóa đang `inactive`, không được đặt giá mới (BR-SP06) |
