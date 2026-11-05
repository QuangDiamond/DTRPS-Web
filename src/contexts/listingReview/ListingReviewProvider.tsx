import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks';
import { listingReviewService } from '@/services/listingReviewService';
import type { ListingReviewStats, RevisionRejectCode } from '@/types';
import { ListingReviewContext } from './listingReviewContext';

const EMPTY_STATS: ListingReviewStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  suspended: 0,
  pendingRevisions: 0,
};

/**
 * Store duyệt địa điểm (dữ liệu thật). Lỗi tải số liệu không chặn trang quản trị —
 * các trang danh sách / chi tiết tự hiển thị lỗi của mình.
 */
export default function ListingReviewProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const [stats, setStats] = useState<ListingReviewStats>(EMPTY_STATS);
  const [version, setVersion] = useState(0);

  const refreshStats = useCallback(() => {
    listingReviewService
      .stats()
      .then(setStats)
      .catch(() => {
        // Giữ số liệu cũ; trang danh sách sẽ báo lỗi kết nối
      });
  }, []);

  useEffect(() => {
    if (admin) refreshStats();
  }, [admin, refreshStats]);

  /** Sau mỗi thao tác ghi: cập nhật số liệu và báo các trang tải lại */
  const afterWrite = useCallback(
    <T,>(result: T): T => {
      setVersion((current) => current + 1);
      refreshStats();
      return result;
    },
    [refreshStats],
  );

  const refresh = useCallback(() => {
    setVersion((current) => current + 1);
    refreshStats();
  }, [refreshStats]);

  const approveListing = useCallback(
    (id: string) => listingReviewService.approveListing(id).then(afterWrite),
    [afterWrite],
  );
  const rejectListing = useCallback(
    (id: string, reason: string) => listingReviewService.rejectListing(id, reason).then(afterWrite),
    [afterWrite],
  );
  const approveRevision = useCallback(
    (id: string, note?: string) => listingReviewService.approveRevision(id, note).then(afterWrite),
    [afterWrite],
  );
  const rejectRevision = useCallback(
    (id: string, reasonCode: RevisionRejectCode, partnerFeedback: string, note?: string) =>
      listingReviewService.rejectRevision(id, reasonCode, partnerFeedback, note).then(afterWrite),
    [afterWrite],
  );

  const value = useMemo(
    () => ({
      stats,
      version,
      refreshStats,
      refresh,
      approveListing,
      rejectListing,
      approveRevision,
      rejectRevision,
    }),
    [
      stats,
      version,
      refreshStats,
      refresh,
      approveListing,
      rejectListing,
      approveRevision,
      rejectRevision,
    ],
  );

  return <ListingReviewContext.Provider value={value}>{children}</ListingReviewContext.Provider>;
}
