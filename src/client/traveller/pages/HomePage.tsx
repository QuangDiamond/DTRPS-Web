import { type FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import PartnerShowcase from '@/client/traveller/components/PartnerShowcase';
import { HERO_IMAGE, HOME_CATEGORIES, type PartnerAd } from '@/client/traveller/demoData';

/** Hộp thoại chi tiết quảng cáo (mobile dùng Alert) */
function AdDialog({ ad, onClose }: { ad: PartnerAd; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ad.name}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white"
      >
        <img src={ad.image} alt="" className="h-48 w-full object-cover" />
        <div className="p-5">
          <p className="text-[10px] font-bold text-client-teal">
            {ad.category.toUpperCase()} · {ad.location}
          </p>
          <p className="mt-1 text-[20px] font-extrabold text-client-ink">{ad.name}</p>
          <p className="mt-2 text-[13px] text-client-muted">{ad.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="rounded-full bg-[#F8E4B4] px-3 py-1.5 text-[11px] font-extrabold text-[#795213]">
              {ad.offer}
            </span>
            <span className="text-[17px] font-extrabold text-primary">Từ {ad.price}</span>
          </div>
          <p className="mt-4 text-[11px] text-[#98A6A1]">Đây là quảng cáo minh họa.</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 h-11 w-full rounded-full bg-primary text-[13px] font-bold text-white"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/** Trang chủ du khách — theo HomeScreen của app mobile */
export default function HomePage() {
  const { user } = useClientAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [openAd, setOpenAd] = useState<PartnerAd | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNote(`Tìm kiếm "${query.trim() || '…'}" sẽ có khi màn Khám phá được nối API.`);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-bold text-client-ink md:text-[24px]">
            Xin chào, {user?.name ?? 'Traveller'} 👋
          </h1>
          <p className="mt-1 text-[11px] text-client-muted md:text-[13px]">
            Khám phá Việt Nam theo cách riêng của bạn
          </p>
        </div>
        <Link
          to={CLIENT_ROUTES.TRIPS}
          aria-label="Lập kế hoạch chuyến đi"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-client-soft text-primary"
        >
          <Icon name="explore" filled className="text-[21px]" />
        </Link>
      </div>

      <form
        onSubmit={search}
        className="mt-4 flex items-center rounded-2xl bg-white px-3 py-2 shadow-[0_2px_6px_rgba(0,0,0,0.05)]"
      >
        <Icon name="search" className="text-[23px] text-primary" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Bạn muốn đi đâu ở Việt Nam hôm nay?"
          className="ml-2 h-9 flex-1 bg-transparent text-[13px] text-client-ink placeholder:text-[#87918F] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setNote('Tìm kiếm giọng nói sẽ tích hợp ở giai đoạn tiếp theo.')}
          aria-label="Tìm kiếm giọng nói"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-client-soft text-primary"
        >
          <Icon name="mic" className="text-[20px]" />
        </button>
        <button
          type="button"
          onClick={() => setNote('Bộ lọc sẽ có khi màn Khám phá được nối API.')}
          aria-label="Bộ lọc"
          className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-client-soft text-primary"
        >
          <Icon name="tune" className="text-[20px]" />
        </button>
      </form>
      {note && <p className="mt-2 text-[11px] text-client-muted">{note}</p>}

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3">
        {HOME_CATEGORIES.map((item) => {
          const active = category === item.label;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setCategory(item.label)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold ${
                active ? 'bg-primary text-white' : 'bg-white text-client-ink'
              }`}
            >
              <Icon
                name={item.icon}
                className={`text-[16px] ${active ? 'text-white' : 'text-primary'}`}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="relative h-56 overflow-hidden rounded-2xl md:h-72">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 flex flex-col justify-end bg-black/45 p-5 md:p-8">
          <span className="mb-2 self-start rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-primary">
            ⭐ Tự thiết kế lộ trình
          </span>
          <p className="max-w-xl text-[21px] leading-7 font-extrabold text-white md:text-[30px] md:leading-9">
            Tạo lịch trình mơ ước trong tích tắc
          </p>
          <p className="mt-1 mb-3 text-[11px] text-white md:text-[13px]">
            Tùy biến lịch trình trải nghiệm theo sở thích và ngân sách
          </p>
          <Link
            to={CLIENT_ROUTES.TRIPS}
            className="self-start rounded-full bg-primary px-5 py-3 text-[12px] font-bold text-white hover:bg-primary-container"
          >
            Lập kế hoạch chuyến đi →
          </Link>
        </div>
      </div>

      <PartnerShowcase onOpen={setOpenAd} />

      <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.05)] md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex-1">
            <p className="text-[14px] font-bold text-client-ink">Hoàn thiện sở thích du lịch</p>
            <p className="mt-1 text-[12px] text-client-muted">để nhận gợi ý phù hợp hơn</p>
          </div>
          <span className="flex h-16 w-20 items-center justify-center rounded-2xl bg-[#E3F7F3]">
            <Icon name="person_pin_circle" className="text-[30px] text-client-teal" />
          </span>
        </div>
        <Link
          to={CLIENT_ROUTES.PROFILE}
          className="flex h-11 items-center justify-center rounded-full bg-primary px-6 text-[13px] font-bold text-white md:w-56"
        >
          Thiết lập sở thích
        </Link>
      </div>

      {openAd && <AdDialog ad={openAd} onClose={() => setOpenAd(null)} />}
    </div>
  );
}
