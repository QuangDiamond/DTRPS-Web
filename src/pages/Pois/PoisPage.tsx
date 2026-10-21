import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common';
import {
  DEFAULT_POI_FILTERS,
  POI_CATEGORY_CONFIG,
  POI_PAGE_SIZE_OPTIONS,
  POI_PROVINCE_LABELS,
  POI_SOURCE_CONFIG,
  POI_STATUS_CONFIG,
} from '@/constants/poi';
import { poiEditPath, ROUTES } from '@/constants/routes';
import { usePois, useTableSort, useToast } from '@/hooks';
import PoiMobilePreviewModal from '@/pages/PoiEditor/components/PoiMobilePreviewModal';
import type { Poi, PoiCategoryTab, PoiFilters } from '@/types';
import { downloadCsv } from '@/utils/exportCsv';
import { todayIsoDate } from '@/utils/format';
import { localizePoiText, priceSummary, shortPoiName } from '@/utils/poi';
import { sortItems } from '@/utils/sort';
import PoiCategoryTabs from './components/PoiCategoryTabs';
import PoiFilterBar from './components/PoiFilterBar';
import PoiListHeader from './components/PoiListHeader';
import PoiStatsCards from './components/PoiStatsCards';
import PoiTable from './components/PoiTable';
import PoiTablePagination from './components/PoiTablePagination';
import { filterPois, hasActiveFilters, POI_SORT_ACCESSORS, type PoiSortKey } from './poiListUtils';

/** Màn Kho dữ liệu điểm đến (POI Master Data): /admin/locations */
export default function PoisPage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { pois, stats } = usePois();

  const [tab, setTab] = useState<PoiCategoryTab>('all');
  // Bộ lọc đang soạn (draft) và bộ lọc đã áp dụng cho bảng
  const [draftFilters, setDraftFilters] = useState<PoiFilters>(DEFAULT_POI_FILTERS);
  const [filters, setFilters] = useState<PoiFilters>(DEFAULT_POI_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(POI_PAGE_SIZE_OPTIONS[0]);
  const [viewingPoi, setViewingPoi] = useState<Poi | null>(null);

  const { sort, toggleSort } = useTableSort<PoiSortKey>();
  const filtered = useMemo(
    () => sortItems(filterPois(pois, tab, filters), sort, POI_SORT_ACCESSORS),
    [pois, tab, filters, sort],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagePois = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isFiltered = hasActiveFilters(tab, filters);
  const changeTab = (next: PoiCategoryTab) => {
    setTab(next);
    setPage(1);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_POI_FILTERS);
    setFilters(DEFAULT_POI_FILTERS);
    setTab('all');
    setPage(1);
    showToast(t('pois.page.filtersCleared'), 'info');
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      showToast(t('pois.page.thereNoPoisExport'), 'info');
      return;
    }
    downloadCsv(
      `danh-muc-poi-${todayIsoDate()}.csv`,
      [
        t('pois.page.poiCode'),
        t('pois.page.poiName'),
        t('pois.page.category'),
        t('pois.page.provinceCity'),
        t('pois.page.address'),
        t('pois.page.estimatedPrice'),
        t('pois.page.openingHours'),
        t('pois.page.dataSource'),
        t('pois.page.reviews'),
        t('pois.page.reviews2'),
        t('pois.page.vectorIndexed'),
        t('pois.page.status'),
      ],
      filtered.map((poi) => [
        poi.id,
        poi.name,
        localizePoiText(poi, 'subCategory', POI_CATEGORY_CONFIG[poi.category].label),
        POI_PROVINCE_LABELS[poi.province],
        poi.address,
        priceSummary(poi.price),
        poi.openingHours,
        poi.sourceLabel ?? POI_SOURCE_CONFIG[poi.source].label,
        poi.reviewCount > 0 ? poi.rating : '',
        poi.reviewCount,
        poi.vectorEmbedded ? t('pois.vector.indexed') : t('pois.vector.notIndexed'),
        POI_STATUS_CONFIG[poi.status].label,
      ]),
    );
    showToast(t('pois.page.exportedPoisExcelFile', { count: filtered.length }));
  };

  const openEditor = (poi: Poi) => navigate(poiEditPath(poi.id));

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg">
      <PoiListHeader onExport={handleExport} onAdd={() => navigate(ROUTES.POI_NEW)} />

      <PoiStatsCards stats={stats} />

      <PoiCategoryTabs active={tab} counts={stats.byTab} onChange={changeTab} />

      <PoiFilterBar
        filters={draftFilters}
        onChange={(changes) => setDraftFilters((current) => ({ ...current, ...changes }))}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <PoiTable
        pois={pagePois}
        onEdit={openEditor}
        onView={setViewingPoi}
        sort={sort}
        onSort={(key) => {
          toggleSort(key);
          setPage(1);
        }}
        onResetFilters={resetFilters}
        footer={
          <PoiTablePagination
            page={currentPage}
            pageSize={pageSize}
            totalItems={filtered.length}
            itemLabel={
              isFiltered
                ? t('pois.page.matchingDestinations')
                : t('pois.page.destinationsNationwide')
            }
            pageSizeOptions={POI_PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        }
      />

      {viewingPoi && (
        <PoiMobilePreviewModal
          values={viewingPoi}
          title={shortPoiName(viewingPoi.name)}
          description={t('pois.page.shownMobileApp', { id: viewingPoi.id })}
          onClose={() => setViewingPoi(null)}
          footer={
            <>
              <Button variant="neutral" onClick={() => setViewingPoi(null)}>
                {t('common.close')}
              </Button>
              <Button icon="edit" onClick={() => openEditor(viewingPoi)}>
                {t('pois.page.editPoi')}
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}
