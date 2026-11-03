import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { type PartnerAd, PARTNER_ADS } from '@/client/traveller/demoData';

const SLIDE_TIME_MS = 4500;

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <p className="mb-1 text-[10px] font-extrabold tracking-[0.18em] text-client-teal">
          {eyebrow}
        </p>
        <h2 className="text-[20px] font-extrabold text-client-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-[11px] text-client-muted">{subtitle}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="flex items-center rounded-full bg-[#E8F5EF] px-3 py-2 text-[11px] font-bold text-primary"
        >
          {action.label}
          <Icon name="chevron_right" className="text-[16px]" />
        </button>
      )}
    </div>
  );
}

/** Banner quảng cáo tự chạy (theo PartnerBannerCarousel của mobile) */
function BannerCarousel({ onOpen }: { onOpen: (ad: PartnerAd) => void }) {
  const slides = PARTNER_ADS.slice(0, 4);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      SLIDE_TIME_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const ad = slides[index];
  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <button
        type="button"
        onClick={() => onOpen(ad)}
        aria-label={`Quảng cáo ${ad.name}, ${ad.offer}`}
        className="relative block h-[292px] w-full overflow-hidden rounded-[23px] bg-[#173D36] text-left shadow-md md:h-[360px]"
      >
        <img src={ad.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 flex flex-col justify-between bg-black/20">
          <div className="flex items-center justify-between p-4">
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-[10px] font-extrabold text-primary">
              <Icon name="campaign" className="text-[14px]" /> QUẢNG CÁO ĐỐI TÁC
            </span>
            <span className="rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white">
              {index + 1} / {slides.length}
            </span>
          </div>
          <div className="mx-3 mb-3 rounded-[20px] bg-[rgba(9,39,36,0.92)] p-4 md:mx-5 md:mb-5 md:max-w-lg">
            <p className="mb-2 flex items-center gap-1 text-[10px] font-bold tracking-widest text-[#A7E9DB]">
              {ad.category.toUpperCase()} ·
              <Icon name="location_on" className="text-[13px] text-[#E1F2EC]" />
              <span className="truncate font-normal tracking-normal text-[#E1F2EC]">
                {ad.location}
              </span>
            </p>
            <p className="text-[24px] leading-[29px] font-extrabold text-white">{ad.headline}</p>
            <p className="mt-1 truncate text-[11px] text-[#D8EFE7]">
              {ad.name} · {ad.tagline}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full bg-[#F8E4B4] px-3 py-2 text-[11px] font-extrabold text-[#795213]">
                {ad.offer}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white px-4 py-2.5 text-[11px] font-extrabold text-primary">
                Khám phá ngay <Icon name="north_east" className="text-[15px]" />
              </span>
            </div>
          </div>
        </div>
      </button>
      <div className="mt-2 flex justify-center gap-1">
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setIndex(slideIndex)}
            aria-label={`Xem quảng cáo ${slideIndex + 1}`}
            className="flex h-6 items-center px-1"
          >
            <span
              className={`h-[7px] rounded-full transition-all ${
                slideIndex === index ? 'w-6 bg-primary' : 'w-[7px] bg-[#CDDCD5]'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function OfferCard({
  ad,
  saved,
  onOpen,
  onToggleSave,
}: {
  ad: PartnerAd;
  saved: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
}) {
  return (
    <div className="relative w-[239px] shrink-0 overflow-hidden rounded-[20px] bg-white shadow-sm">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative">
          <img src={ad.image} alt="" className="h-[141px] w-full object-cover" />
          <span className="absolute top-3 left-3 rounded-full bg-[#FFF1CC] px-2.5 py-1.5 text-[10px] font-extrabold text-[#835500]">
            {ad.offer}
          </span>
          <span className="absolute bottom-2 left-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold text-white">
            Tài trợ
          </span>
        </div>
        <div className="px-3 pt-3 pb-4">
          <p className="text-[10px] font-bold text-client-teal">{ad.category.toUpperCase()}</p>
          <p className="mt-1 truncate text-[15px] font-extrabold text-client-ink">{ad.name}</p>
          <p className="mt-1 flex items-center gap-0.5 text-[11px] text-client-muted">
            <Icon name="location_on" className="text-[13px]" />
            <span className="flex-1 truncate">{ad.location}</span>
            <Icon name="star" filled className="text-[13px] text-[#EAA93E]" />
            <span className="font-bold text-client-ink">{ad.rating}</span>
          </p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              {ad.oldPrice && (
                <p className="text-[10px] text-[#A3ACA8] line-through">{ad.oldPrice}</p>
              )}
              <p className="text-[17px] font-extrabold text-primary">{ad.price}</p>
            </div>
            <span className="rounded-full bg-[#E6F5EF] px-3 py-2 text-[11px] font-bold text-primary">
              Xem deal →
            </span>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={onToggleSave}
        aria-label={saved ? 'Bỏ lưu ưu đãi' : 'Lưu ưu đãi'}
        className="absolute top-2.5 right-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/95"
      >
        <Icon
          name="favorite"
          filled={saved}
          className={`text-[19px] ${saved ? 'text-[#E65C61]' : 'text-primary'}`}
        />
      </button>
    </div>
  );
}

function PartnerRow({ ad, onOpen }: { ad: PartnerAd; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full gap-3 overflow-hidden rounded-2xl bg-white p-2.5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md"
    >
      <img src={ad.image} alt="" className="h-[92px] w-[98px] shrink-0 rounded-xl object-cover" />
      <div className="flex flex-1 flex-col justify-between py-1">
        <div>
          <div className="flex justify-between text-[10px]">
            <span className="font-semibold text-client-teal">{ad.badge}</span>
            <span className="text-client-muted">Quảng cáo</span>
          </div>
          <p className="mt-1 truncate text-[14px] font-extrabold text-client-ink">{ad.name}</p>
          <p className="mt-1 truncate text-[11px] text-client-muted">
            {ad.category} · {ad.location}
          </p>
        </div>
        <p className="flex items-center gap-1 text-[11px]">
          <Icon name="star" filled className="text-[13px] text-[#EAA93E]" />
          <span className="font-bold text-client-ink">{ad.rating}</span>
          <span className="ml-1 flex-1 font-semibold text-primary">{ad.offer}</span>
          <Icon name="north_east" className="text-[17px] text-primary" />
        </p>
      </div>
    </button>
  );
}

/** Khu quảng cáo đối tác trên trang chủ (dữ liệu demo, giống mobile) */
export default function PartnerShowcase({ onOpen }: { onOpen: (ad: PartnerAd) => void }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const toggleSaved = (id: string) =>
    setSavedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));

  return (
    <section className="mt-8">
      <SectionHeading
        eyebrow="SMARTTRAVEL PARTNERS · TÀI TRỢ"
        title="Đặc quyền từ đối tác"
        subtitle="Ưu đãi dành riêng cho chuyến đi của bạn"
      />
      <BannerCarousel onOpen={onOpen} />

      <div className="mt-6">
        <SectionHeading
          eyebrow="HOT DEALS"
          title="Ưu đãi đang nổi bật"
          subtitle="Chọn ưu đãi phù hợp với ngân sách"
        />
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pt-1 pb-3">
          {PARTNER_ADS.map((ad) => (
            <OfferCard
              key={ad.id}
              ad={ad}
              saved={savedIds.includes(ad.id)}
              onOpen={() => onOpen(ad)}
              onToggleSave={() => toggleSaved(ad.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-7">
        <SectionHeading
          eyebrow="PARTNER SPOTLIGHT"
          title="Đối tác đáng khám phá"
          subtitle="Những địa điểm và dịch vụ đang giới thiệu"
          action={{
            label: showAll ? 'Thu gọn' : 'Xem tất cả',
            onClick: () => setShowAll((v) => !v),
          }}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {(showAll ? PARTNER_ADS : PARTNER_ADS.slice(0, 3)).map((ad) => (
            <PartnerRow key={ad.id} ad={ad} onOpen={() => onOpen(ad)} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-[23px] bg-primary px-5 py-5 md:flex-row md:items-center md:px-8">
        <div className="flex-1">
          <p className="text-[10px] font-extrabold tracking-[0.15em] text-[#B7E7DA]">
            DÀNH CHO ĐỐI TÁC
          </p>
          <p className="mt-2 text-[19px] leading-[25px] font-extrabold text-white">
            Đưa thương hiệu của bạn đến nhiều du khách hơn
          </p>
          <p className="mt-2 text-[11px] leading-[17px] text-[#D6F0E9]">
            Giới thiệu dịch vụ lưu trú, ẩm thực và trải nghiệm ngay trên SmartTravel.
          </p>
        </div>
        <Link
          to={CLIENT_ROUTES.PARTNER}
          className="flex items-center justify-center gap-1.5 rounded-full bg-white px-6 py-3.5 text-[12px] font-extrabold text-primary hover:bg-client-pale"
        >
          Trở thành đối tác <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      </div>
      <p className="mt-3 text-center text-[10px] leading-[15px] text-[#98A6A1]">
        Quảng cáo, giá, lượt đánh giá và ưu đãi trên màn hình này là dữ liệu demo.
      </p>
    </section>
  );
}
