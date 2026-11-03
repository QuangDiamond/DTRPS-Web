import i18n from 'i18next';
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
];

/** Giống system_settings.session_timeout_minutes (mặc định 30) — đọc từ API khi backend có */
const SESSION_TIMEOUT_MINUTES = 30;

/** Tự đăng xuất khi admin không thao tác quá thời gian cho phép */
export function useIdleLogout(): void {
  const { admin, logout } = useAuth();
  const { showToast } = useToast();
  const timeoutMinutes = SESSION_TIMEOUT_MINUTES;

  useEffect(() => {
    if (!admin) return;
    let timer = 0;
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        logout();
        showToast(i18n.t('session.idleLogout', { minutes: timeoutMinutes }), 'info');
      }, timeoutMinutes * 60_000);
    };

    reset();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, reset));
    };
  }, [admin, logout, showToast, timeoutMinutes]);
}
