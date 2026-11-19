import { useCallback, useEffect, useRef, useState } from 'react';

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'wheel',
];

/** Ghi mốc thao tác vào storage tối đa mỗi 5 giây (mousemove bắn rất dày) */
const WRITE_EVERY_MS = 5_000;
const CHECK_EVERY_MS = 1_000;

/**
 * Mốc thao tác cuối dùng chung cho MỌI tab (localStorage): đang làm ở tab nào cũng giữ phiên,
 * và tải lại trang / mở tab mới không làm bộ đếm chạy lại từ đầu.
 */
export function activityClock(key: string) {
  return {
    read(): number | null {
      try {
        const value = Number(window.localStorage.getItem(key));
        return Number.isFinite(value) && value > 0 ? value : null;
      } catch {
        return null;
      }
    },
    touch(at = Date.now()): void {
      try {
        window.localStorage.setItem(key, String(at));
      } catch {
        // storage bị chặn: chỉ còn bộ đếm trong tab này
      }
    },
    clear(): void {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // bỏ qua
      }
    },
    /** Đã quá `minutes` phút kể từ thao tác cuối (chưa có mốc thì coi như chưa quá) */
    expired(minutes: number, now = Date.now()): boolean {
      const last = this.read();
      return last !== null && now - last >= minutes * 60_000;
    },
  };
}

export type ActivityClock = ReturnType<typeof activityClock>;

/**
 * Hết `minutes` phút không thao tác ở bất kỳ tab nào → onIdle. Trước đó `warnSeconds` giây trả về
 * số giây còn lại để hiện cảnh báo; lúc đang cảnh báo, rê chuột không tính — phải bấm "Tiếp tục"
 * (stayActive) như các trang ngân hàng / quản trị.
 */
export function useIdleTimeout(
  active: boolean,
  clock: ActivityClock,
  minutes: number,
  warnSeconds: number,
  onIdle: () => void,
): { secondsLeft: number | null; stayActive: () => void } {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const warningRef = useRef(false);

  const stayActive = useCallback(() => {
    clock.touch();
    warningRef.current = false;
    setSecondsLeft(null);
  }, [clock]);

  useEffect(() => {
    if (!active) {
      warningRef.current = false;
      setSecondsLeft(null);
      return;
    }
    const limit = minutes * 60_000;
    let lastWrite = 0;
    let fired = false;
    if (clock.read() === null) clock.touch();

    const touch = () => {
      if (warningRef.current) return;
      const now = Date.now();
      if (now - lastWrite < WRITE_EVERY_MS) return;
      lastWrite = now;
      clock.touch(now);
    };
    const check = () => {
      if (fired) return;
      const last = clock.read() ?? Date.now();
      const left = Math.ceil((last + limit - Date.now()) / 1000);
      if (left <= 0) {
        fired = true;
        warningRef.current = false;
        setSecondsLeft(null);
        onIdleRef.current();
      } else if (left <= warnSeconds) {
        warningRef.current = true;
        setSecondsLeft(left);
      } else if (warningRef.current) {
        // Tab khác vừa có thao tác → bỏ cảnh báo ở tab này
        warningRef.current = false;
        setSecondsLeft(null);
      }
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, touch, { passive: true }));
    window.addEventListener('focus', check);
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    check();
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, touch));
      window.removeEventListener('focus', check);
      window.clearInterval(timer);
    };
  }, [active, clock, minutes, warnSeconds]);

  return { secondsLeft, stayActive };
}
