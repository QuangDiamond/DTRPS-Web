import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { Icon } from '@/components/common';
import { useDismiss } from '@/hooks';
import {
  formatReportRange,
  getPeriodOptions,
  getPeriodRange,
  REPORT_REGION_OPTIONS,
  REPORT_SERVICE_OPTIONS,
} from '@/pages/Reports/reportUtils';
import type { DateRange, ReportFilters, SelectOption } from '@/types';

interface ReportsFilterBarProps {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
}

const DATE_INPUT_CLASS =
  'h-10 w-full rounded-xl border border-surface-container bg-surface-container-low px-3 font-body-sm text-[13px] text-on-surface focus:ring-1 focus:ring-primary focus:outline-none';

function ReportSelect<T extends string>({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: string;
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="relative">
      <Icon
        name={icon}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-primary"
      />
      <select
        aria-label={label}
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option.value === event.target.value);
          if (next) onChange(next.value);
        }}
        className="cursor-pointer appearance-none rounded-xl border border-surface-container bg-surface-container-low py-2 pr-8 pl-9 font-label-md text-[13px] text-on-surface transition-colors hover:bg-surface-container focus:ring-1 focus:ring-primary focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[16px] text-on-surface-variant"
      />
    </div>
  );
}

export default function ReportsFilterBar({ filters, onChange }: ReportsFilterBarProps) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>(filters.dateRange);
  const pickerRef = useRef<HTMLDivElement>(null);
  useDismiss(pickerRef, pickerOpen, () => setPickerOpen(false));
  const isDraftValid = Boolean(draft.from && draft.to) && draft.from <= draft.to;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-container/80 bg-surface-container-lowest p-3.5 shadow-xs print:hidden">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Khoảng ngày tùy chọn */}
        <div ref={pickerRef} className="relative">
          <button
            type="button"
            aria-expanded={pickerOpen}
            onClick={() => {
              setDraft(filters.dateRange);
              setPickerOpen((open) => !open);
            }}
            className="flex items-center gap-2 rounded-xl border border-surface-container bg-surface-container-low px-3 py-2 font-body-sm text-[13px] text-on-surface transition-colors hover:bg-surface-container"
          >
            <Icon name="calendar_today" className="text-[18px] text-primary" />
            <span className="font-medium">{formatReportRange(filters.dateRange)}</span>
            <Icon name="expand_more" className="text-[16px] text-on-surface-variant" />
          </button>

          {pickerOpen && (
            <div className="absolute left-0 z-30 mt-2 flex w-72 flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-lg ring-1 ring-surface-container">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                {t('reports.reportsFilterBar.selectReportPeriod')}
              </span>
              <label className="flex flex-col gap-1 font-label-sm text-label-sm text-on-surface-variant">
                {t('reports.reportsFilterBar.from')}
                <input
                  type="date"
                  value={draft.from}
                  max={draft.to}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, from: event.target.value }))
                  }
                  className={DATE_INPUT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-1 font-label-sm text-label-sm text-on-surface-variant">
                {t('reports.reportsFilterBar.to')}
                <input
                  type="date"
                  value={draft.to}
                  min={draft.from}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, to: event.target.value }))
                  }
                  className={DATE_INPUT_CLASS}
                />
              </label>
              <button
                type="button"
                disabled={!isDraftValid}
                onClick={() => {
                  onChange({ ...filters, period: 'custom', dateRange: draft });
                  setPickerOpen(false);
                }}
                className="h-10 rounded-xl bg-primary font-label-md text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:opacity-50"
              >
                {t('reports.reportsFilterBar.apply')}
              </button>
            </div>
          )}
        </div>

        <ReportSelect
          icon="public"
          label={t('reports.reportsFilterBar.region')}
          value={filters.region}
          options={REPORT_REGION_OPTIONS}
          onChange={(region) => onChange({ ...filters, region })}
        />
        <ReportSelect
          icon="category"
          label={t('reports.reportsFilterBar.serviceType')}
          value={filters.service}
          options={REPORT_SERVICE_OPTIONS}
          onChange={(service) => onChange({ ...filters, service })}
        />
      </div>

      {/* Chọn nhanh kỳ báo cáo */}
      <div className="flex items-center gap-1 rounded-xl border border-surface-container bg-surface-container-low p-1">
        {getPeriodOptions().map((option) => {
          const active = filters.period === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChange({
                  ...filters,
                  period: option.value,
                  dateRange: getPeriodRange(option.value),
                })
              }
              className={`rounded-lg px-3 py-1.5 font-label-sm text-[12px] transition-colors ${
                active
                  ? 'bg-surface-container-lowest font-semibold text-primary shadow-xs'
                  : 'font-medium text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
