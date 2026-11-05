import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '@/client/api/authApi';
import { bindSession } from '@/client/api/http';
import type { AuthResponse, ClientUser, RoleName } from '@/client/api/types';
import { ClientAuthContext } from './clientAuthContext';
import { clientSessionEnd } from '@/utils/sessionEnd';
import { tabLock } from '@/utils/useIdleTimeout';
import { type ClientSession, clearSession, readSession, writeSession } from './sessionStorage';

/** Cờ khoá theo từng tab (sessionStorage) khi không thao tác 30 phút */
const idleLock = tabLock('smarttravel.client.idleLocked');

const toSession = (response: AuthResponse, remember: boolean): ClientSession => ({
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
  user: response.user,
  remember,
});

/** Phiên đăng nhập của du khách / đối tác (tách hoàn toàn với AuthProvider của admin) */
export default function ClientAuthProvider({ children }: { children: ReactNode }) {
  // Tab đã bị khoá vì không thao tác → coi như chưa đăng nhập cho tới khi đăng nhập lại
  const [session, setSession] = useState<ClientSession | null>(() =>
    idleLock.isLocked() ? null : readSession(),
  );
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
      onExpired: () => {
        // Phiên hết hạn / bị thu hồi khi đang dùng → trang đăng nhập giải thích lý do
        if (sessionRef.current) clientSessionEnd.set('expired');
        save(null);
      },
    });
    return () => bindSession(null);
  }, [refreshSession, save]);

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const response = await authApi.login(email, password);
      idleLock.unlock();
      clientSessionEnd.clear();
      save(toSession(response, remember));
      return response.user;
    },
    [save],
  );

  const logout = useCallback(() => {
    const current = sessionRef.current;
    if (current) authApi.revoke(current.refreshToken).catch(() => undefined);
    clientSessionEnd.clear();
    save(null);
  }, [save]);

  const lockIdle = useCallback(() => {
    idleLock.lock();
    clientSessionEnd.set('idle');
    // Không xoá phiên lưu chung, không thu hồi token: chỉ tab này phải đăng nhập lại
    sessionRef.current = null;
    setSession(null);
  }, []);

  const updateUser = useCallback(
    (next: ClientUser) => {
      const current = sessionRef.current;
      if (current) save({ ...current, user: next });
    },
    [save],
  );

  const user = session?.user ?? null;
  const hasRole = useCallback((role: RoleName) => Boolean(user?.roles.includes(role)), [user]);

  const value = useMemo(
    () => ({ user, login, logout, updateUser, refreshSession, hasRole, lockIdle }),
    [user, login, logout, updateUser, refreshSession, hasRole, lockIdle],
  );

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
}
