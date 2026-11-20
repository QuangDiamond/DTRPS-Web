import { useState } from 'react';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import {
  weatherApi,
  type WeatherImpactedItem,
  type WeatherSuggestion,
} from '@/client/api/weatherApi';
import { weatherIconName, isStormCode } from '@/client/weather/weatherIcons';

function suggestionKey(itemId: number, index: number): string {
  return `${itemId}-${index}`;
}

function formatTime(value: string | null): string {
  return value ? value.slice(0, 5) : '--:--';
}

/**
 * Cảnh báo UC-045: hoạt động ngoài trời rơi vào khung giờ mưa to/giông. Chỉ là ĐỀ XUẤT — chỉ thay
 * đổi lịch trình khi khách bấm "Áp dụng" cho đúng 1 gợi ý, không tự động sửa gì cả.
 */
export default function WeatherImpactBanner({
  itineraryId,
  items,
  onApplied,
}: {
  itineraryId: number;
  items: WeatherImpactedItem[];
  onApplied: () => void;
}) {
  const [applyingKey, setApplyingKey] = useState<string | null>(null);
  const [appliedKeys, setAppliedKeys] = useState<Set<string>>(new Set());
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  if (items.length === 0) return null;

  const apply = (item: WeatherImpactedItem, suggestion: WeatherSuggestion, index: number) => {
    const key = suggestionKey(item.itemId, index);
    setApplyingKey(key);
    setErrorKey(null);
    weatherApi
      .applyImpact(itineraryId, {
        itemId: item.itemId,
        suggestionType: suggestion.type,
        newDate: suggestion.newDate,
        newStartTime: suggestion.newStartTime,
        newEndTime: suggestion.newEndTime,
        newPlaceId: suggestion.newPlaceId,
      })
      .then(() => {
        setAppliedKeys((previous) => new Set(previous).add(key));
        onApplied();
      })
      .catch((caught: unknown) => {
        setErrorKey(key);
        setErrorMessages((previous) => ({ ...previous, [key]: errorMessage(caught) }));
      })
      .finally(() => setApplyingKey(null));
  };

  return (
    <div className="mb-5 grid gap-3">
      {items.map((item) => {
        const storm = isStormCode(item.weatherCode);
        return (
          <section
            key={item.itemId}
            className={`rounded-[18px] border p-4 ${
              storm ? 'border-[#F3C3B0] bg-[#FFF3EF]' : 'border-[#F6DCA8] bg-[#FFF8EC]'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  storm ? 'bg-[#FDE3D8] text-[#B45335]' : 'bg-[#FBEAC4] text-[#9A6B10]'
                }`}
              >
                <Icon name={weatherIconName(item.weatherCode)} filled className="text-[21px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[13px] font-extrabold ${
                    storm ? 'text-[#B45335]' : 'text-[#9A6B10]'
                  }`}
                >
                  {item.warningMessage}
                </p>
                <p className="mt-1 text-[12px] text-[#61757A]">
                  {item.placeName} · {formatTime(item.startTime)}–{formatTime(item.endTime)} ·{' '}
                  {item.condition}
                </p>
              </div>
            </div>

            <p className="mt-3 text-[11px] font-bold tracking-wide text-[#61757A] uppercase">
              Đề xuất điều chỉnh — bạn chọn, hệ thống không tự sửa lịch
            </p>
            <div className="mt-2 grid gap-2">
              {item.suggestions.map((suggestion, index) => {
                const key = suggestionKey(item.itemId, index);
                const applied = appliedKeys.has(key);
                const applying = applyingKey === key;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-[#163142]">
                        {suggestion.description}
                      </p>
                      {errorKey === key && (
                        <p className="mt-1 text-[11px] text-client-danger">
                          {errorMessages[key]}
                        </p>
                      )}
                    </div>
                    {applied ? (
                      <span className="flex shrink-0 items-center gap-1 text-[12px] font-bold text-[#0891B2]">
                        <Icon name="check_circle" filled className="text-[18px]" />
                        Đã áp dụng
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={applying}
                        onClick={() => apply(item, suggestion, index)}
                        className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#0E7490] px-3.5 py-2 text-[12px] font-bold text-white disabled:cursor-wait disabled:opacity-60"
                      >
                        {applying ? 'Đang áp dụng...' : 'Áp dụng'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
