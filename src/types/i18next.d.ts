import 'i18next';
import type vi from '@/locales/vi.json';

// Key bản dịch được kiểm tra lúc biên dịch: t('nav.dashboard') hợp lệ, t('nav.dashbord') báo lỗi
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof vi };
  }
}
