import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { placesApi } from '@/client/api/placesApi';
import { referenceApi } from '@/client/api/referenceApi';
import type { CategoryGroup, PlaceSummary, ReferenceItem } from '@/client/api/types';
import { placePath } from '@/client/routePaths';
import FavoriteButton from '@/client/traveller/components/FavoriteButton';
import { useTraveller } from '@/client/traveller/travellerContext';
import { FormAlert } from '@/client/ui/Blocks';

type ViewMode = 'grid' | 'list';
type SortMode = 'default' | 'rating' | 'popular';
type RatingMode = 0 | 3.5 | 4 | 4.5;

const PAGE_SIZE = 24;
const RATINGS: RatingMode[] = [0, 3.5, 4, 4.5];
const GROUP_ICONS: Record<string, string> = {
  lodging: 'hotel',
  fnb: 'restaurant',
  attraction: 'attractions',
  shopping: 'shopping_bag',
};

function normalizeText(value: string): string {
  return value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function DestinationCard({
                           place,
                           viewMode,
                           favorite,
                           onToggleFavorite,
                         }: {
  place: PlaceSummary;
  viewMode: ViewMode;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  const horizontal = viewMode === 'list';
  const category = place.category?.name ?? place.group?.name ?? 'Điểm đến';
  const icon = GROUP_ICONS[place.group?.code ?? ''] ?? 'place';

  return (
    <article className={`group relative min-w-0 overflow-hidden rounded-[24px] border border-[#E3E9E6] bg-white shadow-[0_5px_22px_rgba(12,44,43,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#A9D8C9] hover:shadow-[0_20px_44px_rgba(12,44,43,0.12)] ${horizontal ? 'sm:flex sm:min-h-[210px]' : ''}`}>
      <Link
        to={placePath(String(place.id))}
        aria-label={`Xem chi tiết ${place.name}`}
        className={`block min-w-0 flex-1 ${horizontal ? 'sm:flex' : ''}`}
      >
        <div className={`relative shrink-0 overflow-hidden bg-[#E3EEE9] ${horizontal ? 'h-[200px] sm:h-auto sm:w-[290px]' : 'aspect-[4/3]'}`}>
          {place.coverUrl ? (
            <img
              src={place.coverUrl}
              alt={place.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.065]"
            />
          ) : (
            <div className="flex h-full min-h-[190px] items-center justify-center bg-gradient-to-br from-[#D5EDE5] via-[#B9DDD1] to-[#E9E7D5]">
              <Icon name="landscape" className="text-[54px] text-[#669F8C]" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B302C]/45 via-transparent to-transparent" />
          <span className="absolute bottom-3 left-3 inline-flex max-w-[85%] items-center gap-1.5 rounded-full border border-white/50 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#266B5D] shadow-sm">
            <Icon name={icon} className="text-[15px]" />
            <span className="truncate">{category}</span>
          </span>
        </div>

        <div className={`flex min-w-0 flex-1 flex-col ${horizontal ? 'px-5 pb-5 pt-5 sm:px-7 sm:py-6' : 'p-5'}`}>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#15907C]">
            {place.province?.name ?? 'Việt Nam'}
          </p>
          <h3 className="line-clamp-2 pr-6 text-[17px] font-extrabold leading-[1.45] tracking-tight text-[#193F41] transition-colors group-hover:text-[#0B8875]">
            {place.name}
          </h3>
          <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-5 text-[#73868C]">
            <Icon name="location_on" className="mt-0.5 shrink-0 text-[16px] text-[#0F9984]" />
            <span className="line-clamp-2">{place.address || 'Địa chỉ đang cập nhật'}</span>
          </p>
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#EDF1EE] pt-4 sm:mt-5">
            <div className="inline-flex min-w-0 items-center gap-1.5 text-[12px] text-[#697C81]">
              <Icon name="star" filled className="text-[19px] text-[#E9AD43]" />
              <strong className="text-[13px] text-[#29444A]">
                {place.rating == null ? 'Mới' : place.rating.toFixed(1)}
              </strong>
              {place.rating != null && (
                <span className="truncate text-[#9AA9A9]">· {place.reviewCount} đánh giá</span>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-extrabold text-[#0B8A77]">
              Khám phá <Icon name="arrow_forward" className="text-[18px] transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
      <FavoriteButton
        active={favorite}
        onToggle={onToggleFavorite}
        className="absolute right-3 top-3 z-10 border border-white/60 shadow-md"
      />
    </article>
  );
}

function PlaceSkeleton({ viewMode }: { viewMode: ViewMode }) {
  const horizontal = viewMode === 'list';
  return (
    <div className={`animate-pulse overflow-hidden rounded-[24px] border border-[#E7EEEA] bg-white ${horizontal ? 'sm:flex' : ''}`}>
      <div className={`bg-[#E4EEE9] ${horizontal ? 'h-44 sm:w-[290px] sm:shrink-0' : 'aspect-[4/3]'}`} />
      <div className="flex-1 space-y-3 p-5">
        <div className="h-3 w-24 rounded-full bg-[#E4EEE9]" />
        <div className="h-5 w-3/4 rounded-full bg-[#E4EEE9]" />
        <div className="h-3 w-full rounded-full bg-[#F0F4F1]" />
        <div className="mt-8 h-3 w-1/2 rounded-full bg-[#E4EEE9]" />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const { favorites, toggleFavorite } = useTraveller();

  // Thanh tìm kiếm CHỈ chọn tỉnh/thành. URL dùng ?province=<mã>, không dùng keyword.
  const selectedProvinceCode = params.get('province') ?? '';
  const typeParam = params.get('type') ?? '';
  const rawRating = Number(params.get('rating') ?? 0);
  const minRating: RatingMode = RATINGS.includes(rawRating as RatingMode) ? rawRating as RatingMode : 0;

  const [provinces, setProvinces] = useState<ReferenceItem[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(true);
  const [referenceError, setReferenceError] = useState('');

  const [searchText, setSearchText] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchNotice, setSearchNotice] = useState('');
  const composingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedCategoryCodes, setSelectedCategoryCodes] = useState<string[]>(
    typeParam ? [typeParam] : [],
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('default');

  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [nextPage, setNextPage] = useState(1);
  const requestVersionRef = useRef(0);

  // Lấy danh sách tỉnh/thành chính thức từ DB và các nhóm loại hình.
  useEffect(() => {
    let alive = true;
    Promise.allSettled([referenceApi.provinces(), referenceApi.categories()])
      .then(([provinceResult, categoryResult]) => {
        if (!alive) return;
        const errors: string[] = [];
        if (provinceResult.status === 'fulfilled') setProvinces(provinceResult.value);
        else errors.push(`Tỉnh/thành: ${errorMessage(provinceResult.reason)}`);
        if (categoryResult.status === 'fulfilled') setCategoryGroups(categoryResult.value);
        else errors.push(`Danh mục: ${errorMessage(categoryResult.reason)}`);
        setReferenceError(errors.join(' · '));
      })
      .finally(() => { if (alive) setLoadingReferences(false); });
    return () => { alive = false; };
  }, []);

  const selectedProvince = useMemo(
    () => provinces.find((province) => province.code === selectedProvinceCode),
    [provinces, selectedProvinceCode],
  );

  // Khi chọn tỉnh hoặc vào trang bằng link ?province=..., hiện đúng tên trên ô Search.
  useEffect(() => {
    if (selectedProvince) setSearchText(selectedProvince.name);
  }, [selectedProvince]);

  const suggestions = useMemo(() => {
    const term = normalizeText(searchText);
    if (!term) return [];
    return provinces
      .filter((province) => normalizeText(province.name).includes(term))
      .sort((a, b) => {
        const aStart = normalizeText(a.name).startsWith(term) ? 0 : 1;
        const bStart = normalizeText(b.name).startsWith(term) ? 0 : 1;
        return aStart - bStart || a.name.localeCompare(b.name, 'vi');
      })
      .slice(0, 8);
  }, [provinces, searchText]);

  function chooseProvince(province: ReferenceItem) {
    const next = new URLSearchParams(params);
    next.set('province', province.code);
    next.delete('q'); // bỏ cách tìm keyword địa điểm ở phiên bản cũ
    setParams(next, { replace: true });
    setSearchText(province.name);
    setSuggestionsOpen(false);
    setHighlightedIndex(0);
    setSearchNotice('');
    inputRef.current?.blur();
  }

  function clearProvince() {
    const next = new URLSearchParams(params);
    next.delete('province');
    next.delete('q');
    setParams(next, { replace: true });
    setSearchText('');
    setSearchNotice('');
    setSuggestionsOpen(false);
    setHighlightedIndex(0);
  }

  function handleSearchInput(value: string) {
    setSearchText(value);
    setSearchNotice('');
    setHighlightedIndex(0);
    setSuggestionsOpen(true);
    if (selectedProvinceCode) {
      const next = new URLSearchParams(params);
      next.delete('province');
      setParams(next, { replace: true });
    }
  }

  function submitProvince() {
    const term = normalizeText(searchText);
    if (!term) {
      clearProvince();
      return;
    }
    const exact = provinces.find((province) => normalizeText(province.name) === term);
    const province = exact ?? suggestions[highlightedIndex] ?? suggestions[0];
    if (province) chooseProvince(province);
    else {
      setSuggestionsOpen(true);
      setSearchNotice('Không tìm thấy tỉnh/thành phù hợp trong danh sách của hệ thống.');
    }
  }

  // Chỉ gọi placesApi khi tỉnh ĐÃ ĐƯỢC CHỌN, không gọi tìm kiếm với từng chữ H, Ha...
  const serverCategory = useMemo(() => {
    if (selectedCategoryCodes.length !== 1) return undefined;
    const code = selectedCategoryCodes[0];
    return categoryGroups.some((group) => group.subtypes.some((sub) => sub.code === code))
      ? code : undefined;
  }, [categoryGroups, selectedCategoryCodes]);

  useEffect(() => {
    let alive = true;
    const version = ++requestVersionRef.current;
    setLoading(true);
    setLoadingMore(false);
    setLoadError(null);
    const timer = window.setTimeout(() => {
      placesApi.list({
        province: selectedProvinceCode || undefined,
        category: serverCategory,
        page: 0,
        size: PAGE_SIZE,
      }).then((result) => {
        if (!alive || version !== requestVersionRef.current) return;
        setPlaces(result.items);
        setTotal(result.total);
        setNextPage(1);
      }).catch((error: unknown) => {
        if (!alive || version !== requestVersionRef.current) return;
        setPlaces([]);
        setTotal(0);
        setLoadError(errorMessage(error));
      }).finally(() => {
        if (alive && version === requestVersionRef.current) setLoading(false);
      });
    }, 160);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [selectedProvinceCode, serverCategory]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const selectedCategories = useMemo(
    () => categoryGroups.flatMap((group) =>
      [group, ...group.subtypes].filter((item) => selectedCategoryCodes.includes(item.code))),
    [categoryGroups, selectedCategoryCodes],
  );
  const visiblePlaces = useMemo(() => {
    const result = places.filter((place) => {
      if ((place.rating ?? 0) < minRating) return false;
      if (!selectedCategories.length) return true;
      const fields = [
        place.group?.code ?? '', place.group?.name ?? '',
        place.category?.code ?? '', place.category?.name ?? '',
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
      return [...result].sort((a, b) =>
        (b.rating ?? -1) - (a.rating ?? -1) || b.reviewCount - a.reviewCount);
    }
    if (sortMode === 'popular') {
      return [...result].sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return result;
  }, [places, minRating, selectedCategories, sortMode]);

  const clientFiltered = minRating > 0 || (selectedCategoryCodes.length > 0 && !serverCategory);
  const hasMore = places.length < total;
  const activeFilterCount = selectedCategoryCodes.length + (minRating > 0 ? 1 : 0);
  const heroPlaces = places.filter((place) => Boolean(place.coverUrl)).slice(0, 2);
  const quickProvinces = useMemo(() => {
    const names = ['Hà Nội', 'Hải Phòng', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Quảng Ninh'];
    return names
      .map((name) => provinces.find((province) => normalizeText(province.name) === normalizeText(name)))
      .filter((province): province is ReferenceItem => province !== undefined)
      .slice(0, 4);
  }, [provinces]);

  function updateRating(value: RatingMode) {
    const next = new URLSearchParams(params);
    if (value) next.set('rating', String(value));
    else next.delete('rating');
    setParams(next, { replace: true });
  }

  function toggleCategory(code: string) {
    if (typeParam) {
      const next = new URLSearchParams(params);
      next.delete('type');
      setParams(next, { replace: true });
    }
    setSelectedCategoryCodes((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  }

  function chooseGroup(code: string) {
    if (typeParam) {
      const next = new URLSearchParams(params);
      next.delete('type');
      setParams(next, { replace: true });
    }
    setSelectedCategoryCodes((current) => current.length === 1 && current[0] === code ? [] : [code]);
  }

  function resetFilters() {
    setSelectedCategoryCodes([]);
    setSortMode('default');
    const next = new URLSearchParams(params);
    next.delete('rating');
    next.delete('type');
    setParams(next, { replace: true });
  }

  function clearAll() {
    setSelectedCategoryCodes([]);
    setSortMode('default');
    setSearchText('');
    setSuggestionsOpen(false);
    const next = new URLSearchParams(params);
    next.delete('province');
    next.delete('q');
    next.delete('rating');
    next.delete('type');
    setParams(next, { replace: true });
  }

  function loadMore() {
    if (loading || loadingMore || !hasMore) return;
    const version = requestVersionRef.current;
    setLoadingMore(true);
    placesApi.list({
      province: selectedProvinceCode || undefined,
      category: serverCategory,
      page: nextPage,
      size: PAGE_SIZE,
    }).then((page) => {
      if (requestVersionRef.current !== version) return;
      setPlaces((current) => {
        const existing = new Set(current.map((place) => place.id));
        return [...current, ...page.items.filter((place) => !existing.has(place.id))];
      });
      setTotal(page.total);
      setNextPage((value) => value + 1);
    }).catch((error: unknown) => {
      if (requestVersionRef.current === version) setLoadError(errorMessage(error));
    }).finally(() => {
      if (requestVersionRef.current === version) setLoadingMore(false);
    });
  }

  return (
    <div className="mx-auto max-w-[1380px] pb-14">
      {/* HERO — lời mời khám phá & ảnh thật từ API */}
      <section className="relative mb-9 overflow-visible rounded-[28px] bg-[#123F3B] text-white shadow-[0_18px_50px_rgba(14,55,51,0.13)] lg:rounded-[34px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px] lg:rounded-[34px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#103D3A] via-[#145C51] to-[#0B7965]" />
          <div className="absolute -left-28 -top-32 h-80 w-80 rounded-full border-[55px] border-white/[0.035]" />
          <div className="absolute bottom-[-130px] left-[45%] h-72 w-72 rounded-full border-[45px] border-[#D2F0B8]/[0.07]" />
        </div>
        <div className="relative grid lg:grid-cols-[minmax(0,1.13fr)_minmax(320px,.87fr)]">
          <div className="relative z-20 px-6 pb-9 pt-9 sm:px-10 sm:pb-12 sm:pt-12 lg:py-14 lg:pl-12 lg:pr-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] text-[#D9F5DC]">
              <Icon name="explore" className="text-[16px]" /> SMART TRAVEL · DISCOVER
            </span>
            <h1 className="mt-6 max-w-[670px] text-[32px] font-extrabold leading-[1.13] tracking-[-0.035em] sm:text-[45px] lg:text-[50px]">
              Bạn muốn khám phá<br />
              <span className="text-[#C7F0BE]">nơi nào tiếp theo?</span>
            </h1>
            <p className="mt-4 max-w-[530px] text-[13px] leading-6 text-[#D2E6DF] sm:text-[14px]">
              Chọn tỉnh thành bạn yêu thích và tìm những trải nghiệm đáng nhớ khắp Việt Nam.
            </p>

            <div className="relative z-30 mt-7 max-w-[680px]" onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setSuggestionsOpen(false);
            }}>
              <div className="flex min-h-[62px] items-center gap-2 rounded-[18px] border border-white/25 bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.17)] focus-within:ring-[3px] focus-within:ring-[#B7EBD5]/60">
                <span className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F4EB] text-[#0D806C]">
                  <Icon name="location_on" className="text-[24px]" />
                </span>
                <input
                  ref={inputRef}
                  value={searchText}
                  onFocus={() => { setSuggestionsOpen(true); setHighlightedIndex(0); }}
                  onChange={(event) => handleSearchInput(event.target.value)}
                  onCompositionStart={() => { composingRef.current = true; }}
                  onCompositionEnd={(event) => { composingRef.current = false; handleSearchInput(event.currentTarget.value); }}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') { setSuggestionsOpen(false); return; }
                    if (event.nativeEvent.isComposing || composingRef.current) return;
                    if (event.key === 'ArrowDown' && suggestions.length) {
                      event.preventDefault();
                      setSuggestionsOpen(true);
                      setHighlightedIndex((i) => (i + 1) % suggestions.length);
                    } else if (event.key === 'ArrowUp' && suggestions.length) {
                      event.preventDefault();
                      setHighlightedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
                    } else if (event.key === 'Enter') {
                      event.preventDefault();
                      submitProvince();
                    }
                  }}
                  placeholder="Nhập tên tỉnh/thành phố..."
                  aria-label="Tìm kiếm trong danh sách tỉnh thành"
                  aria-autocomplete="list"
                  aria-expanded={suggestionsOpen && Boolean(searchText.trim())}
                  aria-controls="province-suggestion-list"
                  aria-activedescendant={suggestionsOpen && suggestions.length ? `province-option-${highlightedIndex}` : undefined}
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-[#1C4143] outline-none placeholder:font-normal placeholder:text-[#91A2A1] sm:text-[14px]"
                />
                {searchText && (
                  <button type="button" onClick={() => { clearProvince(); inputRef.current?.focus(); }} aria-label="Xóa tỉnh đã chọn" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#829A96] hover:bg-[#F0F5F2]">
                    <Icon name="close" className="text-[18px]" />
                  </button>
                )}
                <button type="button" onClick={submitProvince} className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-[12px] bg-[#0C806F] px-4 text-[12px] font-extrabold text-white transition hover:bg-[#096657] sm:px-6">
                  <Icon name="search" className="text-[19px]" /> <span className="hidden sm:inline">Khám phá</span>
                </button>
              </div>

              {/* Không dùng keyword /places; chỉ gợi ý tỉnh thành từ /reference/provinces. */}
              {suggestionsOpen && Boolean(searchText.trim()) && (
                <div id="province-suggestion-list" role="listbox" aria-label="Danh sách tỉnh thành gợi ý" className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[320px] overflow-y-auto rounded-[19px] border border-[#DCE9E3] bg-white p-2 text-[#203F42] shadow-[0_20px_48px_rgba(7,40,39,0.28)]">
                  {loadingReferences ? (
                    <p className="px-4 py-4 text-[13px] text-[#7D9090]">Đang tải danh sách tỉnh thành...</p>
                  ) : suggestions.length ? (
                    <>
                      <p className="px-3 pb-1.5 pt-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#8B9F9D]">Tỉnh/thành phù hợp</p>
                      {suggestions.map((province, index) => (
                        <button
                          key={province.code}
                          id={`province-option-${index}`}
                          role="option"
                          aria-selected={index === highlightedIndex}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onClick={() => chooseProvince(province)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-bold transition-colors ${index === highlightedIndex ? 'bg-[#E9F6F0] text-[#0A7566]' : 'text-[#34575A] hover:bg-[#F3F8F5]'}`}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#DBEFE6] text-[#0D8672]"><Icon name="location_on" className="text-[19px]" /></span>
                          <span className="flex-1">{province.name}</span>
                          <Icon name="north_west" className="text-[16px] text-[#94AAA4]" />
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-5 text-[12px] text-[#7D9290]">Không có tỉnh/thành nào phù hợp với “{searchText}”.</div>
                  )}
                </div>
              )}
              {searchNotice && <p role="alert" className="mt-2 rounded-lg bg-[#FFF4DF] px-3 py-2 text-[12px] font-semibold text-[#875B18]">{searchNotice}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-[#D5E7DC]">
                <span className="inline-flex items-center gap-1.5"><Icon name="verified" className="text-[16px] text-[#D7EEAE]" /> {provinces.length > 0 ? `${provinces.length} tỉnh/thành phố` : 'Tỉnh/thành từ hệ thống'}</span>
                <span className="inline-flex items-center gap-1.5"><Icon name="touch_app" className="text-[16px] text-[#D7EEAE]" /> Gõ tên và chọn gợi ý</span>
              </div>
            </div>
          </div>

          <div className="pointer-events-none relative hidden min-h-[410px] overflow-hidden lg:block">
            <div className="absolute -right-14 top-[-40px] h-[480px] w-[480px] rounded-full border-[40px] border-white/[0.045]" />
            <div className="absolute right-[23%] top-[48px] h-[295px] w-[230px] -rotate-[10deg] overflow-hidden rounded-[25px] border-[7px] border-white/90 bg-[#A5D9CA] shadow-[0_25px_42px_rgba(0,0,0,0.24)]">
              {heroPlaces[0]?.coverUrl ? <img src={heroPlaces[0].coverUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#9CC9B5] to-[#E6DBB4]"><Icon name="landscape" className="text-[65px] text-white" /></div>}
            </div>
            <div className="absolute right-[2%] top-[110px] h-[255px] w-[210px] rotate-[10deg] overflow-hidden rounded-[24px] border-[7px] border-white/90 bg-[#AACCB7] shadow-[0_25px_42px_rgba(0,0,0,0.25)]">
              {heroPlaces[1]?.coverUrl ? <img src={heroPlaces[1].coverUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#B9DBC7] to-[#E9D9AB]"><Icon name="beach_access" className="text-[65px] text-white" /></div>}
            </div>
            <div className="absolute bottom-7 left-[12%] flex items-center gap-2 rounded-2xl border border-white/40 bg-white/95 px-4 py-3 text-[12px] font-extrabold text-[#1D574D] shadow-lg">
              <Icon name="travel_explore" className="text-[21px] text-[#0B917C]" /> Đi khắp Việt Nam, theo cách của bạn
            </div>
          </div>
        </div>
      </section>

      {/* Gợi ý nhanh: chỉ hiện những tỉnh thực sự tồn tại trong API. */}
      {quickProvinces.length > 0 && !selectedProvinceCode && (
        <div className="mb-7 flex flex-wrap items-center gap-2.5">
          <span className="mr-1 inline-flex items-center gap-1 text-[12px] font-bold text-[#748D86]"><Icon name="trending_up" className="text-[18px]" /> Gợi ý:</span>
          {quickProvinces.map((province) => (
            <button key={province.code} type="button" onClick={() => chooseProvince(province)} className="rounded-full border border-[#DBE7E1] bg-white px-4 py-2 text-[12px] font-bold text-[#386A60] transition hover:border-[#9EDAC8] hover:bg-[#EAF7F0]">
              {province.name}
            </button>
          ))}
        </div>
      )}

      {/* Khám phá nhanh theo nhóm loại hình */}
      {categoryGroups.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0C937C]">CẢM HỨNG CHO CHUYẾN ĐI</p>
              <h2 className="mt-1 text-[22px] font-extrabold tracking-tight text-[#204346] sm:text-[25px]">Điều gì khiến bạn hứng thú?</h2>
            </div>
            <button type="button" onClick={() => setSelectedCategoryCodes([])} className="text-[12px] font-bold text-[#0C8773] hover:underline">Xem mọi loại hình</button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categoryGroups.map((group) => {
              const active = selectedCategoryCodes.length === 1 && selectedCategoryCodes[0] === group.code;
              return (
                <button
                  key={group.code}
                  type="button"
                  onClick={() => chooseGroup(group.code)}
                  aria-pressed={active}
                  className={`group flex min-h-[91px] items-center gap-3 rounded-[19px] border px-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${active ? 'border-[#0B907B] bg-[#E2F5E9] shadow-[0_8px_24px_rgba(14,115,86,0.1)]' : 'border-[#E2EBE5] bg-white hover:border-[#B8DDCB]'}`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${active ? 'bg-[#0B8F78] text-white' : 'bg-[#EAF3ED] text-[#188F78]'}`}>
                    <Icon name={GROUP_ICONS[group.code] ?? 'explore'} className="text-[25px]" />
                  </span>
                  <span className={`min-w-0 text-[12px] font-extrabold leading-5 sm:text-[13px] ${active ? 'text-[#0D7664]' : 'text-[#325755]'}`}>{group.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Toolbar: không có bộ lọc tỉnh riêng (tỉnh chỉ chọn qua Search). */}
      <section className="min-w-0">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#E0EAE4] pb-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0B927B]">KHÁM PHÁ ĐIỂM ĐẾN</p>
            <h2 className="mt-1 text-[24px] font-extrabold tracking-[-0.03em] text-[#204346] sm:text-[28px]">
              {selectedProvince ? `Điểm đến tại ${selectedProvince.name}` : 'Những nơi đáng khám phá'}
            </h2>
            <p className="mt-1.5 text-[12px] text-[#849794]">
              {loading ? 'Đang tìm những địa điểm thú vị...' : clientFiltered
                ? `${visiblePlaces.length} kết quả phù hợp trong ${places.length} địa điểm đã tải`
                : `${total} địa điểm từ hệ thống`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-[12px] font-bold transition ${filtersOpen || activeFilterCount ? 'border-[#A9DCCD] bg-[#EAF7EF] text-[#087D6E]' : 'border-[#DEE8E3] bg-white text-[#42635D] hover:border-[#B6DDCC]'}`}>
              <Icon name="tune" className="text-[20px]" /> Bộ lọc
              {activeFilterCount > 0 && <span className="rounded-full bg-[#0C8C76] px-2 py-0.5 text-[10px] text-white">{activeFilterCount}</span>}
            </button>
            <label className="flex h-11 items-center gap-2 rounded-xl border border-[#DEE8E3] bg-white px-3 text-[12px] text-[#526B68]">
              <Icon name="sort" className="text-[19px] text-[#128E79]" />
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} aria-label="Sắp xếp địa điểm đã tải" className="max-w-[130px] cursor-pointer bg-transparent text-[12px] font-semibold outline-none">
                <option value="default">Mặc định</option>
                <option value="rating">Đánh giá cao</option>
                <option value="popular">Phổ biến</option>
              </select>
            </label>
            <div className="inline-flex h-11 items-center rounded-xl border border-[#DEE8E3] bg-white p-1" role="group" aria-label="Chế độ hiển thị">
              {(['grid', 'list'] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setViewMode(mode)} aria-label={mode === 'grid' ? 'Dạng lưới' : 'Dạng danh sách'} aria-pressed={viewMode === mode} className={`flex h-9 w-9 items-center justify-center rounded-lg ${viewMode === mode ? 'bg-[#E7F5EA] text-[#0B8975]' : 'text-[#8EA5A0] hover:bg-[#F5F8F5]'}`}>
                  <Icon name={mode === 'grid' ? 'grid_view' : 'view_agenda'} className="text-[19px]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div className="mb-6 rounded-[22px] border border-[#DFEAE3] bg-white p-5 shadow-[0_10px_32px_rgba(19,52,47,0.05)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-extrabold text-[#274C49]">Tinh chỉnh trải nghiệm</h3>
                <p className="mt-1 text-[11px] text-[#81968F]">Chọn loại hình và đánh giá yêu thích</p>
              </div>
              <button type="button" onClick={resetFilters} className="text-[12px] font-bold text-[#0E8D78] hover:underline">Đặt lại</button>
            </div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(220px,.8fr)]">
              <div>
                <p className="mb-3 text-[12px] font-extrabold text-[#355C58]">Loại hình trải nghiệm</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {categoryGroups.map((group) => (
                    <details key={group.code} className="rounded-xl border border-[#E9F0EA] bg-[#FBFDFC] open:border-[#B9DECF]">
                      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-3 [&::-webkit-details-marker]:hidden">
                        <Icon name={GROUP_ICONS[group.code] ?? 'category'} className="text-[20px] text-[#0D8D76]" />
                        <span className="flex-1 text-[12px] font-bold text-[#385C59]">{group.name}</span>
                        <Icon name="expand_more" className="text-[18px] text-[#9BAD9F]" />
                      </summary>
                      <div className="space-y-1.5 border-t border-[#E8F0EA] p-2">
                        {[group, ...group.subtypes].map((item) => (
                          <label key={item.code} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-[11px] font-semibold text-[#58726A] hover:bg-[#E9F6EC]">
                            <input type="checkbox" checked={selectedCategoryCodes.includes(item.code)} onChange={() => toggleCategory(item.code)} className="h-4 w-4 accent-[#0C937C]" />
                            {item.code === group.code ? `Tất cả ${group.name}` : item.name}
                          </label>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[12px] font-extrabold text-[#355C58]">Đánh giá tối thiểu</p>
                <div className="grid grid-cols-2 gap-2">
                  {RATINGS.map((rating) => (
                    <button key={rating} type="button" onClick={() => updateRating(rating)} aria-pressed={minRating === rating} className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border text-[12px] font-bold transition ${minRating === rating ? 'border-[#0B8C77] bg-[#0B8C77] text-white' : 'border-[#DFEAE3] bg-[#FAFCFB] text-[#5F7972] hover:bg-[#EAF7EF]'}`}>
                      {rating > 0 ? <><Icon name="star" filled className="text-[17px] text-[#F0C36C]" /> {rating}+</> : 'Tất cả'}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[10px] leading-4 text-[#90A39A]">Lọc đánh giá trên các địa điểm đã tải.</p>
              </div>
            </div>
          </div>
        )}

        {(selectedProvince || activeFilterCount > 0) && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {selectedProvince && (
              <button type="button" onClick={clearProvince} className="inline-flex items-center gap-1.5 rounded-full border border-[#BFE2D1] bg-[#E8F6EF] px-3 py-1.5 text-[11px] font-bold text-[#147D67]">
                <Icon name="location_on" className="text-[15px]" /> {selectedProvince.name} <Icon name="close" className="text-[14px]" />
              </button>
            )}
            {selectedCategories.map((category) => (
              <button key={category.code} type="button" onClick={() => toggleCategory(category.code)} className="inline-flex items-center gap-1.5 rounded-full border border-[#E0EAE3] bg-white px-3 py-1.5 text-[11px] font-bold text-[#52736A]">
                {category.name} <Icon name="close" className="text-[14px]" />
              </button>
            ))}
            {minRating > 0 && (
              <button type="button" onClick={() => updateRating(0)} className="inline-flex items-center gap-1 rounded-full border border-[#F0E1BC] bg-[#FFF9E9] px-3 py-1.5 text-[11px] font-bold text-[#936D22]">
                <Icon name="star" filled className="text-[15px]" /> {minRating}+ <Icon name="close" className="text-[14px]" />
              </button>
            )}
            <button type="button" onClick={clearAll} className="px-2 text-[11px] font-bold text-[#0F8E7A] hover:underline">Xóa tất cả</button>
          </div>
        )}

        {referenceError && <div className="mb-4"><FormAlert message={`Không tải được dữ liệu bộ lọc: ${referenceError}`} /></div>}
        {loadError && <div className="mb-4"><FormAlert message={`Không tải được địa điểm: ${loadError}`} /></div>}

        {loading ? (
          <div className={viewMode === 'grid' ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-4'}>
            {Array.from({ length: viewMode === 'grid' ? 6 : 3 }, (_, index) => <PlaceSkeleton key={index} viewMode={viewMode} />)}
          </div>
        ) : visiblePlaces.length === 0 ? (
          <div className="flex min-h-[330px] flex-col items-center justify-center rounded-[24px] border border-[#E4EBE5] bg-white p-8 text-center">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-[#E6F4EB]"><Icon name="travel_explore" className="text-[36px] text-[#158E79]" /></div>
            <h3 className="mt-5 text-[17px] font-extrabold text-[#274C49]">Chưa tìm thấy điểm đến phù hợp</h3>
            <p className="mt-2 max-w-[400px] text-[12px] leading-6 text-[#7D938C]">Hãy thử chọn tỉnh/thành khác hoặc điều chỉnh bộ lọc. Những địa điểm phù hợp có thể nằm ở trang kết quả tiếp theo.</p>
            <button type="button" onClick={clearAll} className="mt-5 rounded-xl bg-[#0B8976] px-5 py-3 text-[12px] font-extrabold text-white hover:bg-[#086B5E]">Khám phá tất cả</button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-4'}>
            {visiblePlaces.map((place) => (
              <DestinationCard key={place.id} place={place} viewMode={viewMode} favorite={favoriteSet.has(String(place.id))} onToggleFavorite={() => toggleFavorite(String(place.id))} />
            ))}
          </div>
        )}

        {!loading && hasMore && (
          <div className="mt-9 flex flex-col items-center gap-2">
            <button type="button" onClick={loadMore} disabled={loadingMore} className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#B8DCCB] bg-white px-7 text-[12px] font-extrabold text-[#0B816F] transition hover:bg-[#EAF7ED] disabled:opacity-60">
              <Icon name={loadingMore ? 'hourglass_top' : 'expand_more'} className="text-[20px]" />
              {loadingMore ? 'Đang tải thêm...' : 'Xem thêm địa điểm'}
            </button>
            <p className="text-[11px] text-[#94A7A0]">Đã tải {places.length}/{total} địa điểm</p>
          </div>
        )}
        {sortMode !== 'default' && !loading && (
          <p className="mt-4 text-center text-[10px] text-[#9AABA3]">Sắp xếp áp dụng trên các địa điểm đã tải.</p>
        )}
      </section>
    </div>
  );
}
