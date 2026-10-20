import type { AdminNotification, NotificationPriority, NotificationTab } from '../../types/admin';
import { toIsoDate } from '../../utils/format';
import { normalizeText } from '../../utils/string';

export function filterNotifications(
  notifications: AdminNotification[],
  tab: NotificationTab,
  priority: NotificationPriority | 'all',
  search: string,
): AdminNotification[] {
  const keyword = normalizeText(search.trim());
  return notifications
    .filter((item) => tab === 'all' || item.category === tab)
    .filter((item) => priority === 'all' || item.priority === priority)
    .filter((item) => {
      if (!keyword) return true;
      const haystack = [
        item.title,
        item.tag.label,
        ...item.message.map((part) => part.text),
        ...item.meta.map((meta) => meta.text),
      ].join(' ');
      return normalizeText(haystack).includes(keyword);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function isToday(isoDateTime: string, now: Date = new Date()): boolean {
  return toIsoDate(new Date(isoDateTime)) === toIsoDate(now);
}

const pad = (value: number): string => String(value).padStart(2, '0');

/** "10 phút trước", "2 giờ trước", "Hôm qua, 18:30", "2 ngày trước" */
export function formatNotificationTime(isoDateTime: string, now: Date = new Date()): string {
  const date = new Date(isoDateTime);
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (isToday(isoDateTime, now)) return `${Math.floor(diffMinutes / 60)} giờ trước`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (toIsoDate(date) === toIsoDate(yesterday)) {
    return `Hôm qua, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  return `${Math.max(2, Math.round(diffMinutes / 60 / 24))} ngày trước`;
}
