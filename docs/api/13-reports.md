# 13. Báo cáo & Dashboard quản trị — API

> **UC:** 39A, 40–46 · **Vai trò:** Admin · **Nền tảng:** Web
> Quy ước chung & template: [README.md](./README.md)

> **Ghi chú chung:** Toàn bộ là endpoint **GET chỉ đọc**, trả dữ liệu tổng hợp (không có MSG code/lỗi nghiệp vụ). Hầu hết nhận query khoảng thời gian `?from_date=&to_date=`. Cần chốt: dữ liệu real-time hay pre-aggregated (câu hỏi mở #12).

## Danh sách endpoint

| UC | Tên | Method · Path | Vai trò | Trạng thái |
|----|-----|---------------|---------|------------|
| UC-39A | Dashboard quản trị | `GET /dashboard/admin` | Admin | ✅ |
| UC-40 | Báo cáo doanh thu | `GET /reports/revenue` | Admin | ✅ |
| UC-41 | Thống kê đơn hàng | `GET /reports/orders` | Admin | ✅ |
| UC-42 | Thống kê tồn kho | `GET /reports/inventory` | Admin | ✅ |
| UC-43 | Thống kê nhân lực | `GET /reports/staff` | Admin | ✅ |
| UC-44 | Báo cáo hoàn trả kho | `GET /reports/warehouse-returns` | Admin | ✅ |
| UC-45 | Báo cáo công nợ NCC | `GET /reports/supplier-debt` | Admin | ✅ |
| UC-46 | Báo cáo lương nhân sự | `GET /reports/wages` | Admin | ✅ |

---

## Chi tiết endpoint

### `[UC-39A]` Dashboard quản trị

`GET /dashboard/admin`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-39A |
| **Mô tả** | KPI tổng quan toàn hệ thống cho Admin. |

**Response `200`**

```json
{
  "success": true,
  "data": {
    "total_orders": 120,
    "total_revenue": 1500000000,
    "active_staff": 15,
    "low_stock_items": 4,
    "pending_supplier_debt": 25000000
  }
}
```

---

### `[UC-40]` Báo cáo doanh thu

`GET /reports/revenue`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-40 |
| **Mô tả** | Doanh thu theo khoảng thời gian, nhóm theo tháng. |

**Query params:** `?from_date=2026-01-01&to_date=2026-06-30&group_by=month` *(Hỗ trợ `group_by`: `day`, `month`, `year`)*

**Response `200`**

```json
{
  "success": true,
  "data": {
    "total": 850000000,
    "group_by": "month",
    "series": [
      { "period": "2026-05", "revenue": 150000000 },
      { "period": "2026-06", "revenue": 200000000 }
    ]
  }
}
```

---

### `[UC-41]` Thống kê đơn hàng · `[UC-42]` Thống kê tồn kho · `[UC-43]` Thống kê nhân lực

`GET /reports/orders` · `GET /reports/inventory` · `GET /reports/staff`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-41, UC-42, UC-43 |
| **Mô tả** | Thống kê đơn hàng (theo trạng thái/loại sự kiện), tồn kho (số lượng theo tình trạng), nhân lực (ca làm/đơn theo nhân sự). |

**Response `200` (ví dụ — thống kê đơn hàng)**

```json
{
  "success": true,
  "data": {
    "by_status": { "new": 5, "confirmed": 12, "in_progress": 3, "completed": 95, "cancelled": 5 },
    "by_event_type": { "Tiệc cưới": 80, "Hội nghị": 40 }
  }
}
```

---

### `[UC-44]` Báo cáo hoàn trả kho · `[UC-45]` Báo cáo công nợ NCC · `[UC-46]` Báo cáo lương nhân sự

`GET /reports/warehouse-returns` · `GET /reports/supplier-debt` · `GET /reports/wages`

| | |
|---|---|
| **Vai trò** | Admin |
| **UC** | UC-44, UC-45, UC-46 |
| **Mô tả** | Báo cáo hoàn trả kho (thiết bị hư hỏng/mất mát), công nợ NCC (chưa trả/quá hạn), và bảng lương nhân sự theo tháng. |

**Query params:** `?from_date=&to_date=` (riêng lương: `?period_month=6&period_year=2026`)

**Response `200` (ví dụ — công nợ NCC)**

```json
{
  "success": true,
  "data": {
    "total_payable": 50000000,
    "total_paid": 25000000,
    "total_remaining": 25000000,
    "items": [
      { "supplier": "Công ty Âm thanh ABC", "remaining": 1500000, "due_date": "2026-07-20", "status": "partial" }
    ]
  }
}
```
