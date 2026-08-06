# Checklist tính năng Manager & Staff

Danh sách tính năng chính cho actor **Manager** (Web + Mobile) và **Staff** (Mobile — chức vụ Leader hoặc Technical tùy dự án gán), tổng hợp từ CLAUDE.md và đối chiếu prototype `docs/bnwems-manager-portal/`. Dùng để theo dõi tiến độ khi dựng route `src/app/manager/`.

> **Trạng thái hiện tại**: đã dựng khung `src/app/manager/` với route guard (`ProtectedRoute requiredRole="Manager"`, áp ở `src/app/manager/layout.tsx` nên mọi route con — kể cả các route mới thêm — tự động được bảo vệ) + Sidebar/Header riêng. Các trang có nội dung admin tương ứng được **mirror 1:1 từ giao diện `admin/`** (dùng chung mock/component, chỉ đổi tiền tố route); các trang không có admin tương ứng để mirror (Work Task, Pick-list xuất kho, Vận hành hiện trường) được dựng mới theo đúng hệ thống thiết kế mục 3 CLAUDE.md + quy tắc nghiệp vụ mục 1 (change request, đóng order...). Toàn bộ vẫn là giao diện thuần theo mục 0 CLAUDE.md, chưa nối API thật.
>
> ⚠️ **Ngoài phạm vi dự án**: Chấm công (Attendance) & tính lương Staff **không được phát triển** trong hệ thống này — không tạo route/tính năng cho mục này, kể cả các quy tắc liên quan (tính công theo buổi, khấu trừ hỏng/mất vào lương...) chỉ mang tính tham khảo nghiệp vụ, không cần build.

## Ranh giới vai trò cần nhớ khi thiết kế

- Manager là actor vận hành chính — khác Admin (chỉ quản lý master data/cấu hình, không đụng vận hành hằng ngày, không xử lý cọc/thanh toán/change request/hoàn kho/đóng order).
- Nhiều dữ liệu hiện trường (khảo sát, xuất/nhận kho, biên bản bàn giao, hỏng/mất, settlement, chứng từ thanh toán tại hiện trường) do **Leader Staff (mobile) ghi nhận trước — Manager chỉ xác nhận (confirm) trên web**. UI Manager cần có khái niệm "hàng đợi chờ xác nhận" theo từng loại biên bản, không chỉ CRUD thường.

## Checklist theo vòng đời Order

- [x]  **Dashboard vận hành** — trạng thái order/task/thanh toán/kho/vấn đề đang chờ xử lý (khác Administrative Dashboard của Admin, thiên về audit) — `manager/dashboard`, gồm khối "Hàng đợi chờ xác nhận" riêng cho Manager
- [x]  **Khách hàng** — hồ sơ, lịch sử đặt — `manager/customers` (+ trang chi tiết)
- [x]  **Khảo sát hiện trường (Survey)** — `manager/survey`
  - [x]  Phân công khảo sát
  - [x]  Xem/duyệt báo cáo khảo sát Leader Staff nộp
- [x]  **Báo giá (Quotation)** — `manager/quotations` (+ trang chi tiết)
  - [x]  Tạo/sửa báo giá, versioning
  - [x]  Đối chiếu số liệu khảo sát thực tế vs báo giá nháp
- [x]  **Thanh toán cọc** — `manager/payments/deposits` (+ trang chi tiết)
  - [x]  Tạo yêu cầu cọc, sinh QR thanh toán (VNPay)
  - [x]  Xác nhận cọc tiền mặt/chuyển khoản do Leader Staff ghi tại hiện trường
- [x]  **Khóa tồn kho theo ngày** (Date-based Inventory Lock) sau khi cọc được xác nhận — tính theo loại + số lượng — `manager/inventory/stock-check` (mô phỏng theo ngày chọn)
- [x]  **Điều phối nhân sự & phương tiện**
  - [x]  Schedule Plan — kế hoạch tổng thể (khảo sát/chuẩn bị/vận chuyển/thi công/thu hồi/hoàn kho) — `manager/schedule/plans`
  - [x]  Work Task — giao việc cụ thể cho từng Staff — `manager/schedule/tasks` (gộp phẳng toàn bộ công việc kỹ thuật từ mọi kế hoạch, filter theo trạng thái/người phụ trách, tái phân công)
- [x]  **Kho & Supplier**
  - [x]  Pick-list xuất kho — `manager/inventory/picklists` (theo dõi tiến độ chuẩn bị theo đơn, đánh dấu đã xuất kho; admin chưa có màn hình tương ứng nên dựng mới, tái dùng dữ liệu items/preparedQty đã có)
  - [x]  Đặt thuê/mua Supplier khi thiếu kho nội bộ — `manager/suppliers/purchase-orders` (mirror admin, loại đơn RENT/PURCHASE)
  - [x]  Theo dõi công nợ Supplier — `manager/suppliers`
- [x]  **Vận hành hiện trường** — admin chưa có màn hình tương ứng để mirror nên dựng mới theo mục 1/3 CLAUDE.md
  - [x]  Theo dõi vận chuyển, thi công — `manager/field-ops/progress`
  - [x]  Xử lý Change Request (thêm/bớt/đổi thiết bị tại hiện trường) — `manager/field-ops/change-requests` (duyệt/từ chối, tự tính lại số tiền thay đổi hóa đơn đúng công thức mục 1 CLAUDE.md)
- [x]  **Nghiệm thu/bàn giao** — xác nhận biên bản do Leader Staff lập — `manager/field-ops/handovers` (hàng đợi chờ xác nhận, thay placeholder cũ)
- [x]  **Thu hồi & kiểm đếm** — ghi nhận hỏng/mất — `manager/inventory/returns` (+ trang chi tiết, mirror admin)
- [x]  **Settlement cuối kỳ** — phụ phí phát sinh, quyết toán (có thể do Leader Staff ghi tại hiện trường trước, Manager xác nhận) — tab "Quyết toán cuối kỳ" trong `manager/payments/deposits/[id]`
- [x]  **Hoàn kho & trả Supplier** — hoàn kho nội bộ trong `manager/inventory/returns/[id]`; trả thiết bị thuê ngoài cho NCC ở `manager/suppliers/returns` (mirror admin)
- [x]  **Đóng Order** — nút "Đóng đơn hàng" (Mốc 6) trong tab "Vòng đời vận hành" của `manager/orders/[id]`, chỉ bật khi đơn đã COMPLETED + đã thanh toán đủ; khóa chỉnh sửa/đổi trạng thái sau khi đóng
- [x]  **Xử lý tranh chấp** với khách hàng (giao tiếp ngoài hệ thống, chỉ ghi log nội bộ) — tab "Tranh chấp" trong `manager/orders/[id]`

## Checklist tính năng Staff (Mobile — ngoài phạm vi code repo web này)

> Staff dùng app mobile riêng, **không thuộc phạm vi code của repo web này** — liệt kê ở đây để đối chiếu khi thiết kế "hàng đợi chờ xác nhận" phía Manager cho khớp nghiệp vụ. Chức vụ Leader **kế thừa toàn bộ tính năng Technical Staff** rồi cộng thêm quyền điều phối.
>
> **Cập nhật**: đã dựng dự án riêng `bnwems-staff-frontend` (ngang hàng `bnwems-web-frontend` trong `SEP490-FRONTEND-WEB/`) làm UI cho Staff, có Route Guard theo vai trò (`Leader Staff`/`Technical Staff`). Tiến độ bên dưới đối chiếu với dự án đó — giao diện thuần + mock data, chưa nối API thật. Dự án này còn có màn "Chấm công" cá nhân (check-in/check-out riêng ở `/staff/attendance`) — tính năng này nằm **ngoài phạm vi checklist** (mâu thuẫn với cảnh báo "không phát triển Attendance" ở đầu file), nên **không tính vào tiến độ tích ở đây**. Việc "Leader xác nhận Technical Staff hoàn thành task" bên dưới **đã được refactor tách khỏi khái niệm chấm công** — xem chi tiết ở mục tương ứng.

### Technical Staff (chức vụ thường — chỉ thực hiện task được giao)

- [x]  Xem danh sách Work Task được giao (lịch làm việc cá nhân) — `bnwems-staff-frontend`: `/staff/dashboard` (việc hôm nay), `/staff/tasks` (toàn bộ)
- [x]  Xem chi tiết task: địa điểm, thời gian, thiết bị/hạng mục liên quan, ghi chú từ Manager — `/staff/tasks/[id]` (mục "Thiết bị / hạng mục liên quan" liệt kê tên + số lượng + đơn vị theo mock)
- [x]  Cập nhật trạng thái thực hiện task (đang làm / hoàn thành) — nút "Bắt đầu công việc" / "Hoàn thành công việc" trong `/staff/tasks/[id]`
- [x]  Tải lên ảnh minh chứng (evidence) khi thực hiện task — mục "Ảnh minh chứng" trong `/staff/tasks/[id]` (chọn nhiều ảnh, xem thumbnail, xóa ảnh); ảnh chỉ lưu tạm phía client (object URL) trong phiên làm việc, **chưa nối lưu trữ thật**

### Leader Staff (điều phối hiện trường — thêm quyền so với Technical Staff)

- [x]  Xem & điều phối toàn bộ Work Task của nhóm Technical Staff phụ trách — `/staff/team` (mới): gộp toàn bộ Work Task từ mọi task mà tài khoản đang đăng nhập giữ vai trò trưởng nhóm (`isLeaderForCurrentUser`), nhóm theo từng Technical Staff, mỗi việc liên kết sang `/staff/tasks/[id]` để xem chi tiết/xác nhận
- [x]  Xác nhận Technical Staff trong nhóm đã hoàn thành task được giao *(chỉ xác nhận công việc — không phải điểm danh/chấm công)* — đã refactor `/staff/tasks/[id]`: bỏ hẳn mô hình chấm công 3 trạng thái, thay bằng `completionStatus` nhị phân "Chưa hoàn thành/Đã hoàn thành" đúng tinh thần mục này; màn Chấm công cá nhân ở `/staff/attendance` giữ nguyên tách biệt, không liên quan đến xác nhận này
- [x]  Ghi nhận báo cáo khảo sát hiện trường (Survey report) làm căn cứ lập báo giá — mục "Báo cáo khảo sát hiện trường" trong `/staff/tasks/[id]` cho task loại `survey` (khoảng cách kho→địa điểm, tình trạng mặt bằng, danh sách hạng mục đề xuất tự thêm/xóa, ghi chú); có cả trạng thái đã nộp (xem lại/cập nhật) và form trống để nộp mới
- [x]  Ghi nhận xuất/nhận/trả kho nội bộ và Supplier tại hiện trường — mục "Xuất kho tại hiện trường" (task loại `transport`) / "Trả kho tại hiện trường" (task loại `retrieval`) trong `/staff/tasks/[id]`: chọn nguồn Kho nội bộ hoặc Supplier (kèm tên NCC), danh sách thiết bị prefill từ "Thiết bị/hạng mục liên quan" của task, tự thêm/xóa dòng
- [x]  Ghi nhận biên bản nghiệm thu/bàn giao với khách hàng — mục "Biên bản nghiệm thu / bàn giao" trong `/staff/tasks/[id]`, xuất hiện khi task loại `installation` đã chuyển trạng thái "Hoàn thành" (người đại diện khách hàng, khách hàng có hài lòng không, ghi chú)
- [x]  Ghi nhận hỏng/mất thiết bị khi thu hồi — mục "Hỏng/mất thiết bị khi thu hồi" trong `/staff/tasks/[id]` cho task loại `retrieval`: từng dòng nhập SL hỏng/SL mất/đơn vị/giá mua, tự tính đền bù theo đúng công thức mục 1 CLAUDE.md (`Giá mua × Số lượng hỏng/mất`), tổng đền bù cập nhật realtime
- [x]  Ghi nhận chứng từ thanh toán tại hiện trường (cọc hoặc quyết toán cuối) — mục "Ghi nhận thanh toán cọc" (task loại `survey`) / "Ghi nhận thanh toán quyết toán cuối" (task loại `retrieval`) trong `/staff/tasks/[id]`: phương thức Tiền mặt/Chuyển khoản, số tiền, ghi chú
- [x]  Ghi nhận settlement tại hiện trường (trước khi Manager xác nhận trên web) — mục "Quyết toán cuối kỳ tại hiện trường" trong `/staff/tasks/[id]` cho task loại `retrieval`: danh sách phụ phí phát sinh tự thêm/xóa (mô tả + số tiền), tổng phụ phí cập nhật realtime

> ⚠️ Mọi mục Leader Staff ghi nhận ở trên đều chỉ là bước "ghi nhận tại hiện trường" — Manager luôn phải xác nhận (confirm) lại trên web trước khi coi là chính thức (đã liệt kê tương ứng ở phần checklist Manager). Đã loại bỏ hoàn toàn điểm danh/chấm công/tính lương theo đúng lưu ý ngoài phạm vi dự án ở đầu file.

## Tham khảo

- Prototype UI: `docs/bnwems-manager-portal/` (mock layout/luồng thao tác, KHÔNG dùng làm nguồn field/logic nghiệp vụ thật)
- Quy tắc nghiệp vụ chi tiết: mục 1 `CLAUDE.md`
- Quy ước API: `docs/api/` (khi nối API thật, đối chiếu trước khi code — hiện đang ở giai đoạn UI-first theo mục 0 `CLAUDE.md`); riêng phần Staff xem `docs/api/12-mobile-field-ops.md`
