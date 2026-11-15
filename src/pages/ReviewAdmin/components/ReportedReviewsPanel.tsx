import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Button,
  ErrorState,
  FilterSelect,
  Icon,
  PageLoader,
  Pagination,
} from '@/components/common';
import { PAGE_SIZE_OPTIONS } from '@/constants/partner';
import { placeDetailPath } from '@/constants/routes';
import { useToast } from '@/hooks';
import { displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { reviewAdminService } from '@/services/reviewAdminService';
import type { Paged, ReportedReview, ReportReason, ReportStatus, SelectOption } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { formatDayTime, formatNumber, todayIsoDate } from '@/utils/format';
import {
  isPeriod,
  type Period,
  periodRange,
  PERIODS,
  REPORT_REASONS,
  REPORT_STATUS_TONE,
  REPORT_STATUSES,
} from '@/pages/ReviewAdmin/reviewAdminUtils';
import PlacePicker from './PlacePicker';
import RatingStars from './RatingStars';
import ResolveReportModal from './ResolveReportModal';
import { Author, Comment, ReviewPhotos, ReviewStatusBadge } from './ReviewParts';

interface ReportedReviewsPanelProps {
  params: URLSearchParams;
  update: (changes: Record<string, string | number>) => void;
  /** Tăng lên khi cần tải lại (nút Làm mới, sự kiện realtime) */
  reload: number;
  /** Đã xử lý một báo cáo → trang cha tải lại số liệu */
  onChanged: () => void;
  selectedPlace: { id: string; name: string } | null;
  onPlaceChange: (place: { id: string; name: string } | null) => void;
}

/** Tab "Bị báo cáo": đánh giá bị người dùng báo cáo, gộp theo đánh giá — ẩn hoặc bỏ qua */
export default function ReportedReviewsPanel({
  params,
  update,
  reload,
  onChanged,
  selectedPlace,
  onPlaceChange,
}: ReportedReviewsPanelProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const statusParam = params.get('rstatus');
  const status: ReportStatus = REPORT_STATUSES.some((value) => value === statusParam)
    ? (statusParam as ReportStatus)
    : 'pending';
  const reasonParam = params.get('reason');
  const reason: ReportReason | 'all' = REPORT_REASONS.some((value) => value === reasonParam)
    ? (reasonParam as ReportReason)
    : 'all';
  const sort = params.get('rsort') === 'newest' ? 'newest' : 'most';
  const periodParam = params.get('period');
  const period: Period = isPeriod(periodParam) ? periodParam : 'all';
  const customFrom = params.get('from') ?? '';
  const customTo = params.get('to') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const sizeParam = Number(params.get('size'));
  const pageSize: number = PAGE_SIZE_OPTIONS.some((size) => size === sizeParam)
    ? sizeParam
    : PAGE_SIZE_OPTIONS[0];
  const placeId = selectedPlace?.id ?? '';

  const [result, setResult] = useState<Paged<ReportedReview> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState<{ item: ReportedReview; action: 'hide' | 'dismiss' } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    reviewAdminService
      .reports({
        status,
        reason,
        placeId,
        ...periodRange(period, customFrom, customTo),
        sort,
        page: page - 1,
        size: pageSize,
      })
      .then((next) => {
        if (!active) return;
        setResult(next);
        setError(null);
      })
      .catch((loadError: unknown) => active && setError(getErrorMessage(loadError)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [status, reason, placeId, period, customFrom, customTo, sort, page, pageSize, reload, retry]);

  const resolve = async (note: string) => {
    if (!target) return;
    setBusy(true);
    try {
      await reviewAdminService.resolveReports(target.item.review.id, target.action, note);
      showToast(
        t(
          target.action === 'hide' ? 'reviewAdmin.reports.hidden' : 'reviewAdmin.reports.dismissed',
        ),
      );
      setTarget(null);
      setRetry((n) => n + 1);
      onChanged();
    } catch (resolveError) {
      showToast(getErrorMessage(resolveError), 'error');
    } finally {
      setBusy(false);
    }
  };

  const reasonOptions = useMemo<SelectOption<ReportReason | 'all'>[]>(
    () => [
      { value: 'all', label: t('reviewAdmin.reports.allReasons') },
      ...REPORT_REASONS.map((value) => ({ value, label: t(`reviewAdmin.reasons.${value}`) })),
    ],
    [t],
  );
  const periodOptions = useMemo<SelectOption<Period>[]>(
    () => PERIODS.map((value) => ({ value, label: t(`reviewAdmin.filters.periods.${value}`) })),
    [t],
  );
  const sortOptions = useMemo<SelectOption<'most' | 'newest'>[]>(
    () => [
      { value: 'most', label: t('reviewAdmin.reports.sortMost') },
      { value: 'newest', label: t('reviewAdmin.reports.sortNewest') },
    ],
    [t],
  );

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {REPORT_STATUSES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => update({ rstatus: value === 'pending' ? '' : value, page: 1 })}
              className={`rounded-full border px-3 py-1 font-label-md text-label-md transition-colors ${
                status === value
                  ? 'border-primary bg-primary-fixed font-semibold text-on-primary-fixed'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {t(`reviewAdmin.reports.status.${value}`)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <PlacePicker value={selectedPlace} onChange={onPlaceChange} />
          <FilterSelect
            label={t('reviewAdmin.reports.reason')}
            icon="flag"
            value={reason}
            options={reasonOptions}
            onChange={(value) => update({ reason: value, page: 1 })}
          />
          <FilterSelect
            label={t('reviewAdmin.reports.period')}
            icon="date_range"
            value={period}
            options={periodOptions}
            onChange={(value) =>
              update(
                value === 'custom'
                  ? { period: value, page: 1 }
                  : { period: value, from: '', to: '', page: 1 },
              )
            }
          />
          <FilterSelect
            label={t('reviewAdmin.filters.sort')}
            icon="sort"
            value={sort}
            options={sortOptions}
            onChange={(value) => update({ rsort: value === 'most' ? '' : value, page: 1 })}
          />
        </div>
        {period === 'custom' && (
          <div className="flex flex-wrap items-end gap-3">
            {(['from', 'to'] as const).map((key) => (
              <label key={key} className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                  <Icon name="event" className="text-[16px] text-primary" />
                  {t(`reviewAdmin.filters.${key}`)}
                </span>
                <input
                  type="date"
                  value={key === 'from' ? customFrom : customTo}
                  min={key === 'to' ? customFrom || undefined : undefined}
                  max={(key === 'from' ? customTo : '') || todayIsoDate()}
                  onChange={(event) => update({ [key]: event.target.value, page: 1 })}
                  className="h-10 rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-4 text-on-surface-variant">
        <Icon name="info" className="text-[20px] text-primary" />
        <p className="font-body-sm text-body-sm">{t('reviewAdmin.notice.reports')}</p>
      </div>

      {error && !result ? (
        <ErrorState
          title={t('reviewAdmin.loadError')}
          message={error}
          onRetry={() => setRetry((n) => n + 1)}
        />
      ) : !result ? (
        <PageLoader />
      ) : (
        <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
          <div className={`divide-y divide-surface-container ${loading ? 'opacity-50' : ''}`}>
            {result.items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-on-surface-variant">
                <Icon name="verified_user" className="text-[40px] text-outline" />
                <span className="font-title-md text-title-md">
                  {t(`reviewAdmin.reports.empty.${status}`)}
                </span>
              </div>
            ) : (
              result.items.map((item) => {
                const { review } = item;
                const open = expanded.has(review.id);
                return (
                  <div key={review.id} className="flex flex-col gap-4 p-5 lg:flex-row">
                    {/* Đánh giá bị báo cáo */}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Author author={review.author} />
                        <ReviewStatusBadge status={review.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body-sm text-body-sm text-on-surface-variant">
                        <Link
                          to={placeDetailPath(review.place.id)}
                          className="font-medium text-primary hover:underline"
                        >
                          {review.place.name}
                        </Link>
                        <RatingStars value={review.rating} />
                        <span>{displayDate(review.createdAt)}</span>
                      </div>
                      <Comment
                        comment={review.comment}
                        emptyLabel={t('reviewAdmin.table.noComment')}
                      />
                      <ReviewPhotos urls={review.imageUrls} />
                    </div>

                    {/* Báo cáo */}
                    <div className="flex shrink-0 flex-col gap-3 rounded-xl bg-surface-container-low p-4 lg:w-[360px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 font-title-md text-title-md text-on-surface">
                          <Icon name="flag" className="text-[20px] text-error" />
                          {t('reviewAdmin.reports.count', { count: item.reportCount })}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${REPORT_STATUS_TONE[item.status]}`}
                        >
                          {t(`reviewAdmin.reports.status.${item.status}`)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.reasons.map(({ reason: code, count }) => (
                          <span
                            key={code}
                            className="rounded-full bg-surface-container-lowest px-2.5 py-1 font-label-sm text-label-sm text-on-surface"
                          >
                            {t(`reviewAdmin.reasons.${code}`)}
                            {count > 1 && <b className="ml-1">×{formatNumber(count)}</b>}
                          </span>
                        ))}
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {t('reviewAdmin.reports.latest', {
                          time: formatDayTime(item.latestReportAt),
                        })}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggle(review.id)}
                        className="flex items-center gap-1 self-start font-label-md text-label-md font-semibold text-primary hover:underline"
                      >
                        <Icon name={open ? 'expand_less' : 'expand_more'} className="text-[18px]" />
                        {t(
                          open
                            ? 'reviewAdmin.reports.hideDetails'
                            : 'reviewAdmin.reports.showDetails',
                        )}
                      </button>
                      {open && (
                        <ul className="flex flex-col gap-2">
                          {item.reports.map((report) => (
                            <li
                              key={report.id}
                              className="rounded-lg bg-surface-container-lowest p-2.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate font-label-md text-label-md font-semibold text-on-surface">
                                  {report.reporter.name}
                                </span>
                                <span className="shrink-0 font-body-sm text-[12px] text-outline">
                                  {formatDayTime(report.createdAt)}
                                </span>
                              </div>
                              <p className="font-body-sm text-body-sm text-error">
                                {t(`reviewAdmin.reasons.${report.reason}`)}
                              </p>
                              {report.note && (
                                <p className="mt-0.5 font-body-sm text-body-sm whitespace-pre-line text-on-surface-variant">
                                  “{report.note}”
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      {item.status === 'pending' && (
                        <div className="mt-1 flex gap-2">
                          <Button
                            size="sm"
                            variant="danger"
                            icon="visibility_off"
                            onClick={() => setTarget({ item, action: 'hide' })}
                          >
                            {t('reviewAdmin.reports.hide')}
                          </Button>
                          <Button
                            size="sm"
                            variant="neutral"
                            icon="task_alt"
                            onClick={() => setTarget({ item, action: 'dismiss' })}
                          >
                            {t('reviewAdmin.reports.dismiss')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={result.total}
            itemLabel={t('reviewAdmin.table.items')}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={(next) => update({ page: next })}
            onPageSizeChange={(size) =>
              update({ size: size === PAGE_SIZE_OPTIONS[0] ? '' : size, page: 1 })
            }
          />
        </div>
      )}

      {target && (
        <ResolveReportModal
          item={target.item}
          action={target.action}
          busy={busy}
          onConfirm={(note) => void resolve(note)}
          onClose={() => setTarget(null)}
        />
      )}
    </>
  );
}
