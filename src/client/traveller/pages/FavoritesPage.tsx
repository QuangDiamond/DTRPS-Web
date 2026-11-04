import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { placesApi } from '@/client/api/placesApi';
import type { PlaceSummary } from '@/client/api/types';
import { CLIENT_ROUTES, placePath } from '@/client/routePaths';
import { normalizeText } from '@/client/traveller/data/places';
import { useTraveller } from '@/client/traveller/travellerContext';
import { FormAlert, Spinner } from '@/client/ui/Blocks';
import { ConfirmDialog } from '@/client/ui/Overlay';

type SortMode = 'rating' | 'name';
type GroupFilter = 'all' | string;

const GROUP_LABELS: Record<string, string> = {
  lodging: 'Lưu trú',
  fnb: 'Ẩm thực',
  attraction: 'Vui chơi & Tham quan',
  shopping: 'Mua sắm & Đặc sản',
};

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'rating', label: 'Đánh giá cao nhất' },
  { id: 'name', label: 'Tên A - Z' },
];

function FavoriteCard({ place, onRemove }: { place: PlaceSummary; onRemove: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-white">
      <Link to={placePath(String(place.id))} className="block">
        <div className="relative h-[170px] bg-[#CFE9E6]">
          {place.coverUrl ? (
            <img src={place.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="image" className="text-[36px] text-white/70" />
            </div>
          )}
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white">
            <Icon name="location_on" filled className="text-[13px]" />
            {place.province?.name ?? '—'}
          </span>
        </div>
      </Link>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Bỏ yêu thích"
        className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white"
      >
        <Icon name="favorite" filled className="text-[20px] text-[#E5484D]" />
      </button>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-extrabold text-[#13364A]">{place.name}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-1 text-[11px]">
              <Icon name="star" filled className="text-[15px] text-[#E0A100]" />
              <b className="text-[#13364A]">{place.rating ?? 'Mới'}</b>
              <span className="text-[#72818C]">({place.reviewCount} đánh giá)</span>
            </p>
          </div>
          {place.category && (
            <div className="text-right">
              <p className="text-[10px] text-[#72818C]">Loại hình</p>
              <p className="max-w-[110px] truncate text-[13px] font-extrabold text-[#C2410C]">
                {place.category.name}
              </p>
            </div>
          )}
        </div>
        <Link
          to={placePath(String(place.id))}
          className="mt-3 flex h-11 items-center justify-center rounded-2xl bg-[#EBEDFF] text-[13px] font-bold text-[#13364A] hover:bg-[#DFE2FF]"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

/** Địa điểm yêu thích — favorites lưu local, nội dung mỗi địa điểm lấy từ GET /api/places/{id} */
export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useTraveller();
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('rating');
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [removing, setRemoving] = useState<PlaceSummary | null>(null);

  useEffect(() => {
    if (favorites.length === 0) {
      setPlaces([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setLoadError(null);
    Promise.all(
      favorites.map((id) =>
        placesApi
          .get(id)
          .then((detail) => detail.summary)
          .catch(() => null),
      ),
    )
      .then((results) => {
        if (!active) return;
        // Mới lưu nhất đứng đầu; bỏ địa điểm đã bị gỡ/khoá khỏi hệ thống
        const found = results.filter((place): place is PlaceSummary => place !== null);
        setPlaces(found.reverse());
      })
      .catch((failure: unknown) => active && setLoadError(errorMessage(failure)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [favorites]);

  const availableGroups = useMemo(() => {
    const codes = new Set<string>();
    places.forEach((place) => place.group && codes.add(place.group.code));
    return [...codes];
  }, [places]);

  const countByGroup = (id: GroupFilter) =>
    id === 'all' ? places.length : places.filter((place) => place.group?.code === id).length;

  const visiblePlaces = useMemo(() => {
    const keyword = normalizeText(query);
    const filtered = places.filter(
      (place) =>
        (groupFilter === 'all' || place.group?.code === groupFilter) &&
        (!keyword ||
          normalizeText(`${place.name} ${place.province?.name ?? ''}`).includes(keyword)),
    );
    if (sortMode === 'rating') return [...filtered].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [places, groupFilter, query, sortMode]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
          <h1 className="text-[22px] font-extrabold text-[#13364A]">Địa điểm yêu thích</h1>
          <span className="text-[12px] font-semibold text-[#087A78]">
            ({places.length} điểm đã lưu)
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowSearch((previous) => !previous);
            setQuery('');
          }}
          aria-label="Tìm kiếm"
          aria-expanded={showSearch}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBEDFF] text-[#13364A]"
        >
          <Icon name={showSearch ? 'close' : 'search'} className="text-[21px]" />
        </button>
      </div>

      {loadError && <FormAlert message={`Không tải được danh sách yêu thích: ${loadError}`} />}

      {showSearch && (
        <div className="mt-3 flex h-11 items-center rounded-2xl bg-white px-3 focus-within:ring-2 focus-within:ring-primary/30">
          <Icon name="search" className="text-[20px] text-[#72818C]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm trong danh sách yêu thích..."
            aria-label="Tìm trong danh sách yêu thích"
            className="ml-2 h-full flex-1 bg-transparent text-[13px] text-[#13364A] placeholder:text-[#9AA6AD] focus:outline-none"
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[12px] text-[#72818C]">
          <Icon name="sort" className="text-[17px]" />
          Sắp xếp:
        </span>
        <div className="relative">
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            aria-label="Sắp xếp"
            className="cursor-pointer appearance-none rounded-full bg-white py-1.5 pr-8 pl-3 text-[12px] font-bold text-[#13364A] focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <Icon
            name="expand_more"
            className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[18px] text-[#13364A]"
          />
        </div>
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {(['all', ...availableGroups] as GroupFilter[]).map((id) => {
          const selected = id === groupFilter;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setGroupFilter(id)}
              aria-pressed={selected}
              className={`shrink-0 rounded-full px-4 py-2 text-[12px] font-bold ${
                selected ? 'bg-[#075C66] text-white' : 'bg-white text-[#13364A]'
              }`}
            >
              {id === 'all' ? 'Tất cả' : GROUP_LABELS[id] ?? id} ({countByGroup(id)})
            </button>
          );
        })}
      </div>

      {loading ? (
        <Spinner />
      ) : visiblePlaces.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visiblePlaces.map((place) => (
            <FavoriteCard key={place.id} place={place} onRemove={() => setRemoving(place)} />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center rounded-[22px] bg-white px-6 py-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFE4E4]">
            <Icon name="favorite" className="text-[32px] text-[#E5484D]" />
          </span>
          <p className="mt-3 text-[15px] font-extrabold text-[#13364A]">
            {places.length === 0 ? 'Chưa có địa điểm yêu thích' : 'Không tìm thấy địa điểm phù hợp'}
          </p>
          <p className="mt-1 text-[12px] text-[#72818C]">
            {places.length === 0
              ? 'Bấm vào biểu tượng trái tim ở màn Khám phá để lưu địa điểm.'
              : 'Thử chọn danh mục khác hoặc đổi từ khoá tìm kiếm.'}
          </p>
          {places.length === 0 && (
            <Link
              to={CLIENT_ROUTES.EXPLORE}
              className="mt-4 rounded-2xl bg-[#075C66] px-5 py-3 text-[13px] font-bold text-white"
            >
              Khám phá ngay
            </Link>
          )}
        </div>
      )}

      {places.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 rounded-[22px] bg-linear-to-br from-[#E2FCF8] to-[#D6F0FF] p-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#075C66] text-white">
              <Icon name="rocket_launch" className="text-[22px]" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-extrabold text-[#13364A]">Sẵn sàng lên đường?</p>
              <p className="mt-0.5 text-[11px] text-[#5D7782]">
                Bạn muốn kết hợp các điểm yêu thích này vào một lịch trình thông minh?
              </p>
            </div>
          </div>
          <Link
            to={CLIENT_ROUTES.TRIP_PLAN}
            className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-[#075C66] px-5 text-[13px] font-bold text-white hover:bg-primary"
          >
            Tạo chuyến đi từ danh sách này
            <Icon name="arrow_forward" className="text-[18px]" />
          </Link>
        </div>
      )}

      {removing && (
        <ConfirmDialog
          title="Bỏ yêu thích"
          message={`Xoá "${removing.name}" khỏi danh sách yêu thích?`}
          confirmLabel="Xoá"
          danger
          onConfirm={() => toggleFavorite(String(removing.id))}
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  );
}
