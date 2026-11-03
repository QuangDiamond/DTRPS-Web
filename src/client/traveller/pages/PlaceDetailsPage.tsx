import { type ReactNode, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES } from '@/client/routePaths';
import FavoriteButton from '@/client/traveller/components/FavoriteButton';
import TravelMap from '@/client/traveller/components/TravelMap';
import { getPlace, type PlaceInfoItem } from '@/client/traveller/data/places';
import { useTraveller } from '@/client/traveller/travellerContext';
import { NoticeToast } from '@/client/ui/Overlay';
import { useNotice } from '@/client/ui/useNotice';
import PageBar, { BarIconButton } from '@/client/ui/PageBar';

const INFO_TONES: Record<PlaceInfoItem['tone'], string> = {
  blue: 'bg-[#E3EDFF] text-[#3B6FD8]',
  orange: 'bg-[#FFEBD6] text-[#D7791A]',
  green: 'bg-[#D8F7EC] text-[#13936B]',
  purple: 'bg-[#ECE6FF] text-[#6F52D9]',
};

function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="mt-7 mb-3 flex items-center justify-between">
      <h2 className="text-[17px] font-extrabold text-[#13364A]">{title}</h2>
      {right}
    </div>
  );
}

const googleMapsUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

/** Chi tiết điểm đến — theo PlaceDetailsScreen của mobile */
export default function PlaceDetailsPage() {
  const { placeId } = useParams();
  const place = getPlace(placeId);
  const { favorites, toggleFavorite } = useTraveller();
  const [introExpanded, setIntroExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, showNotice] = useNotice();

  if (!place) {
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

  const favorite = favorites.includes(place.id);

  const share = async () => {
    const text = `${place.name} - ${place.address}\nKhám phá cùng SmartTravel Vietnam AI ✨`;
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
        backTo={CLIENT_ROUTES.EXPLORE}
        actions={<BarIconButton icon="share" label="Chia sẻ" onClick={() => void share()} />}
      />

      <div className="md:grid md:grid-cols-[1.4fr_1fr] md:gap-6">
        <div>
          <div className="relative h-60 overflow-hidden rounded-[24px] bg-[#CFE9E6] md:h-80">
            <img src={place.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-between bg-linear-to-b from-black/15 via-transparent to-black/30 p-3.5">
              <div className="flex items-start justify-between">
                {place.badge ? (
                  <span className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#13364A]">
                    <Icon name="verified" filled className="text-[15px] text-[#C68B16]" />
                    {place.badge}
                  </span>
                ) : (
                  <span />
                )}
                <FavoriteButton
                  active={favorite}
                  onToggle={() => toggleFavorite(place.id)}
                  className="h-10 w-10"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[13px] font-extrabold text-[#13364A]">
                  <Icon name="star" filled className="text-[16px] text-[#E0A100]" />
                  {place.rating}
                  <span className="text-[11px] font-normal text-[#72818C]">
                    ({place.reviewCount})
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start justify-between gap-2">
            <h2 className="flex-1 text-[28px] leading-[34px] font-extrabold text-[#13364A]">
              {place.name}
            </h2>
            <span className="mt-1.5 rounded-full bg-[#C3F8F0] px-2.5 py-1 text-[10px] font-extrabold text-[#006D68]">
              {place.rank}
            </span>
          </div>
          <p className="mt-1 flex items-start gap-1 text-[12px] text-[#72818C]">
            <Icon name="location_on" className="text-[16px] text-[#087A78]" />
            {place.address}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {place.tags.map((tag) => (
              <span
                key={tag.label}
                className="flex items-center gap-1.5 rounded-full bg-[#EBEDFF] px-3 py-1.5 text-[11px] font-semibold text-[#36546A]"
              >
                <Icon name={tag.icon} className="text-[15px] text-[#4A7091]" />
                {tag.label}
              </span>
            ))}
          </div>

          <SectionHeader title="Giới thiệu điểm đến" />
          <p
            className={`text-[13px] leading-[20px] text-[#4F5F6B] ${introExpanded ? '' : 'line-clamp-3'}`}
          >
            {place.intro}
          </p>
          <button
            type="button"
            onClick={() => setIntroExpanded((value) => !value)}
            className="mt-1.5 flex items-center text-[12px] font-bold text-[#087A78]"
          >
            {introExpanded ? 'Thu gọn' : 'Xem thêm'}
            <Icon name={introExpanded ? 'expand_less' : 'expand_more'} className="text-[18px]" />
          </button>

          <SectionHeader
            title="Góc ảnh nổi tiếng"
            right={
              <span className="text-[12px] font-bold text-[#087A78]">
                {place.photoSpots.length} địa điểm con
              </span>
            }
          />
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            {place.photoSpots.map((spot) => (
              <a
                key={spot.name}
                href={googleMapsUrl(`${spot.name} ${place.location}`)}
                target="_blank"
                rel="noreferrer"
                className="w-[168px] shrink-0 overflow-hidden rounded-2xl bg-white hover:shadow-md"
              >
                <img
                  src={spot.image}
                  alt=""
                  className="h-[110px] w-full bg-[#CFE9E6] object-cover"
                />
                <div className="px-3 py-2.5">
                  <p className="truncate text-[14px] font-extrabold text-[#13364A]">{spot.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[#72818C]">{spot.subtitle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="mt-5 rounded-[20px] bg-linear-to-r from-[#D6FAF6] to-[#E7E9FF] p-3.5 md:mt-0">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#075C66]">
                <Icon name="auto_awesome" className="text-[18px] text-[#087A78]" />
                AI Thời Điểm Khám Phá
              </p>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#00766F]">
                {place.weather.status}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <Icon name={place.weather.icon} className="text-[34px] text-[#E0A100]" />
                <div className="min-w-0">
                  <p className="text-[22px] font-extrabold text-[#13364A]">
                    {place.weather.temperature}°C
                  </p>
                  <p className="truncate text-[11px] text-[#526C83]">{place.weather.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#526C83]">{place.weather.extraLabel}</p>
                <p className="text-[15px] font-extrabold text-[#13364A]">
                  {place.weather.extraValue}
                </p>
              </div>
            </div>
          </div>

          <SectionHeader title="Thông tin thực tế" />
          <div className="grid grid-cols-2 gap-3">
            {place.info.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white p-3.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${INFO_TONES[item.tone]}`}
                >
                  <Icon name={item.icon} className="text-[19px]" />
                </span>
                <p className="mt-2.5 text-[11px] text-[#72818C]">{item.label}</p>
                <p className="mt-0.5 truncate text-[16px] font-extrabold text-[#13364A]">
                  {item.value}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-[#8793AB]">{item.note}</p>
              </div>
            ))}
          </div>

          <SectionHeader
            title="Vị trí & Đường đi"
            right={<span className="text-[11px] text-[#72818C]">{place.map.distance}</span>}
          />
          <div className="relative overflow-hidden rounded-[20px]">
            <TravelMap
              className="h-[180px]"
              center={[place.map.latitude, place.map.longitude]}
              points={[
                {
                  id: place.id,
                  coordinate: [place.map.latitude, place.map.longitude],
                  label: '•',
                  title: place.map.landmark,
                },
              ]}
              activeId={place.id}
            />
            <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-[400] flex items-center justify-between gap-2">
              <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-[#13364A]/80 px-3 py-1.5 text-[11px] font-bold text-white">
                <Icon name="near_me" className="text-[15px]" />
                <span className="truncate">{place.map.landmark}</span>
              </span>
              <a
                href={googleMapsUrl(`${place.map.landmark} ${place.location}`)}
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
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                `${place.map.landmark} ${place.location}`,
              )}`}
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
