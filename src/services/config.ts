/** Cấu hình lớp dữ liệu — đổi qua file .env (xem .env.example) */

/** Địa chỉ gốc của REST API */
export const API_URL: string = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
).replace(/\/$/, '');

/**
 * true (mặc định): toàn bộ service trả về dữ liệu mẫu ngay trong trình duyệt.
 * false: service gọi API thật tại API_URL — không cần sửa UI hay store.
 */
export const USE_MOCK_API: boolean = import.meta.env.VITE_USE_MOCK !== 'false';

/** Các phân hệ đã có API thật ở backend */
export type LiveModule = 'auth' | 'partners' | 'listings';

/**
 * Phân hệ chạy bằng API thật kể cả khi các phần khác còn mock.
 * Đặt VITE_LIVE_MODULES (phân tách bằng dấu phẩy) để đổi; mặc định: auth,partners,listings.
 */
const LIVE_MODULES = new Set(
  (import.meta.env.VITE_LIVE_MODULES ?? 'auth,partners,listings')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

export function isLiveModule(module: LiveModule): boolean {
  return !USE_MOCK_API || LIVE_MODULES.has(module);
}

/** Goong Maptiles key (nền bản đồ). Trống → dùng nền CARTO dự phòng */
export const GOONG_MAPTILES_KEY: string = import.meta.env.VITE_GOONG_MAPTILES_KEY?.trim() ?? '';

/** Thời gian chờ tối đa cho một request */
export const REQUEST_TIMEOUT_MS = 15_000;

/** Độ trễ giả lập cho các thao tác ghi ở chế độ mock (để UI xử lý được luồng async) */
export const MOCK_WRITE_LATENCY_MS = 150;
