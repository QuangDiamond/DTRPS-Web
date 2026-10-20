export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/forgot-password/verify',
  RESET_PASSWORD: '/forgot-password/reset',
  ROOT: '/admin',
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  USER_DETAIL: '/admin/users/:id',
  PARTNERS: '/admin/partners',
  PARTNER_DETAIL: '/admin/partners/:id',
  LISTINGS: '/admin/listings',
  LISTINGS_APPROVED: '/admin/listings/approved',
  LISTINGS_REJECTED: '/admin/listings/rejected',
  LISTING_REVIEW: '/admin/listings/:id',
  LOCATIONS: '/admin/locations',
  LOCATION_NEW: '/admin/locations/new',
  LOCATION_EDIT: '/admin/locations/:id/edit',
  REPORTS: '/admin/reports',
  NOTIFICATIONS: '/admin/notifications',
  SETTINGS: '/admin/settings',
  PROFILE: '/admin/profile',
} as const;

/** Đường dẫn màn Chi tiết người dùng */
export const userDetailPath = (id: string): string => `${ROUTES.USERS}/${id}`;

/** Đường dẫn màn Chi tiết đối tác */
export const partnerDetailPath = (id: string): string => `${ROUTES.PARTNERS}/${id}`;

/** Đường dẫn màn Xem xét & Duyệt của một niêm yết */
export const listingReviewPath = (id: string): string => `${ROUTES.LISTINGS}/${id}`;

/** Đường dẫn màn Chỉnh sửa điểm đến POI */
export const poiEditPath = (id: string): string => `${ROUTES.LOCATIONS}/${id}/edit`;
