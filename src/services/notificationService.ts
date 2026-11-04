import type {
  BroadcastPayload,
  BroadcastResult,
  NotificationRules,
  NotificationsSnapshot,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, writeRequest, writeRequestWithResult } from './request';

/** Dữ liệu khởi tạo của store thông báo */
export const notificationsSource = createSource<NotificationsSnapshot>(
  ENDPOINTS.notifications.snapshot,
);

export const notificationService = {
  markRead: (id: string) => writeRequest(ENDPOINTS.notifications.markRead(id), 'POST'),
  markAllRead: () => writeRequest(ENDPOINTS.notifications.markAllRead, 'POST'),
  saveRules: (rules: NotificationRules) =>
    writeRequest(ENDPOINTS.notifications.rules, 'PUT', rules),
  /** Gửi thông báo hàng loạt; server trả về số người nhận */
  broadcast: (payload: BroadcastPayload) =>
    writeRequestWithResult<BroadcastResult>(ENDPOINTS.notifications.broadcast, 'POST', payload),
};
