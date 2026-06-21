@AGENTS.md

# BNWEMS Web Frontend — Hướng dẫn cho Claude

## 1. Tổng quan dự án

**BNWEMS (Binh Nguyen Wedding Event Management System)** là hệ thống quản lý nội bộ cho doanh nghiệp dịch vụ cưới hỏi/sự kiện **Bình Nguyên**, số hóa toàn bộ quy trình vận hành: từ tiếp nhận yêu cầu khách hàng → khảo sát → báo giá → đặt cọc → khóa tồn kho → điều phối nhân sự → xuất kho → thi công → nghiệm thu → thu hồi → quyết toán → hoàn kho → tính công Staff → theo dõi công nợ Supplier.

Đây là phần mềm quản trị nội bộ (back-office), **không phải** website public cho khách hàng cuối — ưu tiên hiệu năng nhập liệu, mật độ thông tin hợp lý và độ chính xác số liệu hơn là yếu tố marketing.

> Tài liệu nghiệp vụ đầy đủ (use case, ERD, database, Gantt): [Google Doc dự án](https://docs.google.com/document/d/1UYUB5pETgvW0TIbZW9RlYGfz-0uM-kWIbiiPNJpvVgw/edit). Tóm tắt phần liên quan tới frontend ở dưới — khi cần chi tiết quy tắc nghiệp vụ chưa có ở đây, tra lại doc gốc trước khi giả định.

### Phạm vi nghiệp vụ (module chính)
- Quản lý tài khoản & phân quyền (RBAC)
- Master data: dịch vụ, thiết bị (catalog), kho, Supplier, bảng giá, chính sách cọc/hoàn cọc/phí phát sinh, quy tắc tiền công
- Khách hàng & vòng đời Order
- Khảo sát hiện trường (Survey), Báo giá (Quotation, có versioning)
- Thanh toán: tạo yêu cầu cọc → sinh QR thanh toán qua VNPay hoặc khách trả tiền mặt/chuyển khoản (Leader Staff có thể ghi nhận chứng từ thanh toán tại hiện trường) → Manager xác nhận cọc/thanh toán cuối; settlement cuối cũng có thể được Leader Staff ghi nhận tại hiện trường trước khi Manager xác nhận.
- Tồn kho theo ngày (Date-based Inventory Lock) — tính theo **loại + số lượng**, không theo serial/item riêng lẻ
- Giao dịch Supplier (thuê/mua thiết bị, công nợ, đền bù thiếu/hỏng)
- Điều phối nhân sự & phương tiện: **Schedule Plan** (kế hoạch tổng thể cho khảo sát/chuẩn bị/vận chuyển/thi công/thu hồi/hoàn kho) tách biệt với **Work Task** (giao việc cụ thể cho từng Staff); Pick-list xuất kho.
- Vận hành hiện trường: vận chuyển, thi công, Change Request (thêm/bớt/đổi thiết bị), nghiệm thu/bàn giao, ghi nhận hỏng/mất
- Settlement (quyết toán cuối) & đóng Order; hoàn kho & trả Supplier
- Chấm công (Attendance) & tính tiền công Staff theo buổi
- Audit log, Evidence file (ảnh minh chứng), Notification; Dashboard/báo cáo: **Operational Dashboard** (Manager — trạng thái order/task/thanh toán/kho/vấn đề vận hành) tách biệt với **Administrative Dashboard + Revenue/Order/Inventory Reports** (Admin — audit-oriented).

### Vai trò & phân quyền
Hệ thống có 4 role; **web frontend (repo này) chỉ phục vụ Admin và Manager** — Leader Staff và Technical Staff dùng app mobile riêng, không thuộc phạm vi repo này nhưng vẫn cần hiểu để dữ liệu hiển thị đúng (vd: tiến độ task do Leader/Technical Staff thực hiện).

- **Admin** (Web only): quyền cao nhất nhưng **không xử lý vận hành hằng ngày**. Chỉ quản lý master data, cấu hình hệ thống/chính sách, phân quyền, xem & audit toàn bộ dữ liệu sau vận hành. Admin **không** trực tiếp ghi nhận cọc/thanh toán, phê duyệt change request, xác nhận hoàn kho hay đóng order — ranh giới này phải tôn trọng khi thiết kế UI/permission gating.
- **Manager** (Web + Mobile): vai trò vận hành chính, chịu trách nhiệm toàn bộ vòng đời Order — tạo order, khảo sát, báo giá, ghi nhận cọc/thanh toán, phân công nhân sự, làm việc với Supplier, phê duyệt Change Request, xác nhận biên bản/hỏng-mất/settlement/hoàn kho, đóng order, xử lý tranh chấp. Phần lớn dữ liệu hiện trường (khảo sát, xuất/nhận/trả kho nội bộ và Supplier, biên bản bàn giao, hỏng/mất, settlement, chứng từ thanh toán tại hiện trường) do **Leader Staff (mobile) ghi nhận trước, Manager chỉ xác nhận (confirm) trên web** — khi thiết kế UI Manager cần có hàng đợi/badge "chờ xác nhận" theo từng loại biên bản.
- *(Ngoài phạm vi web)* Leader Staff (Mobile, điều phối hiện trường) và Technical Staff (Mobile, chỉ thực hiện task được giao).
- **Customer và Supplier không có tài khoản đăng nhập** — chỉ là dữ liệu được quản lý; giao tiếp với họ diễn ra ngoài hệ thống (gọi điện, Zalo, Messenger), hệ thống không có cổng khách hàng hay chữ ký điện tử.

### Vòng đời Order (state machine quan trọng nhất)
Request → Survey → (đặt thêm Supplier nếu thiếu kho) → Quotation cuối + yêu cầu cọc → xác nhận cọc + khóa inventory theo ngày (`INVENTORY_LOCKED`) → điều phối nhân sự/phương tiện → xuất kho & nhận hàng Supplier → vận chuyển → thi công + xử lý Change Request → nghiệm thu/bàn giao → thu hồi & kiểm đếm (hỏng/mất) → phụ phí + settlement cuối → hoàn kho + trả Supplier → Manager đóng order (`COMPLETED`) → Admin audit.

Tên trạng thái Order đã chuẩn hóa trong doc gốc (dùng làm enum khi code, ví dụ): `REQUEST_SUBMITTED`, `SURVEY_*`, `SUPPLIER_REQUIRED/RECORDED`, `FINAL_QUOTATION_CREATED`, `WAITING_FOR_DEPOSIT`, `DEPOSIT_PAID`, `CONFIRMED`, `INVENTORY_LOCKED`, `DATE_CHANGE_*`, `CANCELLED`, `REFUND_*`, `ASSIGNED`, `PREPARING`, `CHECKED_OUT`, `IN_TRANSIT`, `ARRIVED_AT_SITE`, `EXECUTING`, `CHANGE_*`, `HANDOVER_*`, `EVENT_HAPPENING`, `COLLECTING`, `DAMAGE_REPORT_*`, `SETTLEMENT_*`, `FINAL_PAYMENT_*`, `PARTIALLY_PAID`, `SUPPLIER_ITEMS_RETURNED/DAMAGED_OR_LOST`, `PENDING_ORDER_CLOSURE`, `CLOSURE_*`, `COMPLETED`, `AUDIT_*`, `WAGE_*`, `SUPPLIER_DEBT_*`. Trạng thái Inventory: `Available`, `Reserved`, `Checked-out`, `In-use`, `Returned Pending Approval`, `Maintenance`, `Damaged`, `Lost`, `Removed from Available Inventory`.

### Quy tắc nghiệp vụ cốt lõi (áp dụng đúng khi build tính năng/tính toán liên quan)
- **Đổi ngày**: miễn phí nếu yêu cầu trước >3 ngày so với ngày lắp đặt.
- **Hủy đơn — hoàn cọc**: ≥30 ngày trước → hoàn 100%; 7–30 ngày → hoàn 50%; <7 ngày → không hoàn.
- **Bớt thiết bị tại hiện trường**: trừ 100% giá trị thiết bị bị bớt khỏi hóa đơn.
- **Thay thiết bị**: `Tổng hóa đơn mới = cũ - giá thiết bị cũ + giá thiết bị mới`.
- **Thêm thiết bị tại hiện trường**: chỉ kiểm tra kho nội bộ (không liên hệ Supplier ở giai đoạn thi công); phụ phí vận chuyển nếu khoảng cách kho → địa điểm > 2km.
- **Đền bù thiết bị hỏng/mất**: `Số tiền = Giá mua thiết bị × Số lượng hỏng/mất` (tính theo giá mua, không theo giá thuê/bán).
- **Đền bù Supplier** (đồ thuê ngoài thiếu/hỏng): theo đơn giá mua của Supplier.
- **Tiền công Staff**: tính theo **buổi** (không theo giờ, không phụ cấp ngoài giờ); Leader Staff > Technical Staff; tổng hợp & trả cuối tháng; khấu trừ do hỏng/mất trừ trực tiếp vào lương tháng đó. **Chấm công xác nhận qua 2 lớp trước khi tính lương**: Technical Staff tự check-in → Leader Staff xác nhận điểm danh & hoàn thành việc của Technical Staff trong nhóm mình phụ trách → Manager xác nhận tổng hợp công/lương cuối cùng.
- Mọi biên bản (bàn giao, hỏng/mất, settlement) đều cần **Manager xác nhận trên hệ thống** trước khi gửi Customer qua kênh ngoài hệ thống — không có bước tự động hóa hay chữ ký điện tử.
- **Xóa draft**: Quotation và Supplier Rental/Purchase Order chỉ được xóa khi còn ở trạng thái draft (chưa confirm, chưa gắn Order/Supplier debt active); sau khi confirm/liên kết dữ liệu thì không xóa được nữa, chỉ cập nhật hoặc đổi trạng thái. ⚠️ `docs/api/08-quotations.md` và `docs/api/04-suppliers.md` hiện **chưa có endpoint DELETE** tương ứng — cần đồng bộ lại doc API/backend trước khi build chức năng xóa trên UI.

### Giới hạn / Out of scope đáng chú ý
Không có Customer/Supplier self-service portal; không chữ ký điện tử; không tự động đối soát ngân hàng; không AI khảo sát/thiết kế tự động; không tối ưu lịch/tuyến tự động; không RFID/IoT; không phải hệ thống kế toán/payroll đầy đủ; không BI/dự báo nâng cao. Mọi cột mốc quan trọng cần xác nhận thủ công bởi Manager (không tự động hóa).

### Pattern dữ liệu cần tái sử dụng
Backend dùng nhiều polymorphic relationship — `evidence_attachments (entity_type, entity_id)` dùng chung cho mọi loại ảnh minh chứng, `inventory_transactions (reference_type, reference_id)` dùng chung cho mọi biến động kho. Khi thiết kế type/UI cho file đính kèm hoặc lịch sử biến động kho, theo cùng pattern entity_type/entity_id thay vì tạo field riêng cho từng loại.

## 2. Đây là dự án dùng Next.js

- **Next.js 16 (App Router)** + **TypeScript** + **TailwindCSS v4** + **Axios** (JWT interceptor).
- State: React Context (`AuthContext`, `PermissionContext`).
- Cấu trúc thư mục chi tiết: xem [README.md](README.md).
- ⚠️ Next.js 16 có breaking changes so với kiến thức huấn luyện — luôn đọc `node_modules/next/dist/docs/` trước khi dùng API mới (đã ghi rõ trong `AGENTS.md`, được import ở đầu file này — không xóa khối đó).
- Phân khu theo vai trò bằng path segment thật (không phải route group): `auth/` (`/auth/...`), `admin/` (`/admin/...`), `manager/` (`/manager/...`). Không trộn UI/logic giữa hai role trừ khi dùng component dùng chung trong `components/`.

### Quy ước API (bắt buộc — nguồn chuẩn: `docs/api/`)

**Toàn bộ API của website phải tuân theo doc API tại [`docs/api/`](docs/api/)** (đã copy từ repo [Trintrin0408/Context](https://github.com/Trintrin0408/Context.git), branch `feature/fix-api_v1`, thư mục `docs/api/`). Khi viết/sửa bất kỳ `services/*.service.ts`, mở file module tương ứng trong `docs/api/` trước — **không tự suy diễn endpoint, field hay status code nếu chưa có trong doc**; nếu thiếu thông tin thì hỏi lại thay vì tự bịa.

Mục lục module (file → nghiệp vụ):

| File | Nghiệp vụ |
|---|---|
| [01-auth.md](docs/api/01-auth.md) | Xác thực, hồ sơ, thông báo |
| [02-users-roles.md](docs/api/02-users-roles.md) | Người dùng, vai trò, quyền |
| [03-catalog.md](docs/api/03-catalog.md) | Danh mục thiết bị/dịch vụ + giá |
| [04-suppliers.md](docs/api/04-suppliers.md) | Nhà cung cấp + công nợ NCC |
| [05-warehouse-inventory.md](docs/api/05-warehouse-inventory.md) | Kho + tồn kho + xuất/hoàn trả |
| [06-policies-wage.md](docs/api/06-policies-wage.md) | Chính sách + quy tắc lương |
| [07-customers.md](docs/api/07-customers.md) | Khách hàng |
| [08-quotations.md](docs/api/08-quotations.md) | Báo giá |
| [09-orders.md](docs/api/09-orders.md) | Đơn hàng (vòng đời) + dashboard vận hành |
| [10-survey-assignment.md](docs/api/10-survey-assignment.md) | Khảo sát + phân công + giám sát vận hành |
| [11-payments-settlement.md](docs/api/11-payments-settlement.md) | Thanh toán + quyết toán |
| [12-mobile-field-ops.md](docs/api/12-mobile-field-ops.md) | App mobile (Leader/Tech) — không thuộc phạm vi web nhưng cần biết để hiển thị đúng dữ liệu |
| [13-reports.md](docs/api/13-reports.md) | Báo cáo + dashboard quản trị |

Quy ước chung áp dụng cho **mọi** endpoint (chi tiết: [docs/api/README.md](docs/api/README.md)):

- Base URL: `/api/v1`. JSON, UTF-8.
- Auth: `POST /auth/login` trả 1 JWT (hạn ~7 ngày, **không có refresh token**); mọi request cần đăng nhập gắn `Authorization: Bearer <token>`. Logout = client tự xóa token. Thiếu quyền → `403`.
- Envelope thành công: `{ success: true, code: "MSG-XX-NN", message, data }`.
- Envelope lỗi: `{ success: false, code, message, errors?: [{ field, message }] }` (`errors` chỉ có khi lỗi validation theo field).
- List/pagination: `data` là mảng + `meta: { page, limit, total, total_pages }`; query chuẩn `?page=&limit=&search=&sort_by=&sort_order=`.
- HTTP status: `200` GET/PUT/PATCH OK · `201` POST tạo mới · `400` sai input · `401` chưa đăng nhập/token sai · `403` sai quyền · `404` không tìm thấy · `409` xung đột nghiệp vụ · `500` lỗi server.
- **Không có method `DELETE`** — hệ thống không hard-delete, mọi vô hiệu hóa/xóa dùng `PATCH .../status` (soft delete).
- Ngày: `YYYY-MM-DD`; thời gian: ISO-8601 UTC; tiền: kiểu `number`, đơn vị VNĐ.
- Mã `code` theo prefix module: `MSG-AU` Auth · `MSG-US` User/Role · `MSG-CT` Catalog · `MSG-SP` Supplier · `MSG-WH` Warehouse · `MSG-PO` Policy · `MSG-CU` Customer · `MSG-QO` Quotation · `MSG-CO` Order · `MSG-SV` Survey/Assignment · `MSG-PM` Payment/Settlement · `MSG-MO` Mobile · `MSG-RP` Report.

## 3. Quy tắc thiết kế

Phong cách tham chiếu: dashboard quản trị tối giản, hiện đại, chuyên nghiệp (kiểu "Bliss Network" trong ảnh mẫu). Mọi UI mới phải tuân theo hệ thống dưới đây để toàn site đồng nhất.

### Layout tổng thể
- **Sidebar trái cố định, nền tối** (slate/navy đậm, ví dụ `slate-900` / `#0F172A`), chữ và icon màu xám sáng/trắng, item active có nền highlight nhạt + viền/indicator màu accent.
- **Vùng nội dung chính nền sáng** (trắng hoặc `slate-50`), tương phản rõ với sidebar.
- **Topbar/header** mỏng, gọn: search, notification, avatar + tên người dùng ở góc phải.
- Bố cục dạng **card** trên nền content: mỗi khối thông tin (KPI, bảng, chart) là một card nền trắng, `rounded-xl`, shadow rất nhẹ, padding thoáng — tránh viền cứng (border) nặng.

### Màu sắc
- **Accent chính: xanh blue** (`blue-600`/`#2563EB`) cho nút primary, link, biểu đồ chính.
- **Màu trạng thái (status badge)** dùng nhất quán toàn site:
  - Xanh lá (`green-500/600`) = hoàn thành / thành công / đã thanh toán
  - Vàng/cam (`amber-500`) = đang chờ / đang xử lý
  - Đỏ (`red-500`) = quá hạn / hủy / lỗi
  - Xám (`slate-400`) = nháp / không hoạt động
- Badge dạng pill nhỏ, nền màu nhạt (10–15% opacity) + chữ màu đậm cùng tông, không dùng màu nền đặc gắt.

### Typography & Component
- Font sans-serif hệ thống/Inter, hierarchy rõ: số liệu KPI lớn-đậm, label phụ nhỏ-xám.
- **KPI Card**: số liệu lớn ở trên, label mô tả dưới, có thể kèm icon hoặc % thay đổi (màu xanh/đỏ theo chiều tăng giảm).
- **Table**: hàng gọn, có avatar/icon nhận diện ở cột đầu khi liên quan đến người (khách hàng, nhân viên), cột trạng thái dùng badge, có pagination ở cuối, hỗ trợ search + filter phía trên bảng.
- **Button primary**: nền xanh, chữ trắng, `rounded-md`/`rounded-lg`, không dùng gradient cầu kỳ.
- **Modal/Form**: tối giản, label rõ, khoảng trắng thoáng, không nhồi nhét nhiều trường trên một dòng.
- Hạn chế trang trí thừa (gradient, shadow đậm, animation phô trương) — giữ cảm giác **gọn, chuyên nghiệp, đáng tin cậy** vì đây là phần mềm quản lý tài chính/vận hành thật.

### Responsive
- Một số luồng (ví dụ check-in QR tại tiệc cưới) cần tối ưu cho **mobile/tablet** — giao diện đơn giản hơn, tập trung 1 hành động chính (quét QR, xác nhận check-in).

> Khi tạo component UI mới, ưu tiên tái sử dụng từ `components/ui/` (`Button`, `Table`, `Badge`, `Modal`...) đã liệt kê trong README trước khi viết mới.

## 4. Quy tắc bắt buộc

- **Không** tự ý đổi cấu trúc thư mục đã định nghĩa trong README mà không hỏi trước.
- Mọi gọi API phải đi qua lớp `services/*.service.ts`, không gọi `axios`/`fetch` trực tiếp trong component/page.
- Mọi endpoint, request/response shape, mã lỗi phải đúng theo [`docs/api/`](docs/api/) (mục 2). Nếu doc API thay đổi (cập nhật lại từ repo gốc), đồng bộ lại `docs/api/` và rà soát các `service.ts` liên quan.
- Type rõ ràng cho mọi dữ liệu domain trong `types/`; không dùng `any` trừ khi không thể tránh.
- Phân quyền theo vai trò (Admin/Manager) phải kiểm tra qua `PermissionContext`/`usePermission`, không hardcode điều kiện role rời rạc trong UI.
- Định dạng tiền tệ và ngày giờ luôn qua `utils/formatCurrency.ts` và `utils/formatDate.ts`, không format thủ công.
- Không thêm thư viện UI/CSS framework mới (ngoài Tailwind) nếu chưa thống nhất với người dùng.
- Viết test cho service và hook quan trọng (đặt trong `__tests__/`) khi thêm logic nghiệp vụ mới.
- **Sau mỗi thay đổi UI lớn**: chụp screenshot màn hình vừa sửa và so sánh với ảnh design gốc (mục 3) trước khi báo là hoàn tất; nêu rõ điểm còn lệch nếu có.
- **Website phải mobile-friendly**: mọi trang (không chỉ luồng check-in) đều phải responsive tốt trên mobile/tablet, không riêng desktop.
- **Mọi section phải có animation khi scroll** (scroll-reveal khi section xuất hiện trong viewport): dùng thống nhất một thư viện animation cho toàn site (vd. Framer Motion), animation tinh tế/nhanh (không lặp lại quá đà), giữ đúng tinh thần tối giản ở mục 3 — tránh hiệu ứng nặng làm chậm trang hoặc gây rối mắt cho dashboard nhiều số liệu.

## 5. Workflow

- Trước khi code: xác nhận lại phạm vi thay đổi nếu yêu cầu chưa rõ ràng (đặc biệt với màn hình tài chính/công nợ — sai số liệu ảnh hưởng nghiệp vụ thật).
- Khi thêm màn hình mới: tham chiếu phong cách ở mục 3, tái dùng component có sẵn trước khi tạo mới.
- Chạy `npm run test` trước khi coi một thay đổi logic là hoàn tất.
- Không tự ý commit/push — chỉ thực hiện khi được yêu cầu rõ ràng.
