import type { AddressSuggestion, GeoLocation } from '@/components/common/mapTypes';
import { clientRequest } from './http';

const query = (params: Record<string, string | number | undefined>) =>
  new URLSearchParams(
    Object.entries(params)
      .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
      .map(([key, value]) => [key, String(value)]),
  ).toString();

/** Tìm địa chỉ / đổi tọa độ ↔ địa chỉ qua backend (Goong) — key Goong không nằm ở trình duyệt */
export const mapsApi = {
  autocomplete: (input: string, near?: { latitude: number; longitude: number }) =>
    clientRequest<AddressSuggestion[]>(
      `/maps/autocomplete?${query({ input, lat: near?.latitude, lng: near?.longitude })}`,
    ),
  place: (placeId: string) =>
    clientRequest<GeoLocation>(`/maps/places/${encodeURIComponent(placeId)}`),
  reverse: (latitude: number, longitude: number) =>
    clientRequest<GeoLocation>(`/maps/reverse?${query({ lat: latitude, lng: longitude })}`),
};
