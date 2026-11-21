import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { ClientApiError } from '@/client/api/http';
import { placesApi } from '@/client/api/placesApi';
import { referenceApi } from '@/client/api/referenceApi';
import { tripFlowApi, type TravelPlanResponse } from '@/client/api/tripFlowApi';
import type { PlaceSummary } from '@/client/api/types';
import { CLIENT_ROUTES, placePath } from '@/client/routePaths';
import FeaturedPlaces from '@/client/traveller/components/FeaturedPlaces';
import HomePlaceSearch from '@/client/traveller/components/HomePlaceSearch';
import HorizontalScrollRow from '@/client/traveller/components/HorizontalScrollRow';

const DAY_MS = 86_400_000;

/** Ngày hôm nay theo giờ máy, dạng yyyy-MM-dd (cùng định dạng startDate/endDate của plan). */
const todayIso = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

const dayDiff = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

/** Chuyến đi gần nhất còn chưa kết thúc: đang diễn ra trước, sau đó tới ngày đi sớm nhất. */
const pickUpcoming = (plans: TravelPlanResponse[]) => {
  const today = todayIso();
  return (
    plans
      .filter(
        (plan) =>
          (plan.status === 'IN_PROGRESS' || plan.status === 'PLANNED' || plan.status === 'DRAFT') &&
          plan.endDate >= today,
      )
      .sort((a, b) => {
        if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
        if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1;
        return a.startDate.localeCompare(b.startDate);
      })[0] ?? null
  );
};

const STEPS = [
  {
    icon: 'tune',
    title: 'Cho chúng tôi biết bạn thích gì',
    text: 'Chọn điểm đến, ngân sách, người đi cùng và kiểu trải nghiệm bạn mong muốn.',
  },
  {
    icon: 'auto_awesome',
    title: 'AI gợi ý kèm % phù hợp',
    text: 'Mỗi địa điểm có độ phù hợp và lý do được gợi ý, bạn tự do thêm hay bỏ.',
  },
  {
    icon: 'route',
    title: 'Lịch trình tự chia theo ngày',
    text: 'Hệ thống sắp xếp thứ tự, giờ giấc và cảnh báo nếu một ngày quá dày.',
  },
];

function HeroCollage({ places }: { places: PlaceSummary[] }) {
  const photos = places.filter((place) => place.coverUrl).slice(0, 3);
  if (photos.length < 3) return null;

  return (
    <div className="hidden h-[400px] grid-cols-2 grid-rows-2 gap-3 lg:grid">
      {photos.map((place, i) => (
        <Link
          key={place.id}
          to={placePath(String(place.id))}
          className={`group relative overflow-hidden rounded-3xl shadow-[0_14px_30px_rgba(0,0,0,0.25)] ${
            i === 0 ? 'row-span-2' : ''
          }`}
        >
          <img
            src={place.coverUrl ?? ''}
            alt={place.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <p className="absolute right-3 bottom-3 left-3 truncate text-[13px] font-bold text-white">
            {place.name}
            {place.province?.name && (
              <span className="block text-[11px] font-medium text-white/80">
                {place.province.name}
              </span>
            )}
          </p>
        </Link>
      ))}
    </div>
  );
}

function UpcomingTrip({ loggedIn }: { loggedIn: boolean }) {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TravelPlanResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!loggedIn) return;
    let active = true;
    tripFlowApi
      .plans()
      .then((plans) => active && setPlan(pickUpcoming(plans)))
      .catch(() => undefined)
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [loggedIn]);

  const open = async (target: TravelPlanResponse) => {
    setOpening(true);
    try {
      await tripFlowApi.activeItinerary(target.planId);
      navigate(`${CLIENT_ROUTES.ITINERARY}?planId=${target.planId}`);
    } catch (caught) {
      // Chưa có lịch trình: về bước chọn địa điểm của kế hoạch.
      if (caught instanceof ClientApiError && caught.status === 404) {
        navigate(`${CLIENT_ROUTES.TRIP_PLAN_SELECTED}?planId=${target.planId}`);
      } else {
        navigate(CLIENT_ROUTES.TRIPS);
      }
    } finally {
      setOpening(false);
    }
  };

  const shell =
    'relative flex min-h-[210px] flex-col overflow-hidden rounded-[24px] bg-white p-5 shadow-[0_4px_16px_rgba(19,27,46,0.06)] md:p-6';

  if (!loggedIn || (loaded && !plan)) {
    return (
      <div className={shell}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-client-pale text-client-teal">
          <Icon name="luggage" className="text-[26px]" />
        </span>
        <p className="mt-4 text-[17px] font-extrabold text-client-ink">
          {loggedIn ? 'Chưa có chuyến đi nào sắp tới' : 'Lưu và theo dõi chuyến đi của bạn'}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-client-muted">
          {loggedIn
            ? 'Tạo một kế hoạch mới, SmartTravel sẽ gợi ý địa điểm và chia lịch trình giúp bạn.'
            : 'Đăng nhập để tạo kế hoạch, nhận gợi ý cá nhân hóa và xem lịch trình theo ngày.'}
        </p>
        <Link
          to={loggedIn ? CLIENT_ROUTES.TRIP_PLAN : CLIENT_ROUTES.LOGIN}
          className="mt-auto flex items-center gap-1.5 self-start rounded-full bg-client-primary px-5 py-2.5 text-[12px] font-bold text-white hover:bg-client-primary-strong"
        >
          {loggedIn ? 'Tạo chuyến đi' : 'Đăng nhập'}
          <Icon name="arrow_forward" className="text-[17px]" />
        </Link>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className={shell} role="status" aria-label="Đang tải chuyến đi">
        <div className="h-5 w-40 animate-pulse rounded-full bg-client-field" />
        <div className="mt-4 h-8 w-2/3 animate-pulse rounded-full bg-client-field" />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-client-field" />
      </div>
    );
  }

  const today = todayIso();
  const totalDays = dayDiff(plan.startDate, plan.endDate) + 1;
  const untilStart = dayDiff(today, plan.startDate);
  const ongoing = untilStart <= 0;
  const dayNumber = Math.min(totalDays, dayDiff(plan.startDate, today) + 1);

  return (
    <div className={`${shell} bg-[#EDF7F9]`}>
      <Icon
        name="flight_takeoff"
        className="pointer-events-none absolute -right-4 -bottom-6 text-[150px] text-[#0E7490]/6"
      />
      <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.16em] text-client-teal uppercase">
        <Icon name="event_upcoming" className="text-[16px]" />
        {ongoing ? 'Đang diễn ra' : 'Chuyến đi sắp tới'}
      </p>
      <p className="mt-2 line-clamp-1 text-[22px] font-extrabold tracking-tight text-client-ink md:text-[26px]">
        {plan.destination}
      </p>
      <p className="line-clamp-1 text-[12px] text-client-muted">{plan.title}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-semibold text-client-ink">
        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-sm">
          <Icon name="calendar_month" className="text-[16px] text-client-teal" />
          {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-sm">
          <Icon name="group" className="text-[16px] text-client-teal" />
          {plan.groupSize} người
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
        <p className="text-client-ink">
          {ongoing ? (
            <>
              <span className="text-[30px] font-extrabold">Ngày {dayNumber}</span>
              <span className="text-[13px] text-client-muted"> / {totalDays}</span>
            </>
          ) : (
            <>
              <span className="text-[13px] text-client-muted">Còn </span>
              <span className="text-[30px] font-extrabold">{untilStart}</span>
              <span className="text-[13px] text-client-muted"> ngày nữa</span>
            </>
          )}
        </p>
        <button
          type="button"
          disabled={opening}
          onClick={() => void open(plan)}
          className="relative flex items-center gap-1.5 rounded-full bg-client-primary px-5 py-2.5 text-[12px] font-bold text-white hover:bg-client-primary-strong disabled:cursor-wait disabled:opacity-70"
        >
          {opening ? 'Đang mở…' : 'Xem chuyến đi'}
          <Icon name="arrow_forward" className="text-[17px]" />
        </button>
      </div>
    </div>
  );
}

/** Đếm số tăng dần mượt từ 0 lên giá trị thật trong ~0.8s (dùng cho thống kê Hero) */
function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || value <= 0) {
      setShown(value);
      return;
    }
    const duration = 800;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease-out cubic: tăng nhanh lúc đầu rồi chậm dần về đích
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(value * eased));
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return (
    <>
      {shown}
      {suffix}
    </>
  );
}

/** Hiện mượt từng khối trên Trang chủ (fade + trượt lên 16px) khi người dùng cuộn tới */
function RevealSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out motion-reduce:transition-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Trang chủ du khách */
export default function HomePage() {
  const { user } = useClientAuth();
  const [recent, setRecent] = useState<PlaceSummary[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [placeTotal, setPlaceTotal] = useState<number | null>(null);
  const [provinceCount, setProvinceCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    // Mặc định API sắp theo ngày cập nhật mới nhất.
    placesApi
      .list({ page: 0, size: 12 })
      .then((result) => {
        if (!active) return;
        setRecent(result.items);
        setPlaceTotal(result.total);
      })
      .catch(() => undefined)
      .finally(() => active && setLoadingRecent(false));
    referenceApi
      .provinces()
      .then((items) => active && setProvinceCount(items.length))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () =>
      [
        placeTotal !== null && {
          icon: 'place',
          value: <CountUp value={placeTotal} suffix="+" />,
          label: 'địa điểm',
        },
        provinceCount !== null && {
          icon: 'map',
          value: <CountUp value={provinceCount} />,
          label: 'tỉnh thành',
        },
        { icon: 'auto_awesome', value: 'AI', label: 'gợi ý theo sở thích' },
      ].filter(Boolean) as { icon: string; value: ReactNode; label: string }[],
    [placeTotal, provinceCount],
  );

  return (
    <div className="pb-6">
      {/* HERO: quảng cáo đối tác tràn nền (tự chuyển) + lời chào, tìm kiếm, lập kế hoạch; không có quảng cáo thì quay về nền xanh + collage */}
      <FeaturedPlaces fallbackRight={<HeroCollage places={recent} />}>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/95 backdrop-blur-sm">
            Xin chào, {user?.name ?? 'bạn'} 👋
          </span>
          <h1 className="mt-4 text-[30px] leading-[1.15] font-extrabold tracking-tight text-white md:text-[46px]">
            Việt Nam theo cách
            <br />
            <span className="text-[#97EBF4]">của riêng bạn</span>
          </h1>
          <p className="mt-3 max-w-lg text-[13px] leading-6 text-white/85 md:text-[15px]">
            Tìm địa điểm, nhận gợi ý cá nhân hóa và để SmartTravel sắp xếp lịch trình theo sở thích,
            ngân sách của bạn.
          </p>

          <div className="max-w-xl">
            <HomePlaceSearch />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {/* Nút CTA chính có vệt sáng lướt (.btn-shine trong index.css) */}
            <Link
              to={CLIENT_ROUTES.TRIP_PLAN}
              className="btn-shine flex items-center gap-1.5 rounded-full bg-white px-5 py-3 text-[13px] font-extrabold text-[#0E7490] shadow-lg transition-transform hover:bg-[#EFFDFF] active:scale-95"
            >
              <Icon name="auto_awesome" className="text-[18px]" />
              Lập kế hoạch với AI
            </Link>
            <Link
              to={CLIENT_ROUTES.EXPLORE}
              className="flex items-center gap-1.5 rounded-full border border-white/40 bg-black/15 px-5 py-3 text-[13px] font-bold text-white backdrop-blur-sm hover:bg-white/15"
            >
              Khám phá địa điểm
              <Icon name="arrow_forward" className="text-[18px]" />
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 text-white">
                <Icon name={stat.icon} className="text-[20px] text-[#97EBF4]" />
                <span className="text-[20px] font-extrabold">{stat.value}</span>
                <span className="text-[12px] text-white/80">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </FeaturedPlaces>

      {/* CHUYẾN ĐI SẮP TỚI + SỞ THÍCH (tự hiện mượt khi cuộn tới) */}
      <RevealSection>
        <section className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <UpcomingTrip loggedIn={Boolean(user)} />

          <div className="relative flex min-h-[210px] flex-col overflow-hidden rounded-[24px] bg-[#FFF6E0] p-5 md:p-6">
            <Icon
              name="favorite"
              filled
              className="pointer-events-none absolute -right-3 -bottom-5 text-[130px] text-[#D79B00]/12"
            />
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-client-gold shadow-sm">
              <Icon name="person_pin_circle" className="text-[26px]" />
            </span>
            <p className="mt-4 text-[17px] font-extrabold text-client-ink">
              Hoàn thiện sở thích du lịch
            </p>
            <p className="mt-1 max-w-sm text-[12px] leading-5 text-[#6B5A35]">
              Càng hiểu bạn, gợi ý càng sát: chế độ ăn, người đi cùng, nhu cầu đặc biệt…
            </p>
            <Link
              to={CLIENT_ROUTES.PREFERENCES}
              className="relative mt-auto flex items-center gap-1.5 self-start rounded-full bg-client-ink px-5 py-2.5 text-[12px] font-bold text-white hover:bg-black"
            >
              Thiết lập sở thích
              <Icon name="arrow_forward" className="text-[17px]" />
            </Link>
          </div>
        </section>
      </RevealSection>

      {/* MỚI CÓ TRÊN SMARTTRAVEL (hiện khung xương shimmer trong lúc chờ API) */}
      {(loadingRecent || recent.length > 0) && (
        <RevealSection>
          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold tracking-[0.18em] text-client-teal uppercase">
                  Vừa cập nhật
                </p>
                <h2 className="mt-1 text-[21px] font-extrabold tracking-tight text-client-ink md:text-[28px]">
                  Mới có trên SmartTravel
                </h2>
              </div>
              <Link
                to={CLIENT_ROUTES.EXPLORE}
                className="flex shrink-0 items-center gap-1 text-[13px] font-bold text-client-primary hover:underline"
              >
                Xem tất cả
                <Icon name="arrow_forward" className="text-[17px]" />
              </Link>
            </div>
            {loadingRecent ? (
              <div className="flex gap-3.5 overflow-hidden pb-1">
                {Array.from({ length: 5 }, (_, idx) => (
                  <div
                    key={idx}
                    className="w-[220px] shrink-0 overflow-hidden rounded-[20px] bg-white shadow-[0_3px_10px_rgba(19,27,46,0.06)] md:w-[250px]"
                  >
                    <div className="shimmer h-[150px] w-full" />
                    <div className="space-y-2 p-3">
                      <div className="shimmer h-3.5 w-3/4 rounded-full" />
                      <div className="shimmer h-3 w-1/2 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <HorizontalScrollRow>
                {recent.map((place) => (
                  <Link
                    key={place.id}
                    to={placePath(String(place.id))}
                    className="group w-[220px] shrink-0 overflow-hidden rounded-[20px] bg-white shadow-[0_3px_10px_rgba(19,27,46,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(8,47,73,0.14)] md:w-[250px]"
                  >
                    <div className="relative h-[150px] overflow-hidden bg-client-field">
                      {place.coverUrl ? (
                        <img
                          src={place.coverUrl}
                          alt={place.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-client-muted">
                          <Icon name="landscape" className="text-[34px]" />
                        </div>
                      )}
                      {place.category?.name && (
                        <span className="absolute bottom-2 left-2 max-w-[85%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#0E7490]">
                          {place.category.name}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-[13px] font-bold text-client-ink">{place.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-client-muted">
                        <Icon name="location_on" className="text-[14px]" />
                        {place.province?.name ?? 'Việt Nam'}
                      </p>
                    </div>
                  </Link>
                ))}
              </HorizontalScrollRow>
            )}
          </section>
        </RevealSection>
      )}

      {/* CÁCH HOẠT ĐỘNG */}
      <RevealSection>
        <section className="mt-10 rounded-[28px] bg-white p-5 shadow-[0_4px_16px_rgba(19,27,46,0.05)] md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.18em] text-client-teal uppercase">
                Cách hoạt động
              </p>
              <h2 className="mt-1 text-[21px] font-extrabold tracking-tight text-client-ink md:text-[28px]">
                Lịch trình hoàn chỉnh chỉ với 3 bước
              </h2>
            </div>
            <Link
              to={CLIENT_ROUTES.TRIP_PLAN}
              className="flex items-center gap-1.5 self-start rounded-full bg-client-primary px-5 py-2.5 text-[12px] font-bold text-white hover:bg-client-primary-strong md:self-auto"
            >
              Bắt đầu ngay
              <Icon name="arrow_forward" className="text-[17px]" />
            </Link>
          </div>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative rounded-[20px] bg-client-field p-5">
                <span className="absolute top-4 right-5 text-[40px] leading-none font-extrabold text-[#0E7490]/10">
                  {i + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0E7490] text-white">
                  <Icon name={step.icon} className="text-[22px]" />
                </span>
                <p className="mt-4 text-[15px] font-extrabold text-client-ink">{step.title}</p>
                <p className="mt-1 text-[12px] leading-5 text-client-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </RevealSection>

      {/* MỜI ĐỐI TÁC */}
      <RevealSection>
        <section className="relative mt-10 overflow-hidden rounded-[28px] bg-client-ink px-5 py-8 md:px-10">
          <Icon
            name="storefront"
            className="pointer-events-none absolute -right-6 -bottom-10 text-[200px] text-white/5"
          />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.18em] text-[#FFC94D] uppercase">
                <Icon name="handshake" className="text-[16px]" />
                Dành cho doanh nghiệp
              </p>
              <p className="mt-2 text-[20px] font-extrabold text-white md:text-[26px]">
                Đưa địa điểm của bạn đến hàng nghìn du khách
              </p>
              <p className="mt-1 text-[13px] leading-6 text-white/70">
                Đăng ký đối tác, được xác minh và xuất hiện ở khu nổi bật trên trang chủ cùng gợi ý
                chuyến đi.
              </p>
            </div>
            {/* Nút CTA đối tác có vệt sáng lướt (.btn-shine trong index.css) */}
            <Link
              to={CLIENT_ROUTES.PARTNER}
              className="btn-shine flex shrink-0 items-center gap-1.5 self-start rounded-full bg-[#FFC94D] px-6 py-3 text-[13px] font-extrabold text-[#4A3300] transition-transform hover:bg-[#FFD772] active:scale-95 md:self-auto"
            >
              Trở thành đối tác
              <Icon name="arrow_forward" className="text-[18px]" />
            </Link>
          </div>
        </section>
      </RevealSection>
    </div>
  );
}
