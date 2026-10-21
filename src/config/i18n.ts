/**
 * Cấu hình đa ngôn ngữ (vi / en) — import một lần trong main.tsx.
 * Ngôn ngữ người dùng chọn được lưu ở localStorage (`app_language`) và đọc lại khi mở ứng dụng.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';
import type { Language } from '@/types';

export const LANGUAGE_STORAGE_KEY = 'app_language';
export const DEFAULT_LANGUAGE: Language = 'vi';
export const SUPPORTED_LANGUAGES: readonly Language[] = ['vi', 'en'];

// Bản tiếng Anh phải có đủ mọi key của bản tiếng Việt (TypeScript báo lỗi nếu thiếu)
const enResources: typeof vi = en;

const isLanguage = (value: string | null | undefined): value is Language =>
  SUPPORTED_LANGUAGES.includes(value as Language);

function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function applyLanguage(language: string) {
  document.documentElement.lang = language;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Trình duyệt chặn localStorage (chế độ riêng tư) — vẫn đổi ngôn ngữ trong phiên
  }
}

void i18n.use(initReactI18next).init({
  resources: { vi: { translation: vi }, en: { translation: enResources } },
  lng: readStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  // Từ điển nằm sẵn trong bundle → khởi tạo đồng bộ, không nháy chữ khi tải trang
  initAsync: false,
});

document.documentElement.lang = i18n.language;
i18n.on('languageChanged', applyLanguage);

/** Ngôn ngữ đang dùng (đã chuẩn hóa về vi / en) */
export const getCurrentLanguage = (): Language =>
  isLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LANGUAGE;

export default i18n;
