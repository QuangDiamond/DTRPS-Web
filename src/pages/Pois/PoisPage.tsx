import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiSemanticSearchBar, Button } from '@/components/common';
import {
  DEFAULT_POI_FILTERS,
  POI_CATEGORY_CONFIG,
  POI_PAGE_SIZE_OPTIONS,
  POI_PROVINCE_LABELS,
  POI_SOURCE_CONFIG,
  POI_STATUS_CONFIG,
} from '@/constants/poi';
import { poiEditPath, ROUTES } from '@/constants/routes';
import { usePois, useSemanticSearch, useTableSort, useToast } from '@/hooks';
import PoiMobilePreviewModal from '@/pages/PoiEditor/components/PoiMobilePreviewModal';
import type { Poi, PoiCategoryTab, PoiFilters } from '@/types';
import { downloadCsv } from '@/utils/exportCsv';
import { todayIsoDate } from '@/utils/format';
import { priceSummary, shortPoiName } from '@/utils/poi';
import { sortItems } from '@/utils/sort';
import PoiCategoryTabs from './components/PoiCategoryTabs';
import PoiFilterBar from './components/PoiFilterBar';
import PoiListHeader from './components/PoiListHeader';
import PoiStatsCards from './components/PoiStatsCards';
import PoiTable from './components/PoiTable';
import PoiTablePagination from './components/PoiTablePagination';
import { filterPois, hasActiveFilters, POI_SORT_ACCESSORS, type PoiSortKey } from './poiListUtils';

const SYNC_DURATION_MS = 1500;

/** Màn Kho dữ liệu điểm đến (POI Master Data): /admin/locations */
export default function PoisPage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { pois, stats, reindexPois } = usePois();

  const [tab, setTab] = useState<PoiCategoryTab>('all');
  // Bộ lọc đang soạn (draft) và bộ lọc đã áp dụng cho bảng
  const [draftFilters, setDraftFilters] = useState<PoiFilters>(DEFAULT_POI_FILTERS);
  const [filters, setFilters] = useState<PoiFilters>(DEFAULT_POI_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(POI_PAGE_SIZE_OPTIONS[0]);
  const [viewingPoi, setViewingPoi] = useState<Poi | null>(null);
  const [syncing, setSyncing] = useState(false);

  const { sort, toggleSort } = useTableSort<PoiSortKey>();
  // Tìm kiếm ngữ nghĩa AI: tài liệu gồm tên, danh mục, tag, mô tả, địa chỉ, đối tượng phù hợp
  const buildCorpus = useCallback(
    () =>
      pois.map((poi) => ({
        id: poi.id,
        title: poi.name,
        text: [
          poi.name,
          poi.subCategory,
          POI_CATEGORY_CONFIG[poi.category].label,
          poi.tags,
          poi.highlight,
          poi.description,
          poi.address,
          poi.personas.join(' '),
          poi.price,
        ]
          .filter(Boolean)
          .join(' '),
        indexed: poi.vectorEmbedded,
      })),
    [pois],
  );
  const semantic = useSemanticSearch('pois', buildCorpus);
  const filtered = useMemo(() => {
    const base = filterPois(pois, tab, filters);
    if (!semantic.scores) return sortItems(base, sort, POI_SORT_ACCESSORS);
    const scores = semantic.scores;
    const matched = base.filter((poi) => scores.has(poi.id));
    // Kết quả AI xếp theo độ tương đồng, trừ khi admin bấm sắp xếp theo cột
    return sort
      ? sortItems(matched, sort, POI_SORT_ACCESSORS)
      : matched.sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
  }, [pois, tab, filters, sort, semantic.scores]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagePois = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isFiltered = hasActiveFilters(tab, filters);
  // Index vector (pgvector) cho các POI chưa index — mô phỏng thời gian xử lý của server
  useEffect(() => {
    if (!syncing) return;
    const timer = window.setTimeout(() => {
      setSyncing(false);
      const indexed = reindexPois();
      showToast(
        indexed > 0
          ? t('pois.page.indexedPois', { count: indexed })
          : t('pois.page.allPoisIndexed'),
      );
    }, SYNC_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [syncing, reindexPois, showToast, t]);

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
        poi.subCategory || POI_CATEGORY_CONFIG[poi.category].label,
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
      <PoiListHeader
        syncing={syncing}
        onSync={() => setSyncing(true)}
        onExport={handleExport}
        onAdd={() => navigate(ROUTES.POI_NEW)}
      />

      <PoiStatsCards stats={stats} />

      <PoiCategoryTabs active={tab} counts={stats.byTab} onChange={changeTab} />

      <PoiFilterBar
        filters={draftFilters}
        onChange={(changes) => setDraftFilters((current) => ({ ...current, ...changes }))}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <AiSemanticSearchBar
        state={semantic}
        placeholder={t('search.semantic.poiPlaceholder')}
        resultCount={filtered.length}
      />

      <PoiTable
        pois={pagePois}
        matchScores={semantic.scores}
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
