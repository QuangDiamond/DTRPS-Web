import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { Icon } from '@/components/common';
import { adApi, type FeaturedPlace } from '@/client/api/adApi';
import { placePath } from '@/client/routePaths';

const ROTATE_MS = 6000;
/** Người dùng vừa bấm / chuyển slide → dừng tự chuyển chừng này rồi chạy tiếp */
const HOLD_MS = 10000;

/** Neo của khu này trên trang chủ: trang chi tiết bấm "quay lại" về đúng đây */
const SECTION_ID = 'featured';
const BACK_TO = `/#${SECTION_ID}`;
/** Địa điểm vừa mở từ khu này (theo tab) — quay lại thì hiện lại đúng slide đó */
const LAST_OPENED_KEY = 'smarttravel.home.featuredOpened';
const RESTORE_WITHIN_MS = 30 * 60_000;
/** state gửi sang trang chi tiết để nút quay lại về khu này */
const DETAIL_STATE = { from: BACK_TO };

function rememberOpened(placeId: number): void {
  try {
    window.sessionStorage.setItem(LAST_OPENED_KEY, JSON.stringify({ placeId, at: Date.now() }));
  } catch {
    // storage bị chặn: quay lại vẫn về đúng khu, chỉ không nhớ slide
  }
}

/** Lấy (và xoá) địa điểm vừa mở nếu còn mới */
function takeOpened(): number | null {
  try {
    const raw = window.sessionStorage.getItem(LAST_OPENED_KEY);
    window.sessionStorage.removeItem(LAST_OPENED_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'placeId' in parsed &&
      typeof parsed.placeId === 'number' &&
      'at' in parsed &&
      typeof parsed.at === 'number' &&
      Date.now() - parsed.at < RESTORE_WITHIN_MS
    ) {
      return parsed.placeId;
    }
  } catch {
    // bỏ qua
  }
  return null;
}

/**
 * Khu quảng cáo của đối tác ở trang chủ: một slide lớn tự chuyển + danh sách bên cạnh.
 * Không có quảng cáo nào đang chạy thì ẩn cả khu.
 *
 * Tự chuyển mỗi 6 giây, kể cả khi máy tắt hiệu ứng chuyển động (khi đó chỉ bỏ hiệu ứng mờ/phóng,
 * vẫn đổi slide). Dừng khi rê chuột vào, tạm dừng 10 giây sau mỗi lần bấm, và có nút ⏸/▶ để người
 * dùng tự dừng (WCAG 2.2.2). Bấm ảnh/tên slide lớn hoặc bấm lại thẻ đang chọn → mở chi tiết.
 */
export default function FeaturedPlaces() {
  const [places, setPlaces] = useState<FeaturedPlace[]>([]);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const holdUntil = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const sectionRef = useRef<HTMLElement>(null);
  // Quay lại từ trang chi tiết (nút quay lại → /#featured, hoặc nút Back của trình duyệt)
  const returning = useRef(location.hash === BACK_TO.slice(1) || navigationType === 'POP');
  const hold = useCallback(() => {
    holdUntil.current = Date.now() + HOLD_MS;
  }, []);

  useEffect(() => {
    // Vào trang chủ theo đường khác (menu, logo…): bỏ dấu cũ để lần F5 sau không tự cuộn xuống
    if (!returning.current) takeOpened();
    let active = true;
    adApi
      .featured(8)
      .then((items) => active && setPlaces(items))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Vừa quay lại: hiện đúng slide đã mở và cuộn tới khu này (sau khi tải xong danh sách)
  useEffect(() => {
    if (places.length === 0 || !returning.current) return;
    returning.current = false;
    const openedId = takeOpened();
    const fromHash = location.hash === BACK_TO.slice(1);
    if (openedId === null && !fromHash) return;
    const at = places.findIndex((place) => place.id === openedId);
    if (at >= 0) {
      setIndex(at);
      holdUntil.current = Date.now() + HOLD_MS;
    }
    window.requestAnimationFrame(() =>
      sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' }),
    );
  }, [places, location.hash]);

  // Tự chuyển slide; dừng khi rê chuột vào khu, khi người dùng bấm dừng, và tạm dừng sau mỗi lần bấm
  useEffect(() => {
    if (places.length < 2 || hovered || stopped) return;
    const timer = window.setInterval(() => {
      if (Date.now() < holdUntil.current) return;
      setIndex((current) => (current + 1) % places.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [places.length, hovered, stopped]);

  if (places.length === 0) return null;

  const current = places[Math.min(index, places.length - 1)];
  const go = (next: number) => {
    hold();
    setIndex((next + places.length) % places.length);
  };
  const open = (id: number) => {
    rememberOpened(id);
    navigate(placePath(String(id)), { state: DETAIL_STATE });
  };

  return (
    <section
      ref={sectionRef}
      id={SECTION_ID}
      className="mt-10 scroll-mt-24"
      aria-roledescription="carousel"
      aria-label="Đối tác nổi bật"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={hold}
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.18em] text-[#B07A00] uppercase">
            <Icon name="workspace_premium" filled className="text-[16px]" />
            Đối tác nổi bật
          </p>
          <h2 className="mt-1 text-[21px] font-extrabold tracking-tight text-client-ink md:text-[28px]">
            Điểm đến được đối tác giới thiệu
          </h2>
        </div>
        {places.length > 1 && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setStopped((value) => !value)}
              aria-pressed={stopped}
              aria-label={stopped ? 'Tiếp tục tự chuyển' : 'Dừng tự chuyển'}
              title={stopped ? 'Tiếp tục tự chuyển' : 'Dừng tự chuyển'}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-client-line bg-white text-client-ink shadow-sm hover:bg-client-pale"
            >
              <Icon name={stopped ? 'play_arrow' : 'pause'} className="text-[22px]" />
            </button>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Đối tác trước"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-client-line bg-white text-client-ink shadow-sm hover:bg-client-pale"
            >
              <Icon name="chevron_left" className="text-[22px]" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Đối tác tiếp theo"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-client-line bg-white text-client-ink shadow-sm hover:bg-client-pale"
            >
              <Icon name="chevron_right" className="text-[22px]" />
            </button>
          </div>
        )}
      </div>

      <div
        className={`grid gap-4 ${places.length > 1 ? 'lg:grid-cols-[minmax(0,1fr)_340px]' : ''}`}
      >
        {/* SLIDE LỚN */}
        <div className="relative h-[380px] overflow-hidden rounded-[28px] bg-[#0F2A3B] shadow-[0_18px_40px_rgba(8,47,73,0.25)] md:h-[480px]">
          {places.map((place, i) => (
            <div
              key={place.id}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-all duration-700 ease-out motion-reduce:transition-none ${
                i === index
                  ? 'scale-100 opacity-100'
                  : 'pointer-events-none scale-105 opacity-0 motion-reduce:scale-100'
              }`}
            >
              {place.coverUrl ? (
                <img
                  src={place.coverUrl}
                  alt={place.name}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#0891B2]">
                  <Icon name="storefront" className="text-[80px] text-white/40" />
                </div>
              )}
            </div>
          ))}

          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/10" />
          {/* Bấm vào ảnh mở chi tiết; bàn phím đã có link ở tên + nút "Khám phá ngay" */}
          <Link
            to={placePath(String(current.id))}
            state={DETAIL_STATE}
            onClick={() => rememberOpened(current.id)}
            tabIndex={-1}
            aria-hidden
            className="absolute inset-0 cursor-pointer"
          />

          <div className="pointer-events-none absolute top-4 left-4 flex flex-wrap gap-2 md:top-6 md:left-6">
            <span className="flex items-center gap-1 rounded-full bg-[#FFC94D] px-3 py-1 text-[11px] font-extrabold text-[#4A3300] shadow">
              <Icon name="campaign" filled className="text-[15px]" />
              Được tài trợ
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#1F5FBF] shadow">
              <Icon name="verified" filled className="text-[15px]" />
              Đối tác đã xác minh
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 md:p-8 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
            <p className="text-[12px] font-semibold text-white/85 md:text-[14px]">
              {[current.category, current.province].filter(Boolean).join(' · ') ||
                'Địa điểm du lịch'}
            </p>
            <h3 className="mt-1 line-clamp-2 max-w-3xl text-[28px] leading-[1.15] font-extrabold tracking-tight text-white md:text-[44px]">
              <Link
                to={placePath(String(current.id))}
                state={DETAIL_STATE}
                onClick={() => rememberOpened(current.id)}
                className="hover:underline"
              >
                {current.name}
              </Link>
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {current.rating !== null ? (
                <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-bold text-white backdrop-blur">
                  <Icon name="star" filled className="text-[17px] text-[#FFC94D]" />
                  {current.rating}
                  <span className="font-normal text-white/75">
                    ({current.reviewCount} đánh giá)
                  </span>
                </span>
              ) : (
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur">
                  Mới trên SmartTravel
                </span>
              )}
              <Link
                to={placePath(String(current.id))}
                state={DETAIL_STATE}
                onClick={() => rememberOpened(current.id)}
                className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13px] font-extrabold text-[#0E7490] shadow-lg transition-transform hover:scale-[1.03]"
              >
                Khám phá ngay
                <Icon name="arrow_forward" className="text-[18px]" />
              </Link>
            </div>

            {places.length > 1 && (
              <div className="mt-5 flex gap-1.5" role="tablist" aria-label="Chọn đối tác">
                {places.map((place, i) => (
                  <button
                    key={place.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={place.name}
                    onClick={() => go(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? 'w-8 bg-white' : 'w-3 bg-white/45 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DANH SÁCH ĐỐI TÁC BÊN CẠNH (cuộn ngang trên điện thoại) */}
        {places.length > 1 && (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 lg:mx-0 lg:max-h-[480px] lg:flex-col lg:overflow-y-auto lg:px-0 lg:pb-0">
            {places.map((place, i) => (
              <button
                key={place.id}
                type="button"
                // Thẻ đang chọn: bấm lần nữa mở chi tiết; thẻ khác: đưa lên slide lớn
                onClick={() => (i === index ? open(place.id) : go(i))}
                aria-current={i === index}
                title={i === index ? 'Xem chi tiết địa điểm' : 'Xem trên slide lớn'}
                className={`flex w-[250px] shrink-0 items-center gap-3 rounded-2xl border bg-white p-2.5 text-left transition-all lg:w-full ${
                  i === index
                    ? 'border-[#E0A100] shadow-[0_6px_18px_rgba(176,122,0,0.18)]'
                    : 'border-client-line hover:border-[#C8D8DA]'
                }`}
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-client-field">
                  {place.coverUrl ? (
                    <img
                      src={place.coverUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-client-muted">
                      <Icon name="storefront" className="text-[26px]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] font-bold leading-4.25 text-client-ink">
                    {place.name}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-client-muted">
                    {place.province ?? place.category ?? 'Địa điểm du lịch'}
                  </p>
                  {i === index && (
                    <p className="mt-0.5 flex items-center gap-0.5 text-[11px] font-bold text-[#0E7490]">
                      Xem chi tiết <Icon name="arrow_forward" className="text-[13px]" />
                    </p>
                  )}
                </div>
                <Icon
                  name="verified"
                  filled
                  className={`shrink-0 text-[18px] ${i === index ? 'text-[#1F5FBF]' : 'text-[#B9C7D6]'}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
