import Icon from '../../../components/common/Icon';
import {
  REJECTED_PROVINCE_OPTIONS,
  REJECTION_REASON_FILTER_OPTIONS,
  RESUBMISSION_FILTER_OPTIONS,
} from '../../../constants/listing';
import type { RejectedListingFilters, SelectOption } from '../../../types/admin';

interface RejectedFilterBarProps {
  filters: RejectedListingFilters;
  onChange: (changes: Partial<RejectedListingFilters>) => void;
  onReset: () => void;
}

interface FilterSelectProps<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  widthClass: string;
}

function FilterSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  widthClass,
}: FilterSelectProps<T>) {
  return (
    <div className={`relative flex-1 sm:flex-none ${widthClass}`}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option.value === event.target.value);
          if (next) onChange(next.value);
        }}
        className="h-11 w-full cursor-pointer appearance-none rounded-xl bg-surface-container-low pr-8 pl-3 font-label-md text-label-md text-on-surface shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-on-surface-variant"
      />
    </div>
  );
}

export default function RejectedFilterBar({ filters, onChange, onReset }: RejectedFilterBarProps) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-[0_4px_20px_-2px_rgba(15,118,110,0.04)]">
      <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-primary"
          />
          <input
            type="text"
            value={filters.keyword}
            onChange={(event) => onChange({ keyword: event.target.value })}
            placeholder="Tìm theo tên cơ sở, mã POI-xxxxx, tên đối tác PTN..."
            className="h-11 w-full rounded-xl bg-surface-container-low pr-4 pl-11 font-body-md text-body-md text-on-surface shadow-sm transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
          <FilterSelect
            ariaLabel="Lý do từ chối"
            widthClass="min-w-[200px]"
            value={filters.reasonCode}
            options={REJECTION_REASON_FILTER_OPTIONS}
            onChange={(reasonCode) => onChange({ reasonCode })}
          />
          <FilterSelect
            ariaLabel="Trạng thái gửi lại"
            widthClass="min-w-[180px]"
            value={filters.resubmission}
            options={RESUBMISSION_FILTER_OPTIONS}
            onChange={(resubmission) => onChange({ resubmission })}
          />
          <FilterSelect
            ariaLabel="Tỉnh/Thành phố"
            widthClass="min-w-[150px]"
            value={filters.province}
            options={REJECTED_PROVINCE_OPTIONS}
            onChange={(province) => onChange({ province })}
          />
          <button
            type="button"
            onClick={onReset}
            title="Đặt lại bộ lọc"
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-surface-container px-3.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="restart_alt" className="text-[18px]" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>
        </div>
      </div>
    </div>
  );
}
