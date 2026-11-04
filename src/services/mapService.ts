/** Tìm địa chỉ / đổi tọa độ ↔ địa chỉ qua backend (Goong) cho các trang admin */
import type { AddressSuggestion, GeoLocation } from '@/components/common/mapTypes';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';

export const mapService = {
  autocomplete: (input: string, near?: { latitude: number; longitude: number }) =>
    apiRequest<AddressSuggestion[]>(ENDPOINTS.maps.autocomplete, {
      query: { input, lat: near?.latitude, lng: near?.longitude },
    }),
  place: (placeId: string) => apiRequest<GeoLocation>(ENDPOINTS.maps.place(placeId)),
  reverse: (latitude: number, longitude: number) =>
    apiRequest<GeoLocation>(ENDPOINTS.maps.reverse, { query: { lat: latitude, lng: longitude } }),
};
