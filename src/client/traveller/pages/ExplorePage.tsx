import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { placesApi } from '@/client/api/placesApi';
import { referenceApi } from '@/client/api/referenceApi';
import type { CategoryGroup, PlaceSummary } from '@/client/api/types';
import { placePath } from '@/client/routePaths';
import FavoriteButton from '@/client/traveller/components/FavoriteButton';
import { useTraveller } from '@/client/traveller/travellerContext';
import { FormAlert } from '@/client/ui/Blocks';

type ViewMode = 'grid' | 'list';
type SortMode = 'default' | 'rating' | 'popular';

const PAGE_SIZE = 60;
const RATINGS = [0, 3.5, 4, 4.5] as const;

const GROUP_ICONS: Record<string, string> = {
  lodging: 'hotel',
  fnb: 'restaurant',
  attraction: 'attractions',
  shopping: 'shopping_bag',
};

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function placeCategory(place: PlaceSummary): string {
  return place.category?.name ?? place.group?.name ?? 'Khám phá';
}

function placeIcon(place: PlaceSummary): string {
  return GROUP_ICONS[place.group?.code ?? ''] ?? 'explore';
}

function DestinationCard({
                           place,
                           horizontal,
                           favorite,
                           onToggleFavorite,
                         }: {
  place: PlaceSummary;
  horizontal: boolean;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <article
      className={`group relative min-w-0 overflow-hidden rounded-[24px] border border-[#E5EEEB] bg-white shadow-[0_6px_22px_rgba(10,55,62,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#B5DFD3] hover:shadow-[0_20px_42px_rgba(10,55,62,0.12)] ${horizontal ? 'sm:min-h-[205px]' : ''}`}
    >
      <Link
        to={placePath(String(place.id))}
        className={`block min-w-0 ${horizontal ? 'sm:flex sm:h-full' : ''}`}
        aria-label={`Xem chi tiết ${place.name}`}
      >
        <div
          className={`relative shrink-0 overflow-hidden bg-[#D7EDE6] ${horizontal ? 'h-[220px] sm:h-auto sm:w-[270px]' : 'aspect-[16/10]'}`}
        >
          {place.coverUrl ? (
            <img
              src={place.coverUrl}
              alt={place.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
            />
          ) : (
            <div className="flex h-full min-h-[180px] w-full items-center justify-center bg-gradient-to-br from-[#E7F6ED] via-[#C7E8DF] to-[#A6D7CC]">
              <Icon name="landscape" className="text-[64px] text-[#5AAB9A]" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#092F36]/45 via-transparent to-transparent" />
          <span className="absolute bottom-3 left-3 inline-flex max-w-[82%] items-center gap-1.5 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#23645E] shadow-sm">
            <Icon name={placeIcon(place)} className="text-[15px]" />
            <span className="truncate">{placeCategory(place)}</span>
          </span>
        </div>
        <div className={`flex min-w-0 flex-1 flex-col ${horizontal ? 'p-5 sm:py-6 sm:pl-6 sm:pr-12' : 'p-[18px]'}`}>
          <div className="min-w-0 pr-7">
            <h3 className="line-clamp-2 text-[17px] font-extrabold leading-[1.4] tracking-[-0.025em] text-[#193E46] transition-colors group-hover:text-[#0B8778]">
              {place.name}
            </h3>
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-5 text-[#6A838C]">
            <Icon name="location_on" className="mt-0.5 shrink-0 text-[16px] text-[#17A18E]" />
            <span className="line-clamp-2">
              {place.address || place.province?.name || 'Địa chỉ đang được cập nhật'}
            </span>
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
            <div className="flex items-center gap-1.5 text-[12px] text-[#617781]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF7E6]">
                <Icon name="star" filled className="text-[16px] text-[#E9A632]" />
              </span>
              <strong className="text-[13px] text-[#223F49]">
                {place.rating == null ? 'Mới' : place.rating.toFixed(1)}
              </strong>
              {place.rating != null && (
                <span className="text-[#98A8AE]">({place.reviewCount} đánh giá)</span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-[12px] font-extrabold text-[#0C897B]">
              Xem chi tiết
              <Icon name="arrow_forward" className="text-[17px] transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
      <FavoriteButton
        active={favorite}
        onToggle={onToggleFavorite}
        className="absolute right-3 top-3 z-10 border border-white/60 shadow-[0_4px_14px_rgba(0,0,0,0.13)]"
      />
    </article>
  );
}

function PlaceSkeleton({ horizontal }: { horizontal: boolean }) {
  return (
    <div className={`animate-pulse overflow-hidden rounded-[24px] border border-[#E8F0ED] bg-white ${horizontal ? 'sm:flex' : ''}`}>
      <div className={`bg-[#E2EFEA] ${horizontal ? 'h-44 sm:w-[270px] sm:shrink-0' : 'aspect-[16/10]'}`} />
      <div className="flex-1 space-y-3 p-5">
        <div className="h-4 w-3/4 rounded-full bg-[#E2EFEA]" />
        <div className="h-3 w-full rounded-full bg-[#F0F6F3]" />
        <div className="h-3 w-2/3 rounded-full bg-[#F0F6F3]" />
        <div className="mt-8 h-3 w-1/2 rounded-full bg-[#E2EFEA]" />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const { favorites, toggleFavorite } = useTraveller();
  const query = params.get('q') ?? '';
  const typeParam = params.get('type') ?? '';
  const rawRating = Number(params.get('rating') ?? 0);
  const minRating = RATINGS.includes(rawRating as (typeof RATINGS)[number]) ? rawRating : 0;

  const [searchText, setSearchText] = useState(query);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState('');
  const [selectedCategoryCodes, setSelectedCategoryCodes] = useState<string[]>(
    typeParam ? [typeParam] : [],
  );
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [nextPage, setNextPage] = useState(1);
  const requestVersionRef = useRef(0);
  const skipTypeSyncRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);

  // Không tải danh sách tỉnh/thành và không gửi tham số province.
  useEffect(() => {
    let alive = true;
    referenceApi.categories()
      .then((groups) => {
        if (alive) setCategoryGroups(groups);
      })
      .catch((error: unknown) => {
        if (alive) setCategoryError(errorMessage(error));
      })
      .finally(() => {
        if (alive) setLoadingCategories(false);
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setSearchText(query);
  }, [query]);

  useEffect(() => {
    if (skipTypeSyncRef.current) {
      skipTypeSyncRef.current = false;
      return;
    }
    setSelectedCategoryCodes(typeParam ? [typeParam] : []);
  }, [typeParam]);

  const serverCategory = useMemo(() => {
    if (selectedCategoryCodes.length !== 1) return undefined;
    const code = selectedCategoryCodes[0];
    return categoryGroups.some((group) => group.subtypes.some((child) => child.code === code))
      ? code
      : undefined;
  }, [categoryGroups, selectedCategoryCodes]);

  // Tìm kiếm theo từ khóa trên mọi địa điểm, không lọc tỉnh/thành.
  useEffect(() => {
    let alive = true;
    const version = ++requestVersionRef.current;
    setLoading(true);
    setLoadingMore(false);
    setLoadError(null);

    const timer = window.setTimeout(() => {
      placesApi.list({
        keyword: searchText.trim(),
        category: serverCategory,
        page: 0,
        size: PAGE_SIZE,
      }).then((page) => {
        if (!alive || requestVersionRef.current !== version) return;
        setPlaces(page.items);
        setTotal(page.total);
        setNextPage(1);
      }).catch((error: unknown) => {
        if (!alive || requestVersionRef.current !== version) return;
        setPlaces([]);
        setTotal(0);
        setLoadError(errorMessage(error));
      }).finally(() => {
        if (alive && requestVersionRef.current === version) setLoading(false);
      });
    }, 350);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [searchText, serverCategory]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const selectedCategories = useMemo(
    () => categoryGroups.flatMap((group) =>
      [group, ...group.subtypes].filter((category) => selectedCategoryCodes.includes(category.code)),
    ),
    [categoryGroups, selectedCategoryCodes],
  );

  const visiblePlaces = useMemo(() => {
    const matched = places.filter((place) => {
      if ((place.rating ?? 0) < minRating) return false;
      if (selectedCategories.length === 0) return true;
      const fields = [
        place.group?.code ?? '',
        place.group?.name ?? '',
        place.category?.code ?? '',
        place.category?.name ?? '',
        ...(place.groups ?? []).flatMap((group) => [group.code, group.name]),
        ...(place.categories ?? []).flatMap((category) => [category.code, category.name]),
      ].map(normalizeText);
      return selectedCategories.some((category) => {
        const code = normalizeText(category.code);
        const name = normalizeText(category.name);
        return fields.some((field) => field === code || field === name);
      });
    });

    if (sortMode === 'rating') {
      return [...matched].sort((a, b) =>
        (b.rating ?? -1) - (a.rating ?? -1) || b.reviewCount - a.reviewCount,
      );
    }
    if (sortMode === 'popular') {
      return [...matched].sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return matched;
  }, [places, minRating, selectedCategories, sortMode]);

  const isClientFiltered = minRating > 0 || (selectedCategoryCodes.length > 0 && !serverCategory);
  const resultCount = isClientFiltered ? visiblePlaces.length : total;
  const hasMore = places.length < total;
  const activeFilterCount = selectedCategoryCodes.length + (minRating > 0 ? 1 : 0);
  const heroPlaces = places.filter((place) => Boolean(place.coverUrl)).slice(0, 2);

  function updateQuery(value: string) {
    const next = new URLSearchParams(params);
    if (value.trim()) next.set('q', value.trim());
    else next.delete('q');
    setParams(next, { replace: true });
  }

  function updateRating(value: number) {
    const next = new URLSearchParams(params);
    if (value > 0) next.set('rating', String(value));
    else next.delete('rating');
    setParams(next, { replace: true });
  }

  function toggleCategory(code: string) {
    if (typeParam) {
      skipTypeSyncRef.current = true;
      const next = new URLSearchParams(params);
      next.delete('type');
      setParams(next, { replace: true });
    }
    setSelectedCategoryCodes((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    );
  }

  function selectQuickGroup(groupCode: string) {
    if (typeParam) {
      skipTypeSyncRef.current = true;
      const next = new URLSearchParams(params);
      next.delete('type');
      setParams(next, { replace: true });
    }
    setSelectedCategoryCodes((current) =>
      current.length === 1 && current[0] === groupCode ? [] : [groupCode],
    );
  }

  function resetFilters() {
    setSelectedCategoryCodes([]);
    setSortMode('default');
    setSearchText('');
    const next = new URLSearchParams(params);
    next.delete('q');
    next.delete('type');
    next.delete('rating');
    setParams(next, { replace: true });
  }

  function loadMore() {
    if (loading || loadingMore || !hasMore) return;
    const version = requestVersionRef.current;
    setLoadingMore(true);
    placesApi.list({
      keyword: searchText.trim(),
      category: serverCategory,
      page: nextPage,
      size: PAGE_SIZE,
    }).then((page) => {
      if (requestVersionRef.current !== version) return;
      setPlaces((current) => {
        const ids = new Set(current.map((place) => place.id));
        return [...current, ...page.items.filter((place) => !ids.has(place.id))];
      });
      setTotal(page.total);
      setNextPage((current) => current + 1);
    }).catch((error: unknown) => {
      if (requestVersionRef.current === version) setLoadError(errorMessage(error));
    }).finally(() => {
      if (requestVersionRef.current === version) setLoadingMore(false);
    });
  }

  return (
    <div className="mx-auto max-w-[1400px] pb-12">
      {/* HERO */}
      <section className="relative mb-7 overflow-hidden rounded-[28px] bg-[#0B534F] text-white shadow-[0_18px_48px_rgba(5,74,69,0.14)] sm:rounded-[34px]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#083F44] via-[#0B6D64] to-[#139988]" />
        <div className="pointer-events-none absolute -left-28 -top-36 h-80 w-80 rounded-full border-[55px] border-white/[0.045]" />
        <div className="pointer-events-none absolute bottom-[-150px] right-[28%] h-80 w-80 rounded-full border-[55px] border-white/[0.05]" />
        <div className="relative grid min-h-[350px] gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
          <div className="relative z-10 px-6 pb-8 pt-9 sm:px-10 sm:pt-11 lg:py-12 lg:pl-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#D5FFF0]">
              <Icon name="explore" className="text-[17px]" /> SMART TRAVEL · DISCOVER
            </div>
            <h1 className="mt-5 max-w-[690px] text-[32px] font-extrabold leading-[1.12] tracking-[-0.04em] sm:text-[44px] lg:text-[48px]">
              Hành trình tuyệt vời<br />
              <span className="text-[#C4F7D7]">bắt đầu từ đây.</span>
            </h1>
            <p className="mt-4 max-w-[560px] text-[13px] leading-6 text-white/80 sm:text-[14px]">
              Tìm một nơi mới để đến, khám phá những góc đẹp và lưu lại điểm dừng chân bạn yêu thích.
            </p>
            <div className="mt-7 max-w-[680px] rounded-[20px] bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.17)]">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F7F1] text-[#0B8879]">
                  <Icon name="search" className="text-[23px]" />
                </span>
                <input
                  ref={searchInputRef}
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  onCompositionStart={() => { composingRef.current = true; }}
                  onCompositionEnd={(event) => {
                    composingRef.current = false;
                    setSearchText(event.currentTarget.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !composingRef.current && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      updateQuery(searchText);
                      event.currentTarget.blur();
                    }
                  }}
                  placeholder="Tìm tên địa điểm, địa chỉ, điểm du lịch..."
                  aria-label="Tìm kiếm địa điểm"
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-[#244650] outline-none placeholder:font-normal placeholder:text-[#91A3A8] sm:text-[14px]"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => { setSearchText(''); updateQuery(''); searchInputRef.current?.focus(); }}
                    aria-label="Xóa tìm kiếm"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#91A3A8] hover:bg-[#F1F5F4]"
                  >
                    <Icon name="close" className="text-[18px]" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => updateQuery(searchText)}
                  className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-[13px] bg-[#0C8174] px-4 text-[12px] font-extrabold text-white transition-colors hover:bg-[#08675F] sm:px-6"
                >
                  <Icon name="search" className="text-[19px] sm:hidden" />
                  <span className="hidden sm:inline">Tìm kiếm</span>
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-white/75">
              <span className="inline-flex items-center gap-1.5"><Icon name="verified" className="text-[17px] text-[#B9F5CE]" /> Địa điểm từ hệ thống</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="favorite" className="text-[17px] text-[#B9F5CE]" /> Lưu địa điểm yêu thích</span>
            </div>
          </div>

          <div className="pointer-events-none relative hidden min-h-[345px] overflow-hidden lg:block">
            <div className="absolute -right-14 top-[-45px] h-[420px] w-[420px] rotate-[-12deg] rounded-[52px] border-[24px] border-white/10" />
            <div className="absolute right-[24%] top-[42px] h-[248px] w-[200px] -rotate-[12deg] overflow-hidden rounded-[25px] border-[6px] border-white/90 bg-[#8CCDC0] shadow-[0_18px_36px_rgba(0,0,0,0.2)]">
              {heroPlaces[0]?.coverUrl ? (
                <img src={heroPlaces[0].coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#84C5B6] to-[#D2E9AE]"><Icon name="landscape" className="text-[70px] text-white/80" /></div>
              )}
            </div>
            <div className="absolute right-[3%] top-[96px] h-[228px] w-[185px] rotate-[9deg] overflow-hidden rounded-[25px] border-[6px] border-white/90 bg-[#B9D7B6] shadow-[0_18px_36px_rgba(0,0,0,0.24)]">
              {heroPlaces[1]?.coverUrl ? (
                <img src={heroPlaces[1].coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#9DD8CF] to-[#F7D5A5]"><Icon name="beach_access" className="text-[70px] text-white/80" /></div>
              )}
            </div>
            <div className="absolute bottom-8 left-[13%] flex items-center gap-2 rounded-2xl border border-white/30 bg-white/95 px-4 py-3 text-[12px] font-extrabold text-[#1A5B53] shadow-lg">
              <Icon name="location_on" className="text-[21px] text-[#0E9D8C]" /> Việt Nam chờ bạn khám phá
            </div>
          </div>
        </div>
      </section>

      {/* KHÁM PHÁ NHANH THEO LOẠI HÌNH */}
      {categoryGroups.length > 0 && (
        <section className="mb-7">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0D9A88]">Cảm hứng hành trình</p>
              <h2 className="mt-1 text-[19px] font-extrabold tracking-tight text-[#1D4148] sm:text-[22px]">Khám phá theo sở thích</h2>
            </div>
            {selectedCategoryCodes.length > 0 && (
              <button type="button" onClick={() => setSelectedCategoryCodes([])} className="text-[12px] font-bold text-[#0A897A] hover:underline">
                Xem tất cả
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categoryGroups.map((group) => {
              const active = selectedCategoryCodes.length === 1 && selectedCategoryCodes[0] === group.code;
              return (
                <button
                  key={group.code}
                  type="button"
                  onClick={() => selectQuickGroup(group.code)}
                  aria-pressed={active}
                  className={`flex min-w-[145px] shrink-0 items-center gap-3 rounded-[18px] border px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 ${active ? 'border-[#0A9A88] bg-[#E2F7ED] shadow-[0_8px_22px_rgba(12,140,115,0.12)]' : 'border-[#E4EEEB] bg-white hover:border-[#BADFD3] hover:shadow-sm'}`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${active ? 'bg-[#0D8F80] text-white' : 'bg-[#EAF7F1] text-[#0D8F80]'}`}>
                    <Icon name={GROUP_ICONS[group.code] ?? 'explore'} className="text-[22px]" />
                  </span>
                  <span className={`max-w-[155px] text-[12px] font-extrabold leading-4 ${active ? 'text-[#086C61]' : 'text-[#355862]'}`}>{group.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="mb-4 flex items-center justify-between lg:hidden">
        <p className="text-[13px] font-bold text-[#35545C]">Tùy chỉnh kết quả</p>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((value) => !value)}
          aria-expanded={mobileFiltersOpen}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-[#DCE9E4] bg-white px-4 text-[12px] font-extrabold text-[#0A8375] shadow-sm"
        >
          <Icon name="tune" className="text-[19px]" /> Bộ lọc
          {activeFilterCount > 0 && <span className="rounded-full bg-[#DDF5E9] px-2 py-0.5 text-[10px]">{activeFilterCount}</span>}
        </button>
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[265px_minmax(0,1fr)] xl:gap-8">
        {/* BỘ LỌC: CHỈ DANH MỤC & ĐÁNH GIÁ, KHÔNG LỌC TỈNH/THÀNH */}
        <aside
          className={`${mobileFiltersOpen ? 'block' : 'hidden'} min-w-0 overflow-hidden rounded-[24px] border border-[#E2EDE9] bg-white shadow-[0_8px_32px_rgba(18,62,65,0.045)] lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto`}
        >
          <div className="flex items-center justify-between border-b border-[#EDF2EF] px-5 py-5">
            <div>
              <h2 className="text-[17px] font-extrabold text-[#1D424B]">Bộ lọc</h2>
              <p className="mt-1 text-[11px] text-[#899CA2]">Chọn trải nghiệm phù hợp</p>
            </div>
            <button type="button" onClick={resetFilters} className="flex items-center gap-1 rounded-full bg-[#EAF7F1] px-3 py-2 text-[11px] font-extrabold text-[#0B8778] hover:bg-[#D7F2E7]">
              <Icon name="restart_alt" className="text-[16px]" /> Đặt lại
            </button>
          </div>
          <div className="space-y-7 p-5">
            <section>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#EAF8F2] text-[#0C907F]">
                  <Icon name="category" className="text-[20px]" />
                </span>
                <div>
                  <h3 className="text-[13px] font-extrabold text-[#234750]">Loại hình trải nghiệm</h3>
                  <p className="text-[10px] text-[#91A2A6]">Chọn một hoặc nhiều loại</p>
                </div>
              </div>
              {loadingCategories ? (
                <p className="py-3 text-[12px] text-[#82969E]">Đang tải danh mục...</p>
              ) : categoryGroups.length === 0 ? (
                <p className="py-3 text-[12px] text-[#82969E]">Chưa có danh mục.</p>
              ) : (
                <div className="max-h-[355px] space-y-2 overflow-y-auto pr-1">
                  {categoryGroups.map((group) => {
                    const selectedCount = [group, ...group.subtypes].filter((cat) => selectedCategoryCodes.includes(cat.code)).length;
                    return (
                      <details key={group.code} className="group rounded-[15px] border border-[#E9EFEC] bg-[#FAFCFB] open:border-[#BFE5D8] open:bg-[#F6FCF9]">
                        <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3 py-3 [&::-webkit-details-marker]:hidden">
                          <Icon name={GROUP_ICONS[group.code] ?? 'explore'} className="text-[19px] text-[#0C8D80]" />
                          <span className="min-w-0 flex-1 text-[12px] font-extrabold text-[#355963]">{group.name}</span>
                          {selectedCount > 0 && <span className="rounded-full bg-[#DDF6EA] px-2 py-0.5 text-[10px] font-bold text-[#0A8276]">{selectedCount}</span>}
                          <Icon name="expand_more" className="text-[18px] text-[#88A09F] transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="space-y-1 border-t border-[#E5F0E9] px-2 pb-2 pt-2">
                          {[group, ...group.subtypes].map((category) => {
                            const checked = selectedCategoryCodes.includes(category.code);
                            return (
                              <label key={`${group.code}-${category.code}`} className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2.5 text-[11px] font-semibold transition-colors ${checked ? 'bg-[#DEF5E9] text-[#0B796C]' : 'text-[#5E7C84] hover:bg-white'}`}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleCategory(category.code)}
                                  className="h-4 w-4 shrink-0 cursor-pointer accent-[#0C9284]"
                                />
                                <span className="leading-4">{category.code === group.code ? `Tất cả ${group.name}` : category.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </section>
            <section className="border-t border-[#EDF2EF] pt-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#FFF5DF] text-[#C38C24]">
                  <Icon name="star" filled className="text-[20px]" />
                </span>
                <div>
                  <h3 className="text-[13px] font-extrabold text-[#234750]">Đánh giá tối thiểu</h3>
                  <p className="text-[10px] text-[#91A2A6]">Ưu tiên địa điểm chất lượng</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {RATINGS.map((rating) => (
                  <button
                    type="button"
                    key={rating}
                    onClick={() => updateRating(rating)}
                    aria-pressed={minRating === rating}
                    className={`flex h-11 items-center justify-center gap-1 rounded-xl border text-[12px] font-extrabold transition-colors ${minRating === rating ? 'border-[#0B877B] bg-[#0B877B] text-white shadow-[0_5px_14px_rgba(8,139,122,0.15)]' : 'border-[#E6ECE9] bg-[#F8FBFA] text-[#5F7981] hover:border-[#C3E6DA] hover:bg-[#F1F9F5]'}`}
                  >
                    {rating > 0 ? <><Icon name="star" filled className="text-[16px] text-[#F5C85D]" /> {rating}+</> : 'Tất cả'}
                  </button>
                ))}
              </div>
            </section>
            {categoryError && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-[11px] leading-5 text-red-700">{categoryError}</div>}
            <div className="rounded-[16px] bg-[#F1F9F5] p-4">
              <div className="flex items-start gap-2">
                <Icon name="tips_and_updates" className="text-[21px] text-[#0D9886]" />
                <p className="text-[11px] leading-[19px] text-[#638078]">Hãy chọn loại hình hoặc mức đánh giá để tìm những điểm đến hợp gu của bạn.</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => setMobileFiltersOpen(false)} className="mx-5 mb-5 flex h-11 w-[calc(100%-2.5rem)] items-center justify-center rounded-[13px] bg-[#0C897B] text-[12px] font-bold text-white lg:hidden">
            Xem kết quả
          </button>
        </aside>

        <main className="min-w-0">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#0A9687]">YOUR NEXT DESTINATION</p>
              <h2 className="mt-1 text-[24px] font-extrabold tracking-[-0.035em] text-[#1B414A] sm:text-[27px]">Địa điểm dành cho bạn</h2>
              <p className="mt-1.5 text-[12px] text-[#83979F]">
                {loading
                  ? 'Đang tìm những điểm đến thú vị...'
                  : isClientFiltered
                    ? `${resultCount} địa điểm phù hợp trong ${places.length} kết quả đã tải`
                    : `Tìm thấy ${resultCount} địa điểm để khám phá`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative flex h-10 items-center rounded-[12px] border border-[#E0EAE7] bg-white pl-3 text-[11px] font-bold text-[#587780] shadow-sm">
                <Icon name="swap_vert" className="mr-1 text-[17px] text-[#0E9889]" />
                <select
                  aria-label="Sắp xếp địa điểm đã tải"
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  className="h-full cursor-pointer bg-transparent pr-3 text-[11px] font-bold text-[#54717A] outline-none"
                >
                  <option value="default">Mặc định</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="popular">Nhiều đánh giá</option>
                </select>
              </label>
              <div className="flex h-10 items-center rounded-[12px] border border-[#E0EAE7] bg-white p-1 shadow-sm" role="group" aria-label="Kiểu hiển thị">
                {([
                  { value: 'grid', icon: 'grid_view', label: 'Dạng thẻ' },
                  { value: 'list', icon: 'view_agenda', label: 'Danh sách' },
                ] as const).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setViewMode(item.value)}
                    aria-label={item.label}
                    aria-pressed={viewMode === item.value}
                    className={`flex h-8 w-8 items-center justify-center rounded-[9px] transition-colors ${viewMode === item.value ? 'bg-[#E0F5EA] text-[#087F73]' : 'text-[#82979E] hover:bg-[#F5FAF7]'}`}
                  >
                    <Icon name={item.icon} className="text-[19px]" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(activeFilterCount > 0 || searchText.trim()) && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {searchText.trim() && (
                <button type="button" onClick={() => { setSearchText(''); updateQuery(''); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#CAE6DC] bg-white px-3 py-1.5 text-[11px] font-bold text-[#366B64]">
                  <Icon name="search" className="text-[15px]" /> {searchText.trim()} <Icon name="close" className="text-[14px]" />
                </button>
              )}
              {selectedCategories.map((category) => (
                <button type="button" key={category.code} onClick={() => toggleCategory(category.code)} className="inline-flex items-center gap-1.5 rounded-full border border-[#D1E8DE] bg-[#EFF9F3] px-3 py-1.5 text-[11px] font-bold text-[#17796A]">
                  {category.name} <Icon name="close" className="text-[14px]" />
                </button>
              ))}
              {minRating > 0 && (
                <button type="button" onClick={() => updateRating(0)} className="inline-flex items-center gap-1 rounded-full border border-[#F1E2C4] bg-[#FFFAEE] px-3 py-1.5 text-[11px] font-bold text-[#947020]">
                  <Icon name="star" filled className="text-[15px]" /> {minRating}+ <Icon name="close" className="text-[14px]" />
                </button>
              )}
              <button type="button" onClick={resetFilters} className="px-2 text-[11px] font-bold text-[#0A8D80] hover:underline">Xóa tất cả</button>
            </div>
          )}

          {loadError && <div className="mb-4"><FormAlert message={`Không tải được địa điểm: ${loadError}`} /></div>}

          {loading ? (
            <div className={viewMode === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-4'}>
              {Array.from({ length: viewMode === 'grid' ? 6 : 3 }, (_, index) => <PlaceSkeleton key={index} horizontal={viewMode === 'list'} />)}
            </div>
          ) : visiblePlaces.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-[26px] border border-[#E3EEEA] bg-white px-6 py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#E8F7EF]"><Icon name="travel_explore" className="text-[41px] text-[#0D917F]" /></div>
              <h3 className="mt-5 text-[18px] font-extrabold text-[#224A50]">Chưa tìm thấy địa điểm phù hợp</h3>
              <p className="mt-2 max-w-[370px] text-[12px] leading-6 text-[#81979D]">Thử một từ khóa khác hoặc thay đổi bộ lọc để khám phá thêm các điểm đến.</p>
              <button type="button" onClick={resetFilters} className="mt-5 rounded-full bg-[#0B897B] px-6 py-3 text-[12px] font-extrabold text-white hover:bg-[#086C62]">Đặt lại tìm kiếm</button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'grid gap-4'}>
              {visiblePlaces.map((place) => (
                <DestinationCard
                  key={place.id}
                  place={place}
                  horizontal={viewMode === 'list'}
                  favorite={favoriteSet.has(String(place.id))}
                  onToggleFavorite={() => toggleFavorite(String(place.id))}
                />
              ))}
            </div>
          )}

          {!loading && hasMore && (
            <div className="mt-9 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-[#B8DED2] bg-white px-8 text-[12px] font-extrabold text-[#0B8578] shadow-[0_6px_16px_rgba(8,83,75,0.05)] transition-colors hover:bg-[#EBF9F2] disabled:opacity-60"
              >
                <Icon name={loadingMore ? 'hourglass_top' : 'expand_more'} className="text-[20px]" />
                {loadingMore ? 'Đang tải thêm...' : 'Khám phá thêm địa điểm'}
              </button>
              <span className="text-[11px] text-[#93A6A8]">Đã tải {places.length}/{total} địa điểm</span>
            </div>
          )}
          {sortMode !== 'default' && !loading && (
            <p className="mt-4 text-center text-[10px] text-[#98A8A8]">Thứ tự sắp xếp chỉ áp dụng cho các địa điểm đã tải.</p>
          )}
        </main>
      </div>
    </div>
  );
}
