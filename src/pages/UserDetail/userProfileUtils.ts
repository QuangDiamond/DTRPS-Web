import type { TripStatus, UserAuditEntry } from '../../types/admin';

export const TRIP_STATUS_CONFIG: Record<
  TripStatus,
  { label: string; badgeClass: string; dotClass?: string; iconBoxClass: string }
> = {
  upcoming: {
    label: 'Sắp diễn ra',
    badgeClass: 'bg-secondary-container font-bold text-on-secondary-container',
    dotClass: 'animate-ping bg-secondary',
    iconBoxClass: 'bg-surface-container text-primary',
  },
  completed: {
    label: 'Đã hoàn thành',
    badgeClass: 'bg-surface-container-high font-medium text-on-surface-variant',
    iconBoxClass: 'bg-surface-container-low text-outline',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-error-container/70 font-medium text-on-error-container',
    iconBoxClass: 'bg-error-container/30 text-error',
  },
};

/** Nhật ký phiên & bảo mật: thao tác admin trong phiên + lịch sử từ server (mới nhất trước) */
export function mergeSessionLog(
  history: UserAuditEntry[],
  sessionEntries: UserAuditEntry[] = [],
): UserAuditEntry[] {
  return [...sessionEntries, ...history].sort((a, b) => b.time.localeCompare(a.time));
}

/** "1 năm đồng hành" */
export function formatMembership(joinedAt: string, now: Date = new Date()): string {
  const joined = new Date(joinedAt);
  const months =
    (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth());
  if (months < 1) return 'Mới tham gia';
  if (months < 12) return `${months} tháng đồng hành`;
  return `${Math.floor(months / 12)} năm đồng hành`;
}

export function formatVnd(value: number): string {
  return `${value.toLocaleString('en-US')} đ`;
}
