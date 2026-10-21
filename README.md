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
  components/   common/ — UI dùng chung (Button, Modal, Pagination, StatCard…) qua barrel `@/components/common`
                auth/, listings/, notifications/, partners/ — component dùng ở nhiều trang của một phân hệ
  constants/    nhãn, màu, tùy chọn lọc theo nghiệp vụ + routes.ts, navigation.ts (KHÔNG chứa dữ liệu mẫu)
  contexts/     <phân hệ>/ = xxxContext.ts (context + kiểu) + XxxProvider.tsx (store); AppProviders.tsx lồng tất cả
  hooks/        hook truy cập store + hook dùng chung, import qua `@/hooks`
  layouts/      AdminLayout (Sidebar, Header, DataStatusGate), AuthLayout
  mocks/        data/ (dữ liệu mẫu), builders/ (dựng hồ sơ chi tiết) — chỉ services/ được import
  pages/        <Màn>/<Màn>Page.tsx + components/ + <màn>Utils.ts
  routes/       index.tsx (router, lazy), RouteGuards.tsx
  services/     lớp truy cập dữ liệu (mock ↔ API thật), endpoints.ts = hợp đồng REST
  types/        mỗi phân hệ một file (partner, listing, user, poi…) + api.ts, import qua `@/types`
  utils/        hàm thuần: format, validation, sort, pagination, download…
```

**Quy ước import** (ESLint bắt lỗi): cùng thư mục dùng `./`, khác thư mục dùng alias `@/` — không dùng `../`; giao diện không được import `@/mocks`.

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

## Đa ngôn ngữ (vi / en)

- Cấu hình: `src/config/i18n.ts` (i18next + react-i18next), mặc định `vi`, lựa chọn lưu ở `localStorage['app_language']`.
- Từ điển: `src/locales/vi.json` và `src/locales/en.json`. TypeScript báo lỗi khi `en.json` thiếu key hoặc gọi `t()` / `<Trans>` với key không tồn tại.
- Cấu trúc key lồng nhau theo vị trí: `<trang>.<component>.<tênNgắn>` (ví dụ `users.userTable.accountStatus`, `pois.constants.public`); dùng chung ở `common.*`, `actions.*`, `time.*`, `province.*`.
- Nút chuyển: `LanguageSwitcher` trên Header; đổi ngay, không tải lại trang, không mất state.
- Quy tắc viết code:
  - Trong component: `const { t } = useTranslation()`; câu có chữ in đậm/liên kết dùng `<Trans i18nKey="..." components={{ c0: <strong /> }} />`.
  - Trong hàm thường, store, service: `i18n.t(...)` (lấy theo ngôn ngữ lúc gọi).
  - Hằng số cấp module trong `constants/`: nhãn khai báo bằng getter (`get label() { return i18n.t(...) }`) hoặc `localizeConfig` / `linkedOption` trong `utils/localize.ts`; danh sách lựa chọn dạng mảng dùng key bản dịch và hiển thị bằng `t(key)`.
  - Số lượng: key `_one` / `_other` với tham số `count` (tiếng Việt chỉ cần `_other`).
  - Ngày giờ tương đối, "Hôm nay 09:30", nhãn tháng: dùng `utils/format.ts` (đã theo ngôn ngữ).
- Không dịch: tên riêng, nội dung bản ghi (địa chỉ, ghi chú, lý do do admin nhập) và tên ngôn ngữ gốc ("Tiếng Việt").
  Khi nối backend, mọi request gửi kèm `Accept-Language` để server trả nội dung nghiệp vụ đúng ngôn ngữ.

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
thêm/sửa), Báo cáo & Thống kê, Thông báo, Cài đặt hệ thống, Hồ sơ quản trị viên, 404.

Đang chờ thiết kế: 3 tab của Chi tiết đối tác (Hợp đồng & Hạn mức, Lịch sử hợp tác, Đánh giá & Xếp hạng).
