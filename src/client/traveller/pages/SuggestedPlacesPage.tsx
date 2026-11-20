
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { referenceApi } from '@/client/api/referenceApi';

import {
  tripFlowApi,
  toAiTripPlace,
  type AiRecommendationResponse,
  type PartnerPlace,
  type TravelPlanResponse,
  type TripPlace,
} from '@/client/api/tripFlowApi';

import { CLIENT_ROUTES, suggestionPath } from '@/client/routePaths';
import TravelMap, {
  type TravelMapHandle,
} from '@/client/traveller/components/TravelMap';
import PageBar from '@/client/ui/PageBar';

const FLOW_STEPS = 6;
const CURRENT_FLOW_STEP = 3;
const PAGE_SIZE = 6;

const hasCoordinate = (
  place: TripPlace,
): place is TripPlace & { latitude: number; longitude: number } =>
  typeof place.latitude === 'number' &&
  Number.isFinite(place.latitude) &&
  place.latitude >= -90 &&
  place.latitude <= 90 &&
  typeof place.longitude === 'number' &&
  Number.isFinite(place.longitude) &&
  place.longitude >= -180 &&
  place.longitude <= 180;

const priceLabel = (place: TripPlace) => {
  if (place.estimatedCost === null) return 'Chưa có giá tham khảo';
  if (place.estimatedCost === 0) return 'Miễn phí';

  return `${new Intl.NumberFormat('vi-VN').format(
    place.estimatedCost,
  )} ${place.currency ?? 'VND'}`;
};

const tripDays = (plan: TravelPlanResponse) => {
  const start = Date.parse(`${plan.startDate}T00:00:00Z`);
  const end = Date.parse(`${plan.endDate}T00:00:00Z`);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return 0;
  }

  return Math.max(
    0,
    Math.round((end - start) / 86_400_000) + 1,
  );
};

/** Màu huy hiệu độ phù hợp: ≥75 rất phù hợp, ≥55 phù hợp, còn lại có thể bạn thích. */
const matchColor = (percent: number) =>
  percent >= 75 ? 'bg-[#087A78]' : percent >= 55 ? 'bg-[#2E8B57]' : 'bg-[#6B7C89]';

function PlaceCard({
                     place,
                     index,
                     planId,
                     selected,
                     active,
                     busy,
                     onHover,
                     onToggle,
                   }: {
  place: TripPlace;
  index: number;
  planId: number;
  selected: boolean;
  active: boolean;
  busy: boolean;
  onHover: () => void;
  onToggle: () => void;
}) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div
      id={`suggestion-${place.placeId}`}
      onMouseEnter={onHover}
      className={`relative flex min-w-0 flex-col overflow-hidden rounded-[18px] border bg-white shadow-[0_3px_9px_rgba(13,69,67,0.07)] transition-shadow hover:shadow-md ${
        active
          ? 'border-[#087A78]'
          : 'border-[#E7EBEF]'
      }`}
    >
      <Link
        to={`${suggestionPath(String(place.placeId))}?planId=${planId}`}
        className="block"
        aria-label={`Xem chi tiết ${place.name}`}
      >
        <div className="relative h-[140px] overflow-hidden bg-[#DCEFEB]">
          {place.imageUrl ? (
            <img
              src={place.imageUrl}
              alt={place.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#E5F7F2] to-[#C9E5E5]">
              <Icon
                name="landscape"
                className="text-[47px] text-[#73B8AD]"
              />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

          <span className="absolute bottom-2 left-2 max-w-[90%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#075C66]">
            {place.categoryName ?? 'Địa điểm du lịch'}
          </span>

          {place.aiMatchPercent !== undefined && (
            <span
              className={`absolute right-2 top-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white shadow ${matchColor(place.aiMatchPercent)}`}
            >
              <Icon name="auto_awesome" className="text-[13px]" />
              {place.aiMatchPercent}% phù hợp
            </span>
          )}
        </div>

        <div className="px-3 pb-2 pt-3">
          <p className="line-clamp-2 min-h-9 text-[13px] font-extrabold leading-[18px] text-[#13364A]">
            {place.name}
          </p>

          <p className="mt-1 flex items-start gap-1 text-[11px] text-[#72818C]">
            <Icon
              name="location_on"
              className="shrink-0 text-[15px]"
            />

            <span className="line-clamp-2">
              {place.address ||
                place.province ||
                'Chưa có địa chỉ'}
            </span>
          </p>

          <p className="mt-2 text-[12px] font-extrabold text-[#087A78]">
            {priceLabel(place)}
          </p>

          <p className="mt-1 text-[10px] text-[#8C9AA3]">
            {place.aiRank !== undefined
              ? `${place.aiMatchLabel ?? 'Gợi ý'} · Xếp hạng #${place.aiRank}`
              : `Địa điểm đã chọn #${index + 1}`}
          </p>
        </div>
      </Link>

      {/* VÌ SAO GỢI Ý: lý do + lưu ý cho từng địa điểm */}
      {((place.aiReasons?.length ?? 0) > 0 || (place.aiCautions?.length ?? 0) > 0) && (
        <div className="px-3">
          <button
            type="button"
            onClick={() => setShowWhy((open) => !open)}
            aria-expanded={showWhy}
            className="flex w-full items-center justify-between rounded-lg bg-[#F1FAF8] px-2.5 py-1.5 text-[11px] font-bold text-[#075C66] hover:bg-[#E3F5F1]"
          >
            <span className="flex items-center gap-1">
              <Icon name="lightbulb" className="text-[15px]" />
              Vì sao gợi ý?
            </span>
            <Icon name={showWhy ? 'expand_less' : 'expand_more'} className="text-[17px]" />
          </button>

          {showWhy && (
            <ul className="mt-2 space-y-1.5 text-[11px] leading-4">
              {place.aiReasons?.map((reason) => (
                <li key={reason} className="flex items-start gap-1.5 text-[#13364A]">
                  <Icon name="check_circle" className="mt-px shrink-0 text-[14px] text-[#087A78]" />
                  <span>{reason}</span>
                </li>
              ))}
              {place.aiCautions?.map((caution) => (
                <li key={caution} className="flex items-start gap-1.5 text-amber-800">
                  <Icon name="warning" className="mt-px shrink-0 text-[14px] text-amber-600" />
                  <span>{caution}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-auto px-3 pb-3 pt-1">
        <button
          type="button"
          disabled={busy}
          onClick={onToggle}
          aria-pressed={selected}
          className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-[11px] font-extrabold transition-colors disabled:cursor-wait disabled:opacity-60 ${
            selected
              ? 'bg-[#DAF5EA] text-[#075C66] hover:bg-[#C5ECDE]'
              : 'bg-[#075C66] text-white hover:bg-[#087A78]'
          }`}
        >
          <Icon
            name={
              busy
                ? 'hourglass_empty'
                : selected
                  ? 'check_circle'
                  : 'add'
            }
            className="text-[18px]"
          />

          {busy
            ? 'Đang cập nhật...'
            : selected
              ? 'Đã chọn · Bỏ chọn'
              : 'Thêm vào kế hoạch'}
        </button>
      </div>
    </div>
  );
}

/** Thẻ gọn trong cột "Đối tác đã xác minh" (không chấm % phù hợp). */
function PartnerCard({
  place,
  planId,
  selected,
  busy,
  onToggle,
}: {
  place: PartnerPlace;
  planId: number;
  selected: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-[#E7EBEF] bg-white p-2.5 shadow-[0_3px_9px_rgba(13,69,67,0.06)]">
      <Link
        to={`${suggestionPath(String(place.placeId))}?planId=${planId}`}
        className="flex min-w-0 gap-2.5"
        aria-label={`Xem chi tiết ${place.name}`}
      >
        <div className="h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-[#DCEFEB]">
          {place.coverUrl ? (
            <img src={place.coverUrl} alt={place.name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Icon name="storefront" className="text-[28px] text-[#73B8AD]" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] font-extrabold leading-4.25 text-[#13364A]">
            {place.name}
          </p>
          {place.verified && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#E8F1FF] px-2 py-0.5 text-[10px] font-bold text-[#1F5FBF]">
              <Icon name="verified" filled className="text-[13px]" />
              Đối tác đã xác minh
            </span>
          )}
          <p className="mt-1 truncate text-[11px] text-[#72818C]">
            {[place.categoryName, place.businessName].filter(Boolean).join(' · ')}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#72818C]">
            <Icon name="star" filled className="text-[13px] text-[#E0A100]" />
            {place.rating !== null
              ? `${place.rating} (${place.reviewCount} đánh giá)`
              : 'Chưa có đánh giá'}
          </p>
        </div>
      </Link>

      {place.address && (
        <p className="mt-2 flex items-start gap-1 text-[11px] text-[#72818C]">
          <Icon name="location_on" className="shrink-0 text-[14px]" />
          <span className="line-clamp-1">{place.address}</span>
        </p>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={onToggle}
        aria-pressed={selected}
        className={`mt-2 flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-[11px] font-extrabold transition-colors disabled:cursor-wait disabled:opacity-60 ${
          selected
            ? 'bg-[#DAF5EA] text-[#075C66] hover:bg-[#C5ECDE]'
            : 'bg-[#075C66] text-white hover:bg-[#087A78]'
        }`}
      >
        <Icon name={selected ? 'check_circle' : 'add'} className="text-[17px]" />
        {selected ? 'Đã chọn · Bỏ chọn' : 'Thêm vào kế hoạch'}
      </button>
    </div>
  );
}

/**
 * Danh sách địa điểm thật từ Backend.
 * Hiện lấy từ catalogue, chưa phải AI Embedding.
 */
export default function SuggestedPlacesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const planId = Number(searchParams.get('planId') ?? '');
  const validPlanId =
    Number.isSafeInteger(planId) &&
    planId > 0;

  const mapRef = useRef<TravelMapHandle>(null);
const listRef = useRef<HTMLDivElement>(null);
  const [plan, setPlan] =
    useState<TravelPlanResponse | null>(null);

  const [places, setPlaces] =
    useState<TripPlace[]>([]);
    
const [aiSummary, setAiSummary] =
  useState<AiRecommendationResponse | null>(null);


  const [selectedIds, setSelectedIds] =
    useState<Set<number>>(new Set());

  // Cột riêng: địa điểm do đối tác đã xác minh đăng ký tại điểm đến.
  const [partners, setPartners] = useState<PartnerPlace[]>([]);

  const [category, setCategory] = useState('all');
const [page, setPage] = useState(1);
  const [activeId, setActiveId] =
    useState<string | null>(null);

  const [busyPlaceId, setBusyPlaceId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  // ==========================================
  // LẤY KẾ HOẠCH, ĐỊA ĐIỂM VÀ GIỎ TỪ BACKEND
  // ==========================================

  
useEffect(() => {
  if (!validPlanId) {
    setError(
      'Không có planId hợp lệ. Hãy tạo kế hoạch trước.',
    );
    setLoading(false);
    return;
  }

  let active = true;

  setLoading(true);
  setError(null);
  setActionError(null);
  setPlan(null);
  setPlaces([]);
  setAiSummary(null);
  setSelectedIds(new Set());
  setPage(1);

  // Lấy kết quả AI từ trang Generating nếu có.
  const navigationState = location.state as {
    recommendation?: AiRecommendationResponse;
  } | null;

  const preloaded =
    retryCount === 0 &&
    navigationState?.recommendation?.planId === planId &&
    Array.isArray(navigationState.recommendation.items)
      ? navigationState.recommendation
      : null;

  Promise.all([
    // Travel Plan đã lưu.
    tripFlowApi.plan(planId),

    // Dùng kết quả AI có sẵn, hoặc gọi API nếu refresh trang.
    preloaded
      ? Promise.resolve(preloaded)
      : tripFlowApi.recommendedPlaces(planId),

    // Những địa điểm đã chọn trước đó.
    tripFlowApi.selectedPlaces(planId),

    // Lấy tên danh mục để hiển thị bằng tiếng Việt.
    referenceApi.categories().catch(() => []),
  ])
    .then(([savedPlan, recommended, selected, groups]) => {
      if (!active) return;

      const categoryNames = new Map(
        groups
          .flatMap((group) => [group, ...group.subtypes])
          .map(
            (category) =>
              [category.code, category.name] as const,
          ),
      );

      // Chuyển dữ liệu AI về cấu trúc card Web đang dùng.
      const aiPlaces = recommended.items.map((item) => ({
        ...toAiTripPlace(item, savedPlan.destination),
        categoryName:
          categoryNames.get(item.categoryCode ?? '') ??
          item.categoryCode,
      }));

      // Giữ các Place đã chọn để người dùng có thể bỏ chọn.
      const aiIds = new Set(
        aiPlaces.map((item) => item.placeId),
      );

      const alreadySelected = selected.places.filter(
        (item) => !aiIds.has(item.placeId),
      );

      setPlan(savedPlan);
      setAiSummary(recommended);

      setPlaces([
        ...aiPlaces,
        ...alreadySelected,
      ]);

      setSelectedIds(
        new Set(
          selected.places.map((item) => item.placeId),
        ),
      );
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
}, [
  planId,
  validPlanId,
  retryCount,
  location.key,
  location.state,
]);


  // Tải cột đối tác riêng; lỗi thì chỉ ẩn cột, không chặn danh sách gợi ý.
  useEffect(() => {
    if (!validPlanId) return;
    let active = true;
    tripFlowApi
      .partnerPlaces(planId)
      .then((items) => {
        if (active) setPartners(items);
      })
      .catch(() => {
        if (active) setPartners([]);
      });
    return () => {
      active = false;
    };
  }, [planId, validPlanId, retryCount]);

  // ==========================================
  // LỌC ĐỊA ĐIỂM THEO CATEGORY TỪ BACKEND
  // ==========================================

  const categories = useMemo(() => {
    const grouped = new Map<
      string,
      { label: string; count: number }
    >();

    for (const place of places) {
      const key =
        place.categoryCode ?? 'uncategorized';

      const previous = grouped.get(key);

      grouped.set(key, {
        label: place.categoryName ?? 'Khác',
        count: (previous?.count ?? 0) + 1,
      });
    }

    return [
      {
        id: 'all',
        label: 'Tất cả',
        count: places.length,
      },
      ...Array.from(grouped, ([id, value]) => ({
        id,
        ...value,
      })),
    ];
  }, [places]);

  const visiblePlaces = useMemo(
    () =>
      category === 'all'
        ? places
        : places.filter(
          (place) =>
            (place.categoryCode ?? 'uncategorized') ===
            category,
        ),
    [places, category],
  );
  
  // PHÂN TRANG SAU KHI LỌC DANH MỤC
  const totalPages = Math.max(
    1,
    Math.ceil(visiblePlaces.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const pagePlaces = useMemo(
    () =>
      visiblePlaces.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [visiblePlaces, currentPage],
  );

  const changePage = (nextPage: number) => {
    setPage(
      Math.max(1, Math.min(nextPage, totalPages)),
    );

    setActiveId(null);

    listRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };


  // ==========================================
  // HIỂN THỊ BẢN ĐỒ THEO TỌA ĐỘ THẬT
  // ==========================================

 const mapPlaces = useMemo(
  () => pagePlaces.filter(hasCoordinate),
  [pagePlaces],
);

  const mapPoints = useMemo(
    () =>
      mapPlaces.map((place, index) => ({
        id: String(place.placeId),

        coordinate: [
          place.latitude,
          place.longitude,
        ] as [number, number],

       label: String(
  place.aiRank ??
    (currentPage - 1) * PAGE_SIZE + index + 1,
),
        title: place.name,
      })),
    [mapPlaces, currentPage],
  );

  const currentActive =
    activeId ?? mapPoints[0]?.id ?? null;

  const focusPlace = (place: TripPlace) => {
    setActiveId(String(place.placeId));

    if (hasCoordinate(place)) {
      mapRef.current?.focus(
        [place.latitude, place.longitude],
        14,
      );
    }
  };

  const selectMarker = (id: string) => {
    const found = pagePlaces.find(
      (place) =>
        String(place.placeId) === id,
    );

    if (!found) return;

    focusPlace(found);

    document
      .getElementById(`suggestion-${id}`)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
  };

  // ==========================================
  // THÊM / XÓA ĐỊA ĐIỂM KHỎI GIỎ
  // ==========================================

  const togglePlace = async (place: Pick<TripPlace, 'placeId'>) => {
    if (!validPlanId || busyPlaceId !== null) {
      return;
    }

    const wasSelected =
      selectedIds.has(place.placeId);

    setBusyPlaceId(place.placeId);
    setActionError(null);

    try {
      if (wasSelected) {
        await tripFlowApi.removePlace(
          planId,
          place.placeId,
        );
      } else {
        await tripFlowApi.addPlace(
          planId,
          place.placeId,
        );
      }

      // Chỉ cập nhật giao diện sau khi Backend thành công.
      setSelectedIds((current) => {
        const next = new Set(current);

        if (wasSelected) {
          next.delete(place.placeId);
        } else {
          next.add(place.placeId);
        }

        return next;
      });
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setBusyPlaceId(null);
    }
  };

  const selectedUrl =
    `${CLIENT_ROUTES.TRIP_PLAN_SELECTED}?planId=${planId}`;

  return (
    <div className="pb-24 md:pb-4">
      {/* THANH TIÊU ĐỀ */}
      <PageBar
        title="Địa điểm dành cho chuyến đi"
        subtitle={
          plan
            ? `${plan.destination} • ${tripDays(plan)} ngày • ${plan.groupSize} người`
            : undefined
        }
        backTo={CLIENT_ROUTES.TRIPS}
        actions={
          <Link
            to={
              validPlanId
                ? selectedUrl
                : CLIENT_ROUTES.TRIP_PLAN
            }
            className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[12px] font-bold text-[#075C66]"
          >
            <Icon
              name="shopping_basket"
              className="text-[18px]"
            />

            <span className="hidden sm:inline">
              Đã chọn
            </span>

            ({selectedIds.size})
          </Link>
        }
      />

      {/* THANH TIẾN TRÌNH */}
      <div className="mb-3 flex gap-1.5">
        {Array.from(
          { length: FLOW_STEPS },
          (_, index) => (
            <span
              key={index}
              className={`h-[5px] flex-1 rounded-full ${
                index < CURRENT_FLOW_STEP
                  ? 'bg-[#075C66]'
                  : 'bg-[#E3E8EF]'
              }`}
            />
          ),
        )}
      </div>

      {/* TRẠNG THÁI ĐANG TẢI */}
      {loading && (
        <div
          role="status"
          className="rounded-2xl bg-white p-8 text-center text-sm text-[#087A78]"
        >
          Đang tải kế hoạch và các địa điểm ...
        </div>
      )}

      {/* THÔNG BÁO LỖI */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700"
        >
          <p>{error}</p>

          <div className="mt-4 flex gap-3">
            {validPlanId && (
              <button
                type="button"
                onClick={() =>
                  setRetryCount((count) => count + 1)
                }
                className="rounded-full bg-white px-4 py-2 font-bold text-[#075C66]"
              >
                Thử lại
              </button>
            )}

            <Link
              to={CLIENT_ROUTES.TRIP_PLAN}
              className="rounded-full bg-white px-4 py-2 font-bold text-[#075C66]"
            >
              Tạo kế hoạch
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && plan && (
        <>
          {/* THÔNG TIN NGUỒN ĐỊA ĐIỂM */}
          <div className="mb-3 rounded-2xl border border-[#DDEDE7] bg-[#F4FBF8] p-3">
            <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#13364A]">
              <Icon
                name="travel_explore"
                className="text-[18px] text-[#075C66]"
              />

             Địa điểm  gợi ý cho chuyến đi
            </p>

            
<p className="mt-1 text-[11px] leading-5 text-[#72818C]">
  {aiSummary?.degraded
    ? 'SmartTravel tạm thời không khả dụng; hệ thống dùng loại hình và ngân sách để xếp hạng.'
    : 'Địa điểm được xếp hạng theo Embedding, sở thích, ngân sách và MMR.'}

  {' '}Bạn có thể thêm hoặc bỏ địa điểm.

  {aiSummary && (
    <span className="mt-1 block font-semibold">
      Cần khoảng {aiSummary.needed} điểm ·
      Có {aiSummary.available} ứng viên ·
      SmartTravel gợi ý {aiSummary.items.length} địa điểm
    </span>
  )}
</p>

          </div>

{aiSummary && aiSummary.warnings.length > 0 && (
  <div
    role="status"
    className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800"
  >
    {aiSummary.warnings.map((warning, index) => (
      <p key={index}>{warning}</p>
    ))}
  </div>
)}

          {actionError && (
            <div
              role="alert"
              className="mb-3 rounded-xl border border-red-100 bg-red-50 p-3 text-[12px] text-red-700"
            >
              {actionError}
            </div>
          )}

          {/*
            Có đối tác: bản đồ | cột đối tác | danh sách gợi ý (màn rộng).
            Màn vừa (lg): cột trái = bản đồ + đối tác, cột phải = danh sách gợi ý.
          */}
          <div
            className={`lg:grid lg:gap-5 ${
              partners.length > 0
                ? 'lg:grid-cols-[1fr_1.15fr] lg:grid-rows-[auto_1fr] xl:grid-cols-[minmax(0,1fr)_300px_minmax(0,1.35fr)] xl:grid-rows-1'
                : 'lg:grid-cols-[1fr_1.15fr]'
            }`}
          >
            {/* BẢN ĐỒ */}
            <div className="lg:sticky lg:top-20 lg:col-start-1 lg:row-start-1 lg:self-start">

              <div className="relative isolate overflow-hidden rounded-[20px] bg-[#E0EEE9]">
                <TravelMap
                  ref={mapRef}
                  className="h-[225px] lg:h-[480px]"
                  points={mapPoints}
                  activeId={currentActive}
                  onSelect={selectMarker}
                />

                <span className="pointer-events-none absolute left-3 top-3 z-[400] rounded-full bg-white px-3 py-2 text-[11px] font-bold text-[#075C66] shadow">
                  {mapPoints.length} địa điểm có tọa độ
                </span>

                {mapPoints.length === 0 && (
                  <span className="pointer-events-none absolute bottom-3 left-3 right-3 z-[400] rounded-xl bg-white/90 px-3 py-2 text-center text-[11px] text-[#72818C]">
                    Danh sách này chưa có địa điểm với
                    tọa độ hợp lệ.
                  </span>
                )}
              </div>
            </div>

            {/* CỘT ĐỐI TÁC ĐÃ XÁC MINH: luôn hiện các đối tác của tỉnh đến, không phụ thuộc % phù hợp */}
            {partners.length > 0 && (
              <aside className="mt-4 lg:col-start-1 lg:row-start-2 lg:mt-0 lg:self-start xl:sticky xl:top-20 xl:col-start-2 xl:row-start-1">
                <div className="rounded-[20px] border border-[#DCE7F7] bg-[#F7FAFF] p-3">
                  <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#13364A]">
                    <Icon name="verified" filled className="text-[18px] text-[#1F5FBF]" />
                    Đối tác tại {plan.destination}
                    <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#1F5FBF]">
                      {partners.length}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-[#72818C]">
                    Địa điểm do doanh nghiệp đã được xác minh đăng ký. Không tính vào % phù hợp.
                  </p>

                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:max-h-[calc(100dvh-160px)] xl:overflow-y-auto">
                    {partners.map((partner) => (
                      <PartnerCard
                        key={partner.placeId}
                        place={partner}
                        planId={planId}
                        selected={selectedIds.has(partner.placeId)}
                        busy={busyPlaceId !== null}
                        onToggle={() => {
                          void togglePlace(partner);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </aside>
            )}

            {/* DANH SÁCH ĐỊA ĐIỂM */}
{/* min-w-0: hàng nút lọc dài không được kéo cột này phình ra và ép nhỏ bản đồ */}
<div
  ref={listRef}
  className={`min-w-0 scroll-mt-24 ${
    partners.length > 0
      ? 'lg:col-start-2 lg:row-span-2 lg:row-start-1 xl:col-start-3 xl:row-span-1'
      : ''
  }`}
>
              {/* LỌC CATEGORY */}
              <div className="sticky top-16 z-10 -mx-4 mt-3 bg-client-bg px-4 py-3 lg:mt-0 lg:pt-0">
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                     onClick={() => {
  setCategory(item.id);
  setPage(1);
  setActiveId(null);
}}
                      aria-pressed={item.id === category}
                      className={`shrink-0 rounded-full px-4 py-2.5 text-[12px] font-semibold ${
                        item.id === category
                          ? 'bg-[#075C66] text-white'
                          : 'bg-[#EBEDFF] text-[#13364A]'
                      }`}
                    >
                      {item.label} ({item.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* CHƯA CÓ ĐỊA ĐIỂM */}
              {visiblePlaces.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl bg-white px-4 py-10 text-center">
                  <Icon
                    name="travel_explore"
                    className="text-[35px] text-[#94B5B6]"
                  />

                  <p className="mt-2 text-[13px] font-bold text-[#13364A]">
                    Chưa có địa điểm phù hợp
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[#72818C]">
                  SmartTravel chưa tìm thấy địa điểm phù hợp với kế hoạch này.
                    khớp điểm đến và danh mục đã chọn.
                    Bạn vẫn có thể mở danh sách địa điểm
                    đã chọn ở nút bên trên.
                  </p>
                </div>
              ) : (
                <div
                  className={`grid grid-cols-2 gap-2.5 ${
                    partners.length > 0 ? 'min-[1700px]:grid-cols-3' : 'xl:grid-cols-3'
                  }`}
                >
                 {pagePlaces.map((place, index) => (
                    <PlaceCard
                      key={place.placeId}
                      place={place}
                      index={(currentPage - 1) * PAGE_SIZE + index}
                      planId={planId}
                      selected={selectedIds.has(
                        place.placeId,
                      )}
                      active={
                        String(place.placeId) ===
                        currentActive
                      }
                      busy={busyPlaceId !== null}
                      onHover={() => focusPlace(place)}
                      onToggle={() => {
                        void togglePlace(place);
                      }}
                    />
                  ))}
                </div>
              )}
              
              {totalPages > 1 && (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white p-3 shadow-sm">

                  <span className="w-full text-center text-xs text-[#72818C]">
                    Hiển thị{' '}
                    {(currentPage - 1) * PAGE_SIZE + 1}
                    –
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      visiblePlaces.length,
                    )}
                    {' / '}
                    {visiblePlaces.length} địa điểm
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      changePage(currentPage - 1)
                    }
                    className="rounded-lg border px-3 py-2 text-xs font-semibold text-[#075C66] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Trước
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((number) => (
                    <button
                      key={number}
                      type="button"
                      onClick={() => changePage(number)}
                      aria-current={
                        number === currentPage
                          ? 'page'
                          : undefined
                      }
                      className={`h-9 w-9 rounded-lg text-xs font-bold ${
                        number === currentPage
                          ? 'bg-[#075C66] text-white'
                          : 'bg-[#F1F5F5] text-[#075C66] hover:bg-[#DCEFEB]'
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      changePage(currentPage + 1)
                    }
                    className="rounded-lg border px-3 py-2 text-xs font-semibold text-[#075C66] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sau
                  </button>

                </div>
              )}

            </div>

          </div>

          {/* NÚT ĐẾN GIỎ ĐỊA ĐIỂM */}
          <div className="fixed inset-x-0 bottom-[62px] z-20 border-t border-[#EEF1F5] bg-white px-4 pb-2.5 pt-2.5 md:static md:mt-4 md:flex md:justify-end md:rounded-[20px] md:border-0">
            <button
              type="button"
              onClick={() =>
                navigate(selectedUrl)
              }
              disabled={
                selectedIds.size === 0 ||
                busyPlaceId !== null
              }
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#075C66] px-8 text-[14px] font-bold text-white hover:bg-primary disabled:bg-[#E3E8EF] disabled:text-[#72818C] md:w-auto md:min-w-[320px]"
            >
              <Icon
                name="shopping_basket"
                className="text-[19px]"
              />

              {selectedIds.size > 0
                ? `Xem ${selectedIds.size} địa điểm đã chọn`
                : 'Chọn địa điểm để tiếp tục'}

              <Icon
                name="arrow_forward"
                className="text-[18px]"
              />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
