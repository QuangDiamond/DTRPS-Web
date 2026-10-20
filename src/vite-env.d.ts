/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Địa chỉ gốc của REST API, ví dụ https://api.smarttravel.vn/api */
  readonly VITE_API_URL?: string;
  /** "false" để gọi API thật; mặc định dùng dữ liệu mẫu (mock) */
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
