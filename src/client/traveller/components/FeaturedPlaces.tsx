import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigationType } from 'react-router-dom';
import { Icon } from '@/components/common';
import { adApi, type FeaturedPlace } from '@/client/api/adApi';
import { placePath } from '@/client/routePaths';

const ROTATE_MS = 3000;

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

interface FeaturedHeroProps {
  /** Nội dung cột trái Hero (~46%): lời chào, tìm kiếm, nút lập kế hoạch, thống kê. */
  children: ReactNode;
  /** Hiển thị ở cột phải khi chưa có quảng cáo đối tác nào đang chạy. */
  fallbackRight?: ReactNode;
}

/**
 * Khối Hero trang chủ trên nền xanh thương hiệu #0891B2:
 * - Trái (~46%): lời chào, tìm kiếm, nút AI và thống kê.
 * - Phải (~54%): thẻ ảnh quảng cáo đối tác tỷ lệ 16:10, tự chuyển slide mỗi 6 giây
 *   (dừng khi rê chuột, nút ⏸/< >, chấm slide, nhớ slide khi quay lại từ trang chi tiết).
 * - Nếu chưa có quảng cáo nào đang chạy thì hiện lại collage địa điểm mới.
 */
export default function FeaturedPlaces({ children, fallbackRight }: FeaturedHeroProps) {
  const [places, setPlaces] = useState<FeaturedPlace[]>([]);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);
  const location = useLocation();
  const navigationType = useNavigationType();
  const sectionRef = useRef<HTMLElement>(null);
  // Quay lại từ trang chi tiết (nút quay lại → /#featured, hoặc nút Back của trình duyệt)
  const returning = useRef(location.hash === BACK_TO.slice(1) || navigationType === 'POP');

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
    }
    window.requestAnimationFrame(() =>
      sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' }),
    );
  }, [places, location.hash]);

  // Tự chuyển slide cố định mỗi 3 giây (tạm dừng khi rê chuột vào ảnh hoặc bấm nút ⏸)
  useEffect(() => {
    if (places.length < 2 || hovered || stopped) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % places.length);
    }, ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [places.length, index, hovered, stopped]);

  const current = places.length > 0 ? places[Math.min(index, places.length - 1)] : null;
  const go = (next: number) => {
    setIndex((next + places.length) % places.length);
  };

  return (
    <section
      ref={sectionRef}
      id={SECTION_ID}
      className="relative scroll-mt-24 rounded-[32px] bg-[#0891B2] p-5 md:p-8 lg:p-10"
    >
      {/* Trang trí nền xanh nằm trong khung overflow-hidden riêng để không cắt dropdown tìm kiếm */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]"
        aria-hidden
      >
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-white/8" />
        <div className="absolute -right-16 -bottom-28 h-80 w-80 rounded-full bg-[#2FBAC9]/20" />
      </div>

      <div className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)] lg:gap-8">
        <div>{children}</div>

        {current ? (
          <div
            aria-roledescription="carousel"
            aria-label="Đối tác nổi bật"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-[#0B2230] shadow-[0_18px_40px_rgba(4,42,56,0.32)] ring-1 ring-white/20"
          >
            {/* Ảnh đối tác đúng tỷ lệ 16:10, chuyển slide mượt */}
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
                  <div className="flex h-full items-center justify-center bg-[#0E7490]">
                    <Icon name="storefront" className="text-[72px] text-white/40" />
                  </div>
                )}
              </div>
            ))}

            {/* Chỉ phủ tối nhẹ ở viền trên và dưới để giữ nguyên màu ảnh sáng rõ ở giữa */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/82 via-black/20 to-black/25" />

            {/* Bấm trực tiếp vào ảnh để mở chi tiết */}
            <Link
              to={placePath(String(current.id))}
              state={DETAIL_STATE}
              onClick={() => rememberOpened(current.id)}
              tabIndex={-1}
              aria-hidden
              className="absolute inset-0 cursor-pointer"
            />

            {/* Hàng trên: badge quảng cáo bên trái + nút điều khiển slide bên phải */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4 md:p-5 [&_button]:pointer-events-auto">
              <div className="flex flex-wrap gap-1.5">
                <span className="flex items-center gap-1 rounded-full bg-[#FFC94D] px-2.5 py-1 text-[11px] font-extrabold text-[#4A3300] shadow">
                  <Icon name="campaign" filled className="text-[14px]" />
                  Được tài trợ
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#1F5FBF] shadow">
                  <Icon name="verified" filled className="text-[14px]" />
                  Đối tác đã xác minh
                </span>
              </div>

              {places.length > 1 && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStopped((value) => !value)}
                    aria-pressed={stopped}
                    aria-label={stopped ? 'Tiếp tục tự chuyển' : 'Dừng tự chuyển'}
                    title={stopped ? 'Tiếp tục tự chuyển' : 'Dừng tự chuyển'}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/65"
                  >
                    <Icon name={stopped ? 'play_arrow' : 'pause'} className="text-[18px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(index - 1)}
                    aria-label="Đối tác trước"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/65"
                  >
                    <Icon name="chevron_left" className="text-[18px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(index + 1)}
                    aria-label="Đối tác tiếp theo"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/65"
                  >
                    <Icon name="chevron_right" className="text-[18px]" />
                  </button>
                </div>
              )}
            </div>

            {/* Hàng dưới: thông tin địa điểm + nút Khám phá ngay + chấm chuyển slide */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 md:p-6 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
              <p className="text-[12px] font-semibold text-white/85">
                {[current.category, current.province].filter(Boolean).join(' · ') ||
                  'Địa điểm du lịch'}
              </p>
              <h2 className="mt-0.5 line-clamp-2 text-[22px] leading-[1.18] font-extrabold tracking-tight text-white md:text-[28px]">
                <Link
                  to={placePath(String(current.id))}
                  state={DETAIL_STATE}
                  onClick={() => rememberOpened(current.id)}
                  className="hover:underline"
                >
                  {current.name}
                </Link>
              </h2>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {current.rating !== null ? (
                    <span className="flex items-center gap-1 rounded-full bg-white/18 px-3 py-1.5 text-[12px] font-bold text-white backdrop-blur-sm">
                      <Icon name="star" filled className="text-[16px] text-[#FFC94D]" />
                      {current.rating}
                      <span className="font-normal text-white/80">
                        ({current.reviewCount} đánh giá)
                      </span>
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/18 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm">
                      Mới trên SmartTravel
                    </span>
                  )}

                  <Link
                    to={placePath(String(current.id))}
                    state={DETAIL_STATE}
                    onClick={() => rememberOpened(current.id)}
                    className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-extrabold text-[#0E7490] shadow-lg transition-transform hover:scale-[1.03]"
                  >
                    Khám phá ngay
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </Link>
                </div>

                {places.length > 1 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5" role="tablist" aria-label="Chọn đối tác">
                      {places.map((place, i) => (
                        <button
                          key={place.id}
                          type="button"
                          role="tab"
                          aria-selected={i === index}
                          aria-label={place.name}
                          onClick={() => go(i)}
                          className={`h-1.5 rounded-full transition-all ${
                            i === index ? 'w-6 bg-[#FFC94D]' : 'w-2.5 bg-white/45 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-white/80 tabular-nums">
                      {index + 1}/{places.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          fallbackRight
        )}
      </div>
    </section>
  );
}
