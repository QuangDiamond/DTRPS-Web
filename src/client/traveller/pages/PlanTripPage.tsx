import { type ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { referenceApi } from '@/client/api/referenceApi';
import { tripFlowApi, type TravelPace } from '@/client/api/tripFlowApi';
import type { CategoryGroup, ReferenceItem, TravelPreferences } from '@/client/api/types';
import { userApi } from '@/client/api/userApi';
import { CLIENT_ROUTES } from '@/client/routePaths';
import {
  COMPANION_OPTIONS,
  type CompanionId,
  EXPERIENCE_QUESTIONS,
  EXPERIENCE_TO_CATEGORIES,
  PACE_OPTIONS,
  type PaceId,
  typesToInterests,
} from '@/client/traveller/data/planTrip';
import { useTraveller } from '@/client/traveller/travellerContext';
import PageBar from '@/client/ui/PageBar';

const MAX_BUDGET = 1_000_000_000;
const DEFAULT_BUDGET = 10_000_000;
const BUDGET_STEP = 1_000_000;
const moneyFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

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
const formatMoney = (value: number) => `${moneyFormatter.format(value)} ₫`;

function initialCategories(
  groups: CategoryGroup[],
  preferences: TravelPreferences | null,
): string[] {
  if (!preferences) return [];

  // Sở thích (UC-006) đã lưu thẳng mã loại hình địa điểm — dùng trực tiếp, không cần suy ra.
  const validTypes = new Set(
    groups.flatMap((group) => group.subtypes.map((subtype) => subtype.code)),
  );
  return [
    ...new Set(
      preferences.interests.filter((code) => validTypes.has(code)),
    ),
  ];
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

/** Tạo Travel Plan từ dữ liệu thật. AI chỉ đề xuất, Backend xếp lịch sau khi chọn địa điểm. */
export default function PlanTripPage() {
  const navigate = useNavigate();
  const { startPlan } = useTraveller();

  const [provinces, setProvinces] = useState<ReferenceItem[]>([]);
  const [provincesFailed, setProvincesFailed] = useState(false);
  const [destinationId, setDestinationId] = useState('');
  const [startDate, setStartDate] = useState(() => addDays(new Date(), 7));
  const [days, setDays] = useState(4);
  const [companion, setCompanion] = useState<CompanionId>('couple');
  const [members, setMembers] = useState(2);

  // Ngân sách TỔNG CHO CHUYẾN ĐI, không tự nhân theo số người.
  const [budgetInput, setBudgetInput] = useState(String(DEFAULT_BUDGET));
  const budget = Math.min(MAX_BUDGET, Math.max(0, Number(budgetInput) || 0));

  const [typeGroups, setTypeGroups] = useState<CategoryGroup[]>([]);
  const [savedCategoryCodes, setSavedCategoryCodes] = useState<string[]>([]);
  // Đã thiết lập ở Sở thích du lịch (UC-006) — không hỏi lại ở đây.
  const [savedExperiencePreferences, setSavedExperiencePreferences] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesFailed, setCategoriesFailed] = useState(false);
  const [pace, setPace] = useState<PaceId>('balanced');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      referenceApi.categories(),
      userApi.preferences(),
    ]).then(
      ([groupsResult, preferencesResult]) => {
        if (!active) return;

        setCategoriesLoading(false);
        if (groupsResult.status === 'rejected') {
          setCategoriesFailed(true);
          return;
        }

        const groups = groupsResult.value;
        setTypeGroups(groups);

        if (preferencesResult.status !== 'fulfilled') return;
        const preferences = preferencesResult.value;
        setSavedCategoryCodes(initialCategories(groups, preferences));
        setSavedExperiencePreferences(preferences.experiencePreferences);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const destination = provinces.find((item) => item.code === destinationId);
  const endDate = addDays(startDate, days - 1);
  const minDate = toInputDate(new Date());
  const experienceSet = new Set(savedExperiencePreferences);
  const selectedExperienceOptions = EXPERIENCE_QUESTIONS.flatMap((question) =>
    [...question.options],
  ).filter((option) => experienceSet.has(option.code));

  const setBudgetValue = (value: string) => {
    // Chỉ nhận chữ số; giới hạn cả nhập tay lẫn kéo ở 1 tỷ.
    const digits = value.replace(/\D/g, '');
    setBudgetInput(
      digits === '' ? '' : String(Math.min(MAX_BUDGET, Number(digits))),
    );
    setError(null);
  };

  const selectCompanion = (id: CompanionId) => {
    setCompanion(id);
    setMembers(COMPANION_OPTIONS.find((item) => item.id === id)!.defaultCount);
  };

  const changeMembers = (delta: number) => {
    const next = Math.min(20, Math.max(1, members + delta));
    setMembers(next);
    if (next === 1) setCompanion('solo');
    else if (companion === 'solo') setCompanion(next === 2 ? 'couple' : 'friends');
  };

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
    if (budget <= 0 || budget > MAX_BUDGET) {
      setError('Ngân sách phải lớn hơn 0 và không vượt quá 1 tỷ đồng.');
      return;
    }
    if (categoriesLoading || categoriesFailed || typeGroups.length === 0) {
      setError('Không tải được danh mục trải nghiệm.');
      return;
    }

    // Khi có lựa chọn hoạt động cụ thể (câu 3, đã trả lời ở Sở thích du lịch), dùng mã tương ứng.
    // Nếu chưa trả lời, giữ sở thích danh mục đã lưu trong hồ sơ.
    const hasActivityChoice = savedExperiencePreferences.some((code) =>
      code.startsWith('EXPERIENCE_'),
    );
    const compatibleCodes = new Set(
      hasActivityChoice
        ? savedExperiencePreferences.flatMap((code) => EXPERIENCE_TO_CATEGORIES[code] ?? [])
        : savedCategoryCodes,
    );
    const categoryCodes = [...new Set(typeGroups.flatMap((group) =>
      group.subtypes.filter((subtype) => compatibleCodes.has(subtype.code)).map((subtype) => subtype.code),
    ))].slice(0, 50);
    const categorySet = new Set(categoryCodes);

    setSubmitting(true);
    try {
      const companionLabel = COMPANION_OPTIONS.find((item) => item.id === companion)?.label;
      const saved = await tripFlowApi.createPlan({
        title: `Du lịch ${destination.name} ${days} ngày`,
        destination: destination.name,
        startDate: toInputDate(startDate),
        endDate: toInputDate(endDate),
        budget, // Tổng ngân sách chính xác người dùng đã nhập.
        currency: 'VND',
        groupSize: members,
        description: companionLabel ? `Hình thức đồng hành: ${companionLabel}` : null,
        categoryCodes,
        experiencePreferences: savedExperiencePreferences,
        travelPace: PACE_TO_API[pace],
      });

      // Giữ tương thích với state cũ ở các màn khác.
      const groupCodes = typeGroups
        .filter((group) => group.subtypes.some((subtype) => categorySet.has(subtype.code)))
        .map((group) => group.code);
      const interests = typesToInterests(typeGroups, groupCodes, categoryCodes);
      startPlan({
        destinationId,
        destinationName: destination.name,
        days,
        members,
        interests,
      });

      navigate(`${CLIENT_ROUTES.TRIP_GENERATING}?planId=${saved.planId}`);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-36 md:pb-4">
      <PageBar title="Lập kế hoạch chuyến đi" backTo={CLIENT_ROUTES.TRIPS} />

      <span className="inline-flex items-center gap-1 rounded-full bg-[#C3F8F0] px-2.5 py-1 text-[10px] font-bold text-[#075C66]">
        <Icon name="auto_awesome" className="text-[12px]" />
        Smart Travel
      </span>
      <h2 className="mt-2 text-[20px] font-extrabold text-[#13364A] md:text-[24px]">
        Tạo lịch trình du lịch cá nhân hóa
      </h2>
      <p className="mt-1 text-[12px] text-[#72818C]">
        Chọn điểm đến, ngân sách và sở thích để bắt đầu hành trình.
      </p>

      <div className="mt-4 grid gap-3.5 md:grid-cols-2">
        {/* ĐIỂM ĐẾN */}
        <SectionCard
          icon="location_on"
          title="Điểm đến mơ ước"
          subtitle="Chọn tỉnh/thành du lịch"
        >
          <div className="relative">
            <Icon
              name="near_me"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#087A78]"
            />
            <select
              value={destinationId}
              onChange={(event) => setDestinationId(event.target.value)}
              aria-label="Điểm đến"
              className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-[#E3E7F0] bg-[#F8F8FF] pl-10 pr-10 text-[14px] font-bold text-[#13364A] focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="" disabled>
                {provincesFailed
                  ? 'Không tải được danh sách tỉnh/thành'
                  : 'Chọn tỉnh/thành'}
              </option>
              {provinces.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[22px] text-[#72818C]"
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
              className="rounded-xl bg-[#F8F8FF] px-3 py-1.5 text-[13px] font-bold text-[#13364A] focus:outline-none focus:ring-2 focus:ring-primary/30"
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

        {/* BẠN ĐỒNG HÀNH */}
        <SectionCard icon="groups" title="Bạn đồng hành" subtitle="Số lượng và kiểu nhóm du lịch">
          <div className="grid grid-cols-2 gap-2">
            {COMPANION_OPTIONS.map((item) => {
              const active = item.id === companion;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectCompanion(item.id)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left ${
                    active
                      ? 'border-[1.5px] border-[#087A78] bg-[#E2FAF5]'
                      : 'border border-[#E3E7F0] bg-[#F8F8FF]'
                  }`}
                >
                  <Icon
                    name={item.icon}
                    className={`text-[19px] ${active ? 'text-[#075C66]' : 'text-[#72818C]'}`}
                  />
                  <span>
                    <span className="block text-[12px] font-bold text-[#13364A]">
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-[#72818C]">{item.note}</span>
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

        {/* NGÂN SÁCH: NHẬP TAY + KÉO TỐI ĐA 1 TỶ */}
        <SectionCard
          icon="account_balance_wallet"
          title="Ngân sách dự kiến"
          subtitle="Tổng ngân sách cho cả chuyến đi"
        >
          <label htmlFor="trip-budget" className="mb-1.5 block text-[12px] font-semibold text-[#506581]">
            Nhập ngân sách (VND)
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-[#C9E4DD] bg-[#F7FCFA] px-3 py-2 focus-within:ring-2 focus-within:ring-[#087A78]/20">
            <Icon name="payments" className="text-[21px] text-[#087A78]" />
            <input
              id="trip-budget"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={budgetInput}
              onChange={(event) => setBudgetValue(event.target.value)}
              placeholder="Ví dụ: 10000000"
              aria-describedby="trip-budget-description"
              className="h-9 min-w-0 flex-1 bg-transparent text-[17px] font-extrabold text-[#13364A] outline-none"
            />
            <span className="text-[12px] font-bold text-[#087A78]">VND</span>
          </div>
          <p id="trip-budget-description" className="mt-1.5 text-[12px] font-bold text-[#087A78]">
            {formatMoney(budget)}
          </p>

          <div className="mt-4 flex items-center justify-between gap-2">
            <label htmlFor="trip-budget-slider" className="text-[12px] font-semibold text-[#506581]">
              Hoặc kéo để chọn
            </label>
            <span className="text-[11px] text-[#72818C]">Tối đa 1 tỷ</span>
          </div>
          <input
            id="trip-budget-slider"
            type="range"
            min={0}
            max={MAX_BUDGET}
            step={BUDGET_STEP}
            value={budget}
            onChange={(event) => setBudgetValue(event.target.value)}
            className="mt-3 w-full cursor-pointer accent-[#087A78]"
            aria-label="Kéo chọn tổng ngân sách chuyến đi"
          />
          <div className="flex justify-between text-[10px] font-medium text-[#72818C]">
            <span>0 đ</span>
            <span>500 triệu</span>
            <span>1 tỷ</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[5_000_000, 10_000_000, 30_000_000, 50_000_000, 100_000_000].map(
              (amount) => (
                <button
                  key={amount}
                  type="button"
                  aria-pressed={budget === amount}
                  onClick={() => setBudgetValue(String(amount))}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                    budget === amount
                      ? 'border-[#087A78] bg-[#E2FAF5] text-[#075C66]'
                      : 'border-[#E3E7F0] bg-white text-[#506581] hover:border-[#087A78]'
                  }`}
                >
                  {moneyFormatter.format(amount / 1_000_000)} triệu
                </button>
              ),
            )}
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[#72818C]">
            Đây là ngân sách của <strong>toàn bộ {members} người</strong>, không phải giá trên mỗi người.
            Số tiền nhập sẽ được lưu trực tiếp vào kế hoạch.
          </p>
        </SectionCard>

        {/* CÁ NHÂN HÓA: đã thiết lập ở Sở thích du lịch, chỉ hiện tóm tắt + đường dẫn chỉnh sửa. */}
        <div className="min-w-0 md:col-span-2">
          <SectionCard
            icon="auto_awesome"
            title="Cá nhân hóa chuyến đi của bạn"
            subtitle="Dựa trên sở thích bạn đã thiết lập — dùng cho mọi chuyến đi mới."
            right={
              <Link
                to={CLIENT_ROUTES.PREFERENCES}
                className="ml-2 shrink-0 rounded-full bg-[#E2FAF5] px-2.5 py-1 text-[11px] font-bold text-[#075C66]"
              >
                Chỉnh sửa
              </Link>
            }
          >
            {selectedExperienceOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedExperienceOptions.map((option) => (
                  <span
                    key={option.code}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#C9E7DF] bg-[#F0F9F6] px-2.5 py-1.5 text-[11px] font-semibold text-[#075C66]"
                  >
                    {option.emoji} {option.label}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#F8F8FF] p-3.5">
                <p className="text-[12px] text-[#617580]">
                  Bạn chưa thiết lập sở thích cá nhân hóa. Thiết lập ngay để Smart Travel gợi ý đúng
                  gu của bạn hơn.
                </p>
                <Link
                  to={CLIENT_ROUTES.PREFERENCES}
                  className="shrink-0 rounded-full bg-[#075C66] px-4 py-2 text-[12px] font-bold text-white"
                >
                  Thiết lập ngay
                </Link>
              </div>
            )}
            {(categoriesLoading || categoriesFailed || typeGroups.length === 0) && (
              <p role="status" className="mt-2 rounded-xl bg-[#F8F8FF] p-3 text-[12px] text-[#617580]">
                {categoriesLoading
                  ? 'Đang tải dữ liệu hỗ trợ...'
                  : 'Không tải được danh mục hỗ trợ. Vui lòng tải lại trang trước khi tạo kế hoạch.'}
              </p>
            )}
          </SectionCard>
        </div>

        {/* NHỊP ĐỘ CHUYẾN ĐI */}
        <div className="md:col-span-2">
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
                    onClick={() => setPace(item.id)}
                    className={`flex items-start rounded-2xl p-3 text-left ${
                      selected
                        ? 'border-[1.5px] border-[#087A78] bg-[#E2FAF5]'
                        : 'border border-[#E3E7F0] bg-[#F8F8FF]'
                    }`}
                  >
                  <span
                    className={`mr-2.5 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
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
      </div>

      <div className="fixed inset-x-0 bottom-[62px] z-20 bg-white px-4 pb-3 pt-2.5 md:static md:mt-4 md:rounded-[20px]">
        <p className="mb-2 flex items-center justify-center gap-1 text-[11px] text-[#72818C]">
          <Icon name="bolt" filled className="text-[14px] text-[#E0A100]" />
          AI đề xuất địa điểm; hệ thống xếp lịch sau khi bạn chọn địa điểm
        </p>
        {error && (
          <p role="alert" className="mb-2 text-center text-[12px] text-client-danger">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => void submit()}
          disabled={submitting || categoriesLoading}
          className="flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-[#075C66] text-[14px] font-bold text-white hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Đang lưu kế hoạch...' : 'Tạo chuyến đi của tôi'}
          <Icon
            name={submitting ? 'hourglass_empty' : 'arrow_forward'}
            className="text-[18px]"
          />
        </button>
      </div>
    </div>
  );
}

