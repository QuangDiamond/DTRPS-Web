import i18n from 'i18next';
/** Service xác thực admin — gọi API thật của backend */
import type { AdminProfile } from '@/types';
import { ENDPOINTS } from './endpoints';
import { ApiError, apiRequest } from './httpClient';
import { clearAccessToken, replaceTokens, setTokens } from './tokenStore';

interface LoginResponse {
  /** Chỉ có với tài khoản mang vai trò ADMIN */
  admin?: AdminProfile;
  accessToken: string;
  refreshToken: string;
}

export async function login(
  email: string,
  password: string,
  remember = true,
): Promise<AdminProfile> {
  const result = await apiRequest<LoginResponse>(ENDPOINTS.auth.login, {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
    // Sai mật khẩu cũng trả 401 — không phải "phiên hết hạn"
    silentUnauthorized: true,
  });
  if (!result.admin) {
    // Tài khoản du khách / đối tác không được vào trang quản trị
    apiRequest<void>(ENDPOINTS.auth.revoke, {
      method: 'POST',
      body: { refreshToken: result.refreshToken },
      silentUnauthorized: true,
    }).catch(() => undefined);
    throw new Error(i18n.t('auth.errors.notAdministrator'));
  }
  setTokens(result.accessToken, result.refreshToken, remember);
  return result.admin;
}

/** Hủy phiên trên server (nếu có) và xóa token ở trình duyệt */
export function logout(): void {
  apiRequest<void>(ENDPOINTS.auth.logout, { method: 'POST', silentUnauthorized: true }).catch(
    () => {
      // Token có thể đã hết hạn — vẫn xóa phía client
    },
  );
  clearAccessToken();
}

export async function sendPasswordResetOtp(email: string): Promise<void> {
  await apiRequest<void>(ENDPOINTS.auth.sendResetOtp, { method: 'POST', body: { email } });
}

/**
 * Kiểm tra mã OTP. Đúng → vé dùng một lần cho bước đặt mật khẩu mới; sai / hết hạn → null
 * (backend đếm số lần sai, quá 5 lần phải gửi mã mới).
 */
export async function verifyPasswordResetOtp(email: string, code: string): Promise<string | null> {
  try {
    const result = await apiRequest<{ ticket: string }>(ENDPOINTS.auth.verifyResetOtp, {
      method: 'POST',
      body: { email, code },
    });
    return result.ticket;
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) return null;
    throw error;
  }
}

/** Đặt mật khẩu mới bằng vé từ bước xác thực OTP (mọi phiên đăng nhập cũ bị đăng xuất) */
export async function resetPassword(ticket: string, newPassword: string): Promise<void> {
  await apiRequest<void>(ENDPOINTS.auth.resetPassword, {
    method: 'POST',
    body: { ticket, newPassword },
  });
}

/** Đổi mật khẩu khi đã đăng nhập (màn Hồ sơ Admin) */
/**
 * Đổi mật khẩu: BE đăng xuất mọi thiết bị khác và trả phiên mới cho thiết bị này — lưu lại để admin
 * vẫn đăng nhập (không bị đá ra sau vài phút).
 */
export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const session = await apiRequest<LoginResponse>(ENDPOINTS.auth.changePassword, {
    method: 'POST',
    body: { currentPassword, newPassword },
  });
  replaceTokens(session.accessToken, session.refreshToken);
}
