import type { AppNotification, NotificationPageResult } from '@/utils/useNotificationCenter';
import { apiRequest } from './httpClient';

/** Thông báo thật của admin đang đăng nhập (GET/POST /api/notifications) */
export const notificationService = {
  list: () => apiRequest<NotificationPageResult>('/notifications', { query: { size: 30 } }),
  unreadCount: () =>
    apiRequest<{ unread: number }>('/notifications/unread-count').then((result) => result.unread),
  markRead: (id: number) =>
    apiRequest<AppNotification>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => apiRequest<unknown>('/notifications/read-all', { method: 'POST' }),
};
