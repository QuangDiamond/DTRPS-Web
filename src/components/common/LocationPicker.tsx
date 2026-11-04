import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Icon from './Icon';
import {
  type AddressSuggestion,
  type MapSearch,
  mapStyle,
  pinElement,
  round6,
  VIETNAM_CENTER,
} from './mapTypes';

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
  pinAddress: string;
  useAddress: string;
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
  pinAddress: 'Địa chỉ tại ghim',
  useAddress: 'Dùng địa chỉ này',
};

const SEARCH_DELAY_MS = 350;

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  /** Gợi ý ô tìm kiếm ban đầu (địa chỉ đã nhập) */
  address: string;
  onChange: (latitude: number, longitude: number) => void;
  /** Tìm địa chỉ qua backend (Goong) — mỗi khu truyền service của mình */
  search: MapSearch;
  /** Có thì hiện nút "Dùng địa chỉ này" để điền địa chỉ Goong vào form */
  onAddress?: (address: string) => void;
  labels?: Partial<LocationPickerLabels>;
}

/**
 * Chọn vị trí địa điểm trên bản đồ Goong: gõ để tìm địa chỉ, bấm lên bản đồ hoặc kéo ghim.
 * Tọa độ được điền ngược lại vào form. Dùng chung cho form đối tác và form admin.
 */
export default function LocationPicker({
  latitude,
  longitude,
  address,
  onChange,
  search,
  onAddress,
  labels,
}: LocationPickerProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const searchRef = useRef(search);
  searchRef.current = search;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AddressSuggestion[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');
  const [pinAddress, setPinAddress] = useState<string | null>(null);
  /** Chỉ tìm địa chỉ của ghim khi người dùng tự đặt ghim (không phải khi mở form có sẵn tọa độ) */
  const lookupPin = useRef(false);

  const hasPoint = latitude !== null && longitude !== null;

  const choose = (lat: number, lng: number, findAddress: boolean) => {
    lookupPin.current = findAddress;
    onChangeRef.current(round6(lat), round6(lng));
  };

  // Khởi tạo bản đồ một lần
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle(),
      center: VIETNAM_CENTER,
      zoom: 4.5,
      scrollZoom: false,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('click', (event) => choose(event.lngLat.lat, event.lngLat.lng, true));
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
      setPinAddress(null);
      return;
    }
    const point: [number, number] = [longitude, latitude];
    if (!markerRef.current) {
      const marker = new maplibregl.Marker({
        element: pinElement(),
        draggable: true,
        anchor: 'bottom',
      })
        .setLngLat(point)
        .addTo(map);
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLngLat();
        choose(lat, lng, true);
      });
      markerRef.current = marker;
      map.jumpTo({ center: point, zoom: Math.max(map.getZoom(), 16) });
    } else {
      markerRef.current.setLngLat(point);
      if (!map.getBounds().contains(point)) map.panTo(point);
    }
  }, [latitude, longitude]);

  // Địa chỉ tại ghim (Goong) để người dùng điền nhanh vào ô địa chỉ
  useEffect(() => {
    if (!onAddress || !lookupPin.current || latitude === null || longitude === null) return;
    let active = true;
    const timer = window.setTimeout(() => {
      searchRef.current
        .reverse(latitude, longitude)
        .then((found) => active && setPinAddress(found.address || null))
        .catch(() => active && setPinAddress(null));
    }, SEARCH_DELAY_MS);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [latitude, longitude, onAddress]);

  // Gợi ý theo từng chữ gõ (chờ người dùng ngừng gõ một chút)
  useEffect(() => {
    const wanted = query.trim();
    if (wanted.length < 2) {
      setResults(null);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setSearching(true);
      setMessage('');
      searchRef.current
        .autocomplete(
          wanted,
          latitude !== null && longitude !== null ? { latitude, longitude } : undefined,
        )
        .then((found) => {
          if (!active) return;
          setResults(found);
          if (found.length === 0) setMessage(text.notFound);
        })
        .catch(() => active && setMessage(text.searchFailed))
        .finally(() => active && setSearching(false));
    }, SEARCH_DELAY_MS);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
    // Chỉ chạy lại khi từ khóa đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const searchNow = () => {
    const wanted = (query || address).trim();
    if (!wanted) {
      setMessage(text.emptyQuery);
      return;
    }
    setQuery(wanted === query ? `${wanted} ` : wanted);
  };

  const pick = async (result: AddressSuggestion) => {
    setResults(null);
    setMessage('');
    try {
      const found = await search.place(result.placeId);
      choose(found.latitude, found.longitude, false);
      setPinAddress(found.address || result.description);
      mapRef.current?.jumpTo({ center: [found.longitude, found.latitude], zoom: 17 });
    } catch {
      setMessage(text.searchFailed);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setMessage(text.noGeolocation);
      return;
    }
    setMessage('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        choose(position.coords.latitude, position.coords.longitude, true);
        mapRef.current?.jumpTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 17,
        });
      },
      () => setMessage(text.geolocationDenied),
    );
  };

  return (
    <div className="mb-4">
      <p className="mb-2 text-[13px] font-semibold text-client-ink">{text.title}</p>
      <div className="relative">
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                searchNow();
              }
            }}
            placeholder={address || text.searchPlaceholder}
            className="h-11 min-w-0 flex-1 rounded-xl border border-[#EBEDF5] bg-client-field px-3 text-[13px] text-[#18333E] placeholder:text-[#98A4AF] focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={searchNow}
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
          <ul className="absolute top-12 right-0 left-0 z-20 overflow-hidden rounded-xl border border-client-line bg-white shadow-lg">
            {results.map((result) => (
              <li key={result.placeId}>
                <button
                  type="button"
                  onClick={() => void pick(result)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-client-field"
                >
                  <Icon name="location_on" className="mt-0.5 text-[16px] text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-client-ink">
                      {result.title}
                    </span>
                    {result.subtitle && (
                      <span className="block truncate text-[11px] text-client-muted">
                        {result.subtitle}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {message && <p className="mt-1 text-[12px] text-client-danger">{message}</p>}

      <div
        ref={containerRef}
        className="relative z-0 mt-2 h-80 w-full overflow-hidden rounded-xl border border-client-line"
      />
      {onAddress && pinAddress && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-client-field px-3 py-2 text-[12px] text-client-ink">
          <Icon name="pin_drop" className="text-[16px] text-primary" />
          <span className="min-w-0 flex-1">
            <span className="text-client-muted">{text.pinAddress}:</span> {pinAddress}
          </span>
          {pinAddress !== address && (
            <button
              type="button"
              onClick={() => onAddress(pinAddress)}
              className="font-bold text-[#007A73] hover:underline"
            >
              {text.useAddress}
            </button>
          )}
        </div>
      )}
      <p className="mt-1 text-[11px] text-[#71838D]">
        {hasPoint ? text.hintWithPoint : text.hintNoPoint}
      </p>
    </div>
  );
}
