import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { formatDateRange, RANGE_OPTIONS } from '@/pages/Dashboard/dashboardUtils';
import type { DashboardRange, DateRange } from '@/types';

interface DashboardActionsProps {
  range: DashboardRange;
  dateRange: DateRange;
  onRangeChange: (range: DashboardRange) => void;
  onCustomRangeApply: (range: DateRange) => void;
  onExport: () => void;
}

const PILL_CLASS =
  'rounded-full border border-surface-container bg-surface-container-lowest font-label-md text-[13px] font-medium text-on-surface shadow-sm transition-all';

const DATE_INPUT_CLASS =
  'h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none';

export default function DashboardActions({
  range,
  dateRange,
  onRangeChange,
  onCustomRangeApply,
  onExport,
}: DashboardActionsProps) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>(dateRange);
  const isDraftValid = Boolean(draft.from && draft.to) && draft.from <= draft.to;

  // "Tùy chỉnh" chỉ hiện trong danh sách khi đang dùng khoảng ngày tự chọn
  const options = RANGE_OPTIONS.filter((option) => option.value !== 'custom' || range === 'custom');

  return (
    <>
      <div className="relative inline-block">
        <select
          value={range}
          onChange={(event) => {
            const next = RANGE_OPTIONS.find((option) => option.value === event.target.value);
            if (next) onRangeChange(next.value);
          }}
          className={`${PILL_CLASS} cursor-pointer appearance-none py-2 pr-9 pl-4 hover:bg-surface-container-low focus:outline-none`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="expand_more"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[18px] text-on-surface-variant"
        />
      </div>

      {/* Chọn khoảng ngày tùy chỉnh */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setDraft(dateRange);
            setPickerOpen((open) => !open);
          }}
          className={`${PILL_CLASS} flex items-center gap-2 px-4 py-2 hover:bg-surface-container hover:text-primary`}
        >
          <Icon name="calendar_today" className="text-[18px] text-primary" />
          <span>{formatDateRange(dateRange)}</span>
        </button>

        {pickerOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setPickerOpen(false)} />
            <div className="absolute right-0 z-40 mt-2 flex w-72 flex-col gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-lg ring-1 ring-surface-container">
              <span className="font-label-md text-label-md text-on-surface">
                {t('dashboard.picker.title')}
              </span>
              <label className="flex flex-col gap-1 font-label-sm text-label-sm text-on-surface-variant">
                {t('dashboard.picker.from')}
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
                {t('dashboard.picker.to')}
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
                  onCustomRangeApply(draft);
                  setPickerOpen(false);
                }}
                className="h-10 rounded-full bg-primary font-label-md text-label-md font-semibold text-on-primary transition-all hover:bg-primary-container disabled:opacity-50"
              >
                {t('dashboard.picker.apply')}
              </button>
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onExport}
        className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-label-md text-[13px] font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container"
      >
        <Icon name="file_download" className="text-[18px]" />
        <span>{t('dashboard.exportButton')}</span>
      </button>
    </>
  );
}
