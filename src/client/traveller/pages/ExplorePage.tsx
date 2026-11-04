import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { referenceApi } from '@/client/api/referenceApi';
import { placesApi } from '@/client/api/placesApi';
import { errorMessage } from '@/client/api/http';
import type { ReferenceItem, CategoryGroup, PlaceSummary } from '@/client/api/types';
import { Icon } from '@/components/common';
import { placePath } from '@/client/routePaths';
import FavoriteButton from '@/client/traveller/components/FavoriteButton';
import { useTraveller } from '@/client/traveller/travellerContext';
import { FormAlert, Spinner } from '@/client/ui/Blocks';

type ViewMode = 'list' | 'grid';

// Phục vụ riêng thanh tìm kiếm tỉnh/thành và bộ lọc của HuyNgo.
function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

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

/** Danh sách và card từ main; chỉ giữ search tỉnh/thành và sidebar từ HuyNgo. */
export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const { favorites, toggleFavorite } = useTraveller();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const query = params.get('q') ?? '';
  const minRating = Number(params.get('rating') ?? 0) || 0;

  // Search + sidebar của HuyNgo.
  const [searchText, setSearchText] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [provinces, setProvinces] = useState<ReferenceItem[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(true);
  const [referenceError, setReferenceError] = useState('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCategoryCodes, setSelectedCategoryCodes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // Dữ liệu địa điểm thực tế của main.
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setSearchText(query);
  }, [query]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([referenceApi.provinces(), referenceApi.categories()]).then(
      ([provinceResult, categoryResult]) => {
        if (!active) return;
        const failures: string[] = [];
        if (provinceResult.status === 'fulfilled') {
          setProvinces(provinceResult.value);
        } else {
          failures.push(`Tỉnh/thành: ${errorMessage(provinceResult.reason)}`);
        }
        if (categoryResult.status === 'fulfilled') {
          setCategoryGroups(categoryResult.value);
        } else {
          failures.push(`Danh mục: ${errorMessage(categoryResult.reason)}`);
        }
        setReferenceError(failures.join(' | '));
        setLoadingReferences(false);
      },
    );
    return () => { active = false; };
  }, []);

  // Giữ cách main gọi API (có debounce); bổ sung mã tỉnh để search của HuyNgo hoạt động.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    const timer = window.setTimeout(() => {
      placesApi
        .list({
          keyword: selectedProvinceCode ? '' : query,
          province: selectedProvinceCode || undefined,
          size: 60,
        })
        .then((page) => { if (active) setPlaces(page.items); })
        .catch((failure: unknown) => {
          if (active) {
            setPlaces([]);
            setLoadError(errorMessage(failure));
          }
        })
        .finally(() => { if (active) setLoading(false); });
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, selectedProvinceCode]);

  const setQuery = (value: string) => {
    const next = new URLSearchParams(params);
    if (value.trim()) next.set('q', value.trim());
    else next.delete('q');
    setParams(next, { replace: true });
  };

  const setRating = (rating: number) => {
    const next = new URLSearchParams(params);
    if (rating > 0) next.set('rating', String(rating));
    else next.delete('rating');
    setParams(next, { replace: true });
  };

  const resetFilters = () => {
    setSelectedProvinceCode('');
    setSelectedCategoryCodes([]);
    setMaxPrice(null);
    setSearchText('');
    setShowSuggestions(false);
    const next = new URLSearchParams(params);
    next.delete('q');
    next.delete('rating');
    setParams(next, { replace: true });
  };

  const suggestedProvinces = useMemo(() => {
    const keyword = normalizeText(searchText);
    return provinces
      .filter((province) => normalizeText(province.name).includes(keyword))
      .sort((a, b) => {
        const aFirst = normalizeText(a.name).startsWith(keyword) ? 0 : 1;
        const bFirst = normalizeText(b.name).startsWith(keyword) ? 0 : 1;
        return aFirst - bFirst || a.name.localeCompare(b.name, 'vi');
      })
      .slice(0, 12);
  }, [provinces, searchText]);

  const selectedProvince = provinces.find((item) => item.code === selectedProvinceCode);
  const selectedCategories = useMemo(
    () => categoryGroups.flatMap((group) =>
      [group, ...group.subtypes].filter((item) => selectedCategoryCodes.includes(item.code))
    ),
    [categoryGroups, selectedCategoryCodes],
  );

  // Rating theo main; tỉnh và danh mục được áp dụng thêm từ sidebar HuyNgo.
  // Giá không tồn tại trong PlaceSummary của main, không tự giả định có thể lọc được.
  const visiblePlaces = useMemo(() => places.filter((place) => {
    if ((place.rating ?? 0) < minRating) return false;
    if (selectedProvince) {
      const province = place.province?.name ?? '';
      if (normalizeText(province) !== normalizeText(selectedProvince.name)) return false;
    }
    if (selectedCategories.length > 0) {
      const categoryCode = place.category && 'code' in place.category
        ? String(place.category.code ?? '')
        : '';
      const fields = [
        place.group?.code ?? '',
        place.group?.name ?? '',
        categoryCode,
        place.category?.name ?? '',
      ].map(normalizeText);
      if (!selectedCategories.some((item) => {
        const code = normalizeText(item.code);
        const name = normalizeText(item.name);
        return fields.some((field) => field === code || field === name || (name && field.includes(name)));
      })) return false;
    }
    return true;
  }), [places, minRating, selectedProvince, selectedCategories]);

  const toggleCategory = (code: string) => {
    setSelectedCategoryCodes((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    );
  };

  return (
    <div className="mx-auto max-w-7xl pb-6">

      {/* Nút mở bộ lọc trên điện thoại */}
      <button
        type="button"
        onClick={() =>
          setMobileFiltersOpen((value) => !value)
        }
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#087A78] shadow-sm lg:hidden"
      >
        <Icon
          name="tune"
          className="text-[20px]"
        />
        {mobileFiltersOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
      </button>

      <div className="grid items-start gap-5 lg:grid-cols-[285px_minmax(0,1fr)]">


        {/* BỘ LỌC DỌC BÊN TRÁI           */}



        {/* ============================= */}
        {/* BỘ LỌC DỌC BÊN TRÁI - PREMIUM */}
        {/* ============================= */}

        <aside
          className={`${
            mobileFiltersOpen ? 'block' : 'hidden'
          } min-w-0 overflow-hidden rounded-[26px] border border-[#E3EEEF] bg-white shadow-[0_12px_40px_rgba(14,79,91,0.08)] lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto`}
        >
          {/* HEADER */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#087F79] via-[#087A78] to-[#125A70] px-5 pb-6 pt-5 text-white">

            {/* Họa tiết nền */}
            <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border-[22px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-14 right-10 h-28 w-28 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner">
                  <Icon
                    name="tune"
                    className="text-[23px] text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-[11px] font-bold text-white transition-all hover:bg-white/25"
                >
                  <Icon name="refresh" className="text-[15px]" />
                  Đặt lại
                </button>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B8F2EA]">
                Smart Travel Explorer
              </p>

              <h2 className="mt-1 text-[21px] font-extrabold tracking-tight">
                Bộ lọc khám phá
              </h2>

              <p className="mt-2 text-[12px] leading-[19px] text-[#D3F4F0]">
                Tùy chỉnh trải nghiệm và tìm những địa điểm phù hợp với bạn.
              </p>

              <div className="mt-4 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold">
          <Icon name="check_circle" className="text-[15px]" />
          {selectedCategoryCodes.length +
            (maxPrice !== null ? 1 : 0) +
            (minRating > 0 ? 1 : 0)}{' '}
          bộ lọc đang chọn
        </span>
              </div>
            </div>
          </div>

          <div className="space-y-5 bg-[#FBFDFE] p-4">

            {/* DANH MỤC TRẢI NGHIỆM */}
            <section className="rounded-[20px] border border-[#EDF1F5] bg-white p-4 shadow-[0_3px_12px_rgba(19,54,74,0.035)]">

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#E4F6F2]">
                  <Icon
                    name="category"
                    className="text-[21px] text-[#087F79]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-extrabold text-[#17384B]">
                    Danh mục trải nghiệm
                  </h3>
                  <p className="mt-0.5 text-[10px] text-[#8A9AAB]">
                    Chọn loại hình bạn yêu thích
                  </p>
                </div>

                {selectedCategoryCodes.length > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#087F79] px-1.5 text-[10px] font-bold text-white">
            {selectedCategoryCodes.length}
          </span>
                )}
              </div>

              {loadingReferences && (
                <div className="flex items-center gap-2 rounded-xl bg-[#F3F8FA] px-3 py-3 text-[11px] text-[#718394]">
                  <Icon
                    name="sync"
                    className="text-[17px] text-[#087F79]"
                  />
                  Đang tải danh mục...
                </div>
              )}

              {!loadingReferences && categoryGroups.length === 0 && (
                <div className="rounded-xl bg-[#F4F7FA] px-3 py-4 text-center text-[11px] text-[#8292A4]">
                  Chưa có danh mục để hiển thị
                </div>
              )}

              <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                {categoryGroups.map((group) => {
                  const selectedCount = [
                    group,
                    ...group.subtypes,
                  ].filter((item) =>
                    selectedCategoryCodes.includes(item.code)
                  ).length;

                  return (
                    <details
                      key={group.code}
                      className="group overflow-hidden rounded-[14px] border border-[#E8EEF1] bg-[#FAFCFD] transition-colors open:border-[#BCE9E1] open:bg-[#F6FCFA]"
                    >
                      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3 py-3 text-left [&::-webkit-details-marker]:hidden">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#E4F6F2]">
                  <Icon
                    name="local_activity"
                    className="text-[17px] text-[#087F79]"
                  />
                </span>

                        <span className="min-w-0 flex-1 text-[12px] font-bold leading-[17px] text-[#254458]">
                  {group.name}
                </span>

                        {selectedCount > 0 && (
                          <span className="rounded-full bg-[#D8F5EC] px-2 py-0.5 text-[10px] font-bold text-[#087F79]">
                    {selectedCount}
                  </span>
                        )}

                        <Icon
                          name="expand_more"
                          className="text-[19px] text-[#8B9DAA] transition-transform duration-200 group-open:rotate-180"
                        />
                      </summary>

                      <div className="space-y-1.5 border-t border-[#E6F0ED] px-2.5 py-3">
                        {[group, ...group.subtypes].map((item) => {
                          const checked =
                            selectedCategoryCodes.includes(item.code);

                          return (
                            <label
                              key={`${group.code}-${item.code}`}
                              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-200 ${
                                checked
                                  ? 'border-[#A8E8DA] bg-[#E8F9F4] text-[#087F79]'
                                  : 'border-transparent bg-white text-[#576D7D] hover:border-[#D8ECE7] hover:bg-[#F3FAF8]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  toggleCategory(item.code)
                                }
                                className="h-4 w-4 shrink-0 cursor-pointer rounded accent-[#087F79]"
                              />

                              <span className="min-w-0 flex-1 text-[11px] font-semibold leading-[17px]">
                        {item === group
                          ? `Tất cả ${item.name}`
                          : item.name}
                      </span>

                              {checked && (
                                <Icon
                                  name="check_circle"
                                  className="text-[16px] text-[#087F79]"
                                />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>

            {/* KHOẢNG GIÁ */}
            <section className="rounded-[20px] border border-[#EDF1F5] bg-white p-4 shadow-[0_3px_12px_rgba(19,54,74,0.035)]">

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#FFF2DC]">
                  <Icon
                    name="payments"
                    className="text-[21px] text-[#D39939]"
                  />
                </div>

                <div>
                  <h3 className="text-[13px] font-extrabold text-[#17384B]">
                    Khoảng giá dự kiến
                  </h3>

                  <p className="mt-0.5 text-[10px] text-[#8A9AAB]">
                    Chi phí phù hợp ngân sách
                  </p>
                </div>
              </div>

              <div className="relative">
                <select
                  disabled
                  title="API địa điểm hiện chưa có dữ liệu giá để lọc"
                  value={
                    maxPrice === null ? 'all' : String(maxPrice)
                  }
                  onChange={(event) =>
                    setMaxPrice(
                      event.target.value === 'all'
                        ? null
                        : Number(event.target.value)
                    )
                  }
                  className="h-12 w-full appearance-none rounded-[13px] border border-[#E0E9ED] bg-[#F7FAFC] pl-3.5 pr-10 text-[12px] font-bold text-[#254458] outline-none transition-all focus:border-[#087F79] focus:bg-white focus:ring-[3px] focus:ring-[#087F79]/10"
                >
                  <option value="all">Tất cả mức giá</option>
                  <option value="0">Miễn phí</option>
                  <option value="500000">Dưới 500.000đ</option>
                  <option value="1200000">Dưới 1.200.000đ</option>
                  <option value="2500000">Dưới 2.500.000đ</option>
                </select>

                <Icon
                  name="keyboard_arrow_down"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[21px] text-[#74899A]"
                />
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#FFF9ED] p-3">
                <Icon
                  name="info"
                  className="mt-0.5 text-[16px] text-[#D39939]"
                />
                <p className="text-[10px] leading-[16px] text-[#9E8353]">
                  API địa điểm hiện chưa cung cấp giá; phần lọc giá sẽ được bật khi Backend hỗ trợ.
                </p>
              </div>
            </section>

            {/* ĐÁNH GIÁ CHẤT LƯỢNG */}
            <section className="rounded-[20px] border border-[#EDF1F5] bg-white p-4 shadow-[0_3px_12px_rgba(19,54,74,0.035)]">

              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#FFF5DB]">
                  <Icon
                    name="star"
                    filled
                    className="text-[21px] text-[#E6A62D]"
                  />
                </div>

                <div>
                  <h3 className="text-[13px] font-extrabold text-[#17384B]">
                    Đánh giá chất lượng
                  </h3>

                  <p className="mt-0.5 text-[10px] text-[#8A9AAB]">
                    Ưu tiên địa điểm được yêu thích
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Tất cả', value: 0 },
                  { label: '3.5+', value: 3.5 },
                  { label: '4.0+', value: 4 },
                  { label: '4.5+', value: 4.5 },
                ].map((item) => {
                  const selected = minRating === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRating(item.value)}
                      aria-pressed={selected}
                      className={`flex min-h-[46px] items-center justify-center gap-1.5 rounded-xl border text-[12px] font-extrabold transition-all duration-200 ${
                        selected
                          ? 'border-[#087F79] bg-gradient-to-r from-[#087F79] to-[#0B998C] text-white shadow-[0_4px_12px_rgba(8,127,121,0.22)]'
                          : 'border-[#E7EDF1] bg-[#F7F9FC] text-[#65798B] hover:border-[#B8E9DE] hover:bg-[#EBF8F4]'
                      }`}
                    >
                      {item.value > 0 && (
                        <Icon
                          name="star"
                          filled
                          className={`text-[17px] ${
                            selected
                              ? 'text-[#FFE3A0]'
                              : 'text-[#E7AE43]'
                          }`}
                        />
                      )}

                      {item.label}

                      {selected && (
                        <Icon
                          name="check"
                          className="text-[14px] text-white"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* TIỆN ÍCH & TRẠNG THÁI */}
            <section className="rounded-[20px] border border-[#EDF1F5] bg-white p-4 shadow-[0_3px_12px_rgba(19,54,74,0.035)]">

              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#EFF0FF]">
                  <Icon
                    name="verified_user"
                    className="text-[21px] text-[#8175C8]"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-extrabold text-[#17384B]">
                    Tiện ích & trạng thái
                  </h3>

                  <p className="mt-0.5 text-[10px] text-[#8A9AAB]">
                    Thông tin trải nghiệm
                  </p>
                </div>
              </div>

              <div className="rounded-[14px] border border-dashed border-[#D9E2EF] bg-[#F8F9FE] px-3 py-3">
                <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[#50617C]">
            Bộ lọc nâng cao
          </span>

                  <span className="shrink-0 rounded-full bg-[#E9E8FC] px-2 py-1 text-[9px] font-bold text-[#7A70B8]">
            Sắp có
          </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { icon: 'schedule', title: 'Đang mở cửa' },
                    { icon: 'local_parking', title: 'Có bãi đỗ xe' },
                    { icon: 'family_restroom', title: 'Phù hợp gia đình' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-2.5 text-[11px] text-[#9BA9B8]"
                    >
                      <Icon
                        name={item.icon}
                        className="text-[17px] text-[#A4B1C0]"
                      />
                      <span>{item.title}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-3 border-t border-[#E6EAF1] pt-2 text-[10px] leading-[16px] text-[#98A5B5]">
                  Các tiêu chí này sẽ hoạt động khi Backend cung cấp dữ liệu tương ứng.
                </p>
              </div>
            </section>

            {/* HIỂN THỊ LỖI API */}
            {referenceError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-[14px] border border-red-100 bg-red-50 p-3"
              >
                <Icon
                  name="error_outline"
                  className="mt-0.5 text-[18px] text-red-500"
                />
                <p className="text-[11px] leading-5 text-red-700">
                  {referenceError}
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 border-t border-[#EAF0F2] bg-white/95 p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
      <span className="text-[11px] font-medium text-[#8B9DAA]">
        Kết quả phù hợp
      </span>

              <span className="text-[16px] font-extrabold text-[#087F79]">
        {visiblePlaces.length}
                <span className="ml-1 text-[11px] font-medium text-[#8B9DAA]">
          địa điểm
        </span>
      </span>
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="group flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#087F79] to-[#089F92] text-[13px] font-extrabold text-white shadow-[0_5px_16px_rgba(8,127,121,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(8,127,121,0.3)] active:translate-y-0"
            >
              Xem {visiblePlaces.length} kết quả
              <Icon
                name="arrow_forward"
                className="text-[19px] transition-transform group-hover:translate-x-1"
              />
            </button>

            <p className="mt-3 text-center text-[10px] text-[#A0AEBB]">
              Khám phá Việt Nam theo cách của bạn
            </p>
          </div>
        </aside>


        {/* ============================= */}
        {/* NỘI DUNG EXPLORE BÊN PHẢI    */}
        {/* ============================= */}

        <main className="min-w-0">

          {/* Thanh tìm kiếm */}
          <div className="sticky top-16 z-20 -mx-1 bg-client-bg px-1 pt-1 pb-3">
            <div
              className="relative"
              onBlur={(event) => {
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget
                  )
                ) {
                  setShowSuggestions(false);
                }
              }}
            >
              <div className="flex h-12 items-center rounded-full border border-[#E3E7F0] bg-white px-4 focus-within:ring-2 focus-within:ring-primary/30">
                <Icon
                  name="search"
                  className="text-[21px] text-[#7E8797]"
                />

                <input
                  value={searchText}
                  onFocus={() =>
                    setShowSuggestions(true)
                  }
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setSelectedProvinceCode('');
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.nativeEvent.isComposing
                    ) {
                      return;
                    }

                    if (event.key === 'Enter') {
                      setQuery(searchText);
                      setShowSuggestions(false);
                    }

                    if (event.key === 'Escape') {
                      setShowSuggestions(false);
                    }
                  }}
                  placeholder="Tìm tỉnh/thành, điểm đến..."
                  aria-label="Tìm kiếm điểm đến"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                  aria-controls="province-suggestions"
                  autoComplete="off"
                  className="ml-2 h-full min-w-0 flex-1 bg-transparent text-[13px] text-[#13364A] placeholder:text-[#9CA3AF] focus:outline-none"
                />

                {searchText && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchText('');
                      setSelectedProvinceCode('');
                      setQuery('');
                      setShowSuggestions(true);
                    }}
                    aria-label="Xóa từ khóa"
                  >
                    <Icon
                      name="cancel"
                      filled
                      className="text-[18px] text-[#A4ADC1]"
                    />
                  </button>
                )}
              </div>

              {/* Gợi ý tỉnh/thành */}
              {showSuggestions && (
                <div
                  id="province-suggestions"
                  className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-[#E3E7F0] bg-white py-2 shadow-xl"
                >
                  <p className="px-4 py-2 text-xs font-bold text-[#72818C]">
                    Gợi ý tỉnh/thành
                  </p>

                  {loadingReferences ? (
                    <p className="px-4 py-3 text-sm text-[#72818C]">
                      Đang tải...
                    </p>
                  ) : suggestedProvinces.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-[#72818C]">
                      Không có tỉnh/thành phù hợp.
                    </p>
                  ) : (
                    suggestedProvinces.map((province) => (
                      <button
                        key={province.code}
                        type="button"
                        onClick={() => {
                          setSearchText(province.name);
                          setSelectedProvinceCode(
                            province.code
                          );
                          setQuery(province.name);
                          setShowSuggestions(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-[#E9F7F4]"
                      >
                        <Icon
                          name="location_on"
                          className="text-[20px] text-[#087A78]"
                        />
                        {province.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {loadError && (
            <FormAlert message={`Không tải được danh sách địa điểm: ${loadError}`} />
          )}

          <div className="mt-1 mb-3 flex items-center justify-between gap-2">
            <p className="flex min-w-0 flex-1 items-center gap-1.5 text-[11px] text-[#72818C]">
              <Icon name="travel_explore" className="text-[16px] text-[#087A78]" />
              <span className="truncate">
                Tìm thấy <b className="font-extrabold text-[#13364A]">{visiblePlaces.length}</b> địa điểm tuyệt vời tại Việt Nam
              </span>
            </p>
            {minRating > 0 && (
              <button type="button" onClick={() => setRating(0)}
                      className="flex items-center gap-1 rounded-full bg-[#C3F8F0] px-2.5 py-1 text-[10px] font-bold text-[#075C66]">
                ⭐ {minRating}+ <Icon name="close" className="text-[13px]" />
              </button>
            )}
            <div className="flex gap-1" role="group" aria-label="Kiểu hiển thị">
              {([
                { id: 'list', icon: 'view_agenda', label: 'Danh sách' },
                { id: 'grid', icon: 'grid_view', label: 'Lưới' },
              ] as { id: ViewMode; icon: string; label: string }[]).map((item) => (
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
              <p className="mt-1 text-[12px] text-[#72818C]">Thử từ khoá khác hoặc chọn danh mục khác nhé.</p>
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
        </main>
      </div>
    </div>
  );
}
