import { useCallback, useEffect, useRef } from 'react';
import { useBlocker, type Blocker } from 'react-router-dom';

interface UnsavedChangesGuard {
  /** Trạng thái chặn điều hướng — truyền vào <UnsavedChangesDialog> */
  blocker: Blocker;
  /** Cho phép lần điều hướng kế tiếp đi qua (ví dụ ngay sau khi lưu thành công) */
  allowNextNavigation: () => void;
}

/**
 * Chặn rời trang khi form còn thay đổi chưa lưu:
 * - Điều hướng trong app → hỏi xác nhận bằng dialog (useBlocker)
 * - Tải lại / đóng tab → hộp thoại mặc định của trình duyệt (beforeunload)
 */
export function useUnsavedChangesGuard(isDirty: boolean): UnsavedChangesGuard {
  const allowRef = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !allowRef.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const allowNextNavigation = useCallback(() => {
    allowRef.current = true;
  }, []);

  return { blocker, allowNextNavigation };
}
