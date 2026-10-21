import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, Pagination } from '@/components/common';
import {
  DEFAULT_APPROVED_FILTERS,
  LISTING_PAGE_SIZE_OPTIONS,
  PARTNER_TIER_CONFIG,
} from '@/constants/listing';
import { PROVINCE_NAMES } from '@/constants/partner';
import { listingReviewPath, ROUTES } from '@/constants/routes';
import { useListings, useToast } from '@/hooks';
import type { ApprovedListingFilters, Listing, ListingCategory, ListingFormValues } from '@/types';
import { downloadCsv } from '@/utils/exportCsv';
import { todayIsoDate } from '@/utils/format';
import { filterApprovedListings, formatApprovedAt } from './approvedUtils';
import ApprovedFilterBar from './components/ApprovedFilterBar';
import ApprovedStatsCards from './components/ApprovedStatsCards';
import ApprovedTable from './components/ApprovedTable';
import AssignCategoryModal from './components/AssignCategoryModal';
import HideListingModal from './components/HideListingModal';
import ListingFormModal from './components/ListingFormModal';

type FormState = { mode: 'add' } | { mode: 'edit'; listing: Listing } | null;

const TOOL_BUTTON_CLASS =
  'flex h-10 items-center gap-2 rounded-xl px-4 font-label-md text-label-md shadow-sm transition-all';

/** Màn Địa điểm đã phê duyệt: /admin/listings/approved */
export default function ApprovedListingsPage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { listings, stats, setListingsVisibility, updateListing, assignCategory, addListing } =
    useListings();

  const [filters, setFilters] = useState<ApprovedListingFilters>(DEFAULT_APPROVED_FILTERS);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(LISTING_PAGE_SIZE_OPTIONS[0]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hideTargets, setHideTargets] = useState<Listing[] | null>(null);
  const [assigningCategory, setAssigningCategory] = useState(false);
  const [form, setForm] = useState<FormState>(null);

  const filtered = useMemo(() => filterApprovedListings(listings, filters), [listings, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageListings = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ===== Bộ lọc =====
  const changeFilters = (changes: Partial<ApprovedListingFilters>) => {
    setFilters((current) => ({ ...current, ...changes }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_APPROVED_FILTERS);
    setPage(1);
    showToast(t('approvedListings.page.filtersReset'), 'info');
  };

  // ===== Chọn nhiều =====
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
      pageListings.forEach((listing) => (checked ? next.add(listing.id) : next.delete(listing.id)));
      return next;
    });
  };

  const selectedListings = listings.filter((listing) => selectedIds.has(listing.id));

  // ===== Ẩn / hiện =====
  const openBulkHide = () => {
    const visible = selectedListings.filter((listing) => listing.visibility !== 'hidden');
    if (visible.length === 0) {
      showToast(t('approvedListings.page.allSelectedPlacesAlready'), 'info');
      return;
    }
    setHideTargets(visible);
  };

  const confirmHide = (reason: string) => {
    if (!hideTargets) return;
    const count = setListingsVisibility(
      hideTargets.map((listing) => listing.id),
      'hidden',
      reason,
    );
    showToast(
      count === 1
        ? t('approvedListings.page.hid', { name: hideTargets[0].name })
        : t('approvedListings.page.hidPlaces', { count }),
      'info',
    );
    setHideTargets(null);
    setSelectedIds(new Set());
  };

  const showListing = (listing: Listing) => {
    setListingsVisibility([listing.id], 'visible');
    showToast(t('approvedListings.page.isVisibleAppAgain', { name: listing.name }));
  };

  // ===== Danh mục, thêm & sửa =====
  const confirmAssignCategory = (category: ListingCategory) => {
    assignCategory([...selectedIds], category);
    showToast(t('approvedListings.page.assignedCategoryPlaces', { count: selectedIds.size }));
    setAssigningCategory(false);
    setSelectedIds(new Set());
  };

  const submitForm = (values: ListingFormValues) => {
    if (form?.mode === 'edit') {
      updateListing(form.listing.id, values);
      showToast(t('approvedListings.page.updatedDetails', { name: values.name }));
    } else {
      const created = addListing(values);
      showToast(
        t('approvedListings.page.addedPublishedItApp', { name: created.name, id: created.id }),
      );
      setFilters(DEFAULT_APPROVED_FILTERS);
      setPage(1);
    }
    setForm(null);
  };

  const handleExport = () => {
    downloadCsv(
      `dia-diem-da-duyet-${todayIsoDate()}.csv`,
      [
        t('approvedListings.page.poiCode'),
        t('approvedListings.page.place'),
        t('approvedListings.page.partner'),
        t('approvedListings.page.partnerTier'),
        t('approvedListings.page.category'),
        t('approvedListings.page.provinceCity'),
        t('approvedListings.page.reviews'),
        t('approvedListings.page.reviews2'),
        t('approvedListings.page.views'),
        t('approvedListings.page.approved'),
        t('approvedListings.page.visibility'),
        t('approvedListings.page.hiddenReason'),
      ],
      filtered.map((listing) => [
        listing.id,
        listing.name,
        listing.partnerName,
        PARTNER_TIER_CONFIG[listing.partnerTier].label,
        listing.categoryLabel,
        PROVINCE_NAMES[listing.province],
        listing.rating ?? '',
        listing.reviewCount ?? 0,
        listing.views ?? 0,
        formatApprovedAt(listing.reviewedAt).date,
        listing.visibility === 'hidden'
          ? t('approvedListings.page.hidden')
          : t('approvedListings.page.visible'),
        listing.hiddenReason ?? '',
      ]),
    );
    showToast(t('approvedListings.page.exportedPlacesExcelFile', { count: filtered.length }));
  };

  return (
    <div className="flex flex-col gap-space-lg pb-12">
      {/* Breadcrumb & tiêu đề */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex flex-col">
          <nav className="mb-2 flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <Link to={ROUTES.DASHBOARD} className="hover:text-primary">
              {t('approvedListings.page.systemAdministration')}
            </Link>
            <Icon name="chevron_right" className="text-[14px] text-outline" />
            <Link to={ROUTES.LISTINGS} className="hover:text-primary">
              {t('approvedListings.page.listingManagement')}
            </Link>
            <Icon name="chevron_right" className="text-[14px] text-outline" />
            <span className="font-semibold text-primary">
              {t('approvedListings.page.approvedPlaces')}
            </span>
          </nav>
          <h1 className="font-display-sm text-display-sm tracking-tight text-on-surface">
            {t('approvedListings.page.approvedPlaces2')}
          </h1>
          <p className="mt-1 max-w-3xl font-body-md text-body-md text-on-surface-variant">
            {t('approvedListings.page.accommodationDiningAttractionBusinesses')}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className={`${TOOL_BUTTON_CLASS} bg-surface-container-lowest text-on-surface hover:bg-surface-container`}
          >
            <Icon name="download" className="text-[18px] text-primary" />
            <span>{t('approvedListings.page.exportExcel')}</span>
          </button>
          <button
            type="button"
            onClick={() => setAdvancedOpen((open) => !open)}
            className={`${TOOL_BUTTON_CLASS} ${
              advancedOpen
                ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
            }`}
          >
            <Icon name="tune" className="text-[18px] text-tertiary" />
            <span>{t('approvedListings.page.advancedFilters')}</span>
          </button>
          <button
            type="button"
            onClick={() => setForm({ mode: 'add' })}
            className={`${TOOL_BUTTON_CLASS} bg-primary text-on-primary hover:bg-primary-container`}
          >
            <Icon name="add_location_alt" className="text-[18px]" />
            <span>{t('approvedListings.page.addManually')}</span>
          </button>
        </div>
      </div>

      <ApprovedStatsCards stats={stats} />

      <ApprovedFilterBar
        filters={filters}
        advancedOpen={advancedOpen}
        onChange={changeFilters}
        onReset={resetFilters}
      />

      <ApprovedTable
        listings={pageListings}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkHide={openBulkHide}
        onBulkAssignCategory={() => setAssigningCategory(true)}
        onOpenDetail={(listing) => navigate(listingReviewPath(listing.id))}
        onEdit={(listing) => setForm({ mode: 'edit', listing })}
        onHide={(listing) => setHideTargets([listing])}
        onShow={showListing}
        footer={
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            totalItems={filtered.length}
            itemLabel={t('approvedListings.page.approvedPlaces3')}
            pageSizeOptions={LISTING_PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        }
      />

      {hideTargets && (
        <HideListingModal
          targets={hideTargets}
          onConfirm={confirmHide}
          onClose={() => setHideTargets(null)}
        />
      )}

      {assigningCategory && (
        <AssignCategoryModal
          count={selectedIds.size}
          onConfirm={confirmAssignCategory}
          onClose={() => setAssigningCategory(false)}
        />
      )}

      {form && (
        <ListingFormModal
          key={form.mode === 'edit' ? form.listing.id : 'new'}
          listing={form.mode === 'edit' ? form.listing : null}
          onSubmit={submitForm}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
}
