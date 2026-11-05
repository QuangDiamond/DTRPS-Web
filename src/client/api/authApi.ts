import { clientRequest } from './http';
import type { AuthResponse } from './types';

/** Mã OTP vừa gửi: còn hiệu lực expiresInSeconds; được gửi lại sau resendInSeconds */
export interface OtpSent {
  email: string;
  expiresInSeconds: number;
  resendInSeconds: number;
}

/** Mã đúng → vé dùng một lần cho bước cuối */
export interface OtpTicket {
  ticket: string;
  expiresInSeconds: number;
}

const normalize = (email: string) => email.trim().toLowerCase();

export const authApi = {
  login: (email: string, password: string) =>
    clientRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: normalize(email), password },
    }),

  // ===== Đăng ký 3 bước: họ tên + email → mã OTP → mật khẩu =====
  sendRegisterCode: (name: string, email: string) =>
    clientRequest<OtpSent>('/auth/register/otp', {
      method: 'POST',
      auth: false,
      body: { name: name.trim(), email: normalize(email) },
    }),
  verifyRegisterCode: (email: string, code: string) =>
    clientRequest<OtpTicket>('/auth/register/verify', {
      method: 'POST',
      auth: false,
      body: { email: normalize(email), code },
    }),
  completeRegistration: (ticket: string, name: string, password: string) =>
    clientRequest<AuthResponse>('/auth/register/complete', {
      method: 'POST',
      auth: false,
      body: { ticket, name: name.trim(), password },
    }),

  // ===== Quên mật khẩu 3 bước: email → mã OTP → mật khẩu mới =====
  sendResetCode: (email: string) =>
    clientRequest<OtpSent>('/auth/password/otp', {
      method: 'POST',
      auth: false,
      body: { email: normalize(email) },
    }),
  verifyResetCode: (email: string, code: string) =>
    clientRequest<OtpTicket>('/auth/password/verify', {
      method: 'POST',
      auth: false,
      body: { email: normalize(email), code },
    }),
  resetPassword: (ticket: string, newPassword: string) =>
    clientRequest<void>('/auth/password/reset', {
      method: 'POST',
      auth: false,
      body: { ticket, newPassword },
    }),

  /** Đổi refresh token lấy cặp token mới (kèm vai trò mới nhất của user) */
  refresh: (refreshToken: string) =>
    clientRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      auth: false,
      body: { refreshToken },
    }),

  /** Kết thúc phiên trên thiết bị này */
  revoke: (refreshToken: string) =>
    clientRequest<void>('/auth/revoke', { method: 'POST', auth: false, body: { refreshToken } }),
};
