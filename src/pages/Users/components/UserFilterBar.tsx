import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import {
  USER_ACCOUNT_TYPE_OPTIONS,
  USER_JOINED_OPTIONS,
  USER_STATUS_OPTIONS,
} from '@/constants/user';
import type { SelectOption, UserFilters } from '@/types';

interface UserFilterBarProps {
  filters: UserFilters;
  onChange: (changes: Partial<UserFilters>) => void;
  onApply: () => void;
  onReset: () => void;
}

interface SelectProps<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}

function FilterSelect<T extends string>({ value, options, onChange, ariaLabel }: SelectProps<T>) {
  return (
    <div className="relative lg:col-span-2">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option.value === event.target.value);
          if (next) onChange(next.value);
        }}
        className="w-full cursor-pointer appearance-none rounded-xl bg-surface-container-low px-3.5 py-2.5 pr-8 font-body-sm text-body-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-outline"
      />
    </div>
  );
}

export default function UserFilterBar({ filters, onChange, onApply, onReset }: UserFilterBarProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-space-md rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="grid grid-cols-1 items-center gap-space-sm lg:grid-cols-12">
        <div className="flex items-center rounded-xl bg-surface-container-low px-space-md py-2.5 focus-within:ring-2 focus-within:ring-primary/30 lg:col-span-5">
          <Icon name="search" className="mr-2.5 text-[20px] text-primary" />
          <input
            type="text"
            value={filters.keyword}
            onChange={(event) => onChange({ keyword: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onApply();
            }}
            placeholder={t('users.userFilterBar.searchByTravelerName')}
            className="w-full border-0 bg-transparent font-body-sm text-body-sm text-on-surface outline-none placeholder:text-outline"
          />
        </div>
        <FilterSelect
          ariaLabel={t('users.userFilterBar.status')}
          value={filters.status}
          options={USER_STATUS_OPTIONS}
          onChange={(status) => onChange({ status })}
        />
        <FilterSelect
          ariaLabel={t('users.userFilterBar.accountType')}
          value={filters.accountType}
          options={USER_ACCOUNT_TYPE_OPTIONS}
          onChange={(accountType) => onChange({ accountType })}
        />
        <FilterSelect
          ariaLabel={t('users.userFilterBar.signUpDate')}
          value={filters.joined}
          options={USER_JOINED_OPTIONS}
          onChange={(joined) => onChange({ joined })}
        />
        <div className="flex items-center justify-end gap-1.5 lg:col-span-1">
          <button
            type="button"
            onClick={onApply}
            title={t('users.userFilterBar.applyFilters')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm transition-all hover:opacity-90"
          >
            <Icon name="tune" className="text-[19px]" />
          </button>
          <button
            type="button"
            onClick={onReset}
            title={t('users.userFilterBar.resetFilters')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <Icon name="restart_alt" className="text-[19px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
