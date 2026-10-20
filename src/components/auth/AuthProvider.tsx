import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext } from '../../contexts/auth';
import { useToast } from '../../hooks/useToast';
import * as authService from '../../services/authService';
import { onUnauthorized } from '../../services/httpClient';
import { clearAccessToken } from '../../services/tokenStore';
import type { AdminProfile } from '../../types/admin';

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
  const [admin, setAdmin] = useState<AdminProfile | null>(readStoredAdmin);
  const { showToast } = useToast();

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const profile = await authService.login(email, password, remember);
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
    clearStoredAdmin();
    setAdmin(null);
  }, []);

  // API trả 401 (token hết hạn / bị thu hồi) → đăng xuất và báo cho người dùng
  useEffect(() => {
    onUnauthorized(() => {
      clearAccessToken();
      clearStoredAdmin();
      setAdmin(null);
      showToast('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'info');
    });
    return () => onUnauthorized(null);
  }, [showToast]);

  const value = useMemo(() => ({ admin, login, logout }), [admin, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
