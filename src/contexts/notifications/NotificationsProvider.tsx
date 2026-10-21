import i18n from 'i18next';
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { DEFAULT_NOTIFICATION_RULES } from '@/constants/notification';
import { useAuth, useInitialData, usePersist } from '@/hooks';
import { notificationService, notificationsSource } from '@/services/notificationService';
import type { AdminNotification, NotificationRules, NotificationStats } from '@/types';
import { NotificationsContext } from './notificationsContext';

const isSystemAlert = (notification: AdminNotification): boolean =>
  notification.category === 'system' &&
  !notification.read &&
  (notification.priority === 'urgent' || notification.priority === 'high');

function countNotifications(notifications: AdminNotification[]) {
  return {
    unread: notifications.filter((item) => !item.read).length,
    systemAlerts: notifications.filter(isSystemAlert).length,
  };
}

const EMPTY_STATS: NotificationStats = {
  unread: 0,
  newLastHour: 0,
  systemAlerts: 0,
  systemAlertNote: '',
  resolvedRate: 0,
  avgResponseMinutes: 0,
  byTab: { all: 0, listings: 0, users: 0, system: 0 },
};

/** Store thông báo quản trị. Khi có backend: dữ liệu tải qua API (có thể bổ sung websocket realtime). */
export default function NotificationsProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const seed = notificationsSource.seed;
  const [notifications, setNotifications] = useState<AdminNotification[]>(
    seed?.notifications ?? [],
  );
  const [baseStats, setBaseStats] = useState<NotificationStats>(seed?.stats ?? EMPTY_STATS);
  const [rules, setRules] = useState<NotificationRules>(seed?.rules ?? DEFAULT_NOTIFICATION_RULES);
  const [loadedCounts, setLoadedCounts] = useState(() =>
    countNotifications(seed?.notifications ?? []),
  );

  const dataStatus = useInitialData(
    notificationsSource,
    (snapshot) => {
      setNotifications(snapshot.notifications);
      setBaseStats(snapshot.stats);
      setRules(snapshot.rules);
      setLoadedCounts(countNotifications(snapshot.notifications));
    },
    Boolean(admin),
  );
  const persist = usePersist(dataStatus.reload);

  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  const markAsRead = useCallback(
    (id: string) => {
      const target = notificationsRef.current.find((item) => item.id === id && !item.read);
      if (!target) return;
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, read: true } : item)),
      );
      persist(
        notificationService.markRead(id),
        i18n.t('stores.notifications.couldNotUpdateNotification'),
      );
    },
    [persist],
  );

  const markAllAsRead = useCallback(() => {
    const count = notificationsRef.current.filter((item) => !item.read).length;
    if (count > 0) {
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      persist(
        notificationService.markAllRead(),
        i18n.t('stores.notifications.couldNotUpdateNotification'),
      );
    }
    return count;
  }, [persist]);

  const updateRules = useCallback(
    (next: NotificationRules) => {
      setRules(next);
      persist(
        notificationService.saveRules(next),
        i18n.t('stores.notifications.couldNotSaveNotification'),
      );
    },
    [persist],
  );

  const current = countNotifications(notifications);
  const unreadCount = current.unread;

  // KPI = số liệu toàn hệ thống + chênh lệch so với dữ liệu lúc tải
  const stats = useMemo<NotificationStats>(
    () => ({
      ...baseStats,
      unread: Math.max(0, baseStats.unread + unreadCount - loadedCounts.unread),
      systemAlerts: Math.max(
        0,
        baseStats.systemAlerts +
          notifications.filter(isSystemAlert).length -
          loadedCounts.systemAlerts,
      ),
    }),
    [baseStats, notifications, unreadCount, loadedCounts],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      stats,
      rules,
      dataStatus,
      markAsRead,
      markAllAsRead,
      updateRules,
    }),
    [notifications, unreadCount, stats, rules, dataStatus, markAsRead, markAllAsRead, updateRules],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}
