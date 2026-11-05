/** Đường dẫn của khu client (du khách + đối tác). Khu admin nằm dưới /admin. */
export const CLIENT_ROUTES = {
  WELCOME: '/welcome',
  PUBLIC_REFERENCES: '/danh-muc-dia-diem',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  HOME: '/',
  EXPLORE: '/explore',
  EXPLORE_FILTERS: '/explore/filters',

  PLACE_DETAIL: '/explore/:placeId',
  FAVORITES: '/favorites',
  /** Chi tiết một địa điểm mở từ Yêu thích — để tab "Yêu thích" vẫn sáng, không nhảy sang Khám phá */
  FAVORITE_DETAIL: '/favorites/:placeId',
  PREFERENCES: '/preferences',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_PASSWORD: '/profile/password',
  PROFILE_SETTINGS: '/profile/settings',
  TRIPS: '/trips',
  TRIP_PLAN: '/trips/plan',
  /** Kế hoạch của tôi (các địa điểm gợi ý đã chọn) */
  TRIP_PLAN_SELECTED: '/trips/plan/selected',
  TRIP_GENERATING: '/trips/generating',
  TRIP_SUGGESTIONS: '/trips/suggestions',
  TRIP_SUGGESTION_DETAIL: '/trips/suggestions/:placeId',
  TRIP_ADD_LOCATION: '/trips/:tripId/add-location',
  ITINERARY: '/trips/itinerary',
  ITINERARY_DAY: '/trips/itinerary/day/:day',
  ITINERARY_LIVE: '/trips/itinerary/day/:day/live',
  PARTNER: '/partner',
  PARTNER_APPLY: '/partner/apply',
  /** Danh sách địa điểm của đối tác */
  PARTNER_LOCATIONS: '/partner/locations',
  PARTNER_LOCATION_NEW: '/partner/locations/new',
  PARTNER_LOCATION_DETAIL: '/partner/locations/:id',
  /** Đường dẫn cũ (một địa điểm) — chuyển về danh sách */
  PARTNER_LOCATION_LEGACY: '/partner/location',
  PARTNER_ADS: '/partner/ads',
  PARTNER_PROFILE: '/partner/profile',
} as const;

export const placePath = (placeId: string): string => `/explore/${placeId}`;
export const favoritePlacePath = (placeId: string): string => `/favorites/${placeId}`;
export const suggestionPath = (placeId: string): string => `/trips/suggestions/${placeId}`;
export const addLocationPath = (tripId: string): string => `/trips/${tripId}/add-location`;
export const itineraryDayPath = (day: number): string => `/trips/itinerary/day/${day}`;
export const liveMapPath = (day: number): string => `/trips/itinerary/day/${day}/live`;

/** Trang chi tiết một địa điểm của đối tác */
export const partnerLocationPath = (id: number): string => `/partner/locations/${id}`;
