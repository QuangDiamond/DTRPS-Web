import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import Pagination from '@/components/common/Pagination';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { ClientApiError, errorMessage } from '@/client/api/http';
import { placeReviewApi, type PlaceReview } from '@/client/api/placeReviewApi';
import { placesApi } from '@/client/api/placesApi';
import { useClientLiveRefresh } from '@/client/live/clientLiveContext';
import type { PlaceDetail } from '@/client/api/types';
import { CLIENT_ROUTES } from '@/client/routePaths';
import Avatar from '@/client/traveller/components/Avatar';
import FavoriteButton from '@/client/traveller/components/FavoriteButton';
import ReportReviewDialog from '@/client/traveller/components/ReportReviewDialog';
import StopReviewCard from '@/client/traveller/components/StopReviewCard';
import TodayWeatherCard from '@/client/traveller/components/TodayWeatherCard';
import PlaceDirectionsMap from '@/client/traveller/components/PlaceDirectionsMap';
import { useTraveller } from '@/client/traveller/travellerContext';
import { FormAlert, Spinner } from '@/client/ui/Blocks';
import { NoticeToast } from '@/client/ui/Overlay';
import { useNotice } from '@/client/ui/useNotice';
import PageBar, { BarIconButton } from '@/client/ui/PageBar';

const REVIEWS_PAGE_SIZE = 5;

const reviewDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function formatReviewDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : reviewDateFormatter.format(date);
}

/** Menu ⋯ trên thẻ đánh giá: báo cáo đánh giá của người khác */
function ReviewMenu({ reported, onReport }: { reported: boolean; onReport: () => void }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  // Bấm ra ngoài hoặc nhấn Esc thì đóng menu
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="relative shrink-0" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Tuỳ chọn đánh giá"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#8793AB] hover:bg-[#F1F5F8] hover:text-[#13364A]"
      >
        <Icon name="more_vert" className="text-[20px]" />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-20 mt-1 w-52 overflow-hidden rounded-2xl bg-white py-1 shadow-lg ring-1 ring-black/5">
          {reported ? (
            <p className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-[#8793AB]">
              <Icon name="check_circle" className="text-[18px]" />
              Bạn đã báo cáo đánh giá này
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onReport();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-bold text-client-danger hover:bg-[#FDF3F3]"
            >
              <Icon name="flag" className="text-[18px]" />
              Báo cáo đánh giá
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  menu,
  onOpenImage,
}: {
  review: PlaceReview;
  /** Không có với đánh giá của chính mình */
  menu?: { reported: boolean; onReport: () => void };
  /** Bấm vào ảnh trong đánh giá để phóng to bằng Lightbox */
  onOpenImage: (urls: string[], index: number) => void;
}) {
  return (
    <div className="rounded-2xl bg-white p-5">
      <div className="flex items-center gap-3">
        <Avatar
          url={review.userAvatarUrl}
          size={48}
          iconSize={28}
          className="bg-[#CEE7EA] text-[#0891B2]"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold text-[#13364A]">
            {review.userName ?? 'Khách Smart Travel'}
          </p>
          <p className="text-[12px] text-[#8793AB]">{formatReviewDate(review.createdAt)}</p>
        </div>
        <span className="flex shrink-0 items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <Icon
              key={value}
              name="star"
              filled={value <= review.rating}
              className={`text-[17px] ${value <= review.rating ? 'text-[#E0A100]' : 'text-[#D7DEE5]'}`}
            />
          ))}
        </span>
        {menu && <ReviewMenu {...menu} />}
      </div>
      {review.comment && (
        <p className="mt-3 text-[14.5px] leading-[23px] text-[#3B4B57]">{review.comment}</p>
      )}
      {review.imageUrls.length > 0 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto">
          {review.imageUrls.map((url, idx) => (
            <button
              key={url}
              type="button"
              onClick={() => onOpenImage(review.imageUrls, idx)}
              aria-label={`Phóng to ảnh đánh giá ${idx + 1}`}
              className="group relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl bg-[#CEE7EA]"
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Khung xem ảnh toàn màn hình (Lightbox): hỗ trợ phím Esc, mũi tên trái/phải và bấm nút < > */
function ImageLightbox({
  images,
  index,
  onChange,
  onClose,
}: {
  images: string[];
  index: number;
  onChange: (next: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (images.length > 1 && event.key === 'ArrowLeft') {
        onChange((index - 1 + images.length) % images.length);
      }
      if (images.length > 1 && event.key === 'ArrowRight') {
        onChange((index + 1) % images.length);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [images.length, index, onChange, onClose]);

  const currentUrl = images[Math.min(index, images.length - 1)];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh phóng to"
      onClick={onClose}
      className="animate-[fadeIn_150ms_ease-out] fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
      >
        <Icon name="close" className="text-[22px]" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChange((index - 1 + images.length) % images.length);
            }}
            aria-label="Ảnh trước"
            className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 md:left-6"
          >
            <Icon name="chevron_left" className="text-[28px]" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChange((index + 1) % images.length);
            }}
            aria-label="Ảnh tiếp theo"
            className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 md:right-6"
          >
            <Icon name="chevron_right" className="text-[28px]" />
          </button>
        </>
      )}

      <img
        src={currentUrl}
        alt=""
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
      />

      {images.length > 1 && (
        <span className="absolute bottom-5 rounded-full bg-black/60 px-3.5 py-1 text-[12px] font-bold text-white tabular-nums">
          {index + 1} / {images.length}
        </span>
      )}
    </div>
  );
}

/** Khung xương shimmer thay cho vòng xoay trong lúc tải trang chi tiết */
function PlaceDetailSkeleton() {
  return (
    <div className="pb-12">
      <div className="mb-4 flex items-center gap-3">
        <div className="shimmer h-10 w-10 rounded-full" />
        <div className="shimmer h-5 w-40 rounded-full" />
      </div>
      <div className="md:grid md:grid-cols-[1.4fr_1fr] md:gap-6">
        <div className="space-y-4">
          <div className="shimmer h-60 w-full rounded-[24px] md:h-80" />
          <div className="shimmer h-7 w-2/3 rounded-full" />
          <div className="shimmer h-4 w-1/2 rounded-full" />
          <div className="flex gap-2">
            <div className="shimmer h-7 w-24 rounded-full" />
            <div className="shimmer h-7 w-20 rounded-full" />
          </div>
          <div className="shimmer mt-4 h-24 w-full rounded-2xl" />
        </div>
        <div className="mt-6 space-y-4 md:mt-0">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, idx) => (
              <div key={idx} className="shimmer h-28 rounded-2xl" />
            ))}
          </div>
          <div className="shimmer h-36 w-full rounded-2xl" />
          <div className="shimmer h-44 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const PRICE_LABELS: Record<string, string> = {
  TICKET: 'Vé vào cổng',
  ROOM_NIGHT: 'Giá phòng / đêm',
  AVG_MEAL: 'Giá món / bữa ăn',
  AVG_DRINK: 'Giá đồ uống',
  OTHER: 'Khác',
};

/** 0 đ → "Miễn phí" */
function formatVnd(amount: number): string {
  return amount === 0 ? 'Miễn phí' : `${Math.round(amount).toLocaleString('vi-VN')}đ`;
}

/** 1 = Thứ 2 … 7 = Chủ nhật */
const todayOfWeek = () => (new Date().getDay() === 0 ? 7 : new Date().getDay());

/** Đổi chuỗi "HH:mm" thành số phút tính từ 00:00 để so sánh giờ mở/đóng cửa */
function parseMinutes(hhmm: string | null): number | null {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** Kiểm tra địa điểm có đang mở cửa theo giờ hiện tại trên máy hay không */
function isOpenNow(detail: PlaceDetail): boolean {
  if (detail.openingHours.length === 0) return true;
  const today = detail.openingHours.find((hour) => hour.dayOfWeek === todayOfWeek());
  if (!today || today.closed) return false;
  const open = parseMinutes(today.openTime);
  const close = parseMinutes(today.closeTime);
  if (open === null || close === null) return true;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  // Hỗ trợ quán mở qua nửa đêm (vd. 18:00 - 02:00)
  return close >= open ? current >= open && current <= close : current >= open || current <= close;
}

/** Không khai báo giờ = mở cả ngày */
function todayHoursLabel(detail: PlaceDetail): string {
  if (detail.openingHours.length === 0) return 'Mở cả ngày';
  const today = detail.openingHours.find((hour) => hour.dayOfWeek === todayOfWeek());
  if (!today || today.closed) return 'Đóng cửa hôm nay';
  return today.openTime && today.closeTime ? `${today.openTime} - ${today.closeTime}` : 'Cả ngày';
}

/** Mức có phí thấp nhất; toàn bộ 0 đ → Miễn phí */
function cheapestPriceLabel(detail: PlaceDetail): string {
  if (detail.prices.length === 0) return 'Chưa có giá';
  const paid = detail.prices.filter((price) => price.amount > 0).map((price) => price.amount);
  if (paid.length === 0) return 'Miễn phí';
  return `Từ ${formatVnd(Math.min(...paid))}`;
}

function websiteLabel(website: string | null): string {
  if (!website) return 'Chưa cập nhật';
  try {
    return new URL(website).hostname;
  } catch {
    return website;
  }
}

/** Chi tiết điểm đến — gọi GET /api/places/{id} (công khai, chỉ ACTIVE) */
export default function PlaceDetailsPage() {
  const { placeId } = useParams();
  const location = useLocation();
  // Nơi mở trang này có thể gửi kèm state.from (vd. trang chủ → khu "Đối tác nổi bật");
  // không có thì: /favorites/:placeId về Yêu thích, /explore/:placeId về Khám phá
  const from = (location.state as { from?: unknown } | null)?.from;
  const backTo =
    typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
      ? from
      : location.pathname.startsWith('/favorites')
        ? CLIENT_ROUTES.FAVORITES
        : CLIENT_ROUTES.EXPLORE;
  const { favorites, toggleFavorite } = useTraveller();
  const { user } = useClientAuth();
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [introExpanded, setIntroExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, showNotice] = useNotice();
  // Trạng thái Lightbox xem ảnh phóng to (dùng chung cho ảnh địa điểm và ảnh đánh giá)
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  // Chỉ số ảnh đang hiển thị ở khung ảnh chính (đổi khi bấm thumbnail hoặc nút < >)
  const [activeImage, setActiveImage] = useState(0);
  // Tín hiệu kích hoạt chỉ đường Goong Map từ nút Chỉ đường ở cột phải
  const [directionsSignal, setDirectionsSignal] = useState(0);

  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsVersion, setReviewsVersion] = useState(0);
  const navigate = useNavigate();
  // Báo cáo đánh giá: id các đánh giá mình đã báo cáo ở địa điểm này + đánh giá đang báo cáo
  const [reportedIds, setReportedIds] = useState<Set<number>>(new Set());
  const [reporting, setReporting] = useState<PlaceReview | null>(null);
  useEffect(() => {
    if (!placeId || !user) {
      setReportedIds(new Set());
      return;
    }
    let active = true;
    placeReviewApi
      .reported(placeId)
      .then((ids) => active && setReportedIds(new Set(ids)))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [placeId, user]);
  const startReport = (review: PlaceReview) => {
    if (!user) {
      // Khách chưa đăng nhập → đăng nhập xong quay lại đúng trang này
      navigate(CLIENT_ROUTES.LOGIN, { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    setReporting(review);
  };

  // Admin ẩn / hiện lại đánh giá của mình ở địa điểm này → tải lại đánh giá + điểm trung bình
  useClientLiveRefresh(['REVIEW_'], (event) => {
    if (!placeId || String(event.data?.placeId) !== String(placeId)) return;
    setReviewsVersion((n) => n + 1);
    placesApi
      .get(placeId)
      .then(setDetail)
      .catch(() => undefined);
  });

  useEffect(() => {
    if (!placeId) return;
    let active = true;
    setDetail(null);
    setNotFound(false);
    setLoadError(null);
    placesApi
      .get(placeId)
      .then((result) => active && setDetail(result))
      .catch((failure: unknown) => {
        if (!active) return;
        if (failure instanceof ClientApiError && failure.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(errorMessage(failure));
        }
      });
    return () => {
      active = false;
    };
  }, [placeId]);

  // Đổi địa điểm thì về lại ảnh chính đầu tiên và trang 1 của danh sách đánh giá.
  useEffect(() => {
    setActiveImage(0);
    setReviewsPage(1);
  }, [placeId]);

  useEffect(() => {
    if (!placeId) return;
    let active = true;
    setReviewsLoading(true);
    setReviewsError(null);
    placeReviewApi
      .list(placeId, reviewsPage - 1, REVIEWS_PAGE_SIZE)
      .then((result) => {
        if (!active) return;
        setReviews(result.items);
        setReviewsTotal(result.total);
      })
      .catch((failure: unknown) => active && setReviewsError(errorMessage(failure)))
      .finally(() => active && setReviewsLoading(false));
    return () => {
      active = false;
    };
  }, [placeId, reviewsPage, reviewsVersion]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center rounded-[20px] bg-white px-6 py-14 text-center">
        <Icon name="location_off" className="text-[48px] text-[#72818C]" />
        <p className="mt-3 text-[16px] font-bold text-[#13364A]">Không tìm thấy địa điểm</p>
        <Link
          to={backTo}
          className="mt-5 rounded-full bg-[#E9EBFF] px-6 py-3 text-[13px] font-semibold text-[#334E68]"
        >
          Quay lại
        </Link>
      </div>
    );
  }

  if (loadError) {
    return <FormAlert message={`Không tải được địa điểm: ${loadError}`} />;
  }

  if (!detail) return <PlaceDetailSkeleton />;

  const place = detail.summary;
  const favorite = favorites.includes(String(place.id));
  // Sắp xếp ảnh chính (primary=true) luôn đứng đầu tiên; fallback về coverUrl nếu danh sách rỗng
  const orderedImages =
    detail.images.length > 0
      ? [...detail.images].sort((a, b) => Number(b.primary) - Number(a.primary))
      : [];
  const placeImageUrls =
    orderedImages.length > 0
      ? orderedImages.map((image) => image.url)
      : place.coverUrl
        ? [place.coverUrl]
        : [];
  const openNow = isOpenNow(detail);
  const safeImageIndex =
    placeImageUrls.length > 0 ? Math.min(activeImage, placeImageUrls.length - 1) : 0;
  const activeImageUrl = placeImageUrls[safeImageIndex] ?? null;
  const stepImage = (delta: number) => {
    if (placeImageUrls.length < 2) return;
    setActiveImage((current) => (current + delta + placeImageUrls.length) % placeImageUrls.length);
  };

  const copyAddress = async () => {
    if (!place.address) return;
    try {
      await navigator.clipboard.writeText(place.address);
      showNotice('Đã sao chép địa chỉ.');
    } catch {
      showNotice('Không thể sao chép địa chỉ lúc này.');
    }
  };

  const scrollToReviews = () => {
    document
      .getElementById('place-reviews')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const share = async () => {
    const text = `${place.name} - ${place.address ?? ''}\nKhám phá cùng SmartTravel Vietnam AI ✨`;
    try {
      if (navigator.share) await navigator.share({ title: place.name, text });
      else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        showNotice('Đã sao chép thông tin địa điểm.');
      }
    } catch {
      // Người dùng huỷ chia sẻ
    }
  };

  return (
    <div className="pb-24 md:pb-4">
      <PageBar
        title="Chi Tiết Điểm Đến"
        backTo={backTo}
        actions={<BarIconButton icon="share" label="Chia sẻ" onClick={() => void share()} />}
      />

      <div className="md:grid md:grid-cols-[1.4fr_1fr] md:gap-6">
        <div className="min-w-0">
          {/* Khung ảnh chính lớn tỷ lệ ngang + nút < > chuyển ảnh + bấm phóng to Lightbox */}
          <div className="group relative h-64 overflow-hidden rounded-[24px] bg-[#CEE7EA] md:h-[360px]">
            {activeImageUrl ? (
              <button
                type="button"
                onClick={() => setLightbox({ images: placeImageUrls, index: safeImageIndex })}
                aria-label="Phóng to ảnh địa điểm"
                className="relative h-full w-full cursor-zoom-in overflow-hidden"
              >
                <img
                  src={activeImageUrl}
                  alt={place.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon name="image" className="text-[48px] text-white/70" />
              </div>
            )}

            {/* Nút < > chuyển nhanh giữa các ảnh khi địa điểm có từ 2 ảnh trở lên */}
            {placeImageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => stepImage(-1)}
                  aria-label="Ảnh trước"
                  className="absolute top-1/2 left-3 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm transition-all hover:bg-black/70 active:scale-95"
                >
                  <Icon name="chevron_left" className="text-[22px]" />
                </button>
                <button
                  type="button"
                  onClick={() => stepImage(1)}
                  aria-label="Ảnh tiếp theo"
                  className="absolute top-1/2 right-3 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm transition-all hover:bg-black/70 active:scale-95"
                >
                  <Icon name="chevron_right" className="text-[22px]" />
                </button>
              </>
            )}

            {/* Lớp phủ badge trạng thái mở cửa, yêu thích, số sao và nút xem tất cả ảnh */}
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between bg-linear-to-b from-black/15 via-transparent to-black/30 p-3.5 [&_button]:pointer-events-auto">
              <div className="flex items-start justify-between gap-2">
                {/* Nhãn trạng thái mở/đóng cửa tính theo giờ hiện tại */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm backdrop-blur-sm ${
                    openNow ? 'bg-[#ECFDF5]/95 text-[#0F766E]' : 'bg-[#FEF2F2]/95 text-[#B91C1C]'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${openNow ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}
                  />
                  {openNow ? 'Đang mở cửa' : 'Đã đóng cửa'}
                </span>
                <FavoriteButton
                  active={favorite}
                  onToggle={() => toggleFavorite(String(place.id))}
                  className="h-10 w-10"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                {/* Bấm badge số sao để cuộn mượt xuống mục Đánh giá */}
                <button
                  type="button"
                  onClick={scrollToReviews}
                  title="Xem đánh giá địa điểm"
                  className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[13px] font-extrabold text-[#13364A] shadow-sm transition-transform hover:scale-105 active:scale-95"
                >
                  <Icon name="star" filled className="text-[16px] text-[#E0A100]" />
                  {place.rating ?? 'Mới'}
                  {place.rating !== null && (
                    <span className="text-[11px] font-normal text-[#72818C]">
                      ({place.reviewCount})
                    </span>
                  )}
                </button>
                {placeImageUrls.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLightbox({ images: placeImageUrls, index: safeImageIndex })}
                    className="flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                  >
                    <Icon name="photo_library" className="text-[14px]" />
                    {placeImageUrls.length > 1
                      ? `${safeImageIndex + 1}/${placeImageUrls.length} ảnh`
                      : 'Phóng to'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Hàng ảnh thumbnail nhỏ ngay dưới ảnh chính (tự ẩn khi địa điểm chỉ có 1 ảnh) */}
          {placeImageUrls.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto p-1">
              {placeImageUrls.map((url, idx) => {
                const selected = idx === safeImageIndex;
                return (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    aria-label={`Xem ảnh ${idx + 1}`}
                    aria-current={selected}
                    className={`relative h-[68px] w-[104px] shrink-0 overflow-hidden rounded-2xl bg-[#CEE7EA] transition-all duration-200 ${
                      selected
                        ? 'opacity-100 ring-2 ring-[#0891B2] ring-offset-2'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="min-w-0 flex-1 text-[28px] leading-[34px] font-extrabold text-[#13364A]">
              {place.name}
            </h2>
            {/* Tag tỉnh thành tách riêng khỏi hàng loại hình, đặt cùng dòng tiêu đề và bấm lọc theo tỉnh */}
            {place.province && (
              <Link
                to={`${CLIENT_ROUTES.EXPLORE}?province=${encodeURIComponent(place.province.code)}`}
                title={`Xem các địa điểm tại ${place.province.name}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#F1F5F8] px-3 py-1.5 text-[12px] font-semibold text-[#475569] transition-colors hover:bg-[#E2EBF0]"
              >
                <Icon name="map" className="text-[15px] text-[#0891B2]" />
                {place.province.name}
              </Link>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#72818C]">
            <Icon name="location_on" className="shrink-0 text-[16px] text-[#0891B2]" />
            <span className="min-w-0 flex-1">{place.address ?? 'Chưa cập nhật địa chỉ'}</span>
            {/* Nút sao chép nhanh địa chỉ */}
            {place.address && (
              <button
                type="button"
                onClick={() => void copyAddress()}
                title="Sao chép địa chỉ"
                aria-label="Sao chép địa chỉ"
                className="flex shrink-0 items-center gap-1 rounded-full bg-[#EDF4F6] px-2.5 py-1 text-[11px] font-bold text-[#0E7490] transition-colors hover:bg-[#D9EEF2] active:scale-95"
              >
                <Icon name="content_copy" className="text-[13px]" />
                Sao chép
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {/* Hàng tag chỉ chứa loại hình: loại đại diện (index 0) nổi đậm #0891B2, các loại phụ dùng nền xanh nhạt đồng tông */}
            {(place.categories ?? (place.category ? [place.category] : [])).map(
              (type, idx) =>
                type && (
                  <Link
                    key={type.code}
                    to={`${CLIENT_ROUTES.EXPLORE}?type=${encodeURIComponent(type.code)}`}
                    title={
                      idx === 0
                        ? `Loại hình đại diện · Xem các địa điểm ${type.name}`
                        : `Xem các địa điểm ${type.name}`
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${
                      idx === 0
                        ? 'bg-[#0891B2] text-white shadow-xs hover:bg-[#0E7490]'
                        : 'bg-[#E7F8FA] text-[#0E7490] hover:bg-[#D2F2F6]'
                    }`}
                  >
                    <Icon name="sell" filled={idx === 0} className="text-[14px]" />
                    {type.name}
                  </Link>
                ),
            )}
          </div>

          <h2 className="mt-7 mb-3 text-[17px] font-extrabold text-[#13364A]">
            Giới thiệu điểm đến
          </h2>
          <p
            className={`text-[13px] leading-[20px] text-[#4F5F6B] ${introExpanded ? '' : 'line-clamp-3'}`}
          >
            {detail.description ?? 'Chưa có mô tả cho địa điểm này.'}
          </p>
          {detail.description && detail.description.length > 140 && (
            <button
              type="button"
              onClick={() => setIntroExpanded((value) => !value)}
              className="mt-1.5 flex items-center text-[12px] font-bold text-[#0891B2]"
            >
              {introExpanded ? 'Thu gọn' : 'Xem thêm'}
              <Icon name={introExpanded ? 'expand_less' : 'expand_more'} className="text-[18px]" />
            </button>
          )}

          {/* Chuyển bản đồ sang cột trái ngay dưới Giới thiệu — dùng hoàn toàn Goong Maps */}
          <PlaceDirectionsMap
            placeId={place.id}
            placeName={place.name}
            address={place.address}
            latitude={detail.latitude}
            longitude={detail.longitude}
            isAuthenticated={Boolean(user)}
            onRequireLogin={() =>
              navigate(CLIENT_ROUTES.LOGIN, {
                state: { from: `${location.pathname}${location.search}` },
              })
            }
            directionsSignal={directionsSignal}
          />
        </div>

        <div className="min-w-0">
          <h2 className="mt-7 mb-3 text-[17px] font-extrabold text-[#13364A] md:mt-0">
            Thông tin thực tế
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3EDFF] text-[#3B6FD8]">
                  <Icon name="schedule" className="text-[19px]" />
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    openNow ? 'bg-[#ECFDF5] text-[#0F766E]' : 'bg-[#FEF2F2] text-[#B91C1C]'
                  }`}
                >
                  {openNow ? 'Đang mở' : 'Đóng cửa'}
                </span>
              </div>
              <p className="mt-2.5 text-[11px] text-[#72818C]">Giờ mở cửa hôm nay</p>
              <p className="mt-0.5 truncate text-[16px] font-extrabold text-[#13364A]">
                {todayHoursLabel(detail)}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-[#8793AB]">
                {DAY_LABELS[todayOfWeek() - 1]}
              </p>
            </div>
            {/* Thẻ Điện thoại: có số thì bấm gọi trực tiếp qua tel: */}
            <div className="rounded-2xl bg-white p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D8F7EC] text-[#13936B]">
                <Icon name="call" className="text-[19px]" />
              </span>
              <p className="mt-2.5 text-[11px] text-[#72818C]">Điện thoại</p>
              {detail.phone ? (
                <a
                  href={`tel:${detail.phone.replace(/\s+/g, '')}`}
                  className="mt-0.5 block truncate text-[16px] font-extrabold text-[#13364A] transition-colors hover:text-[#0891B2] hover:underline"
                >
                  {detail.phone}
                </a>
              ) : (
                <p className="mt-0.5 truncate text-[16px] font-extrabold text-[#13364A]">
                  Chưa cập nhật
                </p>
              )}
            </div>
            {/* Thẻ Website: có link thì mở tab mới */}
            <div className="rounded-2xl bg-white p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECE6FF] text-[#6F52D9]">
                <Icon name="language" className="text-[19px]" />
              </span>
              <p className="mt-2.5 text-[11px] text-[#72818C]">Website</p>
              {detail.website ? (
                <a
                  href={detail.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 inline-flex max-w-full items-center gap-1 text-[16px] font-extrabold text-[#13364A] transition-colors hover:text-[#0891B2] hover:underline"
                >
                  <span className="truncate">{websiteLabel(detail.website)}</span>
                  <Icon name="open_in_new" className="shrink-0 text-[14px]" />
                </a>
              ) : (
                <p className="mt-0.5 truncate text-[16px] font-extrabold text-[#13364A]">
                  Chưa cập nhật
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-white p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFEBD6] text-[#D7791A]">
                <Icon name="payments" className="text-[19px]" />
              </span>
              <p className="mt-2.5 text-[11px] text-[#72818C]">Giá tham khảo</p>
              <p className="mt-0.5 truncate text-[16px] font-extrabold text-[#13364A]">
                {cheapestPriceLabel(detail)}
              </p>
            </div>
          </div>

          <h2 className="mt-7 mb-3 text-[17px] font-extrabold text-[#13364A]">Thời tiết hôm nay</h2>
          <TodayWeatherCard placeId={place.id} />

          <h2 className="mt-7 mb-3 text-[17px] font-extrabold text-[#13364A]">
            Bảng giá tham khảo
          </h2>
          <div className="rounded-2xl bg-white p-4">
            {detail.prices.length === 0 ? (
              <p className="text-[12.5px] text-[#72818C]">Chưa có thông tin giá.</p>
            ) : (
              <ul className="divide-y divide-[#EEF1F4]">
                {detail.prices.map((price, index) => (
                  <li
                    key={`${price.priceType}-${index}`}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <span className="text-[12.5px] text-[#4F5F6B]">
                      {price.description ?? PRICE_LABELS[price.priceType] ?? 'Giá'}
                    </span>
                    <span
                      className={`shrink-0 text-[13.5px] font-extrabold ${
                        price.amount === 0 ? 'text-[#13936B]' : 'text-[#13364A]'
                      }`}
                    >
                      {formatVnd(price.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#8793AB]">
              <Icon name="info" className="text-[14px]" />
              Giá tham khảo, có thể thay đổi theo thời điểm.
            </p>
          </div>

          <h2 className="mt-7 mb-3 text-[17px] font-extrabold text-[#13364A]">Giờ mở cửa</h2>
          <div className="rounded-2xl bg-white p-4">
            {detail.openingHours.length === 0 ? (
              <p className="flex items-center gap-2 text-[13px] font-bold text-[#0891B2]">
                <Icon name="all_inclusive" className="text-[18px]" />
                Mở cả ngày, tất cả các ngày trong tuần
              </p>
            ) : (
              <ul className="divide-y divide-[#EEF1F4]">
                {[...detail.openingHours]
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((hour) => {
                    const today = hour.dayOfWeek === todayOfWeek();
                    return (
                      <li
                        key={hour.dayOfWeek}
                        className={`flex items-center justify-between py-2 text-[12.5px] first:pt-0 last:pb-0 ${
                          today ? 'font-extrabold text-[#0891B2]' : 'text-[#4F5F6B]'
                        }`}
                      >
                        <span>
                          {DAY_LABELS[hour.dayOfWeek - 1]}
                          {today && ' (hôm nay)'}
                        </span>
                        <span className={hour.closed ? 'text-[#C2412D]' : undefined}>
                          {hour.closed ? 'Đóng cửa' : `${hour.openTime} - ${hour.closeTime}`}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>

          <div className="fixed inset-x-0 bottom-[62px] z-20 flex items-center gap-2.5 border-t border-[#E6E9EE] bg-white px-4 py-3 md:static md:mt-5 md:rounded-[20px] md:border-0">
            <button
              type="button"
              onClick={() => setDirectionsSignal((count) => count + 1)}
              aria-label="Chỉ đường bằng Goong Maps"
              title="Chỉ đường bằng Goong Maps"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EBEDFF] text-[#405A82] transition-colors hover:bg-[#DCE0FF]"
            >
              <Icon name="directions" className="text-[22px]" />
            </button>
            <button
              type="button"
              onClick={() => setSaved((value) => !value)}
              aria-label="Lưu địa điểm"
              aria-pressed={saved}
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                saved ? 'bg-[#C0F5FB] text-[#0891B2]' : 'bg-[#EBEDFF] text-[#405A82]'
              }`}
            >
              <Icon name="bookmark" filled={saved} className="text-[22px]" />
            </button>
            <button
              type="button"
              onClick={() => showNotice(`Đã thêm "${place.name}" vào chuyến đi của bạn.`)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#0E7490] text-[15px] font-bold text-white shadow-md hover:bg-client-primary-strong"
            >
              <Icon name="add_circle" className="text-[21px]" />
              Thêm vào Chuyến đi
            </button>
          </div>
        </div>
      </div>

      {/* Neo #place-reviews để bấm vào badge số sao trên ảnh sẽ cuộn mượt xuống đây */}
      <div id="place-reviews" className="mt-7 scroll-mt-24">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[19px] font-extrabold text-[#13364A]">Đánh giá địa điểm</h2>
          <span className="flex items-center gap-1.5 text-[15px] font-bold text-[#13364A]">
            <Icon name="star" filled className="text-[18px] text-[#E0A100]" />
            {place.rating ?? 'Mới'}
            {place.rating !== null && (
              <span className="text-[12.5px] font-normal text-[#72818C]">
                ({place.reviewCount})
              </span>
            )}
          </span>
        </div>

        {user ? (
          <StopReviewCard
            placeId={place.id}
            stopTitle={place.name}
            onSubmitted={() => {
              setReviewsPage(1);
              setReviewsVersion((version) => version + 1);
            }}
          />
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-5">
            <p className="text-[14px] text-[#72818C]">
              Đăng nhập để viết đánh giá cho địa điểm này.
            </p>
            <Link
              to={CLIENT_ROUTES.LOGIN}
              className="shrink-0 rounded-full bg-[#0E7490] px-5 py-2.5 text-[13.5px] font-bold text-white"
            >
              Đăng nhập
            </Link>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {reviewsLoading ? (
            <Spinner />
          ) : reviewsError ? (
            <FormAlert message={`Không tải được đánh giá: ${reviewsError}`} />
          ) : reviews.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-center text-[14px] text-[#72818C]">
              Chưa có đánh giá nào cho địa điểm này. Hãy là người đầu tiên!
            </p>
          ) : (
            // Mỗi lần khách đi (kể cả đi lại) là một đánh giá riêng — hiện đủ, kể cả của chính mình.
            reviews.map((review) => (
              <ReviewCard
                key={review.reviewId}
                review={review}
                onOpenImage={(urls, idx) => setLightbox({ images: urls, index: idx })}
                menu={
                  review.userId === user?.id
                    ? undefined
                    : {
                        reported: reportedIds.has(review.reviewId),
                        onReport: () => startReport(review),
                      }
                }
              />
            ))
          )}
        </div>

        {reviewsTotal > REVIEWS_PAGE_SIZE && (
          <div className="mt-4 overflow-hidden rounded-[22px] bg-white">
            <Pagination
              page={reviewsPage}
              pageSize={REVIEWS_PAGE_SIZE}
              totalItems={reviewsTotal}
              itemLabel="đánh giá"
              pageSizeOptions={[REVIEWS_PAGE_SIZE]}
              onPageChange={setReviewsPage}
              onPageSizeChange={() => {}}
              showSummary={false}
            />
          </div>
        )}
      </div>

      <NoticeToast message={notice} />
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          index={lightbox.index}
          onChange={(next) => setLightbox((prev) => (prev ? { ...prev, index: next } : null))}
          onClose={() => setLightbox(null)}
        />
      )}
      {reporting && placeId && (
        <ReportReviewDialog
          placeId={placeId}
          review={reporting}
          onClose={() => setReporting(null)}
          onReported={() => {
            setReportedIds((ids) => new Set(ids).add(reporting.reviewId));
            setReporting(null);
            showNotice('Đã gửi báo cáo. Cảm ơn bạn! Admin sẽ xem xét và báo kết quả.');
          }}
        />
      )}
    </div>
  );
}
