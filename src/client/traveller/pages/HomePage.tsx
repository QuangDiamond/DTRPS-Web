import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { CLIENT_ROUTES } from '@/client/routePaths';

/** Trang chủ du khách — theo HomeScreen của app mobile */
export default function HomePage() {
  const { user } = useClientAuth();
  const [query, setQuery] = useState('');
  const [note, setNote] = useState<string | null>(null);

  const navigate = useNavigate();

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = query.trim();
    navigate(
      keyword
        ? `${CLIENT_ROUTES.EXPLORE}?${new URLSearchParams({ q: keyword })}`
        : CLIENT_ROUTES.EXPLORE,
    );
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
          to={CLIENT_ROUTES.TRIP_PLAN}
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
        <Link
          to={CLIENT_ROUTES.EXPLORE_FILTERS}
          aria-label="Bộ lọc"
          className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-client-soft text-primary"
        >
          <Icon name="tune" className="text-[20px]" />
        </Link>
      </form>
      {note && <p className="mt-2 text-[11px] text-client-muted">{note}</p>}

      <div className="relative mt-4 h-56 overflow-hidden rounded-2xl bg-linear-to-br from-[#075C66] to-[#0E8C86] md:h-72">
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8">
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
            to={CLIENT_ROUTES.TRIP_PLAN}
            className="self-start rounded-full bg-primary px-5 py-3 text-[12px] font-bold text-white hover:bg-primary-container"
          >
            Lập kế hoạch chuyến đi →
          </Link>
        </div>
      </div>

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
          to={CLIENT_ROUTES.PREFERENCES}
          className="flex h-11 items-center justify-center rounded-full bg-primary px-6 text-[13px] font-bold text-white md:w-56"
        >
          Thiết lập sở thích
        </Link>
      </div>
    </div>
  );
}
