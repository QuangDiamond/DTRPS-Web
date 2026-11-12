
import { useEffect, useMemo, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { Icon } from '@/components/common';
import {
  ClientApiError,
  errorMessage,
} from '@/client/api/http';

import {
  tripFlowApi,
  type ItineraryActivity,
  type ItineraryOverview,
  type ItineraryOverviewDay,
  type TripProgressResponse,
  type TripActivityStatus,
} from '@/client/api/tripFlowApi';

import {
  CLIENT_ROUTES,
  itineraryDayPath,
  liveMapPath,
  placePath,
} from '@/client/routePaths';

import { NoticeToast } from '@/client/ui/Overlay';
import PageBar, {
  BarIconButton,
} from '@/client/ui/PageBar';
import { useNotice } from '@/client/ui/useNotice';

// ======================================================
// FORMAT TIỀN VÀ THỜI GIAN
// ======================================================

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

function formatMoney(
  amount: number | null | undefined,
  currency: string,
) {
  if (amount === null || amount === undefined) {
    return 'Chưa có ước tính';
  }

  return `${moneyFormatter.format(amount)} ${currency}`;
}

function formatDate(value: string) {
  const parts = value?.split('-') ?? [];

  if (parts.length !== 3) {
    return value || 'Chưa cập nhật';
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatTime(value: string | null) {
  return value ? value.slice(0, 5) : '--:--';
}

function formatDuration(
  start: string | null,
  end: string | null,
) {
  if (!start || !end) return null;

  const [startHour, startMinute] =
    start.split(':').map(Number);

  const [endHour, endMinute] =
    end.split(':').map(Number);

  if (
    ![
      startHour,
      startMinute,
      endHour,
      endMinute,
    ].every(Number.isFinite)
  ) {
    return null;
  }

  const minutes =
    endHour * 60 +
    endMinute -
    (startHour * 60 + startMinute);

  if (minutes <= 0) return null;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return hours > 0
    ? `${hours} giờ${remainder ? ` ${remainder} phút` : ''}`
    : `${remainder} phút`;
}

// ======================================================
// COMPONENT — THẺ HOẠT ĐỘNG
// ======================================================

function ActivityCard({
                        activity,
                        index,
                        isLast,
                        currency,
                        executionStatus,
                      }: {
  activity: ItineraryActivity;
  index: number;
  isLast: boolean;
  currency: string;
  executionStatus?: TripActivityStatus;
}) {
  const duration = formatDuration(
    activity.startTime,
    activity.endTime,
  );

  const travelTime = activity.travelTimeMinutes;

  return (
    <li className="relative pb-4 pl-8 last:pb-0">

      {!isLast && (
        <span className="absolute bottom-0 left-[11px] top-5 w-[2px] bg-[#BDECE5]" />
      )}

      <span className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#DDF7EF] text-[11px] font-extrabold text-[#006B65]">
        {index + 1}
      </span>

      <article className="rounded-[18px] border border-[#E8EDF1] bg-white p-3.5 shadow-[0_2px_9px_rgba(19,54,74,0.04)]">

        {/* THỜI GIAN HOẠT ĐỘNG */}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-[14px] font-extrabold text-[#087F78]">

            <Icon
              name="schedule"
              className="text-[17px]"
            />

            {formatTime(activity.startTime)}
            {' – '}
            {formatTime(activity.endTime)}
          </span>

          {duration && (
            <span className="rounded-full bg-[#EFF0FD] px-2.5 py-1 text-[10px] font-bold text-[#657796]">
              {duration}
            </span>
          )}
        </div>

        {/* THÔNG TIN ĐỊA ĐIỂM */}

        <div className="mt-3 flex gap-3">

          <span className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-xl bg-[#E6F4F2]">

            <Icon
              name="place"
              className="text-[33px] text-[#087F78]"
            />

          </span>

          <div className="min-w-0 flex-1">

            <Link
              to={placePath(String(activity.placeId))}
              className="text-[14px] font-extrabold leading-5 text-[#14364F] hover:text-[#087F78]"
            >
              {activity.placeName}
            </Link>

            <p className="mt-1.5 flex items-start gap-1 text-[11px] leading-4 text-[#7E8DA7]">

              <Icon
                name="location_on"
                className="shrink-0 text-[16px] text-[#087F78]"
              />

              <span>
                {activity.placeAddress ||
                  'Chưa cập nhật địa chỉ'}
              </span>
            </p>

            <p className="mt-2 text-[12px] font-extrabold text-[#087F78]">
              {formatMoney(
                activity.estimatedCost,
                currency,
              )}
            </p>
          </div>
        </div>

        {/* THỜI GIAN DI CHUYỂN */}

        {travelTime !== null && travelTime > 0 && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#F4F7FB] px-3 py-2 text-[11px] leading-5 text-[#617388]">

            <Icon
              name="directions_car"
              className="shrink-0 text-[17px]"
            />

            <span>
              Thời gian di chuyển ước tính:
              {' '}
              <strong>
                {travelTime} phút
              </strong>

              {activity.transportModeName
                ? ` · ${activity.transportModeName}`
                : ''}
            </span>
          </p>
        )}

        {/* GHI CHÚ */}

        {activity.notes && (
          <p className="mt-2 flex items-start gap-2 rounded-xl bg-[#F1FBF8] px-3 py-2.5 text-[11px] leading-5 text-[#4B7470]">

            <Icon
              name="info"
              className="shrink-0 text-[17px]"
            />

            <span>
              {activity.notes}
            </span>
          </p>
        )}

        {/* TRẠNG THÁI THỰC TẾ */}

        {executionStatus &&
          executionStatus !== 'PENDING' && (

            <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#087F78]">

              <Icon
                name={
                  executionStatus === 'COMPLETED'
                    ? 'check_circle'
                    : 'skip_next'
                }
                className="text-[16px]"
              />

              {executionStatus === 'COMPLETED'
                ? 'Đã tham quan'
                : 'Đã bỏ qua'}

            </p>
          )}
      </article>
    </li>
  );
}

// ======================================================
// TRANG CHI TIẾT LỊCH TRÌNH
// ======================================================

/**
 * Đọc dữ liệu thật từ Backend:
 *
 * GET /travel-plans/{planId}/itineraries/active/overview
 *
 * GET /travel-plans/{planId}/trip-progress
 *
 * Khi Traveller bắt đầu ngày:
 *
 * POST /travel-plans/{planId}/trip-progress/days/{dayNumber}/start
 *
 * Sau đó chuyển sang TripLiveMapPage.
 */
export default function ItineraryDetailPage() {

  const navigate = useNavigate();

  const { day: rawDay } =
    useParams<{ day: string }>();

  const [searchParams] = useSearchParams();

  const rawPlanId = searchParams.get('planId');

  const planId = rawPlanId
    ? Number(rawPlanId)
    : NaN;

  const dayNumber = rawDay
    ? Number(rawDay)
    : NaN;

  const validPlanId =
    Number.isSafeInteger(planId) &&
    planId > 0;

  const validDayNumber =
    Number.isSafeInteger(dayNumber) &&
    dayNumber > 0;

  // ====================================================
  // STATE
  // ====================================================

  const [overview, setOverview] =
    useState<ItineraryOverview | null>(null);

  const [
    progressState,
    setProgressState,
  ] = useState<TripProgressResponse | null>(null);

  const [starting, setStarting] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  const [notice, showNotice] = useNotice();

  const overviewUrl = validPlanId
    ? `${CLIENT_ROUTES.ITINERARY}?planId=${planId}`
    : CLIENT_ROUTES.TRIPS;

  // ====================================================
  // LẤY LỊCH TRÌNH VÀ TIẾN ĐỘ TỪ BACKEND
  // ====================================================

  useEffect(() => {

    if (!validPlanId || !validDayNumber) {
      setOverview(null);
      setLoading(false);

      setError(
        'Thiếu mã kế hoạch hoặc số ngày hợp lệ.',
      );

      return;
    }

    let active = true;

    setOverview(null);
    setProgressState(null);
    setLoading(true);
    setError(null);

    Promise.all([
      tripFlowApi.overview(planId),
      tripFlowApi.tripProgress(planId),
    ])
      .then(([data, progress]) => {
        if (active) {
          setOverview(data);
          setProgressState(progress);
        }
      })
      .catch((caught: unknown) => {

        if (!active) return;

        if (
          caught instanceof ClientApiError &&
          caught.status === 404
        ) {
          setError(
            'Không tìm thấy lịch trình đang hoạt động của kế hoạch này.',
          );
        } else {
          setError(errorMessage(caught));
        }
      })
      .finally(() => {

        if (active) {
          setLoading(false);
        }

      });

    return () => {
      active = false;
    };

  }, [
    planId,
    validPlanId,
    validDayNumber,
    retryCount,
  ]);

  // ====================================================
  // LẤY NGÀY VÀ DANH SÁCH HOẠT ĐỘNG
  // ====================================================

  const days = useMemo(
    () =>
      [...(overview?.days ?? [])].sort(
        (a, b) => a.dayNumber - b.dayNumber,
      ),
    [overview],
  );

  const currentDay:
    | ItineraryOverviewDay
    | undefined = days.find(
    (item) => item.dayNumber === dayNumber,
  );

  const activities = useMemo(
    () =>
      [...(currentDay?.activities ?? [])].sort(
        (a, b) => a.itemOrder - b.itemOrder,
      ),
    [currentDay],
  );

  const currentIndex = days.findIndex(
    (item) => item.dayNumber === dayNumber,
  );

  const previousDay =
    currentIndex > 0
      ? days[currentIndex - 1]
      : null;

  const nextDay =
    currentIndex >= 0
      ? (days[currentIndex + 1] ?? null)
      : null;

  const dayUrl = (number: number) =>
    `${itineraryDayPath(number)}?planId=${planId}`;

  const currency = overview?.currency ?? 'VND';

  // ====================================================
  // TIẾN ĐỘ CỦA NGÀY ĐANG XEM
  // ====================================================

  const currentProgressDay =
    progressState?.days.find(
      (day) => day.dayNumber === dayNumber,
    );

  const executionStatus =
    currentProgressDay?.status ?? 'NOT_STARTED';

  const activityStatuses = new Map(
    (currentProgressDay?.activities ?? []).map(
      (entry) => [
        entry.itemId,
        entry.status,
      ],
    ),
  );

  // Kiểm tra các ngày trước chưa hoàn thành.
  const earlierUnfinished =
    progressState?.days.find(
      (entry) =>
        entry.dayNumber < dayNumber &&
        entry.status !== 'COMPLETED',
    );

  // Kiểm tra ngày khác đang được thực hiện.
  const anotherRunning =
    progressState?.days.find(
      (entry) =>
        entry.dayNumber !== dayNumber &&
        entry.status === 'IN_PROGRESS',
    );

  const startBlockedReason =
    executionStatus === 'NOT_STARTED'
      ? earlierUnfinished
        ? `Bạn cần hoàn thành Ngày ${earlierUnfinished.dayNumber} trước.`
        : anotherRunning
          ? `Ngày ${anotherRunning.dayNumber} đang thực hiện. Hãy hoàn thành ngày đó trước.`
          : null
      : null;

  // Đường dẫn trang bản đồ của ngày.
  const liveUrl = validPlanId
    ? `${liveMapPath(dayNumber)}?planId=${planId}`
    : CLIENT_ROUTES.TRIPS;

  // ====================================================
  // BẮT ĐẦU / TIẾP TỤC NGÀY THAM QUAN
  // ====================================================

  const beginDay = async () => {

    if (
      !validPlanId ||
      !validDayNumber ||
      starting
    ) {
      return;
    }

    // Ngày trước chưa hoàn thành.
    if (startBlockedReason) {
      showNotice(startBlockedReason);
      return;
    }

    // Ngày đã bắt đầu:
    // chuyển thẳng sang bản đồ Goong.
    if (executionStatus === 'IN_PROGRESS') {
      navigate(liveUrl);
      return;
    }

    // Ngày đã hoàn thành.
    if (executionStatus === 'COMPLETED') {
      return;
    }

    setStarting(true);

    try {

      // Gọi Backend lưu tiến độ ngày.
      await tripFlowApi.startTripDay(
        planId,
        dayNumber,
      );

      // Chuyển sang màn hình GPS + Goong.
      navigate(liveUrl);

    } catch (caught) {

      showNotice(errorMessage(caught));

      // Tải lại trạng thái nếu có thay đổi từ tab khác.
      try {
        const latest =
          await tripFlowApi.tripProgress(planId);

        setProgressState(latest);

      } catch {
        // Thông báo lỗi trước đã được hiển thị.
      }

    } finally {
      setStarting(false);
    }
  };

  // ====================================================
  // CHIA SẺ LỊCH TRÌNH NGÀY
  // ====================================================

  const shareDay = async () => {

    if (!overview || !currentDay) return;

    const title =
      `${overview.itineraryTitle} — Ngày ${currentDay.dayNumber}`;

    const text = [
      title,
      `Ngày tham quan: ${formatDate(currentDay.visitDate)}`,
      ...activities.map(
        (item) =>
          `${formatTime(item.startTime)}–${formatTime(item.endTime)}: ${item.placeName}`,
      ),
      `Chi phí dự kiến: ${formatMoney(
        currentDay.estimatedCost,
        currency,
      )}`,
    ].join('\n');

    try {

      if (navigator.share) {

        await navigator.share({
          title,
          text,
        });

      } else if (navigator.clipboard?.writeText) {

        await navigator.clipboard.writeText(text);

        showNotice(
          'Đã sao chép nội dung lịch trình ngày.',
        );

      } else {

        showNotice(
          'Trình duyệt không hỗ trợ chia sẻ hoặc sao chép.',
        );

      }

    } catch (caught) {

      if (
        !(
          caught instanceof DOMException &&
          caught.name === 'AbortError'
        )
      ) {
        showNotice(
          'Không thể chia sẻ nội dung lúc này.',
        );
      }
    }
  };

  // ====================================================
  // GIAO DIỆN
  // ====================================================

  return (
    <div className="mx-auto max-w-3xl pb-28 md:pb-4">

      {/* HEADER */}

      <PageBar
        title="Chi tiết lịch trình"
        subtitle={overview?.destination}
        backTo={overviewUrl}
        actions={
          currentDay ? (
            <BarIconButton
              icon="share"
              label="Chia sẻ lịch trình ngày"
              onClick={() => void shareDay()}
            />
          ) : undefined
        }
      />

      {/* ĐANG TẢI */}

      {loading && (
        <div
          role="status"
          className="rounded-[20px] bg-white p-8 text-center text-[13px] text-[#087F78]"
        >

          <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-[#C3F8F0] border-t-[#087F78]" />

          Đang tải lịch trình ...
        </div>
      )}

      {/* LỖI API */}

      {!loading && error && (
        <div
          role="alert"
          className="rounded-[20px] border border-red-100 bg-red-50 p-5"
        >

          <p className="text-[13px] text-red-700">
            {error}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">

            {validPlanId && validDayNumber && (
              <button
                type="button"
                onClick={() =>
                  setRetryCount(
                    (value) => value + 1,
                  )
                }
                className="rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[#006B65]"
              >
                Thử lại
              </button>
            )}

            <Link
              to={overviewUrl}
              className="rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[#006B65]"
            >
              Về tổng quan
            </Link>
          </div>
        </div>
      )}

      {/* NGÀY KHÔNG TỒN TẠI */}

      {!loading &&
        !error &&
        overview &&
        !currentDay && (

          <div className="rounded-[20px] bg-white p-8 text-center">

            <Icon
              name="event_busy"
              className="text-[40px] text-[#94B5B6]"
            />

            <h2 className="mt-3 text-[16px] font-extrabold text-[#14364F]">
              Không tìm thấy ngày {dayNumber}
            </h2>

            <p className="mt-2 text-[12px] text-[#72818C]">
              Ngày này không thuộc lịch trình đang hoạt động.
            </p>

            <Link
              to={overviewUrl}
              className="mt-4 inline-flex rounded-full bg-[#006B65] px-5 py-3 text-[12px] font-bold text-white"
            >
              Xem tất cả các ngày
            </Link>
          </div>
        )}

      {/* NỘI DUNG LỊCH TRÌNH */}

      {!loading &&
        !error &&
        overview &&
        currentDay && (
          <>

            {/* THÔNG TIN NGÀY */}

            <div className="rounded-[20px] bg-gradient-to-br from-[#DDF9F1] to-[#EDF9FB] p-4">

              <p className="flex items-center gap-1 text-[11px] font-semibold text-[#006B65]">

                <Icon
                  name="event_note"
                  className="text-[17px]"
                />

                Lịch trình · Phiên bản
                {' '}
                {overview.versionNumber}
              </p>

              <h1 className="mt-2 text-[20px] font-extrabold text-[#14364F]">
                Ngày {currentDay.dayNumber}:
                {' '}
                {currentDay.title || overview.destination}
              </h1>

              <p className="mt-1 text-[12px] text-[#617388]">
                {formatDate(currentDay.visitDate)}
                {' · '}
                {activities.length} hoạt động
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-[#006B65]">

                  Chi phí ngày:
                  {' '}
                  {formatMoney(
                    currentDay.estimatedCost,
                    currency,
                  )}
                </span>

                <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-[#506775]">

                  Tổng chuyến đi:
                  {' '}
                  {formatMoney(
                    overview.totalEstimatedCost,
                    currency,
                  )}
                </span>
              </div>

              {currentDay.notes && (
                <p className="mt-3 text-[12px] leading-5 text-[#506775]">
                  {currentDay.notes}
                </p>
              )}
            </div>

            {/* CHỌN NGÀY */}

            <div
              className="-mx-4 mb-5 mt-5 flex gap-2 overflow-x-auto px-4"
              role="tablist"
              aria-label="Chọn ngày tham quan"
            >

              {days.map((day) => (
                <Link
                  key={day.dayId}
                  to={dayUrl(day.dayNumber)}
                  replace
                  role="tab"
                  aria-selected={
                    day.dayNumber === dayNumber
                  }
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-3 text-[12px] font-extrabold ${
                    day.dayNumber === dayNumber
                      ? 'bg-[#006B65] text-white'
                      : 'bg-[#F0F1FF] text-[#667895]'
                  }`}
                >

                  <Icon
                    name="today"
                    className="text-[16px]"
                  />

                  Ngày {day.dayNumber}
                </Link>
              ))}
            </div>

            {/* DANH SÁCH HOẠT ĐỘNG */}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">

              <h2 className="text-[17px] font-extrabold text-[#14364F]">
                Các hoạt động trong ngày
              </h2>

              <span className="text-[11px] font-semibold text-[#087F78]">
                {activities.length} hoạt động
              </span>
            </div>

            {activities.length === 0 ? (

              <div className="rounded-[18px] bg-white p-6 text-center text-[12px] text-[#72818C]">
                Ngày này chưa có hoạt động được sắp xếp.
              </div>

            ) : (

              <ol>
                {activities.map((activity, index) => (

                  <ActivityCard
                    key={activity.itemId}
                    activity={activity}
                    index={index}
                    isLast={
                      index === activities.length - 1
                    }
                    currency={currency}
                    executionStatus={
                      activityStatuses.get(activity.itemId)
                    }
                  />

                ))}
              </ol>
            )}

            {/* LƯU Ý */}

            <p className="mt-4 rounded-xl bg-[#F5F7FC] px-4 py-3 text-[11px] leading-5 text-[#72818C]">

              Giờ tham quan, thời gian di chuyển và chi phí
              do ước tính. Lịch trình được sắp bằng
              thuật toán, không phải AI.

            </p>

            {/* ====================================== */}
            {/* BẮT ĐẦU CHUYẾN ĐI THEO NGÀY             */}
            {/* ====================================== */}

            <section className="mt-5 rounded-[20px] border border-[#BDECE5] bg-[#F1FBF8] p-4">

              <div className="flex items-start gap-3">

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF7EF] text-[#087F78]">

                  <Icon
                    name="navigation"
                    className="text-[23px]"
                  />

                </span>

                <div className="min-w-0 flex-1">

                  <h3 className="text-[14px] font-extrabold text-[#14364F]">

                    {executionStatus === 'COMPLETED'
                      ? `Đã hoàn thành Ngày ${dayNumber}`
                      : executionStatus === 'IN_PROGRESS'
                        ? `Tiếp tục hành trình Ngày ${dayNumber}`
                        : `Bắt đầu chuyến đi — Ngày ${dayNumber}`}
                  </h3>

                  <p className="mt-1 text-[11px] leading-5 text-[#617388]">

                    {executionStatus === 'COMPLETED'
                      ? 'Tiến độ của ngày này đã được lưu vào tài khoản.'
                      : 'Lấy GPS từ trình duyệt và chỉ đường đến từng địa điểm bằng Goong Maps. Tiến độ được lưu trên Backend.'}

                  </p>
                </div>
              </div>

              {/* NẾU NGÀY ĐÃ HOÀN THÀNH */}

              {executionStatus === 'COMPLETED' ? (

                <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-[12px] font-bold text-[#087F78]">

                  <Icon
                    name="check_circle"
                    className="text-[20px]"
                  />

                  Ngày tham quan đã hoàn thành

                </div>

              ) : (

                /* NÚT BẮT ĐẦU HOẶC TIẾP TỤC */

                <button
                  type="button"
                  onClick={() => void beginDay()}
                  disabled={
                    starting ||
                    Boolean(startBlockedReason)
                  }
                  className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#006B65] px-4 text-[13px] font-extrabold text-white transition hover:bg-[#075C66] disabled:cursor-wait disabled:opacity-60"
                >

                  <Icon
                    name={
                      starting
                        ? 'progress_activity'
                        : 'navigation'
                    }
                    className="text-[20px]"
                  />

                  {starting
                    ? 'Đang bắt đầu ngày...'
                    : executionStatus === 'IN_PROGRESS'
                      ? 'Tiếp tục chỉ đường Goong Maps'
                      : `Bắt đầu chuyến đi — Ngày ${dayNumber}`}

                </button>
              )}

              {/* NGÀY CHƯA ĐỦ ĐIỀU KIỆN BẮT ĐẦU */}

              {startBlockedReason && (

                <p className="mt-2 text-center text-[11px] font-semibold text-[#BE5B46]">
                  {startBlockedReason}
                </p>

              )}

              {/* LƯU Ý GPS */}

              <p className="mt-2 text-center text-[10px] text-[#72818C]">
                GPS cần quyền vị trí và kết nối HTTPS hoặc localhost.
              </p>

            </section>

            {/* ĐIỀU HƯỚNG NGÀY TRƯỚC / NGÀY SAU */}

            <div className="mt-5 flex flex-wrap gap-2">

              {previousDay && (
                <Link
                  to={dayUrl(previousDay.dayNumber)}
                  className="flex h-12 flex-1 items-center justify-center gap-1 rounded-full bg-[#EFF0FF] px-4 text-[12px] font-extrabold text-[#14364F]"
                >

                  <Icon
                    name="chevron_left"
                    className="text-[18px]"
                  />

                  Ngày trước
                </Link>
              )}

              {nextDay ? (
                <Link
                  to={dayUrl(nextDay.dayNumber)}
                  className="flex h-12 flex-1 items-center justify-center gap-1 rounded-full bg-[#006B65] px-4 text-[12px] font-extrabold text-white"
                >

                  Ngày tiếp theo

                  <Icon
                    name="arrow_forward"
                    className="text-[18px]"
                  />

                </Link>

              ) : (

                <Link
                  to={overviewUrl}
                  className="flex h-12 flex-1 items-center justify-center gap-1 rounded-full bg-[#006B65] px-4 text-[12px] font-extrabold text-white"
                >

                  Về tổng quan

                  <Icon
                    name="arrow_forward"
                    className="text-[18px]"
                  />

                </Link>
              )}
            </div>

          </>
        )}

      <NoticeToast message={notice} />
    </div>
  );
}
