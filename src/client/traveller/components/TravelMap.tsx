
import {
  type Ref,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import maplibregl, {
  type GeoJSONSource,
} from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';

import { mapStyle } from '@/components/common/mapTypes';

import {
  circleRing,
  distanceBetween,
} from '@/client/traveller/navigation/geo';

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

/** Một tuyến đường kèm nhãn thời gian/km vẽ trực tiếp trên bản đồ giống Google Maps */
export interface RouteOptionOverlay {
  index: number;
  coordinates: [number, number][];
  durationLabel: string;
  distanceLabel: string;
  diffLabel?: string;
  selected: boolean;
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

  /** Thu/phóng vừa khít một tập tọa độ tùy chọn (vd. cụm cây xăng gần) */
  fitPoints: (targets: [number, number][]) => void;
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

  /** Hướng di chuyển (độ từ hướng Bắc); hiện mũi tên trên chấm GPS. */
  userHeading?: number | null;

  /** Sai số GPS (mét); vẽ vòng tròn quanh chấm GPS. */
  userAccuracy?: number | null;

  /**
   * Chế độ dẫn đường: camera bám theo vị trí và xoay theo hướng đi.
   * Tự tắt khi người dùng kéo/xoay/thu phóng bản đồ (xem onUserInteract).
   */
  followUser?: boolean;

  /** Người dùng tự thao tác lên bản đồ (kéo, xoay, thu phóng). */
  onUserInteract?: () => void;

  /**
   * Phần tuyến đã đi: đoạn [segmentIndex, segmentIndex + 1] chứa `point`.
   * Phần trước đó vẽ màu xám, phần còn lại vẽ màu chính.
   */
  routeProgress?: {
    segmentIndex: number;
    point: [number, number];
  } | null;

  /** Cho người dùng bấm lên bản đồ để chọn một vị trí (xem onPick). */
  pickMode?: boolean;

  onPick?: (coordinate: [number, number]) => void;

  /** Hiện nút la bàn để quay về hướng Bắc. */
  showCompass?: boolean;

  onSelect?: (id: string) => void;

  /**
   * Tâm bản đồ mặc định.
   * Định dạng [latitude, longitude].
   */
  center?: [number, number];

  /** Bật chế độ ảnh vệ tinh (Satellite). */
  satellite?: boolean;

  /** Toàn bộ tuyến (đang chọn + thay thế) để vẽ đồng thời kèm nhãn thời gian giống Google Maps. */
  routeOptions?: RouteOptionOverlay[];

  /** Gọi khi người dùng bấm trực tiếp vào nhãn thời gian của 1 tuyến trên bản đồ. */
  onSelectRouteOption?: (index: number) => void;

  className?: string;

  ref?: Ref<TravelMapHandle>;
}

// ======================================================
// MAP SOURCE / LAYER
// ======================================================

const ROUTE_SOURCE = 'travel-route';

const ALT_ROUTES_SOURCE = 'travel-alt-routes';

const ALT_ROUTES_CASING_LAYER = 'travel-alt-routes-casing';

const ALT_ROUTES_LINE_LAYER = 'travel-alt-routes-line';

const ROUTE_PREVIEW_LAYER =
  'travel-route-preview';

const ROUTE_DIRECTIONS_LAYER =
  'travel-route-directions';

/** Phần tuyến đã đi. */
const ROUTE_DONE_LAYER =
  'travel-route-done';

const ACCURACY_SOURCE = 'user-accuracy';

const ACCURACY_FILL_LAYER =
  'user-accuracy-fill';

const ACCURACY_LINE_LAYER =
  'user-accuracy-line';

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
      ? '#0E7490'
      : '#0891B2';

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

/**
 * Chấm xanh kèm mũi tên chỉ hướng đi (ẩn khi chưa biết hướng).
 * Marker được xoay bằng setRotation, vòng tròn xoay vẫn là vòng tròn.
 */
function userElement() {
  const wrapper = document.createElement('span');

  wrapper.style.cssText = `
    position:relative;
    display:block;
    width:22px;
    height:22px;
  `;

  const arrow = document.createElement('span');

  arrow.style.cssText = `
    position:absolute;
    left:50%;
    top:-15px;
    transform:translateX(-50%);
    width:0;
    height:0;
    border-left:7px solid transparent;
    border-right:7px solid transparent;
    border-bottom:14px solid #2563EB;
    display:none;
  `;

  const dot = document.createElement('span');

  dot.style.cssText = `
    display:block;
    box-sizing:border-box;
    width:22px;
    height:22px;
    border-radius:50%;
    background:#2563EB;
    border:3px solid #fff;
    box-shadow:0 0 0 4px rgba(37,99,235,.25);
  `;

  wrapper.append(arrow, dot);

  return { wrapper, arrow };
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
/** Tìm điểm đặt nhãn thời gian trên tuyến phụ sao cho xa tuyến đang chọn nhất (tránh đè nhãn). */
function pickRouteLabelAnchor(
  coords: [number, number][],
  reference: [number, number][],
): [number, number] | null {
  if (coords.length === 0) return null;
  if (coords.length < 3) return coords[0];
  const start = Math.floor(coords.length * 0.2);
  const end = Math.max(start + 1, Math.floor(coords.length * 0.8));
  if (reference.length === 0) return coords[Math.floor(coords.length * 0.5)];

  const refStep = Math.max(1, Math.floor(reference.length / 25));
  const refSample: [number, number][] = [];
  for (let i = 0; i < reference.length; i += refStep) refSample.push(reference[i]);

  const step = Math.max(1, Math.floor((end - start) / 25));
  let best = coords[Math.floor((start + end) / 2)];
  let bestMinDist = -1;
  for (let i = start; i <= end; i += step) {
    const p = coords[i];
    let minDist = Infinity;
    for (const r of refSample) {
      const d = distanceBetween(p, r);
      if (d < minDist) minDist = d;
    }
    if (minDist > bestMinDist) {
      bestMinDist = minDist;
      best = p;
    }
  }
  return best;
}

/** Tạo phần tử DOM cho nhãn hộp thời gian + km gắn trực tiếp lên tuyến đường giống Google Maps. */
function routeBadgeElement(opt: RouteOptionOverlay, onSelect: () => void): HTMLElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.style.cssText = [
    'display:flex',
    'flex-direction:column',
    'align-items:flex-start',
    'padding:4px 9px',
    'border-radius:10px',
    'cursor:pointer',
    'line-height:1.2',
    'white-space:nowrap',
    'box-shadow:0 3px 10px rgba(15,42,59,0.22)',
    opt.selected
      ? 'background:#0E7490;color:#FFFFFF;border:1.5px solid #FFFFFF'
      : 'background:#FFFFFF;color:#13364A;border:1.5px solid #CBD5E1',
  ].join(';');

  const top = document.createElement('span');
  top.textContent = opt.durationLabel;
  top.style.cssText = 'font-size:11.5px;font-weight:800';

  const sub = document.createElement('span');
  sub.textContent = opt.diffLabel ? `${opt.distanceLabel} · ${opt.diffLabel}` : opt.distanceLabel;
  sub.style.cssText = `font-size:10px;font-weight:600;color:${opt.selected ? '#CCFBF1' : '#64748B'}`;

  button.appendChild(top);
  button.appendChild(sub);
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onSelect();
  });
  return button;
}

export default function TravelMap({
                                    points,
                                    activeId = null,
                                    visitedIds = [],
                                    route = false,
                                    routeCoordinates = null,
                                    userLocation = null,
                                    userHeading = null,
                                    userAccuracy = null,
                                    followUser = false,
                                    onUserInteract,
                                    routeProgress = null,
                                    pickMode = false,
                                    onPick,
                                    showCompass = false,
                                    onSelect,
                                    center = [16.05, 106.5],
                                    satellite = false,
                                    routeOptions,
                                    onSelectRouteOption,
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

  const routeBadgeMarkersRef =
    useRef<maplibregl.Marker[]>([]);

  const onSelectRouteOptionRef = useRef(onSelectRouteOption);
  onSelectRouteOptionRef.current = onSelectRouteOption;

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

  const userArrowRef =
    useRef<HTMLSpanElement | null>(null);

  const onUserInteractRef = useRef(onUserInteract);
  onUserInteractRef.current = onUserInteract;

  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  const pickModeRef = useRef(pickMode);
  pickModeRef.current = pickMode;

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

    // Chỉ đưa GPS vào khung nhìn khi nó ở gần tuyến. GPS sai (ví dụ ở nước
    // khác) sẽ kéo bản đồ thu nhỏ ra cả thế giới.
    const user = locationRef.current;

    if (
      user &&
      coordinates.some(
        (coordinate) =>
          distanceBetween(coordinate, user) < 30_000,
      )
    ) {
      bounds.extend(toLngLat(user));
    }

    map.fitBounds(bounds, {
      padding: 55,
      maxZoom: 16,
      duration: 500,
      bearing: 0,
      pitch: 0,
    });
  };

  const fitPoints = (targets: [number, number][]) => {
    const map = mapRef.current;
    if (!map || targets.length === 0) return;
    if (targets.length === 1) {
      map.easeTo({
        center: toLngLat(targets[0]),
        zoom: 15,
        duration: 450,
        bearing: 0,
        pitch: 0,
      });
      return;
    }
    const bounds = new maplibregl.LngLatBounds();
    targets.forEach((coord) => bounds.extend(toLngLat(coord)));
    map.fitBounds(bounds, {
      padding: 60,
      maxZoom: 16,
      duration: 450,
      bearing: 0,
      pitch: 0,
    });
  };

  // ====================================================
  // CUNG CẤP HÀM ĐIỀU KHIỂN CHO COMPONENT CHA
  // ====================================================

  useImperativeHandle(ref, () => ({
    fitAll,
    fitRoute,
    fitPoints,

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

      style: mapStyle(satellite),

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
        showCompass,
        visualizePitch: false,
      }),
      'top-right',
    );

    // Người dùng tự kéo/xoay/thu phóng: dừng chế độ bám theo.
    // Chuyển động do mã (easeTo) không có originalEvent nên không bị tính.
    const userMoved = (event: { originalEvent?: unknown }) => {
      if (event.originalEvent) {
        onUserInteractRef.current?.();
      }
    };

    map.on('dragstart', userMoved);
    map.on('rotatestart', userMoved);
    map.on('zoomstart', userMoved);

    // Chế độ chọn vị trí trên bản đồ.
    map.on('click', (event) => {
      if (pickModeRef.current) {
        onPickRef.current?.([
          event.lngLat.lat,
          event.lngLat.lng,
        ]);
      }
    });

    // Đợi Goong Map Style tải xong.
    map.on('load', () => {

      // GeoJSON chứa các tuyến đường thay thế (vẽ dưới tuyến chính).
      map.addSource(ALT_ROUTES_SOURCE, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: ALT_ROUTES_CASING_LAYER,
        type: 'line',
        source: ALT_ROUTES_SOURCE,
        paint: {
          'line-color': '#475569',
          'line-width': 7.5,
          'line-opacity': 0.55,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      map.addLayer({
        id: ALT_ROUTES_LINE_LAYER,
        type: 'line',
        source: ALT_ROUTES_SOURCE,
        paint: {
          'line-color': '#BAE6FD',
          'line-width': 5,
          'line-opacity': 0.92,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

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

        filter: ['==', ['get', 'part'], 'preview'],

        paint: {
          'line-color': '#0891B2',
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

        filter: ['==', ['get', 'part'], 'todo'],

        paint: {
          'line-color': '#0891B2',
          'line-width': 5,
          'line-opacity': 0.95,
        },

        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: 'none',
        },
      });

      // ------------------------------------------
      // LAYER 3 — PHẦN TUYẾN ĐÃ ĐI (màu xám)
      // ------------------------------------------

      map.addLayer(
        {
          id: ROUTE_DONE_LAYER,

          type: 'line',

          source: ROUTE_SOURCE,

          filter: ['==', ['get', 'part'], 'done'],

          paint: {
            'line-color': '#9AA9AE',
            'line-width': 5,
            'line-opacity': 0.9,
          },

          layout: {
            'line-cap': 'round',
            'line-join': 'round',
            visibility: 'none',
          },
        },
        // Nằm dưới phần tuyến còn lại.
        ROUTE_DIRECTIONS_LAYER,
      );

      // ------------------------------------------
      // VÒNG TRÒN SAI SỐ GPS
      // ------------------------------------------

      map.addSource(ACCURACY_SOURCE, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.addLayer({
        id: ACCURACY_FILL_LAYER,
        type: 'fill',
        source: ACCURACY_SOURCE,
        paint: {
          'fill-color': '#2563EB',
          'fill-opacity': 0.12,
        },
      });

      map.addLayer({
        id: ACCURACY_LINE_LAYER,
        type: 'line',
        source: ACCURACY_SOURCE,
        paint: {
          'line-color': '#2563EB',
          'line-opacity': 0.35,
          'line-width': 1,
        },
      });

      setReady(true);
    });

    mapRef.current = map;

    // Tự co giãn bản đồ khi khung chứa đổi kích thước (vào/ra toàn màn hình, ẩn/hiện panel).
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => map.resize());

    resizeObserver?.observe(containerRef.current);

    // Xóa bản đồ khi component bị unmount.
    return () => {

      resizeObserver?.disconnect();

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

  // Chuyển [lat, lng] sang [lng, lat] một lần mỗi khi tuyến đổi,
  // không làm lại ở mỗi lần GPS cập nhật.
  const routeLngLat = useMemo(
    () =>
      routeCoordinates && routeCoordinates.length > 1
        ? routeCoordinates.map(toLngLat)
        : null,
    [routeCoordinates],
  );

  useEffect(() => {

    const map = mapRef.current;

    const source = map?.getSource(
      ROUTE_SOURCE,
    ) as GeoJSONSource | undefined;

    if (!ready || !map || !source) {
      return;
    }

    const line = (
      part: 'preview' | 'todo' | 'done',
      coordinates: [number, number][],
    ) => ({
      type: 'Feature' as const,
      properties: { part },
      geometry: {
        type: 'LineString' as const,
        coordinates,
      },
    });

    // Tuyến Goong được ưu tiên hơn đường minh họa.
    const isGoongRoute = routeLngLat !== null;

    const features = [];

    if (routeLngLat) {

      if (routeProgress) {
        const index = Math.min(
          Math.max(routeProgress.segmentIndex, 0),
          routeLngLat.length - 2,
        );

        const point = toLngLat(routeProgress.point);

        const done = [
          ...routeLngLat.slice(0, index + 1),
          point,
        ];

        const todo = [
          point,
          ...routeLngLat.slice(index + 1),
        ];

        if (done.length > 1) {
          features.push(line('done', done));
        }

        features.push(line('todo', todo));

      } else {
        features.push(line('todo', routeLngLat));
      }

    } else if (route && points.length > 1) {

      // Đường nối minh họa khi không có tuyến Goong.
      features.push(
        line(
          'preview',
          points.map((point) =>
            toLngLat(point.coordinate),
          ),
        ),
      );
    }

    source.setData({
      type: 'FeatureCollection',
      features,
    });

    map.setLayoutProperty(
      ROUTE_PREVIEW_LAYER,
      'visibility',

      features.length > 0 && !isGoongRoute
        ? 'visible'
        : 'none',
    );

    map.setLayoutProperty(
      ROUTE_DIRECTIONS_LAYER,
      'visibility',

      isGoongRoute
        ? 'visible'
        : 'none',
    );

    map.setLayoutProperty(
      ROUTE_DONE_LAYER,
      'visibility',

      isGoongRoute
        ? 'visible'
        : 'none',
    );

  }, [
    ready,
    route,
    routeLngLat,
    routeProgress,
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

      userArrowRef.current = null;

      return;
    }

    // Nếu marker đã tồn tại, cập nhật vị trí mới.
    if (userMarkerRef.current) {

      userMarkerRef.current.setLngLat(
        toLngLat(userLocation),
      );

    } else {

      // Tạo marker GPS lần đầu.
      const { wrapper, arrow } = userElement();

      userArrowRef.current = arrow;

      userMarkerRef.current = new maplibregl.Marker({
        element: wrapper,
        // Quay theo hướng thật (so với hướng Bắc), kể cả khi bản đồ đang xoay.
        rotationAlignment: 'map',
      })
        .setLngLat(toLngLat(userLocation))
        .addTo(map);
    }

    // Mũi tên chỉ hướng đi.
    if (userArrowRef.current) {
      userArrowRef.current.style.display =
        userHeading === null ? 'none' : 'block';
    }

    if (userHeading !== null) {
      userMarkerRef.current.setRotation(userHeading);
    }

  }, [userLocation, userHeading]);

  // ====================================================
  // VÒNG TRÒN SAI SỐ GPS
  // ====================================================

  useEffect(() => {

    const map = mapRef.current;

    const source = map?.getSource(
      ACCURACY_SOURCE,
    ) as GeoJSONSource | undefined;

    if (!ready || !map || !source) {
      return;
    }

    // Sai số rất lớn không vẽ hết, tránh một vòng tròn phủ cả thành phố.
    const radius =
      userAccuracy && userAccuracy > 0
        ? Math.min(userAccuracy, 2_000)
        : 0;

    source.setData({
      type: 'FeatureCollection',

      features:
        userLocation && radius >= 5
          ? [
            {
              type: 'Feature',
              properties: {},

              geometry: {
                type: 'Polygon',
                coordinates: [
                  circleRing(userLocation, radius),
                ],
              },
            },
          ]
          : [],
    });

  }, [ready, userLocation, userAccuracy]);

  // ====================================================
  // CHẾ ĐỘ BÁM THEO NGƯỜI DÙNG (DẪN ĐƯỜNG)
  // ====================================================

  useEffect(() => {

    const map = mapRef.current;

    if (!map || !followUser || !userLocation) {
      return;
    }

    map.easeTo({
      center: toLngLat(userLocation),

      zoom: Math.max(map.getZoom(), 16),

      // Chưa biết hướng thì giữ nguyên hướng hiện tại, tránh xoay lung tung.
      bearing: userHeading ?? map.getBearing(),

      duration: 700,

      essential: true,
    });

  }, [followUser, userLocation, userHeading]);

  // ====================================================
  // VẼ ĐỒNG THỜI CÁC TUYẾN THAY THẾ & NHÃN HỘP THỜI GIAN
  // ====================================================

  useEffect(() => {
    const map = mapRef.current;

    routeBadgeMarkersRef.current.forEach((marker) => marker.remove());
    routeBadgeMarkersRef.current = [];

    if (!map || !ready) return;

    const altSource = map.getSource(ALT_ROUTES_SOURCE) as GeoJSONSource | undefined;
    if (!routeOptions || routeOptions.length < 2) {
      altSource?.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const features = routeOptions
      .filter((opt) => !opt.selected && opt.coordinates.length >= 2)
      .map((opt) => ({
        type: 'Feature' as const,
        properties: { index: opt.index },
        geometry: {
          type: 'LineString' as const,
          coordinates: opt.coordinates.map(toLngLat),
        },
      }));
    altSource?.setData({ type: 'FeatureCollection', features });

    const selectedCoords =
      routeOptions.find((o) => o.selected)?.coordinates ?? routeOptions[0].coordinates;

    for (const opt of routeOptions) {
      const anchor = opt.selected
        ? opt.coordinates[Math.floor(opt.coordinates.length * 0.5)]
        : pickRouteLabelAnchor(opt.coordinates, selectedCoords);
      if (!anchor) continue;
      const el = routeBadgeElement(opt, () => onSelectRouteOptionRef.current?.(opt.index));
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(toLngLat(anchor))
        .addTo(map);
      routeBadgeMarkersRef.current.push(marker);
    }

    return () => {
      routeBadgeMarkersRef.current.forEach((marker) => marker.remove());
      routeBadgeMarkersRef.current = [];
    };
  }, [ready, routeOptions]);

  // ====================================================
  // CON TRỎ KHI ĐANG CHỌN VỊ TRÍ
  // ====================================================

  useEffect(() => {

    const canvas = mapRef.current?.getCanvas();

    if (canvas) {
      canvas.style.cursor = pickMode
        ? 'crosshair'
        : '';
    }

  }, [pickMode]);

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
