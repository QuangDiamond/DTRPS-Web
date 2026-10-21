import { Trans, useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ConfirmModal, Icon, Pagination } from '@/components/common';
import { DEFAULT_REJECTED_FILTERS, LISTING_PAGE_SIZE_OPTIONS } from '@/constants/listing';
import { PROVINCE_NAMES } from '@/constants/partner';
import { listingReviewPath, ROUTES } from '@/constants/routes';
import { useListings, useToast } from '@/hooks';
import ReviewPolicyModal from '@/pages/Listings/components/ReviewPolicyModal';
import type { Listing, RejectedListingFilters } from '@/types';
import { downloadCsv } from '@/utils/exportCsv';
import { formatDateWithPeriod, todayIsoDate } from '@/utils/format';
import RejectedFilterBar from './components/RejectedFilterBar';
import RejectedStatsCards from './components/RejectedStatsCards';
import RejectedTable from './components/RejectedTable';
import RejectionDetailModal from './components/RejectionDetailModal';
import {
  filterRejectedListings,
  getRejectionReason,
  getResubmissionLabel,
  getResubmissionStatus,
} from './rejectedUtils';

/** Màn Địa điểm bị từ chối: /admin/listings/rejected */
export default function RejectedListingsPage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { listings, stats, reopenListing, lockListings } = useListings();

  const [filters, setFilters] = useState<RejectedListingFilters>(DEFAULT_REJECTED_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(LISTING_PAGE_SIZE_OPTIONS[0]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [lockTargets, setLockTargets] = useState<Listing[] | null>(null);
  const [policyOpen, setPolicyOpen] = useState(false);

  const filtered = useMemo(() => filterRejectedListings(listings, filters), [listings, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageListings = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const detailListing = listings.find((listing) => listing.id === detailId) ?? null;
  const selectedListings = listings.filter((listing) => selectedIds.has(listing.id));

  // ===== Bộ lọc & chọn =====
  const changeFilters = (changes: Partial<RejectedListingFilters>) => {
    setFilters((current) => ({ ...current, ...changes }));
    setPage(1);
  };

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

  // ===== Xem xét lại / nhắc nhở / khóa =====
  const handleReReview = (listing: Listing) => {
    if (reopenListing(listing.id)) {
      showToast(t('rejectedListings.page.movedBackReReview', { name: listing.name }), 'info');
      navigate(listingReviewPath(listing.id));
    }
  };

  /** Chỉ hồ sơ chưa gửi lại (trong hạn / quá hạn) mới cần nhắc & mới khóa được */
  const isActionable = (listing: Listing) => {
    const status = getResubmissionStatus(listing);
    return status === 'waiting' || status === 'overdue';
  };

  const remind = (targets: Listing[]) => {
    const actionable = targets.filter(isActionable);
    if (actionable.length === 0) {
      showToast(t('rejectedListings.page.noSubmissionsNeedUpdate'), 'info');
      return;
    }
    showToast(
      actionable.length === 1
        ? t('rejectedListings.page.updateReminderEmailSent', {
            partnerName: actionable[0].partnerName,
          })
        : t('rejectedListings.page.updateRemindersSentPartners', { count: actionable.length }),
    );
  };

  const openLock = (targets: Listing[]) => {
    const actionable = targets.filter(isActionable);
    if (actionable.length === 0) {
      showToast(t('rejectedListings.page.onlySubmissionsThatHave'), 'info');
      return;
    }
    setLockTargets(actionable);
  };

  const confirmLock = () => {
    if (!lockTargets) return;
    const count = lockListings(lockTargets.map((listing) => listing.id));
    showToast(t('rejectedListings.page.permanentlyClosedSubmissions', { count }), 'error');
    setLockTargets(null);
    setDetailId(null);
    setSelectedIds(new Set());
  };

  const handleExport = () => {
    downloadCsv(
      `bao-cao-vi-pham-${todayIsoDate()}.csv`,
      [
        t('rejectedListings.page.poiCode'),
        t('rejectedListings.page.place'),
        t('rejectedListings.page.partner'),
        t('rejectedListings.page.partnerCode'),
        t('rejectedListings.page.provinceCity'),
        t('rejectedListings.page.reasonGroup'),
        t('rejectedListings.page.rejectionReason'),
        t('rejectedListings.page.feedbackPartner'),
        t('rejectedListings.page.rejected'),
        t('rejectedListings.page.resubmissionStatus'),
      ],
      filtered.map((listing) => [
        listing.id,
        listing.name,
        listing.partnerName,
        listing.partnerId ?? '',
        PROVINCE_NAMES[listing.province],
        getRejectionReason(listing).shortLabel,
        listing.rejectReason ?? '',
        listing.partnerFeedback ?? '',
        formatDateWithPeriod(listing.reviewedAt).date,
        getResubmissionLabel(listing),
      ]),
    );
    showToast(
      t('rejectedListings.page.exportedViolationReportSubmissions', { count: filtered.length }),
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Breadcrumb & tiêu đề */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1.5">
          <nav className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <Link to={ROUTES.DASHBOARD} className="hover:text-primary">
              {t('rejectedListings.page.systemAdministration')}
            </Link>
            <Icon name="chevron_right" className="text-[14px] text-outline" />
            <Link to={ROUTES.LISTINGS} className="hover:text-primary">
              {t('rejectedListings.page.listingManagement')}
            </Link>
            <Icon name="chevron_right" className="text-[14px] text-outline" />
            <span className="font-semibold text-primary">
              {t('rejectedListings.page.rejectedPlaces')}
            </span>
          </nav>
          <div>
            <h1 className="flex items-center gap-3 font-headline-lg text-headline-lg tracking-tight text-on-surface">
              <Trans
                i18nKey="rejectedListings.page.rejectedPlacesFailedReview"
                components={{
                  c0: (
                    <span className="rounded-full bg-error-container px-2.5 py-0.5 font-label-sm text-label-sm font-bold tracking-wider text-on-error-container uppercase" />
                  ),
                }}
              />
            </h1>
            <p className="mt-1 max-w-3xl font-body-md text-body-md text-on-surface-variant">
              {t('rejectedListings.page.trackManageListingSubmissions')}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setPolicyOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-surface-container-low px-4 font-label-md text-label-md text-on-surface shadow-sm transition-colors hover:bg-surface-container-high"
          >
            <Icon name="rule" className="text-[18px] text-primary" />
            <span>{t('rejectedListings.page.reviewStandards')}</span>
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 font-label-md text-label-md text-on-primary shadow-md transition-colors hover:bg-primary-container"
          >
            <Icon name="file_download" className="text-[18px]" />
            <span>{t('rejectedListings.page.exportViolationReport')}</span>
          </button>
        </div>
      </div>

      <RejectedStatsCards stats={stats} />

      <RejectedFilterBar
        filters={filters}
        onChange={changeFilters}
        onReset={() => {
          setFilters(DEFAULT_REJECTED_FILTERS);
          setPage(1);
        }}
      />

      <RejectedTable
        listings={pageListings}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkRemind={() => remind(selectedListings)}
        onBulkLock={() => openLock(selectedListings)}
        onReReview={handleReReview}
        onShowReason={(listing) => setDetailId(listing.id)}
        footer={
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            totalItems={filtered.length}
            itemLabel={t('rejectedListings.page.rejectedSubmissions')}
            pageSizeOptions={LISTING_PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        }
      />

      {/* Ghi chú quy trình */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl bg-surface-container-low p-4 text-on-surface-variant sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
            <Icon name="info" className="text-[18px]" />
          </div>
          <p className="font-body-sm text-body-sm">
            <Trans
              i18nKey="rejectedListings.page.aiPolicyWhenPartner"
              components={{ c0: <strong className="text-on-surface" /> }}
            />
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPolicyOpen(true)}
          className="shrink-0 font-label-sm text-label-sm font-semibold text-primary hover:underline"
        >
          {t('rejectedListings.page.viewReviewSla')}
        </button>
      </div>

      {detailListing && (
        <RejectionDetailModal
          listing={detailListing}
          onClose={() => setDetailId(null)}
          onReReview={handleReReview}
          onRemind={(listing) => remind([listing])}
          onLock={(listing) => openLock([listing])}
        />
      )}

      {lockTargets && (
        <ConfirmModal
          title={t('rejectedListings.page.permanentlyCloseSubmission')}
          confirmLabel={t('rejectedListings.page.closeSubmissions', { count: lockTargets.length })}
          confirmIcon="lock"
          onConfirm={confirmLock}
          onClose={() => setLockTargets(null)}
        >
          {lockTargets.length === 1 ? (
            <>
              <Trans
                i18nKey="rejectedListings.page.theSubmissionWillPermanently"
                values={{ name: lockTargets[0].name }}
                components={{ c0: <strong className="text-on-surface" /> }}
              />
            </>
          ) : (
            <>
              <Trans
                i18nKey="rejectedListings.page.theSubmissionsSelectedPlaces"
                values={{ length: lockTargets.length }}
                components={{ c0: <strong className="text-on-surface" /> }}
              />
            </>
          )}
        </ConfirmModal>
      )}

      {policyOpen && <ReviewPolicyModal onClose={() => setPolicyOpen(false)} />}
    </div>
  );
}
