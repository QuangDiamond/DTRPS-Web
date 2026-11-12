
import { clientRequest } from './http';

/**
 * Luồng Smart Travel:
 * Tạo Travel Plan -> lấy địa điểm ứng viên -> chọn địa điểm
 * -> Backend tự xếp lịch -> xem lịch trình và chi phí.
 *
 * Mọi endpoint đều dùng clientRequest để gửi Bearer Token của Traveller.
 * API_URL đã được cấu hình trong src/services/config.ts.
 */

export type TravelPace = 'RELAXED' | 'BALANCED' | 'PACKED';

export type PlanStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CreateTravelPlanInput {
  title: string;
  destination: string;

  /** Ngày dạng yyyy-MM-dd */
  startDate: string;
  endDate: string;

  budget: number | null;
  currency: string;
  groupSize: number;
  description: string | null;

  /** Mã danh mục con */
  categoryCodes: string[];

  /** Mã sở thích */
  interestCodes?: string[];

  travelPace: TravelPace;
}

export type UpdateTravelPlanInput = CreateTravelPlanInput;

export interface TravelPlanResponse extends CreateTravelPlanInput {
  planId: number;
  userId: number;
  interestCodes: string[];
  status: PlanStatus;
  allowedNextStatuses: PlanStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface TripPlace {
  placeId: number;
  name: string;
  address: string | null;
  province: string | null;
  categoryCode: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  estimatedCost: number | null;
  currency: string | null;
  latitude: number | null;
  longitude: number | null;
  selected: boolean;
  source: string;

  aiRank?: number;
  aiScore?: number;
  aiBreakdown?: AiScoreBreakdown;
}

export interface AiScoreBreakdown {
  semanticScore: number | null;
  categoryScore: number;
  budgetScore: number;
}

export interface AiRecommendedPlace {
  rank: number;
  placeId: number;
  name: string;
  address: string | null;
  categoryCode: string | null;
  categoryCodes: string[];
  imageUrl: string | null;
  priceType: string | null;
  referencePrice: number | null;
  latitude: number | null;
  longitude: number | null;
  score: number;
  breakdown: AiScoreBreakdown;
}

export interface AiRecommendationResponse {
  planId: number;
  needed: number;
  available: number;
  degraded: boolean;
  items: AiRecommendedPlace[];
  warnings: string[];
}

export function toAiTripPlace(
  place: AiRecommendedPlace,
  destination: string,
): TripPlace {
  return {
    placeId: place.placeId,
    name: place.name,
    address: place.address,
    province: destination,
    categoryCode: place.categoryCode,
    categoryName: place.categoryCode,
    imageUrl: place.imageUrl,
    estimatedCost: place.referencePrice,
    currency: 'VND',
    latitude: place.latitude,
    longitude: place.longitude,
    selected: false,
    source: 'AI',
    aiRank: place.rank,
    aiScore: place.score,
    aiBreakdown: place.breakdown,
  };
}

export interface SelectedPlacesResponse {
  planId: number;
  count: number;
  places: TripPlace[];
}

export interface GenerateItineraryInput {
  title?: string;
  notes?: string;
}

export interface ItineraryDay {
  dayId: number;
  dayNumber: number;
  visitDate: string;
  title: string;
  notes: string | null;
}

export interface GeneratedItinerary {
  itineraryId: number;
  planId: number;
  title: string;
  versionNumber: number;
  status: string;
  currency: string;
  startDate: string;
  endDate: string;
  days: ItineraryDay[];
}

export interface ItineraryActivity {
  itemId: number;
  itemOrder: number;
  placeId: number;
  placeName: string;
  placeAddress: string | null;

  /**
   * Tọa độ điểm đến.
   * Không phải GPS hiện tại của Traveller.
   */
  latitude: number | null;
  longitude: number | null;

  startTime: string | null;
  endTime: string | null;
  estimatedCost: number | null;
  transportModeId: number | null;
  transportModeName: string | null;
  travelTimeMinutes: number | null;
  notes: string | null;
  status: string;
}

export interface ItineraryOverviewDay extends ItineraryDay {
  estimatedCost: number;
  activities: ItineraryActivity[];
}

export interface ItineraryOverview {
  itineraryId: number;
  planId: number;
  planTitle: string;
  destination: string;
  itineraryTitle: string;
  versionNumber: number;
  generationSource: string;
  status: string;
  currency: string;
  itineraryNotes: string | null;
  startDate: string;
  endDate: string;
  budget: number | null;
  totalEstimatedCost: number;
  days: ItineraryOverviewDay[];
}

/**
 * DTO quản lý hoạt động trong lịch trình.
 */
export interface ItineraryItem {
  itemId: number;
  dayId: number;
  itemOrder: number;
  placeId: number;
  placeName: string;
  startTime: string | null;
  endTime: string | null;
  estimatedCost: number | null;
  transportModeId: number | null;
  transportModeName: string | null;
  travelTimeMinutes: number | null;
  notes: string | null;
  status: string;
}

export interface CreateItineraryItemInput {
  placeId: number;
  startTime?: string | null;
  endTime?: string | null;
  estimatedCost?: number | null;
  transportModeId?: number | null;
  travelTimeMinutes?: number | null;
  notes?: string | null;
}

export interface UpdateItineraryItemInput {
  placeId?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  estimatedCost?: number | null;
  transportModeId?: number | null;
  travelTimeMinutes?: number | null;
  notes?: string | null;
  status?: string | null;
}

// ==========================================================
// TRIP PROGRESS — TIẾN ĐỘ CHUYẾN ĐI
// ==========================================================

export type TripExecutionStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type TripActivityStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'SKIPPED';

export type GoongVehicle =
  | 'car'
  | 'bike'
  | 'taxi'
  | 'truck'
  | 'hd';

/**
 * Tiến độ của từng địa điểm.
 */
export interface TripActivityProgress {
  activityProgressId: number | null;
  itemId: number;
  itemOrder: number;
  placeId: number;
  placeName: string;
  status: TripActivityStatus;
  completedAt: string | null;
  notes: string | null;
}

/**
 * Tiến độ của từng ngày.
 */
export interface TripDayProgress {
  dayProgressId: number | null;
  dayId: number;
  dayNumber: number;
  visitDate: string;
  title: string;
  status: TripExecutionStatus;
  startedAt: string | null;
  completedAt: string | null;
  activities: TripActivityProgress[];
}

/**
 * Tiến độ toàn bộ chuyến đi.
 */
export interface TripProgressResponse {
  progressId: number | null;
  planId: number;
  itineraryId: number;
  status: TripExecutionStatus;
  startedAt: string | null;
  completedAt: string | null;
  days: TripDayProgress[];
}

// ==========================================================
// GOONG MAPS — CHỈ ĐƯỜNG
// ==========================================================

/**
 * Tuyến đường do Goong Directions API trả về.
 */
export interface GoongRoute {
  distanceMeters: number;
  durationSeconds: number;
  distanceText: string | null;
  durationText: string | null;

  /**
   * Encoded polyline của tuyến đường.
   * Frontend giải mã và vẽ trên MapLibre.
   */
  polyline: string;
}

/**
 * Điểm đến tiếp theo cùng tuyến Goong.
 */
export interface NextTripRoute {
  planId: number;
  itineraryId: number;
  dayId: number;
  dayNumber: number;
  itemId: number;
  itemOrder: number;
  placeId: number;
  placeName: string;
  placeAddress: string | null;
  destinationLatitude: number;
  destinationLongitude: number;
  vehicle: GoongVehicle;
  route: GoongRoute;
}

// ==========================================================
// API PATHS
// ==========================================================

const progressPath = (planId: number) =>
  `/travel-plans/${planId}/trip-progress`;

const planPath = (planId: number) =>
  `/travel-plans/${planId}`;

const dayItemsPath = (dayId: number) =>
  `/itinerary-days/${dayId}/items`;

// ==========================================================
// TRIP FLOW API
// ==========================================================

export const tripFlowApi = {

  // ========================================================
  // 1. TRAVEL PLAN
  // ========================================================

  createPlan: (input: CreateTravelPlanInput) =>
    clientRequest<TravelPlanResponse>('/travel-plans', {
      method: 'POST',
      body: input,
    }),

  plans: () =>
    clientRequest<TravelPlanResponse[]>('/travel-plans'),

  plan: (planId: number) =>
    clientRequest<TravelPlanResponse>(planPath(planId)),

  // ========================================================
  // 2. AI RECOMMENDATION
  // ========================================================

  recommendedPlaces: (planId: number) =>
    clientRequest<AiRecommendationResponse>(
      `${planPath(planId)}/recommended-places`,
      {
        timeoutMs: 60_000,
      },
    ),

  // ========================================================
  // 3. UPDATE / DELETE / STATUS
  // ========================================================

  updatePlan: (
    planId: number,
    input: UpdateTravelPlanInput,
  ) =>
    clientRequest<TravelPlanResponse>(planPath(planId), {
      method: 'PUT',
      body: input,
    }),

  deletePlan: (planId: number) =>
    clientRequest<void>(planPath(planId), {
      method: 'DELETE',
    }),

  changeStatus: (
    planId: number,
    status: PlanStatus,
  ) =>
    clientRequest<TravelPlanResponse>(
      `${planPath(planId)}/status`,
      {
        method: 'PATCH',
        body: { status },
      },
    ),

  // ========================================================
  // 4. PLACES
  // ========================================================

  candidatePlaces: (planId: number) =>
    clientRequest<TripPlace[]>(
      `${planPath(planId)}/candidate-places`,
    ),

  selectedPlaces: (planId: number) =>
    clientRequest<SelectedPlacesResponse>(
      `${planPath(planId)}/places`,
    ),

  addPlace: (
    planId: number,
    placeId: number,
  ) =>
    clientRequest<TripPlace>(
      `${planPath(planId)}/places`,
      {
        method: 'POST',
        body: { placeId },
      },
    ),

  removePlace: (
    planId: number,
    placeId: number,
  ) =>
    clientRequest<void>(
      `${planPath(planId)}/places/${placeId}`,
      {
        method: 'DELETE',
      },
    ),

  // ========================================================
  // 5. GENERATE ITINERARY
  // ========================================================

  generate: (
    planId: number,
    input: GenerateItineraryInput = {},
  ) =>
    clientRequest<GeneratedItinerary>(
      `${planPath(planId)}/itineraries`,
      {
        method: 'POST',
        body: input,
        timeoutMs: 60_000,
      },
    ),

  activeItinerary: (planId: number) =>
    clientRequest<GeneratedItinerary>(
      `${planPath(planId)}/itineraries/active`,
    ),

  // ========================================================
  // 6. ITINERARY OVERVIEW
  // ========================================================

  overview: (planId: number) =>
    clientRequest<ItineraryOverview>(
      `${planPath(planId)}/itineraries/active/overview`,
    ),

  overviewById: (
    planId: number,
    itineraryId: number,
  ) =>
    clientRequest<ItineraryOverview>(
      `${planPath(planId)}/itineraries/${itineraryId}/overview`,
    ),

  // ========================================================
  // 7. TRIP PROGRESS
  // ========================================================

  /**
   * Lấy tiến độ toàn chuyến.
   *
   * GET /travel-plans/{planId}/trip-progress
   */
  tripProgress: (planId: number) =>
    clientRequest<TripProgressResponse>(
      progressPath(planId),
    ),

  /**
   * Bắt đầu một ngày.
   *
   * POST /trip-progress/days/{dayNumber}/start
   */
  startTripDay: (
    planId: number,
    dayNumber: number,
  ) =>
    clientRequest<TripProgressResponse>(
      `${progressPath(planId)}/days/${dayNumber}/start`,
      {
        method: 'POST',
      },
    ),

  /**
   * Đánh dấu hoàn thành hoặc bỏ qua địa điểm.
   *
   * PATCH /trip-progress/days/{dayNumber}/activities/{itemId}
   */
  updateTripActivity: (
    planId: number,
    dayNumber: number,
    itemId: number,
    status: 'COMPLETED' | 'SKIPPED',
    notes: string | null = null,
  ) =>
    clientRequest<TripProgressResponse>(
      `${progressPath(planId)}/days/${dayNumber}/activities/${itemId}`,
      {
        method: 'PATCH',
        body: {
          status,
          notes,
        },
      },
    ),

  /**
   * Hoàn thành một ngày.
   *
   * POST /trip-progress/days/{dayNumber}/complete
   */
  completeTripDay: (
    planId: number,
    dayNumber: number,
  ) =>
    clientRequest<TripProgressResponse>(
      `${progressPath(planId)}/days/${dayNumber}/complete`,
      {
        method: 'POST',
      },
    ),

  // ========================================================
  // 8. GPS + GOONG MAPS NAVIGATION
  // ========================================================

  /**
   * Chỉ đường từ GPS hiện tại đến địa điểm tiếp theo.
   *
   * Backend:
   * GET /travel-plans/{planId}/navigation/days/{dayNumber}/next-route
   *
   * Backend tự tìm địa điểm PENDING đầu tiên
   * và gọi Goong Directions API.
   */
  nextTripRoute: (
    planId: number,
    dayNumber: number,
    latitude: number,
    longitude: number,
    vehicle: GoongVehicle = 'car',
  ) => {
    const query = new URLSearchParams({
      fromLat: String(latitude),
      fromLng: String(longitude),
      vehicle,
    });

    return clientRequest<NextTripRoute>(
      `${planPath(planId)}/navigation/days/${dayNumber}/next-route?${query.toString()}`,
      {
        timeoutMs: 25_000,
      },
    );
  },

  // ========================================================
  // 9. ITINERARY ITEM CRUD
  // ========================================================

  dayItems: (dayId: number) =>
    clientRequest<ItineraryItem[]>(
      dayItemsPath(dayId),
    ),

  addItem: (
    dayId: number,
    input: CreateItineraryItemInput,
  ) =>
    clientRequest<ItineraryItem>(
      dayItemsPath(dayId),
      {
        method: 'POST',
        body: input,
      },
    ),

  updateItem: (
    dayId: number,
    itemId: number,
    input: UpdateItineraryItemInput,
  ) =>
    clientRequest<ItineraryItem>(
      `${dayItemsPath(dayId)}/${itemId}`,
      {
        method: 'PUT',
        body: input,
      },
    ),

  removeItem: (
    dayId: number,
    itemId: number,
  ) =>
    clientRequest<void>(
      `${dayItemsPath(dayId)}/${itemId}`,
      {
        method: 'DELETE',
      },
    ),

  reorderItems: (
    dayId: number,
    itemIds: number[],
  ) =>
    clientRequest<ItineraryItem[]>(
      `${dayItemsPath(dayId)}/order`,
      {
        method: 'PUT',
        body: { itemIds },
      },
    ),
};
