import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { listingReviewPath, listingRevisionPath } from '@/constants/routes';
import { useListingReview } from '@/hooks';
import { listingReviewService } from '@/services/listingReviewService';
import type {
  ListingRevision,
  Paged,
  ReviewListing,
  ReviewListingStatus,
  RevisionStatus,
  SelectOption,
} from '@/types';
import { getErrorMessage } from '@/utils/error';
import { formatNumber } from '@/utils/format';
import { ListingStatusBadge, RevisionStatusBadge } from './components/StatusBadges';
import {
  coverOf,
  displayDate,
  LISTING_STATUS_STYLE,
  REVISION_STATUS_STYLE,
} from './placeReviewUtils';

type Tab = 'listings' | 'revisions';
const SEARCH_DELAY_MS = 350;
const LISTING_STATUSES = Object.keys(LISTING_STATUS_STYLE) as ReviewListingStatus[];
const REVISION_STATUSES = Object.keys(REVISION_STATUS_STYLE) as RevisionStatus[];

function Thumb({ url }: { url?: string }) {
  return url ? (
    <img src={url} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
  ) : (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container text-outline">
      <Icon name="image" className="text-[20px]" />
    </span>
  );
}

/** Hàng chờ duyệt: /admin/listings?tab=listings|revisions&status=… — dữ liệu thật */
export default function PlaceReviewQueuePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { stats, version, refreshStats } = useListingReview();

  const tab: Tab = params.get('tab') === 'revisions' ? 'revisions' : 'listings';
  const statuses: string[] = tab === 'listings' ? LISTING_STATUSES : REVISION_STATUSES;
  const statusParam = params.get('status') ?? 'all';
  const status = statusParam === 'all' || statuses.includes(statusParam) ? statusParam : 'all';

  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [result, setResult] = useState<Paged<ReviewListing> | Paged<ListingRevision> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

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
    const query = { status, keyword: search, page: page - 1, size: pageSize };
    const request =
      tab === 'listings'
        ? listingReviewService.listListings(
            query as Parameters<typeof listingReviewService.listListings>[0],
          )
        : listingReviewService.listRevisions(
            query as Parameters<typeof listingReviewService.listRevisions>[0],
          );
    request
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
  }, [tab, status, search, page, pageSize, version, retry]);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => next.set(key, value));
    setParams(next, { replace: true });
    setPage(1);
  };

  const changeTab = (next: Tab) => {
    if (next === tab) return;
    setResult(null);
    setKeyword('');
    setSearch('');
    update({ tab: next, status: 'all' });
  };

  const statusOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: 'all', label: t('placeReview.filters.all') },
      ...(tab === 'listings'
        ? LISTING_STATUSES.map((value) => ({
            value,
            label: t(LISTING_STATUS_STYLE[value].labelKey),
          }))
        : REVISION_STATUSES.map((value) => ({
            value,
            label: t(REVISION_STATUS_STYLE[value].labelKey),
          }))),
    ],
    [t, tab],
  );

  const tabButton = (value: Tab, label: string, count: number) => (
    <button
      type="button"
      onClick={() => changeTab(value)}
      className={`flex items-center gap-2 rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${
        tab === value
          ? 'bg-primary font-semibold text-on-primary'
          : 'text-on-surface-variant hover:bg-surface-container'
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm ${
            tab === value ? 'bg-on-primary/20' : 'bg-tertiary-fixed text-on-tertiary-fixed'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  const th = 'py-4 font-semibold';
  const reviewButton = (onClick: () => void, pending: boolean) => (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1 rounded-full px-3 font-label-sm text-label-sm font-semibold ${
        pending
          ? 'bg-primary text-on-primary hover:bg-primary-container'
          : 'text-primary hover:bg-secondary-container/60'
      }`}
    >
      <Icon name={pending ? 'fact_check' : 'visibility'} className="text-[16px]" />
      {t(pending ? 'placeReview.table.review' : 'placeReview.table.view')}
    </button>
  );

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[
            ADMIN_ROOT_CRUMB,
            { label: t('nav.listings'), icon: 'store_mall_directory' },
          ]}
          eyebrow={t('placeReview.header.eyebrow')}
          eyebrowNote={t('placeReview.header.eyebrowNote')}
          title={t('placeReview.header.title')}
          description={t('placeReview.header.description')}
          actions={
            <Button
              variant="neutral"
              icon="refresh"
              onClick={() => {
                refreshStats();
                setRetry((n) => n + 1);
              }}
            >
              {t('partnerAdmin.actions.refresh')}
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('placeReview.stats.pending')}
          value={formatNumber(stats.pending)}
          icon="add_location_alt"
          iconClassName="bg-tertiary-fixed text-on-tertiary-fixed"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('placeReview.stats.pendingHint')}
            </p>
          }
        />
        <StatCard
          label={t('placeReview.stats.revisions')}
          value={formatNumber(stats.pendingRevisions)}
          icon="edit_location_alt"
          iconClassName="bg-secondary-container text-on-secondary-container"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('placeReview.stats.revisionsHint')}
            </p>
          }
        />
        <StatCard
          label={t('placeReview.stats.approved')}
          value={formatNumber(stats.approved)}
          icon="verified"
          iconClassName="bg-surface-container-high text-primary"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('placeReview.stats.approvedHint', { total: formatNumber(stats.total) })}
            </p>
          }
        />
        <StatCard
          label={t('placeReview.stats.rejected')}
          value={formatNumber(stats.rejected)}
          icon="block"
          iconClassName="bg-error-container text-on-error-container"
          footer={
            <p className="mt-4 font-body-sm text-body-sm text-on-surface-variant">
              {t('placeReview.stats.rejectedHint')}
            </p>
          }
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabButton('listings', t('placeReview.tabs.listings'), stats.pending)}
          {tabButton('revisions', t('placeReview.tabs.revisions'), stats.pendingRevisions)}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
              {t('placeReview.filters.searchLabel')}
            </span>
            <span className="flex h-11 items-center gap-2 rounded-xl bg-surface-container-low px-3 focus-within:ring-2 focus-within:ring-primary">
              <Icon name="search" className="text-[20px] text-outline" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={t(
                  tab === 'listings'
                    ? 'placeReview.filters.searchListings'
                    : 'placeReview.filters.searchRevisions',
                )}
                className="h-full flex-1 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
              />
            </span>
          </label>
          <div className="md:w-64">
            <FilterSelect
              label={t('placeReview.filters.status')}
              icon="fact_check"
              value={status}
              options={statusOptions}
              onChange={(value) => update({ status: value })}
            />
          </div>
        </div>
      </div>

      {error && !result ? (
        <ErrorState
          title={t('placeReview.detail.loadError')}
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
                  <th className={`${th} px-6`}>{t('placeReview.table.place')}</th>
                  <th className={`${th} px-4`}>{t('placeReview.table.business')}</th>
                  <th className={`${th} px-4`}>{t('placeReview.table.province')}</th>
                  <th className={`${th} px-4`}>{t('placeReview.table.submitted')}</th>
                  <th className={`${th} px-4`}>{t('placeReview.table.status')}</th>
                  <th className={`${th} px-6 text-right`}>{t('placeReview.table.actions')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-surface-container ${loading ? 'opacity-50' : ''}`}>
                {result.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                        <Icon name="inbox" className="text-[40px] text-outline" />
                        <span className="font-title-md text-title-md">
                          {t('placeReview.table.empty')}
                        </span>
                        <span className="font-body-sm text-body-sm">
                          {t('placeReview.table.emptyHint')}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : tab === 'listings' ? (
                  (result.items as ReviewListing[]).map((listing) => (
                    <tr key={listing.id} className="hover:bg-surface-container-low/60">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Thumb url={coverOf(listing)} />
                          <div className="flex flex-col">
                            <span className="font-title-md text-title-md text-on-surface">
                              {listing.name}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {[listing.group?.name, listing.category?.name]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-body-md text-body-md text-on-surface">
                        {listing.businessName}
                      </td>
                      <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                        {listing.province?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                        {displayDate(listing.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <ListingStatusBadge status={listing.status} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        {reviewButton(
                          () => navigate(listingReviewPath(listing.id)),
                          listing.status === 'pending',
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  (result.items as ListingRevision[]).map((revision) => (
                    <tr key={revision.id} className="hover:bg-surface-container-low/60">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Thumb url={coverOf(revision.proposed)} />
                          <div className="flex flex-col">
                            <span className="font-title-md text-title-md text-on-surface">
                              {revision.proposed.name}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {[revision.proposed.group?.name, revision.proposed.category?.name]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-body-md text-body-md text-on-surface">
                        {revision.businessName}
                      </td>
                      <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                        {revision.proposed.province?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">
                        {displayDate(revision.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <RevisionStatusBadge status={revision.status} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        {reviewButton(
                          () => navigate(listingRevisionPath(revision.id)),
                          revision.status === 'pending',
                        )}
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
            itemLabel={t('placeReview.table.items')}
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
