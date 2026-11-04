import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { placesApi } from '@/client/api/placesApi';
import type { PlaceSummary } from '@/client/api/types';
import { CLIENT_ROUTES, placePath } from '@/client/routePaths';
import FavoriteButton from '@/client/traveller/components/FavoriteButton';
import { useTraveller } from '@/client/traveller/travellerContext';
import { FormAlert, Spinner } from '@/client/ui/Blocks';

type ViewMode = 'list' | 'grid';

const GROUP_ICONS: Record<string, string> = {
  lodging: 'hotel',
  fnb: 'restaurant',
  attraction: 'attractions',
  shopping: 'storefront',
};
const DEFAULT_GROUP_ICON = 'place';

function groupIconOf(place: PlaceSummary): string {
  return place.group ? GROUP_ICONS[place.group.code] ?? DEFAULT_GROUP_ICON : DEFAULT_GROUP_ICON;
}

function PlaceCard({
  place,
  favorite,
  onToggleFavorite,
}: {
  place: PlaceSummary;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-white shadow-[0_4px_10px_rgba(19,54,74,0.08)] transition-shadow hover:shadow-lg">
      <Link to={placePath(String(place.id))} className="block">
        <div className="relative h-40 bg-[#CFE9E6] md:h-44">
          {place.coverUrl ? (
            <img
              src={place.coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="image" className="text-[40px] text-white/70" />
            </div>
          )}
          <div className="absolute inset-0 flex flex-col justify-between bg-linear-to-b from-black/5 to-black/45 p-2.5">
            <span className="flex items-center gap-1 self-start rounded-full bg-[#087A78]/90 px-2.5 py-1 text-[10px] font-bold text-white">
              <Icon name={groupIconOf(place)} className="text-[13px]" />
              {place.category?.name ?? place.group?.name ?? 'Địa điểm'}
            </span>
            <span className="flex items-center gap-1 self-start rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white">
              <Icon name="location_on" filled className="text-[13px]" />
              {place.province?.name ?? '—'}
            </span>
          </div>
        </div>
        <div className="px-3.5 pt-3 pb-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex-1 truncate text-[17px] font-extrabold text-[#13364A]">
              {place.name}
            </p>
            <span className="flex items-center gap-0.5 rounded-full bg-[#FFF5DA] px-2 py-0.5 text-[11px] font-bold text-[#8A6100]">
              <Icon name="star" filled className="text-[13px] text-[#E0A100]" />
              {place.rating ?? 'Mới'}
              {place.rating !== null && (
                <span className="text-[10px] font-normal text-[#A8894A]">
                  ({place.reviewCount})
                </span>
              )}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[12px] leading-[17px] text-[#72818C]">
            {place.address ?? ''}
          </p>
          <div className="mt-3 flex items-center justify-end">
            <span className="flex h-9 items-center gap-1 rounded-full bg-[#A0F1E7] px-4 text-[13px] font-bold text-[#006D68]">
              Chi tiết <Icon name="arrow_forward" className="text-[16px]" />
            </span>
          </div>
        </div>
      </Link>
      <FavoriteButton
        active={favorite}
        onToggle={onToggleFavorite}
        className="absolute top-2.5 right-2.5"
      />
    </div>
  );
}

function PlaceGridCard({
  place,
  favorite,
  onToggleFavorite,
}: {
  place: PlaceSummary;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md">
      <Link to={placePath(String(place.id))} className="block">
        {place.coverUrl ? (
          <img
            src={place.coverUrl}
            alt=""
            className="h-[110px] w-full bg-[#CFE9E6] object-cover"
          />
        ) : (
          <div className="flex h-[110px] w-full items-center justify-center bg-[#CFE9E6]">
            <Icon name="image" className="text-[28px] text-white/80" />
          </div>
        )}
        <div className="p-2.5">
          <p className="truncate text-[13px] font-extrabold text-[#13364A]">{place.name}</p>
          <p className="mt-0.5 flex items-center gap-0.5 text-[10px] text-[#72818C]">
            <Icon name="location_on" className="text-[12px]" />
            <span className="flex-1 truncate">{place.province?.name ?? '—'}</span>
            <Icon name="star" filled className="text-[12px] text-[#E0A100]" />
            <span className="font-bold text-[#8A6100]">{place.rating ?? '—'}</span>
          </p>
          <p className="mt-1.5 truncate text-[12px] font-extrabold text-[#087A78]">
            {place.category?.name ?? ''}
          </p>
        </div>
      </Link>
      <FavoriteButton
        active={favorite}
        onToggle={onToggleFavorite}
        size="sm"
        className="absolute top-2 right-2"
      />
    </div>
  );
}

/** Khám phá điểm đến — gọi GET /api/places (công khai, chỉ ACTIVE) */
export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const { favorites, toggleFavorite } = useTraveller();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const query = params.get('q') ?? '';
  const minRating = Number(params.get('rating') ?? 0) || 0;

  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const setQuery = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set('q', value);
    else next.delete('q');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    // Gõ nhanh không bắn liên tiếp mỗi phím
    const timer = window.setTimeout(() => {
      placesApi
        .list({ keyword: query, size: 60 })
        .then((page) => active && setPlaces(page.items))
        .catch((failure: unknown) => active && setLoadError(errorMessage(failure)))
        .finally(() => active && setLoading(false));
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const visiblePlaces = useMemo(
    () => places.filter((place) => (place.rating ?? 0) >= minRating),
    [places, minRating],
  );

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 bg-client-bg px-4 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-12 flex-1 items-center rounded-full border border-[#E3E7F0] bg-white px-4 focus-within:ring-2 focus-within:ring-primary/30">
            <Icon name="search" className="text-[21px] text-[#7E8797]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm điểm đến, món ngon, danh lam..."
              aria-label="Tìm kiếm điểm đến"
              className="ml-2 h-full flex-1 bg-transparent text-[13px] text-[#13364A] placeholder:text-[#9CA3AF] focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Xoá từ khoá">
                <Icon name="cancel" filled className="text-[18px] text-[#A4ADC1]" />
              </button>
            )}
          </div>
          <Link
            to={CLIENT_ROUTES.EXPLORE_FILTERS}
            aria-label="Bộ lọc tìm kiếm"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <Icon name="tune" className="text-[21px]" />
          </Link>
        </div>
      </div>

      {loadError && <FormAlert message={`Không tải được danh sách địa điểm: ${loadError}`} />}

      <div className="mt-1 mb-3 flex items-center justify-between gap-2">
        <p className="flex min-w-0 flex-1 items-center gap-1.5 text-[11px] text-[#72818C]">
          <Icon name="travel_explore" className="text-[16px] text-[#087A78]" />
          <span className="truncate">
            Tìm thấy <b className="font-extrabold text-[#13364A]">{visiblePlaces.length}</b> địa
            điểm tuyệt vời tại Việt Nam
          </span>
        </p>
        {minRating > 0 && (
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(params);
              next.delete('rating');
              setParams(next, { replace: true });
            }}
            className="flex items-center gap-1 rounded-full bg-[#C3F8F0] px-2.5 py-1 text-[10px] font-bold text-[#075C66]"
          >
            ⭐ {minRating}+ <Icon name="close" className="text-[13px]" />
          </button>
        )}
        <div className="flex gap-1" role="group" aria-label="Kiểu hiển thị">
          {(
            [
              { id: 'list', icon: 'view_agenda', label: 'Danh sách' },
              { id: 'grid', icon: 'grid_view', label: 'Lưới' },
            ] as { id: ViewMode; icon: string; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setViewMode(item.id)}
              aria-label={item.label}
              aria-pressed={viewMode === item.id}
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                viewMode === item.id ? 'bg-[#C3F8F0] text-[#087A78]' : 'text-[#8C989E]'
              }`}
            >
              <Icon name={item.icon} className="text-[18px]" />
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : visiblePlaces.length === 0 ? (
        <div className="flex flex-col items-center rounded-[20px] bg-white px-6 py-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C3F8F0]">
            <Icon name="wrong_location" className="text-[32px] text-[#087A78]" />
          </span>
          <p className="mt-3 text-[15px] font-bold text-[#13364A]">Không tìm thấy địa điểm</p>
          <p className="mt-1 text-[12px] text-[#72818C]">
            Thử từ khoá khác hoặc chọn danh mục khác nhé.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visiblePlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              favorite={favorites.includes(String(place.id))}
              onToggleFavorite={() => toggleFavorite(String(place.id))}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {visiblePlaces.map((place) => (
            <PlaceGridCard
              key={place.id}
              place={place}
              favorite={favorites.includes(String(place.id))}
              onToggleFavorite={() => toggleFavorite(String(place.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
