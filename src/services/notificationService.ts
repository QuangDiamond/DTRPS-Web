import { DEFAULT_NOTIFICATION_RULES } from '@/constants/notification';
import { MOCK_NOTIFICATIONS, NOTIFICATION_BASE_STATS } from '@/mocks/data/mockNotifications';
import type {
  BroadcastPayload,
  BroadcastResult,
  NotificationRules,
  NotificationsSnapshot,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, writeRequest, writeRequestWithResult } from './request';

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
  /** Gửi thông báo hàng loạt; mock dùng số người nhận ước tính ở client */
  broadcast: (payload: BroadcastPayload, estimatedRecipients: number) =>
    writeRequestWithResult<BroadcastResult>(
      ENDPOINTS.notifications.broadcast,
      'POST',
      payload,
      () => ({
        id: `BC-${Date.now().toString(36).toUpperCase()}`,
        recipients: estimatedRecipients,
        sentAt: new Date().toISOString(),
      }),
    ),
};
