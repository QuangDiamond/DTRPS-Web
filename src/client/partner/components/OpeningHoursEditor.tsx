import { Icon } from '@/components/common';
import type { OpeningHour } from '@/client/api/types';
import { DAY_LABELS } from '@/client/partner/placeFormat';

const TIME_CLASS =
  'h-10 rounded-lg border border-[#EBEDF5] bg-client-field px-2 text-[13px] text-[#18333E] focus:ring-2 focus:ring-primary/40 focus:outline-none disabled:opacity-40';

interface OpeningHoursEditorProps {
  /** false: không khai báo giờ mở cửa (gửi danh sách rỗng) */
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  week: OpeningHour[];
  onChange: (week: OpeningHour[]) => void;
  error?: string;
}

/** Giờ mở cửa theo từng ngày trong tuần (cho phép mở qua đêm, ví dụ 18:00 – 02:00) */
export default function OpeningHoursEditor({
  enabled,
  onEnabledChange,
  week,
  onChange,
  error,
}: OpeningHoursEditorProps) {
  const update = (day: number, changes: Partial<OpeningHour>) =>
    onChange(week.map((hour) => (hour.dayOfWeek === day ? { ...hour, ...changes } : hour)));

  const copyMonday = () => {
    const monday = week[0];
    onChange(week.map((hour) => ({ ...monday, dayOfWeek: hour.dayOfWeek })));
  };

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Kiểu giờ mở cửa"
        className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-client-field p-1"
      >
        {[
          { value: false, icon: 'all_inclusive', label: 'Mở cả ngày' },
          { value: true, icon: 'schedule', label: 'Theo giờ cụ thể' },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={enabled === option.value}
            onClick={() => onEnabledChange(option.value)}
            className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-[13px] font-bold transition-colors ${
              enabled === option.value
                ? 'bg-white text-primary shadow-sm'
                : 'text-client-muted hover:text-client-ink'
            }`}
          >
            <Icon name={option.icon} className="text-[18px]" />
            {option.label}
          </button>
        ))}
      </div>
      {!enabled && (
        <p className="text-[12px] text-client-muted">
          Không có giờ đóng/mở cố định — khách sẽ thấy “Mở cả ngày”.
        </p>
      )}
      {enabled && (
        <>
          <div className="flex flex-col divide-y divide-client-line rounded-xl border border-client-line">
            {week.map((hour) => (
              <div key={hour.dayOfWeek} className="flex flex-wrap items-center gap-3 px-3 py-2">
                <span className="w-20 text-[13px] font-semibold text-client-ink">
                  {DAY_LABELS[hour.dayOfWeek]}
                </span>
                <label className="flex items-center gap-1.5 text-[12px] text-client-muted select-none">
                  <input
                    type="checkbox"
                    checked={!hour.closed}
                    onChange={(event) =>
                      update(hour.dayOfWeek, {
                        closed: !event.target.checked,
                        openTime: hour.openTime ?? '08:00',
                        closeTime: hour.closeTime ?? '22:00',
                      })
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  Mở cửa
                </label>
                <input
                  type="time"
                  aria-label={`Giờ mở cửa ${DAY_LABELS[hour.dayOfWeek]}`}
                  value={hour.openTime ?? ''}
                  disabled={hour.closed}
                  onChange={(event) => update(hour.dayOfWeek, { openTime: event.target.value })}
                  className={TIME_CLASS}
                />
                <span className="text-client-muted">–</span>
                <input
                  type="time"
                  aria-label={`Giờ đóng cửa ${DAY_LABELS[hour.dayOfWeek]}`}
                  value={hour.closeTime ?? ''}
                  disabled={hour.closed}
                  onChange={(event) => update(hour.dayOfWeek, { closeTime: event.target.value })}
                  className={TIME_CLASS}
                />
                {hour.closed && <span className="text-[12px] text-client-danger">Đóng cửa</span>}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={copyMonday}
            className="mt-2 text-[12px] font-bold text-[#007A73] hover:underline"
          >
            Áp dụng giờ của Thứ 2 cho cả tuần
          </button>
        </>
      )}
      {error && <p className="mt-1 text-xs text-client-danger">{error}</p>}
    </div>
  );
}
