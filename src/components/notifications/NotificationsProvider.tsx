import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { MOCK_NOTIFICATIONS, NOTIFICATION_BASE_STATS } from '../../constants/mockNotifications';
import { DEFAULT_NOTIFICATION_RULES } from '../../constants/notification';
import { NotificationsContext } from '../../contexts/notifications';
import type { AdminNotification, NotificationRules, NotificationStats } from '../../types/admin';

const isSystemAlert = (notification: AdminNotification): boolean =>
  notification.category === 'system' &&
  !notification.read &&
  (notification.priority === 'urgent' || notification.priority === 'high');

const INITIAL_UNREAD = MOCK_NOTIFICATIONS.filter((item) => !item.read).length;
const INITIAL_SYSTEM_ALERTS = MOCK_NOTIFICATIONS.filter(isSystemAlert).length;

/** Store thông báo quản trị. Khi có backend: thay state bằng API + websocket realtime. */
export default function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(MOCK_NOTIFICATIONS);
  const [rules, setRules] = useState<NotificationRules>(DEFAULT_NOTIFICATION_RULES);
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  const markAsRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id && !item.read ? { ...item, read: true } : item)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    const count = notificationsRef.current.filter((item) => !item.read).length;
    if (count > 0) {
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    }
    return count;
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  // KPI = số liệu toàn hệ thống của Stitch + chênh lệch so với dữ liệu mẫu ban đầu
  const stats = useMemo<NotificationStats>(
    () => ({
      ...NOTIFICATION_BASE_STATS,
      unread: Math.max(0, NOTIFICATION_BASE_STATS.unread + unreadCount - INITIAL_UNREAD),
      systemAlerts: Math.max(
        0,
        NOTIFICATION_BASE_STATS.systemAlerts +
          notifications.filter(isSystemAlert).length -
          INITIAL_SYSTEM_ALERTS,
      ),
    }),
    [notifications, unreadCount],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      stats,
      rules,
      markAsRead,
      markAllAsRead,
      updateRules: setRules,
    }),
    [notifications, unreadCount, stats, rules, markAsRead, markAllAsRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
