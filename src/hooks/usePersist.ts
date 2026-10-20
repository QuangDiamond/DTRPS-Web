import { useCallback } from 'react';
import { getErrorMessage } from '../utils/error';
import { useToast } from './useToast';

/**
 * Ghi thay đổi xuống server ở nền sau khi store đã cập nhật lạc quan (optimistic update).
 * Nếu server từ chối: báo lỗi cho người dùng và gọi onFailure (thường là tải lại dữ liệu
 * để giao diện khớp với server).
 */
export function usePersist(onFailure?: () => void) {
  const { showToast } = useToast();

  return useCallback(
    (task: Promise<unknown>, failMessage: string) => {
      task.catch((error: unknown) => {
        showToast(`${failMessage}: ${getErrorMessage(error)}`, 'error');
        onFailure?.();
      });
    },
    [showToast, onFailure],
  );
}
