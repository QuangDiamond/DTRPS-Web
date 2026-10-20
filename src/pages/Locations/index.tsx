import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import {
  DEFAULT_POI_FILTERS,
  POI_CATEGORY_CONFIG,
  POI_PAGE_SIZE_OPTIONS,
  POI_PROVINCE_LABELS,
  POI_SOURCE_CONFIG,
  POI_STATUS_CONFIG,
} from '../../constants/poi';
import { poiEditPath, ROUTES } from '../../constants/routes';
import { usePois } from '../../hooks/usePois';
import { useToast } from '../../hooks/useToast';
import type { Poi, PoiCategoryTab, PoiFilters } from '../../types/admin';
import { downloadCsv } from '../../utils/exportCsv';
import { formatNumber, todayIsoDate } from '../../utils/format';
import { priceSummary, shortPoiName } from '../../utils/poi';
import PoiMobilePreviewModal from '../PoiEditor/components/PoiMobilePreviewModal';
import LocationsHeader from './components/LocationsHeader';
import PoiCategoryTabs from './components/PoiCategoryTabs';
import PoiFilterBar from './components/PoiFilterBar';
import PoiStatsCards from './components/PoiStatsCards';
import PoiTable from './components/PoiTable';
import PoiTablePagination from './components/PoiTablePagination';
import { filterPois, hasActiveFilters } from './locationsUtils';

const SYNC_DURATION_MS = 1500;

/** Màn Kho dữ liệu điểm đến (POI Master Data): /admin/locations */
export default function LocationsPage() {
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
  const [syncing, setSyncing] = useState(false);

  const filtered = useMemo(() => filterPois(pois, tab, filters), [pois, tab, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagePois = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isFiltered = hasActiveFilters(tab, filters);

  // Mô phỏng đồng bộ với AI Engine — khi có backend thay bằng gọi API
  useEffect(() => {
    if (!syncing) return;
    const timer = window.setTimeout(() => {
      setSyncing(false);
      showToast(`Đã đồng bộ ${formatNumber(stats.total)} POI với AI Travel Engine v2.4`);
    }, SYNC_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [syncing, stats.total, showToast]);

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
    showToast('Đã xóa bộ lọc', 'info');
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      showToast('Không có POI nào để xuất', 'info');
      return;
    }
    downloadCsv(
      `danh-muc-poi-${todayIsoDate()}.csv`,
      [
        'Mã POI',
        'Tên POI',
        'Danh mục',
        'Tỉnh/Thành',
        'Địa chỉ',
        'Mức giá dự kiến',
        'Giờ mở cửa',
        'Nguồn dữ liệu',
        'Đánh giá',
        'Lượt đánh giá',
        'Priority Score',
        'Trạng thái',
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
        poi.priorityScore,
        POI_STATUS_CONFIG[poi.status].label,
      ]),
    );
    showToast(`Đã xuất ${filtered.length} POI ra file Excel (CSV)`);
  };

  const openEditor = (poi: Poi) => navigate(poiEditPath(poi.id));

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-space-lg">
      <LocationsHeader
        syncing={syncing}
        onSync={() => setSyncing(true)}
        onExport={handleExport}
        onAdd={() => navigate(ROUTES.LOCATION_NEW)}
      />

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
        onResetFilters={resetFilters}
        footer={
          <PoiTablePagination
            page={currentPage}
            pageSize={pageSize}
            totalItems={filtered.length}
            itemLabel={isFiltered ? 'điểm đến phù hợp' : 'điểm đến toàn quốc'}
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
          description={`${viewingPoi.id} • Hiển thị trên App Mobile`}
          onClose={() => setViewingPoi(null)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setViewingPoi(null)}
                className="rounded-full bg-surface-container-low px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => openEditor(viewingPoi)}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container"
              >
                <Icon name="edit" className="text-[18px]" /> Chỉnh sửa POI
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
