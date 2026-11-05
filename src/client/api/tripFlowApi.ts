
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
  /** Mã danh mục con lấy từ GET /reference/categories */
  categoryCodes: string[];
  travelPace: TravelPace;
}

export interface TravelPlanResponse extends CreateTravelPlanInput {
  planId: number;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** Địa điểm thật từ catalogue hoặc danh sách Traveller đã chọn. */
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
  /** CATALOG hoặc SELECTED; CATALOG không phải kết quả AI. */
  source: string;
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

/** DTO dành cho các API quản lý hoạt động (Task 46). */
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

const planPath = (planId: number) => `/travel-plans/${planId}`;
const dayItemsPath = (dayId: number) => `/itinerary-days/${dayId}/items`;

export const tripFlowApi = {
  // BƯỚC 1: Tạo kế hoạch với sở thích và nhịp độ.
  createPlan: (input: CreateTravelPlanInput) =>
    clientRequest<TravelPlanResponse>('/travel-plans', {
      method: 'POST',
      body: input,
    }),

  plans: () => clientRequest<TravelPlanResponse[]>('/travel-plans'),

  plan: (planId: number) =>
    clientRequest<TravelPlanResponse>(planPath(planId)),

  // BƯỚC 2-3: Ứng viên từ catalogue, chưa phải AI Embedding.
  candidatePlaces: (planId: number) =>
    clientRequest<TripPlace[]>(`${planPath(planId)}/candidate-places`),

  // BƯỚC 4: Giỏ địa điểm được lưu trong plan_places.
  selectedPlaces: (planId: number) =>
    clientRequest<SelectedPlacesResponse>(`${planPath(planId)}/places`),

  addPlace: (planId: number, placeId: number) =>
    clientRequest<TripPlace>(`${planPath(planId)}/places`, {
      method: 'POST',
      body: { placeId },
    }),

  removePlace: (planId: number, placeId: number) =>
    clientRequest<void>(`${planPath(planId)}/places/${placeId}`, {
      method: 'DELETE',
    }),

  // BƯỚC 5: Backend tự xếp lịch từ những địa điểm đã chọn.
  generate: (planId: number, input: GenerateItineraryInput = {}) =>
    clientRequest<GeneratedItinerary>(`${planPath(planId)}/itineraries`, {
      method: 'POST',
      body: input,
      timeoutMs: 60_000,
    }),

  activeItinerary: (planId: number) =>
    clientRequest<GeneratedItinerary>(
      `${planPath(planId)}/itineraries/active`,
    ),

  // BƯỚC 6: Xem các ngày, hoạt động và tổng chi phí.
  overview: (planId: number) =>
    clientRequest<ItineraryOverview>(
      `${planPath(planId)}/itineraries/active/overview`,
    ),

  overviewById: (planId: number, itineraryId: number) =>
    clientRequest<ItineraryOverview>(
      `${planPath(planId)}/itineraries/${itineraryId}/overview`,
    ),

  // Task 46: Xem/chỉnh sửa hoạt động sau khi lịch trình được tạo.
  dayItems: (dayId: number) =>
    clientRequest<ItineraryItem[]>(dayItemsPath(dayId)),

  addItem: (dayId: number, input: CreateItineraryItemInput) =>
    clientRequest<ItineraryItem>(dayItemsPath(dayId), {
      method: 'POST',
      body: input,
    }),

  updateItem: (
    dayId: number,
    itemId: number,
    input: UpdateItineraryItemInput,
  ) =>
    clientRequest<ItineraryItem>(`${dayItemsPath(dayId)}/${itemId}`, {
      method: 'PUT',
      body: input,
    }),

  removeItem: (dayId: number, itemId: number) =>
    clientRequest<void>(`${dayItemsPath(dayId)}/${itemId}`, {
      method: 'DELETE',
    }),

  reorderItems: (dayId: number, itemIds: number[]) =>
    clientRequest<ItineraryItem[]>(`${dayItemsPath(dayId)}/order`, {
      method: 'PUT',
      body: { itemIds },
    }),
};
