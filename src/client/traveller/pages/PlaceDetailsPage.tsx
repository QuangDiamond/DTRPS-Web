import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { ClientApiError, errorMessage } from '@/client/api/http';
import { placesApi } from '@/client/api/placesApi';
import type { PlaceDetail } from '@/client/api/types';
import { CLIENT_ROUTES } from '@/client/routePaths';
import FavoriteButton from '@/client/traveller/components/FavoriteButton';
import TravelMap from '@/client/traveller/components/TravelMap';
import { useTraveller } from '@/client/traveller/travellerContext';
import { FormAlert, Spinner } from '@/client/ui/Blocks';
import { NoticeToast } from '@/client/ui/Overlay';
import { useNotice } from '@/client/ui/useNotice';
import PageBar, { BarIconButton } from '@/client/ui/PageBar';

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')}đ`;
}

function todayHoursLabel(detail: PlaceDetail): string {
  const isoDay = new Date().getDay(); // 0 = Chủ nhật … 6 = Thứ 7
  const dayOfWeek = isoDay === 0 ? 7 : isoDay;
  const today = detail.openingHours.find((hour) => hour.dayOfWeek === dayOfWeek);
  if (!today) return 'Chưa cập nhật';
  if (today.closed) return 'Đóng cửa hôm nay';
  return today.openTime && today.closeTime ? `${today.openTime} - ${today.closeTime}` : 'Cả ngày';
}

function cheapestPriceLabel(detail: PlaceDetail): string {
  if (detail.prices.length === 0) return 'Liên hệ';
  const cheapest = [...detail.prices].sort((a, b) => a.amount - b.amount)[0];
  return `Từ ${formatVnd(cheapest.amount)}`;
}

function websiteLabel(website: string | null): string {
  if (!website) return 'Chưa cập nhật';
  try {
    return new URL(website).hostname;
  } catch {
    return website;
  }
}

const googleMapsUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

/** Chi tiết điểm đến — gọi GET /api/places/{id} (công khai, chỉ ACTIVE) */
export default function PlaceDetailsPage() {
  const { placeId } = useParams();
  const { favorites, toggleFavorite } = useTraveller();
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [introExpanded, setIntroExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, showNotice] = useNotice();

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

  if (notFound) {
    return (
      <div className="flex flex-col items-center rounded-[20px] bg-white px-6 py-14 text-center">
        <Icon name="location_off" className="text-[48px] text-[#72818C]" />
        <p className="mt-3 text-[16px] font-bold text-[#13364A]">Không tìm thấy địa điểm</p>
        <Link
          to={CLIENT_ROUTES.EXPLORE}
          className="mt-5 rounded-full bg-[#E9EBFF] px-6 py-3 text-[13px] font-semibold text-[#334E68]"
        >
          Quay lại Khám phá
        </Link>
      </div>
    );
  }

  if (loadError) {
    return <FormAlert message={`Không tải được địa điểm: ${loadError}`} />;
  }

  if (!detail) return <Spinner />;

  const place = detail.summary;
  const favorite = favorites.includes(String(place.id));
  const gallery = detail.images.length > 0 ? detail.images : null;

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

  const locationQuery = `${place.name} ${place.province?.name ?? ''}`;

  return (
    <div className="pb-24 md:pb-4">
      <PageBar
        title="Chi Tiết Điểm Đến"
        backTo={CLIENT_ROUTES.EXPLORE}
        actions={<BarIconButton icon="share" label="Chia sẻ" onClick={() => void share()} />}
      />

      <div className="md:grid md:grid-cols-[1.4fr_1fr] md:gap-6">
        <div>
          <div className="relative h-60 overflow-hidden rounded-[24px] bg-[#CFE9E6] md:h-80">
            {place.coverUrl ? (
              <img
                src={place.coverUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon name="image" className="text-[48px] text-white/70" />
              </div>
            )}
            <div className="absolute inset-0 flex flex-col justify-between bg-linear-to-b from-black/15 via-transparent to-black/30 p-3.5">
              <div className="flex items-start justify-end">
                <FavoriteButton
                  active={favorite}
                  onToggle={() => toggleFavorite(String(place.id))}
                  className="h-10 w-10"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[13px] font-extrabold text-[#13364A]">
                  <Icon name="star" filled className="text-[16px] text-[#E0A100]" />
                  {place.rating ?? 'Mới'}
                  {place.rating !== null && (
                    <span className="text-[11px] font-normal text-[#72818C]">
                      ({place.reviewCount})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start justify-between gap-2">
            <h2 className="flex-1 text-[28px] leading-[34px] font-extrabold text-[#13364A]">
              {place.name}
            </h2>
          </div>
          <p className="mt-1 flex items-start gap-1 text-[12px] text-[#72818C]">
            <Icon name="location_on" className="text-[16px] text-[#087A78]" />
            {place.address ?? 'Chưa cập nhật địa chỉ'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {/* Tag loại hình — bấm để xem các địa điểm cùng loại ở trang Khám phá */}
            {(place.categories ?? (place.category ? [place.category] : [])).map(
              (type, index) =>
                type && (
                  <Link
                    key={type.code}
                    to={`${CLIENT_ROUTES.EXPLORE}?type=${encodeURIComponent(type.code)}`}
                    title={`Xem các địa điểm ${type.name}`}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      index === 0
                        ? 'bg-[#087A78] text-white hover:bg-[#06615F]'
                        : 'border border-[#9FD8D1] bg-white text-[#087A78] hover:bg-[#E8F9F4]'
                    }`}
                  >
                    <Icon name="sell" className="text-[15px]" />
                    {type.name}
                  </Link>
                ),
            )}
            {place.province && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#EBEDFF] px-3 py-1.5 text-[11px] font-semibold text-[#36546A]">
                <Icon name="map" className="text-[15px] text-[#4A7091]" />
                {place.province.name}
              </span>
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
              className="mt-1.5 flex items-center text-[12px] font-bold text-[#087A78]"
            >
              {introExpanded ? 'Thu gọn' : 'Xem thêm'}
              <Icon name={introExpanded ? 'expand_less' : 'expand_more'} className="text-[18px]" />
            </button>
          )}

          {gallery && gallery.length > 1 && (
            <>
              <h2 className="mt-7 mb-3 text-[17px] font-extrabold text-[#13364A]">Hình ảnh</h2>
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
                {gallery.map((image) => (
                  <img
                    key={image.url}
                    src={image.url}
                    alt=""
                    className="h-[110px] w-[168px] shrink-0 rounded-2xl bg-[#CFE9E6] object-cover"
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <h2 className="mt-7 mb-3 text-[17px] font-extrabold text-[#13364A] md:mt-0">
            Thông tin thực tế
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3EDFF] text-[#3B6FD8]">
                <Icon name="schedule" className="text-[19px]" />
              </span>
              <p className="mt-2.5 text-[11px] text-[#72818C]">Giờ mở cửa hôm nay</p>
              <p className="mt-0.5 truncate text-[16px] font-extrabold text-[#13364A]">
                {todayHoursLabel(detail)}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-[#8793AB]">
                {DAY_LABELS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D8F7EC] text-[#13936B]">
                <Icon name="call" className="text-[19px]" />
              </span>
              <p className="mt-2.5 text-[11px] text-[#72818C]">Điện thoại</p>
              <p className="mt-0.5 truncate text-[16px] font-extrabold text-[#13364A]">
                {detail.phone ?? 'Chưa cập nhật'}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ECE6FF] text-[#6F52D9]">
                <Icon name="language" className="text-[19px]" />
              </span>
              <p className="mt-2.5 text-[11px] text-[#72818C]">Website</p>
              <p className="mt-0.5 truncate text-[16px] font-extrabold text-[#13364A]">
                {websiteLabel(detail.website)}
              </p>
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

          <div className="mt-7 mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-extrabold text-[#13364A]">Vị trí & Đường đi</h2>
          </div>
          <div className="relative overflow-hidden rounded-[20px]">
            <TravelMap
              className="h-[180px]"
              center={[detail.latitude, detail.longitude]}
              points={[
                {
                  id: String(place.id),
                  coordinate: [detail.latitude, detail.longitude],
                  label: '•',
                  title: place.name,
                },
              ]}
              activeId={String(place.id)}
            />
            <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-[400] flex items-center justify-between gap-2">
              <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-[#13364A]/80 px-3 py-1.5 text-[11px] font-bold text-white">
                <Icon name="near_me" className="text-[15px]" />
                <span className="truncate">{place.name}</span>
              </span>
              <a
                href={googleMapsUrl(locationQuery)}
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#13364A]"
              >
                Mở Bản Đồ <Icon name="open_in_new" className="text-[14px]" />
              </a>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-[62px] z-20 flex items-center gap-2.5 border-t border-[#E6E9EE] bg-white px-4 py-3 md:static md:mt-5 md:rounded-[20px] md:border-0">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationQuery)}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Chỉ đường"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EBEDFF] text-[#405A82]"
            >
              <Icon name="directions" className="text-[22px]" />
            </a>
            <button
              type="button"
              onClick={() => setSaved((value) => !value)}
              aria-label="Lưu địa điểm"
              aria-pressed={saved}
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                saved ? 'bg-[#C3F8F0] text-[#087A78]' : 'bg-[#EBEDFF] text-[#405A82]'
              }`}
            >
              <Icon name="bookmark" filled={saved} className="text-[22px]" />
            </button>
            <button
              type="button"
              onClick={() => showNotice(`Đã thêm "${place.name}" vào chuyến đi của bạn.`)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#006C64] text-[15px] font-bold text-white shadow-md hover:bg-primary-container"
            >
              <Icon name="add_circle" className="text-[21px]" />
              Thêm vào Chuyến đi
            </button>
          </div>
        </div>
      </div>
      <NoticeToast message={notice} />
    </div>
  );
}
