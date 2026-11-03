/**
 * Kiểu dữ liệu màn Gợi ý điểm đến (giống constants/suggestedPlaces.ts của mobile).
 * Chưa có dữ liệu — sẽ nối API gợi ý sau.
 */

export type SuggestionCategory = 'nature' | 'culture' | 'food' | 'beach' | 'entertainment';

export const SUGGESTION_CATEGORY_LABELS: Record<SuggestionCategory, string> = {
  nature: 'Thiên nhiên',
  culture: 'Văn hóa',
  food: 'Ẩm thực',
  beach: 'Biển đảo',
  entertainment: 'Vui chơi',
};

/** Trùng id với PLAN_INTEREST_OPTIONS để tính độ phù hợp */
export type InterestTag =
  'beach' | 'food' | 'culture' | 'nature' | 'shopping' | 'adventure' | 'relax';

export const INTEREST_TAG_LABELS: Record<InterestTag, string> = {
  beach: 'Bãi biển',
  food: 'Ẩm thực',
  culture: 'Văn hóa',
  nature: 'Thiên nhiên',
  shopping: 'Mua sắm',
  adventure: 'Khám phá',
  relax: 'Nghỉ dưỡng',
};

export interface SuggestedPlace {
  id: string;
  destinationId: string;
  name: string;
  location: string;
  category: SuggestionCategory;
  tags: InterestTag[];
  /** Độ phù hợp gốc, cộng thêm khi trùng sở thích */
  baseMatch: number;
  rating: number;
  image: string;
  description: string;
  highlights: { name: string; image: string }[];
  info: { openHours: string; price: string; duration: string; bestTime: string };
  coordinate: [number, number];
}

export const SUGGESTED_PLACES: SuggestedPlace[] = [];

export const getSuggestedPlace = (id: string | undefined): SuggestedPlace | undefined =>
  SUGGESTED_PLACES.find((place) => place.id === id);

/** Độ phù hợp = điểm gốc + 4 điểm mỗi sở thích trùng (tối đa 99) */
export const getMatchScore = (place: SuggestedPlace, interests: string[]): number => {
  const overlap = place.tags.filter((tag) => interests.includes(tag)).length;
  return Math.min(99, place.baseMatch + overlap * 4);
};

export type RankedSuggestion = SuggestedPlace & { match: number };

/** Địa điểm gợi ý của một điểm đến, xếp theo độ phù hợp giảm dần */
export const rankSuggestions = (destinationId: string, interests: string[]): RankedSuggestion[] =>
  SUGGESTED_PLACES.filter((place) => place.destinationId === destinationId)
    .map((place) => ({ ...place, match: getMatchScore(place, interests) }))
    .sort((a, b) => b.match - a.match);

export const getMatchLabel = (score: number): string =>
  score >= 90 ? 'Rất phù hợp' : score >= 80 ? 'Phù hợp' : 'Khá phù hợp';
