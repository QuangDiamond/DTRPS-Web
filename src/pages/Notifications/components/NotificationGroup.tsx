import type { AdminNotification } from '../../../types/admin';
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
  if (notifications.length === 0) return null;
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <div className={`flex flex-col gap-space-sm ${variant === 'earlier' ? 'mt-space-sm' : ''}`}>
      <div className="flex items-center justify-between px-space-xs">
        {variant === 'today' ? (
          <>
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm font-bold tracking-wider text-primary uppercase">
                Hôm nay
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {unread} mới
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-outline">
              Đồng bộ đám mây: Vừa xong
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-space-xs">
              <span className="font-label-sm text-label-sm font-bold tracking-wider text-outline uppercase">
                Trước đó
              </span>
              <span className="font-body-sm text-body-sm text-outline">Đã lưu trữ tự động</span>
            </div>
            <span className="font-body-sm text-body-sm text-outline">
              {unread > 0 ? `${unread} mục chưa đọc` : 'Tất cả mục đã đọc'}
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
