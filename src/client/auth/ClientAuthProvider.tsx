import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '@/client/api/authApi';
import { bindSession } from '@/client/api/http';
import type { AuthResponse, RoleName } from '@/client/api/types';
import { ClientAuthContext } from './clientAuthContext';
import { type ClientSession, clearSession, readSession, writeSession } from './sessionStorage';

const toSession = (response: AuthResponse, remember: boolean): ClientSession => ({
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
  user: response.user,
  remember,
});

/** Phiên đăng nhập của du khách / đối tác (tách hoàn toàn với AuthProvider của admin) */
export default function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ClientSession | null>(readSession);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  // Nhiều request cùng gặp 401 chỉ làm mới token một lần
  const refreshing = useRef<Promise<boolean> | null>(null);

  const save = useCallback((next: ClientSession | null) => {
    if (next) writeSession(next);
    else clearSession();
    sessionRef.current = next;
    setSession(next);
  }, []);

  const refreshSession = useCallback(() => {
    if (refreshing.current) return refreshing.current;
    const current = sessionRef.current;
    if (!current) return Promise.resolve(false);
    refreshing.current = authApi
      .refresh(current.refreshToken)
      .then((response) => {
        save(toSession(response, current.remember));
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshing.current = null;
      });
    return refreshing.current;
  }, [save]);

  useEffect(() => {
    bindSession({
      getAccessToken: () => sessionRef.current?.accessToken ?? null,
      refresh: refreshSession,
      onExpired: () => save(null),
    });
    return () => bindSession(null);
  }, [refreshSession, save]);

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const response = await authApi.login(email, password);
      save(toSession(response, remember));
      return response.user;
    },
    [save],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await authApi.register(name, email, password);
      save(toSession(response, true));
      return response.user;
    },
    [save],
  );

  const logout = useCallback(() => {
    const current = sessionRef.current;
    if (current) authApi.revoke(current.refreshToken).catch(() => undefined);
    save(null);
  }, [save]);

  const user = session?.user ?? null;
  const hasRole = useCallback((role: RoleName) => Boolean(user?.roles.includes(role)), [user]);

  const value = useMemo(
    () => ({ user, login, register, logout, refreshSession, hasRole }),
    [user, login, register, logout, refreshSession, hasRole],
  );

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
}
