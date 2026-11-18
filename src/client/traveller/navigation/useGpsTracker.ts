import { useCallback, useEffect, useState } from 'react';

import {
  bearingBetween,
  distanceBetween,
  isLikelyInVietnam,
  type Coordinate,
} from './geo';

/**
 * Theo dõi GPS của trình duyệt và lọc bớt vị trí xấu trước khi dùng để dẫn đường.
 *
 * Trình duyệt chỉ báo vị trí, không đảm bảo đúng: máy tính để bàn thường định vị
 * theo Wi-Fi/IP (sai số hàng trăm mét đến vài km), VPN hoặc công cụ giả lập vị trí
 * có thể đưa ra tọa độ ở nước khác. Hook này:
 *  - bỏ vị trí có sai số quá lớn (trừ khi chờ mãi không có vị trí tốt hơn),
 *  - bỏ vị trí "nhảy" xa bất thường,
 *  - không dùng vị trí nằm ngoài Việt Nam, báo `suspicious` để giao diện cho chọn tay,
 *  - giữ vị trí ổn định khi đứng yên và tính hướng đi từ chuyển động.
 */

export interface GpsFix {
  coordinate: Coordinate;

  /** Sai số (mét). */
  accuracy: number;

  /** Hướng đi (độ từ hướng Bắc) hoặc null khi chưa biết. */
  heading: number | null;

  /** Tốc độ (m/s) hoặc null. */
  speed: number | null;

  timestamp: number;

  /** Sai số lớn, chỉ mang tính tham khảo. */
  lowAccuracy: boolean;

  /** Vị trí do người dùng chọn tay trên bản đồ. */
  manual: boolean;
}

export interface GpsTracker {
  /** Vị trí dùng được để dẫn đường; null khi chưa có hoặc đang bị nghi sai. */
  fix: GpsFix | null;

  message: string;

  /** GPS báo vị trí ngoài Việt Nam: không dùng, chờ người dùng chọn tay hoặc thử lại. */
  suspicious: boolean;

  /** Tọa độ bị loại vì nghi sai (để hiển thị cho người dùng). */
  rejected: Coordinate | null;

  manual: boolean;

  /** Bắt đầu lại việc dò GPS từ đầu. */
  retry: () => void;

  setManual: (coordinate: Coordinate) => void;

  clearManual: () => void;
}

/** Sai số tối đa chấp nhận ngay (mét). */
const MAX_ACCURACY_METERS = 500;

/** Chờ bao lâu trước khi chịu dùng vị trí sai số lớn nếu không có gì tốt hơn. */
const POOR_FIX_FALLBACK_MS = 15_000;

/** Sai số lớn hơn mức này thì đánh dấu lowAccuracy. */
const LOW_ACCURACY_METERS = 200;

/** Nhảy xa hơn mức này, với tốc độ ngầm định lớn hơn mức dưới, bị coi là bất thường. */
const JUMP_DISTANCE_METERS = 500;
const JUMP_SPEED_MPS = 60;

/** Số lần liên tiếp cùng báo một chỗ mới thì tin là người dùng thật sự đã tới đó. */
const JUMP_CONFIRMATIONS = 3;

/** Đã đi ít hơn mức này (và gần như đứng yên) thì giữ nguyên vị trí cũ cho khỏi rung. */
const JITTER_METERS = 15;

/** Chỉ tính hướng đi từ chuyển động khi đã đi ít nhất mức này. */
const MIN_MOVE_FOR_HEADING_METERS = 8;

interface Sample {
  coordinate: Coordinate;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

function describeError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return 'Bạn chưa cấp quyền vị trí. Hãy bật định vị cho trang Web trong trình duyệt.';
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return 'Thiết bị chưa xác định được vị trí GPS.';
  }

  return 'Lấy GPS quá thời gian chờ. Bạn có thể thử lại.';
}

export function useGpsTracker(enabled: boolean): GpsTracker {
  const [rawFix, setRawFix] = useState<GpsFix | null>(null);
  const [manualFix, setManualFix] = useState<GpsFix | null>(null);
  const [message, setMessage] = useState('Chưa bật định vị');
  const [rejected, setRejected] = useState<Coordinate | null>(null);

  // Tăng lên để khởi động lại việc dò GPS.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    if (!('geolocation' in navigator)) {
      setMessage('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }

    if (!window.isSecureContext) {
      setMessage('GPS yêu cầu HTTPS hoặc localhost.');
      return;
    }

    setMessage('Đang lấy GPS hiện tại...');
    setRawFix(null);
    setRejected(null);

    let last: GpsFix | null = null;
    let bestPoor: Sample | null = null;
    let jumpCandidates: Sample[] = [];
    let fallbackTimer: number | undefined;

    const publish = (fix: GpsFix) => {
      last = fix;
      setRawFix(fix);
      setRejected(null);
      setMessage(
        fix.lowAccuracy
          ? `GPS chưa chính xác · sai số khoảng ${Math.round(fix.accuracy)} m`
          : `GPS đã bật · sai số khoảng ${Math.round(fix.accuracy)} m`,
      );
    };

    const accept = (sample: Sample) => {
      let coordinate = sample.coordinate;
      let heading = sample.heading;

      if (last) {
        const moved = distanceBetween(last.coordinate, coordinate);
        const still = sample.speed === null || sample.speed < 1;

        if (moved < Math.min(sample.accuracy, JITTER_METERS) && still) {
          // Đứng yên: giữ đúng đối tượng tọa độ cũ để giao diện không bị vẽ lại.
          coordinate = last.coordinate;
          heading = last.heading;
        } else if (heading === null && moved >= MIN_MOVE_FOR_HEADING_METERS) {
          heading = bearingBetween(last.coordinate, coordinate);
        } else if (heading === null) {
          heading = last.heading;
        }
      }

      publish({
        coordinate,
        accuracy: sample.accuracy,
        heading,
        speed: sample.speed,
        timestamp: sample.timestamp,
        lowAccuracy: sample.accuracy > LOW_ACCURACY_METERS,
        manual: false,
      });
    };

    const onPosition = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

      const sample: Sample = {
        coordinate: [latitude, longitude],
        accuracy: Number.isFinite(accuracy) ? accuracy : 10_000,
        heading:
          typeof heading === 'number' && Number.isFinite(heading)
            ? heading
            : null,
        speed:
          typeof speed === 'number' && Number.isFinite(speed) ? speed : null,
        timestamp: position.timestamp || Date.now(),
      };

      // 1. Ngoài Việt Nam: không tin, không dùng.
      if (!isLikelyInVietnam(sample.coordinate)) {
        setRejected(sample.coordinate);
        setRawFix(null);
        last = null;
        setMessage(
          'GPS báo vị trí ngoài Việt Nam nên có vẻ không đúng (VPN hoặc giả lập vị trí?).',
        );
        return;
      }

      // 2. Sai số quá lớn: chỉ nhớ lại, đợi vị trí tốt hơn.
      if (sample.accuracy > MAX_ACCURACY_METERS) {
        if (last) return; // đã có vị trí tốt, bỏ qua

        if (!bestPoor || sample.accuracy < bestPoor.accuracy) {
          bestPoor = sample;
        }

        setMessage(
          `GPS chưa chính xác (sai số khoảng ${Math.round(sample.accuracy)} m), đang chờ tín hiệu tốt hơn...`,
        );

        if (fallbackTimer === undefined) {
          fallbackTimer = window.setTimeout(() => {
            if (!last && bestPoor) accept(bestPoor);
          }, POOR_FIX_FALLBACK_MS);
        }

        return;
      }

      // 3. Nhảy xa bất thường so với vị trí trước đó.
      if (last) {
        const distance = distanceBetween(last.coordinate, sample.coordinate);
        const seconds = Math.max(
          1,
          (sample.timestamp - last.timestamp) / 1000,
        );

        if (
          distance > JUMP_DISTANCE_METERS &&
          distance / seconds > JUMP_SPEED_MPS
        ) {
          jumpCandidates = [...jumpCandidates, sample].filter(
            (candidate) =>
              distanceBetween(candidate.coordinate, sample.coordinate) < 200,
          );

          if (jumpCandidates.length < JUMP_CONFIRMATIONS) {
            setMessage('Bỏ qua vị trí GPS nhảy bất thường, đang chờ xác nhận...');
            return;
          }
        }

        jumpCandidates = [];
      }

      accept(sample);
    };

    const onError = (error: GeolocationPositionError) => {
      setMessage(describeError(error));
    };

    const watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 2_000,
      timeout: 20_000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.clearTimeout(fallbackTimer);
    };
  }, [enabled, attempt]);

  const retry = useCallback(() => {
    setManualFix(null);
    setAttempt((value) => value + 1);
  }, []);

  const setManual = useCallback((coordinate: Coordinate) => {
    setManualFix({
      coordinate,
      accuracy: 0,
      heading: null,
      speed: null,
      timestamp: Date.now(),
      lowAccuracy: false,
      manual: true,
    });
  }, []);

  const clearManual = useCallback(() => {
    setManualFix(null);
    setAttempt((value) => value + 1);
  }, []);

  const fix = manualFix ?? rawFix;

  return {
    fix,
    message: manualFix
      ? 'Đang dùng vị trí bạn chọn trên bản đồ'
      : message,
    suspicious: !manualFix && rejected !== null,
    rejected: manualFix ? null : rejected,
    manual: manualFix !== null,
    retry,
    setManual,
    clearManual,
  };
}
