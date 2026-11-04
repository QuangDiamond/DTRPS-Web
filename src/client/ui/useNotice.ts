import { useCallback, useEffect, useState } from 'react';

/** Lấy thông báo được trang trước gửi kèm khi chuyển trang: navigate(to, { state: { notice } }) */
export function routeNotice(state: unknown): string | null {
  if (typeof state === 'object' && state !== null && 'notice' in state) {
    const { notice } = state as { notice: unknown };
    if (typeof notice === 'string') return notice;
  }
  return null;
}

/** Thông báo ngắn tự ẩn sau 2,5 giây (hiển thị bằng NoticeToast) */
export function useNotice(
  initial: string | null = null,
): [string | null, (message: string) => void] {
  const [notice, setNotice] = useState<string | null>(initial);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const show = useCallback((message: string) => setNotice(message), []);
  return [notice, show];
}
