/**
 * Service xác thực GIẢ LẬP (mock) — khi có backend chỉ cần thay phần thân các hàm
 * bằng lời gọi API (dùng API_URL trong ./api.ts), giữ nguyên chữ ký hàm.
 */
import { MOCK_ADMIN_ACCOUNTS, MOCK_OTP_CODE } from '../constants/mockData';
import type { AdminProfile } from '../types/admin';
import type { AdminAccount } from '../types/auth';

const MOCK_LATENCY_MS = 1000;

// Bản sao có thể sửa để "đổi mật khẩu" có hiệu lực trong phiên (tải lại trang sẽ reset)
const accounts: AdminAccount[] = MOCK_ADMIN_ACCOUNTS.map((account) => ({ ...account }));

function delay(ms = MOCK_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function findAccount(email: string): AdminAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return accounts.find((account) => account.profile.email === normalized);
}

export async function login(email: string, password: string): Promise<AdminProfile> {
  await delay();
  const account = findAccount(email);
  if (!account || account.password !== password) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }
  return account.profile;
}

export async function sendPasswordResetOtp(email: string): Promise<void> {
  await delay();
  if (!findAccount(email)) {
    throw new Error('Email không tồn tại trong hệ thống quản trị');
  }
}

export async function verifyPasswordResetOtp(email: string, code: string): Promise<boolean> {
  await delay(600);
  return Boolean(findAccount(email)) && code === MOCK_OTP_CODE;
}

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  await delay();
  const account = findAccount(email);
  if (!account) {
    throw new Error('Email không tồn tại trong hệ thống quản trị');
  }
  account.password = newPassword;
}
