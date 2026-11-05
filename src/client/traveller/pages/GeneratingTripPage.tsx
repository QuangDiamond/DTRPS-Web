
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import {
  tripFlowApi,
  type TravelPlanResponse,
} from '@/client/api/tripFlowApi';
import { CLIENT_ROUTES } from '@/client/routePaths';

/**
 * Bước chuyển tiếp sau khi Traveller tạo Travel Plan.
 *
 * Chỉ xác nhận kế hoạch đã lưu trên Backend.
 * Không giả lập AI và không tự tạo lịch trình.
 */

function GlobeIllustration({
                             ready,
                           }: {
  ready: boolean;
}) {
  return (
    <div className="relative mx-auto flex h-[190px] w-[190px] items-center justify-center">
      <span className="absolute h-[184px] w-[184px] rounded-full border border-[#D8EEF0] bg-[#F2FBFA]" />

      <span className="absolute h-[150px] w-[150px] rounded-full border border-[#D8EEF0]" />

      <span className="relative flex h-[112px] w-[112px] items-center justify-center rounded-full bg-white shadow-lg">
        <Icon
          name={ready ? 'verified' : 'public'}
          filled={ready}
          className={`text-[70px] ${
            ready
              ? 'text-[#087A78]'
              : 'text-[#2BB5A3]'
          }`}
        />
      </span>
    </div>
  );
}

const dateLabel = (date: string) => {
  const parts = date.split('-');

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const moneyLabel = (
  amount: number | null,
  currency: string,
) =>
  amount === null
    ? 'Chưa đặt ngân sách'
    : `${new Intl.NumberFormat('vi-VN').format(amount)} ${currency}`;

export default function GeneratingTripPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // planId thật được PlanTripPage đưa vào URL.
  const rawPlanId = searchParams.get('planId');

  const planId =
    rawPlanId === null
      ? NaN
      : Number(rawPlanId);

  const validPlanId =
    Number.isSafeInteger(planId) &&
    planId > 0;

  const [plan, setPlan] =
    useState<TravelPlanResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  // ==============================================
  // LẤY KẾ HOẠCH THẬT TỪ BACKEND
  // ==============================================

  useEffect(() => {
    if (!validPlanId) {
      setPlan(null);
      setLoading(false);
      setError(
        'Thiếu mã kế hoạch hợp lệ. Hãy tạo kế hoạch trước.',
      );
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);
    setPlan(null);

    tripFlowApi
      .plan(planId)
      .then((savedPlan) => {
        if (active) {
          setPlan(savedPlan);
        }
      })
      .catch((caught: unknown) => {
        if (active) {
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

  const currentPlan =
    plan?.planId === planId
      ? plan
      : null;

  // ==============================================
  // CHUYỂN ĐẾN DANH SÁCH ĐỊA ĐIỂM
  // ==============================================

  const openSuggestions = () => {
    if (!currentPlan) {
      return;
    }

    navigate(
      `${CLIENT_ROUTES.TRIP_SUGGESTIONS}?planId=${currentPlan.planId}`,
      { replace: true },
    );
  };

  return (
    <div className="mx-auto max-w-xl rounded-[24px] bg-white px-5 pb-6 pt-6 shadow-[0_6px_24px_rgba(19,54,74,0.05)]">

      {/* HÌNH MINH HỌA */}
      <GlobeIllustration
        ready={Boolean(currentPlan)}
      />

      <p className="mx-auto mt-2 flex w-fit items-center gap-1.5 rounded-full bg-[#EBF8F5] px-3 py-1.5 text-[11px] font-semibold text-[#075C66]">
        <Icon
          name="explore"
          className="text-[15px]"
        />
        Hành trình Smart Travel
      </p>

      {/* TIÊU ĐỀ */}
      <h1 className="mt-3 text-center text-[21px] font-extrabold leading-7 text-[#13364A]">
        {loading
          ? 'Đang kiểm tra kế hoạch của bạn...'
          : currentPlan
            ? 'Kế hoạch của bạn đã được lưu!'
            : 'Chưa thể mở kế hoạch'}
      </h1>

      <p className="mt-2 text-center text-[12px] leading-5 text-[#72818C]">
        {loading
          ? 'Đang lấy thông tin kế hoạch từ Backend.'
          : currentPlan
            ? 'Bước tiếp theo là xem các địa điểm phù hợp và chọn nơi bạn muốn đến. Hệ thống chỉ tự xếp lịch sau khi bạn xác nhận danh sách địa điểm.'
            : 'Vui lòng kiểm tra lại kế hoạch hoặc thử tải lại.'}
      </p>

      {/* ĐANG TẢI */}
      {loading && (
        <div
          role="status"
          className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-[#F5FAFA] px-4 py-4 text-[12px] font-semibold text-[#087A78]"
        >
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#C3F8F0] border-t-[#087A78]" />
          Đang tải dữ liệu kế hoạch...
        </div>
      )}

      {/* HIỂN THỊ LỖI */}
      {!loading && error && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4"
        >
          <div className="flex items-start gap-2 text-red-700">
            <Icon
              name="error_outline"
              className="mt-0.5 text-[19px]"
            />

            <p className="flex-1 text-[12px] leading-5">
              {error}
            </p>
          </div>

          {validPlanId && (
            <button
              type="button"
              onClick={() =>
                setRetryCount((count) => count + 1)
              }
              className="mt-3 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[#075C66] shadow-sm hover:bg-[#E2FAF5]"
            >
              Thử tải lại
            </button>
          )}
        </div>
      )}

      {/* THÔNG TIN KẾ HOẠCH */}
      {currentPlan && !loading && (
        <>
          <div className="mt-5 rounded-[20px] border border-[#E5EFED] bg-[#FAFDFD] p-4">

            {/* HEADER KẾ HOẠCH */}
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E2FAF5] text-[#087A78]">
                <Icon
                  name="check_circle"
                  className="text-[22px]"
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-[#087A78]">
                  Đã lưu trên Backend
                </p>

                <p className="truncate text-[14px] font-extrabold text-[#13364A]">
                  {currentPlan.title}
                </p>
              </div>

              <span className="text-[11px] font-semibold text-[#78909B]">
                #{currentPlan.planId}
              </span>
            </div>

            {/* THÔNG TIN CHI TIẾT */}
            <div className="mt-4 grid gap-3 border-t border-[#E5EFED] pt-4 sm:grid-cols-2">

              {/* ĐIỂM ĐẾN */}
              <div className="flex items-start gap-2">
                <Icon
                  name="location_on"
                  className="text-[18px] text-[#087A78]"
                />

                <div>
                  <p className="text-[10px] text-[#82929E]">
                    Điểm đến
                  </p>

                  <p className="text-[12px] font-bold text-[#13364A]">
                    {currentPlan.destination}
                  </p>
                </div>
              </div>

              {/* THỜI GIAN */}
              <div className="flex items-start gap-2">
                <Icon
                  name="calendar_month"
                  className="text-[18px] text-[#087A78]"
                />

                <div>
                  <p className="text-[10px] text-[#82929E]">
                    Thời gian
                  </p>

                  <p className="text-[12px] font-bold text-[#13364A]">
                    {dateLabel(currentPlan.startDate)}
                    {' – '}
                    {dateLabel(currentPlan.endDate)}
                  </p>
                </div>
              </div>

              {/* SỐ NGƯỜI */}
              <div className="flex items-start gap-2">
                <Icon
                  name="groups"
                  className="text-[18px] text-[#087A78]"
                />

                <div>
                  <p className="text-[10px] text-[#82929E]">
                    Số người
                  </p>

                  <p className="text-[12px] font-bold text-[#13364A]">
                    {currentPlan.groupSize} người
                  </p>
                </div>
              </div>

              {/* NGÂN SÁCH */}
              <div className="flex items-start gap-2">
                <Icon
                  name="account_balance_wallet"
                  className="text-[18px] text-[#087A78]"
                />

                <div>
                  <p className="text-[10px] text-[#82929E]">
                    Ngân sách dự kiến
                  </p>

                  <p className="text-[12px] font-bold text-[#13364A]">
                    {moneyLabel(
                      currentPlan.budget,
                      currentPlan.currency,
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* SỞ THÍCH */}
            <div className="mt-4 rounded-xl bg-[#EDF8F5] px-3 py-2.5 text-[11px] font-semibold text-[#087A78]">
              <Icon
                name="category"
                className="mr-1 inline-block text-[16px] align-middle"
              />

              {currentPlan.categoryCodes?.length ?? 0}
              {' '}sở thích trải nghiệm đã lưu
            </div>
          </div>

          {/* THÔNG TIN BƯỚC TIẾP THEO */}
          <div className="mt-4 rounded-2xl border border-[#E8ECF3] bg-[#F8F9FC] px-4 py-3">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#13364A]">
              <Icon
                name="info"
                className="text-[17px] text-[#087A78]"
              />
              Bước tiếp theo
            </p>

            <p className="mt-1 text-[11px] leading-5 text-[#72818C]">
              Danh sách địa điểm hiện lấy từ catalogue
              của Backend. Phần AI Embedding đề xuất
              địa điểm sẽ được kết nối khi thành viên
              phụ trách hoàn thành API.
            </p>
          </div>
        </>
      )}

      {/* NÚT CHUYỂN TRANG */}
      <button
        type="button"
        onClick={openSuggestions}
        disabled={!currentPlan || loading}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#075C66] text-[14px] font-bold text-white transition-colors hover:bg-[#087A78] disabled:cursor-not-allowed disabled:bg-[#EBEDFF] disabled:text-[#82929E]"
      >
        <Icon
          name="travel_explore"
          className="text-[19px]"
        />

        Xem danh sách địa điểm

        <Icon
          name="arrow_forward"
          className="text-[18px]"
        />
      </button>

      {/* QUAY LẠI */}
      <button
        type="button"
        onClick={() =>
          navigate(CLIENT_ROUTES.TRIPS)
        }
        className="mt-2 w-full py-3 text-[12px] font-semibold text-[#72818C] hover:text-[#075C66]"
      >
        Về danh sách chuyến đi
      </button>
    </div>
  );
}
