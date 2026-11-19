import type {
  AppNotification,
  NotificationPageResult,
  NotificationQuery,
} from '@/utils/useNotificationCenter';
import { apiRequest } from './httpClient';

/** Thông báo thật của admin đang đăng nhập (GET/POST /api/notifications) */
export const notificationService = {
  list: ({ category, unread, page, size }: NotificationQuery) =>
    apiRequest<NotificationPageResult>('/notifications', {
      query: { page, size, category, unread: unread || undefined },
    }),
  unreadCount: () =>
    apiRequest<{ unread: number }>('/notifications/unread-count').then((result) => result.unread),
  markRead: (id: number) =>
    apiRequest<AppNotification>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => apiRequest<unknown>('/notifications/read-all', { method: 'POST' }),
};
