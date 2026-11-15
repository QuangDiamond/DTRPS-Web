import { useCallback, useEffect, useState } from 'react';
import { reviewAdminService } from '@/services/reviewAdminService';
import { useLiveRefresh } from './useLive';

/** Sự kiện làm số đếm đổi: có báo cáo mới, báo cáo được xử lý, đánh giá bị ẩn / hiện */
const LIVE_EVENTS = ['PLACE_REVIEW_'];

/** Số đánh giá đang có báo cáo chờ xử lý (badge menu "Quản lý đánh giá"), tự cập nhật realtime */
export function usePendingReviewReports(): number {
  const [count, setCount] = useState(0);
  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload((n) => n + 1), []);
  useLiveRefresh(LIVE_EVENTS, refresh);

  useEffect(() => {
    let active = true;
    reviewAdminService
      .stats()
      .then((stats) => active && setCount(stats.reportedPending))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [reload]);

  return count;
}
