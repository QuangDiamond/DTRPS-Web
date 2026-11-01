import { Trans, useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { type ReactNode, useMemo, useState } from 'react';
import { Icon } from '@/components/common';
import { formatVnd, TRIP_STATUS_CONFIG } from '@/pages/UserDetail/userProfileUtils';
import type { TripStatus, UserTrip } from '@/types';
import { formatDate } from '@/utils/format';
import { normalizeText } from '@/utils/string';

interface TripsTabProps {
  trips: UserTrip[];
  totalTrips: number;
  onDownload: (trip: UserTrip) => void;
  onViewTrip: (trip: UserTrip) => void;
}

const STATUS_OPTIONS: { value: TripStatus | 'all'; label: string }[] = [
  {
    value: 'all',
    get label() {
      return i18n.t('filters.allStatuses');
    },
  },
  {
    value: 'upcoming',
    get label() {
      return i18n.t('userDetail.tripsTab.upcoming');
    },
  },
  {
    value: 'completed',
    get label() {
      return i18n.t('userDetail.tripsTab.completed');
    },
  },
  {
    value: 'cancelled',
    get label() {
      return i18n.t('userDetail.tripsTab.cancelled');
    },
  },
];

function TripMeta({
  icon,
  iconClass = 'text-outline',
  children,
}: {
  icon: string;
  iconClass?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon name={icon} className={`text-[16px] ${iconClass}`} />
      <span>{children}</span>
    </div>
  );
}

export default function TripsTab({ trips, totalTrips, onDownload, onViewTrip }: TripsTabProps) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<TripStatus | 'all'>('all');

  const visible = useMemo(() => {
    const normalized = normalizeText(keyword);
    return trips.filter(
      (trip) =>
        (status === 'all' || trip.status === status) &&
        (!normalized ||
          [trip.name, trip.id].some((field) => normalizeText(field).includes(normalized))),
    );
  }, [trips, keyword, status]);

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center justify-between gap-space-md rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
        <div className="flex min-w-[280px] flex-1 items-center gap-space-sm">
          <div className="relative w-full max-w-md">
            <Icon
              name="search"
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[18px] text-outline"
            />
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={t('userDetail.tripsTab.searchByTripName')}
              className="w-full rounded-xl bg-surface-container-low py-2 pr-4 pl-10 font-body-sm text-body-sm text-on-surface outline-none placeholder:text-outline focus:bg-surface-container focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            aria-label={t('userDetail.tripsTab.tripStatus')}
            value={status}
            onChange={(event) => {
              const next = STATUS_OPTIONS.find((option) => option.value === event.target.value);
              if (next) setStatus(next.value);
            }}
            className="cursor-pointer rounded-xl bg-surface-container-low px-space-md py-2 font-body-sm text-body-sm font-medium text-on-surface outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {t('userDetail.tripsTab.showingLatestTrips', { length: visible.length, totalTrips })}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-container-lowest py-14 text-center text-on-surface-variant shadow-sm">
          <Icon name="luggage" className="text-[40px] text-outline" />
          <span className="font-title-md text-title-md">
            {trips.length === 0
              ? t('userDetail.tripsTab.noDetailedTripData')
              : t('userDetail.tripsTab.noMatchingTrips')}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          {visible.map((trip) => {
            const config = TRIP_STATUS_CONFIG[trip.status];
            const upcoming = trip.status === 'upcoming';
            return (
              <div
                key={trip.id}
                className="flex flex-col justify-between gap-space-lg rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm transition-all hover:shadow-md lg:flex-row lg:items-center"
              >
                <div className="flex min-w-0 flex-1 flex-col items-start gap-space-lg sm:flex-row sm:items-center">
                  <div
                    className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl ${config.iconBoxClass}`}
                  >
                    <Icon name={trip.icon} className="text-[28px]" />
                    <span className="text-[10px] font-bold tracking-tight uppercase">
                      {trip.durationLabel}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-space-sm">
                      <button
                        type="button"
                        onClick={() => onViewTrip(trip)}
                        className="truncate text-left font-headline-sm text-headline-sm font-bold text-on-surface transition-colors hover:text-primary"
                      >
                        {trip.name}
                      </button>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-space-sm py-0.5 font-label-sm text-label-sm ${config.badgeClass}`}
                      >
                        {config.dotClass && (
                          <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
                        )}
                        {config.label}
                      </span>
                      {trip.rating && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-tertiary-fixed px-space-sm py-0.5 font-label-sm text-label-sm font-bold text-on-tertiary-fixed">
                          <Icon name="star" filled className="text-[12px] text-tertiary" />
                          {t('userDetail.tripsTab.reviewSubmitted', { rating: trip.rating })}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-space-lg gap-y-1 font-body-sm text-body-sm text-on-surface-variant">
                      {upcoming ? (
                        <TripMeta icon="event" iconClass="text-primary">
                          <Trans
                            i18nKey="userDetail.tripsTab.departure"
                            values={{ startDate: formatDate(trip.startDate) }}
                            components={{ c0: <strong className="text-on-surface" /> }}
                          />
                        </TripMeta>
                      ) : (
                        <TripMeta icon="event_available">
                          <Trans
                            i18nKey="userDetail.tripsTab.dates"
                            values={{
                              startDate: formatDate(trip.startDate),
                              endDate: formatDate(trip.endDate),
                            }}
                            components={{ c0: <strong /> }}
                          />
                        </TripMeta>
                      )}
                      <TripMeta icon="tour">
                        {t('userDetail.tripsTab.scope')}{' '}
                        <strong>
                          {trip.poiCount} POI
                          {trip.status === 'completed'
                            ? t('userDetail.tripsTab.visited')
                            : t('userDetail.tripsTab.toVisit')}
                        </strong>
                      </TripMeta>
                      {trip.travelers && <TripMeta icon="group">{trip.travelers}</TripMeta>}
                      <TripMeta icon="savings">
                        {t('userDetail.tripsTab.estimatedBudget')}:{' '}
                        <strong>{formatVnd(trip.amount)}</strong>
                      </TripMeta>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-space-sm self-end lg:self-center">
                  <button
                    type="button"
                    onClick={() => onDownload(trip)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-surface-container px-space-md py-2 font-label-md text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                  >
                    <Icon name="download" className="text-[18px]" />
                    <span>{t('userDetail.tripsTab.downloadItinerary')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewTrip(trip)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-space-md py-2 font-label-md text-label-md font-semibold transition-all ${
                      upcoming
                        ? 'bg-primary text-on-primary shadow-sm hover:bg-primary-container'
                        : 'bg-surface-container text-primary hover:bg-surface-container-high'
                    }`}
                  >
                    <span>{t('userDetail.tripsTab.viewTripDetails')}</span>
                    <Icon name="chevron_right" className="text-[16px]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
