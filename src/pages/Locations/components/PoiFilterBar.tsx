import Icon from '../../../components/common/Icon';
import {
  POI_PROVINCE_OPTIONS,
  POI_SOURCE_OPTIONS,
  POI_STATUS_OPTIONS,
} from '../../../constants/poi';
import type { PoiFilters, SelectOption } from '../../../types/admin';

interface PoiFilterBarProps {
  filters: PoiFilters;
  onChange: (changes: Partial<PoiFilters>) => void;
  onApply: () => void;
  onReset: () => void;
}

interface RoundSelectProps<T extends string> {
  value: T | 'all';
  allLabel: string;
  options: SelectOption<T>[];
  ariaLabel: string;
  onChange: (value: T | 'all') => void;
}

function RoundSelect<T extends string>({
  value,
  allLabel,
  options,
  ariaLabel,
  onChange,
}: RoundSelectProps<T>) {
  return (
    <div className="relative lg:col-span-2">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option.value === event.target.value);
          onChange(next ? next.value : 'all');
        }}
        className="w-full cursor-pointer appearance-none rounded-full bg-surface-container-low px-space-md py-2.5 font-body-sm text-body-sm text-on-surface outline-none focus:shadow-sm"
      >
        <option value="all">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        className="pointer-events-none absolute top-2.5 right-3 text-[18px] text-outline"
      />
    </div>
  );
}

/** Bộ lọc nâng cao — thay đổi chỉ áp dụng khi bấm "Lọc" hoặc Enter trong ô tìm kiếm */
export default function PoiFilterBar({ filters, onChange, onApply, onReset }: PoiFilterBarProps) {
  return (
    <div className="space-y-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="grid grid-cols-1 items-center gap-space-sm md:grid-cols-2 lg:grid-cols-12">
        <div className="flex items-center rounded-full bg-surface-container-low px-space-md py-2.5 transition-all focus-within:bg-surface-container-lowest focus-within:shadow-sm lg:col-span-4">
          <Icon name="search" className="mr-2 text-[20px] text-outline" />
          <input
            type="text"
            value={filters.search}
            placeholder="Tìm theo tên POI, mã địa điểm, địa chỉ, từ khóa..."
            onChange={(event) => onChange({ search: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onApply();
            }}
            className="w-full border-none bg-transparent font-body-sm text-body-sm text-on-surface outline-none placeholder:text-outline"
          />
        </div>

        <RoundSelect
          ariaLabel="Tỉnh thành"
          value={filters.province}
          allLabel="Toàn quốc (63 tỉnh thành)"
          options={POI_PROVINCE_OPTIONS}
          onChange={(province) => onChange({ province })}
        />
        <RoundSelect
          ariaLabel="Trạng thái"
          value={filters.status}
          allLabel="Tất cả trạng thái"
          options={POI_STATUS_OPTIONS}
          onChange={(status) => onChange({ status })}
        />
        <RoundSelect
          ariaLabel="Nguồn dữ liệu"
          value={filters.source}
          allLabel="Nguồn dữ liệu"
          options={POI_SOURCE_OPTIONS}
          onChange={(source) => onChange({ source })}
        />

        <div className="flex items-center justify-end gap-2 lg:col-span-2">
          <button
            type="button"
            onClick={onApply}
            className="flex w-full items-center justify-center gap-1 rounded-full bg-surface-container px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high lg:w-auto"
          >
            <Icon name="tune" className="text-[18px]" />
            <span>Lọc</span>
          </button>
          <button
            type="button"
            title="Xóa bộ lọc"
            onClick={onReset}
            className="rounded-full p-2.5 text-outline transition-all hover:bg-error-container/20 hover:text-error"
          >
            <Icon name="filter_alt_off" className="text-[20px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
