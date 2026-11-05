import { useCallback, useEffect, useState } from 'react';

/** Đếm ngược theo giây (theo mốc thời gian thật, tab nền vẫn đúng). restart(n) để chạy lại. */
export function useCountdown(initialSeconds = 0) {
  const [deadline, setDeadline] = useState(() => Date.now() + initialSeconds * 1000);
  const [left, setLeft] = useState(initialSeconds);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [deadline]);

  const restart = useCallback((seconds: number) => setDeadline(Date.now() + seconds * 1000), []);
  return { left, restart };
}

/** 125 → "02:05" */
export const formatClock = (seconds: number): string =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
