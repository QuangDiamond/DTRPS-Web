/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Địa chỉ gốc của REST API, ví dụ https://api.smarttravel.vn/api */
  readonly VITE_API_URL?: string;
  /** "false" để gọi API thật; mặc định dùng dữ liệu mẫu (mock) */
  readonly VITE_USE_MOCK?: string;
  /** Phân hệ dùng API thật khi các phần khác còn mock, ví dụ "auth,partners" */
  readonly VITE_LIVE_MODULES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
