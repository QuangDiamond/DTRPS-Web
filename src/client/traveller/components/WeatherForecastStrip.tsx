import { useEffect, useState } from 'react';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { weatherApi, type DailyForecast } from '@/client/api/weatherApi';
import { weatherIconName, weekdayShortLabel } from '@/client/weather/weatherIcons';
import HorizontalScrollRow from '@/client/traveller/components/HorizontalScrollRow';

function formatTemp(value: number | null): string {
  return value === null ? '--' : `${Math.round(value)}°`;
}

/** Dải dự báo 7 ngày cho lịch trình — GET /itineraries/{id}/weather, cần đăng nhập. */
export default function WeatherForecastStrip({ itineraryId }: { itineraryId: number }) {
  const [daily, setDaily] = useState<DailyForecast[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    weatherApi
      .forItinerary(itineraryId)
      .then((result) => {
        if (!active) return;
        // Lấy đại diện 1 địa điểm có dữ liệu — lịch trình nhiều điểm nhưng cùng khu vực/khung ngày.
        const place = result.places.find((item) => item.daily.length > 0);
        setDaily(place?.daily ?? []);
      })
      .catch((caught: unknown) => {
        if (active) setError(errorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [itineraryId]);

  if (loading) {
    return (
      <div className="mt-4 rounded-[20px] bg-white p-4 text-center text-[12.5px] text-[#8793AB] sm:mt-5">
        Đang tải dự báo thời tiết...
      </div>
    );
  }

  if (error || !daily || daily.length === 0) {
    return (
      <div className="mt-4 rounded-[20px] bg-white p-4 text-center text-[12.5px] text-[#8793AB] sm:mt-5">
        Không tải được dự báo thời tiết.
      </div>
    );
  }

  return (
    <section className="mt-4 min-w-0 rounded-[20px] border border-[#E2EAEA] bg-white p-4 sm:mt-5 sm:p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#163142]">
        <Icon name="wb_sunny" className="text-[19px] text-[#0891B2]" />
        Dự báo thời tiết {daily.length} ngày
      </h3>
      <HorizontalScrollRow>
        {daily.map((day) => (
          <div
            key={day.date}
            className="flex w-[84px] shrink-0 flex-col items-center gap-1 rounded-2xl bg-[#F5F9F9] px-2 py-3"
          >
            <span className="text-[11px] font-bold text-[#61757A]">{weekdayShortLabel(day.date)}</span>
            <Icon name={weatherIconName(day.weatherCode)} filled className="text-[24px] text-[#3B6FD8]" />
            <span className="text-[12px] font-extrabold text-[#163142]">
              {formatTemp(day.temperatureMax)}
            </span>
            <span className="text-[10.5px] text-[#8793AB]">{formatTemp(day.temperatureMin)}</span>
            {day.precipitationProbabilityMax !== null && day.precipitationProbabilityMax > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#3B6FD8]">
                <Icon name="water_drop" className="text-[11px]" />
                {day.precipitationProbabilityMax}%
              </span>
            )}
          </div>
        ))}
      </HorizontalScrollRow>
    </section>
  );
}
