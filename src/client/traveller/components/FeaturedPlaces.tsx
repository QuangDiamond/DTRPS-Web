import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { adApi, type FeaturedPlace } from '@/client/api/adApi';
import { placePath } from '@/client/routePaths';

/** Địa điểm được đối tác tài trợ ở trang chủ; không có quảng cáo thì ẩn cả khu */
export default function FeaturedPlaces() {
  const [places, setPlaces] = useState<FeaturedPlace[]>([]);

  useEffect(() => {
    let active = true;
    adApi
      .featured()
      .then((items) => active && setPlaces(items))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (places.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-[16px] font-extrabold text-client-ink md:text-[20px]">
        Địa điểm nổi bật
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4 2xl:grid-cols-6">
        {places.map((place) => (
          <Link
            key={place.id}
            to={placePath(String(place.id))}
            className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md"
          >
            <div className="relative h-32 bg-client-field md:h-40">
              {place.coverUrl ? (
                <img src={place.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-client-muted">
                  <Icon name="image" className="text-[34px]" />
                </div>
              )}
              <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                Được tài trợ
              </span>
            </div>
            <div className="flex flex-1 flex-col p-3">
              <p className="line-clamp-2 text-[13px] font-bold text-client-ink">{place.name}</p>
              <p className="mt-1 truncate text-[11px] text-client-muted">
                {[place.category, place.province].filter(Boolean).join(' · ')}
              </p>
              {place.rating !== null && (
                <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-client-ink">
                  <Icon name="star" filled className="text-[15px] text-[#E0A100]" />
                  {place.rating}
                  <span className="font-normal text-client-muted">({place.reviewCount})</span>
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
