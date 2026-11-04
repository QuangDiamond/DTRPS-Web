import { type Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import maplibregl, { type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mapStyle } from '@/components/common/mapTypes';

export interface MapPoint {
  id: string;
  /** [vĩ độ, kinh độ] */
  coordinate: [number, number];
  /** Chữ trong ghim, thường là số thứ tự */
  label: string;
  title: string;
}

export interface TravelMapHandle {
  /** Thu/phóng để thấy mọi điểm */
  fitAll: () => void;
  focus: (coordinate: [number, number], zoom?: number) => void;
}

interface TravelMapProps {
  points: MapPoint[];
  activeId?: string | null;
  /** Điểm đã đi qua — ghim màu xám */
  visitedIds?: string[];
  /** Nối các điểm bằng đường nét đứt (minh hoạ, không bám đường phố) */
  route?: boolean;
  /** [vĩ độ, kinh độ] */
  userLocation?: [number, number] | null;
  onSelect?: (id: string) => void;
  /** Tâm mặc định khi chưa có điểm nào — [vĩ độ, kinh độ] */
  center?: [number, number];
  className?: string;
  ref?: Ref<TravelMapHandle>;
}

const ROUTE_SOURCE = 'travel-route';

/** [vĩ độ, kinh độ] → [kinh độ, vĩ độ] theo MapLibre */
const toLngLat = ([lat, lng]: [number, number]): [number, number] => [lng, lat];

function pinElement(label: string, active: boolean, visited: boolean, title: string) {
  const size = active ? 42 : 34;
  const color = visited ? '#86969A' : active ? '#075C66' : '#12A99A';
  const pin = document.createElement('span');
  pin.textContent = label;
  pin.title = title;
  pin.style.cssText = `display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;color:#fff;font-weight:800;font-size:${active ? 16 : 13}px;box-shadow:0 2px 6px rgba(0,0,0,.3);cursor:pointer`;
  return pin;
}

function userElement() {
  const dot = document.createElement('span');
  dot.style.cssText =
    'display:block;width:18px;height:18px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.25)';
  return dot;
}

/**
 * Bản đồ du khách trên nền Goong (MapLibre) — cùng nền với bản đồ admin.
 * Dùng cho Gợi ý điểm đến, Chi tiết điểm đến và Theo dõi hành trình.
 */
export default function TravelMap({
  points,
  activeId = null,
  visitedIds = [],
  route = false,
  userLocation = null,
  onSelect,
  center = [16.05, 106.5],
  className = 'h-64',
  ref,
}: TravelMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  /** Style đã tải xong — mới thêm được lớp đường nối */
  const [ready, setReady] = useState(false);

  const fitAll = () => {
    const map = mapRef.current;
    const current = pointsRef.current;
    if (!map || current.length === 0) return;
    if (current.length === 1) {
      map.jumpTo({ center: toLngLat(current[0].coordinate), zoom: 14 });
      return;
    }
    const bounds = new maplibregl.LngLatBounds();
    current.forEach((point) => bounds.extend(toLngLat(point.coordinate)));
    map.fitBounds(bounds, { padding: 40, maxZoom: 15, duration: 0 });
  };

  useImperativeHandle(ref, () => ({
    fitAll,
    focus: (coordinate, zoom = 14) => mapRef.current?.flyTo({ center: toLngLat(coordinate), zoom }),
  }));

  // Khởi tạo bản đồ một lần
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle(),
      center: toLngLat(center),
      zoom: 11,
      scrollZoom: false,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => {
      map.addSource(ROUTE_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: ROUTE_SOURCE,
        type: 'line',
        source: ROUTE_SOURCE,
        paint: { 'line-color': '#087E79', 'line-width': 4, 'line-dasharray': [2.2, 1.7] },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });
      setReady(true);
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      userMarkerRef.current = null;
      setReady(false);
    };
    // center chỉ dùng cho lần khởi tạo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vẽ lại ghim
  const visitedKey = visitedIds.join(',');
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    const visited = new Set(visitedKey ? visitedKey.split(',') : []);
    // Ghim đang chọn vẽ sau cùng để nằm trên
    const ordered = [...points].sort(
      (a, b) => Number(a.id === activeId) - Number(b.id === activeId),
    );
    markersRef.current = ordered.map((point) => {
      const element = pinElement(
        point.label,
        point.id === activeId,
        visited.has(point.id),
        point.title,
      );
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        onSelectRef.current?.(point.id);
      });
      return new maplibregl.Marker({ element }).setLngLat(toLngLat(point.coordinate)).addTo(map);
    });
  }, [points, activeId, visitedKey]);

  // Đường nối các điểm
  useEffect(() => {
    const source = mapRef.current?.getSource(ROUTE_SOURCE) as GeoJSONSource | undefined;
    if (!ready || !source) return;
    source.setData({
      type: 'FeatureCollection',
      features:
        route && points.length > 1
          ? [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: points.map((point) => toLngLat(point.coordinate)),
                },
              },
            ]
          : [],
    });
  }, [ready, route, points]);

  // Danh sách điểm đổi (lọc danh mục, đổi ngày) → căn lại khung nhìn
  const pointsKey = points.map((point) => point.id).join(',');
  useEffect(() => {
    fitAll();
  }, [pointsKey]);

  // Vị trí của người dùng
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!userLocation) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }
    if (userMarkerRef.current) userMarkerRef.current.setLngLat(toLngLat(userLocation));
    else
      userMarkerRef.current = new maplibregl.Marker({ element: userElement() })
        .setLngLat(toLngLat(userLocation))
        .addTo(map);
  }, [userLocation]);

  return <div ref={containerRef} className={`z-0 w-full overflow-hidden ${className}`} />;
}
