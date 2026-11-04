/** Cấu hình lớp dữ liệu — đổi qua file .env (xem .env.example) */

/** Địa chỉ gốc của REST API */
export const API_URL: string = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
).replace(/\/$/, '');

/** Goong Maptiles key (nền bản đồ). Trống → dùng nền CARTO dự phòng */
export const GOONG_MAPTILES_KEY: string = import.meta.env.VITE_GOONG_MAPTILES_KEY?.trim() ?? '';

/** Thời gian chờ tối đa cho một request */
export const REQUEST_TIMEOUT_MS = 15_000;
