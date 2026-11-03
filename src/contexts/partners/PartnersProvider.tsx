import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks';
import { partnerService } from '@/services/partnerService';
import type { LoadStatus, Partner, PartnerStats } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { PartnersContext } from './partnersContext';

const EMPTY_STATS: PartnerStats = {
  total: 0,
  pending: 0,
  active: 0,
  suspended: 0,
  rejected: 0,
  newThisMonth: 0,
};

/**
 * Store đối tác (hồ sơ doanh nghiệp) — dữ liệu thật từ backend.
 * Giữ số liệu tổng quan + thao tác duyệt / từ chối / khóa; danh sách do từng trang tự tải theo trang & bộ lọc.
 * Mọi thao tác được backend ghi vào audit log.
 */
export default function PartnersProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const [stats, setStats] = useState<PartnerStats>(EMPTY_STATS);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      setStats(await partnerService.stats());
      setError(null);
      setStatus('ready');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (admin) void loadStats();
  }, [admin, loadStats]);

  /** Sau mỗi thao tác ghi: cập nhật số liệu và báo các trang tải lại */
  const afterWrite = useCallback(
    (partner: Partner) => {
      setVersion((current) => current + 1);
      void loadStats();
      return partner;
    },
    [loadStats],
  );

  const approve = useCallback(
    (id: string) => partnerService.approve(id).then(afterWrite),
    [afterWrite],
  );
  const reject = useCallback(
    (id: string, reason: string) => partnerService.reject(id, reason).then(afterWrite),
    [afterWrite],
  );
  const lock = useCallback(
    (id: string, reason: string) => partnerService.lock(id, reason).then(afterWrite),
    [afterWrite],
  );
  const unlock = useCallback(
    (id: string) => partnerService.unlock(id).then(afterWrite),
    [afterWrite],
  );

  const dataStatus = useMemo(
    () => ({
      status,
      error,
      reload: () => {
        setStatus('loading');
        void loadStats();
      },
    }),
    [status, error, loadStats],
  );

  const value = useMemo(
    () => ({ stats, dataStatus, version, approve, reject, lock, unlock }),
    [stats, dataStatus, version, approve, reject, lock, unlock],
  );

  return <PartnersContext.Provider value={value}>{children}</PartnersContext.Provider>;
}
