import { clientRequest } from './http';
import type { ItineraryItem } from './tripFlowApi';

/**
 * Dự báo thời tiết (Open-Meteo qua Backend). `GET /weather` công khai; các API theo lịch trình
 * cần đăng nhập + đúng chủ sở hữu kế hoạch.
 */

export interface DailyForecast {
  /** yyyy-MM-dd */
  date: string;
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitationProbabilityMax: number | null;
  precipitationSum: number | null;
  windSpeedMax: number | null;
  weatherCode: number | null;
  condition: string;
}

export interface HourlyForecast {
  /** yyyy-MM-dd */
  date: string;
  /** HH:mm:ss */
  time: string;
  temperature: number | null;
  weatherCode: number | null;
  condition: string;
  precipitationProbability: number | null;
  precipitation: number | null;
  windSpeed: number | null;
}

/**
 * `notAvailable`: ngày yêu cầu vượt quá 7 ngày Open-Meteo hỗ trợ (GBR-47) — hiện "Chưa có dự báo"
 * thay vì báo lỗi. `stale`: true khi gọi Open-Meteo vừa lỗi và đây là dữ liệu cache cũ (GBR-50).
 */
export interface WeatherResponse {
  placeId: number;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  notAvailable: string[];
  stale: boolean;
  fetchedAt: string;
}

export interface ItineraryWeatherResponse {
  itineraryId: number;
  places: WeatherResponse[];
}

export type WeatherSuggestionType = 'SHIFT_TIME' | 'CHANGE_DAY' | 'SWAP_PLACE';

export interface WeatherSuggestion {
  type: WeatherSuggestionType;
  description: string;
  newDate: string | null;
  newStartTime: string | null;
  newEndTime: string | null;
  newPlaceId: number | null;
  newPlaceName: string | null;
}

export interface WeatherImpactedItem {
  itemId: number;
  dayId: number;
  dayNumber: number;
  date: string;
  placeId: number;
  placeName: string;
  startTime: string | null;
  endTime: string | null;
  weatherCode: number | null;
  condition: string;
  warningMessage: string;
  suggestions: WeatherSuggestion[];
}

export interface WeatherImpactResponse {
  itineraryId: number;
  impactedItems: WeatherImpactedItem[];
}

/** Khách chọn đúng 1 đề xuất rồi gửi lại — không có request này thì không gì tự thay đổi cả. */
export interface ApplyWeatherSuggestionInput {
  itemId: number;
  suggestionType: WeatherSuggestionType;
  newDate?: string | null;
  newStartTime?: string | null;
  newEndTime?: string | null;
  newPlaceId?: number | null;
}

export const weatherApi = {
  /** Công khai, không cần đăng nhập. */
  forPlace: (placeId: number | string, from?: string, to?: string) => {
    const search = new URLSearchParams({ placeId: String(placeId) });
    if (from) search.set('from', from);
    if (to) search.set('to', to);
    return clientRequest<WeatherResponse>(`/weather?${search.toString()}`, { auth: false });
  },

  forItinerary: (itineraryId: number) =>
    clientRequest<ItineraryWeatherResponse>(`/itineraries/${itineraryId}/weather`),

  impact: (itineraryId: number) =>
    clientRequest<WeatherImpactResponse>(`/itineraries/${itineraryId}/weather-impact`),

  applyImpact: (itineraryId: number, input: ApplyWeatherSuggestionInput) =>
    clientRequest<ItineraryItem>(`/itineraries/${itineraryId}/weather-impact/apply`, {
      method: 'POST',
      body: input,
    }),
};
