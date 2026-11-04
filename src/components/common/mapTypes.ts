import type { StyleSpecification } from 'maplibre-gl';
import { GOONG_MAPTILES_KEY } from '@/services/config';

/** Một gợi ý địa chỉ từ /api/maps/autocomplete */
export interface AddressSuggestion {
  placeId: string;
  title: string;
  subtitle: string;
  description: string;
}

/** Một điểm kèm địa chỉ (/api/maps/places/{id}, /api/maps/reverse) */
export interface GeoLocation {
  placeId: string | null;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

/** Các hàm bản đồ — khu admin và khu client truyền service riêng (mỗi khu một cách gọi API) */
export interface MapSearch {
  autocomplete: (
    input: string,
    near?: { latitude: number; longitude: number },
  ) => Promise<AddressSuggestion[]>;
  place: (placeId: string) => Promise<GeoLocation>;
  reverse: (latitude: number, longitude: number) => Promise<GeoLocation>;
}

/** Giữa Việt Nam — dùng khi chưa có tọa độ ([lng, lat] theo MapLibre) */
export const VIETNAM_CENTER: [number, number] = [106.5, 16.05];

/** Nền CARTO dự phòng khi chưa cấu hình Goong Maptiles key */
const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: ['a', 'b', 'c', 'd'].map(
        (s) => `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`,
      ),
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
  },
  layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
};

/** Style nền bản đồ Goong (vector), hoặc CARTO nếu thiếu key */
export const mapStyle = (): string | StyleSpecification =>
  GOONG_MAPTILES_KEY
    ? `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`
    : FALLBACK_STYLE;

export const round6 = (value: number) => Math.round(value * 1e6) / 1e6;

/** Ghim màu chủ đạo cho marker */
export function pinElement(): HTMLElement {
  const pin = document.createElement('span');
  pin.className = 'material-symbols-outlined';
  pin.textContent = 'location_on';
  pin.style.cssText =
    "font-size:40px;color:#0F766E;font-variation-settings:'FILL' 1;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35));cursor:grab";
  return pin;
}
