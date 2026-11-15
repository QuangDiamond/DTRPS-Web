import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
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
import { placeDetailPath } from '@/constants/routes';
import { useLiveRefresh, useToast } from '@/hooks';
import { displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { placeCatalogService } from '@/services/placeCatalogService';
import { reviewAdminService } from '@/services/reviewAdminService';
import type {
  AdminPlaceReview,
  AdminTripFeedback,
  CategoryGroupRef,
  Paged,
  PlaceReviewStatus,
  RefItem,
  ReviewSort,
  ReviewStats,
  SelectOption,
} from '@/types';
import { getErrorMessage } from '@/utils/error';
import { formatNumber, todayIsoDate } from '@/utils/format';
import PlacePicker from './components/PlacePicker';
import ReportedReviewsPanel from './components/ReportedReviewsPanel';
import RatingStars from './components/RatingStars';
import { Author, Comment } from './components/ReviewParts';
import ReviewStatusModal from './components/ReviewStatusModal';
import {
  isPeriod,
  isRatingFilter,
  isReviewSort,
  type Period,
  periodRange,
  PERIODS,
  RATING_EXACT,
  RATING_FILTERS,
  RATING_GROUPS,
  type RatingFilter,
  REVIEW_SORTS,
  STATUS_STYLE,
} from './reviewAdminUtils';

type Tab = 'places' | 'trips' | 'reports';

const SEARCH_DELAY_MS = 350;

/** Bộ lọc chỉ có ở tab đánh giá địa điểm — đổi sang tab chuyến đi thì bỏ */
const PLACE_ONLY_FILTERS = {
  status: 'all',
  place: '',
  group: 'all',
  category: 'all',
  province: 'all',
  // Tab "Bị báo cáo"
  rstatus: '',
  reason: 'all',
  rsort: '',
};

/** Sự kiện realtime làm danh sách tự tải lại: khách gửi đánh giá mới, admin khác ẩn / hiện */
const LIVE_EVENTS = ['PLACE_REVIEW_', 'TRIP_FEEDBACK_'];

/** Quản lý đánh giá: /admin/reviews — đánh giá địa điểm (ẩn / hiện kèm lý do) + đánh giá chuyến đi */
export default function ReviewAdminPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  // Tab, bộ lọc, trang nằm trên URL: F5 hay quay lại vẫn đúng chỗ đang xem
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab: Tab = tabParam === 'trips' || tabParam === 'reports' ? tabParam : 'places';
  const search = params.get('q') ?? '';
  const ratingParam = params.get('rating');
  const rating: RatingFilter | 'all' = isRatingFilter(ratingParam) ? ratingParam : 'all';
  const statusParam = params.get('status');
  const status: PlaceReviewStatus | 'all' =
    statusParam === 'visible' || statusParam === 'hidden' ? statusParam : 'all';
  const placeId = params.get('place') ?? '';
  const group = params.get('group') ?? 'all';
  const category = params.get('category') ?? 'all';
  const province = params.get('province') ?? 'all';
  const periodParam = params.get('period');
  const period: Period = isPeriod(periodParam) ? periodParam : 'all';
  const customFrom = params.get('from') ?? '';
  const customTo = params.get('to') ?? '';
  const sortParam = params.get('sort');
  const sort: ReviewSort = isReviewSort(sortParam) ? sortParam : 'newest';
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
              (key === 'tab' && text === 'places') ||
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

  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [places, setPlaces] = useState<Paged<AdminPlaceReview> | null>(null);
  const [trips, setTrips] = useState<Paged<AdminTripFeedback> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const [target, setTarget] = useState<AdminPlaceReview | null>(null);
  const [busy, setBusy] = useState(false);

  // Realtime: có đánh giá mới hoặc admin khác ẩn / hiện → tải lại số liệu + trang đang xem
  useLiveRefresh(LIVE_EVENTS, refresh);

  useEffect(() => {
    let active = true;
    reviewAdminService
      .stats()
      .then((next) => active && setStats(next))
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

  // Nhóm dịch vụ / loại hình / tỉnh cho bộ lọc địa điểm
  const [groups, setGroups] = useState<CategoryGroupRef[]>([]);
  const [provinces, setProvinces] = useState<RefItem[]>([]);
  useEffect(() => {
    let active = true;
    Promise.all([placeCatalogService.categories(), placeCatalogService.provinces()])
      .then(([nextGroups, nextProvinces]) => {
        if (!active) return;
        setGroups(nextGroups);
        setProvinces(nextProvinces);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Tên địa điểm đang lọc (URL chỉ giữ id, ví dụ mở từ nút "Xem đánh giá" ở Kho địa điểm)
  const [placeNames, setPlaceNames] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!placeId || placeNames[placeId]) return;
    let active = true;
    placeCatalogService
      .get(placeId)
      .then((detail) => {
        if (active) setPlaceNames((names) => ({ ...names, [placeId]: detail.place.name }));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [placeId, placeNames]);
  const selectedPlace = placeId
    ? { id: placeId, name: placeNames[placeId] ?? t('reviewAdmin.filters.placeLoading') }
    : null;

  useEffect(() => {
    // Tab "Bị báo cáo" tự tải dữ liệu của mình
    if (tab === 'reports') return;
    let active = true;
    setLoading(true);
    const stars = rating === 'all' ? undefined : RATING_FILTERS[rating];
    const query = {
      keyword: search,
      minRating: stars?.min,
      maxRating: stars?.max,
      ...periodRange(period, customFrom, customTo),
      sort,
      status,
      placeId,
      group,
      category,
      province,
      page: page - 1,
      size: pageSize,
    };
    const request =
      tab === 'places'
        ? reviewAdminService.placeReviews(query).then((next) => active && setPlaces(next))
        : reviewAdminService.tripFeedback(query).then((next) => active && setTrips(next));
    request
      .then(() => active && setError(null))
      .catch((loadError: unknown) => active && setError(getErrorMessage(loadError)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [
    tab,
    search,
    rating,
    period,
    customFrom,
    customTo,
    sort,
    status,
    placeId,
    group,
    category,
    province,
    page,
    pageSize,
    reload,
  ]);

  const changeStatus = async (reason: string) => {
    if (!target) return;
    const next: PlaceReviewStatus = target.status === 'visible' ? 'hidden' : 'visible';
    setBusy(true);
    try {
      const updated = await reviewAdminService.changeStatus(target.id, next, reason);
      setPlaces(
        (current) =>
          current && {
            ...current,
            items: current.items.map((item) => (item.id === updated.id ? updated : item)),
          },
      );
      showToast(t(next === 'hidden' ? 'reviewAdmin.toast.hidden' : 'reviewAdmin.toast.shown'));
      setTarget(null);
      // Số liệu (đang hiện / đã ẩn) và bộ lọc trạng thái cần dữ liệu mới
      refresh();
    } catch (changeError) {
      showToast(getErrorMessage(changeError), 'error');
    } finally {
      setBusy(false);
    }
  };

  const ratingOptions = useMemo<SelectOption<RatingFilter | 'all'>[]>(
    () => [
      { value: 'all', label: t('reviewAdmin.filters.allRatings') },
      ...RATING_GROUPS.map((value) => ({
        value,
        label: t(
          `reviewAdmin.filters.ratingGroups.${value as 'negative' | 'neutral' | 'positive'}`,
        ),
      })),
      ...RATING_EXACT.map((value) => ({
        value,
        label: t('reviewAdmin.filters.stars', { count: Number(value) }),
      })),
    ],
    [t],
  );
  const periodOptions = useMemo<SelectOption<Period>[]>(
    () => PERIODS.map((value) => ({ value, label: t(`reviewAdmin.filters.periods.${value}`) })),
    [t],
  );
  const sortOptions = useMemo<SelectOption<ReviewSort>[]>(
    () => REVIEW_SORTS.map((value) => ({ value, label: t(`reviewAdmin.filters.sorts.${value}`) })),
    [t],
  );
  const groupOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('reviewAdmin.filters.allGroups') },
      ...groups.map((item) => ({ value: item.code, label: item.name })),
    ],
    [groups, t],
  );
  /** Loại hình của nhóm đang chọn */
  const categoryOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('reviewAdmin.filters.allCategories') },
      ...(groups.find((item) => item.code === group)?.subtypes ?? []).map((item) => ({
        value: item.code,
        label: item.name,
      })),
    ],
    [groups, group, t],
  );
  const provinceOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('reviewAdmin.filters.allProvinces') },
      ...provinces.map((item) => ({ value: item.code, label: item.name })),
    ],
    [provinces, t],
  );

  /** Có bộ lọc nào khác mặc định không (để hiện nút "Xoá bộ lọc") */
  const filtered =
    Boolean(search) ||
    rating !== 'all' ||
    period !== 'all' ||
    sort !== 'newest' ||
    (tab === 'places' &&
      (status !== 'all' ||
        Boolean(placeId) ||
        group !== 'all' ||
        category !== 'all' ||
        province !== 'all'));
  const clearFilters = () => {
    setKeyword('');
    update({
      q: '',
      rating: 'all',
      period: 'all',
      from: '',
      to: '',
      sort: 'newest',
      ...PLACE_ONLY_FILTERS,
      page: 1,
    });
  };
  const statusOptions = useMemo<SelectOption<PlaceReviewStatus | 'all'>[]>(
    () => [
      { value: 'all', label: t('reviewAdmin.filters.allStatuses') },
      { value: 'visible', label: t('reviewAdmin.status.visible') },
      { value: 'hidden', label: t('reviewAdmin.status.hidden') },
    ],
    [t],
  );

  const average = (value: number | null | undefined) =>
    value === null || value === undefined ? '—' : value.toFixed(1);

  const tabButton = (value: Tab, label: string, count: number | undefined, icon: string) => (
    <button
      key={value}
      type="button"
      onClick={() => {
        // Đổi tab → bỏ các bộ lọc riêng của đánh giá địa điểm và về trang 1
        update({ tab: value, ...PLACE_ONLY_FILTERS, page: 1 });
      }}
      className={`flex items-center gap-2 rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${
        tab === value
          ? 'bg-primary font-semibold text-on-primary'
          : 'text-on-surface-variant hover:bg-surface-container'
      }`}
    >
      <Icon name={icon} className="text-[18px]" />
      {label}
      {count !== undefined && (
        <span
          className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm ${
            tab === value ? 'bg-on-primary/20' : 'bg-surface-container-high'
          }`}
        >
          {formatNumber(count)}
        </span>
      )}
    </button>
  );

  const th = 'py-4 font-semibold';
  const result = tab === 'places' ? places : trips;
  const emptyRow = (colSpan: number) => (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-2 text-on-surface-variant">
          <Icon name="reviews" className="text-[40px] text-outline" />
          <span className="font-title-md text-title-md">{t('reviewAdmin.table.empty')}</span>
          <span className="font-body-sm text-body-sm">{t('reviewAdmin.table.emptyHint')}</span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.reviews'), icon: 'reviews' }]}
          eyebrow={t('reviewAdmin.header.eyebrow')}
          title={t('reviewAdmin.header.title')}
          description={t('reviewAdmin.header.description')}
          actions={
            <Button variant="neutral" icon="refresh" onClick={refresh}>
              {t('reviewAdmin.header.refresh')}
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('reviewAdmin.stats.placeTotal')}
          value={formatNumber(stats?.placeTotal ?? 0)}
          icon="rate_review"
          iconClassName="bg-surface-container-high text-primary"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('reviewAdmin.stats.placeTotalHint', {
                visible: formatNumber(stats?.placeVisible ?? 0),
              })}
            </p>
          }
        />
        <StatCard
          label={t('reviewAdmin.stats.placeAverage')}
          value={average(stats?.placeAverage)}
          icon="star"
          iconClassName="bg-amber-50 text-amber-600"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('reviewAdmin.stats.lowRatingHint', { count: stats?.lowRatingThisWeek ?? 0 })}
            </p>
          }
        />
        <StatCard
          label={t('reviewAdmin.stats.hidden')}
          value={formatNumber(stats?.placeHidden ?? 0)}
          icon="visibility_off"
          iconClassName="bg-error-container text-on-error-container"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('reviewAdmin.stats.hiddenHint')}
            </p>
          }
        />
        <StatCard
          label={t('reviewAdmin.stats.tripTotal')}
          value={formatNumber(stats?.tripTotal ?? 0)}
          icon="luggage"
          iconClassName="bg-primary-fixed text-on-primary-fixed"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('reviewAdmin.stats.tripAverageHint', { average: average(stats?.tripAverage) })}
            </p>
          }
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabButton('places', t('reviewAdmin.tabs.places'), stats?.placeTotal, 'location_on')}
          {tabButton('trips', t('reviewAdmin.tabs.trips'), stats?.tripTotal, 'luggage')}
          {tabButton('reports', t('reviewAdmin.tabs.reports'), stats?.reportedPending, 'flag')}
        </div>
        {tab !== 'reports' && (
          <>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <label className="flex flex-1 flex-col gap-1.5">
                <span className="font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                  {t('reviewAdmin.filters.searchLabel')}
                </span>
                <span className="flex h-11 items-center gap-2 rounded-xl bg-surface-container-low px-3 focus-within:ring-2 focus-within:ring-primary">
                  <Icon name="search" className="text-[20px] text-outline" />
                  <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder={t(
                      tab === 'places'
                        ? 'reviewAdmin.filters.searchPlaces'
                        : 'reviewAdmin.filters.searchTrips',
                    )}
                    className="h-full flex-1 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
                  />
                </span>
              </label>
              {filtered && (
                <Button variant="ghost" icon="filter_alt_off" onClick={clearFilters}>
                  {t('reviewAdmin.filters.clear')}
                </Button>
              )}
            </div>

            {tab === 'places' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <PlacePicker
                  value={selectedPlace}
                  onChange={(place) => {
                    if (place) setPlaceNames((names) => ({ ...names, [place.id]: place.name }));
                    update({ place: place?.id ?? '', page: 1 });
                  }}
                />
                <FilterSelect
                  label={t('reviewAdmin.filters.group')}
                  icon="category"
                  value={group}
                  options={groupOptions}
                  // Đổi nhóm → chọn lại loại hình
                  onChange={(value) => update({ group: value, category: 'all', page: 1 })}
                />
                <FilterSelect
                  label={t('reviewAdmin.filters.category')}
                  icon="sell"
                  value={category}
                  options={categoryOptions}
                  onChange={(value) => update({ category: value, page: 1 })}
                />
                <FilterSelect
                  label={t('reviewAdmin.filters.province')}
                  icon="map"
                  value={province}
                  options={provinceOptions}
                  onChange={(value) => update({ province: value, page: 1 })}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FilterSelect
                label={t('reviewAdmin.filters.rating')}
                icon="star"
                value={rating}
                options={ratingOptions}
                onChange={(value) => update({ rating: value, page: 1 })}
              />
              <FilterSelect
                label={t('reviewAdmin.filters.period')}
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
              {tab === 'places' && (
                <FilterSelect
                  label={t('reviewAdmin.filters.status')}
                  icon="toggle_on"
                  value={status}
                  options={statusOptions}
                  onChange={(value) => update({ status: value, page: 1 })}
                />
              )}
              <FilterSelect
                label={t('reviewAdmin.filters.sort')}
                icon="sort"
                value={sort}
                options={sortOptions}
                onChange={(value) => update({ sort: value, page: 1 })}
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
          </>
        )}
      </div>

      {tab === 'reports' ? (
        <ReportedReviewsPanel
          params={params}
          update={update}
          reload={reload}
          onChanged={refresh}
          selectedPlace={selectedPlace}
          onPlaceChange={(place) => {
            if (place) setPlaceNames((names) => ({ ...names, [place.id]: place.name }));
            update({ place: place?.id ?? '', page: 1 });
          }}
        />
      ) : (
        <>
          <div className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-4 text-on-surface-variant">
            <Icon name="info" className="text-[20px] text-primary" />
            <p className="font-body-sm text-body-sm">
              {t(tab === 'places' ? 'reviewAdmin.notice.places' : 'reviewAdmin.notice.trips')}
            </p>
          </div>

          {error && !result ? (
            <ErrorState title={t('reviewAdmin.loadError')} message={error} onRetry={refresh} />
          ) : !result ? (
            <PageLoader />
          ) : (
            <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
              <div className="table-scroll w-full overflow-x-auto">
                {tab === 'places' && places ? (
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                        <th className={`${th} px-6`}>{t('reviewAdmin.table.author')}</th>
                        <th className={`${th} px-4`}>{t('reviewAdmin.table.place')}</th>
                        <th className={`${th} min-w-[280px] px-4`}>
                          {t('reviewAdmin.table.review')}
                        </th>
                        <th className={`${th} px-4`}>{t('reviewAdmin.table.date')}</th>
                        <th className={`${th} px-4`}>{t('reviewAdmin.table.status')}</th>
                        <th className={`${th} px-6 text-right`}>
                          {t('reviewAdmin.table.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y divide-surface-container ${loading ? 'opacity-50' : ''}`}
                    >
                      {places.items.length === 0
                        ? emptyRow(6)
                        : places.items.map((review) => {
                            const style = STATUS_STYLE[review.status];
                            return (
                              <tr
                                key={review.id}
                                className="align-top hover:bg-surface-container-low/60"
                              >
                                <td className="max-w-[240px] px-6 py-4">
                                  <Author author={review.author} />
                                </td>
                                <td className="max-w-[200px] px-4 py-4">
                                  <Link
                                    to={placeDetailPath(review.place.id)}
                                    className="font-body-md text-body-md font-medium text-primary hover:underline"
                                  >
                                    {review.place.name}
                                  </Link>
                                  {placeId !== review.place.id && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPlaceNames((names) => ({
                                          ...names,
                                          [review.place.id]: review.place.name,
                                        }));
                                        update({ place: review.place.id, page: 1 });
                                      }}
                                      className="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary"
                                    >
                                      <Icon name="filter_alt" className="text-[14px]" />
                                      {t('reviewAdmin.table.onlyThisPlace')}
                                    </button>
                                  )}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex flex-col gap-2">
                                    <RatingStars value={review.rating} />
                                    <Comment
                                      comment={review.comment}
                                      emptyLabel={t('reviewAdmin.table.noComment')}
                                    />
                                    {review.imageUrls.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5">
                                        {review.imageUrls.map((url) => (
                                          <a key={url} href={url} target="_blank" rel="noreferrer">
                                            <img
                                              src={url}
                                              alt=""
                                              className="h-12 w-12 rounded-lg object-cover hover:opacity-80"
                                            />
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 font-body-sm text-body-sm whitespace-nowrap text-on-surface-variant">
                                  {displayDate(review.createdAt)}
                                </td>
                                <td className="px-4 py-4">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold whitespace-nowrap ${style.className}`}
                                  >
                                    <Icon name={style.icon} className="text-[14px]" />
                                    {t(style.labelKey)}
                                  </span>
                                  {review.hiddenReason && (
                                    <p
                                      className="mt-1.5 line-clamp-2 max-w-[180px] font-body-sm text-body-sm text-on-surface-variant"
                                      title={review.hiddenReason}
                                    >
                                      {t('reviewAdmin.table.reason', {
                                        reason: review.hiddenReason,
                                      })}
                                    </p>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button
                                    size="sm"
                                    variant={review.status === 'visible' ? 'ghost' : 'secondary'}
                                    icon={
                                      review.status === 'visible' ? 'visibility_off' : 'visibility'
                                    }
                                    onClick={() => setTarget(review)}
                                  >
                                    {t(
                                      review.status === 'visible'
                                        ? 'reviewAdmin.actions.hide'
                                        : 'reviewAdmin.actions.show',
                                    )}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                    </tbody>
                  </table>
                ) : trips ? (
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                        <th className={`${th} px-6`}>{t('reviewAdmin.table.author')}</th>
                        <th className={`${th} px-4`}>{t('reviewAdmin.table.trip')}</th>
                        <th className={`${th} min-w-[320px] px-4`}>
                          {t('reviewAdmin.table.review')}
                        </th>
                        <th className={`${th} px-6`}>{t('reviewAdmin.table.date')}</th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y divide-surface-container ${loading ? 'opacity-50' : ''}`}
                    >
                      {trips.items.length === 0
                        ? emptyRow(4)
                        : trips.items.map((feedback) => (
                            <tr
                              key={feedback.id}
                              className="align-top hover:bg-surface-container-low/60"
                            >
                              <td className="max-w-[240px] px-6 py-4">
                                <Author author={feedback.author} />
                              </td>
                              <td className="max-w-[240px] px-4 py-4">
                                <span className="flex flex-col">
                                  <span className="font-body-md text-body-md font-medium text-on-surface">
                                    {feedback.plan.title}
                                  </span>
                                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                                    {feedback.plan.destination} ·{' '}
                                    {displayDate(feedback.plan.startDate)} –{' '}
                                    {displayDate(feedback.plan.endDate)}
                                  </span>
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-col gap-2">
                                  <RatingStars value={feedback.rating} />
                                  <Comment
                                    comment={feedback.comment}
                                    emptyLabel={t('reviewAdmin.table.noComment')}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 font-body-sm text-body-sm whitespace-nowrap text-on-surface-variant">
                                {displayDate(feedback.createdAt)}
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                ) : null}
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
        </>
      )}

      {target && (
        <ReviewStatusModal
          review={target}
          busy={busy}
          onConfirm={changeStatus}
          onClose={() => setTarget(null)}
        />
      )}
    </div>
  );
}
