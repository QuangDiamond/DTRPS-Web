import { clientRequest } from '@/client/api/http';
import type {
  AppNotification,
  NotificationPageResult,
  NotificationQuery,
} from '@/utils/useNotificationCenter';

/** Thông báo của người dùng đang đăng nhập (du khách / đối tác) */
export const notificationApi = {
  list: ({ category, unread, page, size }: NotificationQuery) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (category) params.set('category', category);
    if (unread) params.set('unread', 'true');
    return clientRequest<NotificationPageResult>(`/notifications?${params.toString()}`);
  },
  unreadCount: () =>
    clientRequest<{ unread: number }>('/notifications/unread-count').then((r) => r.unread),
  markRead: (id: number) =>
    clientRequest<AppNotification>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => clientRequest<unknown>('/notifications/read-all', { method: 'POST' }),
};
