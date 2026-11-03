import { useTranslation } from 'react-i18next';
import { DAY_KEYS } from '@/pages/PlaceReview/placeReviewUtils';
import type { OpeningHour } from '@/types';

const TIME_CLASS =
  'h-10 rounded-lg bg-surface-container-low px-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-40';

/** Giờ mở cửa đủ 7 ngày; bỏ chọn "Mở cửa" = ngày nghỉ (is_closed). Cho phép mở qua đêm. */
export default function HoursEditor({
  week,
  onChange,
  disabled,
}: {
  week: OpeningHour[];
  onChange: (week: OpeningHour[]) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const update = (day: number, changes: Partial<OpeningHour>) =>
    onChange(week.map((hour) => (hour.dayOfWeek === day ? { ...hour, ...changes } : hour)));

  return (
    <div>
      <div className="flex flex-col divide-y divide-surface-container rounded-xl border border-surface-container">
        {week.map((hour) => {
          const day = t(DAY_KEYS[hour.dayOfWeek]);
          return (
            <div key={hour.dayOfWeek} className="flex flex-wrap items-center gap-3 px-3 py-2">
              <span className="w-20 font-label-md text-label-md font-semibold text-on-surface">
                {day}
              </span>
              <label className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant select-none">
                <input
                  type="checkbox"
                  checked={!hour.closed}
                  disabled={disabled}
                  onChange={(event) =>
                    update(hour.dayOfWeek, {
                      closed: !event.target.checked,
                      openTime: hour.openTime ?? '08:00',
                      closeTime: hour.closeTime ?? '22:00',
                    })
                  }
                  className="h-4 w-4 accent-primary"
                />
                {t('placeEditor.hours.open')}
              </label>
              <input
                type="time"
                aria-label={t('placeEditor.hours.openAt', { day })}
                value={hour.openTime ?? ''}
                disabled={disabled || hour.closed}
                onChange={(event) => update(hour.dayOfWeek, { openTime: event.target.value })}
                className={TIME_CLASS}
              />
              <span className="text-outline">–</span>
              <input
                type="time"
                aria-label={t('placeEditor.hours.closeAt', { day })}
                value={hour.closeTime ?? ''}
                disabled={disabled || hour.closed}
                onChange={(event) => update(hour.dayOfWeek, { closeTime: event.target.value })}
                className={TIME_CLASS}
              />
              {hour.closed && (
                <span className="font-label-sm text-label-sm text-error">
                  {t('placeEditor.hours.closed')}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(week.map((hour) => ({ ...week[0], dayOfWeek: hour.dayOfWeek })))}
        className="mt-2 font-label-sm text-label-sm font-bold text-primary hover:underline disabled:opacity-50"
      >
        {t('placeEditor.hours.copyMonday')}
      </button>
    </div>
  );
}
