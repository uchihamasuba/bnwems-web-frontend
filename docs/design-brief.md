# Design Brief — BNWEMS Web Frontend

Mục đích: tài liệu mô tả từng màn hình (route, mục đích, thành phần UI chính, luồng điều hướng) để
làm input cho công cụ thiết kế (Claude Design/Stitch) không đọc được code local trực tiếp.

Quy ước trạng thái:
- ✅ **Đã triển khai** — có layout/UI thật, dùng để tham chiếu phong cách.
- ⏳ **Placeholder** — route tồn tại, chỉ hiển thị "Tính năng đang được phát triển", chưa có UI thật.
  Với các màn này, thiết kế phải generate from scratch theo design system (xem mục "Design tokens"
  ngay dưới đây + CLAUDE.md mục 3).

Layout khung chung cho mọi trang sau khi đăng nhập: `Sidebar` trái cố định (260px, nền `#111827`,
logo "BN" + tên hệ thống, nav item theo role, nút Đăng xuất ở đáy) + vùng nội dung bên phải (nền
sáng, topbar mỏng, nội dung dạng card `rounded-xl` trên nền `slate-50`).

---

## Design tokens — màu & typography

Lấy trực tiếp từ code thật (`src/components/ui/Badge.tsx`, `src/app/layout.tsx`, `src/app/globals.css`,
`src/components/layout/Sidebar.tsx`), không suy diễn.

### Màu badge trạng thái (`Badge.tsx`)

Component `Badge` có 5 variant, mỗi variant = `bg-{color}-100` + `text-{color}-700` + `ring-{color}-600/20`
(viền mảnh, nền nhạt — đúng tinh thần "pill nhạt, không nền đặc gắt" ở CLAUDE.md mục 3):

| Variant | Dùng cho (ví dụ trong `getStatusBadgeVariant`) | Tailwind class | Hex tương đương |
|---|---|---|---|
| `success` (xanh lá) | ACTIVE, CONFIRMED, COMPLETED, SUCCESS | bg `green-100` / text `green-700` / ring `green-600` | bg `#DCFCE7` · text `#15803D` · ring `#16A34A` |
| `info` (xanh dương) | IN_PROGRESS, EXECUTING | bg `blue-100` / text `blue-700` / ring `blue-600` | bg `#DBEAFE` · text `#1D4ED8` · ring `#2563EB` |
| `warning` (vàng/cam) | PENDING, WAITING_FOR_DEPOSIT, RECORDED, SUSPENDED, LOCKED, MAINTENANCE | bg `yellow-100` / text `yellow-700` / ring `yellow-600` | bg `#FEF9C3` · text `#A16207` · ring `#CA8A04` |
| `error` (đỏ) | DEACTIVATED, CANCELLED, FAILED | bg `red-100` / text `red-700` / ring `red-600` | bg `#FEE2E2` · text `#B91C1C` · ring `#DC2626` |
| `neutral` (xám) | DRAFT, INACTIVE (mặc định khi không match) | bg `gray-100` / text `gray-700` / ring `gray-500` | bg `#F3F4F6` · text `#374151` · ring `#6B7280` |

Lưu ý: đây là **5 variant** (CLAUDE.md mục 3 mô tả tắt thành 4 màu xanh/vàng/đỏ/xám) — code có thêm
`info` (xanh dương, accent chính của hệ thống) riêng cho trạng thái "đang xử lý/đang thực hiện",
tách khỏi `warning` (vàng, "đang chờ"). Khi thiết kế badge mới, map đúng theo bảng trên, không tự
ý gộp `info` vào `warning`.

### Typography

- **Font**: Inter (`next/font/google`, `src/app/layout.tsx`) — không phải Geist mặc định của
  `create-next-app`. Subset `latin`, weight nạp sẵn: `400, 500, 600, 700`.
- **Áp dụng**: Inter được gán vào CSS var `--font-inter` trên `<html>`, rồi `globals.css` map
  `--font-sans: var(--font-inter)` trong block `@theme inline` → toàn bộ class `font-sans` mặc định
  của Tailwind (kể cả khi không khai báo gì) đã là Inter trên toàn site.
  Không cần thêm `font-["Inter"]` thủ công ở component.
- **Không có dark mode**: `globals.css` cố định `--background: #ffffff`, `--foreground: #171717`,
  có comment rõ "Hệ thống dùng nền sáng cố định cho vùng nội dung — không bật dark mode theo OS."
  Riêng `Sidebar` tối `#111827` là nền cố định riêng của sidebar, không phải theme toggle.
- **Hierarchy thực dùng trong code** (suy từ các trang ✅): tiêu đề trang ở mức `text-xl`/`text-2xl`
  `font-semibold`; số liệu KPI lớn dùng `text-2xl`–`text-3xl` `font-bold`; label phụ dưới KPI dùng
  `text-xs`/`text-sm` `text-gray-500`; badge luôn `text-xs font-medium` (xem class trong
  `Badge.tsx`: `text-xs font-medium`).

---

## Sidebar navigation — Admin

Nav cố định theo thứ tự (`src/components/layout/Sidebar.tsx`, `ADMIN_NAV`):

1. Tổng quan → `/admin/dashboard`
2. Danh mục → `/admin/catalog`
3. Kho → `/admin/inventory/stock-status`
4. Chính sách → `/admin/policies`
5. Audit đơn hàng → `/admin/orders_audit`
6. Báo cáo → `/admin/reports/revenue`
7. Người Dùng → `/admin/settings/users`

(Profile/đổi mật khẩu không có trong sidebar — vào qua avatar/menu ở topbar, không có trong code đã đọc.)

## Sidebar navigation — Manager

Nav cố định theo thứ tự (`MANAGER_NAV`):

1. Tổng quan → `/manager/dashboard`
2. Khách hàng → `/manager/customers`
3. Báo giá → `/manager/quotations`
4. Đơn hàng → `/manager/orders`
5. Khảo sát → `/manager/survey`
6. Lịch trình → `/manager/schedule/plans`
7. Tồn kho → `/manager/inventory/pick-lists`
8. Nhà cung cấp → `/manager/suppliers`
9. Mua sắm → `/manager/procurement`
10. Hiện trường → `/manager/field-ops/handovers`
11. Thanh toán → `/manager/payments/deposits`
12. Công & lương → `/manager/wages`

---

## 1. Auth

### `/` ⏳
- **Mục đích**: entry route, redirect ngay sang `/auth/login`.
- **UI chính**: không có UI (wrapper).
- **Luồng điều hướng**: vào app chưa đăng nhập → tự chuyển `/auth/login`.

### `/auth/login` ✅
- **Mục đích**: đăng nhập hệ thống bằng username/password, phân role sau khi login để route vào
  `/admin/dashboard` hoặc `/manager/dashboard`.
- **UI chính**: layout 2 cột (form bên trái, panel gradient trang trí bên phải); logo "BN"; `Input`
  (username, password), checkbox "Nhớ đăng nhập", `Button` primary "Đăng nhập", link "Quên mật khẩu",
  vùng thông báo lỗi, spinner loading trên nút khi submit.
- **Luồng điều hướng**: từ `/` → submit thành công → `/admin/dashboard` hoặc `/manager/dashboard`
  theo role; link phụ → `/auth/forgot-password`.

### `/auth/forgot-password` ✅
- **Mục đích**: yêu cầu khôi phục mật khẩu qua username.
- **UI chính**: card cố định 448px căn giữa màn hình; `Input` username, `Button` "Gửi yêu cầu"; 2
  state hiển thị: form nhập hoặc thông báo đã gửi thành công.
- **Luồng điều hướng**: vào từ link ở `/auth/login`; không có bước tiếp theo trong app (xử lý thật
  qua kênh ngoài hệ thống).

---

## 2. Admin

### `/admin/dashboard` ✅
- **Mục đích**: tổng quan quản trị — KPI tổng hợp, doanh thu, danh sách đơn hàng nổi bật.
- **UI chính**: tiêu đề trang; 3 `KPI Card` (đơn hàng đang hoạt động, doanh thu tháng này, công nợ
  NCC); grid 2 cột — trái: `RevenueChart` (biểu đồ doanh thu 12 tháng), phải: danh sách đơn hàng gần
  đây (mã, trạng thái dạng `Badge`, link).
- **Luồng điều hướng**: trang đích sau login (role Admin); link trong danh sách đơn hàng → tương lai
  sẽ trỏ tới trang chi tiết audit đơn hàng (`/admin/orders_audit/[id]`, hiện còn placeholder).

### `/admin/catalog` ✅
- **Mục đích**: CRUD danh mục thiết bị/dịch vụ (catalog item) — loại EQUIPMENT/SERVICE/MATERIAL/PACKAGE.
- **UI chính**: tiêu đề + 2 `Button` ("Quản lý danh mục" → `/admin/catalog/categories`, "Tạo thiết
  bị" mở modal); filter bar (tên, loại, trạng thái); `Table` + `Pagination`; modal tạo/sửa
  (`CatalogItemFormModal`) và modal xem chi tiết (`CatalogItemDetailModal`).
- **Luồng điều hướng**: từ sidebar "Danh mục"; nút "Quản lý danh mục" → `/admin/catalog/categories`;
  hành động trong bảng mở modal tại chỗ (không chuyển trang).

### `/admin/catalog/categories` ✅
- **Mục đích**: CRUD nhóm danh mục (category) dùng để gom catalog item.
- **UI chính**: tiêu đề + `Button` tạo danh mục; filter bar (tên, trạng thái) + nút làm mới; `Table`
  + `Pagination`; modal tạo/sửa (`CategoryFormModal`).
- **Luồng điều hướng**: vào từ `/admin/catalog`; click 1 dòng/nút xem → `/admin/catalog/categories/[id]`.

### `/admin/catalog/categories/[id]` ✅
- **Mục đích**: chi tiết 1 category + thống kê thiết bị thuộc category đó.
- **UI chính**: header có nút quay lại; grid 2 cột — trái: thông tin cơ bản category (mã, tên, mô tả,
  trạng thái, ngày tạo/cập nhật), phải: 4 `StatTile` (tổng/có sẵn/đang dùng/đang sửa); section danh
  sách thiết bị trong category kèm search; modal sửa (`CategoryFormModal`).
- **Luồng điều hướng**: vào từ `/admin/catalog/categories`; nút quay lại → về danh sách category.

### `/admin/inventory/stock-status` ✅
- **Mục đích**: theo dõi tồn kho chi tiết theo thiết bị (UC 2.13) — có sẵn/giữ chỗ/đang dùng/hỏng.
- **UI chính**: tiêu đề + 2 `Button` ("Thiết bị đang bảo trì" → `/admin/inventory/maintenance", "Thêm
  tồn kho" mở modal); filter theo thiết bị; `Table` + `Pagination`; modal xem chi tiết
  (`InventoryDetailModal`) và tạo/sửa (`InventoryFormModal`).
- **Luồng điều hướng**: từ sidebar "Kho"; nút "Thiết bị đang bảo trì" → `/admin/inventory/maintenance`.

### `/admin/inventory/maintenance` ✅
- **Mục đích**: danh sách thiết bị đang có số lượng hỏng (`damagedQuantity > 0`) cần bảo trì/sửa.
- **UI chính**: tiêu đề + search bar; `Table` (mã/tên thiết bị, số lượng hỏng, tổng số lượng, ngày
  cập nhật, `Badge` "Đang sửa chữa").
- **Luồng điều hướng**: vào từ nút trên `/admin/inventory/stock-status`; không có trang con.

### `/admin/settings/users` ✅
- **Mục đích**: quản lý tài khoản nhân sự nội bộ (Admin/Manager) — tạo, sửa, reset mật khẩu, vô hiệu
  hóa. (Leader/Technical Staff dùng app mobile riêng, không quản lý ở đây theo phạm vi web.)
- **UI chính**: tiêu đề + `Button` tạo người dùng; filter bar (tên/username, vai trò, trạng thái);
  `Table` + `Avatar` ở cột đầu + `Pagination`; 3 modal: `UserFormModal`, `ResetPasswordModal`,
  `UserDetailModal`.
- **Luồng điều hướng**: từ sidebar "Người Dùng"; toàn bộ hành động xử lý qua modal tại chỗ.

### `/admin/profile` ✅ / `/admin/profile/change-password` ✅
- **Mục đích**: xem/sửa hồ sơ cá nhân; đổi mật khẩu.
- **UI chính**: 2 tab "Thông tin" / "Bảo mật" dùng chung component `ProfileView` (tab Thông tin) và
  `SecurityView` (tab Bảo mật, có `Input` mật khẩu hiện tại/mới/xác nhận).
- **Luồng điều hướng**: vào qua avatar/menu ở topbar (không có entry trong sidebar); 2 route chia sẻ
  cùng khung 2-tab, chuyển tab tại chỗ không reload toàn trang.

### Placeholder — chỉ có tiêu đề + "Tính năng đang được phát triển" ⏳
| Route | Mục đích dự kiến | Vào từ |
|---|---|---|
| `/admin/policies` | Quản lý chính sách cọc/hoàn cọc/phí phát sinh/quy tắc lương | Sidebar "Chính sách" |
| `/admin/orders_audit` | Danh sách đơn hàng để Admin audit toàn bộ vòng đời | Sidebar "Audit đơn hàng" |
| `/admin/orders_audit/[id]` | Chi tiết audit 1 đơn hàng | Click dòng trong `/admin/orders_audit` |
| `/admin/reports/revenue` | Báo cáo doanh thu | Sidebar "Báo cáo" |
| `/admin/reports/orders` | Báo cáo đơn hàng | Điều hướng phụ trong khu Báo cáo |
| `/admin/reports/inventory` | Báo cáo tồn kho | Điều hướng phụ trong khu Báo cáo |
| `/admin/reports/debts` | Báo cáo công nợ NCC | Điều hướng phụ trong khu Báo cáo |
| `/admin/settings/roles` | Quản lý vai trò/quyền | Điều hướng phụ trong khu Settings (chưa có entry sidebar riêng) |
| `/admin/settings/system` | Cấu hình hệ thống | Điều hướng phụ trong khu Settings |

---

## 3. Manager

### `/manager/dashboard` ✅
- **Mục đích**: tổng quan vận hành hằng ngày — KPI, lịch trình, yêu cầu chờ duyệt, hoạt động gần đây,
  phân tích xu hướng.
- **UI chính**: lời chào + quick action; 4 `KPI Card`; grid 70/30 — trái: `ScheduleTimeline` + mini
  calendar, phải: danh sách `ApprovalCard` (yêu cầu chờ xử lý: change request, biên bản chờ Manager
  xác nhận...); `ActivityFeed` (order/CR/task hoàn thành); lưới phân tích 2x2 dùng `AnalyticsCard` +
  `LineChart`/`AreaChart`/`BarChart` (xu hướng đơn hàng, doanh thu, hiệu suất thiết bị, sự kiện sắp
  tới). Có animation Framer Motion khi load.
- **Luồng điều hướng**: trang đích sau login (role Manager); `ApprovalCard` → mở modal xác nhận hoặc
  trỏ tới trang chi tiết liên quan (đơn hàng/change request).

### `/manager/orders` ✅
- **Mục đích**: danh sách + lọc đơn hàng, xuất CSV.
- **UI chính**: tiêu đề + 4 `KPI Card` (tổng/xác nhận/đang thực hiện/hoàn thành); filter bar (từ
  ngày, đến ngày, trạng thái, nút xuất file); `Table` (avatar khách hàng, mã đơn dạng link, địa điểm,
  ngày tổ chức, `Badge` trạng thái) + `Pagination`.
- **Luồng điều hướng**: từ sidebar "Đơn hàng"; click mã đơn → `/manager/orders/[id]`; (nút tạo đơn nếu
  có → `/manager/orders/create`, hiện còn placeholder).

### `/manager/orders/[id]` ✅
- **Mục đích**: trung tâm chi tiết 1 đơn hàng — toàn bộ vòng đời từ tổng quan tới settlement.
- **UI chính**: `OrderDetailHeader` (mã đơn, tên khách hàng, `Badge` trạng thái); `OrderLifecycleStepper`
  (stepper vòng đời); `OrderTabs` với 5 tab:
  - **Tổng quan**: grid 2 cột — `EventOverviewCard` (địa điểm, ngày tổ chức, ghi chú) + `CustomerProfileCard`.
  - **Báo giá**: `FinalQuotation` (chi tiết items, tổng tiền).
  - **Thanh toán & Quyết toán**: `PaymentHistoryCard` + `SettlementSummaryCard` + `RequestPaymentModal`
    (tạo yêu cầu thanh toán/ghi nhận thanh toán).
  - **Khảo sát & Nhân sự**: `SurveyPersonnelTab` (phân công khảo sát/thi công, kết quả khảo sát).
  - **Lịch sử**: `OrderStatusHistoryTab` (mốc tạo đơn + trạng thái hiện tại).
  - ⚠️ Một số dữ liệu ở tab Thanh toán/Khảo sát hiện đang phải mock do backend còn thiếu endpoint GET
    tương ứng — xem `docs/more-require.md` nếu cần đối chiếu trước khi thiết kế thêm chi tiết phụ
    thuộc dữ liệu thật (ví dụ: lịch sử settlement, danh sách phân công đã giao, % tiến độ thi công).
- **Luồng điều hướng**: vào từ `/manager/orders` (click mã đơn); chuyển tab tại chỗ, không đổi route.

### `/manager/orders/create` ⏳
- **Mục đích dự kiến**: form tạo đơn hàng mới (request từ khách hàng).
- **Vào từ**: nút trên `/manager/orders`.

### `/manager/customers` ⏳ / `/manager/customers/[id]` ⏳
- **Mục đích dự kiến**: danh sách khách hàng; chi tiết 1 khách hàng (lịch sử đơn hàng, thông tin liên hệ).
- **Vào từ**: sidebar "Khách hàng"; click dòng → chi tiết.

### `/manager/suppliers` ⏳ / `/manager/suppliers/[id]` ⏳ / `/manager/suppliers/debts` ⏳
- **Mục đích dự kiến**: danh sách NCC; chi tiết 1 NCC; công nợ NCC tổng hợp.
- **Vào từ**: sidebar "Nhà cung cấp"; submenu/tab nội bộ cho phần công nợ.

### `/manager/quotations` ⏳ / `/manager/quotations/[id]` ⏳
- **Mục đích dự kiến**: danh sách báo giá (theo order); chi tiết 1 báo giá (items, versioning — lưu ý
  backend hiện chưa hỗ trợ nhiều version thật, xem `docs/more-require.md` mục (m)).
- **Vào từ**: sidebar "Báo giá"; cũng có thể liên kết từ tab "Báo giá" trong `/manager/orders/[id]`.

### `/manager/survey` ⏳
- **Mục đích dự kiến**: danh sách lịch khảo sát hiện trường cần phân công/theo dõi, tách biệt khỏi
  tab "Khảo sát & Nhân sự" theo từng order.
- **Vào từ**: sidebar "Khảo sát".

### `/manager/schedule/plans` ⏳ / `/manager/schedule/tasks` ⏳
- **Mục đích dự kiến**: Schedule Plan (kế hoạch tổng thể khảo sát/chuẩn bị/vận chuyển/thi công/thu
  hồi/hoàn kho) tách biệt với Work Task (giao việc cụ thể cho từng Staff).
- **Vào từ**: sidebar "Lịch trình" (trỏ thẳng tới `plans`); `tasks` là trang con/tab liên quan.

### `/manager/inventory/pick-lists` ⏳ / `/manager/inventory/returns` ⏳
- **Mục đích dự kiến**: pick-list xuất kho theo đơn; xác nhận xuất/nhận/hoàn kho.
- **Vào từ**: sidebar "Tồn kho" (trỏ thẳng `pick-lists`).

### `/manager/procurement` ⏳ / `/manager/procurement/confirmations` ⏳
- **Mục đích dự kiến**: đặt thuê/mua thiết bị từ NCC khi thiếu kho; xác nhận nhận/trả hàng NCC.
- **Vào từ**: sidebar "Mua sắm".

### `/manager/field-ops/handovers` ⏳ / `/manager/field-ops/change-requests` ⏳ / `/manager/field-ops/damage-loss` ⏳
- **Mục đích dự kiến**: xác nhận biên bản bàn giao/nghiệm thu; xử lý/phê duyệt change request hiện
  trường; xác nhận hỏng/mất thiết bị + tính đền bù. Đây là các hàng đợi "chờ Manager xác nhận" cho dữ
  liệu Leader Staff ghi nhận qua mobile (theo CLAUDE.md mục 1).
- **Vào từ**: sidebar "Hiện trường" (trỏ thẳng `handovers`); 2 route còn lại là tab/route con.

### `/manager/payments/deposits` ⏳ / `/manager/payments/settlements` ⏳ / `/manager/payments/transactions` ⏳
- **Mục đích dự kiến**: danh sách yêu cầu cọc cần xác nhận; danh sách settlement cần xác nhận; lịch
  sử toàn bộ giao dịch thanh toán (đối chiếu QR VNPay/tiền mặt/chuyển khoản).
- **Vào từ**: sidebar "Thanh toán" (trỏ thẳng `deposits`); liên quan chặt tới tab "Thanh toán & Quyết
  toán" trong `/manager/orders/[id]` (đây là dạng list tổng hợp toàn hệ thống, còn tab kia là theo
  từng order).

### `/manager/wages` ⏳
- **Mục đích dự kiến**: xác nhận tổng hợp công/lương Staff theo buổi cuối cùng (sau khi Leader Staff
  đã xác nhận điểm danh nhóm mình qua mobile) — bước thứ 3 trong chuỗi xác nhận 2 lớp theo CLAUDE.md.
- **Vào từ**: sidebar "Công & lương".

### `/manager/profile` ✅ / `/manager/profile/change-password` ✅
- **Mục đích / UI**: giống `/admin/profile` — `ProfileView` / `SecurityView` trong khung 2-tab.
- **Luồng điều hướng**: vào qua avatar/menu topbar (không có entry sidebar).

---

## Ghi chú cho công cụ thiết kế

- **18/46 route đã có UI thật** để tham chiếu style (liệt kê ✅ ở trên); **28/46 còn placeholder**
  — với các route ⏳, thiết kế phải tự generate theo design system (CLAUDE.md mục 3), không có layout
  cũ để "trích xuất".
- Pattern UI dùng lại xuyên suốt: `KPI Card` (số lớn + label + delta màu xanh/đỏ), `Table` + filter
  bar + `Pagination`, `Badge` pill theo trạng thái (xanh=hoàn thành, vàng=đang xử lý, đỏ=quá
  hạn/hủy, xám=nháp), modal form (`*FormModal`) cho create/edit, modal chi tiết (`*DetailModal`) cho
  xem nhanh không rời trang.
- Hàng đợi "chờ Manager xác nhận" là một pattern nghiệp vụ riêng (không chỉ CRUD thường) xuất hiện ở
  `field-ops/*`, `payments/*`, dashboard `ApprovalCard` — nên thiết kế nhất quán 1 dạng list/card cho
  toàn bộ các hàng đợi này.
