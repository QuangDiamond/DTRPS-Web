import i18n from 'i18next';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/hooks';
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
  const { showToast } = useToast();

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const profile = await authService.login(email, password, remember);
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

  // API trả 401 (token hết hạn / bị thu hồi) → đăng xuất và báo cho người dùng
  useEffect(() => {
    onUnauthorized(() => {
      // Chỉ khi đang đăng nhập (không phải lỗi 401 ở chính trang đăng nhập)
      if (adminRef.current) adminSessionEnd.set('expired');
      clearAccessToken();
      clearStoredAdmin();
      setAdmin(null);
      showToast(i18n.t('stores.auth.yourSessionHasExpired'), 'info');
    });
    return () => onUnauthorized(null);
  }, [showToast]);

  const value = useMemo(
    () => ({ admin, login, logout, lockIdle }),
    [admin, login, logout, lockIdle],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
