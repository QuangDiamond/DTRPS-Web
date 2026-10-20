import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterSelect from '../../components/common/FilterSelect';
import Icon from '../../components/common/Icon';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { ADMIN_ROOT_CRUMB } from '../../constants/navigation';
import { POI_CATEGORY_CONFIG, POI_CATEGORY_OPTIONS, POI_STATUS_CONFIG } from '../../constants/poi';
import { poiEditPath, ROUTES } from '../../constants/routes';
import { usePois } from '../../hooks/usePois';
import { useToast } from '../../hooks/useToast';
import type { Poi, PoiCategory, PoiStatus, SelectOption } from '../../types/admin';
import { formatDayTime, formatNumber } from '../../utils/format';
import { normalizeText } from '../../utils/string';
import { shortPoiName } from '../PoiEditor/poiFormUtils';

type CategoryFilter = PoiCategory | 'all';
type StatusFilter = PoiStatus | 'all';

const CATEGORY_FILTER_OPTIONS: SelectOption<CategoryFilter>[] = [
  { value: 'all', label: 'Tất cả danh mục' },
  ...POI_CATEGORY_OPTIONS,
];

const STATUS_FILTER_OPTIONS: SelectOption<StatusFilter>[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang công khai' },
  { value: 'hidden', label: 'Đang ẩn' },
];

/**
 * Danh sách điểm đến POI: /admin/locations
 * TODO: bản dựng tạm để nối luồng Thêm / Sửa POI — thay bằng thiết kế Stitch khi có HTML màn danh sách.
 */
export default function LocationsPage() {
  const navigate = useNavigate();
  const { pois, setPoiStatus } = usePois();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    const keyword = normalizeText(search.trim());
    return pois.filter(
      (poi) =>
        (category === 'all' || poi.category === category) &&
        (status === 'all' || poi.status === status) &&
        (!keyword ||
          normalizeText(`${poi.id} ${poi.name} ${poi.address} ${poi.tags}`).includes(keyword)),
    );
  }, [pois, search, category, status]);

  const activeCount = pois.filter((poi) => poi.status === 'active').length;
  const mustVisitCount = pois.filter((poi) => poi.priorityScore >= 90).length;

  const toggleStatus = (poi: Poi) => {
    const next: PoiStatus = poi.status === 'active' ? 'hidden' : 'active';
    setPoiStatus(poi.id, next);
    showToast(
      next === 'active'
        ? `Đã công khai "${shortPoiName(poi.name)}" trên ứng dụng`
        : `Đã ẩn "${shortPoiName(poi.name)}" khỏi ứng dụng`,
      next === 'active' ? 'success' : 'info',
    );
  };

  return (
    <div className="flex flex-col gap-space-lg">
      <PageHeader
        breadcrumbs={[ADMIN_ROOT_CRUMB, { label: 'Quản lý điểm đến POI', icon: 'pin_drop' }]}
        title="Quản lý điểm đến POI"
        description="Dữ liệu điểm tham quan dùng cho App Mobile và thuật toán gợi ý lộ trình AI Planner."
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOCATION_NEW)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-md transition-all hover:bg-surface-tint"
          >
            <Icon name="add_location_alt" className="text-[18px]" /> Thêm POI mới
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
        <StatCard
          label="Tổng số POI"
          value={formatNumber(pois.length)}
          icon="pin_drop"
          iconClassName="bg-secondary-container text-on-secondary-container"
          footer={
            <span className="mt-3 font-body-sm text-body-sm text-outline">Trên toàn hệ thống</span>
          }
        />
        <StatCard
          label="Đang công khai"
          value={formatNumber(activeCount)}
          icon="visibility"
          iconClassName="bg-primary-fixed text-on-primary-fixed-variant"
          footer={
            <span className="mt-3 font-body-sm text-body-sm text-outline">
              {formatNumber(pois.length - activeCount)} POI đang ẩn
            </span>
          }
        />
        <StatCard
          label="Must-visit (≥ 90 điểm)"
          value={formatNumber(mustVisitCount)}
          icon="psychology"
          iconClassName="bg-tertiary-fixed text-tertiary"
          footer={
            <span className="mt-3 font-body-sm text-body-sm text-outline">
              Ưu tiên cao trong AI Planner
            </span>
          }
        />
      </div>

      <div className="flex flex-col gap-space-md rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="grid grid-cols-1 items-end gap-space-md md:grid-cols-[1fr_240px_200px]">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
              <Icon name="search" className="text-[16px] text-primary" /> Tìm kiếm
            </label>
            <input
              type="text"
              value={search}
              placeholder="Tên, mã POI, địa chỉ hoặc tag..."
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <FilterSelect
            label="Danh mục"
            icon="category"
            value={category}
            options={CATEGORY_FILTER_OPTIONS}
            onChange={setCategory}
          />
          <FilterSelect
            label="Trạng thái"
            icon="toggle_on"
            value={status}
            options={STATUS_FILTER_OPTIONS}
            onChange={setStatus}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="border-b border-surface-container font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                <th className="px-3 py-3 font-semibold">Điểm đến</th>
                <th className="px-3 py-3 font-semibold">Danh mục</th>
                <th className="px-3 py-3 font-semibold">Địa chỉ</th>
                <th className="px-3 py-3 font-semibold">Priority</th>
                <th className="px-3 py-3 font-semibold">Trạng thái</th>
                <th className="px-3 py-3 font-semibold">Cập nhật</th>
                <th className="px-3 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((poi) => {
                const categoryConfig = POI_CATEGORY_CONFIG[poi.category];
                const statusConfig = POI_STATUS_CONFIG[poi.status];
                return (
                  <tr
                    key={poi.id}
                    onClick={() => navigate(poiEditPath(poi.id))}
                    className="cursor-pointer border-b border-surface-container/60 transition-colors hover:bg-surface-container-low/60"
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        {poi.cover ? (
                          <img
                            src={poi.cover.url}
                            alt={poi.name}
                            loading="lazy"
                            className="h-12 w-16 shrink-0 rounded-lg object-cover shadow-sm"
                          />
                        ) : (
                          <div
                            className={`flex h-12 w-16 shrink-0 items-center justify-center rounded-lg ${categoryConfig.badgeClass}`}
                          >
                            <Icon name={categoryConfig.icon} className="text-[22px]" />
                          </div>
                        )}
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-body-md text-body-md font-semibold text-on-surface">
                            {shortPoiName(poi.name)}
                          </span>
                          <span className="font-label-sm text-label-sm text-outline">{poi.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold ${categoryConfig.badgeClass}`}
                      >
                        <Icon name={categoryConfig.icon} className="text-[14px]" />
                        {categoryConfig.label}
                      </span>
                    </td>
                    <td className="max-w-[240px] px-3 py-3 font-body-sm text-body-sm text-on-surface-variant">
                      <span className="line-clamp-2">{poi.address}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex w-24 flex-col gap-1">
                        <span className="font-label-md text-label-md font-bold text-primary">
                          {poi.priorityScore}/100
                        </span>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${poi.priorityScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold ${statusConfig.badgeClass}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
                        {poi.status === 'active' ? 'Công khai' : 'Đang ẩn'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-body-sm text-body-sm text-on-surface-variant">
                      <div className="flex flex-col">
                        <span>{formatDayTime(poi.updatedAt)}</span>
                        <span className="font-label-sm text-label-sm text-outline">
                          {poi.updatedBy}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title={
                            poi.status === 'active' ? 'Ẩn khỏi ứng dụng' : 'Công khai trên ứng dụng'
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleStatus(poi);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                        >
                          <Icon
                            name={poi.status === 'active' ? 'visibility_off' : 'visibility'}
                            className="text-[18px]"
                          />
                        </button>
                        <button
                          type="button"
                          title="Chỉnh sửa POI"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(poiEditPath(poi.id));
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-secondary-container/40"
                        >
                          <Icon name="edit_location" className="text-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center font-body-md text-body-md text-outline"
                  >
                    <Icon name="wrong_location" className="mb-2 block text-[40px]" />
                    Không tìm thấy điểm đến phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
