import FilterSelect from '../../../components/common/FilterSelect';
import Icon from '../../../components/common/Icon';
import {
  PARTNER_SORT_OPTIONS,
  PARTNER_STATUS_FILTER_OPTIONS,
  PARTNER_TYPE_FILTER_OPTIONS,
  PROVINCE_FILTER_OPTIONS,
} from '../../../constants/partner';
import type { PartnerFilters } from '../../../types/admin';

interface PartnerFilterBarProps {
  filters: PartnerFilters;
  onChange: (changes: Partial<PartnerFilters>) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function PartnerFilterBar({
  filters,
  onChange,
  onApply,
  onReset,
}: PartnerFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      {/* Ô tìm kiếm */}
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-on-surface-variant"
          />
          <input
            type="text"
            value={filters.keyword}
            onChange={(event) => onChange({ keyword: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onApply();
            }}
            placeholder="Tìm theo tên đối tác, tên cơ sở, mã số thuế hoặc email..."
            className="h-11 w-full rounded-xl bg-surface-container-low pr-4 pl-11 font-body-sm text-body-sm text-on-surface shadow-inner transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onApply}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary px-4 font-label-md text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container"
          >
            <Icon name="filter_list" className="text-[18px]" />
            <span>Lọc kết quả</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface"
            title="Xóa bộ lọc"
          >
            <Icon name="restart_alt" className="text-[20px]" />
          </button>
        </div>
      </div>

      {/* Bộ lọc chi tiết */}
      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 xl:grid-cols-4">
        <FilterSelect
          label="Loại hình kinh doanh"
          icon="category"
          value={filters.type}
          options={PARTNER_TYPE_FILTER_OPTIONS}
          onChange={(type) => onChange({ type })}
        />
        <FilterSelect
          label="Trạng thái hồ sơ"
          icon="verified_user"
          value={filters.status}
          options={PARTNER_STATUS_FILTER_OPTIONS}
          onChange={(status) => onChange({ status })}
        />
        <FilterSelect
          label="Khu vực / Tỉnh thành"
          icon="location_on"
          value={filters.province}
          options={PROVINCE_FILTER_OPTIONS}
          onChange={(province) => onChange({ province })}
        />
        <FilterSelect
          label="Sắp xếp hiển thị"
          icon="sort"
          value={filters.sort}
          options={PARTNER_SORT_OPTIONS}
          onChange={(sort) => onChange({ sort })}
        />
      </div>
    </div>
  );
}
