# DTRPS Admin Web — Smart Travel Vietnam

Cổng quản trị (Admin Web) của hệ thống du lịch thông minh Smart Travel: quản lý người dùng, đối tác,
niêm yết, điểm đến POI, thông báo, cấu hình hệ thống và hồ sơ quản trị viên.

**Công nghệ:** React 19 · TypeScript (strict) · Vite 6 · Tailwind CSS v4 · React Router 7

## Chạy dự án

```bash
npm install
npm run dev          # http://localhost:5173
```

Tài khoản demo (chế độ dữ liệu mẫu): `admin@smarttravel.vn` / `Admin@123` — mã OTP quên mật khẩu: `842915`.

| Lệnh                   | Mô tả                            |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Chạy môi trường phát triển       |
| `npm run build`        | Kiểm tra kiểu + build production |
| `npm run preview`      | Xem bản build                    |
| `npm run typecheck`    | Kiểm tra TypeScript              |
| `npm run lint`         | ESLint (gồm quy tắc React Hooks) |
| `npm run format:check` | Kiểm tra định dạng Prettier      |

## Cấu trúc thư mục

```
src/
  components/   common/ (Button, Modal, ConfirmModal, PageHeader, Pagination, SortableHeader,
                ToggleSwitch, PageLoader, ErrorState, NotFoundState…) + Provider (store) theo
                từng phân hệ
  constants/    cấu hình nhãn/màu theo nghiệp vụ, routes, navigation; mock*.ts = dữ liệu mẫu
  contexts/     kiểu & React context của từng store
  hooks/        useListings, usePartners… + hook dùng chung (useTableSort, useResource,
                useUnsavedChangesGuard, useDismiss…)
  layouts/      AdminLayout (Sidebar, Header, cổng trạng thái dữ liệu), AuthLayout
  pages/        mỗi màn hình một thư mục (index.tsx + components/ + *Utils.ts)
  services/     lớp truy cập dữ liệu (mock ↔ API thật)
  types/        admin.ts (nghiệp vụ), api.ts (hợp đồng dữ liệu với backend)
  utils/        format, validation, sort, download, clipboard…
```

## Kiến trúc dữ liệu & tích hợp backend

```
Trang / component  ──►  hook (useListings, usePartners…)        ← UI chỉ biết hook
                        Provider (state + cập nhật lạc quan)     ← chữ ký hàm không đổi
                        services/<phân hệ>Service.ts             ← điểm thay thế duy nhất
                        services/httpClient.ts (fetch, token, timeout, ApiError, 401)
```

- **Chế độ mock (mặc định):** mỗi service trả dữ liệu từ `src/constants/mock*.ts`. Chỉ thư mục
  `services/` được import dữ liệu mẫu — UI không import trực tiếp.
- **Chuyển sang API thật:** tạo `.env.local` từ `.env.example`, đặt `VITE_USE_MOCK=false` và
  `VITE_API_URL`. Không cần sửa trang hay store.
- **Hợp đồng REST:** toàn bộ endpoint ở `src/services/endpoints.ts`; kiểu dữ liệu trả về ở
  `src/types/api.ts` (mỗi phân hệ có một `…Snapshot` để tải dữ liệu khởi tạo).
- **Đọc dữ liệu:** store tải snapshot sau khi đăng nhập (`useInitialData`); trang chi tiết tải
  riêng qua `useResource`. `AdminLayout` hiển thị loader/lỗi + nút thử lại khi đang tải hoặc lỗi.
- **Ghi dữ liệu:** store cập nhật giao diện ngay, sau đó `usePersist` gửi xuống server; nếu server
  từ chối thì báo lỗi và tải lại dữ liệu để khớp server. Bản ghi tạo mới gửi kèm `id` do client sinh.
- **Xác thực:** `POST /auth/login` trả `{ admin, accessToken }`; token gửi qua header
  `Authorization: Bearer …`; API trả 401 thì tự đăng xuất.

## Quy ước giao diện

- **Màu:** chỉ dùng token theme trong `src/index.css` (`primary`, `secondary`, `tertiary`, `error`,
  `surface-*`, `on-*`, `outline*`, `brand` cho logo). Không dùng màu Tailwind mặc định hay mã hex.
- **Nút:** dùng `components/common/Button` (variant `primary | neutral | secondary | danger | ghost`)
  cho footer modal, form và thao tác chung.
- **Ngôn ngữ:** 100% tiếng Việt cho nhãn, trạng thái, nút, thông báo. Giữ nguyên tên riêng & thuật ngữ
  chuẩn (Smart Travel, AI Planner, POI, SLA, 2FA, FIDO2, Super Admin, hạng Diamond/Gold…).
- **Kiểm tra dữ liệu:** dùng `utils/validation.ts` (email, số điện thoại Việt Nam, URL, mã số thuế).
- **Phản hồi thao tác:** mọi thao tác ghi có toast; thao tác nguy hiểm có `ConfirmModal`; form có
  thay đổi chưa lưu dùng `useUnsavedChangesGuard`.

## Trạng thái màn hình

Đã hoàn thiện: Đăng nhập & khôi phục mật khẩu, Bảng điều khiển, Người dùng (+ chi tiết), Đối tác
(+ chi tiết), Niêm yết (hàng chờ, xem xét & duyệt, đã duyệt, bị từ chối), Điểm đến POI (danh sách,
thêm/sửa), Thông báo, Cài đặt hệ thống, Hồ sơ quản trị viên, 404.

Đang chờ thiết kế: **Báo cáo & Thống kê** (`/admin/reports` hiện là trang tạm).
