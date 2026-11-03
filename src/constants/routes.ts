export const ROUTES = {
  // /login, /register… thuộc khu client (du khách + đối tác) — admin đăng nhập riêng ở /admin/login
  LOGIN: '/admin/login',
  FORGOT_PASSWORD: '/admin/forgot-password',
  VERIFY_OTP: '/admin/forgot-password/verify',
  RESET_PASSWORD: '/admin/forgot-password/reset',
  ROOT: '/admin',
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  USER_DETAIL: '/admin/users/:id',
  PARTNERS: '/admin/partners',
  PARTNER_DETAIL: '/admin/partners/:id',
  LISTINGS: '/admin/listings',
  LISTINGS_PENDING: '/admin/listings/pending',
  LISTINGS_APPROVED: '/admin/listings/approved',
  LISTINGS_REJECTED: '/admin/listings/rejected',
  LISTING_REVIEW: '/admin/listings/:id',
  LISTING_REVISION: '/admin/listings/revisions/:id',
  POIS: '/admin/locations',
  POI_NEW: '/admin/locations/new',
  POI_EDIT: '/admin/locations/:id/edit',
  POI_DETAIL: '/admin/locations/:id',
  PLACE_CATEGORIES: '/admin/place-categories',
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

/** Đường dẫn màn Xét duyệt bản sửa địa điểm */
export const listingRevisionPath = (id: string): string => `${ROUTES.LISTINGS}/revisions/${id}`;

/** Đường dẫn màn Chỉnh sửa điểm đến POI */
export const poiEditPath = (id: string): string => `${ROUTES.POIS}/${id}/edit`;

/** Đường dẫn màn Chi tiết địa điểm trong kho */
export const placeDetailPath = (id: string): string => `${ROUTES.POIS}/${id}`;
