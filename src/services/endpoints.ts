/**
 * Hợp đồng REST API giữa Admin Web và backend.
 * Quy ước:
 * - GET ".../snapshot" trả về toàn bộ dữ liệu khởi tạo của một phân hệ (danh sách + số liệu gốc).
 * - Thao tác tạo mới gửi kèm `id` do client sinh (idempotency key) — server lưu đúng id đó,
 *   trả 409 nếu trùng.
 * - Thao tác ghi thành công trả 204 (hoặc JSON của bản ghi). Lỗi trả JSON `{ message }`.
 */
const id = (value: string) => encodeURIComponent(value);

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    revoke: '/auth/revoke',
    sendResetOtp: '/auth/password/otp',
    verifyResetOtp: '/auth/password/otp/verify',
    resetPassword: '/auth/password/reset',
    changePassword: '/auth/password/change',
  },
  search: {
    reindex: '/search/index',
  },
  reports: {
    overview: '/reports/overview',
  },
  dashboard: {
    overview: '/dashboard/overview',
  },
  listings: {
    snapshot: '/listings/snapshot',
    detail: (listingId: string) => `/listings/${id(listingId)}/detail`,
    create: '/listings',
    update: (listingId: string) => `/listings/${id(listingId)}`,
    approve: '/listings/approve',
    reject: (listingId: string) => `/listings/${id(listingId)}/reject`,
    reopen: (listingId: string) => `/listings/${id(listingId)}/reopen`,
    lock: '/listings/lock',
    visibility: '/listings/visibility',
    category: '/listings/category',
  },
  // Duyệt địa điểm mới & bản sửa của đối tác (đã có ở backend)
  listingReview: {
    list: '/admin/business-listings',
    stats: '/admin/business-listings/stats',
    detail: (listingId: string) => `/admin/business-listings/${id(listingId)}`,
    approve: (listingId: string) => `/admin/business-listings/${id(listingId)}/approve`,
    reject: (listingId: string) => `/admin/business-listings/${id(listingId)}/reject`,
    revisions: '/admin/listing-revisions',
    revision: (revisionId: string) => `/admin/listing-revisions/${id(revisionId)}`,
    approveRevision: (revisionId: string) => `/admin/listing-revisions/${id(revisionId)}/approve`,
    rejectRevision: (revisionId: string) => `/admin/listing-revisions/${id(revisionId)}/reject`,
  },
  // Tài khoản đang đăng nhập
  me: {
    profile: '/users/me',
  },
  // Quản lý người dùng (bảng users)
  adminUsers: {
    list: '/admin/users',
    stats: '/admin/users/stats',
    detail: (userId: string) => `/admin/users/${id(userId)}`,
    status: (userId: string) => `/admin/users/${id(userId)}/status`,
  },
  // Kho địa điểm (bảng places): POI + địa điểm đối tác
  places: {
    list: '/admin/places',
    stats: '/admin/places/stats',
    detail: (placeId: string) => `/admin/places/${id(placeId)}`,
    create: '/admin/places',
    status: (placeId: string) => `/admin/places/${id(placeId)}/status`,
    hours: (placeId: string) => `/admin/places/${id(placeId)}/opening-hours`,
    images: (placeId: string) => `/admin/places/${id(placeId)}/images`,
    image: (placeId: string, imageId: string) =>
      `/admin/places/${id(placeId)}/images/${id(imageId)}`,
    primaryImage: (placeId: string, imageId: string) =>
      `/admin/places/${id(placeId)}/images/${id(imageId)}/primary`,
    prices: (placeId: string) => `/admin/places/${id(placeId)}/prices`,
    price: (placeId: string, priceId: string) =>
      `/admin/places/${id(placeId)}/prices/${id(priceId)}`,
  },
  // Loại địa điểm (loại con dưới 4 nhóm dịch vụ)
  placeCategories: {
    list: '/admin/place-categories',
    detail: (categoryId: string) => `/admin/place-categories/${id(categoryId)}`,
    status: (categoryId: string) => `/admin/place-categories/${id(categoryId)}/status`,
  },
  uploads: { image: '/uploads/images' },
  reference: {
    provinces: '/reference/provinces',
    categories: '/reference/categories',
  },
  // Đối tác = hồ sơ doanh nghiệp (đã có ở backend)
  partners: {
    list: '/admin/business-profiles',
    stats: '/admin/business-profiles/stats',
    detail: (partnerId: string) => `/admin/business-profiles/${id(partnerId)}`,
    approve: (partnerId: string) => `/admin/business-profiles/${id(partnerId)}/approve`,
    reject: (partnerId: string) => `/admin/business-profiles/${id(partnerId)}/reject`,
    status: (partnerId: string) => `/admin/business-profiles/${id(partnerId)}/status`,
  },
  users: {
    snapshot: '/users/snapshot',
    profile: (userId: string) => `/users/${id(userId)}/profile`,
    sessionHistory: (userId: string) => `/users/${id(userId)}/sessions`,
    create: '/users',
    update: (userId: string) => `/users/${id(userId)}`,
    lock: '/users/lock',
    unlock: '/users/unlock',
  },
  pois: {
    snapshot: '/pois/snapshot',
    create: '/pois',
    update: (poiId: string) => `/pois/${id(poiId)}`,
  },
  notifications: {
    snapshot: '/notifications/snapshot',
    markRead: (notificationId: string) => `/notifications/${id(notificationId)}/read`,
    markAllRead: '/notifications/read-all',
    rules: '/notifications/rules',
    broadcast: '/notifications/broadcast',
  },
  settings: {
    snapshot: '/settings',
  },
  profile: {
    snapshot: '/me/profile',
    contact: '/me/contact',
    totp: '/me/2fa/totp',
    totpSetup: '/me/2fa/totp/setup',
    totpVerify: '/me/2fa/totp/verify',
    backupCodes: '/me/2fa/backup-codes',
    securityKeys: '/me/security-keys',
    revokeSessions: '/me/sessions/revoke-others',
  },
} as const;
