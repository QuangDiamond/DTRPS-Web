import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Icon from './Icon';

interface SearchResult {
  lat: number;
  lon: number;
  label: string;
}

/** Kết quả GeoJSON của Photon (photon.komoot.io — tìm địa chỉ trên dữ liệu OpenStreetMap) */
interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: Record<string, string | undefined>;
}

/** Khung bao Việt Nam: lon trái, lat dưới, lon phải, lat trên */
const VIETNAM_BBOX = '102.1,8.2,109.6,23.4';

function toResult(feature: PhotonFeature): SearchResult {
  const p = feature.properties;
  const street = [p.housenumber, p.street].filter(Boolean).join(' ');
  const parts = [p.name, street, p.district, p.city, p.state].filter(
    (part, index, all): part is string => Boolean(part) && all.indexOf(part) === index,
  );
  const [lon, lat] = feature.geometry.coordinates;
  return { lat, lon, label: parts.join(', ') || `${lat}, ${lon}` };
}

/** Giữa Việt Nam — dùng khi chưa có tọa độ */
const VIETNAM_CENTER: L.LatLngTuple = [16.05, 106.5];

const PIN_ICON = L.divIcon({
  className: '',
  html: '<span class="material-symbols-outlined" style="font-size:40px;color:#0F766E;font-variation-settings:\'FILL\' 1;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">location_on</span>',
  iconSize: [40, 40],
  iconAnchor: [20, 38],
});

const round = (value: number) => Math.round(value * 1e6) / 1e6;

/** Chữ hiển thị — mặc định tiếng Việt; trang admin truyền bản đã dịch */
export interface LocationPickerLabels {
  title: string;
  searchPlaceholder: string;
  search: string;
  searching: string;
  myLocation: string;
  emptyQuery: string;
  notFound: string;
  searchFailed: string;
  noGeolocation: string;
  geolocationDenied: string;
  hintWithPoint: string;
  hintNoPoint: string;
}

const DEFAULT_LABELS: LocationPickerLabels = {
  title: 'Vị trí trên bản đồ',
  searchPlaceholder: 'Tìm địa chỉ, ví dụ: 12 Trần Phú, Hội An',
  search: 'Tìm',
  searching: 'Đang tìm…',
  myLocation: 'Vị trí của tôi',
  emptyQuery: 'Nhập địa chỉ hoặc tên địa điểm để tìm',
  notFound:
    'Không tìm thấy. Thử ghi ngắn hơn (tên đường, phường, tỉnh) hoặc bấm trực tiếp lên bản đồ.',
  searchFailed: 'Không tìm được lúc này. Bạn có thể bấm trực tiếp lên bản đồ.',
  noGeolocation: 'Trình duyệt không hỗ trợ lấy vị trí.',
  geolocationDenied: 'Không lấy được vị trí. Hãy cho phép truy cập vị trí hoặc chọn trên bản đồ.',
  hintWithPoint: 'Kéo ghim hoặc bấm chỗ khác trên bản đồ để chỉnh cho đúng vị trí.',
  hintNoPoint: 'Tìm địa chỉ rồi chọn kết quả, hoặc phóng to và bấm đúng vị trí trên bản đồ.',
};

interface LocationPickerProps {
  labels?: Partial<LocationPickerLabels>;
  latitude: number | null;
  longitude: number | null;
  /** Gợi ý ô tìm kiếm ban đầu (địa chỉ đã nhập) */
  address: string;
  onChange: (latitude: number, longitude: number) => void;
}

/**
 * Chọn vị trí địa điểm: tìm theo địa chỉ (Photon), bấm lên bản đồ hoặc kéo ghim.
 * Nền bản đồ dùng CARTO vì một số mạng ở VN không phân giải được tile.openstreetmap.org.
 * Tọa độ được điền ngược lại vào form. Dùng chung cho form đối tác và form admin.
 */
export default function LocationPicker({
  latitude,
  longitude,
  address,
  onChange,
  labels,
}: LocationPickerProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');

  const hasPoint = latitude !== null && longitude !== null;

  // Khởi tạo bản đồ một lần
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(VIETNAM_CENTER, 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);
    map.on('click', (event: L.LeafletMouseEvent) =>
      onChangeRef.current(round(event.latlng.lat), round(event.latlng.lng)),
    );
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Đồng bộ ghim với tọa độ trong form (kể cả khi gõ tay)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (
      latitude === null ||
      longitude === null ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    const point: L.LatLngTuple = [latitude, longitude];
    if (!markerRef.current) {
      const marker = L.marker(point, { draggable: true, icon: PIN_ICON }).addTo(map);
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        onChangeRef.current(round(lat), round(lng));
      });
      markerRef.current = marker;
      map.setView(point, Math.max(map.getZoom(), 16));
    } else {
      markerRef.current.setLatLng(point);
      if (!map.getBounds().contains(point)) map.panTo(point);
    }
  }, [latitude, longitude]);

  const search = async () => {
    const wanted = (query || address).trim();
    if (!wanted) {
      setMessage(text.emptyQuery);
      return;
    }
    setQuery(wanted);
    setSearching(true);
    setMessage('');
    try {
      const params = new URLSearchParams({ q: wanted, limit: '5', bbox: VIETNAM_BBOX });
      const response = await fetch(`https://photon.komoot.io/api/?${params}`);
      if (!response.ok) throw new Error(String(response.status));
      const data = (await response.json()) as { features: PhotonFeature[] };
      const found = data.features.map(toResult);
      setResults(found);
      if (found.length === 0) setMessage(text.notFound);
    } catch {
      setMessage(text.searchFailed);
    } finally {
      setSearching(false);
    }
  };

  const pick = (result: SearchResult) => {
    const lat = round(result.lat);
    const lng = round(result.lon);
    onChange(lat, lng);
    mapRef.current?.setView([lat, lng], 17);
    setResults(null);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setMessage(text.noGeolocation);
      return;
    }
    setMessage('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = round(position.coords.latitude);
        const lng = round(position.coords.longitude);
        onChange(lat, lng);
        mapRef.current?.setView([lat, lng], 17);
      },
      () => setMessage(text.geolocationDenied),
    );
  };

  return (
    <div className="mb-4">
      <p className="mb-2 text-[13px] font-semibold text-client-ink">{text.title}</p>
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void search();
            }
          }}
          placeholder={address || text.searchPlaceholder}
          className="h-11 min-w-0 flex-1 rounded-xl border border-[#EBEDF5] bg-client-field px-3 text-[13px] text-[#18333E] placeholder:text-[#98A4AF] focus:ring-2 focus:ring-primary/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={searching}
          className="flex h-11 items-center gap-1 rounded-xl bg-primary px-4 text-[13px] font-bold text-white hover:bg-primary-container disabled:opacity-60"
        >
          <Icon name="search" className="text-[18px]" />
          {searching ? text.searching : text.search}
        </button>
        <button
          type="button"
          onClick={useMyLocation}
          className="flex h-11 items-center gap-1 rounded-xl bg-[#E3F3EF] px-3 text-[13px] font-bold text-primary hover:bg-client-pale"
        >
          <Icon name="my_location" className="text-[18px]" /> {text.myLocation}
        </button>
      </div>

      {results && results.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-xl border border-client-line bg-white">
          {results.map((result) => (
            <li key={`${result.lat},${result.lon}`}>
              <button
                type="button"
                onClick={() => pick(result)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-[12px] text-client-ink hover:bg-client-field"
              >
                <Icon name="location_on" className="text-[16px] text-primary" />
                {result.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {message && <p className="mt-1 text-[12px] text-client-danger">{message}</p>}

      <div
        ref={containerRef}
        className="relative z-0 mt-2 h-72 w-full overflow-hidden rounded-xl border border-client-line"
      />
      <p className="mt-1 text-[11px] text-[#71838D]">
        {hasPoint ? text.hintWithPoint : text.hintNoPoint}
      </p>
    </div>
  );
}
