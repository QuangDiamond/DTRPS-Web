/**
 * Lưu phiên đăng nhập của khu client — khóa riêng, không đụng phiên của admin.
 * "Ghi nhớ đăng nhập" → localStorage, ngược lại → sessionStorage (mất khi đóng tab).
 */
import type { ClientUser } from '@/client/api/types';

const STORAGE_KEY = 'smarttravel.client.session';

export interface ClientSession {
  accessToken: string;
  refreshToken: string;
  user: ClientUser;
  remember: boolean;
}

function storages(): Storage[] {
  try {
    return [window.localStorage, window.sessionStorage];
  } catch {
    return [];
  }
}

function isSession(value: unknown): value is ClientSession {
  if (typeof value !== 'object' || value === null) return false;
  const session = value as Partial<ClientSession>;
  return (
    typeof session.accessToken === 'string' &&
    typeof session.refreshToken === 'string' &&
    typeof session.user === 'object' &&
    session.user !== null &&
    Array.isArray(session.user.roles)
  );
}

export function readSession(): ClientSession | null {
  for (const storage of storages()) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (isSession(parsed)) return parsed;
    } catch {
      // Dữ liệu hỏng hoặc storage bị chặn → bỏ qua
    }
  }
  return null;
}

export function writeSession(session: ClientSession): void {
  clearSession();
  try {
    const storage = session.remember ? window.localStorage : window.sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Không lưu được thì phiên chỉ còn trong bộ nhớ của tab hiện tại
  }
}

export function clearSession(): void {
  for (const storage of storages()) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // bỏ qua
    }
  }
}
