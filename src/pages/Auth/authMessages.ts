import i18n from 'i18next';
import { DEMO_OTP_CODE } from '@/services/authService';

/** Toast sau khi gửi OTP — khi chạy dữ liệu mẫu hiện kèm mã demo để test */
export function otpSentMessage(email: string): string {
  const demoHint = DEMO_OTP_CODE ? i18n.t('auth.authMessages.demoCode', { DEMO_OTP_CODE }) : '';
  return i18n.t('auth.authMessages.otpCodeSent', { email, demoHint });
}

export const AUTH_LINK_CLASS =
  'flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-primary';
