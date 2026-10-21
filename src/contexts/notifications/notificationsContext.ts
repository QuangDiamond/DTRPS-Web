import { createContext } from 'react';
import type { AdminNotification, DataStatus, NotificationRules, NotificationStats } from '@/types';

export interface NotificationsContextValue {
  notifications: AdminNotification[];
  /** Số thông báo chưa đọc trong danh sách hiện có (badge Sidebar / Header) */
  unreadCount: number;
  stats: NotificationStats;
  rules: NotificationRules;
  /** Trạng thái tải dữ liệu từ server */
  dataStatus: DataStatus;
  markAsRead: (id: string) => void;
  /** Trả về số thông báo vừa được đánh dấu */
  markAllAsRead: () => number;
  updateRules: (rules: NotificationRules) => void;
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);
