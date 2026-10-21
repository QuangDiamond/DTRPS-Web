import { useTranslation } from 'react-i18next';
import type { AdminNotification } from '@/types';
import NotificationItem from './NotificationItem';

interface NotificationGroupProps {
  variant: 'today' | 'earlier';
  notifications: AdminNotification[];
  onAction: (notification: AdminNotification) => void;
  onMarkRead: (notification: AdminNotification) => void;
}

/** Nhóm thông báo theo ngày: "Hôm nay" / "Trước đó" */
export default function NotificationGroup({
  variant,
  notifications,
  onAction,
  onMarkRead,
}: NotificationGroupProps) {
  const { t } = useTranslation();
  if (notifications.length === 0) return null;
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <div className={`flex flex-col gap-space-sm ${variant === 'earlier' ? 'mt-space-sm' : ''}`}>
      <div className="flex items-center justify-between px-space-xs">
        {variant === 'today' ? (
          <>
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm font-bold tracking-wider text-primary uppercase">
                {t('notifications.notificationGroup.today')}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {t('notifications.notificationGroup.new', { unread })}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-outline">
              {t('notifications.notificationGroup.cloudSyncJustNow')}
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm font-bold tracking-wider text-outline uppercase">
                {t('notifications.notificationGroup.earlier')}
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                {t('notifications.notificationGroup.archivedAutomatically')}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-outline">
              {unread > 0
                ? t('notifications.notificationGroup.unreadItems', { count: unread })
                : t('notifications.notificationGroup.allItemsRead')}
            </span>
          </>
        )}
      </div>
      <div className="flex flex-col gap-space-xs">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onAction={onAction}
            onMarkRead={onMarkRead}
          />
        ))}
      </div>
    </div>
  );
}
