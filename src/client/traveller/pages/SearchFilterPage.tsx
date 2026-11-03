import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { normalizeText, PLACES } from '@/client/traveller/data/places';
import PageBar from '@/client/ui/PageBar';

type Region = 'all' | 'north' | 'central' | 'south';
type Category = 'culture' | 'food' | 'beach' | 'adventure' | 'shopping' | 'art';
type PriceTier = 'free' | 'budget' | 'mid' | 'premium' | 'custom';

interface SearchFilters {
  region: Region;
  destinationQuery: string;
  categories: Category[];
  maxPrice: number;
  priceTier: PriceTier;
  minRating: 0 | 3.5 | 4 | 4.5;
  distanceKm: 5 | 15 | 30 | null;
  openNow: boolean;
  parking: boolean;
  familyFriendly: boolean;
}

const MAX_PRICE = 2_500_000;

const INITIAL_FILTERS: SearchFilters = {
  region: 'all',
  destinationQuery: '',
  categories: ['culture', 'food'],
  maxPrice: 1_200_000,
  priceTier: 'mid',
  minRating: 4.5,
  distanceKm: 15,
  openNow: true,
  parking: false,
  familyFriendly: true,
};

const REGIONS: { id: Region; title: string; subtitle: string }[] = [
  { id: 'all', title: 'Tất cả Việt Nam', subtitle: '63 tỉnh thành phố' },
  { id: 'north', title: 'Miền Bắc', subtitle: 'Hà Nội, Hạ Long, Sa Pa' },
  { id: 'central', title: 'Miền Trung', subtitle: 'Đà Nẵng, Hội An, Huế' },
  { id: 'south', title: 'Miền Nam', subtitle: 'Sài Gòn, Phú Quốc, Cần Thơ' },
];

const CATEGORIES: { id: Category; title: string; icon: string }[] = [
  { id: 'culture', title: 'Văn hóa & Lịch sử', icon: 'account_balance' },
  { id: 'food', title: 'Ẩm thực truyền thống', icon: 'restaurant' },
  { id: 'beach', title: 'Bãi biển & Nghỉ dưỡng', icon: 'beach_access' },
  { id: 'adventure', title: 'Leo núi & Thiên nhiên', icon: 'hiking' },
  { id: 'shopping', title: 'Chợ & Mua sắm', icon: 'shopping_bag' },
  { id: 'art', title: 'Nghệ thuật & Check-in', icon: 'photo_camera' },
];

const PRICE_TIERS: { id: PriceTier; title: string; price: number }[] = [
  { id: 'free', title: 'Miễn phí (0đ)', price: 0 },
  { id: 'budget', title: 'Bình dân (< 500k)', price: 500_000 },
  { id: 'mid', title: 'Tầm trung (500k - 1tr)', price: 1_200_000 },
  { id: 'premium', title: 'Cao cấp (> 1tr)', price: MAX_PRICE },
];

const RATINGS: { label: string; value: SearchFilters['minRating'] }[] = [
  { label: 'Tất cả', value: 0 },
  { label: '⭐ 4.5+ Tuyệt vời', value: 4.5 },
  { label: '⭐ 4.0+ Rất tốt', value: 4 },
  { label: '⭐ 3.5+ Tốt', value: 3.5 },
];

const DISTANCES: { label: string; value: SearchFilters['distanceKm'] }[] = [
  { label: '< 5 km', value: 5 },
  { label: '< 15 km', value: 15 },
  { label: '< 30 km', value: 30 },
  { label: 'Toàn tỉnh', value: null },
];

const formatPrice = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function FilterSection({
  icon,
  title,
  rightText,
  children,
}: {
  icon: string;
  title: string;
  rightText?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-4 rounded-[20px] bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-[#16394D]">
          <Icon name={icon} className="text-[20px] text-[#007B73]" />
          {title}
        </h2>
        {rightText && (
          <span className="rounded-full bg-[#F1F2FF] px-2 py-1 text-[10px] font-semibold text-[#007B73]">
            {rightText}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function SelectButton({
  title,
  selected,
  onClick,
}: {
  title: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-[43px] rounded-xl px-2 py-2 text-center text-[11px] font-bold ${
        selected ? 'bg-[#96EDE3] text-[#006D65]' : 'bg-[#F0F1FF] text-[#455672]'
      }`}
    >
      {title}
    </button>
  );
}

function SwitchRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-2">
      <Icon name={icon} className="text-[20px] text-[#007B73]" />
      <span className="flex-1 text-[12px] font-semibold text-[#16394D]">{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 ${
          checked ? 'bg-[#007B73]' : 'bg-[#E0E4F9]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </label>
  );
}

/** Bộ lọc tìm kiếm — theo SearchFilterScreen của mobile; hiện lọc thật theo từ khoá + đánh giá */
export default function SearchFilterPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
  const update = (changes: Partial<SearchFilters>) =>
    setFilters((previous) => ({ ...previous, ...changes }));
  const reset = () => setFilters(INITIAL_FILTERS);

  const toggleCategory = (category: Category) =>
    setFilters((previous) => ({
      ...previous,
      categories: previous.categories.includes(category)
        ? previous.categories.filter((item) => item !== category)
        : [...previous.categories, category],
    }));

  const keyword = normalizeText(filters.destinationQuery);
  const resultCount = PLACES.filter(
    (place) =>
      place.rating >= filters.minRating &&
      (!keyword || normalizeText(`${place.name} ${place.location} ${place.tag}`).includes(keyword)),
  ).length;

  const apply = () => {
    const params = new URLSearchParams();
    if (filters.destinationQuery.trim()) params.set('q', filters.destinationQuery.trim());
    if (filters.minRating > 0) params.set('rating', String(filters.minRating));
    const query = params.toString();
    navigate(query ? `${CLIENT_ROUTES.EXPLORE}?${query}` : CLIENT_ROUTES.EXPLORE);
  };

  return (
    <div className="mx-auto max-w-3xl pb-24 md:pb-4">
      <PageBar
        title="Bộ Lọc Tìm Kiếm"
        backTo={CLIENT_ROUTES.EXPLORE}
        actions={
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 rounded-full bg-[#EFEFFC] px-3 py-2 text-[11px] font-bold text-[#007B73]"
          >
            <Icon name="refresh" className="text-[16px]" />
            Đặt lại bộ lọc
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#F0F1FF] px-3 py-3.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
          <Icon name="manage_search" className="text-[24px] text-[#007B73]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold tracking-[0.05em] text-[#007B73]">
            BỘ LỌC THÔNG MINH AI
          </p>
          <p className="mt-1 text-[11px] text-[#6E829B]">
            Tự động gợi ý kết quả điểm tham quan phù hợp
          </p>
        </div>
        <Icon name="auto_awesome" className="text-[21px] text-[#C78A19]" />
      </div>

      <FilterSection icon="location_on" title="Vùng miền & Điểm đến" rightText="Chọn 1">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {REGIONS.map((region) => {
            const selected = filters.region === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => update({ region: region.id })}
                aria-pressed={selected}
                className={`min-h-[78px] rounded-xl p-3 text-left ${
                  selected ? 'bg-[#96EDE3]' : 'bg-[#F0F1FF]'
                }`}
              >
                <span className="flex items-center justify-between gap-1">
                  <span
                    className={`text-[13px] font-extrabold ${selected ? 'text-[#006D65]' : 'text-[#16394D]'}`}
                  >
                    {region.title}
                  </span>
                  {selected && (
                    <Icon name="check_circle" filled className="text-[17px] text-[#007B73]" />
                  )}
                </span>
                <span
                  className={`mt-1.5 block text-[10px] leading-[15px] ${selected ? 'text-[#217F79]' : 'text-[#8190AA]'}`}
                >
                  {region.subtitle}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center rounded-xl bg-[#F1F2FF] px-3 focus-within:ring-2 focus-within:ring-primary/30">
          <Icon name="search" className="text-[19px] text-[#8E9BB3]" />
          <input
            value={filters.destinationQuery}
            onChange={(event) => update({ destinationQuery: event.target.value })}
            placeholder="Tìm tỉnh/thành phố, quận huyện cụ thể..."
            aria-label="Tìm tỉnh/thành phố"
            className="ml-2 h-12 flex-1 bg-transparent text-[12px] text-[#16394D] placeholder:text-[#9BA7BA] focus:outline-none"
          />
        </div>
      </FilterSection>

      <FilterSection icon="category" title="Danh mục trải nghiệm" rightText="Đa chọn">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const selected = filters.categories.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                aria-pressed={selected}
                className={`flex items-center gap-2 rounded-full px-3 py-2.5 text-[12px] font-bold ${
                  selected ? 'bg-[#96EDE3] text-[#006D65]' : 'bg-[#F0F1FF] text-[#405873]'
                }`}
              >
                <Icon name={category.icon} className="text-[17px]" />
                {category.title}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection
        icon="payments"
        title="Khoảng giá dự kiến"
        rightText={`0 đ - ${formatPrice(filters.maxPrice)} đ`}
      >
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={100_000}
          value={filters.maxPrice}
          onChange={(event) =>
            update({ maxPrice: Number(event.target.value), priceTier: 'custom' })
          }
          aria-label="Điều chỉnh khoảng giá tối đa"
          className="h-[35px] w-full cursor-pointer accent-[#007B73]"
        />
        <div className="mb-3 flex justify-between text-[10px] text-[#8494A7]">
          <span>0 đ</span>
          <span className="font-semibold text-[#668198]">1.000.000 đ</span>
          <span>2.500.000+ đ</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {PRICE_TIERS.map((tier) => (
            <SelectButton
              key={tier.id}
              title={tier.title}
              selected={filters.priceTier === tier.id}
              onClick={() => update({ priceTier: tier.id, maxPrice: tier.price })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection icon="star" title="Đánh giá chất lượng">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {RATINGS.map((item) => (
            <SelectButton
              key={item.value}
              title={item.label}
              selected={filters.minRating === item.value}
              onClick={() => update({ minRating: item.value })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection icon="near_me" title="Khoảng cách từ bạn">
        <div className="grid grid-cols-4 gap-2">
          {DISTANCES.map((item) => (
            <SelectButton
              key={item.label}
              title={item.label}
              selected={filters.distanceKm === item.value}
              onClick={() => update({ distanceKm: item.value })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection icon="verified_user" title="Tiện ích & Trạng thái">
        <SwitchRow
          icon="schedule"
          label="Đang mở cửa ngay bây giờ"
          checked={filters.openNow}
          onChange={(value) => update({ openNow: value })}
        />
        <SwitchRow
          icon="directions_car"
          label="Có bãi đỗ xe ô tô / xe máy"
          checked={filters.parking}
          onChange={(value) => update({ parking: value })}
        />
        <SwitchRow
          icon="groups"
          label="Phù hợp gia đình & trẻ nhỏ"
          checked={filters.familyFriendly}
          onChange={(value) => update({ familyFriendly: value })}
        />
      </FilterSection>

      <section className="mb-3 rounded-[20px] bg-[#F0F1FF] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-extrabold text-[#16394D]">Gợi ý tìm kiếm nhanh</h2>
          <button
            type="button"
            onClick={reset}
            className="text-[10px] font-semibold text-[#007B73]"
          >
            Xem tất cả
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              region: 'north' as Region,
              query: 'Vịnh Hạ Long',
              emoji: '🏝️',
              count: 124,
              bg: 'bg-[#C8F1F0]',
            },
            {
              region: 'central' as Region,
              query: 'Phố cổ Hội An',
              emoji: '🏮',
              count: 256,
              bg: 'bg-[#FFE7B6]',
            },
          ].map((item) => (
            <button
              key={item.query}
              type="button"
              onClick={() => update({ region: item.region, destinationQuery: item.query })}
              className="flex items-center gap-2 rounded-xl bg-white p-2 text-left"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-[23px] ${item.bg}`}
              >
                {item.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-bold text-[#164155]">
                  {item.query}
                </span>
                <span className="block text-[9px] text-[#8295A9]">{item.count} điểm đến</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-[62px] z-20 flex items-center gap-3 border-t border-[#ECEEF4] bg-white px-4 py-3 md:static md:mt-4 md:rounded-[20px] md:border-0">
        <button
          type="button"
          onClick={reset}
          aria-label="Xóa bộ lọc"
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#F0F1FF] text-[#6B7D9D]"
        >
          <Icon name="filter_list_off" className="text-[23px]" />
        </button>
        <button
          type="button"
          onClick={apply}
          className="flex h-[52px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[#007B73] px-3 text-[13px] font-extrabold text-white shadow-md hover:bg-primary"
        >
          Áp dụng bộ lọc (Xem {resultCount} kết quả)
          <Icon name="arrow_forward" className="text-[20px]" />
        </button>
      </div>
    </div>
  );
}
