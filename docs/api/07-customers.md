# 07. Khách hàng — API

> **UC:** 47–49 · **Vai trò:** Manager · **Nền tảng:** Web
> Quy ước chung & template: [README.md](./README.md)
> Mục 8 `documents.md` chưa có prefix MSG cho Khách hàng → đề xuất **MSG-CUS** (các mã dưới là đề xuất).

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| UC-47 | Xem danh sách khách hàng | `GET /customers` | Manager | ✅ |
| UC-47 | Xem chi tiết khách hàng | `GET /customers/{id}` | Manager | ✅ |
| UC-48 | Đăng ký khách hàng mới | `POST /customers` | Manager | ✅ |
| UC-49 | Cập nhật thông tin khách hàng | `PUT /customers/{id}` | Manager | ✅ |

> ⚠️ **Cần xác nhận:** `documents.md` (Entity 5) có `dob` và `group` (VIP/Thân thiết/Khách mới), nhưng bảng `customers` trong `database.md` **không có** 2 trường này → tính năng nâng hạng khách hàng (câu hỏi mở #6) chưa có chỗ lưu. Mẫu dưới theo `database.md`.

---

## Chi tiết endpoint

### `[UC-47]` Xem danh sách khách hàng

`GET /customers`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC** | UC-47 |
| **Mô tả** | Danh sách khách hàng, hỗ trợ tìm kiếm theo tên/SĐT và phân trang. |

**Query params:** `?page=1&limit=20&search=&status=active`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "Trần Thị B",
      "phone": "0908765432",
      "email": "b@example.com",
      "address": "123 Lê Lợi, Q1",
      "status": "active",
      "updated_by": { "id": 5, "full_name": "Nguyễn Văn A" },
      "created_at": "2026-02-01T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42, "total_pages": 3 }
}
```

---

### `[UC-47]` Xem chi tiết khách hàng

`GET /customers/{id}`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC** | UC-47 |
| **Mô tả** | Thông tin đầy đủ một khách hàng. |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "Trần Thị B",
    "phone": "0908765432",
    "email": "b@example.com",
    "address": "123 Lê Lợi, Q1",
    "notes": "Khách quen, ưu tiên tông trắng",
    "status": "active",
    "created_by": { "id": 5, "full_name": "Nguyễn Văn A" },
    "updated_by": { "id": 5, "full_name": "Nguyễn Văn A" },
    "created_at": "2026-02-01T08:00:00Z",
    "updated_at": "2026-02-01T08:00:00Z"
  }
}
```

**Lỗi:** `404` — không tìm thấy khách hàng.

---

### `[UC-48]` Đăng ký khách hàng mới

`POST /customers`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC** | UC-48 |
| **Mô tả** | Tạo hồ sơ khách hàng mới. Số điện thoại là định danh, không được trùng. |

**Request body**

```json
{
  "full_name": "Trần Thị B",
  "phone": "0908765432",
  "email": "b@example.com",
  "address": "123 Lê Lợi, Q1",
  "notes": "Khách quen"
}
```

**Response `201`**

```json
{
  "success": true,
  "code": "MSG-CUS-01",
  "message": "Tạo khách hàng thành công",
  "data": { "id": 1, "full_name": "Trần Thị B", "phone": "0908765432", "status": "active" }
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-CUS-02 | Thiếu `full_name` hoặc `phone` |
| 409 | MSG-CUS-03 | Số điện thoại đã tồn tại |

---

### `[UC-49]` Cập nhật thông tin khách hàng

`PUT /customers/{id}`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC** | UC-49 |
| **Mô tả** | Cập nhật thông tin khách hàng. |

**Request body**

```json
{
  "full_name": "Trần Thị B",
  "phone": "0908765432",
  "email": "new@example.com",
  "address": "456 Nguyễn Huệ, Q1",
  "notes": "Cập nhật địa chỉ"
}
```

**Response `200`**

```json
{ "success": true, "code": "MSG-CUS-04", "message": "Cập nhật khách hàng thành công", "data": { "id": 1 } }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 404 | — | Không tìm thấy khách hàng |
| 409 | MSG-CUS-03 | Số điện thoại trùng khách hàng khác |
