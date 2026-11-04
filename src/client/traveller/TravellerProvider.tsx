import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { getSuggestedPlace } from './data/suggestedPlaces';
import type { Trip } from './data/trips';
import { type PlanDraft, TravellerContext } from './travellerContext';

/**
 * Dữ liệu cá nhân của du khách khi backend chưa có API (yêu thích, chuyến đi, kế hoạch đang lập).
 * Lưu localStorage theo từng tài khoản; storage bị chặn thì chỉ giữ trong bộ nhớ.
 */
interface StoredState {
  favorites: string[];
  savedSuggestions: string[];
  trips: Trip[];
  plan: PlanDraft | null;
}

const DEFAULT_STATE: StoredState = {
  favorites: [],
  savedSuggestions: [],
  trips: [],
  plan: null,
};

const storageKey = (userId: number) => `smarttravel.client.traveller.v2.${userId}`;

function readState(userId: number): StoredState {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : DEFAULT_STATE.favorites,
      savedSuggestions: Array.isArray(parsed.savedSuggestions) ? parsed.savedSuggestions : [],
      trips: Array.isArray(parsed.trips) ? parsed.trips : DEFAULT_STATE.trips,
      plan:
        parsed.plan && Array.isArray(parsed.plan.placeIds) && parsed.plan.destinationName
          ? parsed.plan
          : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

export default function TravellerProvider({
  userId,
  children,
}: {
  userId: number;
  children: ReactNode;
}) {
  const [state, setState] = useState<StoredState>(() => readState(userId));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(userId), JSON.stringify(state));
    } catch {
      // Storage bị chặn → dữ liệu chỉ còn trong phiên hiện tại
    }
  }, [state, userId]);

  const toggleFavorite = useCallback(
    (placeId: string) =>
      setState((current) => ({ ...current, favorites: toggle(current.favorites, placeId) })),
    [],
  );

  const toggleSavedSuggestion = useCallback(
    (suggestionId: string) =>
      setState((current) => ({
        ...current,
        savedSuggestions: toggle(current.savedSuggestions, suggestionId),
      })),
    [],
  );

  const removeTrip = useCallback(
    (tripId: string) =>
      setState((current) => ({
        ...current,
        trips: current.trips.filter((trip) => trip.id !== tripId),
      })),
    [],
  );

  const startPlan = useCallback(
    (plan: Omit<PlanDraft, 'placeIds'>) =>
      setState((current) => ({ ...current, plan: { ...plan, placeIds: [] } })),
    [],
  );

  const togglePlanPlace = useCallback(
    (suggestionId: string) =>
      setState((current) =>
        current.plan
          ? {
              ...current,
              plan: { ...current.plan, placeIds: toggle(current.plan.placeIds, suggestionId) },
            }
          : current,
      ),
    [],
  );

  const savePlan = useCallback(() => {
    const plan = state.plan;
    if (!plan || plan.placeIds.length === 0) return 0;
    const cover = getSuggestedPlace(plan.placeIds[0])?.image ?? '';
    const trip: Trip = {
      id: `plan-${Date.now()}`,
      title: `Hành trình ${plan.destinationName}`,
      location: plan.destinationName,
      duration: `${plan.days} Ngày ${Math.max(plan.days - 1, 0)} Đêm`,
      days: plan.days,
      image: cover,
      status: 'draft',
      statusLabel: 'Bản nháp',
      dateRange: 'Chưa chọn ngày',
      guests: `${plan.members} người`,
      placeCount: plan.placeIds.length,
    };
    setState((current) => ({ ...current, trips: [trip, ...current.trips], plan: null }));
    return plan.placeIds.length;
  }, [state.plan]);

  const value = useMemo(
    () => ({
      favorites: state.favorites,
      toggleFavorite,
      savedSuggestions: state.savedSuggestions,
      toggleSavedSuggestion,
      trips: state.trips,
      removeTrip,
      plan: state.plan,
      startPlan,
      togglePlanPlace,
      savePlan,
    }),
    [
      state,
      toggleFavorite,
      toggleSavedSuggestion,
      removeTrip,
      startPlan,
      togglePlanPlace,
      savePlan,
    ],
  );

  return <TravellerContext.Provider value={value}>{children}</TravellerContext.Provider>;
}
