import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ConfirmModal from '../../components/common/ConfirmModal';
import Icon from '../../components/common/Icon';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import {
  DEFAULT_LISTING_FILTERS,
  LISTING_CATEGORY_CONFIG,
  LISTING_PAGE_SIZE_OPTIONS,
  LISTING_STATUS_CONFIG,
  PARTNER_TIER_CONFIG,
} from '../../constants/listing';
import { ADMIN_ROOT_CRUMB } from '../../constants/navigation';
import { PROVINCE_NAMES } from '../../constants/partner';
import { listingReviewPath, ROUTES } from '../../constants/routes';
import { useListings } from '../../hooks/useListings';
import { usePartners } from '../../hooks/usePartners';
import { useTableSort } from '../../hooks/useTableSort';
import { useToast } from '../../hooks/useToast';
import type { Listing, ListingFilters } from '../../types/admin';
import { downloadCsv } from '../../utils/exportCsv';
import { formatDayTime, todayIsoDate } from '../../utils/format';
import { sortItems } from '../../utils/sort';
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
  parseListingTab,
  type ListingSortKey,
  type ListingTab,
} from './listingUtils';

const TOOL_BUTTON_CLASS =
  'inline-flex items-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2.5 font-label-md text-label-md text-on-surface shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all hover:bg-surface-container-high';

export default function ListingsPage() {
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
  const filteredListings = useMemo(
    () =>
      sortItems(filterListings(listings, tab, filters, partnerId), sort, LISTING_SORT_ACCESSORS),
    [listings, tab, filters, partnerId, sort],
  );
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
      showToast('Hãy tích chọn ít nhất một hồ sơ đang "Chờ duyệt" để duyệt nhanh', 'info');
      return;
    }
    setBulkConfirmIds(pendingIds);
  };

  const confirmBulkApprove = () => {
    if (!bulkConfirmIds) return;
    const count = approveListings(bulkConfirmIds);
    setBulkConfirmIds(null);
    setSelectedIds(new Set());
    showToast(`Đã duyệt nhanh ${count} hồ sơ niêm yết`);
  };

  // ===== Khác =====
  const handleExport = () => {
    downloadCsv(
      `niem-yet-${todayIsoDate()}.csv`,
      [
        'Mã POI',
        'Địa điểm',
        'Đối tác',
        'Hạng đối tác',
        'Danh mục',
        'Địa chỉ',
        'Tỉnh/Thành',
        'Thời gian gửi',
        'Trạng thái',
        'Lý do từ chối',
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
    showToast(`Đã xuất ${filteredListings.length} hồ sơ ra file Excel (CSV)`);
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
            { label: 'Thẩm định & Quản lý Niêm yết Địa điểm', icon: 'store_mall_directory' },
          ]}
          eyebrow="Trung tâm kiểm duyệt dữ liệu"
          eyebrowNote="Hàng đợi xử lý thời gian thực"
          title="Quản lý Niêm yết Địa điểm"
          description="Kiểm soát, thẩm định quy chuẩn du lịch thông minh và xác thực thông tin đối tác trước khi công bố lên ứng dụng."
          actions={
            <>
              <button
                type="button"
                onClick={() => setPolicyOpen(true)}
                className={TOOL_BUTTON_CLASS}
              >
                <Icon name="policy" className="text-[19px] text-on-surface-variant" />
                <span>Quy chế kiểm duyệt</span>
              </button>
              <button type="button" onClick={handleExport} className={TOOL_BUTTON_CLASS}>
                <Icon name="file_download" className="text-[19px] text-on-surface-variant" />
                <span>Xuất danh sách</span>
              </button>
              <button
                type="button"
                onClick={handleBulkApproveClick}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-md shadow-primary/20 transition-all hover:bg-primary-container"
              >
                <Icon name="verified" className="text-[19px]" />
                <span>Duyệt nhanh danh sách</span>
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
            Đang lọc theo đối tác:
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 font-label-md text-label-md text-on-secondary-container">
            <Icon name="business_center" className="text-[16px]" />
            {partnerName}
            <button
              type="button"
              onClick={() => updateParams({ partner: null })}
              className="ml-1 flex items-center rounded-full hover:text-error"
              title="Bỏ lọc đối tác"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </span>
        </div>
      )}

      <ListingTable
        listings={pageListings}
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
            itemLabel="hồ sơ"
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
          title="Duyệt nhanh danh sách"
          confirmLabel={`Duyệt ${bulkConfirmIds.length} hồ sơ`}
          confirmIcon="verified"
          onConfirm={confirmBulkApprove}
          onClose={() => setBulkConfirmIds(null)}
        >
          Bạn sắp phê duyệt{' '}
          <strong className="text-on-surface">{bulkConfirmIds.length} hồ sơ đang chờ</strong> và
          công bố lên ứng dụng. Hãy chắc chắn các hồ sơ đã đáp ứng quy chế kiểm duyệt.
          {selectedCount > bulkConfirmIds.length && (
            <span className="mt-2 block font-body-sm text-body-sm text-outline">
              {selectedCount - bulkConfirmIds.length} hồ sơ đã chọn không ở trạng thái chờ duyệt sẽ
              được bỏ qua.
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
