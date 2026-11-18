/** Quản lý chuyến đi (admin, chỉ xem) — API thật /admin/trips */
import type {
  AdminTrip,
  AdminTripDetail,
  AdminTripQuery,
  AdminTripStats,
  Paged,
  TripDayStatus,
  AdminTripStatus,
  TripStopStatus,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';

interface ApiTrip extends Omit<AdminTrip, 'id' | 'traveller' | 'status'> {
  planId: number;
  status: string;
  traveller: { userId: number; name: string; email: string; avatarUrl: string | null };
}

interface ApiStop {
  itemId: number;
  order: number;
  placeId: number;
  placeName: string;
  address: string | null;
  coverUrl: string | null;
  startTime: string | null;
  endTime: string | null;
  estimatedCost: number | null;
  status: string;
  completedAt: string | null;
  notes: string | null;
}

interface ApiDay {
  dayNumber: number;
  date: string;
  title: string | null;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  stops: ApiStop[];
}

interface ApiDetail {
  summary: ApiTrip;
  description: string | null;
  travelPace: string | null;
  itineraryTitle: string | null;
  itineraryVersion: number | null;
  days: ApiDay[];
  selectedPlaces: {
    placeId: number;
    name: string;
    address: string | null;
    coverUrl: string | null;
  }[];
  feedback: AdminTripDetail['feedback'];
}

const toTrip = ({ planId, traveller, status, ...trip }: ApiTrip): AdminTrip => ({
  ...trip,
  id: String(planId),
  status: status as AdminTripStatus,
  traveller: {
    id: String(traveller.userId),
    name: traveller.name,
    email: traveller.email,
    avatarUrl: traveller.avatarUrl,
  },
});

export const tripAdminService = {
  stats: () => apiRequest<AdminTripStats>(ENDPOINTS.trips.stats),

  destinations: () => apiRequest<string[]>(ENDPOINTS.trips.destinations),

  list: async (params: AdminTripQuery): Promise<Paged<AdminTrip>> => {
    const page = await apiRequest<Paged<ApiTrip>>(ENDPOINTS.trips.list, {
      query: {
        page: params.page,
        size: params.size,
        keyword: params.keyword?.trim() || undefined,
        status: params.status,
        destination: params.destination || undefined,
        from: params.from || undefined,
        to: params.to || undefined,
        // Mặc định (mới tạo nhất) thì không gửi
        sort: params.sort && params.sort !== 'newest' ? params.sort : undefined,
      },
    });
    return { ...page, items: page.items.map(toTrip) };
  },

  get: async (tripId: string): Promise<AdminTripDetail> => {
    const detail = await apiRequest<ApiDetail>(ENDPOINTS.trips.detail(tripId));
    return {
      trip: toTrip(detail.summary),
      description: detail.description,
      travelPace: detail.travelPace,
      itineraryTitle: detail.itineraryTitle,
      itineraryVersion: detail.itineraryVersion,
      days: detail.days.map((day) => ({
        ...day,
        status: day.status as TripDayStatus,
        stops: day.stops.map(({ itemId, placeId, status, ...stop }) => ({
          ...stop,
          id: String(itemId),
          placeId: String(placeId),
          status: status as TripStopStatus,
        })),
      })),
      selectedPlaces: detail.selectedPlaces.map((place) => ({
        ...place,
        placeId: String(place.placeId),
      })),
      feedback: detail.feedback,
    };
  },
};
