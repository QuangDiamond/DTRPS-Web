import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { useTraveller } from '@/client/traveller/travellerContext';
import { ConfirmDialog } from '@/client/ui/Overlay';

/** Tổng thời gian giả lập tạo lịch trình (ms) — chưa có AI thật */
const TOTAL_DURATION = 8000;

const STEPS = [
  {
    doing: 'Đang chọn lọc danh lam thắng cảnh phù hợp',
    done: 'Đã chọn lọc danh lam thắng cảnh phù hợp',
  },
  {
    doing: 'Đang cập nhật thông tin thời tiết dự báo',
    done: 'Đã cập nhật thông tin thời tiết dự báo',
  },
  {
    doing: 'Đang cân đối thời gian và lộ trình di chuyển',
    done: 'Đã cân đối thời gian và lộ trình di chuyển',
  },
  {
    doing: 'Chuẩn bị bảng dự toán chi phí theo ngân sách',
    done: 'Đã lập bảng dự toán chi phí theo ngân sách',
  },
];

const easeOutQuad = (ratio: number) => 1 - (1 - ratio) * (1 - ratio);

function GlobeAnimation({ finished }: { finished: boolean }) {
  return (
    <div className="relative mx-auto flex h-[210px] w-[210px] items-center justify-center">
      <span className="absolute h-[200px] w-[200px] animate-pulse rounded-full border border-[#D8EEF0] bg-[#F2FBFA]" />
      <span className="absolute h-[160px] w-[160px] rounded-full border border-[#D8EEF0]" />
      {!finished && (
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

/** Đang tạo lịch trình — theo GeneratingTripScreen của mobile */
export default function GeneratingTripPage() {
  const navigate = useNavigate();
  const { plan } = useTraveller();
  const [elapsed, setElapsed] = useState(0);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const next = Math.min(TOTAL_DURATION, Date.now() - startedAt);
      setElapsed(next);
      if (next >= TOTAL_DURATION) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  if (!plan) return <Navigate to={CLIENT_ROUTES.TRIP_PLAN} replace />;

  const ratio = elapsed / TOTAL_DURATION;
  const finished = ratio >= 1;
  const percent = Math.round(easeOutQuad(ratio) * 100);
  const currentStep = Math.min(STEPS.length, Math.floor(ratio * STEPS.length));
  const doneSteps = finished ? STEPS.length : currentStep;
  const backToPlan = () => navigate(CLIENT_ROUTES.TRIP_PLAN);

  return (
    <div className="mx-auto max-w-xl rounded-[24px] bg-white px-5 pt-6 pb-4">
      <GlobeAnimation finished={finished} />

      <p className="mx-auto mt-2 flex w-fit items-center gap-1 rounded-full bg-[#EBEDFF] px-3 py-1 text-[11px] font-semibold text-[#075C66]">
        <Icon name="explore" className="text-[14px]" />
        Hành trình cá nhân hóa
      </p>
      <h1 className="mt-3 text-center text-[21px] leading-7 font-extrabold text-[#13364A]">
        {finished ? 'Hành trình của bạn đã sẵn sàng!' : 'Đang chuẩn bị hành trình hoàn hảo...'}
      </h1>
      <p className="mt-2 text-center text-[12px] leading-5 text-[#72818C]">
        Hệ thống đang đối chiếu dữ liệu điểm đến, thời tiết và khoảng cách di chuyển tại{' '}
        <b className="text-[#087A78]">{plan.destinationName}</b>.
      </p>

      <div className="mt-5 rounded-[20px] border border-[#ECEFF5] p-4" aria-live="polite">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-[14px] font-bold text-[#13364A]">
            Đang tổng hợp thông tin địa điểm
          </p>
          <span className="mt-0.5 text-[11px] text-[#72818C]">
            ({doneSteps}/{STEPS.length} bước)
          </span>
          <span className="text-[16px] font-extrabold text-[#087A78]">{percent}%</span>
        </div>
        <div
          className="mt-2.5 h-[7px] overflow-hidden rounded-full bg-[#E3E8EF]"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#075C66] transition-[width] duration-100"
            style={{ width: `${percent}%` }}
          />
        </div>
        <ul className="mt-3 grid gap-2">
          {STEPS.map((step, index) => {
            const status = index < doneSteps ? 'done' : index === currentStep ? 'doing' : 'waiting';
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
                    status === 'waiting' ? 'text-[#A7B0B8]' : 'font-semibold text-[#13364A]'
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

      <div className="mt-4 flex items-center rounded-[18px] border border-[#ECEFF5] p-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EBEDFF] text-[#087A78]">
          <Icon name="location_on" className="text-[22px]" />
        </span>
        <div className="ml-3 min-w-0 flex-1">
          <p className="truncate text-[14px] font-extrabold text-[#13364A]">
            {plan.destinationName}
          </p>
          <p className="text-[11px] text-[#72818C]">
            Hành trình {plan.days}N{Math.max(plan.days - 1, 0)}Đ • {plan.members} người
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(CLIENT_ROUTES.TRIP_SUGGESTIONS, { replace: true })}
        disabled={!finished}
        className={`mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold ${
          finished ? 'bg-[#075C66] text-white hover:bg-primary' : 'bg-[#EBEDFF] text-[#075C66]'
        }`}
      >
        <Icon name={finished ? 'travel_explore' : 'schedule'} className="text-[18px]" />
        {finished ? 'Xem địa điểm gợi ý' : 'Đang hoàn tất các bước cuối...'}
      </button>
      <button
        type="button"
        onClick={() => (finished ? backToPlan() : setConfirmCancel(true))}
        className="w-full py-3 text-[12px] text-[#72818C] hover:text-primary"
      >
        {finished ? 'Quay lại chỉnh sửa' : 'Hủy tạo lịch trình'}
      </button>

      {confirmCancel && (
        <ConfirmDialog
          title="Hủy tạo lịch trình?"
          message="Tiến trình hiện tại sẽ không được lưu."
          cancelLabel="Tiếp tục tạo"
          confirmLabel="Hủy"
          danger
          onConfirm={backToPlan}
          onClose={() => setConfirmCancel(false)}
        />
      )}
    </div>
  );
}
