import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { mapsApi, type NearbyPlace } from '@/client/api/mapsApi';
import type { GoongRoute, GoongVehicle } from '@/client/api/tripFlowApi';
import TravelMap, {
  type MapPoint,
  type RouteOptionOverlay,
  type TravelMapHandle,
} from '@/client/traveller/components/TravelMap';
import { formatMeters, formatSeconds, maneuverIcon } from '@/client/traveller/navigation/geo';

type Coordinate = [number, number];

/** Giải mã chuỗi encoded polyline Goong thành mảng tọa độ [lat, lng] */
function decodePolyline(encoded: string): Coordinate[] {
  const coordinates: Coordinate[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    latitude += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    longitude += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    coordinates.push([latitude / 1e5, longitude / 1e5]);
  }
  return coordinates;
}

const VEHICLES: { value: GoongVehicle; label: string; icon: string }[] = [
  { value: 'car', label: 'Ô tô', icon: 'directions_car' },
  { value: 'bike', label: 'Xe máy', icon: 'two_wheeler' },
];

/** Đọc chỉ đường tiếng Việt bằng Web Speech API (miễn phí, có sẵn trên trình duyệt) */
function speakWebVi(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Bỏ qua nếu trình duyệt chặn speechSynthesis
  }
}

function stopWebSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Bỏ qua
  }
}

interface PlaceDirectionsMapProps {
  placeId: number;
  placeName: string;
  address: string | null;
  latitude: number;
  longitude: number;
  /** Khách đã đăng nhập chưa (API /maps/directions & /maps/nearby yêu cầu đăng nhập) */
  isAuthenticated: boolean;
  /** Gọi khi khách chưa đăng nhập bấm Chỉ đường */
  onRequireLogin: () => void;
  /** Tăng số này từ nút Chỉ đường bên ngoài để cuộn tới bản đồ và chạy chỉ đường Goong */
  directionsSignal?: number;
}

/**
 * Khung "Vị trí & Đường đi" trên trang chi tiết địa điểm:
 * hoàn toàn dùng Goong Map, hỗ trợ chỉ đường, dẫn đường GPS và ghé tạm cây xăng gần nhất.
 */
export default function PlaceDirectionsMap({
  placeId,
  placeName,
  address,
  latitude,
  longitude,
  isAuthenticated,
  onRequireLogin,
  directionsSignal = 0,
}: PlaceDirectionsMapProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inlineMapRef = useRef<TravelMapHandle>(null);
  const modalMapRef = useRef<TravelMapHandle>(null);

  const [vehicle, setVehicle] = useState<GoongVehicle>('car');
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const [route, setRoute] = useState<GoongRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [cameraPaused, setCameraPaused] = useState(false);
  const cameraPausedRef = useRef(false);
  const [satellite, setSatellite] = useState(false);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [showRoutesPanel, setShowRoutesPanel] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const lastSpokenRef = useRef<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const pauseCamera = useCallback(() => {
    cameraPausedRef.current = true;
    setCameraPaused(true);
  }, []);

  const resumeCamera = useCallback(
    (target?: Coordinate | null) => {
      cameraPausedRef.current = false;
      setCameraPaused(false);
      const loc = target ?? userLocation;
      if (loc) {
        modalMapRef.current?.focus(loc, 16);
      }
    },
    [userLocation],
  );

  // Tìm cây xăng gần & chế độ rẽ tạm (detour)
  const [gasStations, setGasStations] = useState<NearbyPlace[]>([]);
  const [gasLoading, setGasLoading] = useState(false);
  const [gasError, setGasError] = useState<string | null>(null);
  const [showGasPanel, setShowGasPanel] = useState(false);
  const [detourStop, setDetourStop] = useState<NearbyPlace | null>(null);
  const [detourRoute, setDetourRoute] = useState<GoongRoute | null>(null);

  const allMainRoutes = useMemo<GoongRoute[]>(
    () => (route ? [route, ...(route.alternatives ?? [])] : []),
    [route],
  );
  const selectedMainRoute = allMainRoutes[selectedRouteIndex] ?? route;

  const mainRouteCoordinates = useMemo(
    () => (selectedMainRoute?.polyline ? decodePolyline(selectedMainRoute.polyline) : null),
    [selectedMainRoute],
  );
  const detourRouteCoordinates = useMemo(
    () => (detourRoute?.polyline ? decodePolyline(detourRoute.polyline) : null),
    [detourRoute],
  );

  const activeRoute = detourStop && detourRoute ? detourRoute : selectedMainRoute;
  const activeRouteCoordinates =
    detourStop && detourRouteCoordinates ? detourRouteCoordinates : mainRouteCoordinates;

  const stopNavigation = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    stopWebSpeech();
    lastSpokenRef.current = null;
    cameraPausedRef.current = false;
    setCameraPaused(false);
    setNavigating(false);
    setShowRoutesPanel(false);
  }, []);

  // Khi đổi sang địa điểm khác thì xóa tuyến cũ, cây xăng và dừng dẫn đường
  useEffect(() => {
    stopNavigation();
    setRoute(null);
    setDetourStop(null);
    setDetourRoute(null);
    setGasStations([]);
    setShowGasPanel(false);
    setGasError(null);
    setError(null);
    setExpanded(false);
  }, [placeId, stopNavigation]);

  // Đóng modal hoặc unmount → dừng theo dõi GPS
  useEffect(() => {
    if (!expanded) {
      stopNavigation();
      setShowGasPanel(false);
    }
  }, [expanded, stopNavigation]);

  useEffect(() => stopNavigation, [stopNavigation]);

  // Đóng modal phóng to bằng phím Esc
  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded]);

  // Khi có tuyến mới thì thu phóng bản đồ vừa khít toàn tuyến
  useEffect(() => {
    if (!activeRouteCoordinates || activeRouteCoordinates.length < 2) return;
    const timer = window.setTimeout(() => {
      inlineMapRef.current?.fitRoute();
      modalMapRef.current?.fitRoute();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [activeRouteCoordinates, expanded]);

  const resolveOrigin = useCallback(
    (): Promise<Coordinate | null> =>
      new Promise((resolve) => {
        if (userLocation) {
          resolve(userLocation);
          return;
        }
        if (!navigator.geolocation) {
          setError('Trình duyệt không hỗ trợ định vị GPS để tính đường đi.');
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const origin: Coordinate = [pos.coords.latitude, pos.coords.longitude];
            setUserLocation(origin);
            resolve(origin);
          },
          (geoError) => {
            if (geoError.code === geoError.PERMISSION_DENIED) {
              setError(
                'Bạn cần cho phép quyền vị trí trên trình duyệt để xem đường đi từ vị trí hiện tại.',
              );
            } else {
              setError('Không lấy được vị trí GPS hiện tại. Vui lòng thử lại.');
            }
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
        );
      }),
    [userLocation],
  );

  const fetchRoute = useCallback(
    async (origin: Coordinate, mode: GoongVehicle) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mapsApi.directions({
          fromLat: origin[0],
          fromLng: origin[1],
          toLat: latitude,
          toLng: longitude,
          vehicle: mode,
        });
        setRoute(result);
        setSelectedRouteIndex(0);
      } catch (failure: unknown) {
        setRoute(null);
        setError(errorMessage(failure));
      } finally {
        setLoading(false);
      }
    },
    [latitude, longitude],
  );

  const fetchDetourRoute = useCallback(
    async (origin: Coordinate, station: NearbyPlace, mode: GoongVehicle) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mapsApi.directions({
          fromLat: origin[0],
          fromLng: origin[1],
          toLat: station.latitude,
          toLng: station.longitude,
          vehicle: mode,
        });
        setDetourStop(station);
        setDetourRoute(result);
        setShowGasPanel(false);
        if (navigating) {
          pauseCamera();
        }
        window.setTimeout(() => modalMapRef.current?.fitRoute(), 180);
      } catch (failure: unknown) {
        setError(errorMessage(failure));
      } finally {
        setLoading(false);
      }
    },
    [navigating, pauseCamera],
  );

  const startDirections = useCallback(
    async (mode: GoongVehicle = vehicle, scrollToSection = true) => {
      if (!isAuthenticated) {
        onRequireLogin();
        return;
      }
      if (scrollToSection) {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setLoading(true);
      setError(null);
      const origin = await resolveOrigin();
      if (!origin) {
        setLoading(false);
        return;
      }
      await fetchRoute(origin, mode);
    },
    [fetchRoute, isAuthenticated, onRequireLogin, resolveOrigin, vehicle],
  );

  // Nhận tín hiệu từ nút Chỉ đường ở cột phải của PlaceDetailsPage
  const handledSignalRef = useRef(directionsSignal);
  useEffect(() => {
    if (directionsSignal === handledSignalRef.current) return;
    handledSignalRef.current = directionsSignal;
    void startDirections(vehicle, true);
  }, [directionsSignal, startDirections, vehicle]);

  const changeVehicle = (next: GoongVehicle) => {
    setVehicle(next);
    if (detourStop && userLocation) {
      void fetchDetourRoute(userLocation, detourStop, next);
      return;
    }
    if (userLocation) {
      void fetchRoute(userLocation, next);
    } else {
      void startDirections(next, false);
    }
  };

  const clearDirections = () => {
    stopNavigation();
    setRoute(null);
    setDetourStop(null);
    setDetourRoute(null);
    setGasStations([]);
    setShowGasPanel(false);
    setError(null);
    inlineMapRef.current?.focus([latitude, longitude], 14);
  };

  /** Tìm cây xăng gần vị trí hiện tại qua Goong (dùng lại cache nếu đã tải để mở tức thì) */
  const searchNearbyGas = useCallback(async () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    if (showGasPanel) {
      setShowGasPanel(false);
      return;
    }
    setShowGasPanel(true);
    if (gasStations.length > 0) {
      setGasError(null);
      return;
    }
    setGasLoading(true);
    setGasError(null);
    const origin = await resolveOrigin();
    if (!origin) {
      setGasLoading(false);
      setGasError('Chưa có vị trí GPS để tìm cây xăng gần bạn.');
      return;
    }
    try {
      const found = await mapsApi.nearby({
        lat: origin[0],
        lng: origin[1],
        keyword: 'cây xăng',
        radius: 5,
      });
      setGasStations(found);
      if (found.length === 0) {
        setGasError('Không tìm thấy cây xăng nào trong bán kính 5 km.');
      }
    } catch (failure: unknown) {
      setGasError(errorMessage(failure));
    } finally {
      setGasLoading(false);
    }
  }, [gasStations.length, isAuthenticated, onRequireLogin, resolveOrigin, showGasPanel]);

  const selectGasStation = useCallback(
    async (station: NearbyPlace) => {
      const origin = await resolveOrigin();
      if (!origin) return;
      await fetchDetourRoute(origin, station, vehicle);
    },
    [fetchDetourRoute, resolveOrigin, vehicle],
  );

  const returnToMainRoute = useCallback(async () => {
    setDetourStop(null);
    setDetourRoute(null);
    setShowGasPanel(false);
    setGasStations([]);
    const origin = await resolveOrigin();
    if (origin) {
      await fetchRoute(origin, vehicle);
    }
  }, [fetchRoute, resolveOrigin, vehicle]);

  /** Bắt đầu / dừng chế độ dẫn đường GPS realtime trong modal bản đồ Goong */
  const toggleNavigation = useCallback(() => {
    if (navigating) {
      stopNavigation();
      modalMapRef.current?.fitRoute();
      return;
    }
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị GPS để bắt đầu đi.');
      return;
    }
    if (!route) {
      void startDirections(vehicle, false);
    }
    setNavigating(true);
    cameraPausedRef.current = false;
    setCameraPaused(false);
    if (userLocation) {
      modalMapRef.current?.focus(userLocation, 16);
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const next: Coordinate = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(next);
        if (!cameraPausedRef.current) {
          modalMapRef.current?.focus(next, 16);
        }
      },
      () => {
        stopNavigation();
        setError('Không thể theo dõi vị trí GPS. Vui lòng kiểm tra quyền vị trí.');
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 },
    );
  }, [
    isAuthenticated,
    navigating,
    onRequireLogin,
    route,
    startDirections,
    stopNavigation,
    userLocation,
    vehicle,
  ]);

  // Mở khay cây xăng đã có dữ liệu → tạm dừng bám GPS & tự phóng to vừa khít các cây xăng gần
  useEffect(() => {
    if (!showGasPanel || gasStations.length === 0) return;
    if (navigating) pauseCamera();
    const targets: Coordinate[] = gasStations.map((s) => [s.latitude, s.longitude]);
    if (userLocation) targets.push(userLocation);
    const timer = window.setTimeout(() => modalMapRef.current?.fitPoints(targets), 160);
    return () => window.clearTimeout(timer);
  }, [gasStations, navigating, pauseCamera, showGasPanel, userLocation]);

  // Danh sách toàn bộ tuyến (đang chọn + thay thế) kèm nhãn thời gian để vẽ đồng thời giống Google Maps
  const routeOptionOverlays = useMemo<RouteOptionOverlay[] | undefined>(() => {
    if (detourStop || allMainRoutes.length < 2) return undefined;
    if (navigating && !cameraPaused && !showRoutesPanel) return undefined;
    return allMainRoutes.map((option, idx) => {
      const diffMin = Math.round(
        (option.durationSeconds - allMainRoutes[0].durationSeconds) / 60,
      );
      return {
        index: idx,
        coordinates: option.polyline ? decodePolyline(option.polyline) : [],
        durationLabel: option.durationText ?? formatSeconds(option.durationSeconds),
        distanceLabel: option.distanceText ?? formatMeters(option.distanceMeters),
        diffLabel:
          idx > 0 && diffMin !== 0 ? `${diffMin > 0 ? `+${diffMin}` : diffMin}p` : undefined,
        selected: idx === selectedRouteIndex,
      };
    });
  }, [allMainRoutes, cameraPaused, detourStop, navigating, selectedRouteIndex, showRoutesPanel]);

  const inlinePoints = useMemo<MapPoint[]>(
    () => [
      {
        id: String(placeId),
        coordinate: [latitude, longitude],
        label: '•',
        title: placeName,
      },
    ],
    [latitude, longitude, placeId, placeName],
  );

  const modalPoints = useMemo<MapPoint[]>(() => {
    const list: MapPoint[] = [
      {
        id: String(placeId),
        coordinate: [latitude, longitude],
        label: '•',
        title: placeName,
      },
    ];
    if (detourStop) {
      list.push({
        id: `gas:${detourStop.placeId}`,
        coordinate: [detourStop.latitude, detourStop.longitude],
        label: '⛽',
        title: detourStop.name,
      });
    } else if (showGasPanel) {
      for (const station of gasStations) {
        list.push({
          id: `gas:${station.placeId}`,
          coordinate: [station.latitude, station.longitude],
          label: '⛽',
          title: station.name,
        });
      }
    }
    return list;
  }, [detourStop, gasStations, latitude, longitude, placeId, placeName, showGasPanel]);

  const distanceLabel = activeRoute
    ? (activeRoute.distanceText ?? formatMeters(activeRoute.distanceMeters))
    : null;
  const durationLabel = activeRoute
    ? (activeRoute.durationText ?? formatSeconds(activeRoute.durationSeconds))
    : null;

  // Đọc hướng dẫn bước đầu tiên bằng giọng tiếng Việt khi bật Bắt đầu đi hoặc đổi tuyến
  useEffect(() => {
    const firstStep = activeRoute?.steps?.[0];
    if (!navigating || !voiceEnabled || !firstStep) return;
    const key = `${detourStop?.placeId ?? 'main'}:${selectedRouteIndex}:${firstStep.instruction}`;
    if (lastSpokenRef.current === key) return;
    lastSpokenRef.current = key;
    const dist =
      firstStep.distanceMeters >= 30
        ? `Trong ${firstStep.distanceText ?? formatMeters(firstStep.distanceMeters)}, `
        : '';
    speakWebVi(`${dist}${firstStep.instruction}`);
  }, [activeRoute, detourStop?.placeId, navigating, selectedRouteIndex, voiceEnabled]);

  return (
    <div ref={sectionRef} className="mt-7 scroll-mt-24">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[17px] font-extrabold text-[#13364A]">Vị trí & Đường đi</h2>
      </div>

      {/* Thanh tóm tắt tuyến Goong (chọn phương tiện, quãng đường, thời gian, đóng tuyến) */}
      {(route || error) && (
        <div className="mb-3 rounded-2xl border border-[#DCEBEF] bg-[#F4FBFD] px-3.5 py-2.5">
          {error ? (
            <div className="flex items-center justify-between gap-2 text-[12.5px] text-[#B91C1C]">
              <span className="flex items-center gap-1.5">
                <Icon name="error" className="shrink-0 text-[16px]" />
                {error}
              </span>
              <button
                type="button"
                onClick={() => void startDirections(vehicle, false)}
                className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11.5px] font-bold text-[#0891B2] ring-1 ring-[#DCEBEF]"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#13364A]">
                <span className="inline-flex items-center gap-1 text-[#0891B2]">
                  <Icon name="route" className="text-[17px]" />
                  {route?.distanceText ?? (route ? formatMeters(route.distanceMeters) : '')}
                </span>
                <span className="text-[#94A3B8]">·</span>
                <span className="inline-flex items-center gap-1">
                  <Icon name="schedule" className="text-[16px] text-[#0891B2]" />
                  {route?.durationText ?? (route ? formatSeconds(route.durationSeconds) : '')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {VEHICLES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => changeVehicle(item.value)}
                    disabled={loading}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold transition-colors ${
                      vehicle === item.value
                        ? 'bg-[#0891B2] text-white'
                        : 'bg-white text-[#475569] hover:bg-[#E7F8FA]'
                    }`}
                  >
                    <Icon name={item.icon} className="text-[14px]" />
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearDirections}
                  aria-label="Đóng chỉ đường"
                  title="Đóng chỉ đường"
                  className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#64748B] hover:bg-[#E2EBF0]"
                >
                  <Icon name="close" className="text-[15px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* isolate: z-index của bản đồ chỉ có tác dụng trong khung này, không đè lên hộp thoại / menu */}
      <div className="overflow-hidden rounded-[22px] border border-[#E5ECEF] bg-white shadow-[0_4px_16px_rgba(19,27,46,0.05)]">
        <div className="relative isolate">
          <TravelMap
            ref={inlineMapRef}
            className="aspect-[16/10] w-full md:aspect-[16/9]"
            center={[latitude, longitude]}
            points={inlinePoints}
            activeId={String(placeId)}
            routeCoordinates={mainRouteCoordinates}
            userLocation={userLocation}
          />
        </div>
        {/* Thanh chân bản đồ đặt riêng bên dưới để không đè lên nhãn Goong Maps */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E7F8FA] text-[#0891B2]">
              <Icon name="near_me" className="text-[16px]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-[#13364A]">{placeName}</p>
              {address && <p className="truncate text-[11.5px] text-[#72818C]">{address}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#F1F5F8] px-3.5 py-2 text-[12px] font-bold text-[#13364A] transition-colors hover:bg-[#E2EBF0]"
          >
            Mở Bản Đồ
            <Icon name="open_in_full" className="text-[14px]" />
          </button>
        </div>
      </div>

      {/* Hộp thoại bản đồ Goong phóng to kèm hướng dẫn từng bước rẽ và tìm cây xăng gần */}
      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Bản đồ Goong - ${placeName}`}
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 backdrop-blur-xs md:p-6"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5ECEF] px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-[16px] font-extrabold text-[#13364A]">
                  {detourStop ? `${detourStop.name} (ghé tạm)` : placeName}
                </p>
                {detourStop ? (
                  <p className="truncate text-[12px] font-semibold text-[#EA580C]">
                    Điểm chính: {placeName}
                  </p>
                ) : (
                  address && <p className="truncate text-[12px] text-[#72818C]">{address}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSatellite((v) => !v)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                    satellite
                      ? 'bg-[#13364A] text-white'
                      : 'bg-[#F1F5F8] text-[#334E68] hover:bg-[#E2EBF0]'
                  }`}
                >
                  <Icon name="layers" className="text-[15px]" />
                  {satellite ? 'Bản đồ' : 'Vệ tinh'}
                </button>
                <button
                  type="button"
                  onClick={() => void searchNearbyGas()}
                  disabled={gasLoading}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                    showGasPanel || detourStop
                      ? 'bg-[#EA580C] text-white'
                      : 'bg-[#FFF7ED] text-[#C2410C] hover:bg-[#FFEDD5]'
                  }`}
                >
                  <Icon name="local_gas_station" className="text-[15px]" />
                  {gasLoading ? 'Đang tìm...' : 'Cây xăng gần'}
                </button>
                {!detourStop && allMainRoutes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowGasPanel(false);
                      setShowRoutesPanel((v) => {
                        const next = !v;
                        if (next && navigating) {
                          pauseCamera();
                          window.setTimeout(() => modalMapRef.current?.fitRoute(), 150);
                        }
                        return next;
                      });
                    }}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                      showRoutesPanel
                        ? 'bg-[#0891B2] text-white'
                        : 'bg-[#E7F8FA] text-[#0E7490] hover:bg-[#D2F2F6]'
                    }`}
                  >
                    <Icon name="alt_route" className="text-[15px]" />
                    Đổi tuyến ({allMainRoutes.length})
                  </button>
                )}
                {navigating && (
                  <button
                    type="button"
                    onClick={() =>
                      setVoiceEnabled((prev) => {
                        const next = !prev;
                        if (!next) stopWebSpeech();
                        return next;
                      })
                    }
                    title={voiceEnabled ? 'Tắt giọng đọc' : 'Bật giọng đọc'}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                      voiceEnabled
                        ? 'bg-[#0F6A5B] text-white'
                        : 'bg-[#F1F5F8] text-[#64748B] hover:bg-[#E2EBF0]'
                    }`}
                  >
                    <Icon
                      name={voiceEnabled ? 'volume_up' : 'volume_off'}
                      className="text-[15px]"
                    />
                    {voiceEnabled ? 'Đang đọc' : 'Tắt tiếng'}
                  </button>
                )}
                {VEHICLES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => changeVehicle(item.value)}
                    disabled={loading}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                      vehicle === item.value && activeRoute
                        ? 'bg-[#0891B2] text-white'
                        : 'bg-[#F1F5F8] text-[#334E68] hover:bg-[#E2EBF0]'
                    }`}
                  >
                    <Icon name={item.icon} className="text-[15px]" />
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    route ? toggleNavigation() : void startDirections(vehicle, false)
                  }
                  disabled={loading}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-60 ${
                    navigating
                      ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                      : 'bg-[#0E7490] hover:bg-[#0C5E75]'
                  }`}
                >
                  <Icon
                    name={!route ? 'directions' : navigating ? 'stop' : 'navigation'}
                    className="text-[16px]"
                  />
                  {loading
                    ? 'Đang tìm...'
                    : !route
                      ? 'Chỉ đường'
                      : navigating
                        ? 'Dừng đi'
                        : 'Bắt đầu đi'}
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="Đóng bản đồ"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F8] text-[#334E68] hover:bg-[#E2EBF0]"
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>
            </div>

            {/* Thanh đổi cây xăng nhanh hoặc quay lại tuyến chính khi đang rẽ qua cây xăng */}
            {detourStop && (
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#FED7AA] bg-[#FFF7ED] px-5 py-2.5">
                <p className="flex items-center gap-2 text-[13px] font-bold text-[#9A3412]">
                  <Icon name="undo" className="text-[17px] text-[#EA580C]" />
                  Đang dẫn đường tới cây xăng {detourStop.name}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void searchNearbyGas()}
                    disabled={loading}
                    className="shrink-0 rounded-full border border-[#FDBA74] bg-white px-3 py-1.5 text-[12px] font-bold text-[#C2410C] hover:bg-[#FFEDD5]"
                  >
                    Đổi cây xăng
                  </button>
                  <button
                    type="button"
                    onClick={() => void returnToMainRoute()}
                    disabled={loading}
                    className="shrink-0 rounded-full bg-[#EA580C] px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-[#C2410C]"
                  >
                    Quay lại tuyến đi {placeName}
                  </button>
                </div>
              </div>
            )}

            {/* Danh sách chọn tuyến đường thay thế */}
            {showRoutesPanel && !detourStop && allMainRoutes.length > 1 && (
              <div className="border-b border-[#CBE7EE] bg-[#F4FBFD] px-5 py-3">
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {allMainRoutes.map((option, idx) => {
                    const selected = idx === selectedRouteIndex;
                    const diffMin = Math.round(
                      (option.durationSeconds - allMainRoutes[0].durationSeconds) / 60,
                    );
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedRouteIndex(idx);
                          lastSpokenRef.current = null;
                          setShowRoutesPanel(false);
                          window.setTimeout(() => modalMapRef.current?.fitRoute(), 150);
                        }}
                        className={`w-52 shrink-0 rounded-2xl border p-3 text-left transition-colors ${
                          selected
                            ? 'border-[#0891B2] bg-[#E7F8FA]'
                            : 'border-[#DCEBEF] bg-white hover:bg-[#F8FBFD]'
                        }`}
                      >
                        <p className="text-[11.5px] font-bold text-[#0E7490]">
                          {idx === 0 ? 'Tuyến nhanh nhất' : `Tuyến ${idx + 1}`}
                        </p>
                        <p className="mt-0.5 text-[15px] font-extrabold text-[#13364A]">
                          {option.durationText ?? formatSeconds(option.durationSeconds)}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#5C6E7E]">
                          {option.distanceText ?? formatMeters(option.distanceMeters)}
                          {idx > 0 && diffMin !== 0
                            ? ` (${diffMin > 0 ? `+${diffMin}` : diffMin} phút)`
                            : ''}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Danh sách cây xăng gần vị trí hiện tại */}
            {showGasPanel && (
              <div className="border-b border-[#FED7AA] bg-[#FFFBF7] px-5 py-3">
                {gasLoading ? (
                  <p className="text-[12.5px] text-[#72818C]">
                    Đang tìm cây xăng gần vị trí của bạn...
                  </p>
                ) : gasError ? (
                  <p className="text-[12.5px] text-[#B91C1C]">{gasError}</p>
                ) : (
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {gasStations.map((station) => {
                      const selected = detourStop?.placeId === station.placeId;
                      return (
                        <div
                          key={station.placeId}
                          className={`w-60 shrink-0 rounded-2xl border p-3 ${
                            selected ? 'border-[#EA580C] bg-[#FFF7ED]' : 'border-[#FED7AA] bg-white'
                          }`}
                        >
                          <p className="truncate text-[13px] font-extrabold text-[#13364A]">
                            {station.name}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-[11.5px] text-[#72818C]">
                            {station.address}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[11.5px] font-bold text-[#EA580C]">
                              Cách {formatMeters(station.distanceMeters)}
                            </span>
                            {selected ? (
                              <span className="rounded-full bg-[#FFEDD5] px-2.5 py-1 text-[11.5px] font-bold text-[#C2410C]">
                                Đang chọn
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={loading}
                                onClick={() => void selectGasStation(station)}
                                className="rounded-full bg-[#EA580C] px-3 py-1 text-[11.5px] font-bold text-white hover:bg-[#C2410C]"
                              >
                                {detourStop ? 'Đổi sang' : 'Rẽ qua'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              <div className="relative isolate min-h-[260px] flex-1">
                <TravelMap
                  key={satellite ? 'sat' : 'map'}
                  ref={modalMapRef}
                  className="h-full w-full"
                  center={[latitude, longitude]}
                  points={modalPoints}
                  activeId={detourStop ? `gas:${detourStop.placeId}` : String(placeId)}
                  onSelect={(id) => {
                    if (!id.startsWith('gas:')) return;
                    const found = gasStations.find((s) => s.placeId === id.slice(4));
                    if (found) void selectGasStation(found);
                  }}
                  routeCoordinates={activeRouteCoordinates}
                  routeOptions={routeOptionOverlays}
                  onSelectRouteOption={(idx) => {
                    setSelectedRouteIndex(idx);
                    lastSpokenRef.current = null;
                    setShowRoutesPanel(false);
                    window.setTimeout(() => modalMapRef.current?.fitRoute(), 150);
                  }}
                  userLocation={userLocation}
                  followUser={navigating && !cameraPaused}
                  onUserInteract={() => {
                    if (navigating && !cameraPausedRef.current) {
                      pauseCamera();
                    }
                  }}
                  satellite={satellite}
                  showCompass
                />

                {/* Nút nổi góc dưới trái bản đồ: chuyển nhanh Toàn tuyến ↔ Tiếp tục bám theo lúc đang đi */}
                {navigating && (
                  <div className="absolute bottom-4 left-4 z-10">
                    {cameraPaused ? (
                      <button
                        type="button"
                        onClick={() => resumeCamera()}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#0F6A5B] px-4 py-2 text-[12.5px] font-extrabold text-white shadow-lg hover:bg-[#0B5448]"
                      >
                        <Icon name="my_location" className="text-[17px]" />
                        Tiếp tục bám theo
                      </button>
                    ) : (
                      activeRoute && (
                        <button
                          type="button"
                          onClick={() => {
                            pauseCamera();
                            modalMapRef.current?.fitRoute();
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-extrabold text-[#13364A] shadow-lg ring-1 ring-black/10 hover:bg-[#F1F5F8]"
                        >
                          <Icon name="zoom_out_map" className="text-[17px]" />
                          Toàn tuyến
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {(activeRoute || error) && (
                <div className="flex max-h-[38vh] w-full flex-col border-t border-[#E5ECEF] bg-[#F8FBFD] md:max-h-none md:w-80 md:border-t-0 md:border-l">
                  {error ? (
                    <p className="p-4 text-[13px] text-[#B91C1C]">{error}</p>
                  ) : (
                    <>
                      <div className="border-b border-[#E5ECEF] bg-white px-4 py-3">
                        <p className="text-[11px] font-bold tracking-wide text-[#72818C] uppercase">
                          {detourStop ? `Tuyến tới ${detourStop.name}` : 'Tuyến đường Goong Maps'}
                        </p>
                        <p className="mt-1 text-[16px] font-extrabold text-[#13364A]">
                          {distanceLabel} · {durationLabel}
                        </p>
                      </div>
                      <ol className="flex-1 divide-y divide-[#EAF0F3] overflow-y-auto px-4 py-2">
                        {activeRoute?.steps && activeRoute.steps.length > 0 ? (
                          activeRoute.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 py-2.5 text-[12.5px]">
                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E7F8FA] text-[#0891B2]">
                                <Icon name={maneuverIcon(step.maneuver)} className="text-[15px]" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="leading-[18px] text-[#13364A]">{step.instruction}</p>
                                <p className="mt-0.5 text-[11px] text-[#72818C]">
                                  {step.distanceText ?? formatMeters(step.distanceMeters)}
                                </p>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className="py-3 text-[12.5px] text-[#72818C]">
                            Đã hiển thị tuyến đường trên bản đồ Goong.
                          </li>
                        )}
                      </ol>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
