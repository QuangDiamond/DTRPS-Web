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
  PARTNER_LOCATION: '/partner/location',
  PARTNER_ADS: '/partner/ads',
  PARTNER_PROFILE: '/partner/profile',
} as const;
