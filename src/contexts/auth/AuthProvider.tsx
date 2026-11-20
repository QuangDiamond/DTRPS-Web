import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as authService from '@/services/authService';
import { onUnauthorized } from '@/services/httpClient';
import { clearAccessToken } from '@/services/tokenStore';
import type { AdminProfile } from '@/types';
import { adminSessionEnd } from '@/utils/sessionEnd';
import { ADMIN_IDLE_MINUTES, AuthContext, adminActivity } from './authContext';

const STORAGE_KEY = 'smarttravel.admin';

function isAdminProfile(value: unknown): value is AdminProfile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof value.name === 'string' &&
    'email' in value &&
    typeof value.email === 'string' &&
    'role' in value &&
    typeof value.role === 'string'
  );
}

function getStorages(): Storage[] {
  try {
    return [window.localStorage, window.sessionStorage];
  } catch {
    return [];
  }
}

/** Hồ sơ admin lưu ở localStorage để mọi tab dùng chung một phiên */
function readStoredAdmin(): AdminProfile | null {
  for (const storage of getStorages()) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (isAdminProfile(parsed)) return parsed;
    } catch {
      // Dữ liệu hỏng hoặc storage bị chặn -> bỏ qua
    }
  }
  return null;
}

function clearStoredAdmin(): void {
  for (const storage of getStorages()) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // bỏ qua
    }
  }
}

/** Cờ chung mọi tab: phiên vừa kết thúc vì không thao tác (để tab khác hiện đúng lý do) */
const IDLE_FLAG_KEY = 'smarttravel.admin.endedIdle';

function readIdleFlag(): boolean {
  try {
    return window.localStorage.getItem(IDLE_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

function writeIdleFlag(on: boolean): void {
  try {
    if (on) window.localStorage.setItem(IDLE_FLAG_KEY, '1');
    else window.localStorage.removeItem(IDLE_FLAG_KEY);
  } catch {
    // bỏ qua
  }
}

/**
 * Mở trang (F5, tab mới, mở lại trình duyệt) sau hơn 30 phút không thao tác → phiên đã hết,
 * không cho vào thẳng. Thu hồi token trên server luôn.
 */
function initialAdmin(): AdminProfile | null {
  const stored = readStoredAdmin();
  if (!stored) return null;
  if (!adminActivity.expired(ADMIN_IDLE_MINUTES)) return stored;
  authService.logout();
  clearStoredAdmin();
  adminActivity.clear();
  adminSessionEnd.set('idle');
  return null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(initialAdmin);
  const adminRef = useRef(admin);
  adminRef.current = admin;
  /** Phiên vừa bị kết thúc do 401; đăng nhập lại thì xoá */
  const sessionEndedRef = useRef(false);

  const login = useCallback(async (email: string, password: string) => {
    const profile = await authService.login(email, password);
    sessionEndedRef.current = false;
    adminSessionEnd.clear();
    clearStoredAdmin();
    writeIdleFlag(false);
    adminActivity.touch();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Không lưu được thì vẫn đăng nhập trong phiên hiện tại
    }
    setAdmin(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    writeIdleFlag(false);
    authService.logout();
    adminSessionEnd.clear();
    clearStoredAdmin();
    adminActivity.clear();
    setAdmin(null);
  }, []);

  // Hết giờ không thao tác: đăng xuất thật — các tab khác nhận sự kiện storage và cũng thoát
  const endIdle = useCallback(() => {
    writeIdleFlag(true);
    authService.logout();
    clearStoredAdmin();
    adminActivity.clear();
    adminSessionEnd.set('idle');
    setAdmin(null);
  }, []);

  // Tab khác đăng xuất / hết giờ / đăng nhập tài khoản khác → tab này theo cùng
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      const next = readStoredAdmin();
      // Tab khác kết thúc phiên vì không thao tác → trang đăng nhập ở tab này cũng giải thích lý do
      if (!next && adminRef.current && readIdleFlag()) adminSessionEnd.set('idle');
      adminRef.current = next;
      setAdmin(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // API trả 401 mà không làm mới được (token hết hạn / bị thu hồi / DB đổi) → đăng xuất một lần.
  // Không bật toast: trang đăng nhập đã có banner "Phiên đăng nhập đã hết hạn".
  useEffect(() => {
    onUnauthorized(() => {
      clearAccessToken();
      clearStoredAdmin();
      if (adminRef.current) {
        // Gặp 401 đầu tiên: đánh dấu ngay để các request 401 song song không xử lý lại
        adminRef.current = null;
        sessionEndedRef.current = true;
        adminSessionEnd.set('expired');
        setAdmin(null);
      }
      // true: là phiên vừa kết thúc → httpClient không ném lỗi cho từng request
      return sessionEndedRef.current;
    });
    return () => onUnauthorized(null);
  }, []);

  const value = useMemo(() => ({ admin, login, logout, endIdle }), [admin, login, logout, endIdle]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
