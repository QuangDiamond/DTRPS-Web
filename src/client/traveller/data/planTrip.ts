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

/**
 * Câu hỏi cá nhân hóa (mục đích / phong cách / trải nghiệm / kỷ niệm mong muốn) — thiết lập một
 * lần ở Sở thích du lịch (TravelPreferencesPage), dùng lại cho mỗi kế hoạch chuyến đi mới. Cùng
 * bộ mã với backend (TravelPlanService.EXPERIENCE_CODES / PreferenceService.EXPERIENCE_CODES).
 */
export interface ExperienceQuestionOption {
  code: string;
  emoji: string;
  label: string;
}

export interface ExperienceQuestion {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  options: ExperienceQuestionOption[];
}

export const EXPERIENCE_QUESTIONS: ExperienceQuestion[] = [
  {
    id: 'purpose',
    icon: 'favorite',
    title: 'Bạn mong muốn điều gì từ chuyến đi này?',
    subtitle: 'Chọn cảm xúc hoặc mục đích bạn hướng đến.',
    options: [
      { code: 'PURPOSE_RELAX', emoji: '🌿', label: 'Thư giãn & chữa lành' },
      { code: 'PURPOSE_ADVENTURE', emoji: '🧭', label: 'Khám phá & phiêu lưu' },
      { code: 'PURPOSE_BOND', emoji: '💗', label: 'Gắn kết người thân' },
      { code: 'PURPOSE_FUN', emoji: '🎉', label: 'Vui chơi & giải trí' },
      { code: 'PURPOSE_CULTURE', emoji: '🏛️', label: 'Tìm hiểu văn hóa' },
      { code: 'PURPOSE_ROMANCE', emoji: '🌅', label: 'Tạo kỷ niệm lãng mạn' },
    ],
  },
  {
    id: 'style',
    icon: 'explore',
    title: 'Bạn thích du lịch theo phong cách nào?',
    subtitle: 'Hãy chọn cách bạn thích tận hưởng hành trình.',
    options: [
      { code: 'STYLE_QUIET', emoji: '🍃', label: 'Yên tĩnh, nhẹ nhàng' },
      { code: 'STYLE_ACTIVE', emoji: '⚡', label: 'Năng động, sôi nổi' },
      { code: 'STYLE_FREE', emoji: '✨', label: 'Tự do, ngẫu hứng' },
      { code: 'STYLE_PLANNED', emoji: '📋', label: 'Có kế hoạch rõ ràng' },
      { code: 'STYLE_COMFORT', emoji: '💎', label: 'Thoải mái, tiện nghi' },
      { code: 'STYLE_LOCAL', emoji: '🎒', label: 'Gần gũi địa phương' },
    ],
  },
  {
    id: 'experience',
    icon: 'auto_awesome',
    title: 'Trải nghiệm nào khiến bạn hào hứng?',
    subtitle: 'Chọn những hoạt động mà bạn thực sự muốn thử.',
    options: [
      { code: 'EXPERIENCE_NATURE', emoji: '🏞️', label: 'Khám phá thiên nhiên' },
      { code: 'EXPERIENCE_FOOD', emoji: '🍜', label: 'Thưởng thức ẩm thực' },
      { code: 'EXPERIENCE_PHOTO', emoji: '📸', label: 'Chụp ảnh, check-in' },
      { code: 'EXPERIENCE_OUTDOOR', emoji: '🚣', label: 'Hoạt động ngoài trời' },
      { code: 'EXPERIENCE_ART_CULTURE', emoji: '🎨', label: 'Nghệ thuật & văn hóa' },
      { code: 'EXPERIENCE_WELLNESS', emoji: '🧘', label: 'Nghỉ dưỡng & chăm sóc' },
    ],
  },
  {
    id: 'memory',
    icon: 'photo_library',
    title: 'Bạn muốn mang điều gì về sau chuyến đi?',
    subtitle: 'Điều khiến một chuyến đi trở nên đáng nhớ.',
    options: [
      { code: 'MEMORY_PHOTOS', emoji: '📷', label: 'Những bức ảnh đẹp' },
      { code: 'MEMORY_STORIES', emoji: '📖', label: 'Câu chuyện & kiến thức' },
      { code: 'MEMORY_UNFORGETTABLE', emoji: '💫', label: 'Trải nghiệm khó quên' },
      { code: 'MEMORY_TOGETHER', emoji: '🤝', label: 'Kỷ niệm cùng mọi người' },
    ],
  },
];

/** Chỉ ánh xạ các hoạt động cụ thể ở câu 3. Không suy diễn mục đích/phong cách thành danh mục. */
export const EXPERIENCE_TO_CATEGORIES: Record<string, readonly string[]> = {
  EXPERIENCE_NATURE: ['park', 'scenicSpot', 'beach'],
  EXPERIENCE_FOOD: ['restaurant', 'localEatery', 'cafe'],
  EXPERIENCE_PHOTO: ['checkinSpot', 'scenicSpot'],
  EXPERIENCE_OUTDOOR: ['park', 'scenicSpot', 'amusementPark', 'beach'],
  EXPERIENCE_ART_CULTURE: ['heritage', 'craftVillage'],
  EXPERIENCE_WELLNESS: ['resort'],
};

