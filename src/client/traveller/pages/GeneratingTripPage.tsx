import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { tripFlowApi, type TravelPlanResponse } from '@/client/api/tripFlowApi';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { ConfirmDialog } from '@/client/ui/Overlay';

// Giữ khoảng thời gian hiển thị animation 8 giây như giao diện ban đầu.
// Đây là hiệu ứng chuyển trang, KHÔNG phải thời gian xử lý của AI.
const TOTAL_DURATION = 8000;

const STEPS = [
  {
    doing: 'Đang xác nhận kế hoạch chuyến đi',
    done: 'Đã xác nhận kế hoạch được lưu',
  },
  {
    doing: 'Đang đọc sở thích trải nghiệm của bạn',
    done: 'Đã tải sở thích trải nghiệm',
  },
  {
    doing: 'Đang tìm địa điểm phù hợp trong hệ thống',
    done: 'Đã tải danh sách địa điểm từ hệ thống',
  },
  {
    doing: 'Đang chuẩn bị màn hình lựa chọn địa điểm',
    done: 'Sẵn sàng để bạn chọn địa điểm',
  },
];

const easeOutQuad = (ratio: number) => 1 - (1 - ratio) * (1 - ratio);

/** Giữ nguyên quả địa cầu và vòng máy bay xoay của thiết kế ban đầu. */
function GlobeAnimation({ finished, stopped }: { finished: boolean; stopped: boolean }) {
  return (
    <div className="relative mx-auto flex h-[210px] w-[210px] items-center justify-center">
      <span className="absolute h-[200px] w-[200px] animate-pulse rounded-full border border-[#D8EEF0] bg-[#F2FBFA]" />
      <span className="absolute h-[160px] w-[160px] rounded-full border border-[#D8EEF0]" />
      {!stopped && (
        <span className="absolute h-[200px] w-[200px] animate-[spin_5s_linear_infinite]">
          <span className="absolute top-[18px] right-[18px] flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#075C66] shadow-md">
            <Icon name="flight" className="rotate-45 text-[17px]" />
          </span>
          <span className="absolute bottom-[30px] left-3 h-3 w-3 rounded-full border-2 border-white bg-[#1BB59F]" />
        </span>
      )}
      <span className="relative flex h-[118px] w-[118px] items-center justify-center rounded-full bg-white shadow-lg">
        <Icon
          name={finished ? 'verified' : 'public'}
          filled={finished}
          className={`text-[72px] ${finished ? 'text-[#087A78]' : 'text-[#2BB5A3]'}`}
        />
      </span>
    </div>
  );
}

/**
 * Màn hình loading nguyên phong cách cũ.
 * Sau khi Travel Plan đã lưu, xác minh qua Backend và lấy địa điểm từ catalogue.
 * AI Embedding chưa tích hợp ở bước này; Backend cũng chưa xếp lịch trình.
 */
export default function GeneratingTripPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawPlanId = searchParams.get('planId');
  const planId = rawPlanId === null ? NaN : Number(rawPlanId);
  const validPlanId = Number.isSafeInteger(planId) && planId > 0;

  const [plan, setPlan] = useState<TravelPlanResponse | null>(null);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [candidateCount, setCandidateCount] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Giữ thanh tiến trình và vòng xoay như màn cũ.
  useEffect(() => {
    if (!validPlanId || error) return;

    const startedAt = Date.now();
    setElapsed(0);
    const timer = window.setInterval(() => {
      const next = Math.min(TOTAL_DURATION, Date.now() - startedAt);
      setElapsed(next);
      if (next >= TOTAL_DURATION) window.clearInterval(timer);
    }, 100);

    return () => window.clearInterval(timer);
  }, [validPlanId, retryCount, error]);

  // Chỉ xác nhận dữ liệu thật. Không giả lập thời tiết hay báo AI đã xếp lịch.
  useEffect(() => {
    if (!validPlanId) {
      setError('Không có planId hợp lệ. Hãy tạo kế hoạch trước.');
      return;
    }

    let active = true;
    setPlan(null);
    setPlanLoaded(false);
    setPlacesLoaded(false);
    setCandidateCount(null);
    setError(null);

    const load = async () => {
      try {
        const savedPlan = await tripFlowApi.plan(planId);
        if (!active) return;
        setPlan(savedPlan);
        setPlanLoaded(true);

        const candidates = await tripFlowApi.candidatePlaces(planId);
        if (!active) return;
        setCandidateCount(candidates.length);
        setPlacesLoaded(true);
      } catch (caught: unknown) {
        if (active) setError(errorMessage(caught));
      }
    };

    void load();
    return () => { active = false; };
  }, [planId, validPlanId, retryCount]);

  const dataReady = planLoaded && placesLoaded && plan !== null;
  const finished = dataReady && elapsed >= TOTAL_DURATION;
  const ratio = Math.min(1, elapsed / TOTAL_DURATION);
  const percent = dataReady
    ? Math.round(easeOutQuad(ratio) * 100)
    : Math.min(95, Math.round(easeOutQuad(ratio) * 100));

  // Bước 1-3 phản ánh API đã hoàn thành thật; bước 4 kết thúc sau animation.
  const doneSteps = finished ? 4 : planLoaded ? (placesLoaded ? 3 : 2) : 0;
  const currentStep = Math.min(doneSteps, STEPS.length - 1);

  const openSuggestions = () => {
    if (!finished || !plan) return;
    navigate(`${CLIENT_ROUTES.TRIP_SUGGESTIONS}?planId=${plan.planId}`, {
      replace: true,
    });
  };

  const retry = () => {
    setError(null);
    setElapsed(0);
    setRetryCount((value) => value + 1);
  };

  return (
    <div className="mx-auto max-w-xl rounded-[24px] bg-white px-5 pt-6 pb-4">
      <GlobeAnimation finished={finished} stopped={finished || Boolean(error)} />

      <p className="mx-auto mt-2 flex w-fit items-center gap-1 rounded-full bg-[#EBEDFF] px-3 py-1 text-[11px] font-semibold text-[#075C66]">
        <Icon name="explore" className="text-[14px]" />
        Hành trình cá nhân hóa
      </p>
      <h1 className="mt-3 text-center text-[21px] leading-7 font-extrabold text-[#13364A]">
        {error
          ? 'Chưa thể chuẩn bị danh sách địa điểm'
          : finished
            ? 'Địa điểm cho chuyến đi đã sẵn sàng!'
            : 'Đang chuẩn bị hành trình hoàn hảo...'}
      </h1>
      <p className="mt-2 text-center text-[12px] leading-5 text-[#72818C]">
        {plan ? (
          <>
            Đang chuẩn bị danh sách địa điểm phù hợp với sở thích của bạn tại{' '}
            <b className="text-[#087A78]">{plan.destination}</b>.
          </>
        ) : (
          'Đang xác nhận thông tin chuyến đi đã lưu trên hệ thống.'
        )}
      </p>

      <div className="mt-5 rounded-[20px] border border-[#ECEFF5] p-4" aria-live="polite">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-[14px] font-bold text-[#13364A]">
            Đang tổng hợp thông tin địa điểm
          </p>
          <span className="mt-0.5 text-[11px] text-[#72818C]">
            ({doneSteps}/{STEPS.length} bước)
          </span>
          <span className="text-[16px] font-extrabold text-[#087A78]">
            {finished ? 100 : percent}%
          </span>
        </div>

        <div
          className="mt-2.5 h-[7px] overflow-hidden rounded-full bg-[#E3E8EF]"
          role="progressbar"
          aria-valuenow={finished ? 100 : percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#075C66] transition-[width] duration-100"
            style={{ width: `${finished ? 100 : percent}%` }}
          />
        </div>

        <ul className="mt-3 grid gap-2">
          {STEPS.map((step, index) => {
            const status = index < doneSteps
              ? 'done'
              : !error && index === currentStep
                ? 'doing'
                : 'waiting';

            return (
              <li
                key={step.done}
                className={`flex items-center rounded-2xl px-3 py-2.5 ${
                  status === 'doing'
                    ? 'border border-[#9FE3D6] bg-[#E2FAF5]'
                    : status === 'done'
                      ? 'bg-[#F4F6FB]'
                      : ''
                }`}
              >
                {status === 'done' && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#075C66] text-white">
                    <Icon name="check" className="text-[15px]" />
                  </span>
                )}
                {status === 'doing' && (
                  <span className="flex h-6 w-6 items-center justify-center">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#C3F8F0] border-t-[#087A78]" />
                  </span>
                )}
                {status === 'waiting' && (
                  <span className="h-6 w-6 rounded-full border-[1.5px] border-[#D0D6DE]" />
                )}
                <span
                  className={`ml-2.5 flex-1 truncate text-[12px] ${
                    status === 'waiting'
                      ? 'text-[#A7B0B8]'
                      : 'font-semibold text-[#13364A]'
                  }`}
                >
                  {status === 'done' ? step.done : step.doing}
                </span>
                <span
                  className={`ml-2 text-[11px] font-semibold ${
                    status === 'done'
                      ? 'text-[#075C66]'
                      : status === 'doing'
                        ? 'text-[#087A78]'
                        : 'text-[#A7B0B8]'
                  }`}
                >
                  {status === 'done' ? 'Xong' : status === 'doing' ? '•••' : 'Chờ'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {error && (
        <div role="alert" className="mt-3 rounded-2xl border border-red-100 bg-red-50 p-3 text-[12px] text-red-700">
          <p>{error}</p>
          {validPlanId && (
            <button
              type="button"
              onClick={retry}
              className="mt-2 rounded-full bg-white px-4 py-2 font-bold text-[#075C66]"
            >
              Thử tải lại
            </button>
          )}
        </div>
      )}

      {plan && (
        <div className="mt-4 flex items-center rounded-[18px] border border-[#ECEFF5] p-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EBEDFF] text-[#087A78]">
            <Icon name="location_on" className="text-[22px]" />
          </span>
          <div className="ml-3 min-w-0 flex-1">
            <p className="truncate text-[14px] font-extrabold text-[#13364A]">
              {plan.destination}
            </p>
            <p className="text-[11px] text-[#72818C]">
              {plan.startDate} – {plan.endDate} • {plan.groupSize} người
            </p>
            {candidateCount !== null && (
              <p className="mt-1 text-[11px] text-[#087A78]">
                {candidateCount} địa điểm trong danh sách hiện có
              </p>
            )}
          </div>
        </div>
      )}

      <p className="mt-3 text-center text-[10px] leading-4 text-[#8795A1]">
        Hiện danh sách lấy từ catalogue Backend. Khi thành viên AI hoàn thiện API
        Embedding, màn hình này vẫn được giữ để hiển thị quá trình tải gợi ý AI.
      </p>

      <button
        type="button"
        onClick={openSuggestions}
        disabled={!finished || Boolean(error)}
        className={`mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold ${
          finished
            ? 'bg-[#075C66] text-white hover:bg-primary'
            : 'cursor-not-allowed bg-[#EBEDFF] text-[#075C66]'
        }`}
      >
        <Icon name={finished ? 'travel_explore' : 'schedule'} className="text-[18px]" />
        {finished ? 'Xem địa điểm gợi ý' : 'Đang chuẩn bị danh sách địa điểm...'}
      </button>

      <button
        type="button"
        onClick={() => setConfirmCancel(true)}
        className="w-full py-3 text-[12px] text-[#72818C] hover:text-primary"
      >
        Quay lại
      </button>

      {confirmCancel && (
        <ConfirmDialog
          title="Quay lại trang chuyến đi?"
          message="Kế hoạch đã được lưu trên Backend. Quay lại sẽ không xóa kế hoạch này."
          cancelLabel="Tiếp tục"
          confirmLabel="Quay lại"
          onConfirm={() => navigate(CLIENT_ROUTES.TRIPS)}
          onClose={() => setConfirmCancel(false)}
        />
      )}
    </div>
  );
}
