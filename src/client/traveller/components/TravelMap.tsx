
import {
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import maplibregl, {
  type GeoJSONSource,
} from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';

import { mapStyle } from '@/components/common/mapTypes';

// ======================================================
// KIỂU DỮ LIỆU ĐỊA ĐIỂM
// ======================================================

export interface MapPoint {
  id: string;

  /** [vĩ độ, kinh độ] */
  coordinate: [number, number];

  /** Số thứ tự hiển thị trên ghim */
  label: string;

  title: string;
}

// ======================================================
// CÁC HÀM ĐIỀU KHIỂN BẢN ĐỒ
// ======================================================

export interface TravelMapHandle {
  /** Thu/phóng để thấy tất cả địa điểm */
  fitAll: () => void;

  /** Di chuyển bản đồ tới một tọa độ */
  focus: (
    coordinate: [number, number],
    zoom?: number,
  ) => void;

  /** Hiển thị toàn bộ tuyến đường Goong */
  fitRoute: () => void;
}

// ======================================================
// PROPS
// ======================================================

interface TravelMapProps {
  points: MapPoint[];

  activeId?: string | null;

  /** Các địa điểm đã hoàn thành */
  visitedIds?: string[];

  /**
   * Đường nối minh họa giữa các địa điểm.
   * Không phải tuyến đường thực tế.
   */
  route?: boolean;

  /**
   * Tuyến Goong đã giải mã từ encoded polyline.
   * Định dạng [latitude, longitude][].
   */
  routeCoordinates?: [number, number][] | null;

  /**
   * Vị trí GPS hiện tại của Traveller.
   * Định dạng [latitude, longitude].
   */
  userLocation?: [number, number] | null;

  onSelect?: (id: string) => void;

  /**
   * Tâm bản đồ mặc định.
   * Định dạng [latitude, longitude].
   */
  center?: [number, number];

  className?: string;

  ref?: Ref<TravelMapHandle>;
}

// ======================================================
// MAP SOURCE / LAYER
// ======================================================

const ROUTE_SOURCE = 'travel-route';

const ROUTE_PREVIEW_LAYER =
  'travel-route-preview';

const ROUTE_DIRECTIONS_LAYER =
  'travel-route-directions';

// ======================================================
// CHUYỂN ĐỔI TỌA ĐỘ
// ======================================================

/**
 * Backend sử dụng [latitude, longitude].
 * MapLibre sử dụng [longitude, latitude].
 */
const toLngLat = (
  [lat, lng]: [number, number],
): [number, number] => [lng, lat];

// ======================================================
// TẠO MARKER ĐỊA ĐIỂM
// ======================================================

function pinElement(
  label: string,
  active: boolean,
  visited: boolean,
  title: string,
) {
  const size = active ? 42 : 34;

  const color = visited
    ? '#86969A'
    : active
      ? '#075C66'
      : '#12A99A';

  const pin = document.createElement('span');

  pin.textContent = label;
  pin.title = title;

  pin.style.cssText = `
    display:flex;
    align-items:center;
    justify-content:center;
    width:${size}px;
    height:${size}px;
    border-radius:50%;
    background:${color};
    border:3px solid #fff;
    color:#fff;
    font-weight:800;
    font-size:${active ? 16 : 13}px;
    box-shadow:0 2px 6px rgba(0,0,0,.3);
    cursor:pointer;
  `;

  return pin;
}

// ======================================================
// TẠO MARKER GPS CỦA TRAVELLER
// ======================================================

function userElement() {
  const dot = document.createElement('span');

  dot.style.cssText = `
    display:block;
    width:18px;
    height:18px;
    border-radius:50%;
    background:#2563EB;
    border:3px solid #fff;
    box-shadow:0 0 0 6px rgba(37,99,235,.25);
  `;

  return dot;
}

// ======================================================
// COMPONENT TRAVEL MAP
// ======================================================

/**
 * Bản đồ sử dụng Goong Map Tiles + MapLibre.
 *
 * Hỗ trợ:
 * - Địa điểm trong lịch trình.
 * - Địa điểm đang dẫn đường.
 * - Địa điểm đã tham quan.
 * - GPS hiện tại của Traveller.
 * - Tuyến Goong Directions thực tế.
 * - Đường nối minh họa ở các màn hình khác.
 */
export default function TravelMap({
                                    points,
                                    activeId = null,
                                    visitedIds = [],
                                    route = false,
                                    routeCoordinates = null,
                                    userLocation = null,
                                    onSelect,
                                    center = [16.05, 106.5],
                                    className = 'h-64',
                                    ref,
                                  }: TravelMapProps) {

  // ====================================================
  // REFS
  // ====================================================

  const containerRef =
    useRef<HTMLDivElement>(null);

  const mapRef =
    useRef<maplibregl.Map | null>(null);

  const markersRef =
    useRef<maplibregl.Marker[]>([]);

  const userMarkerRef =
    useRef<maplibregl.Marker | null>(null);

  const pointsRef = useRef(points);
  pointsRef.current = points;

  const routeRef = useRef(routeCoordinates);
  routeRef.current = routeCoordinates;

  const locationRef = useRef(userLocation);
  locationRef.current = userLocation;

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  /** Chỉ vẽ đường sau khi style bản đồ đã tải xong */
  const [ready, setReady] = useState(false);

  // ====================================================
  // HIỂN THỊ TẤT CẢ ĐỊA ĐIỂM
  // ====================================================

  const fitAll = () => {
    const map = mapRef.current;
    const current = pointsRef.current;

    if (!map || current.length === 0) {
      return;
    }

    if (current.length === 1) {
      map.jumpTo({
        center: toLngLat(current[0].coordinate),
        zoom: 14,
      });
      return;
    }

    const bounds = new maplibregl.LngLatBounds();

    current.forEach((point) => {
      bounds.extend(toLngLat(point.coordinate));
    });

    map.fitBounds(bounds, {
      padding: 40,
      maxZoom: 15,
      duration: 0,
    });
  };

  // ====================================================
  // HIỂN THỊ TOÀN BỘ TUYẾN GOONG
  // ====================================================

  const fitRoute = () => {
    const map = mapRef.current;

    if (!map) return;

    const coordinates = routeRef.current;

    if (!coordinates || coordinates.length < 2) {
      fitAll();
      return;
    }

    const bounds = new maplibregl.LngLatBounds();

    coordinates.forEach((coordinate) => {
      bounds.extend(toLngLat(coordinate));
    });

    if (locationRef.current) {
      bounds.extend(toLngLat(locationRef.current));
    }

    map.fitBounds(bounds, {
      padding: 55,
      maxZoom: 16,
      duration: 500,
    });
  };

  // ====================================================
  // CUNG CẤP HÀM ĐIỀU KHIỂN CHO COMPONENT CHA
  // ====================================================

  useImperativeHandle(ref, () => ({
    fitAll,
    fitRoute,

    focus: (
      coordinate,
      zoom = 14,
    ) => {
      mapRef.current?.flyTo({
        center: toLngLat(coordinate),
        zoom,
      });
    },
  }));

  // ====================================================
  // KHỞI TẠO BẢN ĐỒ GOONG
  // ====================================================

  useEffect(() => {

    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,

      style: mapStyle(),

      center: toLngLat(center),

      zoom: 11,

      scrollZoom: false,

      attributionControl: {
        compact: true,
      },
    });

    // Nút thu phóng góc trên bên phải.
    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
      }),
      'top-right',
    );

    // Đợi Goong Map Style tải xong.
    map.on('load', () => {

      // GeoJSON chứa tọa độ tuyến đường.
      map.addSource(ROUTE_SOURCE, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // ------------------------------------------
      // LAYER 1 — ĐƯỜNG NỐI MINH HỌA
      // ------------------------------------------

      map.addLayer({
        id: ROUTE_PREVIEW_LAYER,

        type: 'line',

        source: ROUTE_SOURCE,

        paint: {
          'line-color': '#087E79',
          'line-width': 4,
          'line-dasharray': [2.2, 1.7],
        },

        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: 'none',
        },
      });

      // ------------------------------------------
      // LAYER 2 — TUYẾN GOONG THỰC TẾ
      // ------------------------------------------

      map.addLayer({
        id: ROUTE_DIRECTIONS_LAYER,

        type: 'line',

        source: ROUTE_SOURCE,

        paint: {
          'line-color': '#087E79',
          'line-width': 5,
          'line-opacity': 0.95,
        },

        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: 'none',
        },
      });

      setReady(true);
    });

    mapRef.current = map;

    // Xóa bản đồ khi component bị unmount.
    return () => {

      map.remove();

      mapRef.current = null;

      markersRef.current = [];

      userMarkerRef.current = null;

      setReady(false);
    };

    // center chỉ được sử dụng lúc khởi tạo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====================================================
  // HIỂN THỊ MARKER CÁC ĐỊA ĐIỂM
  // ====================================================

  const visitedKey = visitedIds.join(',');

  useEffect(() => {

    const map = mapRef.current;

    if (!map) return;

    // Xóa các marker cũ.
    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    const visited = new Set(
      visitedKey
        ? visitedKey.split(',')
        : [],
    );

    // Ghim đang được chọn sẽ hiển thị phía trên.
    const ordered = [...points].sort(
      (a, b) =>
        Number(a.id === activeId) -
        Number(b.id === activeId),
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

      return new maplibregl.Marker({
        element,
      })
        .setLngLat(toLngLat(point.coordinate))
        .addTo(map);
    });

  }, [
    points,
    activeId,
    visitedKey,
  ]);

  // ====================================================
  // VẼ TUYẾN ĐƯỜNG
  // ====================================================

  useEffect(() => {

    const map = mapRef.current;

    const source = map?.getSource(
      ROUTE_SOURCE,
    ) as GeoJSONSource | undefined;

    if (!ready || !map || !source) {
      return;
    }

    // Tuyến Goong được ưu tiên hơn đường minh họa.
    const isGoongRoute = Boolean(
      routeCoordinates &&
      routeCoordinates.length > 1,
    );

    const coordinates = isGoongRoute
      ? routeCoordinates!.map(toLngLat)

      : route && points.length > 1
        ? points.map((point) =>
          toLngLat(point.coordinate),
        )

        : [];

    // Cập nhật GeoJSON.
    source.setData({
      type: 'FeatureCollection',

      features:
        coordinates.length > 1
          ? [
            {
              type: 'Feature',
              properties: {},

              geometry: {
                type: 'LineString',
                coordinates,
              },
            },
          ]
          : [],
    });

    // Hiển thị đường nối minh họa khi không có tuyến Goong.
    map.setLayoutProperty(
      ROUTE_PREVIEW_LAYER,
      'visibility',

      coordinates.length > 1 && !isGoongRoute
        ? 'visible'
        : 'none',
    );

    // Hiển thị đường Goong thực tế.
    map.setLayoutProperty(
      ROUTE_DIRECTIONS_LAYER,
      'visibility',

      isGoongRoute
        ? 'visible'
        : 'none',
    );

  }, [
    ready,
    route,
    routeCoordinates,
    points,
  ]);

  // ====================================================
  // TỰ ĐỘNG CĂN BẢN ĐỒ KHI ĐỔI DANH SÁCH ĐỊA ĐIỂM
  // ====================================================

  const pointsKey = points
    .map((point) => point.id)
    .join(',');

  useEffect(() => {
    fitAll();
  }, [pointsKey]);

  // ====================================================
  // HIỂN THỊ VỊ TRÍ GPS HIỆN TẠI
  // ====================================================

  useEffect(() => {

    const map = mapRef.current;

    if (!map) return;

    // Nếu không có GPS, xóa marker người dùng.
    if (!userLocation) {

      userMarkerRef.current?.remove();

      userMarkerRef.current = null;

      return;
    }

    // Nếu marker đã tồn tại, cập nhật vị trí mới.
    if (userMarkerRef.current) {

      userMarkerRef.current.setLngLat(
        toLngLat(userLocation),
      );

    } else {

      // Tạo marker GPS lần đầu.
      userMarkerRef.current = new maplibregl.Marker({
        element: userElement(),
      })
        .setLngLat(toLngLat(userLocation))
        .addTo(map);
    }

  }, [userLocation]);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div
      ref={containerRef}
      className={`z-0 w-full overflow-hidden ${className}`}
    />
  );
}
