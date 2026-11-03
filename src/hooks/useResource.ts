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
 * Dữ liệu được tải qua `loader` khi component mount.
 * Component dùng hook này nên được gắn `key` theo id bản ghi để tải lại khi đổi bản ghi.
 */
export function useResource<T>(
  loader: () => Promise<T>,
): ResourceState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [status, setStatus] = useState<LoadStatus>('loading');
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
    void load();
  }, [load]);

  return { data, status, error, reload: () => void load() };
}
