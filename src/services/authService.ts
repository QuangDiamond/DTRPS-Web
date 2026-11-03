import i18n from 'i18next';
/**
 * Service xác thực — gọi API thật khi phân hệ "auth" bật (mặc định), ngược lại chạy giả lập (mock).
 * Chữ ký hàm giữ nguyên ở cả hai chế độ nên AuthProvider và các màn đăng nhập không cần sửa.
 */
import { MOCK_ADMIN_ACCOUNTS, MOCK_OTP_CODE } from '@/mocks/data/mockData';
import type { AdminAccount, AdminProfile } from '@/types';
import { isLiveModule } from './config';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';
import { clearAccessToken, setTokens } from './tokenStore';

/** Đăng nhập admin chạy giả lập (khi tắt API thật cho phân hệ auth) */
const MOCK_AUTH = !isLiveModule('auth');

const MOCK_LATENCY_MS = 1000;

/** Tài khoản & mã OTP demo — chỉ hiển thị gợi ý khi đang chạy dữ liệu mẫu */
export const DEMO_ACCOUNT: AdminAccount | undefined = MOCK_AUTH
  ? MOCK_ADMIN_ACCOUNTS[0]
  : undefined;
export const DEMO_OTP_CODE: string | undefined = MOCK_AUTH ? MOCK_OTP_CODE : undefined;

// Bản sao có thể sửa để "đổi mật khẩu" có hiệu lực trong phiên (tải lại trang sẽ reset)
const accounts: AdminAccount[] = MOCK_ADMIN_ACCOUNTS.map((account) => ({ ...account }));

function delay(ms = MOCK_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function findAccount(email: string): AdminAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return accounts.find((account) => account.profile.email === normalized);
}

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
  if (!MOCK_AUTH) {
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
  await delay();
  const account = findAccount(email);
  if (!account || account.password !== password) {
    throw new Error(i18n.t('auth.errors.invalidCredentials'));
  }
  return account.profile;
}

/** Hủy phiên trên server (nếu có) và xóa token ở trình duyệt */
export function logout(): void {
  if (!MOCK_AUTH) {
    apiRequest<void>(ENDPOINTS.auth.logout, { method: 'POST', silentUnauthorized: true }).catch(
      () => {
        // Token có thể đã hết hạn — vẫn xóa phía client
      },
    );
  }
  clearAccessToken();
}

export async function sendPasswordResetOtp(email: string): Promise<void> {
  if (!MOCK_AUTH) {
    await apiRequest<void>(ENDPOINTS.auth.sendResetOtp, { method: 'POST', body: { email } });
    return;
  }
  await delay();
  if (!findAccount(email)) {
    throw new Error(i18n.t('auth.errors.unknownEmail'));
  }
}

export async function verifyPasswordResetOtp(email: string, code: string): Promise<boolean> {
  if (!MOCK_AUTH) {
    const result = await apiRequest<{ valid: boolean }>(ENDPOINTS.auth.verifyResetOtp, {
      method: 'POST',
      body: { email, code },
    });
    return result.valid;
  }
  await delay(600);
  return Boolean(findAccount(email)) && code === MOCK_OTP_CODE;
}

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  if (!MOCK_AUTH) {
    await apiRequest<void>(ENDPOINTS.auth.resetPassword, {
      method: 'POST',
      body: { email, newPassword },
    });
    return;
  }
  await delay();
  const account = findAccount(email);
  if (!account) {
    throw new Error(i18n.t('auth.errors.unknownEmail'));
  }
  account.password = newPassword;
}

/** Đổi mật khẩu khi đã đăng nhập (màn Hồ sơ Admin) */
export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!MOCK_AUTH) {
    await apiRequest<void>(ENDPOINTS.auth.changePassword, {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
    return;
  }
  await delay(800);
  const account = findAccount(email);
  if (!account) {
    throw new Error(i18n.t('auth.errors.accountNotFound'));
  }
  if (account.password !== currentPassword) {
    throw new Error(i18n.t('auth.errors.wrongCurrentPassword'));
  }
  account.password = newPassword;
}
