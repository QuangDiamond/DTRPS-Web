import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, ErrorState, Icon, PageHeader, PageLoader } from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { placeDetailPath } from '@/constants/routes';
import { displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import RatingStars from '@/pages/ReviewAdmin/components/RatingStars';
import { Author } from '@/pages/ReviewAdmin/components/ReviewParts';
import { tripAdminService } from '@/services/tripAdminService';
import type { AdminTripDay, AdminTripDetail, AdminTripStop } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { formatNumber, formatTimestamp } from '@/utils/format';
import { StatusPill, TripProgress, TripStatusBadge } from './components/TripParts';
import { DAY_STATUS_STYLE, shortTime, STOP_STATUS_STYLE, tripListPath } from './tripAdminUtils';
import { useTripLiveRefresh } from './useTripLiveRefresh';

function Card({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 font-title-md text-title-md text-on-surface">
        <Icon name={icon} className="text-[20px] text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="font-body-sm text-body-sm text-on-surface-variant">{label}</dt>
      <dd className="text-right font-body-sm text-body-sm font-medium text-on-surface">{value}</dd>
    </div>
  );
}

function Thumb({ url }: { url: string | null }) {
  return url ? (
    <img src={url} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
  ) : (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-container text-outline">
      <Icon name="image" className="text-[22px]" />
    </span>
  );
}

function StopRow({ stop, currency }: { stop: AdminTripStop; currency: string }) {
  const { t } = useTranslation();
  const style = STOP_STATUS_STYLE[stop.status];
  const time = [shortTime(stop.startTime), shortTime(stop.endTime)].filter(Boolean).join(' – ');
  return (
    <li className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-label-sm text-label-sm font-bold text-on-surface">
        {stop.order}
      </span>
      <Thumb url={stop.coverUrl} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Link
          to={placeDetailPath(stop.placeId)}
          className="font-body-md text-body-md font-semibold text-primary hover:underline"
        >
          {stop.placeName}
        </Link>
        {stop.address && (
          <span className="font-body-sm text-body-sm text-on-surface-variant">{stop.address}</span>
        )}
        {(time || stop.estimatedCost !== null) && (
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {[
              time,
              stop.estimatedCost !== null ? `${formatNumber(stop.estimatedCost)} ${currency}` : '',
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        )}
        {stop.notes && (
          <span className="mt-1 font-body-sm text-body-sm whitespace-pre-line text-on-surface-variant italic">
            “{stop.notes}”
          </span>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
        <StatusPill label={t(style.labelKey)} icon={style.icon} className={style.className} />
        {stop.completedAt && (
          <span className="font-body-sm text-[12px] text-outline">
            {formatTimestamp(stop.completedAt)}
          </span>
        )}
      </div>
    </li>
  );
}

function DayCard({ day, currency }: { day: AdminTripDay; currency: string }) {
  const { t } = useTranslation();
  const style = DAY_STATUS_STYLE[day.status];
  const running = day.status === 'IN_PROGRESS';
  return (
    <section
      className={`rounded-2xl bg-surface-container-lowest p-5 shadow-sm ${
        running ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-container pb-3">
        <div className="flex flex-col">
          <h3 className="font-title-md text-title-md text-on-surface">
            {t('tripAdmin.detail.day', { day: day.dayNumber })}
            {day.title && ` · ${day.title}`}
          </h3>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {displayDate(day.date)}
            {day.startedAt &&
              ` · ${t('tripAdmin.detail.startedAt', { time: formatTimestamp(day.startedAt) })}`}
            {day.completedAt &&
              ` · ${t('tripAdmin.detail.completedAt', { time: formatTimestamp(day.completedAt) })}`}
          </span>
        </div>
        <StatusPill label={t(style.labelKey)} icon={style.icon} className={style.className} />
      </div>
      {day.stops.length === 0 ? (
        <p className="pt-3 font-body-sm text-body-sm text-on-surface-variant">
          {t('tripAdmin.detail.emptyDay')}
        </p>
      ) : (
        <ul className="divide-y divide-surface-container">
          {day.stops.map((stop) => (
            <StopRow key={stop.id} stop={stop} currency={currency} />
          ))}
        </ul>
      )}
    </section>
  );
}

/** Chi tiết chuyến đi: /admin/trips/:id — lịch trình từng ngày và tiến độ thực tế (chỉ xem) */
export default function TripAdminDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams();

  const [detail, setDetail] = useState<AdminTripDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  // Bỏ kết quả của request cũ khi có request mới hơn
  const requestId = useRef(0);

  const refresh = useCallback(() => setReload((n) => n + 1), []);
  useTripLiveRefresh(refresh, id);

  useEffect(() => {
    const current = ++requestId.current;
    tripAdminService
      .get(id)
      .then((next) => {
        if (current !== requestId.current) return;
        setDetail(next);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (current === requestId.current) setError(getErrorMessage(loadError));
      });
  }, [id, reload]);

  const backButton = (
    <div>
      <Button
        variant="neutral"
        size="sm"
        icon="arrow_back"
        onClick={() => navigate(tripListPath())}
      >
        {t('tripAdmin.detail.back')}
      </Button>
    </div>
  );

  if (error && !detail) {
    return (
      <div className="flex flex-col gap-4 pb-12">
        {backButton}
        <ErrorState title={t('tripAdmin.detail.loadError')} message={error} onRetry={refresh} />
      </div>
    );
  }
  if (!detail) return <PageLoader />;

  const { trip, days, selectedPlaces, feedback } = detail;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {backButton}
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[
            ADMIN_ROOT_CRUMB,
            { label: t('nav.trips'), icon: 'luggage', to: tripListPath() },
            { label: trip.title },
          ]}
          title={trip.title}
          titleBadge={<TripStatusBadge trip={trip} />}
          description={`${trip.destination} · ${displayDate(trip.startDate)} – ${displayDate(trip.endDate)}`}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title={t('tripAdmin.detail.progressTitle')} icon="timeline">
            <TripProgress trip={trip} />
          </Card>

          {days.length > 0 ? (
            days.map((day) => <DayCard key={day.dayNumber} day={day} currency={trip.currency} />)
          ) : (
            <Card title={t('tripAdmin.detail.selectedPlaces')} icon="place">
              {selectedPlaces.length === 0 ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t('tripAdmin.detail.noPlaces')}
                </p>
              ) : (
                <ul className="divide-y divide-surface-container">
                  {selectedPlaces.map((place) => (
                    <li key={place.placeId} className="flex items-center gap-3 py-3">
                      <Thumb url={place.coverUrl} />
                      <div className="flex min-w-0 flex-col">
                        <Link
                          to={placeDetailPath(place.placeId)}
                          className="font-body-md text-body-md font-semibold text-primary hover:underline"
                        >
                          {place.name}
                        </Link>
                        {place.address && (
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {place.address}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <Card title={t('tripAdmin.detail.traveller')} icon="person">
            <Author author={trip.traveller} />
          </Card>

          <Card title={t('tripAdmin.detail.info')} icon="info">
            <dl className="divide-y divide-surface-container">
              <Info label={t('tripAdmin.detail.code')} value={`#${trip.id}`} />
              <Info label={t('tripAdmin.detail.destination')} value={trip.destination} />
              <Info
                label={t('tripAdmin.detail.group')}
                value={t('tripAdmin.table.people', { count: trip.groupSize })}
              />
              <Info
                label={t('tripAdmin.detail.budget')}
                value={
                  trip.budget === null
                    ? t('tripAdmin.detail.noBudget')
                    : `${formatNumber(trip.budget)} ${trip.currency}`
                }
              />
              <Info label={t('tripAdmin.detail.created')} value={formatTimestamp(trip.createdAt)} />
              {trip.startedAt && (
                <Info
                  label={t('tripAdmin.detail.tripStarted')}
                  value={formatTimestamp(trip.startedAt)}
                />
              )}
              {trip.completedAt && (
                <Info
                  label={t('tripAdmin.detail.tripCompleted')}
                  value={formatTimestamp(trip.completedAt)}
                />
              )}
            </dl>
            {detail.description && (
              <p className="mt-3 font-body-sm text-body-sm whitespace-pre-line text-on-surface-variant">
                {detail.description}
              </p>
            )}
          </Card>

          <Card title={t('tripAdmin.detail.feedback')} icon="rate_review">
            {feedback ? (
              <div className="flex flex-col gap-2">
                <RatingStars value={feedback.rating} />
                {feedback.comment && (
                  <p className="font-body-sm text-body-sm whitespace-pre-line text-on-surface">
                    {feedback.comment}
                  </p>
                )}
                <span className="font-body-sm text-[12px] text-outline">
                  {formatTimestamp(feedback.createdAt)}
                </span>
              </div>
            ) : (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t('tripAdmin.detail.noFeedback')}
              </p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
