
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import {
  tripFlowApi,
  type TravelPlanResponse,
  type TripPlace,
} from '@/client/api/tripFlowApi';
import { CLIENT_ROUTES, suggestionPath } from '@/client/routePaths';
import { ConfirmDialog } from '@/client/ui/Overlay';
import PageBar from '@/client/ui/PageBar';

const numberFormat = new Intl.NumberFormat('vi-VN');

function tripDayCount(startDate: string, endDate: string): number {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return 0;
  }

  return Math.max(
    0,
    Math.round((end - start) / 86_400_000) + 1,
  );
}

function placeCost(place: TripPlace): string {
  if (place.estimatedCost === null) {
    return 'Chưa có giá tham khảo';
  }

  if (place.estimatedCost === 0) {
    return 'Miễn phí';
  }

  return `${numberFormat.format(place.estimatedCost)} ${
    place.currency ?? 'VND'
  }`;
}

function InfoChip({
                    icon,
                    title,
                  }: {
  icon: string;
  title: string;
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-[#EBEDFF] px-3 py-2 text-[11px] font-semibold text-[#506581]">
      <Icon
        name={icon}
        className="text-[16px] text-[#42647E]"
      />
      {title}
    </span>
  );
}

/**
 * BƯỚC 4:
 * Quản lý danh sách địa điểm đã chọn từ plan_places.
 *
 * BƯỚC 5:
 * Gọi Backend để tự động sắp xếp lịch trình.
 *
 * Không sử dụng dữ liệu mẫu.
 * Không dùng AI để sắp xếp lịch trình.
 */
export default function SelectedPlacesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lấy planId thật từ URL.
  const rawPlanId = searchParams.get('planId');

  const planId =
    rawPlanId === null
      ? NaN
      : Number(rawPlanId);

  const validPlanId =
    Number.isSafeInteger(planId) && planId > 0;

  const [plan, setPlan] =
    useState<TravelPlanResponse | null>(null);

  const [places, setPlaces] =
    useState<TripPlace[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  const [removing, setRemoving] =
    useState<TripPlace | null>(null);

  const [deletingPlaceId, setDeletingPlaceId] =
    useState<number | null>(null);

  const [generating, setGenerating] = useState(false);

  const suggestionsUrl = validPlanId
    ? `${CLIENT_ROUTES.TRIP_SUGGESTIONS}?planId=${planId}`
    : CLIENT_ROUTES.TRIP_PLAN;

  // =============================================
  // LẤY KẾ HOẠCH VÀ ĐỊA ĐIỂM TỪ BACKEND
  // =============================================

  useEffect(() => {
    if (!validPlanId) {
      setPlan(null);
      setPlaces([]);
      setLoading(false);
      setError(
        'Thiếu mã kế hoạch hợp lệ. Hãy tạo kế hoạch trước.',
      );
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);
    setActionError(null);
    setPlan(null);
    setPlaces([]);

    Promise.all([
      tripFlowApi.plan(planId),
      tripFlowApi.selectedPlaces(planId),
    ])
      .then(([savedPlan, selected]) => {
        if (!active) return;

        setPlan(savedPlan);
        setPlaces(selected.places);
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

  // =============================================
  // TÍNH GIÁ THAM KHẢO
  // =============================================

  const costSummary = useMemo(() => {
    const prices = places
      .filter((place) => place.estimatedCost !== null)
      .map((place) => place.estimatedCost as number);

    return {
      knownTotal: prices.reduce(
        (sum, price) => sum + price,
        0,
      ),
      unknownCount: places.length - prices.length,
    };
  }, [places]);

  // =============================================
  // XÓA ĐỊA ĐIỂM KHỎI GIỎ
  // =============================================

  const removeSelectedPlace = async (place: TripPlace) => {
    if (
      !validPlanId ||
      deletingPlaceId !== null ||
      generating
    ) {
      return;
    }

    setDeletingPlaceId(place.placeId);
    setActionError(null);

    try {
      await tripFlowApi.removePlace(
        planId,
        place.placeId,
      );

      // Chỉ cập nhật giao diện sau khi Backend thành công.
      setPlaces((current) =>
        current.filter(
          (item) => item.placeId !== place.placeId,
        ),
      );
    } catch (caught: unknown) {
      setActionError(errorMessage(caught));
    } finally {
      setDeletingPlaceId(null);
    }
  };

  // =============================================
  // TỰ ĐỘNG TẠO LỊCH TRÌNH TỪ GIỎ ĐỊA ĐIỂM
  // =============================================

  const generateItinerary = async () => {
    if (
      !validPlanId ||
      !plan ||
      loading ||
      generating ||
      deletingPlaceId !== null
    ) {
      return;
    }

    if (places.length === 0) {
      setActionError(
        'Vui lòng chọn ít nhất một địa điểm để tạo lịch trình.',
      );
      return;
    }

    setGenerating(true);
    setActionError(null);

    try {
      const generated = await tripFlowApi.generate(
        planId,
        {
          title: `Lịch trình ${plan.destination}`,
          notes:
            'Lịch trình được tự động sắp xếp từ các địa điểm Traveller đã chọn.',
        },
      );

      // Backend tạo thành công mới được chuyển trang.
      navigate(
        `${CLIENT_ROUTES.ITINERARY}?planId=${generated.planId}`,
      );
    } catch (caught: unknown) {
      // Ví dụ: Backend trả 422 nếu không đủ ngày
      // hoặc giờ mở cửa để xếp hết địa điểm.
      setActionError(errorMessage(caught));
    } finally {
      setGenerating(false);
    }
  };

  const blocked =
    generating || deletingPlaceId !== null;

  return (
    <div className="mx-auto max-w-3xl pb-28 md:pb-4">

      {/* HEADER */}
      <PageBar
        title="Kế hoạch của tôi"
        subtitle={plan?.destination}
        backTo={suggestionsUrl}
        actions={
          validPlanId ? (
            <Link
              to={suggestionsUrl}
              className="flex h-10 items-center gap-1 rounded-full bg-white px-3 text-[12px] font-bold text-[#075C66]"
            >
              <Icon
                name="add_circle"
                className="text-[18px]"
              />
              Thêm địa điểm
            </Link>
          ) : undefined
        }
      />

      {/* ĐANG TẢI */}
      {loading && (
        <div
          role="status"
          className="rounded-[20px] bg-white p-8 text-center text-[13px] text-[#087A78]"
        >
          Đang tải các địa điểm đã chọn ...
        </div>
      )}

      {/* LỖI TẢI DỮ LIỆU */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-[20px] border border-red-100 bg-red-50 p-5 text-[13px] text-red-700"
        >
          <p>{error}</p>

          <div className="mt-4 flex flex-wrap gap-2">
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
              Tạo kế hoạch mới
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && plan && (
        <>
          {/* THÔNG TIN KẾ HOẠCH */}
          <div className="rounded-[22px] bg-gradient-to-br from-[#E4FAF6] to-[#E2F8F8] p-[17px]">
            <div className="flex items-center">

              <span className="mr-3 flex h-[65px] w-[65px] items-center justify-center rounded-full bg-[#CBF5EF] text-[#087A78]">
                <Icon
                  name="location_on"
                  filled
                  className="text-[34px]"
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[18px] font-extrabold text-[#075C66]">
                  {plan.title}
                </p>

                <p className="mt-1 text-[13px] text-[#7C8DA3]">
                  {places.length} địa điểm đã thêm vào kế hoạch
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <InfoChip
                icon="schedule"
                title={`${tripDayCount(
                  plan.startDate,
                  plan.endDate,
                )} ngày`}
              />

              <InfoChip
                icon="groups"
                title={`${plan.groupSize} người`}
              />

              <InfoChip
                icon="location_on"
                title={plan.destination}
              />
            </div>
          </div>

          {/* DANH SÁCH ĐÃ CHỌN */}
          <div className="mb-4 mt-7 flex items-center justify-between">
            <h2 className="text-[21px] font-extrabold text-[#13364A]">
              Địa điểm đã chọn
            </h2>

            <span className="rounded-full bg-[#D5F7F1] px-3 py-1 text-[12px] font-bold text-[#075C66]">
              {places.length}
            </span>
          </div>

          {places.length > 0 ? (
            <div className="grid gap-3">

              {places.map((place, index) => {
                const detailUrl =
                  `${suggestionPath(
                    String(place.placeId),
                  )}?planId=${planId}`;

                const deleting =
                  deletingPlaceId === place.placeId;

                return (
                  <div
                    key={place.placeId}
                    className="flex rounded-[20px] border border-[#ECEEFA] bg-white p-2.5 shadow-sm"
                  >

                    {/* HÌNH ẢNH */}
                    <Link
                      to={detailUrl}
                      className="relative h-[146px] w-[112px] shrink-0 overflow-hidden rounded-2xl bg-[#DAF2EA]"
                      aria-label={`Xem chi tiết ${place.name}`}
                    >
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
                            className="text-[37px] text-[#73B8AD]"
                          />
                        </div>
                      )}

                      <span className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#10A99B] text-[18px] font-extrabold text-white">
                        {index + 1}
                      </span>
                    </Link>

                    {/* NỘI DUNG ĐỊA ĐIỂM */}
                    <div className="ml-3 min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-1">
                        <Link
                          to={detailUrl}
                          className="line-clamp-2 text-[15px] font-extrabold leading-[21px] text-[#13364A] hover:text-primary"
                        >
                          {place.name}
                        </Link>

                        {/* NÚT XÓA */}
                        <button
                          type="button"
                          disabled={blocked}
                          onClick={() =>
                            setRemoving(place)
                          }
                          aria-label={`Bỏ ${place.name} khỏi kế hoạch`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F1FF] text-[#13364A] hover:text-client-danger disabled:opacity-50"
                        >
                          <Icon
                            name={
                              deleting
                                ? 'hourglass_empty'
                                : 'delete'
                            }
                            className="text-[19px]"
                          />
                        </button>
                      </div>

                      {/* ĐỊA CHỈ */}
                      <p className="mt-2 flex items-start gap-1 text-[11px] text-[#72818C]">
                        <Icon
                          name="location_on"
                          className="shrink-0 text-[16px] text-[#087A78]"
                        />

                        <span className="line-clamp-2">
                          {place.address ||
                            place.province ||
                            'Chưa cập nhật địa chỉ'}
                        </span>
                      </p>

                      {/* DANH MỤC */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {place.categoryName && (
                          <span className="rounded-full bg-[#F0F1FF] px-2 py-1 text-[10px] font-medium text-[#516987]">
                            {place.categoryName}
                          </span>
                        )}
                      </div>

                      {/* GIÁ */}
                      <p className="mt-3 text-[12px] font-extrabold text-[#087A78]">
                        {placeCost(place)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // GIỎ RỖNG
            <div className="flex flex-col items-center rounded-[20px] bg-white px-5 py-10 text-center">
              <Icon
                name="location_off"
                className="text-[50px] text-[#91CCC2]"
              />

              <p className="mt-3 text-[16px] font-bold text-[#13364A]">
                Chưa có địa điểm nào
              </p>

              <p className="mt-2 text-[12px] text-[#8191A5]">
                Hãy chọn ít nhất một địa điểm trước khi tạo lịch trình.
              </p>

              <Link
                to={suggestionsUrl}
                className="mt-4 rounded-full bg-[#075C66] px-5 py-3 text-[12px] font-bold text-white"
              >
                Chọn địa điểm
              </Link>
            </div>
          )}

          {/* CHI PHÍ THAM KHẢO */}
          {places.length > 0 && (
            <div className="mt-4 rounded-2xl border border-[#DDEDE7] bg-white p-4">

              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-bold text-[#13364A]">
                  Cộng các giá tham khảo đã có
                </span>

                <span className="text-[15px] font-extrabold text-[#087A78]">
                  {numberFormat.format(
                    costSummary.knownTotal,
                  )} VND
                </span>
              </div>

              <p className="mt-1.5 text-[11px] leading-5 text-[#72818C]">
                Chưa nhân theo số người, chưa tính di chuyển
                và các chi phí khác.
                {costSummary.unknownCount > 0 &&
                  ` Có ${costSummary.unknownCount} địa điểm chưa có giá.`}
                {' '} tính chi phí dự kiến khi tạo lịch trình.
              </p>
            </div>
          )}

          {/* GIẢI THÍCH THUẬT TOÁN */}
          <div className="mt-3 flex gap-3 rounded-2xl bg-[#F0F1FF] p-4">
            <Icon
              name="lightbulb"
              className="shrink-0 text-[24px] text-[#087A78]"
            />

            <p className="flex-1 text-[12px] leading-[19px] text-[#5C6F87]">
              Chỉ những địa điểm đã chọn mới được đưa vào
              lịch trình. sẽ xếp theo ngày, giờ mở
              cửa, khoảng cách ước lượng và nhịp độ;
              không dùng AI để xếp lịch.
            </p>
          </div>

          {/* HIỂN THỊ LỖI API */}
          {actionError && (
            <p
              role="alert"
              className="mt-3 rounded-2xl border border-red-100 bg-red-50 p-3 text-center text-[12px] text-red-700"
            >
              {actionError}
            </p>
          )}

          {/* NÚT HÀNH ĐỘNG */}
          <div className="fixed inset-x-0 bottom-[62px] z-20 flex gap-2 border-t border-[#EDF0F7] bg-white px-4 py-3 md:static md:mt-4 md:rounded-[20px] md:border-0">

            {/* THÊM ĐỊA ĐIỂM */}
            <Link
              to={suggestionsUrl}
              aria-disabled={generating}
              onClick={(event) => {
                if (generating) {
                  event.preventDefault();
                }
              }}
              className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-full bg-[#F0F1FF] px-2 text-[12px] font-extrabold text-[#13364A]"
            >
              <Icon
                name="add_circle"
                filled
                className="text-[20px]"
              />
              Thêm địa điểm
            </Link>

            {/* TẠO LỊCH TRÌNH */}
            <button
              type="button"
              onClick={() => {
                void generateItinerary();
              }}
              disabled={
                blocked || places.length === 0
              }
              className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-full bg-[#C3F8F0] px-2 text-[12px] font-extrabold text-[#075C66] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#83DACC] border-t-[#075C66]" />
              ) : (
                <Icon
                  name="auto_awesome"
                  className="text-[20px]"
                />
              )}

              {generating
                ? 'Đang tạo lịch trình...'
                : 'Tự động tạo lịch trình'}
            </button>
          </div>
        </>
      )}

      {/* HỘP THOẠI XÁC NHẬN XÓA */}
      {removing && (
        <ConfirmDialog
          title="Bỏ địa điểm đã chọn"
          message={`Bạn có chắc muốn bỏ “${removing.name}” khỏi kế hoạch?`}
          confirmLabel="Bỏ địa điểm"
          danger
          onConfirm={() => {
            void removeSelectedPlace(removing);
          }}
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  );
}
