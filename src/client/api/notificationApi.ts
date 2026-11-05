import { clientRequest } from '@/client/api/http';
import type { AppNotification, NotificationPageResult } from '@/utils/useNotificationCenter';

/** Thông báo của người dùng đang đăng nhập (du khách / đối tác) */
export const notificationApi = {
  list: () => clientRequest<NotificationPageResult>('/notifications?size=30'),
  unreadCount: () =>
    clientRequest<{ unread: number }>('/notifications/unread-count').then((r) => r.unread),
  markRead: (id: number) =>
    clientRequest<AppNotification>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => clientRequest<unknown>('/notifications/read-all', { method: 'POST' }),
};
