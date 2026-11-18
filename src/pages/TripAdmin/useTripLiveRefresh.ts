import { useEffect, useRef } from 'react';
import { useLiveRefresh } from '@/hooks';

const LIVE_EVENTS = ['TRIP_PLAN_'];
/** Khách thao tác liên tiếp (tạo lịch trình, đánh dấu nhiều điểm) chỉ tải lại một lần */
const REFRESH_DELAY_MS = 400;

/**
 * Tự tải lại khi khách cập nhật chuyến đi. Có {@code tripId} thì chỉ phản ứng với chuyến đó (sự
 * kiện không rõ chuyến nào vẫn tải lại cho chắc).
 */
export function useTripLiveRefresh(refresh: () => void, tripId?: string): void {
  const timer = useRef<number | undefined>(undefined);

  useLiveRefresh(LIVE_EVENTS, (event) => {
    const eventTrip = event.data?.planId;
    if (tripId && eventTrip !== undefined && String(eventTrip) !== tripId) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(refresh, REFRESH_DELAY_MS);
  });

  useEffect(() => () => window.clearTimeout(timer.current), []);
}
