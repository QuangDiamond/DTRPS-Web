import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { adApi, type FeaturedPlace } from '@/client/api/adApi';
import { placePath } from '@/client/routePaths';

const ROTATE_MS = 6000;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Khu quảng cáo của đối tác ở trang chủ: một slide lớn tự chuyển + danh sách bên cạnh.
 * Không có quảng cáo nào đang chạy thì ẩn cả khu.
 */
export default function FeaturedPlaces() {
  const [places, setPlaces] = useState<FeaturedPlace[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let active = true;
    adApi
      .featured(8)
      .then((items) => active && setPlaces(items))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Tự chuyển slide; dừng khi rê chuột/focus vào khu hoặc người dùng tắt hiệu ứng chuyển động.
  useEffect(() => {
    if (places.length < 2 || paused || prefersReducedMotion()) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % places.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [places.length, paused]);

  if (places.length === 0) return null;

  const current = places[Math.min(index, places.length - 1)];
  const go = (next: number) => setIndex((next + places.length) % places.length);

  return (
    <section
      className="mt-10"
      aria-roledescription="carousel"
      aria-label="Đối tác nổi bật"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
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
        <div className="relative h-[380px] overflow-hidden rounded-[28px] bg-[#0B3B3F] shadow-[0_18px_40px_rgba(7,60,66,0.25)] md:h-[480px]">
          {places.map((place, i) => (
            <div
              key={place.id}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                i === index ? 'scale-100 opacity-100' : 'pointer-events-none scale-105 opacity-0'
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
                <div className="flex h-full items-center justify-center bg-linear-to-br from-[#075C66] to-[#0E8C86]">
                  <Icon name="storefront" className="text-[80px] text-white/40" />
                </div>
              )}
            </div>
          ))}

          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/10" />

          <div className="absolute top-4 left-4 flex flex-wrap gap-2 md:top-6 md:left-6">
            <span className="flex items-center gap-1 rounded-full bg-[#FFC94D] px-3 py-1 text-[11px] font-extrabold text-[#4A3300] shadow">
              <Icon name="campaign" filled className="text-[15px]" />
              Được tài trợ
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#1F5FBF] shadow">
              <Icon name="verified" filled className="text-[15px]" />
              Đối tác đã xác minh
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <p className="text-[12px] font-semibold text-white/85 md:text-[14px]">
              {[current.category, current.province].filter(Boolean).join(' · ') || 'Địa điểm du lịch'}
            </p>
            <h3 className="mt-1 line-clamp-2 max-w-3xl text-[28px] leading-[1.15] font-extrabold tracking-tight text-white md:text-[44px]">
              {current.name}
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {current.rating !== null ? (
                <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-bold text-white backdrop-blur">
                  <Icon name="star" filled className="text-[17px] text-[#FFC94D]" />
                  {current.rating}
                  <span className="font-normal text-white/75">({current.reviewCount} đánh giá)</span>
                </span>
              ) : (
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur">
                  Mới trên SmartTravel
                </span>
              )}
              <Link
                to={placePath(String(current.id))}
                className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13px] font-extrabold text-[#075C66] shadow-lg transition-transform hover:scale-[1.03]"
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
                onClick={() => go(i)}
                aria-current={i === index}
                className={`flex w-[250px] shrink-0 items-center gap-3 rounded-2xl border bg-white p-2.5 text-left transition-all lg:w-full ${
                  i === index
                    ? 'border-[#E0A100] shadow-[0_6px_18px_rgba(176,122,0,0.18)]'
                    : 'border-client-line hover:border-[#C9D9D6]'
                }`}
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-client-field">
                  {place.coverUrl ? (
                    <img src={place.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
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
