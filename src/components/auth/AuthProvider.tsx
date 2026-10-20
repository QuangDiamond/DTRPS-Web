import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { AuthContext } from '../../contexts/auth';
import * as authService from '../../services/authService';
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

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const profile = await authService.login(email, password);
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
    clearStoredAdmin();
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, login, logout }), [admin, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
