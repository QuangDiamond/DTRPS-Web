import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import {
  LISTING_CATEGORY_SELECT_OPTIONS,
  LISTING_PRIORITY_OPTIONS,
  LISTING_PROVINCE_OPTIONS,
  PARTNER_TIER_OPTIONS,
} from '@/constants/listing';
import type { ListingFilters, SelectOption } from '@/types';

interface ListingFilterBarProps {
  filters: ListingFilters;
  onChange: (changes: Partial<ListingFilters>) => void;
}

const SELECT_CLASS =
  'h-11 w-full cursor-pointer rounded-xl px-3.5 transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none';

interface InlineSelectProps<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className: string;
  ariaLabel: string;
}

function InlineSelect<T extends string>({
  value,
  options,
  onChange,
  className,
  ariaLabel,
}: InlineSelectProps<T>) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => {
        const next = options.find((option) => option.value === event.target.value);
        if (next) onChange(next.value);
      }}
      className={`${SELECT_CLASS} ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

const DEFAULT_SELECT_CLASS = 'bg-surface-container-low font-body-sm text-body-sm text-on-surface';

export default function ListingFilterBar({ filters, onChange }: ListingFilterBarProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="grid grid-cols-1 items-center gap-3.5 md:grid-cols-2 lg:grid-cols-12">
        <div className="relative lg:col-span-4">
          <Icon
            name="search"
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-outline"
          />
          <input
            type="text"
            value={filters.keyword}
            onChange={(event) => onChange({ keyword: event.target.value })}
            placeholder={t('listings.listingFilterBar.searchByPlaceName')}
            className="h-11 w-full rounded-xl bg-surface-container-low pr-4 pl-11 font-body-sm text-body-sm text-on-surface transition-all placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>
        <div className="lg:col-span-2">
          <InlineSelect
            ariaLabel={t('listings.listingFilterBar.category')}
            value={filters.category}
            options={LISTING_CATEGORY_SELECT_OPTIONS}
            onChange={(category) => onChange({ category })}
            className={DEFAULT_SELECT_CLASS}
          />
        </div>
        <div className="lg:col-span-2">
          <InlineSelect
            ariaLabel={t('listings.listingFilterBar.province')}
            value={filters.province}
            options={LISTING_PROVINCE_OPTIONS}
            onChange={(province) => onChange({ province })}
            className={DEFAULT_SELECT_CLASS}
          />
        </div>
        <div className="lg:col-span-2">
          <InlineSelect
            ariaLabel={t('listings.listingFilterBar.partnerTier')}
            value={filters.tier}
            options={PARTNER_TIER_OPTIONS}
            onChange={(tier) => onChange({ tier })}
            className={DEFAULT_SELECT_CLASS}
          />
        </div>
        <div className="lg:col-span-2">
          <InlineSelect
            ariaLabel={t('listings.listingFilterBar.priority')}
            value={filters.priority}
            options={LISTING_PRIORITY_OPTIONS}
            onChange={(priority) => onChange({ priority })}
            className="bg-tertiary-fixed font-label-md text-label-md font-semibold text-on-tertiary-fixed"
          />
        </div>
      </div>
    </div>
  );
}
