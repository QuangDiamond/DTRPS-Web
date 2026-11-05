import { createContext, useContext } from 'react';
import type { LiveEvent } from '@/utils/liveStream';
import { type NotificationCenter, useLiveEvents } from '@/utils/useNotificationCenter';

/** Thông báo + sự kiện realtime của người dùng đang đăng nhập (null với khách) */
export const ClientLiveContext = createContext<NotificationCenter | null>(null);

export function useClientLive(): NotificationCenter | null {
  return useContext(ClientLiveContext);
}

/** Tự chạy lại {@code onEvent} khi có sự kiện realtime khớp tiền tố type, ví dụ ['LISTING_'] */
export function useClientLiveRefresh(types: string[], onEvent: (event: LiveEvent) => void): void {
  useLiveEvents(useContext(ClientLiveContext)?.subscribe, types, onEvent);
}
