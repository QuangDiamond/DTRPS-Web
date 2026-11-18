/** Quản lý chuyến đi (admin, chỉ xem): chuyến đi của mọi người dùng và tiến độ thực tế */

export type AdminTripStatus = 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TripDayStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type TripStopStatus = 'PENDING' | 'COMPLETED' | 'SKIPPED';

/** Nhóm lọc gửi lên API */
export type TripStatusFilter = 'PLANNING' | 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED';

export type TripSort = 'newest' | 'oldest' | 'startSoon' | 'startLate';

export interface TripTraveller {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface TripProgressInfo {
  totalDays: number;
  completedDays: number;
  /** Ngày đang đi, hoặc ngày kế tiếp nếu chưa bấm bắt đầu; null khi chuyến không ở trạng thái đang đi */
  currentDay: number | null;
  currentDayStarted: boolean;
  totalStops: number;
  completedStops: number;
  skippedStops: number;
  percent: number;
}

export interface AdminTrip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  groupSize: number;
  budget: number | null;
  currency: string;
  status: AdminTripStatus;
  /** Đang đi nhưng đã qua ngày về dự kiến */
  overdue: boolean;
  traveller: TripTraveller;
  progress: TripProgressInfo;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface AdminTripStats {
  total: number;
  planning: number;
  inProgress: number;
  overdue: number;
  completed: number;
  cancelled: number;
}

export interface AdminTripStop {
  id: string;
  order: number;
  placeId: string;
  placeName: string;
  address: string | null;
  coverUrl: string | null;
  startTime: string | null;
  endTime: string | null;
  estimatedCost: number | null;
  status: TripStopStatus;
  completedAt: string | null;
  notes: string | null;
}

export interface AdminTripDay {
  dayNumber: number;
  date: string;
  title: string | null;
  status: TripDayStatus;
  startedAt: string | null;
  completedAt: string | null;
  stops: AdminTripStop[];
}

export interface AdminTripSelectedPlace {
  placeId: string;
  name: string;
  address: string | null;
  coverUrl: string | null;
}

export interface AdminTripDetail {
  trip: AdminTrip;
  description: string | null;
  travelPace: string | null;
  itineraryTitle: string | null;
  itineraryVersion: number | null;
  days: AdminTripDay[];
  selectedPlaces: AdminTripSelectedPlace[];
  feedback: { rating: number; comment: string | null; createdAt: string } | null;
}

export interface AdminTripQuery {
  keyword?: string;
  status?: TripStatusFilter;
  destination?: string;
  from?: string;
  to?: string;
  sort?: TripSort;
  /** Bắt đầu từ 0 */
  page: number;
  size: number;
}
