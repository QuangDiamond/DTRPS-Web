
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import TypePicker from '@/components/common/TypePicker';
import { referenceApi } from '@/client/api/referenceApi';
import { errorMessage } from '@/client/api/http';
import { tripFlowApi, type TravelPace } from '@/client/api/tripFlowApi';
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

// Ngân sách UI đang hiển thị theo người.
// Backend lưu ngân sách toàn bộ nhóm.
const BUDGET_PER_PERSON: Record<PlanBudgetId, number> = {
  saving: 3_500_000,
  standard: 8_000_000,
  luxury: 15_000_000,
};

// Chuyển mã nhịp độ của UI sang Backend.
const PACE_TO_API: Record<PaceId, TravelPace> = {
  relaxed: 'RELAXED',
  balanced: 'BALANCED',
  packed: 'PACKED',
};

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

/** Chuyển sở thích đã lưu (UC-006) sang lựa chọn mặc định */
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
    budget: preferences.budgetLevel
      ? budgetMap[preferences.budgetLevel]
      : null,
    pace: preferences.travelStyle
      ? (paceMap[preferences.travelStyle] ?? null)
      : null,
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
          <h2 className="text-[14px] font-extrabold text-[#13364A]">
            {title}
          </h2>
          <p className="text-[11px] text-[#72818C]">
            {subtitle}
          </p>
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
        filled
          ? 'bg-[#075C66] text-white'
          : 'bg-[#EBEDFF] text-[#075C66]'
      }`}
    >
      <Icon name={icon} className="text-[18px]" />
    </button>
  );
}

/** Lập kế hoạch chuyến đi - kết nối Backend thật */
export default function PlanTripPage() {
  const navigate = useNavigate();

  // State cũ được giữ tạm cho màn hình tiếp theo.
  const { startPlan } = useTraveller();

  const touched = useRef(false);

  const [provinces, setProvinces] = useState<ReferenceItem[]>([]);
  const [provincesFailed, setProvincesFailed] = useState(false);

  const [destinationId, setDestinationId] = useState('');
  const [startDate, setStartDate] = useState(
    () => addDays(new Date(), 7),
  );
  const [days, setDays] = useState(4);

  const [companion, setCompanion] = useState<CompanionId>('couple');
  const [members, setMembers] = useState(2);

  const [budget, setBudget] = useState<PlanBudgetId>('standard');

  // Danh mục từ bảng place_categories.
  const [typeGroups, setTypeGroups] = useState<CategoryGroup[]>([]);
  const [groupCodes, setGroupCodes] = useState<string[]>(
    DEFAULT_PLAN_TYPES.groupCodes,
  );
  const [typeCodes, setTypeCodes] = useState<string[]>(
    DEFAULT_PLAN_TYPES.typeCodes,
  );

  const [pace, setPace] = useState<PaceId>('balanced');
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesFailed, setCategoriesFailed] = useState(false);

  // Lấy danh sách tỉnh/thành từ Backend.
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

  // Lấy danh mục trải nghiệm và sở thích đã lưu.
  useEffect(() => {
    let active = true;

    Promise.allSettled([
      referenceApi.categories(),
      userApi.preferences(),
    ]).then(([groupsResult, preferencesResult]) => {
      if (!active) return;

      const groups =
        groupsResult.status === 'fulfilled'
          ? groupsResult.value
          : [];

      setTypeGroups(groups);
      setCategoriesFailed(groupsResult.status === 'rejected');
      setCategoriesLoading(false);

      if (
        preferencesResult.status !== 'fulfilled' ||
        touched.current
      ) {
        return;
      }

      const preferences = preferencesResult.value;
      const initial = fromPreferences(preferences);

      const known = new Set(
        groups.flatMap((group) =>
          group.subtypes.map((s) => s.code),
        ),
      );

      const types = preferencesToTypes(
        preferences.interests,
        preferences.travelStyle,
        known,
      );

      if (types) {
        setGroupCodes(types.groupCodes);
        setTypeCodes(types.typeCodes);
      }

      if (initial.budget) setBudget(initial.budget);
      if (initial.pace) setPace(initial.pace);
    });

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

  const destination = provinces.find(
    (item) => item.code === destinationId,
  );

  const endDate = addDays(startDate, days - 1);

  const budgetOption = PLAN_BUDGET_OPTIONS.find(
    (item) => item.id === budget,
  )!;

  const minDate = toInputDate(new Date());

  const selectCompanion = (id: CompanionId) => {
    setCompanion(id);
    setMembers(
      COMPANION_OPTIONS.find((item) => item.id === id)!.defaultCount,
    );
  };

  const changeMembers = (delta: number) => {
    const next = Math.min(20, Math.max(1, members + delta));
    setMembers(next);

    if (next === 1) {
      setCompanion('solo');
    } else if (companion === 'solo') {
      setCompanion(next === 2 ? 'couple' : 'friends');
    }
  };

  const changeTypes = (groups: string[], types: string[]) => {
    touched.current = true;
    setGroupCodes(groups);
    setTypeCodes(types);
    setError(null);
  };

  // ==================================================
  // TẠO KẾ HOẠCH THẬT QUA BACKEND
  // ==================================================
  const submit = async () => {
    if (submitting) return;

    setError(null);

    if (!destination) {
      setError('Hãy chọn điểm đến.');
      return;
    }

    if (toInputDate(startDate) < minDate) {
      setError('Ngày bắt đầu không thể ở trong quá khứ.');
      return;
    }

    if (
      categoriesFailed ||
      categoriesLoading ||
      typeGroups.length === 0
    ) {
      setError('Chưa tải được danh mục trải nghiệm từ Backend.');
      return;
    }

    if (groupCodes.length === 0) {
      setError(
        'Hãy chọn ít nhất một nhóm trong Sở thích trải nghiệm.',
      );
      return;
    }

    // Backend chỉ nhận mã danh mục con.
    // Nếu chỉ chọn nhóm, lấy tất cả subtype của nhóm đó.
    const categoryCodes = [
      ...new Set(
        typeGroups.flatMap((group) => {
          if (!groupCodes.includes(group.code)) {
            return [];
          }

          const picked = group.subtypes.filter((type) =>
            typeCodes.includes(type.code),
          );

          return (
            picked.length > 0
              ? picked
              : group.subtypes
          ).map((type) => type.code);
        }),
      ),
    ];

    if (categoryCodes.length === 0) {
      setError(
        'Nhóm đã chọn chưa có loại hình trải nghiệm hợp lệ.',
      );
      return;
    }

    if (categoryCodes.length > 50) {
      setError('Hãy chọn tối đa 50 loại hình trải nghiệm.');
      return;
    }

    setSubmitting(true);

    try {
      const companionLabel = COMPANION_OPTIONS.find(
        (item) => item.id === companion,
      )?.label;

      const saved = await tripFlowApi.createPlan({
        title: `Du lịch ${destination.name} ${days} ngày`,
        destination: destination.name,

        startDate: toInputDate(startDate),
        endDate: toInputDate(endDate),

        // Ngân sách toàn nhóm.
        budget: BUDGET_PER_PERSON[budget] * members,

        currency: 'VND',
        groupSize: members,

        description: companionLabel
          ? `Hình thức đồng hành: ${companionLabel}`
          : null,

        categoryCodes,
        travelPace: PACE_TO_API[pace],
      });

      // Giữ dữ liệu cũ cho GeneratingTripPage chưa sửa.
      const interests = typesToInterests(
        typeGroups,
        groupCodes,
        typeCodes,
      );

      startPlan({
        destinationId,
        destinationName: destination.name,
        days,
        members,
        interests,
      });

      // Dùng ID thật do Backend trả về.
      navigate(
        `${CLIENT_ROUTES.TRIP_GENERATING}?planId=${saved.planId}`,
      );
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-36 md:pb-4">
      <PageBar
        title="Lập kế hoạch chuyến đi"
        backTo={CLIENT_ROUTES.TRIPS}
      />

      <span className="inline-flex items-center gap-1 rounded-full bg-[#C3F8F0] px-2.5 py-1 text-[10px] font-bold text-[#075C66]">
        <Icon
          name="auto_awesome"
          className="text-[12px]"
        />
        Smart AI Itinerary Engine
      </span>

      <h2 className="mt-2 text-[20px] font-extrabold text-[#13364A] md:text-[24px]">
        Tạo lịch trình du lịch cá nhân hóa
      </h2>

      <p className="mt-1 text-[12px] text-[#72818C]">
        Tùy biến hành trình khám phá Việt Nam theo phong cách của bạn
      </p>

      <div className="mt-4 grid gap-3.5 md:grid-cols-2">

        {/* ĐIỂM ĐẾN */}
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
              onChange={(event) =>
                setDestinationId(event.target.value)
              }
              aria-label="Điểm đến"
              className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-[#E3E7F0] bg-[#F8F8FF] pr-10 pl-10 text-[14px] font-bold text-[#13364A] focus:ring-2 focus:ring-primary/30 focus:outline-none"
            >
              <option value="" disabled>
                {provincesFailed
                  ? 'Không tải được danh sách tỉnh/thành'
                  : 'Chọn tỉnh/thành'}
              </option>

              {provinces.map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                >
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

        {/* THỜI GIAN */}
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
            <label
              htmlFor="trip-start"
              className="text-[12px] font-semibold text-[#72818C]"
            >
              Ngày đi
            </label>

            <input
              id="trip-start"
              type="date"
              min={minDate}
              value={toInputDate(startDate)}
              onChange={(event) => {
                if (!event.target.value) return;

                const [year, month, day] =
                  event.target.value
                    .split('-')
                    .map(Number);

                setStartDate(
                  new Date(year, month - 1, day),
                );
              }}
              className="rounded-xl bg-[#F8F8FF] px-3 py-1.5 text-[13px] font-bold text-[#13364A] focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#72818C]">
              Số ngày
            </span>

            <div className="flex items-center gap-2.5">
              <StepperButton
                icon="remove"
                label="Bớt một ngày"
                disabled={days <= 1}
                onClick={() =>
                  setDays(days - 1)
                }
              />

              <span className="w-[70px] text-center text-[13px] font-bold text-[#13364A]">
                {days} ngày
              </span>

              <StepperButton
                icon="add"
                label="Thêm một ngày"
                disabled={days >= 14}
                onClick={() =>
                  setDays(days + 1)
                }
              />
            </div>
          </div>
        </SectionCard>

        {/* BẠN ĐỒNG HÀNH */}
        <SectionCard
          icon="groups"
          title="Bạn đồng hành"
          subtitle="Số lượng và kiểu nhóm du lịch"
        >
          <div className="grid grid-cols-2 gap-2">
            {COMPANION_OPTIONS.map((item) => {
              const selected = item.id === companion;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    selectCompanion(item.id)
                  }
                  aria-pressed={selected}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left ${
                    selected
                      ? 'border-[1.5px] border-[#087A78] bg-[#E2FAF5]'
                      : 'border border-[#E3E7F0] bg-[#F8F8FF]'
                  }`}
                >
                  <Icon
                    name={item.icon}
                    className={`text-[19px] ${
                      selected
                        ? 'text-[#075C66]'
                        : 'text-[#72818C]'
                    }`}
                  />

                  <span>
                    <span className="block text-[12px] font-bold text-[#13364A]">
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-[#72818C]">
                      {item.note}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#72818C]">
              Tùy chỉnh thành viên:
            </span>

            <div className="flex items-center gap-3">
              <StepperButton
                icon="remove"
                label="Bớt một người"
                disabled={members <= 1}
                onClick={() =>
                  changeMembers(-1)
                }
              />

              <span className="w-6 text-center text-[15px] font-extrabold text-[#13364A]">
                {members}
              </span>

              <StepperButton
                icon="add"
                label="Thêm một người"
                filled
                disabled={members >= 20}
                onClick={() =>
                  changeMembers(1)
                }
              />
            </div>
          </div>
        </SectionCard>

        {/* NGÂN SÁCH */}
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
                  onClick={() =>
                    touch(setBudget)(item.id)
                  }
                  aria-pressed={selected}
                  className={`flex flex-1 flex-col items-center rounded-xl py-2 ${
                    selected
                      ? 'bg-[#C3F8F0]'
                      : ''
                  }`}
                >
                  <span
                    className={`text-[12px] font-bold ${
                      selected
                        ? 'text-[#075C66]'
                        : 'text-[#13364A]'
                    }`}
                  >
                    {item.label}
                  </span>

                  <span className="text-[10px] text-[#72818C]">
                    {item.note}
                  </span>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* SỞ THÍCH TRẢI NGHIỆM */}
        <SectionCard
          icon="volunteer_activism"
          title="Sở thích trải nghiệm"
          subtitle="Tích dịch vụ bạn quan tâm, rồi chọn loại hình cụ thể (nếu muốn)"
        >
          {categoriesLoading ? (
            <p className="text-[12px] text-[#72818C]">
              Đang tải danh mục dịch vụ…
            </p>
          ) : categoriesFailed ? (
            <p className="text-[12px] text-red-600">
              Không tải được danh mục từ Backend.
              Vui lòng thử tải lại trang.
            </p>
          ) : typeGroups.length === 0 ? (
            <p className="text-[12px] text-[#72818C]">
              Hiện chưa có danh mục trải nghiệm.
            </p>
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

        {/* NHỊP ĐỘ */}
        <SectionCard
          icon="speed"
          title="Nhịp độ chuyến đi (Travel Pace)"
          subtitle="Tần suất và mật độ hoạt động"
        >
          <div
            role="radiogroup"
            aria-label="Nhịp độ chuyến đi"
            className="grid gap-2"
          >
            {PACE_OPTIONS.map((item) => {
              const selected = item.id === pace;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() =>
                    touch(setPace)(item.id)
                  }
                  className={`flex items-start rounded-2xl p-3 text-left ${
                    selected
                      ? 'border-[1.5px] border-[#087A78] bg-[#E2FAF5]'
                      : 'border border-[#E3E7F0] bg-[#F8F8FF]'
                  }`}
                >
                  <span
                    className={`mt-0.5 mr-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      selected
                        ? 'bg-[#087A78] text-white'
                        : 'border-[1.5px] border-[#C5CDD3]'
                    }`}
                  >
                    {selected && (
                      <Icon
                        name="check"
                        className="text-[14px]"
                      />
                    )}
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

      {/* NÚT LƯU KẾ HOẠCH */}
      <div className="fixed inset-x-0 bottom-[62px] z-20 bg-white px-4 pt-2.5 pb-3 md:static md:mt-4 md:rounded-[20px]">
        <p className="mb-2 flex items-center justify-center gap-1 text-[11px] text-[#72818C]">
          <Icon
            name="bolt"
            filled
            className="text-[14px] text-[#E0A100]"
          />
          AI gợi ý địa điểm; hệ thống sẽ xếp lịch sau khi bạn chọn địa điểm
        </p>

        {error && (
          <p
            role="alert"
            className="mb-2 text-center text-[12px] text-client-danger"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            void submit();
          }}
          disabled={submitting}
          className="flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-[#075C66] text-[14px] font-bold text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? 'Đang lưu kế hoạch...'
            : 'Tạo chuyến đi của tôi'}

          <Icon
            name={
              submitting
                ? 'hourglass_empty'
                : 'arrow_forward'
            }
            className="text-[18px]"
          />
        </button>
      </div>
    </div>
  );
}
