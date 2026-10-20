import { Fragment } from 'react';
import Icon from '../../../components/common/Icon';
import type { AdminNotification, NotificationAction } from '../../../types/admin';
import { formatNotificationTime } from '../notificationUtils';

const ACTION_VARIANT_CLASS: Record<NotificationAction['variant'], string> = {
  primary: 'bg-primary text-on-primary shadow-sm hover:bg-secondary',
  tertiary: 'bg-tertiary text-on-tertiary shadow-sm hover:opacity-90',
  neutral: 'bg-surface-container-low text-on-surface hover:bg-surface-container-high',
};

interface NotificationItemProps {
  notification: AdminNotification;
  onAction: (notification: AdminNotification) => void;
  onMarkRead: (notification: AdminNotification) => void;
}

export default function NotificationItem({
  notification,
  onAction,
  onMarkRead,
}: NotificationItemProps) {
  const { read, action, tag } = notification;

  return (
    <div
      className={`flex flex-col justify-between gap-space-md rounded-2xl p-space-md shadow-sm transition-all hover:shadow-md md:flex-row md:items-center ${
        read
          ? 'bg-surface-container-lowest/60 hover:bg-surface-container-lowest'
          : 'bg-surface-container-lowest'
      }`}
    >
      <div className="flex min-w-0 items-start gap-space-md">
        <div className="relative shrink-0">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${notification.iconBoxClass}`}
          >
            <Icon name={notification.icon} className="text-[24px]" />
          </div>
          {!read && (
            <span
              className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full ring-2 ring-surface-container-lowest ${notification.dotClass}`}
            />
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-title-md text-title-md font-semibold text-on-surface">
              {notification.title}
            </span>
            <span
              className={`flex items-center gap-1 rounded-full px-space-xs py-0.5 font-label-sm text-label-sm font-bold ${tag.className}`}
            >
              {tag.icon && <Icon name={tag.icon} className="text-[14px]" />} {tag.label}
            </span>
            <span className="font-body-sm text-body-sm text-outline">
              • {formatNotificationTime(notification.createdAt)}
            </span>
          </div>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            {notification.message.map((part, index) =>
              part.strong ? (
                <strong
                  key={index}
                  className={`font-semibold ${part.tone === 'tertiary' ? 'text-tertiary' : 'text-on-surface'}`}
                >
                  {part.text}
                </strong>
              ) : (
                <Fragment key={index}>{part.text}</Fragment>
              ),
            )}
          </p>
          {notification.meta.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-space-sm font-label-sm text-label-sm text-outline">
              {notification.meta.map((meta, index) => (
                <Fragment key={meta.text}>
                  {index > 0 && <span>•</span>}
                  <span className="flex items-center gap-1">
                    {meta.icon && <Icon name={meta.icon} className="text-[15px]" />} {meta.text}
                  </span>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-space-xs self-end md:self-center">
        <button
          type="button"
          onClick={() => onAction(notification)}
          className={`flex h-9 items-center gap-1 rounded-full px-space-md font-label-sm text-label-sm font-semibold transition-colors ${ACTION_VARIANT_CLASS[action.variant]}`}
        >
          <span>{action.label}</span>
          {action.icon && <Icon name={action.icon} className="text-[16px]" />}
        </button>
        {!read && (
          <button
            type="button"
            title="Đánh dấu đã đọc"
            onClick={() => onMarkRead(notification)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
          >
            <Icon name="check" className="text-[18px]" />
          </button>
        )}
      </div>
    </div>
  );
}
