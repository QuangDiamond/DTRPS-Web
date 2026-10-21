/** Kiểu dùng chung toàn ứng dụng */
import type { ParseKeys } from 'i18next';

export interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

export type Language = 'vi' | 'en';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface MessageTemplate {
  title: string;
  body: string;
}

export interface MessageChannel {
  id: string;
  label: string;
  icon: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

/** Key hợp lệ trong từ điển bản dịch (src/locales) */
export type TranslationKey = ParseKeys;
