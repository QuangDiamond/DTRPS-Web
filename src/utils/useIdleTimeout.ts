import { useEffect, useRef } from 'react';

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'wheel',
];

/** Kiểm tra định kỳ — so theo mốc thời gian thật nên tab nền bị trình duyệt làm chậm vẫn đúng */
const CHECK_EVERY_MS = 15_000;

/**
 * Gọi onIdle khi CHÍNH TAB NÀY không có thao tác trong `minutes` phút.
 * Mỗi tab đếm riêng: dùng tab khác không làm tab này "còn hoạt động", và tab này hết giờ
 * cũng không ảnh hưởng tab khác (onIdle chỉ nên khoá tab hiện tại).
 */
export function useIdleTimeout(active: boolean, minutes: number, onIdle: () => void): void {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!active) return;
    const limit = minutes * 60_000;
    let lastActivity = Date.now();
    let fired = false;

    const touch = () => {
      lastActivity = Date.now();
    };
    const check = () => {
      if (fired || Date.now() - lastActivity < limit) return;
      fired = true;
      onIdleRef.current();
    };
    // Quay lại tab sau một lúc: kiểm tra ngay trước khi tính là có thao tác mới
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, touch, { passive: true }));
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', check);
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, touch));
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', check);
      window.clearInterval(timer);
    };
  }, [active, minutes]);
}

/** Cờ "tab này đã bị khoá vì không thao tác" — lưu trong sessionStorage nên chỉ riêng tab hiện tại */
export function tabLock(key: string) {
  return {
    isLocked(): boolean {
      try {
        return window.sessionStorage.getItem(key) === '1';
      } catch {
        return false;
      }
    },
    lock(): void {
      try {
        window.sessionStorage.setItem(key, '1');
      } catch {
        // storage bị chặn: tab vẫn bị đưa về trang đăng nhập trong lần này
      }
    },
    unlock(): void {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        // bỏ qua
      }
    },
  };
}
