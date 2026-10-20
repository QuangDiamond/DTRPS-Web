/**
 * Service xác thực — chạy giả lập (mock) hoặc gọi API thật tùy cờ USE_MOCK_API.
 * Chữ ký hàm giữ nguyên ở cả hai chế độ nên AuthProvider và các màn đăng nhập không cần sửa.
 */
import { MOCK_ADMIN_ACCOUNTS, MOCK_OTP_CODE } from '../constants/mockData';
import type { AdminProfile } from '../types/admin';
import type { AdminAccount } from '../types/auth';
import { USE_MOCK_API } from './config';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';
import { clearAccessToken, setAccessToken } from './tokenStore';

const MOCK_LATENCY_MS = 1000;

/** Tài khoản & mã OTP demo — chỉ hiển thị gợi ý khi đang chạy dữ liệu mẫu */
export const DEMO_ACCOUNT: AdminAccount | undefined = USE_MOCK_API
  ? MOCK_ADMIN_ACCOUNTS[0]
  : undefined;
export const DEMO_OTP_CODE: string | undefined = USE_MOCK_API ? MOCK_OTP_CODE : undefined;

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
  admin: AdminProfile;
  accessToken: string;
}

export async function login(
  email: string,
  password: string,
  remember = true,
): Promise<AdminProfile> {
  if (!USE_MOCK_API) {
    const result = await apiRequest<LoginResponse>(ENDPOINTS.auth.login, {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
    });
    setAccessToken(result.accessToken, remember);
    return result.admin;
  }
  await delay();
  const account = findAccount(email);
  if (!account || account.password !== password) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }
  return account.profile;
}

/** Hủy phiên trên server (nếu có) và xóa token ở trình duyệt */
export function logout(): void {
  if (!USE_MOCK_API) {
    apiRequest<void>(ENDPOINTS.auth.logout, { method: 'POST', silentUnauthorized: true }).catch(
      () => {
        // Token có thể đã hết hạn — vẫn xóa phía client
      },
    );
  }
  clearAccessToken();
}

export async function sendPasswordResetOtp(email: string): Promise<void> {
  if (!USE_MOCK_API) {
    await apiRequest<void>(ENDPOINTS.auth.sendResetOtp, { method: 'POST', body: { email } });
    return;
  }
  await delay();
  if (!findAccount(email)) {
    throw new Error('Email không tồn tại trong hệ thống quản trị');
  }
}

export async function verifyPasswordResetOtp(email: string, code: string): Promise<boolean> {
  if (!USE_MOCK_API) {
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
  if (!USE_MOCK_API) {
    await apiRequest<void>(ENDPOINTS.auth.resetPassword, {
      method: 'POST',
      body: { email, newPassword },
    });
    return;
  }
  await delay();
  const account = findAccount(email);
  if (!account) {
    throw new Error('Email không tồn tại trong hệ thống quản trị');
  }
  account.password = newPassword;
}

/** Đổi mật khẩu khi đã đăng nhập (màn Hồ sơ Admin) */
export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!USE_MOCK_API) {
    await apiRequest<void>(ENDPOINTS.auth.changePassword, {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
    return;
  }
  await delay(800);
  const account = findAccount(email);
  if (!account) {
    throw new Error('Không tìm thấy tài khoản quản trị');
  }
  if (account.password !== currentPassword) {
    throw new Error('Mật khẩu hiện tại không chính xác');
  }
  account.password = newPassword;
}
