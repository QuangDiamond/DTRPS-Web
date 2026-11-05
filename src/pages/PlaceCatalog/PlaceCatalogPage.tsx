import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
import { placeDetailPath, ROUTES } from '@/constants/routes';
import { displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { placeCatalogService } from '@/services/placeCatalogService';
import type {
  CatalogPlace,
  CatalogPlaceStatus,
  CatalogStats,
  CategoryGroupRef,
  Paged,
  PlaceSource,
  RefItem,
  SelectOption,
} from '@/types';
import { getErrorMessage } from '@/utils/error';
import CatalogStatusBadge from './components/CatalogStatusBadge';
import { formatNumber } from '@/utils/format';
import { CATALOG_STATUSES, PLACE_SOURCES, SOURCE_STYLE, STATUS_STYLE } from './placeCatalogUtils';

const SEARCH_DELAY_MS = 350;
const EMPTY_STATS: CatalogStats = {
  total: 0,
  active: 0,
  draft: 0,
  paused: 0,
  partner: 0,
  admin: 0,
  newThisMonth: 0,
  byGroup: {},
};

function Thumb({ url }: { url?: string }) {
  return url ? (
    <img src={url} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
  ) : (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container text-outline">
      <Icon name="image" className="text-[20px]" />
    </span>
  );
}

/** Kho địa điểm: /admin/locations — mọi địa điểm trong bảng places, dữ liệu thật */
export default function PlaceCatalogPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState<CatalogStats>(EMPTY_STATS);
  const [groups, setGroups] = useState<CategoryGroupRef[]>([]);
  const [provinces, setProvinces] = useState<RefItem[]>([]);

  const [group, setGroup] = useState('all');
  const [category, setCategory] = useState('all');
  const [province, setProvince] = useState('all');
  const [status, setStatus] = useState<CatalogPlaceStatus | 'all'>('all');
  const [source, setSource] = useState<PlaceSource | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

  const [result, setResult] = useState<Paged<CatalogPlace> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  // Danh mục tham chiếu + số liệu (làm mới cùng nút "Làm mới")
  useEffect(() => {
    let active = true;
    Promise.all([
      placeCatalogService.stats(),
      placeCatalogService.categories(),
      placeCatalogService.provinces(),
    ])
      .then(([nextStats, nextGroups, nextProvinces]) => {
        if (!active) return;
        setStats(nextStats);
        setGroups(nextGroups);
        setProvinces(nextProvinces);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [retry]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(keyword);
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    placeCatalogService
      .list({
        keyword: search,
        group,
        category,
        province,
        status,
        source,
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
  }, [search, group, category, province, status, source, page, pageSize, retry]);

  const resetPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const provinceOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('placeCatalog.filters.all') },
      ...provinces.map((item) => ({ value: item.code, label: item.name })),
    ],
    [provinces, t],
  );
  const statusOptions = useMemo<SelectOption<CatalogPlaceStatus | 'all'>[]>(
    () => [
      { value: 'all', label: t('placeCatalog.filters.all') },
      ...CATALOG_STATUSES.map((value) => ({ value, label: t(STATUS_STYLE[value].labelKey) })),
    ],
    [t],
  );
  const sourceOptions = useMemo<SelectOption<PlaceSource | 'all'>[]>(
    () => [
      { value: 'all', label: t('placeCatalog.filters.all') },
      ...PLACE_SOURCES.map((value) => ({ value, label: t(SOURCE_STYLE[value].labelKey) })),
    ],
    [t],
  );

  /** Loại hình của nhóm đang chọn (giống ô "Loại hình" khi đăng ký địa điểm) */
  const subtypes = groups.find((item) => item.code === group)?.subtypes ?? [];

  const groupTab = (code: string, label: string, count: number) => (
    <button
      key={code}
      type="button"
      onClick={() => {
        // Đổi nhóm dịch vụ → chọn lại loại hình (giống form đăng ký địa điểm)
        setCategory('all');
        resetPage(setGroup)(code);
      }}
      className={`flex items-center gap-2 rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${
        group === code
          ? 'bg-primary font-semibold text-on-primary'
          : 'text-on-surface-variant hover:bg-surface-container'
      }`}
    >
      {label}
      <span
        className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm ${
          group === code ? 'bg-on-primary/20' : 'bg-surface-container-high'
        }`}
      >
        {formatNumber(count)}
      </span>
    </button>
  );

  const th = 'py-4 font-semibold';

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.pois'), icon: 'location_on' }]}
          eyebrow={t('placeCatalog.header.eyebrow')}
          eyebrowNote={t('placeCatalog.header.eyebrowNote')}
          title={t('placeCatalog.header.title')}
          description={t('placeCatalog.header.description')}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="neutral" icon="refresh" onClick={() => setRetry((n) => n + 1)}>
                {t('placeCatalog.header.refresh')}
              </Button>
              <Button icon="add_location_alt" onClick={() => navigate(ROUTES.POI_NEW)}>
                {t('placeCatalog.header.add')}
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('placeCatalog.stats.total')}
          value={formatNumber(stats.total)}
          icon="location_on"
          iconClassName="bg-surface-container-high text-primary"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('placeCatalog.stats.totalHint', { count: stats.newThisMonth })}
            </p>
          }
        />
        <StatCard
          label={t('placeCatalog.stats.active')}
          value={formatNumber(stats.active)}
          icon="visibility"
          iconClassName="bg-secondary-container text-on-secondary-container"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('placeCatalog.stats.activeHint')}
            </p>
          }
        />
        <StatCard
          label={t('placeCatalog.stats.draft')}
          value={formatNumber(stats.draft)}
          icon="hourglass_top"
          iconClassName="bg-tertiary-fixed text-on-tertiary-fixed"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('placeCatalog.stats.draftHint')}
            </p>
          }
        />
        <StatCard
          label={t('placeCatalog.stats.sources')}
          value={formatNumber(stats.partner)}
          icon="storefront"
          iconClassName="bg-primary-fixed text-on-primary-fixed"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('placeCatalog.stats.sourcesHint', {
                partner: formatNumber(stats.partner),
                admin: formatNumber(stats.admin),
              })}
            </p>
          }
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {groupTab('all', t('placeCatalog.tabs.all'), stats.total)}
          {groups.map((item) => groupTab(item.code, item.name, stats.byGroup[item.code] ?? 0))}
        </div>
        {subtypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-surface-container pt-3">
            <span className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant">
              <Icon name="sell" className="text-[18px] text-primary" />
              {t('placeCatalog.filters.category')}:
            </span>
            {[{ code: 'all', name: t('placeCatalog.filters.allTypes') }, ...subtypes].map(
              (item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => resetPage(setCategory)(item.code)}
                  className={`rounded-full border px-3 py-1 font-label-md text-label-md transition-colors ${
                    category === item.code
                      ? 'border-primary bg-primary-fixed font-semibold text-on-primary-fixed'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {item.name}
                </button>
              ),
            )}
          </div>
        )}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
              {t('placeCatalog.filters.searchLabel')}
            </span>
            <span className="flex h-11 items-center gap-2 rounded-xl bg-surface-container-low px-3 focus-within:ring-2 focus-within:ring-primary">
              <Icon name="search" className="text-[20px] text-outline" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={t('placeCatalog.filters.searchPlaceholder')}
                className="h-full flex-1 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
              />
            </span>
          </label>
          <div className="lg:w-56">
            <FilterSelect
              label={t('placeCatalog.filters.province')}
              icon="map"
              value={province}
              options={provinceOptions}
              onChange={resetPage(setProvince)}
            />
          </div>
          <div className="lg:w-48">
            <FilterSelect
              label={t('placeCatalog.filters.status')}
              icon="toggle_on"
              value={status}
              options={statusOptions}
              onChange={resetPage(setStatus)}
            />
          </div>
          <div className="lg:w-48">
            <FilterSelect
              label={t('placeCatalog.filters.source')}
              icon="hub"
              value={source}
              options={sourceOptions}
              onChange={resetPage(setSource)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-surface-container-low p-4 text-on-surface-variant">
        <Icon name="info" className="text-[20px] text-primary" />
        <p className="font-body-sm text-body-sm">{t('placeCatalog.notice.readOnly')}</p>
      </div>

      {error && !result ? (
        <ErrorState
          title={t('placeCatalog.detail.loadError')}
          message={error}
          onRetry={() => setRetry((n) => n + 1)}
        />
      ) : !result ? (
        <PageLoader />
      ) : (
        <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
          <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                  <th className={`${th} px-6`}>{t('placeCatalog.table.place')}</th>
                  <th className={`${th} px-4`}>{t('placeCatalog.table.source')}</th>
                  <th className={`${th} px-4`}>{t('placeCatalog.table.province')}</th>
                  <th className={`${th} px-4`}>{t('placeCatalog.table.rating')}</th>
                  <th className={`${th} px-4`}>{t('placeCatalog.table.updated')}</th>
                  <th className={`${th} px-4`}>{t('placeCatalog.table.status')}</th>
                  <th className={`${th} px-6 text-right`}>{t('placeCatalog.table.actions')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-surface-container ${loading ? 'opacity-50' : ''}`}>
                {result.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                        <Icon name="travel_explore" className="text-[40px] text-outline" />
                        <span className="font-title-md text-title-md">
                          {t('placeCatalog.table.empty')}
                        </span>
                        <span className="font-body-sm text-body-sm">
                          {t('placeCatalog.table.emptyHint')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  result.items.map((place) => (
                    <tr
                      key={place.id}
                      onClick={() => navigate(placeDetailPath(place.id))}
                      className="cursor-pointer hover:bg-surface-container-low/60"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Thumb url={place.coverUrl} />
                          <div className="flex min-w-0 flex-col">
                            <span className="font-title-md text-title-md text-on-surface">
                              {place.name}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {[place.group?.name, place.category?.name]
                                .filter(Boolean)
                                .join(' · ')}
                              {place.categories.length > 1 &&
                                ` + ${place.categories
                                  .slice(1)
                                  .map((type) => type.name)
                                  .join(', ')}`}
                              {' · '}
                              {t('placeCatalog.table.photos', { count: place.imageCount })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 font-body-md text-body-md text-on-surface">
                          <Icon
                            name={SOURCE_STYLE[place.source].icon}
                            className="text-[18px] text-primary"
                          />
                          {place.businessName ?? t(SOURCE_STYLE[place.source].labelKey)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                        {place.province?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                        {place.rating === null ? (
                          t('placeCatalog.table.noRating')
                        ) : (
                          <span className="flex items-center gap-1">
                            <Icon name="star" className="text-[16px] text-tertiary" />
                            {place.rating} (
                            {t('placeCatalog.table.reviews', { count: place.reviewCount })})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                        {displayDate(place.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <CatalogStatusBadge status={place.status} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="inline-flex h-8 items-center gap-1 rounded-full px-3 font-label-sm text-label-sm font-semibold text-primary hover:bg-secondary-container/60">
                          <Icon name="visibility" className="text-[16px]" />
                          {t('placeCatalog.table.view')}
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
            itemLabel={t('placeCatalog.table.items')}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
