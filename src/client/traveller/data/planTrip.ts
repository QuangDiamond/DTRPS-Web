/**
 * Lựa chọn của màn Lập kế hoạch chuyến đi (giống constants/planTrip.ts của mobile).
 * Danh sách điểm đến lấy từ danh mục tỉnh/thành của hệ thống (GET /api/reference/provinces).
 */

export type CompanionId = 'solo' | 'couple' | 'family' | 'friends';

export const COMPANION_OPTIONS: {
  id: CompanionId;
  label: string;
  note: string;
  icon: string;
  defaultCount: number;
}[] = [
  { id: 'solo', label: 'Solo', note: '1 người', icon: 'person', defaultCount: 1 },
  { id: 'couple', label: 'Cặp đôi', note: '2 người lớn', icon: 'favorite', defaultCount: 2 },
  { id: 'family', label: 'Gia đình', note: 'Có trẻ nhỏ', icon: 'family_restroom', defaultCount: 4 },
  { id: 'friends', label: 'Nhóm bạn', note: '3+ người', icon: 'groups', defaultCount: 4 },
];

export type PlanBudgetId = 'saving' | 'standard' | 'luxury';

export const PLAN_BUDGET_OPTIONS: {
  id: PlanBudgetId;
  label: string;
  note: string;
  estimate: string;
}[] = [
  { id: 'saving', label: 'Tiết kiệm', note: '< 5 triệu', estimate: '~3.500.000 đ' },
  { id: 'standard', label: 'Tiêu chuẩn', note: '5tr - 12tr', estimate: '~8.000.000 đ' },
  { id: 'luxury', label: 'Sang trọng', note: '> 12 triệu', estimate: '~15.000.000 đ' },
];

export const PLAN_INTEREST_OPTIONS: { id: string; label: string; icon: string }[] = [
  { id: 'beach', label: 'Bãi biển', icon: 'beach_access' },
  { id: 'food', label: 'Ẩm thực', icon: 'restaurant' },
  { id: 'culture', label: 'Văn hóa & Di sản', icon: 'account_balance' },
  { id: 'nature', label: 'Thiên nhiên & Sinh thái', icon: 'park' },
  { id: 'shopping', label: 'Mua sắm & Chợ đêm', icon: 'shopping_bag' },
  { id: 'adventure', label: 'Phiêu lưu & Khám phá', icon: 'hiking' },
  { id: 'relax', label: 'Nghỉ dưỡng & Spa', icon: 'spa' },
];

export type PaceId = 'relaxed' | 'balanced' | 'packed';

export const PACE_OPTIONS: {
  id: PaceId;
  label: string;
  english: string;
  perDay: string;
  description: string;
}[] = [
  {
    id: 'relaxed',
    label: 'Thư giãn',
    english: 'Relaxed',
    perDay: '2-3 điểm/ngày',
    description: 'Thong thả tận hưởng, không hối hả, nhiều thời gian tự do cafe ngắm cảnh.',
  },
  {
    id: 'balanced',
    label: 'Cân bằng',
    english: 'Balanced',
    perDay: '3-4 điểm/ngày',
    description: 'Hài hòa giữa nghỉ ngơi, ẩm thực và tham quan các địa danh tiêu biểu.',
  },
  {
    id: 'packed',
    label: 'Khám phá tối đa',
    english: 'Packed',
    perDay: '5-6 điểm/ngày',
    description: 'Trải nghiệm phong phú, tận dụng trọn vẹn từng khoảnh khắc trong ngày.',
  },
];

/** Nhóm + loại hình mặc định khi chưa có sở thích đã lưu */
export const DEFAULT_PLAN_TYPES = { groupCodes: ['fnb', 'attraction'], typeCodes: [] as string[] };

/** Loại hình → tag mà trang Gợi ý điểm đến (dữ liệu mẫu) dùng để xếp hạng */
const TYPE_TAGS: Record<string, string[]> = {
  resort: ['relax'],
  villa: ['relax'],
  hotel: ['relax'],
  homestay: ['nature'],
  restaurant: ['food'],
  cafe: ['food'],
  localEatery: ['food'],
  barPub: ['food'],
  heritage: ['culture'],
  craftVillage: ['culture', 'shopping'],
  scenicSpot: ['nature'],
  park: ['nature'],
  beach: ['beach'],
  amusementPark: ['adventure'],
  checkinSpot: ['adventure'],
  nightMarket: ['shopping', 'food'],
  specialtyStore: ['shopping'],
  souvenirShop: ['shopping'],
};
/** Loại hình mới admin thêm sau này: lấy theo nhóm */
const GROUP_TAGS: Record<string, string> = {
  lodging: 'relax',
  fnb: 'food',
  attraction: 'nature',
  shopping: 'shopping',
};

/**
 * Lựa chọn trong "Sở thích trải nghiệm" → tag sở thích.
 * Nhóm đã tích mà chưa chọn loại hình nào = mọi loại hình của nhóm.
 */
export function typesToInterests(
  groups: { code: string; subtypes: { code: string }[] }[],
  groupCodes: string[],
  typeCodes: string[],
): string[] {
  const tags = new Set<string>();
  for (const group of groups.filter((g) => groupCodes.includes(g.code))) {
    const picked = group.subtypes.filter((s) => typeCodes.includes(s.code));
    for (const type of picked.length > 0 ? picked : group.subtypes) {
      for (const tag of TYPE_TAGS[type.code] ?? [GROUP_TAGS[group.code] ?? 'nature']) tags.add(tag);
    }
  }
  return [...tags];
}

/** Sở thích đã lưu trong hồ sơ (UC-006) → nhóm + loại hình để điền sẵn */
const PREFERENCE_TYPES: Record<string, { group: string; types: string[] }[]> = {
  nature: [{ group: 'attraction', types: ['scenicSpot', 'park'] }],
  culture: [{ group: 'attraction', types: ['heritage'] }],
  beach: [{ group: 'attraction', types: ['beach'] }],
  food: [{ group: 'fnb', types: [] }],
  shopping: [{ group: 'shopping', types: [] }],
  nightlife: [
    { group: 'shopping', types: ['nightMarket'] },
    { group: 'fnb', types: ['barPub'] },
  ],
};

export function preferencesToTypes(
  interests: string[],
  travelStyle: string | null | undefined,
  known: Set<string>,
): { groupCodes: string[]; typeCodes: string[] } | null {
  const groupCodes = new Set<string>();
  const typeCodes = new Set<string>();
  const add = (group: string, types: string[]) => {
    groupCodes.add(group);
    types.filter((type) => known.has(type)).forEach((type) => typeCodes.add(type));
  };
  for (const interest of interests)
    for (const item of PREFERENCE_TYPES[interest] ?? []) add(item.group, item.types);
  if (travelStyle === 'RELAX' || travelStyle === 'LUXURY') add('lodging', ['resort']);
  if (travelStyle === 'ADVENTURE') add('attraction', ['amusementPark', 'checkinSpot']);
  return groupCodes.size > 0 ? { groupCodes: [...groupCodes], typeCodes: [...typeCodes] } : null;
}
