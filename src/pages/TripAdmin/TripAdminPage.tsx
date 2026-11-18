import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  ErrorState,
  FilterSelect,
  Icon,
  PageHeader,
  PageLoader,
  Pagination,
  StatCard,
} from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { PAGE_SIZE_OPTIONS } from '@/constants/partner';
import { tripDetailPath } from '@/constants/routes';
import { displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { Author } from '@/pages/ReviewAdmin/components/ReviewParts';
import { tripAdminService } from '@/services/tripAdminService';
import type { AdminTrip, AdminTripStats, Paged, SelectOption, TripSort } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { formatNumber } from '@/utils/format';
import { TripProgress, TripStatusBadge } from './components/TripParts';
import {
  isTripSort,
  isTripTab,
  rememberTripListSearch,
  TAB_FILTER,
  TRIP_SORTS,
  TRIP_TABS,
  type TripTab,
} from './tripAdminUtils';
import { useTripLiveRefresh } from './useTripLiveRefresh';

const SEARCH_DELAY_MS = 350;

/** Quản lý chuyến đi: /admin/trips — chuyến đi của mọi người dùng và tiến độ thực tế (chỉ xem) */
export default function TripAdminPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab, bộ lọc, trang nằm trên URL: mở chi tiết rồi quay lại (hay F5) vẫn đúng chỗ đang xem
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab: TripTab = isTripTab(tabParam) ? tabParam : 'all';
  const search = params.get('q') ?? '';
  const destination = params.get('destination') ?? 'all';
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const sortParam = params.get('sort');
  const sort: TripSort = isTripSort(sortParam) ? sortParam : 'newest';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const sizeParam = Number(params.get('size'));
  const pageSize: number = PAGE_SIZE_OPTIONS.some((size) => size === sizeParam)
    ? sizeParam
    : PAGE_SIZE_OPTIONS[0];
  const [keyword, setKeyword] = useState(search);

  /** Ghi lên URL (giá trị mặc định thì bỏ khỏi URL); không thêm lịch sử */
  const update = useCallback(
    (changes: Record<string, string | number>) =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(changes).forEach(([key, value]) => {
            const text = String(value);
            const isDefault =
              text === '' ||
              text === 'all' ||
              (key === 'page' && text === '1') ||
              (key === 'sort' && text === 'newest');
            if (isDefault) next.delete(key);
            else next.set(key, text);
          });
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  useEffect(() => {
    rememberTripListSearch(location.search);
  }, [location.search]);

  const [stats, setStats] = useState<AdminTripStats | null>(null);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [result, setResult] = useState<Paged<AdminTrip> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  // Cập nhật realtime thì tải ngầm, bảng không bị mờ đi
  const silentReload = useRef(false);

  const refresh = useCallback(() => setReload((n) => n + 1), []);
  const liveRefresh = useCallback(() => {
    silentReload.current = true;
    setReload((n) => n + 1);
  }, []);
  useTripLiveRefresh(liveRefresh);

  useEffect(() => {
    let active = true;
    Promise.all([tripAdminService.stats(), tripAdminService.destinations()])
      .then(([nextStats, nextDestinations]) => {
        if (!active) return;
        setStats(nextStats);
        setDestinations(nextDestinations);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [reload]);

  // Gõ xong mới tìm; chỉ về trang 1 khi từ khoá thật sự đổi
  useEffect(() => {
    if (keyword.trim() === search) return;
    const timer = window.setTimeout(() => update({ q: keyword.trim(), page: 1 }), SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [keyword, search, update]);

  useEffect(() => {
    let active = true;
    if (!silentReload.current) setLoading(true);
    silentReload.current = false;
    tripAdminService
      .list({
        keyword: search,
        status: TAB_FILTER[tab],
        destination: destination === 'all' ? undefined : destination,
        from,
        to,
        sort,
        page: page - 1,
        size: pageSize,
      })
      .then((next) => {
        if (!active) return;
        setResult(next);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tab, search, destination, from, to, sort, page, pageSize, reload]);

  const destinationOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('tripAdmin.filters.allDestinations') },
      ...destinations.map((value) => ({ value, label: value })),
    ],
    [destinations, t],
  );
  const sortOptions = useMemo<SelectOption<TripSort>[]>(
    () => TRIP_SORTS.map((value) => ({ value, label: t(`tripAdmin.sorts.${value}`) })),
    [t],
  );

  const tabCount = (value: TripTab): number | undefined => {
    if (!stats) return undefined;
    return value === 'all' ? stats.total : stats[value];
  };

  const filtered = Boolean(search || from || to) || destination !== 'all' || sort !== 'newest';
  const clearFilters = () => {
    setKeyword('');
    update({ q: '', destination: 'all', from: '', to: '', sort: 'newest', page: 1 });
  };

  const th = 'py-4 font-semibold';

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.trips'), icon: 'luggage' }]}
          eyebrow={t('tripAdmin.header.eyebrow')}
          title={t('tripAdmin.header.title')}
          description={t('tripAdmin.header.description')}
          actions={
            <Button variant="neutral" icon="refresh" onClick={refresh}>
              {t('tripAdmin.header.refresh')}
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('tripAdmin.stats.total')}
          value={formatNumber(stats?.total ?? 0)}
          icon="luggage"
          iconClassName="bg-surface-container-high text-primary"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('tripAdmin.stats.totalHint', { count: stats?.planning ?? 0 })}
            </p>
          }
        />
        <StatCard
          label={t('tripAdmin.stats.inProgress')}
          value={formatNumber(stats?.inProgress ?? 0)}
          icon="directions_walk"
          iconClassName="bg-tertiary-fixed text-on-tertiary-fixed"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('tripAdmin.stats.inProgressHint', { count: stats?.overdue ?? 0 })}
            </p>
          }
        />
        <StatCard
          label={t('tripAdmin.stats.completed')}
          value={formatNumber(stats?.completed ?? 0)}
          icon="task_alt"
          iconClassName="bg-secondary-container text-on-secondary-container"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('tripAdmin.stats.completedHint')}
            </p>
          }
        />
        <StatCard
          label={t('tripAdmin.stats.cancelled')}
          value={formatNumber(stats?.cancelled ?? 0)}
          icon="cancel"
          iconClassName="bg-error-container text-on-error-container"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('tripAdmin.stats.cancelledHint')}
            </p>
          }
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {TRIP_TABS.map((value) => {
            const count = tabCount(value);
            const selected = tab === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => update({ tab: value, page: 1 })}
                className={`flex items-center gap-2 rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${
                  selected
                    ? 'bg-primary font-semibold text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {t(`tripAdmin.tabs.${value}`)}
                {count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm ${
                      selected ? 'bg-on-primary/20' : 'bg-surface-container-high'
                    }`}
                  >
                    {formatNumber(count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
              {t('tripAdmin.filters.searchLabel')}
            </span>
            <span className="flex h-11 items-center gap-2 rounded-xl bg-surface-container-low px-3 focus-within:ring-2 focus-within:ring-primary">
              <Icon name="search" className="text-[20px] text-outline" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={t('tripAdmin.filters.searchPlaceholder')}
                className="h-full flex-1 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
              />
            </span>
          </label>
          {filtered && (
            <Button variant="ghost" icon="filter_alt_off" onClick={clearFilters}>
              {t('tripAdmin.filters.clear')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label={t('tripAdmin.filters.destination')}
            icon="location_on"
            value={destination}
            options={destinationOptions}
            onChange={(value) => update({ destination: value, page: 1 })}
          />
          {(['from', 'to'] as const).map((key) => (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
                <Icon name="event" className="text-[16px] text-primary" />
                {t(`tripAdmin.filters.${key}`)}
              </span>
              <input
                type="date"
                value={key === 'from' ? from : to}
                min={key === 'to' ? from || undefined : undefined}
                max={key === 'from' ? to || undefined : undefined}
                onChange={(event) => update({ [key]: event.target.value, page: 1 })}
                className="h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </label>
          ))}
          <FilterSelect
            label={t('tripAdmin.filters.sort')}
            icon="sort"
            value={sort}
            options={sortOptions}
            onChange={(value) => update({ sort: value, page: 1 })}
          />
        </div>
      </div>

      {error && !result ? (
        <ErrorState title={t('tripAdmin.loadError')} message={error} onRetry={refresh} />
      ) : !result ? (
        <PageLoader />
      ) : (
        <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
          <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                  <th className={`${th} px-6`}>{t('tripAdmin.table.traveller')}</th>
                  <th className={`${th} px-4`}>{t('tripAdmin.table.trip')}</th>
                  <th className={`${th} px-4`}>{t('tripAdmin.table.dates')}</th>
                  <th className={`${th} px-4`}>{t('tripAdmin.table.status')}</th>
                  <th className={`${th} px-4`}>{t('tripAdmin.table.progress')}</th>
                  <th className={`${th} px-6 text-right`}>{t('tripAdmin.table.actions')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-surface-container ${loading ? 'opacity-50' : ''}`}>
                {result.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                        <Icon name="luggage" className="text-[40px] text-outline" />
                        <span className="font-title-md text-title-md">
                          {t('tripAdmin.table.empty')}
                        </span>
                        <span className="font-body-sm text-body-sm">
                          {t('tripAdmin.table.emptyHint')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  result.items.map((trip) => (
                    <tr
                      key={trip.id}
                      onClick={() => navigate(tripDetailPath(trip.id))}
                      className="cursor-pointer hover:bg-surface-container-low/60"
                    >
                      <td className="max-w-[240px] px-6 py-4">
                        <Author author={trip.traveller} />
                      </td>
                      <td className="max-w-[240px] px-4 py-4">
                        <span className="flex flex-col">
                          <span className="font-title-md text-title-md text-on-surface">
                            {trip.title}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {trip.destination} ·{' '}
                            {t('tripAdmin.table.people', { count: trip.groupSize })}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-4 font-body-sm text-body-sm whitespace-nowrap text-on-surface-variant">
                        {displayDate(trip.startDate)} – {displayDate(trip.endDate)}
                      </td>
                      <td className="px-4 py-4">
                        <TripStatusBadge trip={trip} />
                      </td>
                      <td className="px-4 py-4">
                        <TripProgress trip={trip} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex h-8 items-center gap-1 rounded-full px-3 font-label-sm text-label-sm font-semibold whitespace-nowrap text-primary hover:bg-secondary-container/60">
                          <Icon name="visibility" className="text-[16px]" />
                          {t('tripAdmin.table.view')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={result.total}
            itemLabel={t('tripAdmin.table.items')}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={(next) => update({ page: next })}
            onPageSizeChange={(size) =>
              update({ size: size === PAGE_SIZE_OPTIONS[0] ? '' : size, page: 1 })
            }
          />
        </div>
      )}
    </div>
  );
}
