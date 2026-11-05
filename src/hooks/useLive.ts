import { useContext } from 'react';
import { LiveContext } from '@/contexts/live/liveContext';
import type { LiveEvent } from '@/utils/liveStream';
import { type NotificationCenter, useLiveEvents } from '@/utils/useNotificationCenter';

/** Thông báo + trạng thái realtime của admin (null ngoài AdminLayout) */
export function useLive(): NotificationCenter | null {
  return useContext(LiveContext);
}

/**
 * Tự chạy lại {@code onEvent} khi có sự kiện realtime khớp (tiền tố type), ví dụ
 * useLiveRefresh(['LISTING_', 'REVISION_'], reload).
 */
export function useLiveRefresh(types: string[], onEvent: (event: LiveEvent) => void): void {
  useLiveEvents(useContext(LiveContext)?.subscribe, types, onEvent);
}
