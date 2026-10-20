import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import Pagination from '../../components/common/Pagination';
import {
  DEFAULT_APPROVED_FILTERS,
  LISTING_PAGE_SIZE_OPTIONS,
  PARTNER_TIER_CONFIG,
} from '../../constants/listing';
import { PROVINCE_NAMES } from '../../constants/partner';
import { listingReviewPath, ROUTES } from '../../constants/routes';
import { useListings } from '../../hooks/useListings';
import { useToast } from '../../hooks/useToast';
import type {
  ApprovedListingFilters,
  Listing,
  ListingCategory,
  ListingFormValues,
} from '../../types/admin';
import { downloadCsv } from '../../utils/exportCsv';
import { todayIsoDate } from '../../utils/format';
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
    showToast('Đã làm mới bộ lọc', 'info');
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
      showToast('Các địa điểm đã chọn đều đang tạm ẩn', 'info');
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
      count === 1 ? `Đã tạm ẩn ${hideTargets[0].name}` : `Đã tạm ẩn ${count} địa điểm`,
      'info',
    );
    setHideTargets(null);
    setSelectedIds(new Set());
  };

  const showListing = (listing: Listing) => {
    setListingsVisibility([listing.id], 'visible');
    showToast(`${listing.name} đã hiển thị lại trên ứng dụng`);
  };

  // ===== Danh mục, thêm & sửa =====
  const confirmAssignCategory = (category: ListingCategory) => {
    assignCategory([...selectedIds], category);
    showToast(`Đã gán danh mục cho ${selectedIds.size} địa điểm`);
    setAssigningCategory(false);
    setSelectedIds(new Set());
  };

  const submitForm = (values: ListingFormValues) => {
    if (form?.mode === 'edit') {
      updateListing(form.listing.id, values);
      showToast(`Đã cập nhật thông tin ${values.name}`);
    } else {
      const created = addListing(values);
      showToast(`Đã thêm ${created.name} (${created.id}) và hiển thị ngay trên ứng dụng`);
      setFilters(DEFAULT_APPROVED_FILTERS);
      setPage(1);
    }
    setForm(null);
  };

  const handleExport = () => {
    downloadCsv(
      `dia-diem-da-duyet-${todayIsoDate()}.csv`,
      [
        'Mã POI',
        'Địa điểm',
        'Đối tác',
        'Hạng đối tác',
        'Phân loại',
        'Tỉnh/Thành',
        'Đánh giá',
        'Lượt đánh giá',
        'Lượt xem',
        'Ngày duyệt',
        'Trạng thái hiển thị',
        'Lý do tạm ẩn',
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
        listing.visibility === 'hidden' ? 'Tạm ẩn' : 'Đang hiển thị',
        listing.hiddenReason ?? '',
      ]),
    );
    showToast(`Đã xuất ${filtered.length} địa điểm ra file Excel (CSV)`);
  };

  return (
    <div className="flex flex-col gap-space-lg pb-12">
      {/* Breadcrumb & tiêu đề */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="flex flex-col">
          <nav className="mb-2 flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <Link to={ROUTES.DASHBOARD} className="hover:text-primary">
              Quản trị hệ thống
            </Link>
            <Icon name="chevron_right" className="text-[14px] text-outline" />
            <Link to={ROUTES.LISTINGS} className="hover:text-primary">
              Quản lý niêm yết
            </Link>
            <Icon name="chevron_right" className="text-[14px] text-outline" />
            <span className="font-semibold text-primary">Địa điểm đã duyệt</span>
          </nav>
          <h1 className="font-display-sm text-display-sm tracking-tight text-on-surface">
            Địa điểm đã phê duyệt{' '}
            <span className="font-headline-sm text-headline-sm font-normal tracking-normal text-on-surface-variant">
              (Approved Listings)
            </span>
          </h1>
          <p className="mt-1 max-w-3xl font-body-md text-body-md text-on-surface-variant">
            Danh mục các cơ sở lưu trú, ẩm thực, điểm tham quan đã vượt qua thẩm định và đang phát
            hành công khai trên ứng dụng du lịch Smart Travel.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className={`${TOOL_BUTTON_CLASS} bg-surface-container-lowest text-on-surface hover:bg-surface-container`}
          >
            <Icon name="download" className="text-[18px] text-primary" />
            <span>Xuất dữ liệu Excel</span>
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
            <span>Bộ lọc nâng cao</span>
          </button>
          <button
            type="button"
            onClick={() => setForm({ mode: 'add' })}
            className={`${TOOL_BUTTON_CLASS} bg-primary text-on-primary hover:bg-primary-container`}
          >
            <Icon name="add_location_alt" className="text-[18px]" />
            <span>Thêm thủ công</span>
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
            itemLabel="địa điểm đã duyệt"
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
