import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { mapsApi } from '@/client/api/mapsApi';
import type { GoongRoute, GoongVehicle } from '@/client/api/tripFlowApi';
import TravelMap, { type TravelMapHandle } from '@/client/traveller/components/TravelMap';
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

interface PlaceDirectionsMapProps {
  placeId: number;
  placeName: string;
  address: string | null;
  latitude: number;
  longitude: number;
  /** Khách đã đăng nhập chưa (API /maps/directions yêu cầu đăng nhập để bảo vệ quota Goong) */
  isAuthenticated: boolean;
  /** Gọi khi khách chưa đăng nhập bấm Chỉ đường */
  onRequireLogin: () => void;
  /** Tăng số này từ nút Chỉ đường bên ngoài để cuộn tới bản đồ và chạy chỉ đường Goong */
  directionsSignal: number;
}

/**
 * Khung "Vị trí & Đường đi" trên trang chi tiết địa điểm:
 * hoàn toàn dùng Goong Map (nền MapLibre + Goong Directions qua BE), không nhảy sang Google Maps.
 */
export default function PlaceDirectionsMap({
  placeId,
  placeName,
  address,
  latitude,
  longitude,
  isAuthenticated,
  onRequireLogin,
  directionsSignal,
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
  const watchIdRef = useRef<number | null>(null);

  const routeCoordinates = useMemo(
    () => (route?.polyline ? decodePolyline(route.polyline) : null),
    [route],
  );

  const stopNavigation = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setNavigating(false);
  }, []);

  // Khi đổi sang địa điểm khác thì xóa tuyến cũ và dừng dẫn đường
  useEffect(() => {
    stopNavigation();
    setRoute(null);
    setError(null);
    setExpanded(false);
  }, [placeId, stopNavigation]);

  // Đóng modal hoặc unmount → dừng theo dõi GPS
  useEffect(() => {
    if (!expanded) stopNavigation();
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
    if (!routeCoordinates || routeCoordinates.length < 2) return;
    const timer = window.setTimeout(() => {
      inlineMapRef.current?.fitRoute();
      modalMapRef.current?.fitRoute();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [routeCoordinates, expanded]);

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
      } catch (failure: unknown) {
        setRoute(null);
        setError(errorMessage(failure));
      } finally {
        setLoading(false);
      }
    },
    [latitude, longitude],
  );

  const startDirections = useCallback(
    (mode: GoongVehicle = vehicle, scrollToSection = true) => {
      if (!isAuthenticated) {
        onRequireLogin();
        return;
      }
      if (scrollToSection) {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (!navigator.geolocation) {
        setError('Trình duyệt không hỗ trợ định vị GPS để tính đường đi.');
        return;
      }
      setLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origin: Coordinate = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(origin);
          void fetchRoute(origin, mode);
        },
        (geoError) => {
          setLoading(false);
          if (geoError.code === geoError.PERMISSION_DENIED) {
            setError(
              'Bạn cần cho phép quyền vị trí trên trình duyệt để xem đường đi từ vị trí hiện tại.',
            );
          } else {
            setError('Không lấy được vị trí GPS hiện tại. Vui lòng thử lại.');
          }
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
      );
    },
    [fetchRoute, isAuthenticated, onRequireLogin, vehicle],
  );

  // Nhận tín hiệu từ nút Chỉ đường ở cột phải của PlaceDetailsPage
  const handledSignalRef = useRef(directionsSignal);
  useEffect(() => {
    if (directionsSignal === handledSignalRef.current) return;
    handledSignalRef.current = directionsSignal;
    startDirections(vehicle, true);
  }, [directionsSignal, startDirections, vehicle]);

  const changeVehicle = (next: GoongVehicle) => {
    setVehicle(next);
    if (userLocation) {
      void fetchRoute(userLocation, next);
    } else {
      startDirections(next, false);
    }
  };

  const clearDirections = () => {
    stopNavigation();
    setRoute(null);
    setError(null);
    inlineMapRef.current?.focus([latitude, longitude], 14);
  };

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
      startDirections(vehicle, false);
    }
    setNavigating(true);
    if (userLocation) {
      modalMapRef.current?.focus(userLocation, 16);
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const next: Coordinate = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(next);
        modalMapRef.current?.focus(next, 16);
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

  const mapPoints = useMemo(
    () => [
      {
        id: String(placeId),
        coordinate: [latitude, longitude] as Coordinate,
        label: '•',
        title: placeName,
      },
    ],
    [latitude, longitude, placeId, placeName],
  );

  const distanceLabel = route ? (route.distanceText ?? formatMeters(route.distanceMeters)) : null;
  const durationLabel = route ? (route.durationText ?? formatSeconds(route.durationSeconds)) : null;

  return (
    <div ref={sectionRef} className="mt-7 scroll-mt-24">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[17px] font-extrabold text-[#13364A]">Vị trí & Đường đi</h2>
        <button
          type="button"
          onClick={() => startDirections(vehicle, false)}
          disabled={loading}
          className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0891B2] hover:underline disabled:opacity-60"
        >
          <Icon name="directions" className="text-[16px]" />
          {loading ? 'Đang tìm đường...' : route ? 'Cập nhật đường đi' : 'Chỉ đường'}
        </button>
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
                onClick={() => startDirections(vehicle, false)}
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
                  {distanceLabel}
                </span>
                <span className="text-[#94A3B8]">·</span>
                <span className="inline-flex items-center gap-1">
                  <Icon name="schedule" className="text-[16px] text-[#0891B2]" />
                  {durationLabel}
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
            points={mapPoints}
            activeId={String(placeId)}
            routeCoordinates={routeCoordinates}
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

      {/* Hộp thoại bản đồ Goong phóng to kèm hướng dẫn từng bước rẽ (nếu đang bật chỉ đường) */}
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
                <p className="truncate text-[16px] font-extrabold text-[#13364A]">{placeName}</p>
                {address && <p className="truncate text-[12px] text-[#72818C]">{address}</p>}
              </div>
              <div className="flex items-center gap-2">
                {VEHICLES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => changeVehicle(item.value)}
                    disabled={loading}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                      vehicle === item.value && route
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
                  onClick={() => (route ? toggleNavigation() : startDirections(vehicle, false))}
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

            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              <div className="relative isolate min-h-[260px] flex-1">
                <TravelMap
                  ref={modalMapRef}
                  className="h-full w-full"
                  center={[latitude, longitude]}
                  points={mapPoints}
                  activeId={String(placeId)}
                  routeCoordinates={routeCoordinates}
                  userLocation={userLocation}
                  followUser={navigating}
                />
              </div>

              {(route || error) && (
                <div className="flex max-h-[38vh] w-full flex-col border-t border-[#E5ECEF] bg-[#F8FBFD] md:max-h-none md:w-80 md:border-t-0 md:border-l">
                  {error ? (
                    <p className="p-4 text-[13px] text-[#B91C1C]">{error}</p>
                  ) : (
                    <>
                      <div className="border-b border-[#E5ECEF] bg-white px-4 py-3">
                        <p className="text-[11px] font-bold tracking-wide text-[#72818C] uppercase">
                          Tuyến đường Goong Maps
                        </p>
                        <p className="mt-1 text-[16px] font-extrabold text-[#13364A]">
                          {distanceLabel} · {durationLabel}
                        </p>
                      </div>
                      <ol className="flex-1 divide-y divide-[#EAF0F3] overflow-y-auto px-4 py-2">
                        {route?.steps && route.steps.length > 0 ? (
                          route.steps.map((step, idx) => (
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
