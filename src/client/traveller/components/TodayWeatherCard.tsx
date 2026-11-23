import { useEffect, useState } from 'react';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { weatherApi, type WeatherResponse } from '@/client/api/weatherApi';
import { isStormCode, weatherIconName, weekdayShortLabel } from '@/client/weather/weatherIcons';
import HorizontalScrollRow from '@/client/traveller/components/HorizontalScrollRow';

function formatTemp(value: number | null): string {
  return value === null ? '--' : `${Math.round(value)}°`;
}

function formatHour(time: string): string {
  return time.slice(0, 5);
}

function dayLabel(dateStr: string, todayStr: string): string {
  return dateStr === todayStr ? 'Hôm nay' : weekdayShortLabel(dateStr);
}

/**
 * Dự báo thời tiết cho một địa điểm — GET /weather?placeId= (công khai). Hiện gọn thời tiết hôm
 * nay; bấm vào mở dải 7 ngày tới, chọn ngày nào xem chi tiết theo giờ của ngày đó.
 */
export default function TodayWeatherCard({ placeId }: { placeId: number }) {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [manualRetry, setManualRetry] = useState(0);

  useEffect(() => {
    let active = true;
    let autoRetryTimer: number | undefined;
    let autoRetried = false;

    const load = () => {
      setLoading(true);
      setError(null);
      weatherApi
        .forPlace(placeId)
        .then((result) => {
          if (!active) return;
          setWeather(result);
          setSelectedDate(result.daily[0]?.date ?? null);
        })
        .catch((caught: unknown) => {
          if (!active) return;
          setError(errorMessage(caught));
          // Lần đầu xem 1 địa điểm, backend có thể phải gọi nguồn thời tiết ngoài nên chậm/lỗi
          // tạm thời — tự thử lại 1 lần thay vì bắt người dùng tải lại cả trang.
          if (!autoRetried) {
            autoRetried = true;
            autoRetryTimer = window.setTimeout(() => {
              if (active) load();
            }, 1500);
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    setExpanded(false);
    setSelectedDate(null);
    load();

    return () => {
      active = false;
      if (autoRetryTimer) window.clearTimeout(autoRetryTimer);
    };
  }, [placeId, manualRetry]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-4 text-center text-[12.5px] text-[#8793AB]">
        Đang tải dự báo thời tiết...
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="rounded-2xl bg-white p-4 text-center text-[12.5px] text-[#8793AB]">
        <p>Không tải được dự báo thời tiết.</p>
        <button
          type="button"
          onClick={() => setManualRetry((n) => n + 1)}
          className="mt-1.5 font-bold text-[#3B6FD8] underline-offset-2 hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const today = weather.daily[0];

  if (!today) {
    return (
      <div className="rounded-2xl bg-white p-4 text-center text-[12.5px] text-[#8793AB]">
        Chưa có dự báo thời tiết cho địa điểm này.
      </div>
    );
  }

  const activeDate = selectedDate ?? today.date;
  const activeHourly = weather.hourly.filter((hour) => hour.date === activeDate);

  return (
    <div className="min-w-0 rounded-2xl bg-white p-4">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="group flex w-full items-center gap-3 text-left"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E3EDFF] text-[#3B6FD8]">
          <Icon name={weatherIconName(today.weatherCode)} filled className="text-[26px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold text-[#13364A]">{today.condition}</p>
          <p className="text-[12px] text-[#72818C]">
            {formatTemp(today.temperatureMax)} / {formatTemp(today.temperatureMin)}
          </p>
        </div>
        {today.precipitationProbabilityMax !== null && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#E3EDFF] px-2.5 py-1 text-[11px] font-bold text-[#3B6FD8]">
            <Icon name="water_drop" className="text-[14px]" />
            {today.precipitationProbabilityMax}%
          </span>
        )}
        <Icon
          name={expanded ? 'expand_less' : 'expand_more'}
          className="shrink-0 text-[20px] text-[#8793AB] transition-transform group-hover:text-[#3B6FD8]"
        />
      </button>

      {expanded && (
        <div className="mt-3.5 min-w-0 border-t border-[#EEF1F4] pt-3.5">
          <p className="mb-2 text-[11px] font-bold tracking-wide text-[#8793AB] uppercase">
            Dự báo 7 ngày tới
          </p>
          <HorizontalScrollRow>
            {weather.daily.map((day) => {
              const selected = day.date === activeDate;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  aria-pressed={selected}
                  className={`flex w-[62px] shrink-0 flex-col items-center gap-1 rounded-xl py-2.5 transition-colors ${
                    selected
                      ? 'bg-[#3B6FD8]'
                      : 'bg-[#F5F8FA] hover:bg-[#E3EDFF]'
                  }`}
                >
                  <span
                    className={`text-[10.5px] font-semibold ${
                      selected ? 'text-white/85' : 'text-[#72818C]'
                    }`}
                  >
                    {dayLabel(day.date, today.date)}
                  </span>
                  <Icon
                    name={weatherIconName(day.weatherCode)}
                    filled
                    className={`text-[19px] ${selected ? 'text-white' : 'text-[#3B6FD8]'}`}
                  />
                  <span
                    className={`text-[12px] font-extrabold ${
                      selected ? 'text-white' : 'text-[#13364A]'
                    }`}
                  >
                    {formatTemp(day.temperatureMax)}
                  </span>
                  <span className={`text-[10px] ${selected ? 'text-white/75' : 'text-[#8793AB]'}`}>
                    {formatTemp(day.temperatureMin)}
                  </span>
                </button>
              );
            })}
          </HorizontalScrollRow>

          {activeHourly.length > 0 && (
            <>
              <p className="mt-3.5 mb-2 text-[11px] font-bold tracking-wide text-[#8793AB] uppercase">
                Theo giờ
              </p>
              <HorizontalScrollRow>
                {activeHourly.map((hour) => (
                  <div
                    key={hour.time}
                    className={`flex w-[64px] shrink-0 flex-col items-center gap-1 rounded-xl py-2.5 ${
                      isStormCode(hour.weatherCode) ? 'bg-[#FFF3EF]' : 'bg-[#F5F8FA]'
                    }`}
                  >
                    <span className="text-[10.5px] font-semibold text-[#72818C]">
                      {formatHour(hour.time)}
                    </span>
                    <Icon
                      name={weatherIconName(hour.weatherCode)}
                      filled
                      className={`text-[20px] ${
                        isStormCode(hour.weatherCode) ? 'text-[#B45335]' : 'text-[#3B6FD8]'
                      }`}
                    />
                    <span className="text-[12.5px] font-extrabold text-[#13364A]">
                      {formatTemp(hour.temperature)}
                    </span>
                    {hour.precipitationProbability !== null && (
                      <span className="flex items-center gap-0.5 text-[10px] text-[#3B6FD8]">
                        <Icon name="water_drop" className="text-[11px]" />
                        {hour.precipitationProbability}%
                      </span>
                    )}
                  </div>
                ))}
              </HorizontalScrollRow>
            </>
          )}
        </div>
      )}

      {weather.stale && (
        <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-[#B45335]">
          <Icon name="info" className="text-[13px]" />
          Dữ liệu thời tiết có thể đã cũ do không kết nối được nguồn dự báo.
        </p>
      )}
    </div>
  );
}
