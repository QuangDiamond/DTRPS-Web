/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Địa chỉ gốc của REST API, ví dụ https://api.smarttravel.vn/api */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
