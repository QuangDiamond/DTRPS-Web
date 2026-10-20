import { MOCK_OTP_CODE } from '../../constants/mockData';

/** Toast sau khi gửi OTP — khi chạy dev hiện kèm mã demo để test */
export function otpSentMessage(email: string): string {
  const demoHint = import.meta.env.DEV ? ` (mã demo: ${MOCK_OTP_CODE})` : '';
  return `Đã gửi mã OTP tới ${email}${demoHint}`;
}

export const AUTH_LINK_CLASS =
  'flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:text-primary';
