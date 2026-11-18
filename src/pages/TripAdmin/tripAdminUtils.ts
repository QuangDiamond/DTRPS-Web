import { ROUTES } from '@/constants/routes';
import type {
  TripDayStatus,
  TripSort,
  AdminTripStatus,
  TripStatusFilter,
  TripStopStatus,
} from '@/types';

/** Tab trên trang danh sách → nhóm lọc gửi lên API */
export const TRIP_TABS = [
  'all',
  'inProgress',
  'overdue',
  'planning',
  'completed',
  'cancelled',
] as const;
export type TripTab = (typeof TRIP_TABS)[number];

export const TAB_FILTER: Record<TripTab, TripStatusFilter | undefined> = {
  all: undefined,
  inProgress: 'IN_PROGRESS',
  overdue: 'OVERDUE',
  planning: 'PLANNING',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

export const isTripTab = (value: string | null): value is TripTab =>
  TRIP_TABS.some((tab) => tab === value);

export const TRIP_SORTS: TripSort[] = ['newest', 'oldest', 'startSoon', 'startLate'];

export const isTripSort = (value: string | null): value is TripSort =>
  TRIP_SORTS.some((sort) => sort === value);

interface BadgeStyle<K extends string> {
  labelKey: K;
  className: string;
  icon: string;
}

export const TRIP_STATUS_STYLE: {
  [S in AdminTripStatus]: BadgeStyle<`tripAdmin.status.${S}`>;
} = {
  DRAFT: {
    labelKey: 'tripAdmin.status.DRAFT',
    className: 'bg-surface-container-high text-on-surface-variant',
    icon: 'edit_note',
  },
  PLANNED: {
    labelKey: 'tripAdmin.status.PLANNED',
    className: 'bg-primary-fixed text-on-primary-fixed',
    icon: 'event_available',
  },
  IN_PROGRESS: {
    labelKey: 'tripAdmin.status.IN_PROGRESS',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed',
    icon: 'directions_walk',
  },
  COMPLETED: {
    labelKey: 'tripAdmin.status.COMPLETED',
    className: 'bg-secondary-container text-on-secondary-container',
    icon: 'task_alt',
  },
  CANCELLED: {
    labelKey: 'tripAdmin.status.CANCELLED',
    className: 'bg-error-container text-on-error-container',
    icon: 'cancel',
  },
};

export const DAY_STATUS_STYLE: {
  [S in TripDayStatus]: BadgeStyle<`tripAdmin.dayStatus.${S}`>;
} = {
  NOT_STARTED: {
    labelKey: 'tripAdmin.dayStatus.NOT_STARTED',
    className: 'bg-surface-container-high text-on-surface-variant',
    icon: 'schedule',
  },
  IN_PROGRESS: {
    labelKey: 'tripAdmin.dayStatus.IN_PROGRESS',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed',
    icon: 'directions_walk',
  },
  COMPLETED: {
    labelKey: 'tripAdmin.dayStatus.COMPLETED',
    className: 'bg-secondary-container text-on-secondary-container',
    icon: 'task_alt',
  },
};

export const STOP_STATUS_STYLE: {
  [S in TripStopStatus]: BadgeStyle<`tripAdmin.stopStatus.${S}`>;
} = {
  PENDING: {
    labelKey: 'tripAdmin.stopStatus.PENDING',
    className: 'bg-surface-container-high text-on-surface-variant',
    icon: 'radio_button_unchecked',
  },
  COMPLETED: {
    labelKey: 'tripAdmin.stopStatus.COMPLETED',
    className: 'bg-secondary-container text-on-secondary-container',
    icon: 'check_circle',
  },
  SKIPPED: {
    labelKey: 'tripAdmin.stopStatus.SKIPPED',
    className: 'bg-error-container text-on-error-container',
    icon: 'skip_next',
  },
};

const LIST_SEARCH_KEY = 'smarttravel.admin.trips.listSearch';

/** Nhớ bộ lọc + trang đang xem để nút "Quay lại" ở trang chi tiết trở về đúng chỗ */
export function rememberTripListSearch(search: string): void {
  try {
    window.sessionStorage.setItem(LIST_SEARCH_KEY, search);
  } catch {
    // Không lưu được thì nút quay lại về trang 1
  }
}

export function tripListPath(): string {
  let search = '';
  try {
    search = window.sessionStorage.getItem(LIST_SEARCH_KEY) ?? '';
  } catch {
    // bỏ qua
  }
  return `${ROUTES.TRIPS}${search}`;
}

/** "08:30:00" → "08:30" */
export const shortTime = (time: string | null): string => time?.slice(0, 5) ?? '';
