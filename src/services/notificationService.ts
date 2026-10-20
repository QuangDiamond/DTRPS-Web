import { MOCK_NOTIFICATIONS, NOTIFICATION_BASE_STATS } from '../constants/mockNotifications';
import { DEFAULT_NOTIFICATION_RULES } from '../constants/notification';
import type { NotificationRules } from '../types/admin';
import type { NotificationsSnapshot } from '../types/api';
import { ENDPOINTS } from './endpoints';
import { createSource, writeRequest } from './request';

const MOCK_SNAPSHOT: NotificationsSnapshot = {
  notifications: MOCK_NOTIFICATIONS,
  stats: NOTIFICATION_BASE_STATS,
  rules: DEFAULT_NOTIFICATION_RULES,
};

/** Dữ liệu khởi tạo của store thông báo */
export const notificationsSource = createSource(ENDPOINTS.notifications.snapshot, MOCK_SNAPSHOT);

export const notificationService = {
  markRead: (id: string) => writeRequest(ENDPOINTS.notifications.markRead(id), 'POST'),
  markAllRead: () => writeRequest(ENDPOINTS.notifications.markAllRead, 'POST'),
  saveRules: (rules: NotificationRules) =>
    writeRequest(ENDPOINTS.notifications.rules, 'PUT', rules),
};
