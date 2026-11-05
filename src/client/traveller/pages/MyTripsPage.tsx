
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { ClientApiError, errorMessage } from '@/client/api/http';
import {
  tripFlowApi,
  type TravelPlanResponse,
} from '@/client/api/tripFlowApi';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { NoticeToast } from '@/client/ui/Overlay';
import { routeNotice, useNotice } from '@/client/ui/useNotice';

type TripFilter = 'ongoing' | 'finished';

type PlanStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

const FILTERS: { id: TripFilter; label: string }[] = [
  { id: 'ongoing', label: 'Chưa hoàn tất' },
  { id: 'finished', label: 'Đã kết thúc' },
];

const STATUS_INFO: Record<
  PlanStatus,
  { label: string; icon: string; className: string }
> = {
  DRAFT: {
    label: 'Bản nháp',
    icon: 'edit_note',
    className: 'bg-[#FFE8C7] text-[#8A4B00]',
  },
  PLANNED: {
    label: 'Đã lên kế hoạch',
    icon: 'calendar_today',
    className: 'bg-[#D7FBF3] text-[#06695F]',
  },
  IN_PROGRESS: {
    label: 'Đang diễn ra',
    icon: 'directions_walk',
    className: 'bg-[#D9F4FF] text-[#156486]',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    icon: 'check_circle',
    className: 'bg-[#E3F6E5] text-[#23793A]',
  },
  CANCELLED: {
    label: 'Đã hủy',
    icon: 'cancel',
    className: 'bg-[#FCE4E3] text-[#AD3232]',
  },
};

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

function formatMoney(amount: number | null, currency: string): string {
  if (amount === null || amount === undefined) {
    return 'Chưa đặt ngân sách';
  }
  return `${moneyFormatter.format(amount)} ${currency}`;
}

function formatDate(date: string): string {
  const parts = date?.split('-') ?? [];
  return parts.length === 3
    ? `${parts[2]}/${parts[1]}/${parts[0]}`
    : date || 'Chưa cập nhật';
}

function countDays(startDate: string, endDate: string): number {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.round((end - start) / 86_400_000) + 1);
}

function planStatus(status: string) {
  return STATUS_INFO[status as PlanStatus] ?? {
    label: status || 'Chưa rõ',
    icon: 'info',
    className: 'bg-[#EBEDFF] text-[#506581]',
  };
}

function isFinished(plan: TravelPlanResponse) {
  return plan.status === 'COMPLETED' || plan.status === 'CANCELLED';
}

function PlanCard({
                    plan,
                    opening,
                    onOpen,
                    onShare,
                  }: {
  plan: TravelPlanResponse;
  opening: boolean;
  onOpen: () => void;
  onShare: () => void;
}) {
  const status = planStatus(plan.status);
  const days = countDays(plan.startDate, plan.endDate);
  const selectedUrl =
    `${CLIENT_ROUTES.TRIP_PLAN_SELECTED}?planId=${plan.planId}`;
  const suggestionsUrl =
    `${CLIENT_ROUTES.TRIP_SUGGESTIONS}?planId=${plan.planId}`;

  return (
    <article className="overflow-hidden rounded-[22px] bg-white p-2.5 shadow-[0_3px_12px_rgba(19,54,74,0.04)]">
      {/* Backend chưa trả ảnh bìa Travel Plan, nên dùng nền minh họa thay ảnh giả. */}
      <div className="relative flex h-[165px] flex-col justify-between overflow-hidden rounded-[18px] bg-gradient-to-br from-[#0F8D86] via-[#087A78] to-[#13364A] p-3 text-white">
        <span className="pointer-events-none absolute -right-6 -top-8 opacity-15">
          <Icon name="travel_explore" className="text-[170px]" />
        </span>

        <div className="relative flex items-start justify-between gap-2">
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${status.className}`}
          >
            <Icon name={status.icon} className="text-[14px]" />
            {status.label}
          </span>

          <button
            type="button"
            onClick={onShare}
            aria-label={`Chia sẻ ${plan.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <Icon name="share" className="text-[18px]" />
          </button>
        </div>

        <div className="relative">
          <p className="line-clamp-2 text-[17px] font-extrabold leading-6">
            {plan.title}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-white/90">
            <Icon name="location_on" className="text-[15px]" />
            {plan.destination}
            {' · '}
            {days} ngày
          </p>
        </div>
      </div>

      <div className="px-1.5 pt-3">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F3F4FF] px-3 py-3">
          <div className="flex items-start gap-2">
            <Icon name="date_range" className="mt-0.5 text-[18px] text-[#087A78]" />
            <div className="min-w-0">
              <p className="text-[10px] text-[#72818C]">Thời gian</p>
              <p className="mt-0.5 text-[11px] font-bold text-[#13364A]">
                {formatDate(plan.startDate)}
              </p>
              <p className="text-[10px] text-[#72818C]">
                đến {formatDate(plan.endDate)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="groups" className="mt-0.5 text-[18px] text-[#087A78]" />
            <div>
              <p className="text-[10px] text-[#72818C]">Số người</p>
              <p className="mt-0.5 text-[12px] font-bold text-[#13364A]">
                {plan.groupSize} người
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <span className="flex items-center gap-1 text-[12px] font-semibold text-[#13364A]">
            <Icon name="payments" className="text-[17px] text-[#087A78]" />
            {formatMoney(plan.budget, plan.currency)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[#72818C]">
            <Icon name="category" className="text-[17px] text-[#087A78]" />
            {plan.categoryCodes?.length ?? 0} sở thích
          </span>
        </div>

        <div className="mt-3.5 mb-1 flex items-center gap-2">
          <button
            type="button"
            onClick={onOpen}
            disabled={opening}
            className="flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#075C66] px-3 text-[12px] font-bold text-white hover:bg-[#087A78] disabled:cursor-wait disabled:opacity-60"
          >
            {opening ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Icon name="route" className="text-[18px]" />
            )}
            {opening ? 'Đang kiểm tra...' : 'Mở chuyến đi'}
            {!opening && <Icon name="arrow_forward" className="text-[16px]" />}
          </button>
          <Link
            to={selectedUrl}
            title="Xem địa điểm đã chọn"
            aria-label={`Địa điểm đã chọn của ${plan.title}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBEDFF] text-[#075C66]"
          >
            <Icon name="shopping_basket" className="text-[20px]" />
          </Link>
          <Link
            to={suggestionsUrl}
            title="Xem danh sách địa điểm"
            aria-label={`Danh sách địa điểm cho ${plan.title}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBEDFF] text-[#075C66]"
          >
            <Icon name="add_location_alt" className="text-[20px]" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Danh sách Travel Plan thật từ Backend, không lấy từ travellerContext. */
export default function MyTripsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, showNotice] = useNotice(routeNotice(location.state));

  const [plans, setPlans] = useState<TravelPlanResponse[]>([]);
  const [filter, setFilter] = useState<TripFilter>('ongoing');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [openingPlanId, setOpeningPlanId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    tripFlowApi
      .plans()
      .then((result) => {
        if (active) setPlans(result);
      })
      .catch((caught: unknown) => {
        if (active) setError(errorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const counts: Record<TripFilter, number> = {
    ongoing: plans.filter((plan) => !isFinished(plan)).length,
    finished: plans.filter(isFinished).length,
  };

  const visiblePlans = plans.filter((plan) =>
    filter === 'finished' ? isFinished(plan) : !isFinished(plan),
  );

  // Backend hiện không cập nhật travel_plans.status khi tạo itinerary.
  // Vì thế phải kiểm tra GET /itineraries/active thay vì suy đoán từ DRAFT.
  const openPlan = async (plan: TravelPlanResponse) => {
    if (openingPlanId !== null) return;

    setOpeningPlanId(plan.planId);

    try {
      await tripFlowApi.activeItinerary(plan.planId);

      navigate(`${CLIENT_ROUTES.ITINERARY}?planId=${plan.planId}`);
    } catch (caught: unknown) {
      if (caught instanceof ClientApiError && caught.status === 404) {
        navigate(
          `${CLIENT_ROUTES.TRIP_PLAN_SELECTED}?planId=${plan.planId}`,
        );
      } else {
        showNotice(errorMessage(caught));
      }
    } finally {
      setOpeningPlanId(null);
    }
  };

  const sharePlan = async (plan: TravelPlanResponse) => {
    const text = [
      plan.title,
      `Điểm đến: ${plan.destination}`,
      `Thời gian: ${formatDate(plan.startDate)} - ${formatDate(plan.endDate)}`,
      `Số người: ${plan.groupSize}`,
      `Ngân sách: ${formatMoney(plan.budget, plan.currency)}`,
    ].join('\n');

    try {
      if (navigator.share) {
        await navigator.share({ title: plan.title, text });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        showNotice('Đã sao chép thông tin chuyến đi.');
      } else {
        showNotice('Trình duyệt không hỗ trợ chia sẻ hoặc sao chép.');
      }
    } catch (caught: unknown) {
      if (
        !(caught instanceof DOMException && caught.name === 'AbortError')
      ) {
        showNotice('Không thể chia sẻ chuyến đi.');
      }
    }
  };

  return (
    <div className="pb-8">
      {/* TIÊU ĐỀ */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-extrabold text-[#13364A]">
            Chuyến đi của tôi
          </h1>
          <p className="mt-0.5 text-[12px] text-[#72818C]">
            Các kế hoạch đã lưu trong tài khoản Smart Travel
          </p>
        </div>
        <Link
          to={CLIENT_ROUTES.TRIP_PLAN}
          aria-label="Tạo chuyến đi mới"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#075C66] text-white hover:bg-[#087A78]"
        >
          <Icon name="add" className="text-[26px]" />
        </Link>
      </div>

      {/* BỘ LỌC */}
      <div className="mt-4 flex rounded-full bg-[#EBEDFF] p-1 md:max-w-md" role="tablist">
        {FILTERS.map((item) => {
          const selected = item.id === filter;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(item.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-bold ${
                selected
                  ? 'bg-white text-[#075C66]'
                  : 'text-[#72818C]'
              }`}
            >
              {item.label}
              <span
                className={`min-w-[20px] rounded-full px-1.5 text-[11px] ${
                  selected
                    ? 'bg-[#C3F8F0] text-[#075C66]'
                    : 'bg-[#DCDFF5]'
                }`}
              >
                {counts[item.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ĐANG TẢI */}
      {loading && (
        <div role="status" className="mt-4 rounded-[22px] bg-white p-10 text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#C3F8F0] border-t-[#087A78]" />
          <p className="mt-3 text-[12px] text-[#72818C]">
            Đang tải các chuyến đi từ Backend...
          </p>
        </div>
      )}

      {/* LỖI API */}
      {!loading && error && (
        <div role="alert" className="mt-4 rounded-[22px] border border-red-100 bg-red-50 p-5">
          <p className="text-[12px] text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((value) => value + 1)}
            className="mt-3 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-[#075C66]"
          >
            Thử tải lại
          </button>
        </div>
      )}

      {/* CÁC KẾ HOẠCH THẬT */}
      {!loading && !error && (
        visiblePlans.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {visiblePlans.map((plan) => (
              <PlanCard
                key={plan.planId}
                plan={plan}
                opening={openingPlanId !== null}
                onOpen={() => void openPlan(plan)}
                onShare={() => void sharePlan(plan)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center rounded-[22px] bg-white px-6 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C3F8F0] text-[#087A78]">
              <Icon name="luggage" className="text-[30px]" />
            </span>
            <p className="mt-3 text-[14px] font-bold text-[#13364A]">
              {filter === 'ongoing'
                ? 'Bạn chưa có kế hoạch nào chưa hoàn tất.'
                : 'Bạn chưa có chuyến đi nào đã kết thúc.'}
            </p>
            <p className="mt-1 text-[11px] text-[#72818C]">
              Tạo kế hoạch để bắt đầu hành trình của bạn.
            </p>
          </div>
        )
      )}

      {/* TẠO CHUYẾN ĐI MỚI */}
      <div className="mt-5 flex items-center gap-3 rounded-[22px] bg-gradient-to-br from-[#E2FCF8] to-[#EEF0FF] p-4">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold text-[#13364A]">
            Bạn có dự định mới?
          </p>
          <p className="mt-0.5 text-[11px] text-[#5D7782]">
            Lên kế hoạch, chọn địa điểm và để Backend sắp lịch trình.
          </p>
        </div>
        <Link
          to={CLIENT_ROUTES.TRIP_PLAN}
          className="flex shrink-0 items-center gap-1 rounded-full bg-[#075C66] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#087A78]"
        >
          Lên lịch mới
          <Icon name="add" className="text-[16px]" />
        </Link>
      </div>

      {/* Không hiển thị thao tác xóa: Backend chưa có DELETE /travel-plans/{id}. */}
      <NoticeToast message={notice} />
    </div>
  );
}
