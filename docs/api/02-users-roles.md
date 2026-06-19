# 02. Người dùng, Vai trò & Phân quyền — API

> **UC:** 8–18 · **Vai trò:** Admin · **Nền tảng:** Web
> Quy ước chung & template: [README.md](./README.md)
> Prefix MSG: user **MSG-AU**, vô hiệu hóa **MSG-DU**, reset mật khẩu **MSG-RP**, gán vai trò **MSG-AR**, quyền **MSG-PR** (mục 8). Vai trò (CRUD) chưa có prefix → đề xuất **MSG-ROLE**.

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| UC-8 | Xem danh sách người dùng | `GET /users` | Admin | ✅ |
| UC-9 | Tạo tài khoản người dùng | `POST /users` | Admin | ✅ |
| UC-10 | Cập nhật thông tin người dùng | `PUT /users/{id}` | Admin | ✅ |
| UC-11 | Vô hiệu hóa tài khoản | `PATCH /users/{id}/status` | Admin | ✅ |
| UC-12 | Đặt lại mật khẩu người dùng | `POST /users/{id}/reset-password` | Admin | ✅ |
| UC-13 | Gán vai trò cho người dùng | `PATCH /users/{id}/role` | Admin | ✅ |
| UC-14 | Xem danh sách vai trò | `GET /roles` | Admin | ✅ |
| UC-15 | Tạo vai trò | `POST /roles` | Admin | ✅ |
| UC-16 | Cập nhật vai trò | `PUT /roles/{id}` | Admin | ✅ |
| UC-17 | Vô hiệu hóa vai trò | `PATCH /roles/{id}/status` | Admin | ✅ |
| B-08 | Xem danh sách user theo vai trò | `GET /roles/{id}/users` | Admin | ✅ |
| UC-18 | Gán quyền cho vai trò | `PUT /roles/{id}/permissions` | Admin | ✅ |
| — | Xem danh sách quyền | `GET /permissions` | Admin | ✅ |

---

## Chi tiết endpoint

### `[UC-8]` Xem danh sách người dùng

`GET /users`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-8 |
| **Mô tả** | Danh sách nhân sự nội bộ, lọc theo vai trò/trạng thái, phân trang. |

**Query params:** `?page=1&limit=20&search=&role_id=&status=active`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "full_name": "Nguyễn Văn A",
      "username": "manager01",
      "email": "a@binhnguyen.vn",
      "phone": "0901234567",
      "role": { "id": 2, "name": "Manager" },
      "status": "active"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 18, "total_pages": 1 }
}
```

---

### `[UC-9]` Tạo tài khoản người dùng

`POST /users`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC · BR** | UC-9 · BR-AU01–05 |
| **Mô tả** | Admin tạo tài khoản nhân sự mới. `username` duy nhất, mỗi user đúng một vai trò; vai trò `inactive` không được gán. |

**Request body**

```json
{
  "full_name": "Lê Văn C",
  "username": "leader02",
  "password": "initPass123",
  "email": "c@binhnguyen.vn",
  "phone": "0912345678",
  "role_id": 3
}
```

**Response `201`**

```json
{ "success": true, "code": "MSG-AU-01", "message": "Tạo tài khoản thành công", "data": { "id": 20, "username": "leader02", "status": "active" } }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-AU-02 | Thiếu field bắt buộc hoặc dữ liệu sai định dạng (`email` phải chuẩn RFC 5322, `phone` phải từ 10-12 ký số) |
| 409 | MSG-AU-03 | `username` đã tồn tại (BR-AU01) |
| 409 | MSG-AU-04 | Vai trò `inactive`, không được gán (BR-AU03) |

**Ghi chú:** Ghi audit log (BR-AU05).

---

### `[UC-10]` Cập nhật thông tin người dùng

`PUT /users/{id}`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-10 |
| **Mô tả** | Cập nhật thông tin nhân sự (không đổi mật khẩu — xem UC-12). |

**Request body**

```json
{ "full_name": "Lê Văn C", "email": "c2@binhnguyen.vn", "phone": "0912345679" }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-AU-05", "message": "Cập nhật người dùng thành công", "data": { "id": 20 } }
```

---

### `[UC-11]` Vô hiệu hóa tài khoản

`PATCH /users/{id}/status`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC · BR** | UC-11 · BR-DU01–05 |
| **Mô tả** | Đổi trạng thái tài khoản. Tài khoản `inactive`/`suspended` không đăng nhập được; Admin **không thể tự vô hiệu hóa chính mình**. |

**Request body**

```json
{ "status": "inactive" }
```
*(Các giá trị hợp lệ: `"active" | "inactive" | "suspended"`)*

**Response `200`**

```json
{ "success": true, "code": "MSG-DU-01", "message": "Đã cập nhật trạng thái tài khoản", "data": { "id": 20, "status": "inactive" } }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-DU-03 | `status` truyền vào không nằm trong danh sách hợp lệ |
| 409 | MSG-DU-02 | Admin tự vô hiệu hóa chính mình (BR-DU05) |

---

### `[UC-12]` Đặt lại mật khẩu người dùng

`POST /users/{id}/reset-password`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC · BR** | UC-12 · BR-RP01–06 |
| **Mô tả** | Admin đặt lại mật khẩu cho nhân sự (sau khi xác minh ngoài hệ thống). Không thể đặt lại cho chính mình hoặc cho tài khoản đã vô hiệu hóa. |

**Request body**

```json
{ "new_password": "resetPass456" }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-RP-01", "message": "Đặt lại mật khẩu thành công", "data": { "id": 20 } }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 409 | MSG-RP-02 | Đặt lại mật khẩu của chính mình (BR-RP02) |
| 409 | MSG-RP-03 | Tài khoản đang `inactive` (BR-RP03) |

---

### `[UC-13]` Gán vai trò cho người dùng

`PATCH /users/{id}/role`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC · BR** | UC-13 · BR-AR01–06 |
| **Mô tả** | Thay đổi vai trò của nhân sự (mỗi user đúng một vai trò). Vai trò `inactive` không được gán; tài khoản đã vô hiệu hóa không được gán vai trò mới. |

**Request body**

```json
{ "role_id": 2 }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-AR-01", "message": "Gán vai trò thành công", "data": { "id": 20, "role_id": 2 } }
```

---

### `[UC-14]` Xem danh sách vai trò

`GET /roles`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-14 |
| **Mô tả** | Danh sách vai trò và số quyền/số người dùng kèm theo. |

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "id": 2, "name": "Manager", "description": "Quản lý vận hành", "status": "active", "user_count": 4 }
  ]
}
```

---

### `[UC-15]` Tạo vai trò

`POST /roles`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-15 |
| **Mô tả** | Tạo vai trò mới. |

**Request body**

```json
{ "name": "Kế toán", "description": "Phụ trách thu chi" }
```

**Response `201`**

```json
{ "success": true, "code": "MSG-ROLE-01", "message": "Tạo vai trò thành công", "data": { "id": 5, "name": "Kế toán", "status": "active" } }
```

**Lỗi:** `409 MSG-ROLE-02` — tên vai trò trùng.

---

### `[UC-16]` Cập nhật vai trò · `[UC-17]` Vô hiệu hóa vai trò

`PUT /roles/{id}` · `PATCH /roles/{id}/status`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-16, UC-17 |
| **Mô tả** | Cập nhật tên/mô tả vai trò, hoặc đổi trạng thái. Vai trò `inactive` không được gán cho user mới (BR-AU03). |

**Response `200`**

```json
{ "success": true, "code": "MSG-ROLE-03", "message": "Cập nhật vai trò thành công", "data": { "id": 5, "status": "inactive" } }
```

---

### `[B-08]` Xem danh sách user theo vai trò

`GET /roles/{id}/users`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-13, UC-14 |
| **Mô tả** | Xem danh sách người dùng đang được gán vai trò này để Admin giám sát. |

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "id": 5, "username": "manager01", "full_name": "Nguyễn Văn A" }
  ]
}
```

---

### `[UC-18]` Gán quyền cho vai trò

`PUT /roles/{id}/permissions`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC · BR** | UC-18 · BR-PR01–05 |
| **Mô tả** | Thay thế toàn bộ tập quyền của vai trò (ghi vào `role_permissions`). Quyền chỉ gán qua vai trò, không gán trực tiếp cho user. Thay đổi ảnh hưởng tất cả user thuộc vai trò đó. |

**Request body**

```json
{ "permission_ids": [1, 2, 5, 8, 13] }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-PR-01", "message": "Cập nhật quyền thành công", "data": { "role_id": 2, "permission_ids": [1, 2, 5, 8, 13] } }
```

**Lỗi:** `409 MSG-PR-02` — vai trò đang `inactive`, không cập nhật quyền (BR-PR03).

---

### `[—]` Xem danh sách quyền

`GET /permissions`

| | |
|---|---|
| **Vai trò** | Admin |
| **Mô tả** | Toàn bộ quyền hệ thống (để tích chọn khi gán cho vai trò). |

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Xem đơn hàng", "code": "order.view" },
    { "id": 2, "name": "Tạo đơn hàng", "code": "order.create" }
  ]
}
```
