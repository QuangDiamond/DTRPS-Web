
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { ClientApiError, errorMessage } from '@/client/api/http';
import {
  tripFlowApi,
  type ItineraryOverview,
  type ItineraryOverviewDay,
} from '@/client/api/tripFlowApi';
import { CLIENT_ROUTES, itineraryDayPath } from '@/client/routePaths';

import PageBar from '@/client/ui/PageBar';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

function formatMoney(
  value: number | null | undefined,
  currency: string,
) {
  if (value === null || value === undefined) {
    return 'Chưa ước tính';
  }

  return `${currencyFormatter.format(value)} ${currency}`;
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

function SummaryCard({
                       icon,
                       label,
                       value,
                     }: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#F5FAFA] px-3 py-3">
      <div className="flex items-center gap-1.5 text-[11px] text-[#72818C]">
        <Icon
          name={icon}
          className="text-[17px] text-[#087A78]"
        />

        {label}
      </div>

      <p className="mt-1 break-words text-[13px] font-extrabold text-[#13364A]">
        {value}
      </p>
    </div>
  );
}

// =============================================
// HIỂN THỊ LỊCH TRÌNH MỘT NGÀY
// =============================================

function DayCard({
                   day,
                   planId,
                   currency,
                 }: {
  day: ItineraryOverviewDay;
  planId: number;
  currency: string;
}) {
  const activities = [...day.activities].sort(
    (a, b) => a.itemOrder - b.itemOrder,
  );

  const detailUrl =
    `${itineraryDayPath(day.dayNumber)}?planId=${planId}`;

  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E4ECEB] bg-white shadow-[0_3px_12px_rgba(19,54,74,0.04)]">

      {/* TIÊU ĐỀ NGÀY */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E8F0EF] bg-[#F3FBF8] px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#C3F8F0] text-[17px] font-extrabold text-[#075C66]">
            {day.dayNumber}
          </span>

          <div className="min-w-0">
            <h3 className="text-[15px] font-extrabold text-[#13364A]">
              {day.title || `Ngày ${day.dayNumber}`}
            </h3>

            <p className="mt-1 text-[11px] text-[#72818C]">
              {formatDate(day.visitDate)}
              {' · '}
              {activities.length} hoạt động
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-[#72818C]">
            Chi phí ngày
          </p>

          <p className="mt-1 text-[13px] font-extrabold text-[#087A78]">
            {formatMoney(day.estimatedCost, currency)}
          </p>
        </div>
      </div>

      {/* GHI CHÚ NGÀY */}
      {day.notes && (
        <p className="mx-4 mt-3 rounded-xl bg-[#F5F7FC] px-3 py-2 text-[11px] leading-5 text-[#65758A]">
          {day.notes}
        </p>
      )}

      {/* DANH SÁCH HOẠT ĐỘNG */}
      {activities.length === 0 ? (
        <p className="px-4 py-6 text-center text-[12px] text-[#72818C]">
          Ngày này chưa có hoạt động được sắp xếp.
        </p>
      ) : (
        <ol className="px-4 py-4">
          {activities.map((activity, index) => (
            <li
              key={activity.itemId}
              className="relative flex gap-3 pb-5 last:pb-0"
            >
              {/* ĐƯỜNG TIMELINE */}
              {index < activities.length - 1 && (
                <span className="absolute bottom-0 left-[13px] top-7 w-[2px] bg-[#C4EDE6]" />
              )}

              <span className="relative z-[1] mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E2FAF5] text-[11px] font-extrabold text-[#075C66]">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">

                {/* THỜI GIAN VÀ CHI PHÍ */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] font-extrabold text-[#075C66]">
                    {formatTime(activity.startTime)}
                    {' – '}
                    {formatTime(activity.endTime)}
                  </p>

                  <p className="text-[11px] font-bold text-[#087A78]">
                    {formatMoney(
                      activity.estimatedCost,
                      currency,
                    )}
                  </p>
                </div>

                {/* TÊN ĐỊA ĐIỂM */}
                <p className="mt-1 text-[13px] font-extrabold leading-5 text-[#13364A]">
                  {activity.placeName}
                </p>

                {/* ĐỊA CHỈ */}
                {activity.placeAddress && (
                  <p className="mt-1 flex items-start gap-1 text-[11px] leading-4 text-[#72818C]">
                    <Icon
                      name="location_on"
                      className="shrink-0 text-[14px]"
                    />

                    <span>
                      {activity.placeAddress}
                    </span>
                  </p>
                )}

                {/* THỜI GIAN DI CHUYỂN */}
                {activity.travelTimeMinutes !== null &&
                  activity.travelTimeMinutes > 0 && (
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-[#72818C]">
                      <Icon
                        name="directions_car"
                        className="text-[15px]"
                      />

                      Di chuyển ước tính:
                      {' '}
                      {activity.travelTimeMinutes} phút

                      {activity.transportModeName
                        ? ` · ${activity.transportModeName}`
                        : ''}
                    </p>
                  )}

                {/* GHI CHÚ HOẠT ĐỘNG */}
                {activity.notes && (
                  <p className="mt-2 rounded-xl bg-[#F5F7FC] px-3 py-2 text-[11px] leading-4 text-[#65758A]">
                    {activity.notes}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* CHI TIẾT NGÀY */}
      <div className="border-t border-[#EEF1F3] px-4 py-3">
        <Link
          to={detailUrl}
          className="flex items-center justify-center gap-1.5 rounded-full bg-[#E2FAF5] px-4 py-2.5 text-[12px] font-bold text-[#075C66] hover:bg-[#C3F8F0]"
        >
          Xem chi tiết ngày {day.dayNumber}

          <Icon
            name="arrow_forward"
            className="text-[17px]"
          />
        </Link>
      </div>
    </section>
  );
}

// =============================================
// TRANG TỔNG QUAN LỊCH TRÌNH
// =============================================

/**
 * BƯỚC 6:
 *
 * Hiển thị lịch trình hoàn chỉnh
 * được Backend tự động sắp xếp.
 *
 * Chỉ gọi:
 * GET /travel-plans/{planId}/itineraries/active/overview
 *
 * Không sử dụng dữ liệu mẫu.
 * Không dùng AI để xếp lịch.
 */
export default function ItineraryOverviewPage() {
  const [searchParams] = useSearchParams();

  const rawPlanId = searchParams.get('planId');

  const planId =
    rawPlanId === null ? NaN : Number(rawPlanId);

  const validPlanId =
    Number.isSafeInteger(planId) &&
    planId > 0;

  const [overview, setOverview] =
    useState<ItineraryOverview | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [notFound, setNotFound] = useState(false);

  const [retryCount, setRetryCount] = useState(0);

  const selectedUrl = validPlanId
    ? `${CLIENT_ROUTES.TRIP_PLAN_SELECTED}?planId=${planId}`
    : CLIENT_ROUTES.TRIP_PLAN;

  // =============================================
  // LẤY LỊCH TRÌNH THẬT TỪ BACKEND
  // =============================================

  useEffect(() => {
    if (!validPlanId) {
      setOverview(null);
      setLoading(false);
      setNotFound(false);
      setError(
        'Thiếu mã kế hoạch hợp lệ. Hãy mở lịch trình từ chuyến đi của bạn.',
      );
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);
    setNotFound(false);
    setOverview(null);

    tripFlowApi
      .overview(planId)
      .then((data) => {
        if (active) {
          setOverview(data);
        }
      })
      .catch((caught: unknown) => {
        if (!active) return;

        if (
          caught instanceof ClientApiError &&
          caught.status === 404
        ) {
          setNotFound(true);
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
  }, [planId, validPlanId, retryCount]);

  // =============================================
  // TỔNG HỢP THÔNG TIN HIỂN THỊ
  // =============================================

  const days = useMemo(
    () =>
      [...(overview?.days ?? [])].sort(
        (a, b) => a.dayNumber - b.dayNumber,
      ),
    [overview],
  );

  const totalActivities = useMemo(
    () =>
      days.reduce(
        (sum, day) => sum + day.activities.length,
        0,
      ),
    [days],
  );

  const totalCost =
    overview?.totalEstimatedCost ?? 0;

  const budget = overview?.budget;

  const currency = overview?.currency ?? 'VND';

  const remainingBudget =
    budget == null
      ? null
      : budget - totalCost;

  return (
    <div className="mx-auto max-w-4xl pb-28 md:pb-4">

      {/* HEADER */}
      <PageBar
        title="Lịch trình của bạn"
        subtitle={overview?.destination}
        backTo={selectedUrl}
        actions={
          overview ? (
            <Link
              to={CLIENT_ROUTES.TRIPS}
              className="rounded-full bg-white px-3 py-2 text-[11px] font-bold text-[#075C66]"
            >
              Chuyến đi của tôi
            </Link>
          ) : undefined
        }
      />

      {/* ĐANG TẢI */}
      {loading && (
        <div
          role="status"
          className="rounded-[20px] bg-white p-9 text-center"
        >
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#C3F8F0] border-t-[#087A78]" />

          <p className="mt-3 text-[13px] font-semibold text-[#087A78]">
            Đang tải lịch trình ...
          </p>
        </div>
      )}

      {/* LỖI HOẶC CHƯA CÓ LỊCH TRÌNH */}
      {!loading && (error || notFound) && (
        <div className="flex flex-col items-center rounded-[20px] bg-white px-5 py-10 text-center">
          <Icon
            name="event_note"
            className="text-[42px] text-[#94B5B6]"
          />

          <h2 className="mt-3 text-[16px] font-extrabold text-[#13364A]">
            {notFound
              ? 'Chưa tìm thấy lịch trình đã tạo'
              : 'Không thể tải lịch trình'}
          </h2>

          <p
            role="alert"
            className="mt-2 max-w-md text-[12px] leading-5 text-[#72818C]"
          >
            {notFound
              ? 'Kế hoạch này chưa có lịch trình ACTIVE, hoặc lịch trình không thể truy cập. Hãy kiểm tra địa điểm đã chọn và tạo lịch trình.'
              : error}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {validPlanId && (
              <button
                type="button"
                onClick={() =>
                  setRetryCount((count) => count + 1)
                }
                className="rounded-full bg-[#E2FAF5] px-5 py-2.5 text-[12px] font-bold text-[#075C66]"
              >
                Thử tải lại
              </button>
            )}

            <Link
              to={selectedUrl}
              className="rounded-full bg-[#075C66] px-5 py-2.5 text-[12px] font-bold text-white"
            >
              {validPlanId
                ? 'Xem địa điểm đã chọn'
                : 'Tạo kế hoạch'}
            </Link>
          </div>
        </div>
      )}

      {/* LỊCH TRÌNH BACKEND TRẢ VỀ */}
      {!loading &&
        !error &&
        !notFound &&
        overview && (
          <>

            {/* THÔNG TIN LỊCH TRÌNH */}
            <div className="rounded-[22px] bg-gradient-to-br from-[#DDF9F1] to-[#EDF9FB] p-5">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#087A78]">
                <Icon
                  name="check_circle"
                  className="text-[17px]"
                />

                Lịch trình được tạo từ các địa điểm đã chọn
              </p>

              <h2 className="mt-2 text-[20px] font-extrabold text-[#13364A]">
                {overview.itineraryTitle}
              </h2>

              <p className="mt-1 text-[12px] text-[#506775]">
                {overview.destination}
                {' · '}
                {formatDate(overview.startDate)}
                {' – '}
                {formatDate(overview.endDate)}
              </p>

              <p className="mt-2 text-[11px] text-[#6E8290]">
                Phiên bản {overview.versionNumber}
                {' · '}
                {days.length} ngày
                {' · '}
                {totalActivities} hoạt động
              </p>

              {overview.itineraryNotes && (
                <p className="mt-3 text-[12px] leading-5 text-[#506775]">
                  {overview.itineraryNotes}
                </p>
              )}
            </div>

            {/* THỐNG KÊ TỔNG QUAN */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
              <SummaryCard
                icon="calendar_month"
                label="Số ngày"
                value={`${days.length} ngày`}
              />

              <SummaryCard
                icon="place"
                label="Hoạt động"
                value={`${totalActivities} địa điểm`}
              />

              <SummaryCard
                icon="account_balance_wallet"
                label="Chi phí dự kiến"
                value={formatMoney(
                  overview.totalEstimatedCost,
                  currency,
                )}
              />

              <SummaryCard
                icon="savings"
                label="Ngân sách kế hoạch"
                value={formatMoney(
                  budget,
                  currency,
                )}
              />
            </div>

            {/* SO SÁNH VỚI NGÂN SÁCH */}
            {remainingBudget !== null && (
              <div
                className={`mt-3 rounded-2xl px-4 py-3 text-[12px] ${
                  remainingBudget >= 0
                    ? 'bg-[#F3FBF8] text-[#075C66]'
                    : 'bg-[#FFF3EF] text-[#B45335]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    {remainingBudget >= 0
                      ? 'Chênh lệch còn lại so với ngân sách'
                      : 'Chi phí ước tính vượt ngân sách'}
                  </span>

                  <span className="font-extrabold">
                    {formatMoney(
                      Math.abs(remainingBudget),
                      currency,
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* LƯU Ý CHI PHÍ */}
            <p className="mt-3 text-[11px] leading-5 text-[#72818C]">
              Chi phí và thời gian di chuyển là ước lượng
              từ ; tổng tiền có thể chưa bao gồm
              lưu trú, ăn uống, đi lại hoặc dịch vụ chưa
              có giá. Lịch trình được sắp xếp bằng thuật
              toán , không phải AI.
            </p>

            {/* DANH SÁCH CÁC NGÀY */}
            <div className="mb-3 mt-6 flex items-center justify-between gap-2">
              <h2 className="text-[18px] font-extrabold text-[#13364A]">
                Lịch trình từng ngày
              </h2>

              <Link
                to={selectedUrl}
                className="text-[11px] font-bold text-[#087A78] hover:underline"
              >
                Xem địa điểm đã chọn
              </Link>
            </div>

            {days.length === 0 ? (
              <div className="rounded-[20px] bg-white p-6 text-center text-[12px] text-[#72818C]">
                Lịch trình chưa có ngày hoặc hoạt động nào.
              </div>
            ) : (
              <div className="grid gap-4">
                {days.map((day) => (
                  <DayCard
                    key={day.dayId}
                    day={day}
                    planId={overview.planId}
                    currency={currency}
                  />
                ))}
              </div>
            )}
          </>
        )}
    </div>
  );
}
