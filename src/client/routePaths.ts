/** Đường dẫn của khu client (du khách + đối tác). Khu admin nằm dưới /admin. */
export const CLIENT_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
  EXPLORE: '/explore',
  TRIPS: '/trips',
  FAVORITES: '/favorites',
  PROFILE: '/profile',
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

/** Trang chi tiết một địa điểm của đối tác */
export const partnerLocationPath = (id: number): string => `/partner/locations/${id}`;
