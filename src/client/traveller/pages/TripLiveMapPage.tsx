
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { Icon } from '@/components/common';
import { distanceMeters } from '@/components/common/mapTypes';
import { errorMessage } from '@/client/api/http';

import {
  tripFlowApi,
  type GoongVehicle,
  type ItineraryActivity,
  type ItineraryOverview,
  type NextTripRoute,
  type TripProgressResponse,
} from '@/client/api/tripFlowApi';

import {
  CLIENT_ROUTES,
  itineraryDayPath,
} from '@/client/routePaths';

import StopReviewCard from '@/client/traveller/components/StopReviewCard';
import TodayWeatherCard from '@/client/traveller/components/TodayWeatherCard';

import {
  arrivalRadius,
  buildRouteIndex,
  distanceBetween,
  formatMeters,
  formatSeconds,
  maneuverIcon,
  snapToRoute,
  stepPositions,
  upcomingStep,
} from '@/client/traveller/navigation/geo';

import { useGpsTracker } from '@/client/traveller/navigation/useGpsTracker';

import TravelMap, {
  type MapPoint,
  type TravelMapHandle,
} from '@/client/traveller/components/TravelMap';

import {
  ConfirmDialog,
  NoticeToast,
} from '@/client/ui/Overlay';

import { useNotice } from '@/client/ui/useNotice';

type Coordinate = [number, number];

type Dialog =
  | 'exit'
  | 'skip'
  | 'finish'
  | 'done'
  | null;

// ======================================================
// GIẢI MÃ ENCODED POLYLINE GOONG
// ======================================================

function decodePolyline(encoded: string): Coordinate[] {
  const coordinates: Coordinate[] = [];

  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    const numbers: number[] = [];

    for (
      let coordinateIndex = 0;
      coordinateIndex < 2;
      coordinateIndex++
    ) {
      let shift = 0;
      let result = 0;
      let byte: number;

      do {
        if (index >= encoded.length || shift > 30) {
          return [];
        }

        byte = encoded.charCodeAt(index++) - 63;

        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      numbers.push(
        result & 1
          ? ~(result >> 1)
          : result >> 1,
      );
    }

    latitude += numbers[0];
    longitude += numbers[1];

    const lat = latitude / 1e5;
    const lng = longitude / 1e5;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return [];
    }

    coordinates.push([lat, lng]);
  }

  return coordinates;
}

// ======================================================
// KIỂM TRA TỌA ĐỘ ĐỊA ĐIỂM
// ======================================================

function hasCoordinates(
  activity: ItineraryActivity,
): activity is ItineraryActivity & {
  latitude: number;
  longitude: number;
} {
  return (
    typeof activity.latitude === 'number' &&
    typeof activity.longitude === 'number' &&
    Number.isFinite(activity.latitude) &&
    Number.isFinite(activity.longitude) &&
    Math.abs(activity.latitude) <= 90 &&
    Math.abs(activity.longitude) <= 180
  );
}

function travelTime(
  value: string | null | undefined,
) {
  return value ? value.slice(0, 5) : '--:--';
}

const VEHICLES: {
  value: GoongVehicle;
  label: string;
}[] = [
  { value: 'car', label: 'Ô tô' },
  { value: 'bike', label: 'Xe máy' },
  { value: 'taxi', label: 'Taxi' },
];

// ======================================================
// TRANG BẢN ĐỒ CHUYẾN ĐI TRỰC TIẾP
// ======================================================

export default function TripLiveMapPage() {
  const { day: rawDay } =
    useParams<{ day: string }>();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mapRef = useRef<TravelMapHandle>(null);
  const [notice, showNotice] = useNotice();

  const dayNumber = Number(rawDay);
  const planId = Number(searchParams.get('planId'));

  const validIds =
    Number.isSafeInteger(planId) &&
    planId > 0 &&
    Number.isSafeInteger(dayNumber) &&
    dayNumber > 0;

  const detailUrl = validIds
    ? `${itineraryDayPath(dayNumber)}?planId=${planId}`
    : CLIENT_ROUTES.TRIPS;

  // ====================================================
  // STATE — DỮ LIỆU BACKEND
  // ====================================================

  const [overview, setOverview] =
    useState<ItineraryOverview | null>(null);

  const [progress, setProgress] =
    useState<TripProgressResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  const [dialog, setDialog] =
    useState<Dialog>(null);

  // ====================================================
  // STATE — GPS VÀ GOONG
  // ====================================================

  // Chế độ dẫn đường: camera bám theo vị trí, xoay theo hướng đi.
  const [following, setFollowing] =
    useState(false);

  // Đang chờ người dùng bấm lên bản đồ để chọn vị trí xuất phát.
  const [picking, setPicking] =
    useState(false);

  const [vehicle, setVehicle] =
    useState<GoongVehicle>('car');

  const [route, setRoute] =
    useState<NextTripRoute | null>(null);

  const [routeLoading, setRouteLoading] =
    useState(false);

  const [routeError, setRouteError] =
    useState<string | null>(null);

  const [rerouteVersion, setRerouteVersion] =
    useState(0);

  const mountedRef = useRef(false);

  const routeSequence = useRef(0);

  const lastRouteRequest = useRef<{
    itemId: number;
    location: Coordinate;
    vehicle: GoongVehicle;
    time: number;
  } | null>(null);

  // Vị trí hiện tại đang nằm trên tuyến Goong (cập nhật mỗi lần render).
  const onRouteRef = useRef(false);

  // Số lần GPS liên tiếp bị lệch khỏi tuyến, và lần tính lại đường vì lệch tuyến gần nhất.
  const offRouteCount = useRef(0);
  const lastOffRouteReroute = useRef(0);

  // Địa điểm đã tự căn bản đồ theo toàn tuyến.
  const fittedItemRef = useRef<number | null>(null);

  // ====================================================
  // NGÀY ĐANG XEM VÀ CÁC ĐỊA ĐIỂM
  // ====================================================

  const currentDay = overview?.days.find(
    (entry) => entry.dayNumber === dayNumber,
  );

  const currentProgressDay = progress?.days.find(
    (entry) => entry.dayNumber === dayNumber,
  );

  const dayStatus =
    currentProgressDay?.status ?? 'NOT_STARTED';

  const stops = useMemo(
    () =>
      [...(currentDay?.activities ?? [])].sort(
        (a, b) => a.itemOrder - b.itemOrder,
      ),
    [currentDay],
  );

  const statuses = useMemo(
    () =>
      new Map(
        (currentProgressDay?.activities ?? []).map(
          (item) => [item.itemId, item.status],
        ),
      ),
    [currentProgressDay],
  );

  const statusOf = (itemId: number) =>
    statuses.get(itemId) ?? 'PENDING';

  const pendingStop =
    stops.find(
      (item) => statusOf(item.itemId) === 'PENDING',
    ) ?? null;

  const completedCount = stops.filter(
    (item) => statusOf(item.itemId) !== 'PENDING',
  ).length;

  const completedPercent = stops.length
    ? Math.round(
      (100 * completedCount) / stops.length,
    )
    : 100;

  const allHandled =
    completedCount === stops.length;

  const nextItemId = pendingStop?.itemId ?? null;

  const latestNextItemRef = useRef(nextItemId);
  latestNextItemRef.current = nextItemId;

  // ====================================================
  // TỌA ĐỘ HIỂN THỊ TRÊN BẢN ĐỒ
  // ====================================================

  const mapPoints = useMemo<MapPoint[]>(
    () =>
      stops.filter(hasCoordinates).map((item) => ({
        id: String(item.itemId),
        coordinate: [
          item.latitude,
          item.longitude,
        ],
        label: String(item.itemOrder),
        title: item.placeName,
      })),
    [stops],
  );

  const visitedIds = useMemo(
    () =>
      stops
        .filter(
          (item) => statusOf(item.itemId) !== 'PENDING',
        )
        .map((item) => String(item.itemId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stops, statuses],
  );

  // ====================================================
  // LẤY LỊCH TRÌNH VÀ TIẾN ĐỘ THẬT
  // ====================================================

  useEffect(() => {
    mountedRef.current = true;

    if (!validIds) {
      setLoading(false);
      setLoadError(
        'Thiếu mã kế hoạch hoặc số ngày hợp lệ.',
      );

      return () => {
        mountedRef.current = false;
      };
    }

    let cancelled = false;

    setLoading(true);
    setLoadError(null);

    Promise.all([
      tripFlowApi.overview(planId),
      tripFlowApi.tripProgress(planId),
    ])
      .then(([data, tracking]) => {
        if (cancelled) return;

        setOverview(data);
        setProgress(tracking);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(errorMessage(error));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      mountedRef.current = false;
      routeSequence.current += 1;
    };
  }, [validIds, planId, dayNumber]);

  // ====================================================
  // THEO DÕI GPS HIỆN TẠI
  // ====================================================

  // Hook đã lọc vị trí sai số lớn, vị trí nhảy bất thường và vị trí ngoài Việt Nam.
  const tracker = useGpsTracker(
    dayStatus === 'IN_PROGRESS',
  );

  const fix = tracker.fix;

  const fixRef = useRef(fix);
  fixRef.current = fix;

  const myLocation: Coordinate | null =
    fix?.coordinate ?? null;

  const gpsMessage = tracker.message;

  // ====================================================
  // THỬ LẤY LẠI GPS
  // ====================================================

  const retryGps = () => {
    setPicking(false);

    // Có vị trí mới thì tính lại đường ngay.
    lastRouteRequest.current = null;

    tracker.retry();
  };

  // ====================================================
  // GỌI GOONG DIRECTIONS
  // ====================================================

  /**
   * Tính lại tuyến khi:
   * - Đổi địa điểm tiếp theo.
   * - Đổi phương tiện.
   * - Người dùng nhấn tính lại đường.
   * - GPS thay đổi sau khoảng thời gian giới hạn.
   */
  useEffect(() => {
    if (
      !validIds ||
      dayStatus !== 'IN_PROGRESS' ||
      !pendingStop ||
      !myLocation
    ) {
      routeSequence.current += 1;

      setRoute(null);
      setRouteError(null);
      setRouteLoading(false);

      lastRouteRequest.current = null;
      return;
    }

    const now = Date.now();

    const last = lastRouteRequest.current;

    const sameTarget =
      last?.itemId === pendingStop.itemId &&
      last.vehicle === vehicle;

    if (sameTarget && last) {
      // Đang đi đúng tuyến đã tính: không cần hỏi Goong lại.
      // Đi chệch tuyến thì bên dưới (hiệu ứng "chệch tuyến") tự yêu cầu tính lại.
      if (onRouteRef.current) {
        return;
      }

      const moved = distanceMeters(
        {
          latitude: last.location[0],
          longitude: last.location[1],
        },
        {
          latitude: myLocation[0],
          longitude: myLocation[1],
        },
      );

      const elapsed = now - last.time;

      // Không gọi Goong quá thường xuyên.
      if (
        elapsed < 12_000 ||
        (moved < 80 && elapsed < 45_000)
      ) {
        return;
      }
    }

    lastRouteRequest.current = {
      itemId: pendingStop.itemId,
      location: myLocation,
      vehicle,
      time: now,
    };

    const requestId =
      ++routeSequence.current;

    setRouteLoading(true);
    setRouteError(null);

    tripFlowApi
      .nextTripRoute(
        planId,
        dayNumber,
        myLocation[0],
        myLocation[1],
        vehicle,
        fixRef.current?.accuracy,
      )
      .then((response) => {
        if (
          !mountedRef.current ||
          routeSequence.current !== requestId ||
          latestNextItemRef.current !==
          response.itemId
        ) {
          return;
        }

        setRoute(response);
      })
      .catch((error: unknown) => {
        if (
          !mountedRef.current ||
          routeSequence.current !== requestId
        ) {
          return;
        }

        setRouteError(
          errorMessage(error),
        );

        setRoute(null);
      })
      .finally(() => {
        if (
          mountedRef.current &&
          routeSequence.current === requestId
        ) {
          setRouteLoading(false);
        }
      });
  }, [
    validIds,
    planId,
    dayNumber,
    dayStatus,
    pendingStop,
    myLocation,
    vehicle,
    rerouteVersion,
  ]);

  // ====================================================
  // GIẢI MÃ TUYẾN GOONG CHO MAPLIBRE
  // ====================================================

  const routeCoordinates = useMemo(() => {
    if (
      !route ||
      route.itemId !== nextItemId
    ) {
      return null;
    }

    const result = decodePolyline(
      route.route.polyline ?? '',
    );

    return result.length > 1
      ? result
      : null;
  }, [route, nextItemId]);

  // Xem toàn tuyến một lần cho mỗi địa điểm. Không căn lại ở mỗi lần tính lại đường,
  // và không làm khi đang bám theo vị trí (camera đã đi theo người dùng).
  useEffect(() => {
    if (!routeCoordinates || nextItemId === null) {
      return;
    }

    if (fittedItemRef.current === nextItemId) {
      return;
    }

    fittedItemRef.current = nextItemId;

    if (!following) {
      mapRef.current?.fitRoute();
    }
  }, [routeCoordinates, nextItemId, following]);

  // ====================================================
  // DẪN ĐƯỜNG: BÁM TUYẾN, CHỈ DẪN, CÒN BAO XA
  // ====================================================

  const routeForStop =
    route && route.itemId === nextItemId
      ? route
      : null;

  const routeSteps = useMemo(
    () => routeForStop?.route.steps ?? [],
    [routeForStop],
  );

  const routeIndex = useMemo(
    () =>
      routeCoordinates
        ? buildRouteIndex(routeCoordinates)
        : null,
    [routeCoordinates],
  );

  // Mỗi bước rẽ nằm cách đầu tuyến bao nhiêu mét.
  const stepOffsets = useMemo(
    () =>
      routeIndex && routeSteps.length > 0
        ? stepPositions(routeIndex, routeSteps)
        : [],
    [routeIndex, routeSteps],
  );

  // Chiếu vị trí lên tuyến (như "snap to route" của Google Maps).
  const snap = useMemo(
    () =>
      routeIndex && myLocation
        ? snapToRoute(routeIndex, myLocation)
        : null,
    [routeIndex, myLocation],
  );

  // GPS lệch tuyến nhỏ hơn mức này (theo sai số GPS) vẫn coi là đang đi đúng đường.
  const onRouteLimit = Math.min(
    120,
    Math.max(35, (fix?.accuracy ?? 0) * 1.2),
  );

  const onRoute = Boolean(
    snap && snap.distanceFromRoute <= onRouteLimit,
  );

  onRouteRef.current = onRoute;

  // Chấm xanh nằm trên đường khi đang đi đúng tuyến, thay vì rung quanh đường.
  const displayLocation: Coordinate | null =
    snap && onRoute
      ? snap.coordinate
      : myLocation;

  const routeProgress = useMemo(
    () =>
      snap && onRoute
        ? {
          segmentIndex: snap.segmentIndex,
          point: snap.coordinate,
        }
        : null,
    [snap, onRoute],
  );

  // Quãng đường và thời gian còn lại, cập nhật liên tục theo vị trí.
  const remaining = useMemo(() => {
    if (!routeForStop) return null;

    const {
      distanceMeters: totalMeters,
      durationSeconds,
    } = routeForStop.route;

    if (snap && onRoute && routeIndex && routeIndex.total > 0) {
      const left = Math.max(
        0,
        1 - snap.along / routeIndex.total,
      );

      return {
        meters: totalMeters * left,
        seconds: durationSeconds * left,
      };
    }

    return {
      meters: totalMeters,
      seconds: durationSeconds,
    };
  }, [routeForStop, snap, onRoute, routeIndex]);

  // Đã đến gần địa điểm (bán kính theo sai số GPS). Chỉ gợi ý;
  // việc xác nhận "Đã đến" vẫn do Traveller bấm.
  const destination: Coordinate | null =
    pendingStop && hasCoordinates(pendingStop)
      ? [pendingStop.latitude, pendingStop.longitude]
      : null;

  const arrived = Boolean(
    dayStatus === 'IN_PROGRESS' &&
    myLocation &&
    destination &&
    distanceBetween(myLocation, destination) <=
    arrivalRadius(fix?.accuracy),
  );

  // Chỉ dẫn lớn ở đầu bản đồ: "Sau 200 m — Rẽ phải vào ...".
  const guidance = useMemo(() => {
    if (
      !pendingStop ||
      dayStatus !== 'IN_PROGRESS'
    ) {
      return null;
    }

    if (arrived) {
      return {
        icon: 'flag',
        title: 'Bạn đã đến nơi',
        text: pendingStop.placeName,
      };
    }

    if (!routeForStop) return null;

    // Đã chệch tuyến, đang chờ tuyến mới.
    if (snap && !onRoute) {
      return {
        icon: 'alt_route',
        title: 'Bạn đã chệch tuyến',
        text: routeLoading
          ? 'Đang tính lại đường...'
          : 'Đang chờ tuyến đường mới',
      };
    }

    if (routeSteps.length === 0) return null;

    if (snap && onRoute) {
      const next = upcomingStep(
        routeSteps,
        stepOffsets,
        snap.along,
      );

      if (next) {
        return {
          icon: maneuverIcon(next.step.maneuver),
          title: `Sau ${formatMeters(next.distance)}`,
          text: next.step.instruction,
        };
      }

      // Chặng cuối: đi thẳng tới điểm đến.
      return {
        icon: 'straight',
        title: remaining
          ? `Còn ${formatMeters(remaining.meters)}`
          : 'Đi thẳng',
        text: `Đi tới ${pendingStop.placeName}`,
      };
    }

    // Chưa bám được tuyến: hiện chỉ dẫn đầu tiên.
    const first = routeSteps[0];

    return {
      icon: maneuverIcon(first.maneuver),
      title: formatMeters(first.distanceMeters),
      text: first.instruction,
    };
  }, [
    pendingStop,
    dayStatus,
    arrived,
    routeForStop,
    routeSteps,
    stepOffsets,
    snap,
    onRoute,
    remaining,
    routeLoading,
  ]);

  // ====================================================
  // CHỆCH TUYẾN: TỰ TÍNH LẠI ĐƯỜNG
  // ====================================================

  useEffect(() => {
    if (
      !snap ||
      !routeForStop ||
      !fix ||
      dayStatus !== 'IN_PROGRESS'
    ) {
      offRouteCount.current = 0;
      return;
    }

    if (onRoute) {
      offRouteCount.current = 0;
      return;
    }

    // Cần hai lần GPS liên tiếp cùng lệch để không tính lại vì một điểm GPS nhiễu.
    offRouteCount.current += 1;

    if (offRouteCount.current < 2 || routeLoading) {
      return;
    }

    const now = Date.now();

    // Không hỏi Goong dồn dập khi đang đi vòng.
    if (now - lastOffRouteReroute.current < 8_000) {
      return;
    }

    lastOffRouteReroute.current = now;
    offRouteCount.current = 0;

    lastRouteRequest.current = null;

    setRerouteVersion((value) => value + 1);
  }, [snap, onRoute, routeForStop, fix, dayStatus, routeLoading]);

  const refreshRoute = () => {
    if (!myLocation) {
      retryGps();
      return;
    }

    lastRouteRequest.current = null;

    setRerouteVersion(
      (value) => value + 1,
    );
  };

  // ====================================================
  // BẮT ĐẦU NGÀY
  // ====================================================

  const startDay = async () => {
    if (!validIds || busy) return;

    setBusy(true);

    try {
      const result =
        await tripFlowApi.startTripDay(
          planId,
          dayNumber,
        );

      setProgress(result);

      showNotice(
        `Đã bắt đầu Ngày ${dayNumber}. Đang lấy vị trí GPS...`,
      );
    } catch (error) {
      showNotice(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  };

  // ====================================================
  // HOÀN THÀNH HOẶC BỎ QUA ĐỊA ĐIỂM
  // ====================================================

  const updateStop = async (
    status: 'COMPLETED' | 'SKIPPED',
  ) => {
    if (!pendingStop || busy) return;

    setDialog(null);
    setBusy(true);

    try {
      const updated =
        await tripFlowApi.updateTripActivity(
          planId,
          dayNumber,
          pendingStop.itemId,
          status,
        );

      setProgress(updated);
      setRoute(null);

      lastRouteRequest.current = null;

      showNotice(
        status === 'COMPLETED'
          ? `Đã hoàn thành: ${pendingStop.placeName}`
          : `Đã bỏ qua: ${pendingStop.placeName}`,
      );
    } catch (error) {
      showNotice(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  };

  // ====================================================
  // HOÀN THÀNH NGÀY
  // ====================================================

  const finishDay = async () => {
    if (busy || !allHandled) return;

    setDialog(null);
    setBusy(true);

    try {
      const updated =
        await tripFlowApi.completeTripDay(
          planId,
          dayNumber,
        );

      setProgress(updated);
      setRoute(null);
      setDialog('done');
    } catch (error) {
      showNotice(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  };

  // ====================================================
  // ĐIỀU KHIỂN BẢN ĐỒ
  // ====================================================

  const focusMyPosition = () => {
    if (myLocation) {
      // Bật lại chế độ bám theo; thao tác kéo bản đồ trước đó đã tắt nó.
      setFollowing(true);

      mapRef.current?.focus(
        myLocation,
        16,
      );
    } else {
      retryGps();
    }
  };

  // ====================================================
  // TRẠNG THÁI ĐANG TẢI
  // ====================================================

  if (loading) {
    return (
      <div className="rounded-[20px] bg-white p-10 text-center text-[13px] font-semibold text-[#0891B2]">
        Đang tải hành trình và tiến độ thực tế...
      </div>
    );
  }

  // ====================================================
  // LỖI LẤY DỮ LIỆU
  // ====================================================

  if (
    loadError ||
    !currentDay ||
    !progress
  ) {
    return (
      <div className="rounded-[20px] bg-white p-6 text-center">
        <Icon
          name="error_outline"
          className="text-[36px] text-[#DC6666]"
        />

        <p className="mt-3 text-[13px] text-[#17344A]">
          {loadError ??
            'Không tìm thấy ngày trong lịch trình.'}
        </p>

        <button
          type="button"
          onClick={() => navigate(detailUrl)}
          className="mt-4 rounded-full bg-[#0E7490] px-5 py-3 text-[12px] font-bold text-white"
        >
          Về lịch trình
        </button>
      </div>
    );
  }

  const pointCenter: Coordinate =
    myLocation ??
    mapPoints[0]?.coordinate ??
    [16.05, 106.5];

  const activeId = pendingStop
    ? String(pendingStop.itemId)
    : null;

  const nextPosition = pendingStop
    ? stops.findIndex(
    (item) =>
      item.itemId === pendingStop.itemId,
  ) + 1
    : 0;

  const isRunning =
    dayStatus === 'IN_PROGRESS';

  // ====================================================
  // GIAO DIỆN
  // ====================================================

  return (
    <div className="-mx-4 -mt-4 md:mx-0 md:mt-0 md:grid md:grid-cols-[1.4fr_1fr] md:gap-4">

      {/* ============================================== */}
      {/* BẢN ĐỒ GOONG                                   */}
      {/* ============================================== */}

      <div className="relative min-w-0 isolate">

        <TravelMap
          ref={mapRef}
          className="h-[45vh] md:h-[calc(100vh-180px)] md:rounded-[20px]"
          center={pointCenter}
          points={mapPoints}
          activeId={activeId}
          visitedIds={visitedIds}
          routeCoordinates={routeCoordinates}
          userLocation={displayLocation}
          userHeading={fix?.heading ?? null}
          userAccuracy={fix?.accuracy ?? null}
          followUser={following && isRunning}
          onUserInteract={() => setFollowing(false)}
          routeProgress={routeProgress}
          pickMode={picking}
          showCompass
          onPick={(coordinate) => {
            tracker.setManual(coordinate);

            setPicking(false);

            lastRouteRequest.current = null;

            showNotice(
              'Đã dùng vị trí bạn chọn trên bản đồ để chỉ đường.',
            );
          }}
          onSelect={(id) => {
            const stop = stops.find(
              (item) =>
                String(item.itemId) === id,
            );

            if (
              stop &&
              hasCoordinates(stop)
            ) {
              mapRef.current?.focus(
                [
                  stop.latitude,
                  stop.longitude,
                ],
                15,
              );
            }
          }}
        />

        {/* HEADER BẢN ĐỒ */}

        <div className="absolute top-3 right-3 left-3 z-[400] flex items-center rounded-[19px] bg-white/95 p-2.5 shadow-md">

          <button
            type="button"
            onClick={() =>
              navigate(detailUrl)
            }
            aria-label="Về chi tiết ngày"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[13px] bg-[#F2F5F7] text-[#17344A]"
          >
            <Icon
              name="arrow_back"
              className="text-[22px]"
            />
          </button>

          <div className="min-w-0 flex-1 px-2.5">

            <p className="text-[10px] font-extrabold text-[#0E7490]">
              {dayStatus === 'COMPLETED'
                ? 'ĐÃ HOÀN THÀNH'
                : isRunning
                  ? 'ĐANG DI CHUYỂN'
                  : 'CHƯA BẮT ĐẦU'}
              {' · '}
              NGÀY {dayNumber}
            </p>

            <p className="mt-0.5 truncate text-[14px] font-extrabold text-[#17344A]">
              {currentDay.title ||
                `Ngày ${dayNumber}`}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setDialog('exit')
            }
            aria-label="Đóng bản đồ"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[13px] bg-[#F2F5F7] text-[#17344A]"
          >
            <Icon
              name="close"
              className="text-[22px]"
            />
          </button>
        </div>

        {/* CHỈ DẪN RẼ / CHỌN VỊ TRÍ */}

        {picking ? (

          <div className="absolute left-3 right-3 top-[78px] z-[400] flex items-center gap-3 rounded-[18px] bg-[#17344A] px-3.5 py-3 text-white shadow-md">

            <Icon
              name="touch_app"
              className="text-[28px]"
            />

            <p className="min-w-0 flex-1 text-[13px] font-bold leading-[18px]">
              Bấm lên bản đồ để chọn vị trí của bạn
            </p>

            <button
              type="button"
              onClick={() => setPicking(false)}
              className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-extrabold"
            >
              Hủy
            </button>

          </div>

        ) : (
          guidance && (

            <div
              className={`absolute left-3 right-3 top-[78px] z-[400] flex items-center gap-3 rounded-[18px] px-3.5 py-3 text-white shadow-md ${
                arrived ? 'bg-[#0891B2]' : 'bg-[#0E7490]'
              }`}
              aria-live="polite"
            >

              <Icon
                name={guidance.icon}
                className="text-[34px]"
              />

              <div className="min-w-0 flex-1">

                <p className="text-[18px] font-extrabold leading-[22px]">
                  {guidance.title}
                </p>

                <p className="mt-0.5 line-clamp-2 text-[12px] font-semibold leading-4 opacity-90">
                  {guidance.text}
                </p>

              </div>
            </div>

          )
        )}

        {/* NÚT ĐIỀU KHIỂN BẢN ĐỒ */}

        <div className="absolute bottom-4 right-3.5 z-[400] flex flex-col gap-2.5">

          <button
            type="button"
            onClick={() =>
              mapRef.current?.fitRoute()
            }
            aria-label="Xem tuyến Goong"
            className="flex h-[47px] w-[47px] items-center justify-center rounded-[17px] bg-white text-[#0E7490] shadow-md"
          >
            <Icon
              name="route"
              className="text-[23px]"
            />
          </button>

          <button
            type="button"
            onClick={focusMyPosition}
            aria-label="Vị trí của tôi"
            aria-pressed={following}
            className={`flex h-[47px] w-[47px] items-center justify-center rounded-[17px] shadow-md ${
              following
                ? 'bg-[#0E7490] text-white'
                : 'bg-white text-[#0E7490]'
            }`}
          >
            <Icon
              name={
                following
                  ? 'navigation'
                  : 'my_location'
              }
              className="text-[24px]"
            />
          </button>

        </div>
      </div>

      {/* ============================================== */}
      {/* THÔNG TIN HÀNH TRÌNH                            */}
      {/* ============================================== */}

      <div className="relative z-10 -mt-5 min-w-0 rounded-t-[27px] bg-white px-[17px] pb-5 pt-2.5 shadow-[0_-6px_18px_rgba(0,0,0,0.08)] md:mt-0 md:rounded-[20px] md:shadow-none">

        <span className="mx-auto mb-3.5 block h-[5px] w-[43px] rounded-full bg-[#DBE6E8] md:hidden" />

        {/* TRẠNG THÁI TIẾN ĐỘ */}

        <div className="flex items-center justify-between gap-3">

          <span className="flex items-center gap-1 rounded-full bg-[#E5F7F9] px-2.5 py-1.5 text-[10px] font-extrabold text-[#0E7490]">

            <Icon
              name={
                dayStatus === 'COMPLETED'
                  ? 'check_circle'
                  : 'navigation'
              }
              className="text-[16px]"
            />

            {dayStatus === 'COMPLETED'
              ? 'ĐÃ HOÀN THÀNH'
              : isRunning
                ? 'ĐANG THEO DÕI'
                : 'CHƯA BẮT ĐẦU'}

          </span>

          <span className="text-[12px] font-bold text-[#75879A]">
            {completedCount}/{stops.length} địa điểm
          </span>

        </div>

        {/* THANH TIẾN ĐỘ */}

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EDF2F2]">
          <div
            className="h-full rounded-full bg-[#0891B2] transition-all"
            style={{
              width: `${completedPercent}%`,
            }}
          />
        </div>

        {/* ĐỊA ĐIỂM TIẾP THEO */}

        {pendingStop ? (

          <div className="mt-4 flex items-center gap-3">

            <span className="flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-2xl bg-[#0E7490] text-[23px] font-extrabold text-white">
              {nextPosition}
            </span>

            <div className="min-w-0 flex-1">

              <p className="line-clamp-2 text-[16px] font-extrabold leading-[21px] text-[#17344A]">
                {pendingStop.placeName}
              </p>

              <p className="mt-1 flex items-center gap-1 text-[11px] text-[#75879A]">

                <Icon
                  name="location_on"
                  className="text-[15px]"
                />

                <span className="truncate">
                  {pendingStop.placeAddress ||
                    'Chưa có địa chỉ'}
                </span>

              </p>
            </div>
          </div>

        ) : (

          <p className="mt-4 rounded-2xl bg-[#E5F7F9] px-4 py-4 text-[13px] font-bold text-[#0E7490]">

            {stops.length === 0
              ? 'Ngày này không có địa điểm tham quan.'
              : 'Đã xử lý tất cả địa điểm của ngày.'}

          </p>

        )}

        {/* TRẠNG THÁI GPS */}

        <p className="mt-3 flex flex-wrap items-center gap-1 text-[11px] font-semibold text-[#526C7D]">

          <Icon
            name="my_location"
            className="text-[17px] text-[#0E7490]"
          />

          {gpsMessage}

        </p>

        {/* GIỜ THAM QUAN */}

        {pendingStop && (

          <p className="mt-2 text-[11px] text-[#75879A]">

            <Icon
              name="schedule"
              className="mr-1 inline text-[15px]"
            />

            {travelTime(pendingStop.startTime)}
            {' – '}
            {travelTime(pendingStop.endTime)}
            {' · giờ dự kiến'}

          </p>

        )}

        {/* ========================================== */}
        {/* THỜI TIẾT ĐIỂM TIẾP THEO                  */}
        {/* ========================================== */}

        {pendingStop && (
          <div className="mt-3">
            <TodayWeatherCard placeId={pendingStop.placeId} />
          </div>
        )}

        {/* ========================================== */}
        {/* TUYẾN ĐƯỜNG GOONG                          */}
        {/* ========================================== */}

        {isRunning && pendingStop && (

          <section className="mt-3 rounded-2xl border border-[#D6EDEF] bg-[#F4FBFB] px-3 py-3">

            <div className="flex items-center justify-between gap-2">

              <span className="flex items-center gap-1 text-[12px] font-extrabold text-[#0E7490]">

                <Icon
                  name="route"
                  className="text-[18px]"
                />

                Tuyến đường Goong

              </span>

              {/* CHỌN PHƯƠNG TIỆN */}

              <select
                aria-label="Phương tiện chỉ đường"
                value={vehicle}
                onChange={(event) => {
                  setVehicle(
                    event.target.value as GoongVehicle,
                  );

                  setRoute(null);
                  lastRouteRequest.current = null;
                }}
                className="rounded-xl border border-[#CEE6E8] bg-white px-2 py-1.5 text-[11px] font-bold text-[#14364F]"
              >

                {VEHICLES.map((item) => (

                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>

                ))}
              </select>
            </div>

            {/* KHOẢNG CÁCH VÀ THỜI GIAN */}

            {remaining ? (

              <p className="mt-2 text-[12px] font-bold text-[#14364F]">

                {'Còn '}

                {formatMeters(remaining.meters)}

                {' · '}

                {formatSeconds(remaining.seconds)}

                {' · thời gian dự kiến'}

              </p>

            ) : (

              <p className="mt-2 text-[11px] text-[#617388]">

                {routeLoading
                  ? 'Đang tính tuyến đường bám phố...'
                  : 'Chưa có tuyến đường. Bật GPS để tính tuyến Goong.'}

              </p>

            )}

            {routeError && (

              <p
                role="alert"
                className="mt-2 text-[11px] text-red-600"
              >
                {routeError}
              </p>

            )}

            {tracker.suspicious && tracker.rejected && (

              <div
                role="alert"
                className="mt-2 rounded-xl bg-[#FFF4E5] px-3 py-2 text-[11px] leading-4 text-[#8A5300]"
              >

                <p className="font-extrabold">
                  Vị trí GPS có vẻ không đúng
                </p>

                <p className="mt-0.5">
                  {`Trình duyệt báo bạn đang ở (${tracker.rejected[0].toFixed(2)}, ${tracker.rejected[1].toFixed(2)}), ngoài Việt Nam. Có thể do VPN, giả lập vị trí hoặc định vị theo IP. Hãy thử lại hoặc chọn vị trí của bạn trên bản đồ.`}
                </p>

              </div>

            )}

            {fix?.lowAccuracy && !tracker.manual && (

              <p className="mt-2 text-[11px] text-[#8A5300]">
                {`GPS chưa chính xác (sai số khoảng ${Math.round(fix.accuracy)} m) nên đường đi có thể lệch. Ra chỗ thoáng hoặc dùng điện thoại để có GPS tốt hơn.`}
              </p>

            )}

            {!myLocation && !tracker.suspicious && (

              <p className="mt-1 text-[11px] text-[#BD4F4F]">
                Chưa có GPS nên chưa thể chỉ đường.
              </p>

            )}

            {/* NÚT TÍNH LẠI TUYẾN */}

            <div className="mt-3 flex flex-wrap gap-2">

              <button
                type="button"
                onClick={refreshRoute}
                disabled={routeLoading}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[11px] font-extrabold text-[#0E7490] disabled:opacity-50"
              >

                <Icon
                  name="refresh"
                  className="text-[16px]"
                />

                Tính lại đường

              </button>

              <button
                type="button"
                onClick={focusMyPosition}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[11px] font-extrabold text-[#0E7490]"
              >

                <Icon
                  name="my_location"
                  className="text-[16px]"
                />

                Lấy GPS

              </button>

              {myLocation && (

                <button
                  type="button"
                  onClick={() => {
                    if (following) {
                      setFollowing(false);
                    } else {
                      focusMyPosition();
                    }
                  }}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-[11px] font-extrabold ${
                    following
                      ? 'bg-[#0E7490] text-white'
                      : 'bg-white text-[#0E7490]'
                  }`}
                >

                  <Icon
                    name="navigation"
                    className="text-[16px]"
                  />

                  {following
                    ? 'Dừng bám theo'
                    : 'Bắt đầu dẫn đường'}

                </button>

              )}

              <button
                type="button"
                onClick={() => setPicking((value) => !value)}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[11px] font-extrabold text-[#0E7490]"
              >

                <Icon
                  name="pin_drop"
                  className="text-[16px]"
                />

                Chọn vị trí của tôi

              </button>

              {tracker.manual && (

                <button
                  type="button"
                  onClick={() => {
                    lastRouteRequest.current = null;
                    tracker.clearManual();
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[11px] font-extrabold text-[#0E7490]"
                >

                  <Icon
                    name="gps_fixed"
                    className="text-[16px]"
                  />

                  Dùng GPS thật

                </button>

              )}

            </div>
          </section>

        )}

        {/* ========================================== */}
        {/* DANH SÁCH ĐỊA ĐIỂM CỦA NGÀY                 */}
        {/* ========================================== */}

        <div className="mt-3 flex gap-2 overflow-x-auto py-2">

          {stops.map((stop) => {
            const status = statusOf(stop.itemId);

            return (
              <button
                key={stop.itemId}
                type="button"
                onClick={() => {

                  if (hasCoordinates(stop)) {

                    mapRef.current?.focus(
                      [
                        stop.latitude,
                        stop.longitude,
                      ],
                      15,
                    );

                  } else {

                    showNotice(
                      'Địa điểm này chưa có tọa độ trên bản đồ.',
                    );

                  }
                }}
                aria-current={
                  pendingStop?.itemId === stop.itemId
                    ? 'step'
                    : undefined
                }
                className={`shrink-0 rounded-[13px] px-3.5 py-2 text-[11px] font-extrabold ${
                  status !== 'PENDING'
                    ? 'bg-[#E7EBED] text-[#64747D]'
                    : pendingStop?.itemId === stop.itemId
                      ? 'bg-[#0E7490] text-white'
                      : 'bg-[#EEF2F5] text-[#17344A]'
                }`}
              >

                {status === 'PENDING'
                  ? stop.itemOrder
                  : status === 'COMPLETED'
                    ? '✓'
                    : '−'}

                {' · '}

                {travelTime(stop.startTime)}

              </button>
            );
          })}

        </div>

        {/* ========================================== */}
        {/* NHẬN XÉT ĐỊA ĐIỂM                         */}
        {/* ========================================== */}

        {pendingStop && isRunning && (
          <StopReviewCard
            key={pendingStop.placeId}
            placeId={pendingStop.placeId}
            stopTitle={pendingStop.placeName}
          />
        )}

        {/* ========================================== */}
        {/* BẮT ĐẦU NGÀY                               */}
        {/* ========================================== */}

        {dayStatus === 'NOT_STARTED' && (

          <button
            type="button"
            onClick={() =>
              void startDay()
            }
            disabled={busy}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0E7490] px-4 text-[13px] font-extrabold text-white disabled:opacity-60"
          >

            <Icon
              name="navigation"
              className="text-[20px]"
            />

            Bắt đầu chuyến đi — Ngày {dayNumber}

          </button>

        )}

        {/* ========================================== */}
        {/* HOÀN THÀNH / BỎ QUA ĐỊA ĐIỂM               */}
        {/* ========================================== */}

        {isRunning && pendingStop && (

          <div className="mt-3 flex gap-2.5">

            <button
              type="button"
              onClick={() =>
                setDialog('skip')
              }
              disabled={busy}
              className="flex h-[51px] flex-[0.85] items-center justify-center gap-1 rounded-2xl bg-[#E5F7F9] px-2 text-[12px] font-extrabold text-[#0E7490] disabled:opacity-50"
            >

              <Icon
                name="skip_next"
                className="text-[20px]"
              />

              Bỏ qua

            </button>

            <button
              type="button"
              onClick={() =>
                void updateStop('COMPLETED')
              }
              disabled={busy}
              className="flex h-[51px] flex-[1.3] items-center justify-center gap-1 rounded-2xl bg-[#0E7490] px-2 text-[12px] font-extrabold text-white disabled:opacity-50"
            >

              <Icon
                name="check_circle"
                className="text-[20px]"
              />

              Đã đến · Tiếp tục

            </button>

          </div>

        )}

        {/* ========================================== */}
        {/* HOÀN THÀNH NGÀY                            */}
        {/* ========================================== */}

        {isRunning && allHandled && (

          <button
            type="button"
            onClick={() =>
              setDialog('finish')
            }
            disabled={busy}
            className="mt-3 flex h-[51px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0E7490] text-[13px] font-extrabold text-white disabled:opacity-50"
          >

            <Icon
              name="done_all"
              className="text-[21px]"
            />

            Hoàn thành Ngày {dayNumber}

          </button>

        )}

        {/* NGÀY ĐÃ HOÀN THÀNH */}

        {dayStatus === 'COMPLETED' && (

          <button
            type="button"
            onClick={() =>
              navigate(detailUrl)
            }
            className="mt-3 flex h-[51px] w-full items-center justify-center gap-2 rounded-2xl bg-[#0E7490] text-[13px] font-extrabold text-white"
          >

            <Icon
              name="arrow_back"
              className="text-[20px]"
            />

            Về chi tiết lịch trình

          </button>

        )}

        <p className="mt-3 text-center text-[10px] leading-5 text-[#75879A]">
          Goong cung cấp tuyến và thời gian dự kiến.
          Bạn tự xác nhận đã đến địa điểm;
          không tự động đánh dấu chỉ dựa vào GPS.
        </p>

      </div>

      {/* ============================================== */}
      {/* DIALOG — ĐÓNG BẢN ĐỒ                            */}
      {/* ============================================== */}

      {dialog === 'exit' && (

        <ConfirmDialog
          title="Đóng bản đồ?"
          message="Tiến độ đã được lưu trên Backend. Bạn có thể trở lại và tiếp tục hành trình sau."
          cancelLabel="Ở lại"
          confirmLabel="Về lịch trình"
          onClose={() =>
            setDialog(null)
          }
          onConfirm={() =>
            navigate(detailUrl)
          }
        />

      )}

      {/* ============================================== */}
      {/* DIALOG — BỎ QUA ĐỊA ĐIỂM                       */}
      {/* ============================================== */}

      {dialog === 'skip' && pendingStop && (

        <ConfirmDialog
          title="Bỏ qua địa điểm này?"
          message={`Bỏ qua “${pendingStop.placeName}” và chuyển tới địa điểm tiếp theo?`}
          cancelLabel="Giữ địa điểm"
          confirmLabel="Bỏ qua"
          onClose={() =>
            setDialog(null)
          }
          onConfirm={() =>
            void updateStop('SKIPPED')
          }
        />

      )}

      {/* ============================================== */}
      {/* DIALOG — HOÀN THÀNH NGÀY                       */}
      {/* ============================================== */}

      {dialog === 'finish' && (

        <ConfirmDialog
          title={`Hoàn thành Ngày ${dayNumber}?`}
          message="Các địa điểm của ngày đã được hoàn thành hoặc bỏ qua. Tiến độ sẽ được lưu vĩnh viễn."
          cancelLabel="Để sau"
          confirmLabel="Hoàn thành ngày"
          onClose={() =>
            setDialog(null)
          }
          onConfirm={() =>
            void finishDay()
          }
        />

      )}

      {/* ============================================== */}
      {/* DIALOG — HOÀN THÀNH THÀNH CÔNG                  */}
      {/* ============================================== */}

      {dialog === 'done' && (

        <ConfirmDialog
          title={`Đã hoàn thành Ngày ${dayNumber}`}
          message="Tiến độ đã lưu thành công. Bạn có thể xem ngày tiếp theo trong lịch trình."
          cancelLabel="Xem bản đồ"
          confirmLabel="Về chi tiết lịch trình"
          onClose={() =>
            setDialog(null)
          }
          onConfirm={() =>
            navigate(detailUrl)
          }
        />

      )}

      <NoticeToast message={notice} />

    </div>
  );
}
