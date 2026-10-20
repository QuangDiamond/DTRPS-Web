import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSettings } from './useSettings';
import { useToast } from './useToast';

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
];

/** Tự đăng xuất khi admin không thao tác quá "Thời gian tự động đăng xuất" trong Cài đặt hệ thống */
export function useIdleLogout(): void {
  const { admin, logout } = useAuth();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const timeoutMinutes = settings.sessionTimeoutMinutes;

  useEffect(() => {
    if (!admin) return;
    let timer = 0;
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        logout();
        showToast(`Phiên đăng nhập đã kết thúc sau ${timeoutMinutes} phút không thao tác`, 'info');
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
