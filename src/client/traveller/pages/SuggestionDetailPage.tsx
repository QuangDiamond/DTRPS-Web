
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { placesApi } from '@/client/api/placesApi';
import {
  tripFlowApi,
  type TravelPlanResponse,
} from '@/client/api/tripFlowApi';
import type {
  OpeningHour,
  PlaceDetail,
  PlacePrice,
} from '@/client/api/types';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { Dialog } from '@/client/ui/Overlay';
import PageBar from '@/client/ui/PageBar';

type DetailTab = 'intro' | 'reviews' | 'photos' | 'contact';

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'intro', label: 'Giới thiệu' },
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'photos', label: 'Ảnh' },
  { id: 'contact', label: 'Liên hệ' },
];

const WEEK_DAYS = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật',
];

function money(amount: number, currency = 'VND') {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} ${currency}`;
}

function priceText(price: PlacePrice) {
  const label = price.description?.trim() ||
    price.priceType.replaceAll('_', ' ');
  return {
    label,
    value: money(price.amount, price.currency),
  };
}

function hourText(hour: OpeningHour) {
  if (hour.closed) return 'Đóng cửa';
  if (!hour.openTime || !hour.closeTime) return 'Chưa cập nhật';
  return `${hour.openTime.slice(0, 5)} – ${hour.closeTime.slice(0, 5)}`;
}

function RatingStars({ rating }: { rating: number }) {
  const score = Math.max(0, Math.min(5, rating));

  return (
    <span
      className="inline-flex items-center"
      aria-label={`${score.toFixed(1)} trên 5 sao`}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <Icon
          key={index}
          name={
            score - index >= 0.75
              ? 'star'
              : score - index >= 0.25
                ? 'star_half'
                : 'star'
          }
          filled={score - index >= 0.25}
          className="text-[19px] text-[#F59E38]"
        />
      ))}
      <span className="ml-2 text-[14px] font-extrabold text-[#F59E38]">
        {score.toFixed(1)}
      </span>
    </span>
  );
}

/**
 * Chi tiết một địa điểm thật,
 * kết nối với Travel Plan qua planId.
 */
export default function SuggestionDetailPage() {
  const { placeId: rawPlaceId } =
    useParams<{ placeId: string }>();

  const [searchParams] = useSearchParams();

  const planId = Number(searchParams.get('planId') ?? '');
  const placeId = Number(rawPlaceId ?? '');

  const validPlanId =
    Number.isSafeInteger(planId) && planId > 0;

  const validPlaceId =
    Number.isSafeInteger(placeId) && placeId > 0;

  const [plan, setPlan] =
    useState<TravelPlanResponse | null>(null);

  const [place, setPlace] =
    useState<PlaceDetail | null>(null);

  const [inPlan, setInPlan] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [retryCount, setRetryCount] = useState(0);
  const [tab, setTab] = useState<DetailTab>('intro');

  const [imageIndex, setImageIndex] = useState(0);

  const [viewerIndex, setViewerIndex] =
    useState<number | null>(null);

  const suggestionsUrl = validPlanId
    ? `${CLIENT_ROUTES.TRIP_SUGGESTIONS}?planId=${planId}`
    : CLIENT_ROUTES.TRIP_PLAN;

  const selectedUrl = validPlanId
    ? `${CLIENT_ROUTES.TRIP_PLAN_SELECTED}?planId=${planId}`
    : CLIENT_ROUTES.TRIP_PLAN;

  // ==========================================
  // LẤY THÔNG TIN THẬT TỪ BACKEND
  // ==========================================

  useEffect(() => {
    if (!validPlanId || !validPlaceId) {
      setLoading(false);
      setError(
        'Thiếu mã kế hoạch hoặc mã địa điểm hợp lệ.',
      );
      setPlan(null);
      setPlace(null);
      return;
    }

    let active = true;

    setLoading(true);
    setError(null);
    setActionError(null);
    setPlan(null);
    setPlace(null);
    setImageIndex(0);
    setViewerIndex(null);
    setTab('intro');

    Promise.all([
      tripFlowApi.plan(planId),
      placesApi.get(placeId),
      tripFlowApi.selectedPlaces(planId),
    ])
      .then(([savedPlan, placeDetail, selected]) => {
        if (!active) return;

        setPlan(savedPlan);
        setPlace(placeDetail);

        setInPlan(
          selected.places.some(
            (item) => item.placeId === placeId,
          ),
        );

        setSelectedCount(selected.count);
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
    placeId,
    validPlanId,
    validPlaceId,
    retryCount,
  ]);

  // Ảnh chính được ưu tiên hiển thị trước.
  const photos = useMemo(() => {
    if (!place) return [] as string[];

    const ordered = [...place.images].sort(
      (a, b) => Number(b.primary) - Number(a.primary),
    );

    const links = ordered
      .map((image) => image.url)
      .filter(Boolean);

    if (place.summary.coverUrl) {
      links.push(place.summary.coverUrl);
    }

    return [...new Set(links)];
  }, [place]);

  // ==========================================
  // THÊM / BỎ ĐỊA ĐIỂM KHỎI KẾ HOẠCH
  // ==========================================

  const togglePlace = async () => {
    if (!place || !validPlanId || busy) return;

    const next = !inPlan;

    setBusy(true);
    setActionError(null);

    try {
      if (next) {
        await tripFlowApi.addPlace(planId, placeId);
      } else {
        await tripFlowApi.removePlace(planId, placeId);
      }

      // Chỉ cập nhật khi Backend đã xác nhận.
      setInPlan(next);

      setSelectedCount((current) =>
        Math.max(0, current + (next ? 1 : -1)),
      );
    } catch (caught) {
      setActionError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const stepPhoto = (delta: number) => {
    if (photos.length === 0) return;

    setImageIndex(
      (index) =>
        (index + delta + photos.length) % photos.length,
    );
  };

  const openingHours = [
    ...(place?.openingHours ?? []),
  ].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const minPrice = place?.prices.length
    ? [...place.prices].sort(
      (a, b) => a.amount - b.amount,
    )[0]
    : null;

  return (
    <div className="mx-auto max-w-3xl pb-36 md:pb-4">
      <PageBar
        title="Chi tiết địa điểm"
        backTo={suggestionsUrl}
        subtitle={
          plan
            ? `${plan.destination} · Kế hoạch #${plan.planId}`
            : undefined
        }
        actions={
          validPlanId ? (
            <Link
              to={selectedUrl}
              className="flex h-10 items-center gap-1 rounded-full bg-white px-3 text-[12px] font-bold text-[#075C66]"
            >
              <Icon
                name="shopping_basket"
                className="text-[19px]"
              />
              {selectedCount}
            </Link>
          ) : undefined
        }
      />

      {/* TRẠNG THÁI ĐANG TẢI */}
      {loading && (
        <div
          role="status"
          className="rounded-2xl bg-white p-8 text-center text-[13px] text-[#087A78]"
        >
          Đang tải thông tin địa điểm ...
        </div>
      )}

      {/* LỖI TẢI DỮ LIỆU */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 p-5"
        >
          <p className="text-[13px] text-red-700">
            {error}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {validPlanId && validPlaceId && (
              <button
                type="button"
                onClick={() =>
                  setRetryCount((count) => count + 1)
                }
                className="rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[#075C66]"
              >
                Thử tải lại
              </button>
            )}

            <Link
              to={suggestionsUrl}
              className="rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[#075C66]"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && place && (
        <>
          {/* ẢNH ĐỊA ĐIỂM */}
          <div className="relative h-[300px] overflow-hidden rounded-[24px] bg-[#D8EDE7]">
            {photos.length ? (
              <img
                src={
                  photos[
                    Math.min(
                      imageIndex,
                      photos.length - 1,
                    )
                    ]
                }
                alt={place.summary.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#E5F7F2] to-[#C9E5E5]">
                <Icon
                  name="landscape"
                  className="text-[70px] text-[#73B8AD]"
                />
              </div>
            )}

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => stepPhoto(-1)}
                  aria-label="Ảnh trước"
                  className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#13364A]"
                >
                  <Icon
                    name="chevron_left"
                    className="text-[24px]"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => stepPhoto(1)}
                  aria-label="Ảnh sau"
                  className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#13364A]"
                >
                  <Icon
                    name="chevron_right"
                    className="text-[24px]"
                  />
                </button>

                <div className="absolute right-0 bottom-4 left-0 flex justify-center gap-1.5">
                  {photos.map((url, index) => (
                    <button
                      key={url}
                      type="button"
                      aria-label={`Xem ảnh ${index + 1}`}
                      onClick={() =>
                        setImageIndex(index)
                      }
                      className={`h-1.5 rounded-full ${
                        imageIndex === index
                          ? 'w-4 bg-white'
                          : 'w-1.5 bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#075C66]">
              {place.summary.category?.name ??
                'Địa điểm du lịch'}
            </span>
          </div>

          {/* CÁC TAB THÔNG TIN */}
          <div
            className="sticky top-16 z-10 mt-3 flex justify-around rounded-2xl border-b border-[#EDF0F5] bg-white px-2"
            role="tablist"
          >
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={`border-b-2 px-2.5 py-3.5 text-[12px] font-bold ${
                  tab === item.id
                    ? 'border-[#087A78] text-[#087A78]'
                    : 'border-transparent text-[#13364A]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-3 min-h-[300px] rounded-[20px] bg-white px-4 pt-4 pb-8">

            {/* TAB GIỚI THIỆU */}
            {tab === 'intro' && (
              <div>
                <h1 className="text-[22px] font-extrabold text-[#13364A]">
                  {place.summary.name}
                </h1>

                {place.summary.rating !== null && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <RatingStars
                      rating={place.summary.rating}
                    />

                    <span className="text-[12px] text-[#72818C]">
                      ({place.summary.reviewCount} lượt đánh giá)
                    </span>
                  </div>
                )}

                {place.summary.rating === null && (
                  <p className="mt-2 text-[12px] text-[#72818C]">
                    Chưa có điểm đánh giá.
                  </p>
                )}

                <p className="mt-3 flex items-start gap-1 text-[13px] text-[#72818C]">
                  <Icon
                    name="location_on"
                    className="shrink-0 text-[19px] text-[#087A78]"
                  />

                  {place.summary.address ||
                    place.summary.province?.name ||
                    'Chưa cập nhật địa chỉ'}
                </p>

                <p className="mt-3 whitespace-pre-line text-[13px] leading-6 text-[#4A5A66]">
                  {place.description?.trim() ||
                    'Địa điểm này chưa có phần giới thiệu.'}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#F8F8FF] p-3">
                    <p className="text-[11px] text-[#72818C]">
                      Loại hình
                    </p>
                    <p className="mt-1 text-[13px] font-bold text-[#13364A]">
                      {place.summary.category?.name ??
                        'Chưa cập nhật'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#E2FAF5] p-3">
                    <p className="text-[11px] text-[#72818C]">
                      Giá từ
                    </p>

                    <p className="mt-1 text-[13px] font-extrabold text-[#075C66]">
                      {minPrice
                        ? money(
                          minPrice.amount,
                          minPrice.currency,
                        )
                        : 'Chưa có giá'}
                    </p>
                  </div>
                </div>

                {/* GIÁ THAM KHẢO */}
                <h2 className="mt-6 text-[15px] font-extrabold text-[#13364A]">
                  Bảng giá tham khảo
                </h2>

                {place.prices.length > 0 ? (
                  <div className="mt-2 divide-y divide-[#E6E9F2] rounded-2xl border border-[#E6E9F2] px-3">
                    {place.prices.map(
                      (price, index) => {
                        const info = priceText(price);

                        return (
                          <div
                            key={`${price.priceType}-${index}`}
                            className="flex items-start justify-between gap-3 py-3"
                          >
                            <span className="text-[12px] text-[#72818C]">
                              {info.label}
                            </span>

                            <span className="text-right text-[12px] font-bold text-[#075C66]">
                              {info.value}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-[12px] text-[#72818C]">
                    Chưa có thông tin giá.
                  </p>
                )}

                <p className="mt-2 text-[11px] text-[#8494A7]">
                  Giá do địa điểm cung cấp, không phải báo giá chính thức cho cả chuyến đi.
                </p>

                {/* GIỜ MỞ CỬA */}
                <h2 className="mt-6 text-[15px] font-extrabold text-[#13364A]">
                  Giờ mở cửa
                </h2>

                {openingHours.length > 0 ? (
                  <div className="mt-2 divide-y divide-[#E6E9F2] rounded-2xl border border-[#E6E9F2] px-3">
                    {openingHours.map(
                      (hour, index) => (
                        <div
                          key={`${hour.dayOfWeek}-${index}`}
                          className="flex justify-between gap-2 py-2.5 text-[12px]"
                        >
                          <span className="text-[#72818C]">
                            {WEEK_DAYS[
                              hour.dayOfWeek - 1
                                ] ??
                              `Ngày ${hour.dayOfWeek}`}
                          </span>

                          <span className="font-bold text-[#13364A]">
                            {hourText(hour)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-[12px] text-[#72818C]">
                    Chưa cập nhật giờ mở cửa.
                  </p>
                )}
              </div>
            )}

            {/* TAB ĐÁNH GIÁ */}
            {tab === 'reviews' && (
              <div>
                <h2 className="text-[20px] font-extrabold text-[#13364A]">
                  Đánh giá địa điểm
                </h2>

                {place.summary.rating !== null ? (
                  <div className="mt-4 flex flex-col items-center rounded-2xl bg-[#F8F8FF] px-4 py-7">
                    <RatingStars
                      rating={place.summary.rating}
                    />

                    <p className="mt-2 text-[12px] text-[#72818C]">
                      {place.summary.reviewCount} lượt đánh giá trên hệ thống
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 rounded-2xl bg-[#F8F8FF] p-5 text-center text-[13px] text-[#72818C]">
                    Địa điểm chưa có đánh giá.
                  </p>
                )}

                <p className="mt-4 text-[12px] leading-5 text-[#8494A7]">
                  API chi tiết địa điểm hiện chỉ trả điểm trung bình và số lượt đánh giá, chưa cung cấp nội dung từng nhận xét.
                </p>
              </div>
            )}

            {/* TAB HÌNH ẢNH */}
            {tab === 'photos' && (
              <div>
                <h2 className="text-[19px] font-extrabold text-[#13364A]">
                  Hình ảnh {place.summary.name}
                </h2>

                <p className="mt-1 text-[11px] text-[#72818C]">
                  {photos.length} 
                </p>

                {photos.length ? (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {photos.map((url, index) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() =>
                          setViewerIndex(index)
                        }
                        className="overflow-hidden rounded-xl bg-[#E5F7F2]"
                        aria-label={`Phóng to ảnh ${index + 1}`}
                      >
                        <img
                          src={url}
                          alt={`${place.summary.name} - ảnh ${index + 1}`}
                          className="h-32 w-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl bg-[#F8F8FF] p-6 text-center text-[12px] text-[#72818C]">
                    Địa điểm chưa có ảnh.
                  </p>
                )}
              </div>
            )}

            {/* TAB LIÊN HỆ */}
            {tab === 'contact' && (
              <div>
                <h2 className="text-[20px] font-extrabold text-[#13364A]">
                  Thông tin liên hệ
                </h2>

                <div className="mt-4 space-y-4 rounded-2xl bg-[#F8F8FF] p-4 text-[13px]">
                  <p className="flex items-start gap-2">
                    <Icon
                      name="place"
                      className="text-[19px] text-[#087A78]"
                    />

                    <span>
                      {place.summary.address ||
                        'Chưa cập nhật địa chỉ'}
                    </span>
                  </p>

                  <p className="flex items-start gap-2">
                    <Icon
                      name="phone"
                      className="text-[19px] text-[#087A78]"
                    />

                    {place.phone ? (
                      <a
                        href={`tel:${place.phone}`}
                        className="font-semibold text-[#075C66]"
                      >
                        {place.phone}
                      </a>
                    ) : (
                      <span className="text-[#72818C]">
                        Chưa cập nhật số điện thoại
                      </span>
                    )}
                  </p>

                  <p className="flex items-start gap-2">
                    <Icon
                      name="language"
                      className="text-[19px] text-[#087A78]"
                    />

                    {place.website &&
                    /^https?:\/\//i.test(
                      place.website,
                    ) ? (
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-semibold text-[#075C66] underline"
                      >
                        {place.website}
                      </a>
                    ) : (
                      <span className="text-[#72818C]">
                        Chưa có website
                      </span>
                    )}
                  </p>
                </div>

                {Number.isFinite(
                    place.latitude,
                  ) &&
                  Number.isFinite(
                    place.longitude,
                  ) && (
                    <p className="mt-4 text-[11px] text-[#72818C]">
                      Tọa độ: {place.latitude}, {place.longitude}
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* LỖI THÊM/BỎ ĐỊA ĐIỂM */}
          {actionError && (
            <p
              role="alert"
              className="mt-3 rounded-2xl border border-red-100 bg-red-50 p-3 text-[12px] text-red-700"
            >
              {actionError}
            </p>
          )}

          {/* NÚT ĐỊA ĐIỂM ĐÃ CHỌN */}
          <div className="fixed inset-x-0 bottom-[62px] z-20 border-t border-[#EDF0F5] bg-white px-4 pt-2.5 pb-2 md:static md:mt-4 md:flex md:gap-3 md:rounded-[20px] md:border-0 md:p-3">
            <Link
              to={selectedUrl}
              className="mb-2.5 flex h-12 items-center justify-center gap-2 rounded-full border border-[#B8EAE3] bg-[#F0FCF9] text-[14px] font-bold text-[#075C66] md:mb-0 md:flex-1"
            >
              <Icon
                name="shopping_basket"
                className="text-[20px]"
              />

              Xem địa điểm đã chọn ({selectedCount})

              <Icon
                name="chevron_right"
                className="text-[20px]"
              />
            </Link>

            {/* NÚT THÊM/BỎ ĐỊA ĐIỂM */}
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void togglePlace();
              }}
              aria-pressed={inPlan}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-bold disabled:cursor-wait disabled:opacity-60 md:flex-1 ${
                inPlan
                  ? 'bg-[#C3F8F0] text-[#075C66]'
                  : 'bg-[#075C66] text-white hover:bg-primary'
              }`}
            >
              <Icon
                name={
                  busy
                    ? 'hourglass_empty'
                    : inPlan
                      ? 'check_circle'
                      : 'add_location_alt'
                }
                className="text-[19px]"
              />

              {busy
                ? 'Đang cập nhật...'
                : inPlan
                  ? 'Đã chọn · Bỏ khỏi kế hoạch'
                  : 'Thêm vào kế hoạch'}
            </button>
          </div>
        </>
      )}

      {/* HỘP THOẠI PHÓNG TO ẢNH */}
      {viewerIndex !== null &&
        place &&
        photos[viewerIndex] && (
          <Dialog
            label={`Ảnh ${viewerIndex + 1} của ${place.summary.name}`}
            onClose={() => setViewerIndex(null)}
            className="max-w-4xl bg-[#101419]!"
          >
            <div className="flex items-center justify-between px-4 py-3 text-white">
              <span className="text-[12px]">
                {viewerIndex + 1}/{photos.length}
              </span>

              <button
                type="button"
                aria-label="Đóng ảnh"
                onClick={() => setViewerIndex(null)}
              >
                <Icon
                  name="close"
                  className="text-[24px]"
                />
              </button>
            </div>

            <img
              src={photos[viewerIndex]}
              alt={`${place.summary.name} - ảnh ${viewerIndex + 1}`}
              className="max-h-[72vh] w-full object-contain"
            />

            {photos.length > 1 && (
              <div className="flex justify-center gap-3 px-4 py-3">
                <button
                  type="button"
                  aria-label="Ảnh trước"
                  onClick={() =>
                    setViewerIndex(
                      (viewerIndex - 1 + photos.length) %
                      photos.length,
                    )
                  }
                  className="rounded-full bg-white/15 p-2 text-white"
                >
                  <Icon
                    name="chevron_left"
                    className="text-[23px]"
                  />
                </button>

                <button
                  type="button"
                  aria-label="Ảnh tiếp theo"
                  onClick={() =>
                    setViewerIndex(
                      (viewerIndex + 1) % photos.length,
                    )
                  }
                  className="rounded-full bg-white/15 p-2 text-white"
                >
                  <Icon
                    name="chevron_right"
                    className="text-[23px]"
                  />
                </button>
              </div>
            )}
          </Dialog>
        )}
    </div>
  );
}
