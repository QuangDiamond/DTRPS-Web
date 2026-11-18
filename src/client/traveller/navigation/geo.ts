/**
 * Hàm tính toán cho dẫn đường: khoảng cách, hướng đi, bám vào tuyến Goong, bước rẽ.
 * Toàn bộ là hàm thuần (không đụng DOM/React) nên dễ kiểm thử.
 *
 * Tọa độ luôn là [vĩ độ, kinh độ], giống backend.
 */

export type Coordinate = [number, number];

const EARTH_RADIUS_METERS = 6_371_000;

const toRad = (degrees: number) => (degrees * Math.PI) / 180;
const toDeg = (radians: number) => (radians * 180) / Math.PI;

/** Khoảng cách đường chim bay giữa hai điểm (mét, haversine). */
export function distanceBetween(a: Coordinate, b: Coordinate): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Hướng từ a tới b, độ theo chiều kim đồng hồ từ hướng Bắc (0–360). */
export function bearingBetween(from: Coordinate, to: Coordinate): number {
  const dLng = toRad(to[1] - from[1]);
  const lat1 = toRad(from[0]);
  const lat2 = toRad(to[0]);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Vị trí có nằm trong vùng Việt Nam (kể cả hai quần đảo) không.
 * Ứng dụng chỉ phục vụ du lịch Việt Nam, nên GPS nằm ngoài vùng này
 * gần như chắc chắn là sai (VPN, giả lập vị trí, định vị theo IP).
 */
export function isLikelyInVietnam([lat, lng]: Coordinate): boolean {
  return lat >= 8 && lat <= 24 && lng >= 102 && lng <= 118;
}

/** Bán kính "đã đến nơi" (mét): theo sai số GPS nhưng kẹp trong 50–100 m. Khớp backend. */
export function arrivalRadius(accuracy: number | null | undefined): number {
  const value =
    typeof accuracy === 'number' && Number.isFinite(accuracy) ? accuracy : 0;

  return Math.min(100, Math.max(50, value));
}

// ======================================================
// BÁM VÀO TUYẾN ĐƯỜNG
// ======================================================

export interface RouteIndex {
  points: Coordinate[];

  /** cumulative[i] = quãng đường (mét) từ điểm đầu tới điểm i. */
  cumulative: number[];

  /** Tổng chiều dài tuyến (mét). */
  total: number;
}

export function buildRouteIndex(points: Coordinate[]): RouteIndex {
  const cumulative: number[] = [0];

  for (let i = 1; i < points.length; i++) {
    cumulative.push(
      cumulative[i - 1] + distanceBetween(points[i - 1], points[i]),
    );
  }

  return {
    points,
    cumulative,
    total: cumulative[cumulative.length - 1] ?? 0,
  };
}

export interface RouteSnap {
  /** Điểm gần nhất nằm trên tuyến. */
  coordinate: Coordinate;

  /** Đoạn [segmentIndex, segmentIndex + 1] chứa điểm đó. */
  segmentIndex: number;

  /** Khoảng cách từ vị trí thật tới tuyến (mét). */
  distanceFromRoute: number;

  /** Đã đi được bao nhiêu mét dọc theo tuyến. */
  along: number;
}

/**
 * Chiếu vị trí lên tuyến đường (như Google Maps "snap to route").
 * Dùng phép chiếu phẳng quanh vị trí — đủ chính xác với khoảng cách vài trăm mét.
 */
export function snapToRoute(
  index: RouteIndex,
  position: Coordinate,
): RouteSnap | null {
  const { points, cumulative } = index;

  if (points.length < 2) return null;

  const cosLat = Math.cos(toRad(position[0]));
  const metersPerDegLat = (Math.PI / 180) * EARTH_RADIUS_METERS;
  const metersPerDegLng = metersPerDegLat * cosLat;

  const toXY = (point: Coordinate): [number, number] => [
    (point[1] - position[1]) * metersPerDegLng,
    (point[0] - position[0]) * metersPerDegLat,
  ];

  let best: RouteSnap | null = null;
  let bestDistance = Infinity;

  let [ax, ay] = toXY(points[0]);

  for (let i = 0; i < points.length - 1; i++) {
    const [bx, by] = toXY(points[i + 1]);

    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;

    // Vị trí người dùng là gốc (0, 0).
    let t =
      lengthSquared === 0 ? 0 : -(ax * dx + ay * dy) / lengthSquared;

    t = Math.max(0, Math.min(1, t));

    const px = ax + t * dx;
    const py = ay + t * dy;
    const distance = Math.hypot(px, py);

    if (distance < bestDistance) {
      bestDistance = distance;

      const a = points[i];
      const b = points[i + 1];

      best = {
        coordinate: [
          a[0] + (b[0] - a[0]) * t,
          a[1] + (b[1] - a[1]) * t,
        ],
        segmentIndex: i,
        distanceFromRoute: distance,
        along: cumulative[i] + (cumulative[i + 1] - cumulative[i]) * t,
      };
    }

    ax = bx;
    ay = by;
  }

  return best;
}

/** Phần tuyến đã đi và phần còn lại, để vẽ hai màu khác nhau. */
export function splitRoute(
  index: RouteIndex,
  snap: RouteSnap,
): { done: Coordinate[]; todo: Coordinate[] } {
  const { points } = index;

  return {
    done: [...points.slice(0, snap.segmentIndex + 1), snap.coordinate],
    todo: [snap.coordinate, ...points.slice(snap.segmentIndex + 1)],
  };
}

// ======================================================
// CHỈ DẪN TỪNG BƯỚC RẼ
// ======================================================

export interface StepLike {
  instruction: string;
  maneuver: string | null;
  distanceMeters: number;
  startLatitude: number;
  startLongitude: number;
}

/** Mỗi bước nằm cách đầu tuyến bao nhiêu mét (không giảm dần). */
export function stepPositions(
  index: RouteIndex,
  steps: StepLike[],
): number[] {
  let last = 0;

  return steps.map((step) => {
    const snap = snapToRoute(index, [step.startLatitude, step.startLongitude]);

    last = Math.max(last, snap?.along ?? last);

    return last;
  });
}

/**
 * Chỉ dẫn rẽ kế tiếp phía trước. Bước i bắt đầu tại positions[i];
 * bước đang đi là bước cuối cùng đã qua điểm bắt đầu.
 * Trả null khi đang ở bước cuối (đi thẳng tới điểm đến).
 */
export function upcomingStep(
  steps: StepLike[],
  positions: number[],
  along: number,
): { step: StepLike; distance: number } | null {
  let current = 0;

  for (let i = 0; i < steps.length; i++) {
    if (positions[i] <= along + 10) current = i;
  }

  const next = steps[current + 1];

  return next
    ? { step: next, distance: Math.max(0, positions[current + 1] - along) }
    : null;
}

/** Tên icon Material Symbols cho một bước rẽ của Goong. */
export function maneuverIcon(maneuver: string | null | undefined): string {
  const value = (maneuver ?? '').toLowerCase();

  if (value.includes('uturn')) return 'u_turn_left';
  if (value.includes('roundabout')) {
    return value.includes('left') ? 'roundabout_left' : 'roundabout_right';
  }
  if (value.includes('sharp-left')) return 'turn_sharp_left';
  if (value.includes('sharp-right')) return 'turn_sharp_right';
  if (value.includes('slight-left')) return 'turn_slight_left';
  if (value.includes('slight-right')) return 'turn_slight_right';
  if (value.includes('left')) return 'turn_left';
  if (value.includes('right')) return 'turn_right';
  if (value.includes('merge')) return 'merge';

  return 'straight';
}

/** "120 m", "1.4 km" — làm tròn như Google Maps. */
export function formatMeters(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  if (meters >= 100) return `${Math.round(meters / 10) * 10} m`;

  return `${Math.round(meters / 5) * 5} m`;
}

/** "5 phút", "1 giờ 20 phút". */
export function formatSeconds(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));

  if (minutes < 60) return `${minutes} phút`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}

// ======================================================
// VÒNG TRÒN SAI SỐ GPS
// ======================================================

/** Đa giác xấp xỉ đường tròn bán kính `radius` mét, định dạng GeoJSON [lng, lat]. */
export function circleRing(
  center: Coordinate,
  radius: number,
  segments = 48,
): [number, number][] {
  const metersPerDegLat = (Math.PI / 180) * EARTH_RADIUS_METERS;
  const metersPerDegLng = metersPerDegLat * Math.cos(toRad(center[0]));

  const ring: [number, number][] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (2 * Math.PI * i) / segments;

    ring.push([
      center[1] + (radius * Math.sin(angle)) / metersPerDegLng,
      center[0] + (radius * Math.cos(angle)) / metersPerDegLat,
    ]);
  }

  return ring;
}
