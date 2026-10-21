import { useCallback, useEffect, useRef, useState } from 'react';
import type { LoadStatus } from '@/types';
import { getErrorMessage } from '@/utils/error';

export interface ResourceState<T> {
  data: T | undefined;
  status: LoadStatus;
  error: string | null;
  reload: () => void;
}

/**
 * Dữ liệu riêng của một trang (hồ sơ chi tiết, tổng quan...).
 * `peek` trả dữ liệu có sẵn ngay (chế độ mock) — nếu undefined thì gọi `loader` để tải từ server.
 * Component dùng hook này nên được gắn `key` theo id bản ghi để tải lại khi đổi bản ghi.
 */
export function useResource<T>(
  loader: () => Promise<T>,
  peek: () => T | undefined,
): ResourceState<T> {
  const [initial] = useState(peek);
  const [data, setData] = useState<T | undefined>(initial);
  const [status, setStatus] = useState<LoadStatus>(initial === undefined ? 'loading' : 'ready');
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      setData(await loaderRef.current());
      setStatus('ready');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (initial === undefined) void load();
  }, [initial, load]);

  return { data, status, error, reload: () => void load() };
}
