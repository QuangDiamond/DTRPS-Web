import i18n from 'i18next';

/** Toast sau khi gửi OTP */
export function otpSentMessage(email: string): string {
  return i18n.t('auth.authMessages.otpCodeSent', { email });
}

export const AUTH_LINK_CLASS =
  'flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-primary';
