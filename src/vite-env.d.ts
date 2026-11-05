/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Địa chỉ gốc của REST API, ví dụ https://api.smarttravel.vn/api */
  readonly VITE_API_URL?: string;
  /** Goong Maptiles key — nền bản đồ (công khai). API key tìm địa chỉ nằm ở backend */
  readonly VITE_GOONG_MAPTILES_KEY?: string;
  /** Đăng nhập Google — OAuth Client ID (công khai) */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
