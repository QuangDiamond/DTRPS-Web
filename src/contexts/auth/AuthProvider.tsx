import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as authService from '@/services/authService';
import { onUnauthorized } from '@/services/httpClient';
import { clearAccessToken } from '@/services/tokenStore';
import type { AdminProfile } from '@/types';
import { adminSessionEnd } from '@/utils/sessionEnd';
import { tabLock } from '@/utils/useIdleTimeout';
import { AuthContext } from './authContext';

const STORAGE_KEY = 'smarttravel.admin';

/** Cờ khoá theo từng tab (sessionStorage) khi không thao tác 30 phút */
const idleLock = tabLock('smarttravel.admin.idleLocked');

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

/** "Ghi nhớ đăng nhập" -> localStorage, ngược lại -> sessionStorage (mất khi đóng tab) */
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

export default function AuthProvider({ children }: { children: ReactNode }) {
  // Tab đã bị khoá vì không thao tác → coi như chưa đăng nhập cho tới khi đăng nhập lại
  const [admin, setAdmin] = useState<AdminProfile | null>(() =>
    idleLock.isLocked() ? null : readStoredAdmin(),
  );
  const adminRef = useRef(admin);
  adminRef.current = admin;
  /** Phiên vừa bị kết thúc do 401; đăng nhập lại thì xoá */
  const sessionEndedRef = useRef(false);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const profile = await authService.login(email, password, remember);
    sessionEndedRef.current = false;
    idleLock.unlock();
    adminSessionEnd.clear();
    clearStoredAdmin();
    try {
      const storage = remember ? window.localStorage : window.sessionStorage;
      storage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Không lưu được thì vẫn đăng nhập trong phiên hiện tại
    }
    setAdmin(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    idleLock.unlock();
    adminSessionEnd.clear();
    clearStoredAdmin();
    setAdmin(null);
  }, []);

  // Không xoá phiên lưu chung, không thu hồi token: chỉ tab này phải đăng nhập lại
  const lockIdle = useCallback(() => {
    idleLock.lock();
    adminSessionEnd.set('idle');
    setAdmin(null);
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

  const value = useMemo(
    () => ({ admin, login, logout, lockIdle }),
    [admin, login, logout, lockIdle],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
