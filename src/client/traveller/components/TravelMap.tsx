import { type Ref, useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapPoint {
  id: string;
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
  userLocation?: [number, number] | null;
  onSelect?: (id: string) => void;
  /** Tâm mặc định khi chưa có điểm nào */
  center?: [number, number];
  className?: string;
  ref?: Ref<TravelMapHandle>;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

function pinIcon(label: string, active: boolean, visited: boolean): L.DivIcon {
  const size = active ? 42 : 34;
  const color = visited ? '#86969A' : active ? '#075C66' : '#12A99A';
  return L.divIcon({
    className: '',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;color:#fff;font-weight:800;font-size:${active ? 16 : 13}px;box-shadow:0 2px 6px rgba(0,0,0,.3)">${escapeHtml(label)}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const USER_ICON = L.divIcon({
  className: '',
  html: '<span style="display:block;width:18px;height:18px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.25)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/**
 * Bản đồ du khách (Leaflet + nền CARTO giống LocationPicker của đối tác).
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
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const fitAll = () => {
    const map = mapRef.current;
    const current = pointsRef.current;
    if (!map || current.length === 0) return;
    if (current.length === 1) {
      map.setView(current[0].coordinate, 14);
      return;
    }
    map.fitBounds(L.latLngBounds(current.map((point) => point.coordinate)), {
      padding: [40, 40],
    });
  };

  useImperativeHandle(ref, () => ({
    fitAll,
    focus: (coordinate, zoom = 14) => mapRef.current?.setView(coordinate, zoom),
  }));

  // Khởi tạo bản đồ một lần
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(center, 11);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      userMarkerRef.current = null;
    };
    // center chỉ dùng cho lần khởi tạo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vẽ lại ghim + đường nối
  const visitedKey = visitedIds.join(',');
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    const visited = new Set(visitedKey ? visitedKey.split(',') : []);
    if (route && points.length > 1) {
      L.polyline(
        points.map((point) => point.coordinate),
        { color: '#087E79', weight: 4, dashArray: '9 7' },
      ).addTo(layer);
    }
    points.forEach((point) => {
      const active = point.id === activeId;
      L.marker(point.coordinate, {
        icon: pinIcon(point.label, active, visited.has(point.id)),
        zIndexOffset: active ? 1000 : 0,
        title: point.title,
      })
        .bindTooltip(escapeHtml(point.title), { direction: 'top', offset: [0, -16] })
        .on('click', () => onSelectRef.current?.(point.id))
        .addTo(layer);
    });
  }, [points, activeId, visitedKey, route]);

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
    if (userMarkerRef.current) userMarkerRef.current.setLatLng(userLocation);
    else userMarkerRef.current = L.marker(userLocation, { icon: USER_ICON }).addTo(map);
  }, [userLocation]);

  return <div ref={containerRef} className={`z-0 w-full ${className}`} />;
}
