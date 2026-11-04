import { createContext, useContext } from 'react';
import type { Trip } from './data/trips';

/** Kế hoạch đang lập: Lập kế hoạch → Đang tạo → Gợi ý → Kế hoạch của tôi */
export interface PlanDraft {
  /** Mã tỉnh/thành (GET /api/reference/provinces) */
  destinationId: string;
  destinationName: string;
  days: number;
  members: number;
  interests: string[];
  /** Địa điểm gợi ý đã thêm vào kế hoạch, theo thứ tự thêm */
  placeIds: string[];
}

export interface TravellerValue {
  /** Id địa điểm (màn Khám phá) đã thả tim, theo thứ tự lưu */
  favorites: string[];
  toggleFavorite: (placeId: string) => void;
  /** Địa điểm gợi ý (màn Gợi ý) đã thả tim */
  savedSuggestions: string[];
  toggleSavedSuggestion: (suggestionId: string) => void;
  trips: Trip[];
  removeTrip: (tripId: string) => void;
  plan: PlanDraft | null;
  startPlan: (plan: Omit<PlanDraft, 'placeIds'>) => void;
  togglePlanPlace: (suggestionId: string) => void;
  /** Lưu kế hoạch thành một chuyến đi bản nháp; trả về số địa điểm đã lưu */
  savePlan: () => number;
}

export const TravellerContext = createContext<TravellerValue | null>(null);

export function useTraveller(): TravellerValue {
  const value = useContext(TravellerContext);
  if (!value) throw new Error('useTraveller phải nằm trong TravellerProvider');
  return value;
}
