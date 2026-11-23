import type { AddressSuggestion, GeoLocation } from '@/components/common/mapTypes';
import type { GoongRoute, GoongVehicle } from '@/client/api/tripFlowApi';
import { clientRequest } from './http';

export interface NearbyPlace {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
}

const query = (params: Record<string, string | number | undefined>) =>
  new URLSearchParams(
    Object.entries(params)
      .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
      .map(([key, value]) => [key, String(value)]),
  ).toString();

/** Tìm địa chỉ / đổi tọa độ ↔ địa chỉ / chỉ đường qua backend (Goong) — key Goong không nằm ở trình duyệt */
export const mapsApi = {
  autocomplete: (input: string, near?: { latitude: number; longitude: number }) =>
    clientRequest<AddressSuggestion[]>(
      `/maps/autocomplete?${query({ input, lat: near?.latitude, lng: near?.longitude })}`,
    ),
  place: (placeId: string) =>
    clientRequest<GeoLocation>(`/maps/places/${encodeURIComponent(placeId)}`),
  reverse: (latitude: number, longitude: number) =>
    clientRequest<GeoLocation>(`/maps/reverse?${query({ lat: latitude, lng: longitude })}`),
  directions: (params: {
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    vehicle?: GoongVehicle;
  }) =>
    clientRequest<GoongRoute>(
      `/maps/directions?${query({
        fromLat: params.fromLat,
        fromLng: params.fromLng,
        toLat: params.toLat,
        toLng: params.toLng,
        vehicle: params.vehicle ?? 'car',
      })}`,
    ),
  nearby: (params: { lat: number; lng: number; keyword?: string; radius?: number }) =>
    clientRequest<NearbyPlace[]>(
      `/maps/nearby?${query({
        lat: params.lat,
        lng: params.lng,
        keyword: params.keyword ?? 'cây xăng',
        radius: params.radius ?? 5,
      })}`,
    ),
};
