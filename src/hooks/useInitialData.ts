import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DataSource, DataStatus, LoadStatus } from '../types/api';
import { getErrorMessage } from '../utils/error';

/**
 * Tải dữ liệu khởi tạo cho một store.
 * - Chế độ mock: source.seed có sẵn → trạng thái "ready" ngay, không gọi mạng.
 * - Chế độ API: gọi source.load() khi `enabled` (đã đăng nhập), rồi đổ dữ liệu vào store qua `apply`.
 */
export function useInitialData<S>(
  source: DataSource<S>,
  apply: (snapshot: S) => void,
  enabled = true,
): DataStatus {
  const [status, setStatus] = useState<LoadStatus>(source.seed ? 'ready' : 'loading');
  const [error, setError] = useState<string | null>(null);
  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      applyRef.current(await source.load());
      setStatus('ready');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  }, [source]);

  useEffect(() => {
    if (enabled && !source.seed) void load();
  }, [enabled, source, load]);

  return useMemo(() => ({ status, error, reload: () => void load() }), [status, error, load]);
}
