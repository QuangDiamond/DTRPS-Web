import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import TypePicker from '@/components/common/TypePicker';
import { ClientApiError, errorMessage } from '@/client/api/http';
import { referenceApi } from '@/client/api/referenceApi';
import { tripFlowApi, type TravelPace, type TravelPlanResponse } from '@/client/api/tripFlowApi';
import type { CategoryGroup, ReferenceItem } from '@/client/api/types';
import { CLIENT_ROUTES } from '@/client/routePaths';
import SectionCard from '@/client/traveller/components/SectionCard';
import { categoryCodesToTypes, typesToCategoryCodes } from '@/client/traveller/data/planForm';
import { canEditPlan, planStatusInfo } from '@/client/traveller/data/planStatus';
import { PACE_OPTIONS } from '@/client/traveller/data/planTrip';
import PageBar from '@/client/ui/PageBar';

const PACE_TO_API: Record<string, TravelPace> = {
  relaxed: 'RELAXED',
  balanced: 'BALANCED',
  packed: 'PACKED',
};

const inputClass =
  'h-11 w-full rounded-2xl border border-[#E3E7F0] bg-[#F8F8FF] px-3.5 text-[14px] font-semibold text-[#13364A] focus:ring-2 focus:ring-primary/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';

const labelClass = 'mb-1 block text-[12px] font-semibold text-[#72818C]';

interface FormState {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  groupSize: number;
  description: string;
  travelPace: TravelPace;
  groupCodes: string[];
  typeCodes: string[];
}

interface LoadedData {
  plan: TravelPlanResponse;
  provinces: ReferenceItem[];
  groups: CategoryGroup[];
  hasItinerary: boolean;
}

function toForm(plan: TravelPlanResponse, groups: CategoryGroup[]): FormState {
  const types = categoryCodesToTypes(groups, plan.categoryCodes ?? []);
  return {
    title: plan.title,
    destination: plan.destination,
    startDate: plan.startDate,
    endDate: plan.endDate,
    budget: plan.budget === null || plan.budget === undefined ? '' : String(plan.budget),
    groupSize: plan.groupSize,
    description: plan.description ?? '',
    travelPace: plan.travelPace,
    groupCodes: types.groupCodes,
    typeCodes: types.typeCodes,
  };
}

/** Kế hoạch đã có lịch trình chưa (404 = chưa có). */
async function hasActiveItinerary(planId: number): Promise<boolean> {
  try {
    await tripFlowApi.activeItinerary(planId);
    return true;
  } catch (caught) {
    if (caught instanceof ClientApiError && caught.status === 404) return false;
    throw caught;
  }
}

/** Sửa kế hoạch du lịch: PUT /travel-plans/{planId}. */
export default function EditTripPlanPage() {
  const navigate = useNavigate();
  const { planId: planIdParam } = useParams();
  const planId = Number(planIdParam);

  const [data, setData] = useState<LoadedData | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(planId) || planId <= 0) {
      setLoadError('Đường dẫn kế hoạch không hợp lệ.');
      return;
    }

    let active = true;
    setLoadError(null);

    Promise.all([
      tripFlowApi.plan(planId),
      referenceApi.provinces(),
      referenceApi.categories(),
      hasActiveItinerary(planId),
    ])
      .then(([plan, provinces, groups, hasItinerary]) => {
        if (!active) return;
        setData({
          plan,
          provinces,
          groups,
          hasItinerary,
        });
        setForm(toForm(plan, groups));
      })
      .catch((caught: unknown) => {
        if (active) setLoadError(errorMessage(caught));
      });

    return () => {
      active = false;
    };
  }, [planId, retryCount]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setError(null);
  };

  // ---------------------------------------------------------------- tải dữ liệu

  if (loadError) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageBar title="Sửa kế hoạch" backTo={CLIENT_ROUTES.TRIPS} />
        <div role="alert" className="rounded-[22px] border border-red-100 bg-red-50 p-5">
          <p className="text-[12px] text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={() => setRetryCount((value) => value + 1)}
            className="mt-3 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-[#075C66]"
          >
            Thử tải lại
          </button>
        </div>
      </div>
    );
  }

  if (!data || !form) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageBar title="Sửa kế hoạch" backTo={CLIENT_ROUTES.TRIPS} />
        <div role="status" className="rounded-[22px] bg-white p-10 text-center">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-[#C3F8F0] border-t-[#087A78]" />
          <p className="mt-3 text-[12px] text-[#72818C]">Đang tải kế hoạch...</p>
        </div>
      </div>
    );
  }

  const { plan, provinces, groups, hasItinerary } = data;

  if (!canEditPlan(plan)) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageBar title="Sửa kế hoạch" backTo={CLIENT_ROUTES.TRIPS} />
        <div className="rounded-[22px] bg-white p-6 text-center">
          <p className="text-[14px] font-bold text-[#13364A]">
            Kế hoạch đang ở trạng thái “{planStatusInfo(plan.status).label}” nên không sửa được.
          </p>
          <p className="mt-1 text-[12px] text-[#72818C]">
            Chỉ sửa được kế hoạch ở trạng thái Bản nháp hoặc Đã lên kế hoạch.
          </p>
          <Link
            to={CLIENT_ROUTES.TRIPS}
            className="mt-4 inline-flex rounded-full bg-[#075C66] px-5 py-2.5 text-[12px] font-bold text-white"
          >
            Về danh sách chuyến đi
          </Link>
        </div>
      </div>
    );
  }

  // Điểm đến cũ có thể không nằm trong danh sách tỉnh hiện tại: vẫn giữ để chọn lại.
  const destinationOptions = provinces.some((item) => item.name === plan.destination)
    ? provinces
    : [{ code: '__current__', name: plan.destination }, ...provinces];

  // ---------------------------------------------------------------- lưu

  const submit = async () => {
    if (saving) return;
    setError(null);

    const title = form.title.trim();
    if (!title) return setError('Hãy nhập tên kế hoạch.');
    if (title.length > 255) return setError('Tên kế hoạch tối đa 255 ký tự.');
    if (!form.destination) return setError('Hãy chọn điểm đến.');
    if (!form.startDate || !form.endDate) return setError('Hãy chọn ngày đi và ngày về.');
    if (form.endDate < form.startDate) {
      return setError('Ngày về phải bằng hoặc sau ngày đi.');
    }

    const budgetText = form.budget.trim();
    const budget = budgetText === '' ? null : Number(budgetText);
    if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
      return setError('Ngân sách phải là số không âm.');
    }

    const categoryCodes = typesToCategoryCodes(groups, form.groupCodes, form.typeCodes);
    if (categoryCodes.length > 50) {
      return setError('Hãy chọn tối đa 50 loại hình trải nghiệm.');
    }

    setSaving(true);
    try {
      const saved = await tripFlowApi.updatePlan(plan.planId, {
        title,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        budget,
        currency: plan.currency || 'VND',
        groupSize: form.groupSize,
        description: form.description.trim() || null,
        categoryCodes,
        travelPace: form.travelPace,
      });
      navigate(CLIENT_ROUTES.TRIPS, {
        state: { notice: `Đã lưu kế hoạch “${saved.title}”.` },
      });
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------- giao diện

  return (
    <div className="mx-auto max-w-4xl pb-36 md:pb-4">
      <PageBar title="Sửa kế hoạch" subtitle={plan.title} backTo={CLIENT_ROUTES.TRIPS} />

      {hasItinerary && (
        <div className="mb-3.5 flex items-start gap-2 rounded-2xl bg-[#FFF4E0] px-4 py-3 text-[12px] text-[#8A4B00]">
          <Icon name="info" className="mt-0.5 text-[16px]" />
          <span>
            Kế hoạch đã có lịch trình nên không đổi được điểm đến, ngày đi và ngày về. Các thông tin
            khác vẫn sửa được.
          </span>
        </div>
      )}

      <div className="grid gap-3.5 md:grid-cols-2">
        {/* THÔNG TIN CHUNG */}
        <SectionCard icon="edit" title="Thông tin chung" subtitle="Tên và mô tả kế hoạch">
          <label htmlFor="plan-title" className={labelClass}>
            Tên kế hoạch
          </label>
          <input
            id="plan-title"
            value={form.title}
            maxLength={255}
            onChange={(event) => update('title', event.target.value)}
            className={inputClass}
          />

          <label htmlFor="plan-description" className={`${labelClass} mt-3`}>
            Mô tả
          </label>
          <textarea
            id="plan-description"
            rows={3}
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            className="w-full rounded-2xl border border-[#E3E7F0] bg-[#F8F8FF] px-3.5 py-2.5 text-[13px] text-[#13364A] focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
        </SectionCard>

        {/* ĐIỂM ĐẾN & THỜI GIAN */}
        <SectionCard
          icon="location_on"
          title="Điểm đến & thời gian"
          subtitle={
            hasItinerary ? 'Đã khóa vì kế hoạch có lịch trình' : 'Tỉnh/thành, ngày đi và ngày về'
          }
        >
          <label htmlFor="plan-destination" className={labelClass}>
            Điểm đến
          </label>
          <select
            id="plan-destination"
            value={form.destination}
            disabled={hasItinerary}
            onChange={(event) => update('destination', event.target.value)}
            className={`${inputClass} cursor-pointer`}
          >
            {destinationOptions.map((item) => (
              <option key={item.code} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="plan-start" className={labelClass}>
                Ngày đi
              </label>
              <input
                id="plan-start"
                type="date"
                value={form.startDate}
                disabled={hasItinerary}
                onChange={(event) => update('startDate', event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="plan-end" className={labelClass}>
                Ngày về
              </label>
              <input
                id="plan-end"
                type="date"
                value={form.endDate}
                min={form.startDate}
                disabled={hasItinerary}
                onChange={(event) => update('endDate', event.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </SectionCard>

        {/* NHÓM & NGÂN SÁCH */}
        <SectionCard icon="groups" title="Số người & ngân sách" subtitle="Ngân sách cho cả nhóm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="plan-group" className={labelClass}>
                Số người
              </label>
              <input
                id="plan-group"
                type="number"
                min={1}
                max={20}
                value={form.groupSize}
                onChange={(event) =>
                  update('groupSize', Math.min(20, Math.max(1, Number(event.target.value) || 1)))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="plan-budget" className={labelClass}>
                Ngân sách ({plan.currency || 'VND'})
              </label>
              <input
                id="plan-budget"
                type="number"
                min={0}
                step={100000}
                placeholder="Để trống nếu chưa có"
                value={form.budget}
                onChange={(event) => update('budget', event.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </SectionCard>

        {/* NHỊP ĐỘ */}
        <SectionCard icon="speed" title="Nhịp độ chuyến đi" subtitle="Tần suất và mật độ hoạt động">
          <div role="radiogroup" aria-label="Nhịp độ chuyến đi" className="grid grid-cols-3 gap-2">
            {PACE_OPTIONS.map((item) => {
              const value = PACE_TO_API[item.id];
              const selected = form.travelPace === value;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => update('travelPace', value)}
                  className={`rounded-2xl px-2 py-2.5 text-center ${
                    selected
                      ? 'border-[1.5px] border-[#087A78] bg-[#E2FAF5]'
                      : 'border border-[#E3E7F0] bg-[#F8F8FF]'
                  }`}
                >
                  <span className="block text-[12px] font-bold text-[#13364A]">{item.label}</span>
                  <span className="block text-[10px] text-[#087A78]">{item.perDay}</span>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* LOẠI HÌNH DỊCH VỤ */}
        <SectionCard
          icon="volunteer_activism"
          title="Loại hình trải nghiệm"
          subtitle="Dùng để gợi ý địa điểm cho chuyến đi"
        >
          {groups.length === 0 ? (
            <p className="text-[12px] text-[#72818C]">Hiện chưa có danh mục trải nghiệm.</p>
          ) : (
            <TypePicker
              groups={groups}
              groupCodes={form.groupCodes}
              typeCodes={form.typeCodes}
              onChange={(groupCodes, typeCodes) => {
                update('groupCodes', groupCodes);
                update('typeCodes', typeCodes);
              }}
              showMain={false}
              allWhenEmpty
            />
          )}
        </SectionCard>
      </div>

      {/* NÚT LƯU */}
      <div className="fixed inset-x-0 bottom-[62px] z-20 bg-white px-4 pt-2.5 pb-3 md:static md:mt-4 md:rounded-[20px]">
        {error && (
          <p role="alert" className="mb-2 text-center text-[12px] text-client-danger">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <Link
            to={CLIENT_ROUTES.TRIPS}
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-[#EBEDFF] text-[14px] font-bold text-[#075C66]"
          >
            Hủy
          </Link>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving}
            className="flex h-12 flex-[2] items-center justify-center gap-1.5 rounded-full bg-[#075C66] text-[14px] font-bold text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            <Icon name={saving ? 'hourglass_empty' : 'check'} className="text-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
