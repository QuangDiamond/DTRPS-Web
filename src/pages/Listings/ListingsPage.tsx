import { Trans, useTranslation } from 'react-i18next';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AiSemanticSearchBar,
  ConfirmModal,
  Icon,
  PageHeader,
  Pagination,
} from '@/components/common';
import {
  DEFAULT_LISTING_FILTERS,
  LISTING_CATEGORY_CONFIG,
  LISTING_PAGE_SIZE_OPTIONS,
  LISTING_STATUS_CONFIG,
  PARTNER_TIER_CONFIG,
} from '@/constants/listing';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { PROVINCE_NAMES } from '@/constants/partner';
import { listingReviewPath, ROUTES } from '@/constants/routes';
import { useListings, usePartners, useSemanticSearch, useTableSort, useToast } from '@/hooks';
import type { Listing, ListingFilters } from '@/types';
import { downloadCsv } from '@/utils/exportCsv';
import { formatDayTime, todayIsoDate } from '@/utils/format';
import { sortItems } from '@/utils/sort';
import ListingFilterBar from './components/ListingFilterBar';
import ListingStatsCards from './components/ListingStatsCards';
import ListingStatusTabs from './components/ListingStatusTabs';
import ListingTable from './components/ListingTable';
import RejectReasonModal from './components/RejectReasonModal';
import ReviewPolicyModal from './components/ReviewPolicyModal';
import {
  filterListings,
  googleMapsUrl,
  isOverdue,
  LISTING_SORT_ACCESSORS,
  type ListingSortKey,
  type ListingTab,
  parseListingTab,
} from './listingUtils';

const TOOL_BUTTON_CLASS =
  'inline-flex items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2.5 font-label-md text-label-md text-on-surface shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all hover:bg-surface-container-high';

export default function ListingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { listings, stats, approveListings } = useListings();
  // Lấy tên đối tác từ store để đối tác vừa tạo / đổi tên trong phiên hiển thị đúng
  const { partners } = usePartners();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab & đối tác lấy từ URL để link từ Bảng điều khiển / Quản lý đối tác mở đúng bộ lọc
  const tab = parseListingTab(searchParams.get('status'));
  const partnerId = searchParams.get('partner');

  const [filters, setFilters] = useState<ListingFilters>(DEFAULT_LISTING_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(LISTING_PAGE_SIZE_OPTIONS[0]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [policyOpen, setPolicyOpen] = useState(false);
  const [bulkConfirmIds, setBulkConfirmIds] = useState<string[] | null>(null);
  const [reasonListing, setReasonListing] = useState<Listing | null>(null);

  const { sort, toggleSort } = useTableSort<ListingSortKey>();
  // Tìm kiếm ngữ nghĩa AI trên các niêm yết đã index vector
  const buildCorpus = useCallback(
    () =>
      listings.map((listing) => ({
        id: listing.id,
        title: listing.name,
        text: [
          listing.name,
          listing.categoryLabel,
          listing.address,
          listing.partnerName,
          PROVINCE_NAMES[listing.province],
          LISTING_CATEGORY_CONFIG[listing.category].filterLabel,
        ]
          .filter(Boolean)
          .join(' '),
        indexed: listing.vectorEmbedded,
      })),
    [listings],
  );
  const semantic = useSemanticSearch('listings', buildCorpus);
  const filteredListings = useMemo(() => {
    const base = filterListings(listings, tab, filters, partnerId);
    if (!semantic.scores) return sortItems(base, sort, LISTING_SORT_ACCESSORS);
    const scores = semantic.scores;
    const matched = base.filter((listing) => scores.has(listing.id));
    return sort
      ? sortItems(matched, sort, LISTING_SORT_ACCESSORS)
      : matched.sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
  }, [listings, tab, filters, partnerId, sort, semantic.scores]);
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageListings = filteredListings.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const overdueCount = listings.filter((listing) => isOverdue(listing)).length;
  const partnerName =
    partnerId &&
    (partners.find((partner) => partner.id === partnerId)?.name ??
      listings.find((listing) => listing.partnerId === partnerId)?.partnerName ??
      partnerId);

  // ===== Điều hướng & bộ lọc =====
  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next, { replace: true });
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleTabChange = (next: ListingTab) => {
    // "Đã phê duyệt" và "Bị từ chối" có màn quản lý riêng
    if (next === 'approved') {
      navigate(ROUTES.LISTINGS_APPROVED);
      return;
    }
    if (next === 'rejected') {
      navigate(ROUTES.LISTINGS_REJECTED);
      return;
    }
    updateParams({ status: next === 'all' ? null : next });
  };

  const handleFilterChange = (changes: Partial<ListingFilters>) => {
    setFilters((current) => ({ ...current, ...changes }));
    setPage(1);
  };

  // ===== Chọn nhiều & duyệt nhanh =====
  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      pageListings.forEach((listing) => {
        if (checked) next.add(listing.id);
        else next.delete(listing.id);
      });
      return next;
    });
  };

  const handleBulkApproveClick = () => {
    const pendingIds = listings
      .filter((listing) => selectedIds.has(listing.id) && listing.status === 'pending')
      .map((listing) => listing.id);
    if (pendingIds.length === 0) {
      showToast(t('listings.page.selectAtLeastOne'), 'info');
      return;
    }
    setBulkConfirmIds(pendingIds);
  };

  const confirmBulkApprove = () => {
    if (!bulkConfirmIds) return;
    const count = approveListings(bulkConfirmIds);
    setBulkConfirmIds(null);
    setSelectedIds(new Set());
    showToast(t('listings.page.quickApprovedListingSubmissions', { count }));
  };

  // ===== Khác =====
  const handleExport = () => {
    downloadCsv(
      `niem-yet-${todayIsoDate()}.csv`,
      [
        t('listings.page.poiCode'),
        t('listings.page.place'),
        t('listings.page.partner'),
        t('listings.page.partnerTier'),
        t('listings.page.category'),
        t('listings.page.address'),
        t('listings.page.provinceCity'),
        t('listings.page.submittedAt'),
        t('listings.page.status'),
        t('listings.page.rejectionReason'),
      ],
      filteredListings.map((listing) => [
        listing.id,
        listing.name,
        listing.partnerName,
        PARTNER_TIER_CONFIG[listing.partnerTier].label,
        LISTING_CATEGORY_CONFIG[listing.category].filterLabel,
        listing.address,
        PROVINCE_NAMES[listing.province],
        formatDayTime(listing.submittedAt),
        LISTING_STATUS_CONFIG[listing.status].label,
        listing.rejectReason ?? '',
      ]),
    );
    showToast(t('listings.page.exportedSubmissionsExcelFile', { count: filteredListings.length }));
  };

  const openReview = (listing: Listing) => navigate(listingReviewPath(listing.id));

  const openMap = (listing: Listing) => {
    window.open(googleMapsUrl(listing), '_blank', 'noopener,noreferrer');
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[
            ADMIN_ROOT_CRUMB,
            { label: t('nav.listings'), icon: 'store_mall_directory' },
          ]}
          eyebrow={t('pages.listings.eyebrow')}
          eyebrowNote={t('pages.listings.eyebrowNote')}
          title={t('pages.listings.title')}
          description={t('pages.listings.description')}
          actions={
            <>
              <button
                type="button"
                onClick={() => setPolicyOpen(true)}
                className={TOOL_BUTTON_CLASS}
              >
                <Icon name="policy" className="text-[19px] text-on-surface-variant" />
                <span>{t('listings.page.moderationPolicy')}</span>
              </button>
              <button type="button" onClick={handleExport} className={TOOL_BUTTON_CLASS}>
                <Icon name="file_download" className="text-[19px] text-on-surface-variant" />
                <span>{t('actions.exportList')}</span>
              </button>
              <button
                type="button"
                onClick={handleBulkApproveClick}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-md shadow-primary/20 transition-all hover:bg-primary-container"
              >
                <Icon name="verified" className="text-[19px]" />
                <span>{t('actions.quickApprove')}</span>
                {selectedCount > 0 && (
                  <span className="rounded-full bg-on-primary/20 px-2 py-0.5 font-label-sm text-label-sm">
                    {selectedCount}
                  </span>
                )}
              </button>
            </>
          }
        />
      </div>

      <ListingStatsCards stats={stats} overdueCount={overdueCount} />

      <ListingStatusTabs active={tab} stats={stats} onChange={handleTabChange} />

      <ListingFilterBar filters={filters} onChange={handleFilterChange} />

      {partnerName && (
        <div className="-mt-2 flex items-center gap-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {t('listings.page.filteringByPartner')}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 font-label-md text-label-md text-on-secondary-container">
            <Icon name="business_center" className="text-[16px]" />
            {partnerName}
            <button
              type="button"
              onClick={() => updateParams({ partner: null })}
              className="ml-1 flex items-center rounded-full hover:text-error"
              title={t('listings.page.clearPartnerFilter')}
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </span>
        </div>
      )}

      <AiSemanticSearchBar
        state={semantic}
        placeholder={t('search.semantic.listingPlaceholder')}
        resultCount={filteredListings.length}
      />

      <ListingTable
        listings={pageListings}
        matchScores={semantic.scores}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onReview={openReview}
        onShowReason={setReasonListing}
        onOpenMap={openMap}
        sort={sort}
        onSort={(key) => {
          toggleSort(key);
          setPage(1);
        }}
        footer={
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            totalItems={filteredListings.length}
            itemLabel={t('listings.page.submissions')}
            pageSizeOptions={LISTING_PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        }
      />

      {policyOpen && <ReviewPolicyModal onClose={() => setPolicyOpen(false)} />}

      {bulkConfirmIds && (
        <ConfirmModal
          title={t('actions.quickApprove')}
          confirmLabel={t('listings.page.approveSubmissions', { count: bulkConfirmIds.length })}
          confirmIcon="verified"
          onConfirm={confirmBulkApprove}
          onClose={() => setBulkConfirmIds(null)}
        >
          <Trans
            i18nKey="listings.page.youAboutApprovePending"
            values={{ length: bulkConfirmIds.length }}
            components={{ c0: <strong className="text-on-surface" /> }}
          />
          {selectedCount > bulkConfirmIds.length && (
            <span className="mt-2 block font-body-sm text-body-sm text-outline">
              {t('listings.page.selectedSubmissionsNotPending', {
                count: selectedCount - bulkConfirmIds.length,
              })}
            </span>
          )}
        </ConfirmModal>
      )}

      {reasonListing && (
        <RejectReasonModal
          listing={reasonListing}
          onClose={() => setReasonListing(null)}
          onOpenDetail={openReview}
        />
      )}
    </div>
  );
}
