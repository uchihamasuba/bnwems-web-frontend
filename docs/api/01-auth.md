# 01. Xác thực & Hồ sơ — API

> **UC:** 1–5, 7 · **Vai trò:** Tất cả · **Nền tảng:** Web + Mobile
> Quy ước chung & template: [README.md](./README.md)

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| UC-1 | Đăng nhập | `POST /auth/login` | Tất cả | ✅ |
| UC-2 | Đăng xuất | `POST /auth/logout` | Tất cả (đã đăng nhập) | ✅ |
| UC-3 | Quên mật khẩu | `POST /auth/forgot-password` | Tất cả | ✅ |
| UC-3 | Xác minh OTP | `POST /auth/forgot-password/verify` | Tất cả | ✅ |
| UC-3 | Đặt lại mật khẩu | `POST /auth/reset-password` | Tất cả | ✅ |
| UC-4 | Đổi mật khẩu | `PUT /me/password` | Tất cả (đã đăng nhập) | ✅ |
| UC-5 | Xem hồ sơ cá nhân | `GET /me` | Tất cả (đã đăng nhập) | ✅ |
| UC-6 | Cập nhật hồ sơ cá nhân | `PUT /me` | Tất cả (đã đăng nhập) | ✅ |
| D-01 | Làm mới Token | `POST /auth/refresh` | Tất cả (đã đăng nhập) | ✅ |
| UC-7 | Xem danh sách thông báo | `GET /notifications` | Tất cả (đã đăng nhập) | ✅ |
| UC-7 | Đánh dấu đã đọc | `PATCH /notifications/{id}/read` | Tất cả (đã đăng nhập) | ✅ |

---

## Chi tiết endpoint

### `[UC-1]` Đăng nhập

`POST /auth/login`

| | |
|---|---|
| **Vai trò** | Tất cả (không cần token) |
| **UC · BR** | UC-1 · BR-LG01–05 |
| **Mô tả** | Đăng nhập bằng username + password, trả về token và thông tin người dùng. Có thể kèm `device_token` để đăng ký nhận thông báo. |

**Request body**

```json
{
  "username": "manager01",
  "password": "secret123",
  "device_token": "fcm_xxx",
  "device_type": "web" // Các giá trị hợp lệ: "android" | "web" | "ios"
}
```

**Response `200`**

```json
{
  "success": true,
  "code": "MSG-LG-01",
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 5,
      "full_name": "Nguyễn Văn A",
      "username": "manager01",
      "role": "Manager",
      "platform_access": "web"
    }
  }
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-LG-02 | Sai username hoặc password |
| 403 | MSG-LG-03 | Tài khoản `inactive`/`suspended` (BR-LG02) |
| 403 | MSG-LG-04 | Bị khóa tạm do sai nhiều lần (BR-LG04) |
| 403 | MSG-LG-05 | Sai nền tảng — vd Leader đăng nhập web (BR-LG03) |

**Ghi chú:** Đăng nhập thành công ghi audit log (BR-LG05). `device_token`/`device_type` là tùy chọn, nếu có thì lưu vào bảng `user_devices`.

---

### `[UC-2]` Đăng xuất

`POST /auth/logout`

| | |
|---|---|
| **Vai trò** | Tất cả (đã đăng nhập) |
| **UC** | UC-2 |
| **Mô tả** | Đăng xuất phiên hiện tại. Token là JWT stateless nên server chỉ gỡ `device_token` khỏi `user_devices`; client tự xóa token. |

**Request body**

```json
{ "device_token": "fcm_xxx" }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-LG-06", "message": "Đăng xuất thành công", "data": null }
```

---

### `[UC-3]` Quên mật khẩu (Bước 1 — Yêu cầu khôi phục)

`POST /auth/forgot-password`

| | |
|---|---|
| **Vai trò** | Tất cả (không cần token) |
| **UC · BR** | UC-3 · BR-AUTH01, BR-AUTH04 |
| **Mô tả** | Người dùng nhập username/email. Hệ thống tạo OTP/token có hạn (vd 10 phút), gửi qua email/SMS đã đăng ký. |

**Request body**

```json
{ "username": "manager01" }
```

**Response `200`**

*(luôn trả về cùng message dù tài khoản có tồn tại hay không, để tránh user enumeration attack)*

```json
{
  "success": true,
  "code": "MSG-AUTH0301-OK",
  "message": "Nếu tài khoản tồn tại, mã xác nhận đã được gửi",
  "data": null
}
```

**Ghi chú:**
- Yêu cầu áp dụng **Rate limiting** để chống spam.
- Ghi audit log.

---

### `[UC-3]` Quên mật khẩu (Bước 2 — Xác minh OTP)

`POST /auth/forgot-password/verify`

| | |
|---|---|
| **Vai trò** | Tất cả (không cần token) |
| **UC · BR** | UC-3 · BR-AUTH02, BR-AUTH04 |
| **Mô tả** | Người dùng nhập OTP/token nhận được. Hệ thống xác minh, nếu đúng → cấp reset_token ngắn hạn. |

**Request body**

```json
{ "username": "manager01", "otp": "839204" }
```

**Response `200`**

```json
{
  "success": true,
  "data": { "reset_token": "rst_8f2c1a...", "expires_in": 300 }
}
```

**Lỗi có thể gặp**

| HTTP | Khi nào |
|------|---------|
| 400 | OTP sai hoặc hết hạn |
| 429 | Thử quá số lần cho phép (chống brute-force) |

**Ghi chú:**
- Yêu cầu áp dụng **Rate limiting** để chống brute-force OTP.
- Ghi audit log.

---

### `[UC-3]` Đặt lại mật khẩu (Bước 3 — Hoàn tất)

`POST /auth/reset-password`

| | |
|---|---|
| **Vai trò** | Tất cả (không cần token) |
| **UC · BR** | UC-3 · BR-AUTH02, BR-AUTH03, BR-AUTH04 |
| **Mô tả** | Người dùng gửi reset_token + new_password. Hệ thống xác thực token, đặt mật khẩu mới, vô hiệu hóa token. |

**Request body**

```json
{ "reset_token": "rst_8f2c1a...", "new_password": "newSecret456" }
```

**Response `200`**

```json
{
  "success": true,
  "code": "MSG-AUTH0303",
  "message": "Đặt lại mật khẩu thành công",
  "data": null
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-AUTH0301 | Thiếu field bắt buộc |
| 400/409 | MSG-AUTH0302 | `reset_token` không hợp lệ / hết hạn / đã sử dụng, hoặc mật khẩu mới không đạt chính sách |

**Ghi chú:**
- Sau khi reset thành công, vô hiệu hóa toàn bộ token đăng nhập hiện có của user.
- Ghi audit log (đặc biệt: ai, lúc nào, từ IP nào).
- `reset_token` phải bị hủy ngay sau khi dùng thành công hoặc hết hạn, lưu ở bảng riêng (vd `password_reset_tokens`).
- Gửi email/OTP có thể cần làm rõ thêm phương thức liên lạc.

---

### `[UC-4]` Đổi mật khẩu

`PUT /me/password`

| | |
|---|---|
| **Vai trò** | Tất cả (đã đăng nhập) |
| **UC · BR** | UC-4 · BR-CP01–06 |
| **Mô tả** | Người dùng tự đổi mật khẩu, cần nhập mật khẩu hiện tại. |

**Request body**

```json
{ "current_password": "secret123", "new_password": "newSecret456" }
```

**Response `200`**

```json
{ "success": true, "code": "MSG-CP-01", "message": "Đổi mật khẩu thành công", "data": null }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400 | MSG-CP-02 | Mật khẩu hiện tại không đúng |
| 400 | MSG-CP-03 | Mật khẩu mới không đạt chính sách |

**Ghi chú:** Ghi audit log (BR-CP06).

---

### `[UC-5]` Xem hồ sơ cá nhân

`GET /me`

| | |
|---|---|
| **Vai trò** | Tất cả (đã đăng nhập) |
| **UC** | UC-5 |
| **Mô tả** | Lấy thông tin hồ sơ của người đang đăng nhập. |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "full_name": "Nguyễn Văn A",
    "username": "manager01",
    "email": "a@binhnguyen.vn",
    "phone": "0901234567",
    "role": "Manager",
    "status": "active",
    "created_at": "2026-01-10T08:00:00Z"
  }
}
```

---

### `[UC-7]` Xem danh sách thông báo

`GET /notifications`

| | |
|---|---|
| **Vai trò** | Tất cả (đã đăng nhập) |
| **UC** | UC-7 |
| **Mô tả** | Danh sách thông báo của người dùng, mới nhất trước. Hỗ trợ phân trang (xem README §A.4). |

**Query params:** `?page=1&limit=20&is_read=false`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": 88,
      "title": "Đơn hàng cần duyệt",
      "message": "Đơn ORD-010 đang chờ xác nhận báo giá",
      "type": "order",
      "related_entity_type": "orders",
      "related_entity_id": 10,
      "is_read": false,
      "created_at": "2026-06-18T09:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "total_pages": 1 }
}
```

**Ghi chú:** Đây là endpoint **lấy** thông báo in-app. Cơ chế **đẩy** real-time (FCM/WebSocket qua `device_token`) nằm ngoài phạm vi REST doc — cần chốt riêng.
**Lưu ý:** DB `notifications.is_read` có kiểu `TINYINT(1)`, Backend tự động map thành `boolean` (`true/false`) trong JSON response.

---

### `[UC-7]` Đánh dấu đã đọc

`PATCH /notifications/{id}/read`

| | |
|---|---|
| **Vai trò** | Tất cả (đã đăng nhập) |
| **UC** | UC-7 |
| **Mô tả** | Đánh dấu một thông báo là đã đọc (cập nhật `is_read`, `read_at`). |

**Response `200`**

```json
{ "success": true, "message": "Đã đánh dấu đã đọc", "data": { "id": 88, "is_read": true } }
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 404 | — | Không tìm thấy thông báo, hoặc không thuộc về người dùng |

---

### `[UC-6]` Cập nhật hồ sơ cá nhân

`PUT /me`

| | |
|---|---|
| **Vai trò** | Tất cả (đã đăng nhập) |
| **UC** | UC-6 |
| **Mô tả** | Cập nhật thông tin hồ sơ của người dùng đang đăng nhập (`full_name`, `email`, `phone`). |

**Request body**

```json
{
  "full_name": "Nguyễn Văn B",
  "email": "b@binhnguyen.vn",
  "phone": "0901234568"
}
```

**Response `200`**

```json
{ "success": true, "message": "Cập nhật hồ sơ thành công", "data": null }
```

---

### `[D-01]` Làm mới Token

`POST /auth/refresh`

| | |
|---|---|
| **Vai trò** | Tất cả (đã đăng nhập) |
| **UC** | - |
| **Mô tả** | Làm mới JWT token đang được sử dụng (trong grace period). |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```
