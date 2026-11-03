import { useEffect, useState } from 'react';
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
} from '@/components/common';
import { usePartnerReview } from '@/components/partners/usePartnerReview';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import {
  DEFAULT_PARTNER_FILTERS,
  PAGE_SIZE_OPTIONS,
  PARTNER_STATUS_FILTER_OPTIONS,
} from '@/constants/partner';
import { partnerDetailPath } from '@/constants/routes';
import { usePartners } from '@/hooks';
import { partnerService } from '@/services/partnerService';
import type { PartnerFilters, PartnerPage } from '@/types';
import { getErrorMessage } from '@/utils/error';
import PartnerStatsCards from './components/PartnerStatsCards';
import PartnerTable from './components/PartnerTable';

/** Chờ người dùng gõ xong rồi mới tìm (tránh gọi API theo từng ký tự) */
const SEARCH_DELAY_MS = 350;

/** Quản lý đối tác: /admin/partners — dữ liệu thật từ /api/admin/business-profiles */
export default function PartnersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { stats, version } = usePartners();
  const review = usePartnerReview();

  const [filters, setFilters] = useState<PartnerFilters>(DEFAULT_PARTNER_FILTERS);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [result, setResult] = useState<PartnerPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  // Gõ từ khóa → áp dụng sau một nhịp
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) => (current.keyword === keyword ? current : { ...current, keyword }));
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  // Tải danh sách khi đổi bộ lọc / trang, hoặc sau mỗi thao tác duyệt / khóa (version)
  useEffect(() => {
    let active = true;
    setLoading(true);
    partnerService
      .list({ ...filters, page: page - 1, size: pageSize })
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
  }, [filters, page, pageSize, version, retry]);

  const changeStatus = (status: PartnerFilters['status']) => {
    setFilters((current) => ({ ...current, status }));
    setPage(1);
  };

  const resetFilters = () => {
    setKeyword('');
    setFilters(DEFAULT_PARTNER_FILTERS);
    setPage(1);
  };

  const isFiltered = filters.status !== 'all' || keyword.trim() !== '';

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.partners'), icon: 'business_center' }]}
          eyebrow={t('pages.partners.eyebrow')}
          eyebrowNote={t('pages.partners.eyebrowNote')}
          title={t('pages.partners.title')}
          description={t('pages.partners.description')}
          actions={
            <Button variant="neutral" icon="refresh" onClick={() => setRetry((n) => n + 1)}>
              {t('partnerAdmin.actions.refresh')}
            </Button>
          }
        />
      </div>

      <PartnerStatsCards stats={stats} />

      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-sm md:flex-row md:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
            {t('partnerAdmin.filters.searchLabel')}
          </span>
          <span className="flex h-11 items-center gap-2 rounded-xl bg-surface-container-low px-3 focus-within:ring-2 focus-within:ring-primary">
            <Icon name="search" className="text-[20px] text-outline" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={t('partnerAdmin.filters.search')}
              className="h-full flex-1 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
            />
          </span>
        </label>
        <div className="md:w-64">
          <FilterSelect
            label={t('partnerAdmin.filters.status')}
            icon="fact_check"
            value={filters.status}
            options={PARTNER_STATUS_FILTER_OPTIONS}
            onChange={changeStatus}
          />
        </div>
        {isFiltered && (
          <Button variant="ghost" icon="filter_alt_off" onClick={resetFilters}>
            {t('partnerAdmin.filters.clear')}
          </Button>
        )}
      </div>

      {error && !result ? (
        <ErrorState
          title={t('partnerDetail.page.couldNotLoadPartner')}
          message={error}
          onRetry={() => setRetry((n) => n + 1)}
        />
      ) : !result ? (
        <PageLoader />
      ) : (
        <PartnerTable
          partners={result.items}
          loading={loading}
          onView={(partner) => navigate(partnerDetailPath(partner.id))}
          onApprove={review.approve}
          onReject={review.reject}
          onLock={review.lock}
          onUnlock={review.unlock}
          footer={
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={result.total}
              itemLabel={t('partners.page.partners')}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          }
        />
      )}

      {review.dialogs}
    </div>
  );
}
