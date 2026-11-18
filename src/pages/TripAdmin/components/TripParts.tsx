import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { TRIP_STATUS_STYLE } from '@/pages/TripAdmin/tripAdminUtils';
import type { AdminTrip } from '@/types';

const BADGE_CLASS =
  'inline-flex items-center gap-1 rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold whitespace-nowrap';

/** Nhãn trạng thái dùng chung cho chuyến / ngày / điểm đến */
export function StatusPill({
  label,
  icon,
  className,
}: {
  label: string;
  icon: string;
  className: string;
}) {
  return (
    <span className={`${BADGE_CLASS} ${className}`}>
      <Icon name={icon} className="text-[14px]" />
      {label}
    </span>
  );
}

/** Trạng thái chuyến đi, kèm cảnh báo khi đã quá ngày về dự kiến */
export function TripStatusBadge({ trip }: { trip: AdminTrip }) {
  const { t } = useTranslation();
  const style = TRIP_STATUS_STYLE[trip.status];
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <StatusPill label={t(style.labelKey)} icon={style.icon} className={style.className} />
      {trip.overdue && (
        <StatusPill
          label={t('tripAdmin.overdue')}
          icon="warning"
          className="bg-error-container text-on-error-container"
        />
      )}
    </span>
  );
}

/** Dòng chính mô tả chuyến đang ở đâu, ví dụ "Đang đi ngày 2/4" */
function useProgressHeadline(trip: AdminTrip): string {
  const { t } = useTranslation();
  const { progress } = trip;
  if (progress.totalDays === 0) return t('tripAdmin.progress.noItinerary');
  switch (trip.status) {
    case 'IN_PROGRESS':
      if (progress.currentDay === null) return t('tripAdmin.progress.noItinerary');
      if (progress.currentDayStarted) {
        return t('tripAdmin.progress.onDay', {
          day: progress.currentDay,
          total: progress.totalDays,
        });
      }
      return progress.completedDays > 0
        ? t('tripAdmin.progress.waitingDay', {
            done: progress.completedDays,
            day: progress.currentDay,
          })
        : t('tripAdmin.progress.notStartedDay', { day: progress.currentDay });
    case 'COMPLETED':
      return t('tripAdmin.progress.finished', {
        done: progress.completedDays,
        total: progress.totalDays,
      });
    case 'CANCELLED':
      return t('tripAdmin.progress.stopped', {
        done: progress.completedDays,
        total: progress.totalDays,
      });
    default:
      return t('tripAdmin.progress.planned', {
        days: progress.totalDays,
        stops: progress.totalStops,
      });
  }
}

/** Tiến độ: dòng chính + số điểm đã đi + thanh phần trăm */
export function TripProgress({ trip }: { trip: AdminTrip }) {
  const { t } = useTranslation();
  const headline = useProgressHeadline(trip);
  const { progress } = trip;
  const started = trip.status === 'IN_PROGRESS' || trip.status === 'COMPLETED';
  const showBar = progress.totalDays > 0 && (started || progress.percent > 0);
  return (
    <div className="flex min-w-[190px] flex-col gap-1.5">
      <span className="font-body-md text-body-md font-semibold text-on-surface">{headline}</span>
      {showBar && (
        <>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {t('tripAdmin.progress.stops', {
              done: progress.completedStops,
              total: progress.totalStops,
            })}
            {progress.skippedStops > 0 &&
              ` · ${t('tripAdmin.progress.skipped', { count: progress.skippedStops })}`}
          </span>
          <span
            className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
          >
            <span
              className="block h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </span>
        </>
      )}
    </div>
  );
}
