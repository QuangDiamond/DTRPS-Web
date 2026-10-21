import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { Icon } from '@/components/common';
import {
  APPROVED_SORT_OPTIONS,
  LISTING_CATEGORY_SELECT_OPTIONS,
  LISTING_PROVINCE_OPTIONS,
  MIN_RATING_OPTIONS,
  PARTNER_TIER_OPTIONS,
  VISIBILITY_FILTER_OPTIONS,
} from '@/constants/listing';
import type { ApprovedListingFilters, SelectOption } from '@/types';

interface ApprovedFilterBarProps {
  filters: ApprovedListingFilters;
  advancedOpen: boolean;
  onChange: (changes: Partial<ApprovedListingFilters>) => void;
  onReset: () => void;
}

interface PillSelectProps<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  icon?: string;
}

function PillSelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  icon = 'expand_more',
}: PillSelectProps<T>) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option.value === event.target.value);
          if (next) onChange(next.value);
        }}
        className="h-11 cursor-pointer appearance-none rounded-xl bg-surface-container-low pr-8 pl-3.5 font-label-md text-label-md text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name={icon}
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-on-surface-variant"
      />
    </div>
  );
}

const CATEGORY_OPTIONS = LISTING_CATEGORY_SELECT_OPTIONS;
const PROVINCE_OPTIONS = LISTING_PROVINCE_OPTIONS.map((option) =>
  option.value === 'all'
    ? { ...option, label: i18n.t('approvedListings.approvedFilterBar.allRegions') }
    : option,
);

export default function ApprovedFilterBar({
  filters,
  advancedOpen,
  onChange,
  onReset,
}: ApprovedFilterBarProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-space-md shadow-[0_4px_20px_-2px_rgba(15,118,110,0.06)]">
      <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-[260px] flex-1">
          <Icon
            name="search"
            className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-primary"
          />
          <input
            type="text"
            value={filters.keyword}
            onChange={(event) => onChange({ keyword: event.target.value })}
            placeholder={t('approvedListings.approvedFilterBar.searchByPlaceName')}
            className="h-11 w-full rounded-xl bg-surface-container-low pr-4 pl-11 font-body-sm text-body-sm text-on-surface transition-all placeholder:text-outline focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <PillSelect
            ariaLabel={t('approvedListings.approvedFilterBar.category')}
            value={filters.category}
            options={CATEGORY_OPTIONS}
            onChange={(category) => onChange({ category })}
          />
          <PillSelect
            ariaLabel={t('approvedListings.approvedFilterBar.region')}
            value={filters.province}
            options={PROVINCE_OPTIONS}
            onChange={(province) => onChange({ province })}
          />
          <PillSelect
            ariaLabel={t('approvedListings.approvedFilterBar.visibility')}
            value={filters.visibility}
            options={VISIBILITY_FILTER_OPTIONS}
            onChange={(visibility) => onChange({ visibility })}
          />
          <PillSelect
            ariaLabel={t('approvedListings.approvedFilterBar.sort')}
            icon="sort"
            value={filters.sort}
            options={APPROVED_SORT_OPTIONS}
            onChange={(sort) => onChange({ sort })}
          />
          <button
            type="button"
            onClick={onReset}
            title={t('approvedListings.approvedFilterBar.resetFilters')}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant transition-all hover:bg-surface-container hover:text-primary"
          >
            <Icon name="refresh" className="text-[20px]" />
          </button>
        </div>
      </div>

      {/* Bộ lọc nâng cao */}
      {advancedOpen && (
        <div className="flex flex-wrap items-center gap-2.5 border-t border-surface-container pt-3">
          <span className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold tracking-wider text-tertiary uppercase">
            <Icon name="tune" className="text-[16px]" />{' '}
            {t('approvedListings.approvedFilterBar.advanced')}
          </span>
          <PillSelect
            ariaLabel={t('approvedListings.approvedFilterBar.partnerTier')}
            value={filters.tier}
            options={PARTNER_TIER_OPTIONS}
            onChange={(tier) => onChange({ tier })}
          />
          <PillSelect
            ariaLabel={t('approvedListings.approvedFilterBar.minimumRating')}
            icon="star"
            value={String(filters.minRating)}
            options={MIN_RATING_OPTIONS}
            onChange={(value) => onChange({ minRating: Number(value) })}
          />
        </div>
      )}
    </div>
  );
}
