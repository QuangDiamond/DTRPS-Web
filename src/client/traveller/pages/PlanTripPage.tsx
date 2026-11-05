import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import TypePicker from '@/components/common/TypePicker';
import { referenceApi } from '@/client/api/referenceApi';
import type { CategoryGroup, ReferenceItem, TravelPreferences } from '@/client/api/types';
import { userApi } from '@/client/api/userApi';
import { CLIENT_ROUTES } from '@/client/routePaths';
import {
  COMPANION_OPTIONS,
  type CompanionId,
  PACE_OPTIONS,
  type PaceId,
  DEFAULT_PLAN_TYPES,
  PLAN_BUDGET_OPTIONS,
  type PlanBudgetId,
  preferencesToTypes,
  typesToInterests,
} from '@/client/traveller/data/planTrip';
import { useTraveller } from '@/client/traveller/travellerContext';
import PageBar from '@/client/ui/PageBar';

const pad = (value: number) => String(value).padStart(2, '0');
const toInputDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatDate = (date: Date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Chuyển sở thích đã lưu (UC-006) sang lựa chọn mặc định của màn này */
function fromPreferences(preferences: TravelPreferences) {
  const budgetMap: Record<string, PlanBudgetId> = {
    SAVING: 'saving',
    MEDIUM: 'standard',
    LUXURY: 'luxury',
  };
  const paceMap: Record<string, PaceId> = {
    RELAX: 'relaxed',
    LUXURY: 'relaxed',
    FAMILY: 'relaxed',
    ADVENTURE: 'packed',
  };
  return {
    budget: preferences.budgetLevel ? budgetMap[preferences.budgetLevel] : null,
    pace: preferences.travelStyle ? (paceMap[preferences.travelStyle] ?? null) : null,
  };
}

function SectionCard({
  icon,
  title,
  subtitle,
  right,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[20px] bg-white p-4">
      <div className="mb-3 flex items-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBEDFF] text-[#087A78]">
          <Icon name={icon} className="text-[19px]" />
        </span>
        <div className="ml-2.5 min-w-0 flex-1">
          <h2 className="text-[14px] font-extrabold text-[#13364A]">{title}</h2>
          <p className="text-[11px] text-[#72818C]">{subtitle}</p>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function StepperButton({
  icon,
  label,
  onClick,
  disabled,
  filled,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  filled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-40 ${
        filled ? 'bg-[#075C66] text-white' : 'bg-[#EBEDFF] text-[#075C66]'
      }`}
    >
      <Icon name={icon} className="text-[18px]" />
    </button>
  );
}

/** Lập kế hoạch chuyến đi — theo PlanTripScreen của mobile */
export default function PlanTripPage() {
  const navigate = useNavigate();
  const { startPlan } = useTraveller();
  const touched = useRef(false);

  const [provinces, setProvinces] = useState<ReferenceItem[]>([]);
  const [provincesFailed, setProvincesFailed] = useState(false);
  const [destinationId, setDestinationId] = useState('');
  const [startDate, setStartDate] = useState(() => addDays(new Date(), 7));
  const [days, setDays] = useState(4);
  const [companion, setCompanion] = useState<CompanionId>('couple');
  const [members, setMembers] = useState(2);
  const [budget, setBudget] = useState<PlanBudgetId>('standard');
  /** Nhóm dịch vụ + loại hình lấy từ hệ thống — admin thêm loại hình nào thì ở đây có loại đó */
  const [typeGroups, setTypeGroups] = useState<CategoryGroup[]>([]);
  const [groupCodes, setGroupCodes] = useState<string[]>(DEFAULT_PLAN_TYPES.groupCodes);
  const [typeCodes, setTypeCodes] = useState<string[]>(DEFAULT_PLAN_TYPES.typeCodes);
  const [pace, setPace] = useState<PaceId>('balanced');
  const [error, setError] = useState<string | null>(null);

  // Điểm đến = danh mục tỉnh/thành của hệ thống
  useEffect(() => {
    let active = true;
    referenceApi
      .provinces()
      .then((items) => {
        if (active) setProvinces(items);
      })
      .catch(() => {
        if (active) setProvincesFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Nhóm / loại hình của hệ thống, rồi điền sẵn theo sở thích đã lưu (nếu người dùng chưa tự chỉnh)
  useEffect(() => {
    let active = true;
    Promise.allSettled([referenceApi.categories(), userApi.preferences()]).then(
      ([groupsResult, preferencesResult]) => {
        if (!active) return;
        const groups = groupsResult.status === 'fulfilled' ? groupsResult.value : [];
        setTypeGroups(groups);
        if (preferencesResult.status !== 'fulfilled' || touched.current) return;
        const preferences = preferencesResult.value;
        const initial = fromPreferences(preferences);
        const known = new Set(groups.flatMap((group) => group.subtypes.map((s) => s.code)));
        const types = preferencesToTypes(preferences.interests, preferences.travelStyle, known);
        if (types) {
          setGroupCodes(types.groupCodes);
          setTypeCodes(types.typeCodes);
        }
        if (initial.budget) setBudget(initial.budget);
        if (initial.pace) setPace(initial.pace);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const touch =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      touched.current = true;
      setter(value);
    };

  const destination = provinces.find((item) => item.code === destinationId);
  const endDate = addDays(startDate, days - 1);
  const budgetOption = PLAN_BUDGET_OPTIONS.find((item) => item.id === budget)!;
  const minDate = toInputDate(new Date());

  const selectCompanion = (id: CompanionId) => {
    setCompanion(id);
    setMembers(COMPANION_OPTIONS.find((item) => item.id === id)!.defaultCount);
  };

  const changeMembers = (delta: number) => {
    const next = Math.min(20, Math.max(1, members + delta));
    setMembers(next);
    // Tự đổi kiểu đoàn khi số người không còn khớp
    if (next === 1) setCompanion('solo');
    else if (companion === 'solo') setCompanion(next === 2 ? 'couple' : 'friends');
  };

  const changeTypes = (groups: string[], types: string[]) => {
    touched.current = true;
    setGroupCodes(groups);
    setTypeCodes(types);
    setError(null);
  };

  const submit = () => {
    if (!destination) {
      setError('Hãy chọn điểm đến.');
      return;
    }
    if (groupCodes.length === 0) {
      setError('Hãy chọn ít nhất một dịch vụ trong Sở thích trải nghiệm.');
      return;
    }
    const interests = typesToInterests(typeGroups, groupCodes, typeCodes);
    startPlan({ destinationId, destinationName: destination.name, days, members, interests });
    navigate(CLIENT_ROUTES.TRIP_GENERATING);
  };

  return (
    <div className="mx-auto max-w-4xl pb-36 md:pb-4">
      <PageBar title="Lập kế hoạch chuyến đi" backTo={CLIENT_ROUTES.TRIPS} />

      <span className="inline-flex items-center gap-1 rounded-full bg-[#C3F8F0] px-2.5 py-1 text-[10px] font-bold text-[#075C66]">
        <Icon name="auto_awesome" className="text-[12px]" />
        Smart AI Itinerary Engine
      </span>
      <h2 className="mt-2 text-[20px] font-extrabold text-[#13364A] md:text-[24px]">
        Tạo lịch trình du lịch cá nhân hóa
      </h2>
      <p className="mt-1 text-[12px] text-[#72818C]">
        Tùy biến hành trình khám phá Việt Nam theo phong cách của bạn
      </p>

      <div className="mt-4 grid gap-3.5 md:grid-cols-2">
        <SectionCard
          icon="location_on"
          title="Điểm đến mơ ước"
          subtitle="Chọn thành phố hoặc khu vực du lịch"
        >
          <div className="relative">
            <Icon
              name="near_me"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[18px] text-[#087A78]"
            />
            <select
              value={destinationId}
              onChange={(event) => setDestinationId(event.target.value)}
              aria-label="Điểm đến"
              className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-[#E3E7F0] bg-[#F8F8FF] pr-10 pl-10 text-[14px] font-bold text-[#13364A] focus:ring-2 focus:ring-primary/30 focus:outline-none"
            >
              <option value="" disabled>
                {provincesFailed ? 'Không tải được danh sách tỉnh/thành' : 'Chọn tỉnh/thành'}
              </option>
              {provinces.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[22px] text-[#72818C]"
            />
          </div>
        </SectionCard>

        <SectionCard
          icon="calendar_month"
          title="Thời gian chuyến đi"
          subtitle="Chọn ngày bắt đầu và số ngày"
        >
          <div className="rounded-2xl border border-[#E3E7F0] bg-[#F8F8FF] px-3.5 py-2.5">
            <p className="text-[15px] font-extrabold text-[#13364A]">
              {formatDate(startDate)} - {formatDate(endDate)}
            </p>
            <p className="text-[11px] font-semibold text-[#087A78]">
              {days} ngày {days - 1} đêm
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <label htmlFor="trip-start" className="text-[12px] font-semibold text-[#72818C]">
              Ngày đi
            </label>
            <input
              id="trip-start"
              type="date"
              min={minDate}
              value={toInputDate(startDate)}
              onChange={(event) => {
                if (!event.target.value) return;
                const [year, month, day] = event.target.value.split('-').map(Number);
                setStartDate(new Date(year, month - 1, day));
              }}
              className="rounded-xl bg-[#F8F8FF] px-3 py-1.5 text-[13px] font-bold text-[#13364A] focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#72818C]">Số ngày</span>
            <div className="flex items-center gap-2.5">
              <StepperButton
                icon="remove"
                label="Bớt một ngày"
                disabled={days <= 1}
                onClick={() => setDays(days - 1)}
              />
              <span className="w-[70px] text-center text-[13px] font-bold text-[#13364A]">
                {days} ngày
              </span>
              <StepperButton
                icon="add"
                label="Thêm một ngày"
                disabled={days >= 14}
                onClick={() => setDays(days + 1)}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon="groups" title="Bạn đồng hành" subtitle="Số lượng và kiểu nhóm du lịch">
          <div className="grid grid-cols-2 gap-2">
            {COMPANION_OPTIONS.map((item) => {
              const selected = item.id === companion;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectCompanion(item.id)}
                  aria-pressed={selected}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left ${
                    selected
                      ? 'border-[1.5px] border-[#087A78] bg-[#E2FAF5]'
                      : 'border border-[#E3E7F0] bg-[#F8F8FF]'
                  }`}
                >
                  <Icon
                    name={item.icon}
                    className={`text-[19px] ${selected ? 'text-[#075C66]' : 'text-[#72818C]'}`}
                  />
                  <span>
                    <span className="block text-[12px] font-bold text-[#13364A]">{item.label}</span>
                    <span className="block text-[10px] text-[#72818C]">{item.note}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#72818C]">Tùy chỉnh thành viên:</span>
            <div className="flex items-center gap-3">
              <StepperButton
                icon="remove"
                label="Bớt một người"
                disabled={members <= 1}
                onClick={() => changeMembers(-1)}
              />
              <span className="w-6 text-center text-[15px] font-extrabold text-[#13364A]">
                {members}
              </span>
              <StepperButton
                icon="add"
                label="Thêm một người"
                filled
                disabled={members >= 20}
                onClick={() => changeMembers(1)}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon="account_balance_wallet"
          title="Ngân sách dự kiến"
          subtitle="Mức chi tiêu trung bình / người"
          right={
            <span className="text-[15px] font-extrabold text-[#087A78]">
              {budgetOption.estimate}
            </span>
          }
        >
          <div className="flex rounded-2xl bg-[#EBEDFF] p-1">
            {PLAN_BUDGET_OPTIONS.map((item) => {
              const selected = item.id === budget;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => touch(setBudget)(item.id)}
                  aria-pressed={selected}
                  className={`flex flex-1 flex-col items-center rounded-xl py-2 ${
                    selected ? 'bg-[#C3F8F0]' : ''
                  }`}
                >
                  <span
                    className={`text-[12px] font-bold ${selected ? 'text-[#075C66]' : 'text-[#13364A]'}`}
                  >
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[#72818C]">{item.note}</span>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          icon="volunteer_activism"
          title="Sở thích trải nghiệm"
          subtitle="Tích dịch vụ bạn quan tâm, rồi chọn loại hình cụ thể (nếu muốn)"
        >
          {typeGroups.length === 0 ? (
            <p className="text-[12px] text-[#72818C]">Đang tải danh mục dịch vụ…</p>
          ) : (
            <TypePicker
              groups={typeGroups}
              groupCodes={groupCodes}
              typeCodes={typeCodes}
              onChange={changeTypes}
              showMain={false}
              allWhenEmpty
            />
          )}
        </SectionCard>

        <SectionCard
          icon="speed"
          title="Nhịp độ chuyến đi (Travel Pace)"
          subtitle="Tần suất và mật độ hoạt động"
        >
          <div role="radiogroup" aria-label="Nhịp độ chuyến đi" className="grid gap-2">
            {PACE_OPTIONS.map((item) => {
              const selected = item.id === pace;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => touch(setPace)(item.id)}
                  className={`flex items-start rounded-2xl p-3 text-left ${
                    selected
                      ? 'border-[1.5px] border-[#087A78] bg-[#E2FAF5]'
                      : 'border border-[#E3E7F0] bg-[#F8F8FF]'
                  }`}
                >
                  <span
                    className={`mt-0.5 mr-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      selected ? 'bg-[#087A78] text-white' : 'border-[1.5px] border-[#C5CDD3]'
                    }`}
                  >
                    {selected && <Icon name="check" className="text-[14px]" />}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-[#13364A]">
                        {item.label} ({item.english})
                      </span>
                      <span className="text-[10px] font-semibold text-[#087A78]">
                        {item.perDay}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] text-[#72818C]">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <div className="fixed inset-x-0 bottom-[62px] z-20 bg-white px-4 pt-2.5 pb-3 md:static md:mt-4 md:rounded-[20px]">
        <p className="mb-2 flex items-center justify-center gap-1 text-[11px] text-[#72818C]">
          <Icon name="bolt" filled className="text-[14px] text-[#E0A100]" />
          Tối ưu hóa lịch trình thông minh trong vài giây bởi AI
        </p>
        {error && (
          <p role="alert" className="mb-2 text-center text-[12px] text-client-danger">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          className="flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-[#075C66] text-[14px] font-bold text-white hover:bg-primary"
        >
          Tạo chuyến đi của tôi <Icon name="arrow_forward" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}
