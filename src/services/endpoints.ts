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
    sendResetOtp: '/auth/password/otp',
    verifyResetOtp: '/auth/password/otp/verify',
    resetPassword: '/auth/password/reset',
    changePassword: '/auth/password/change',
  },
  search: {
    semantic: '/search/semantic',
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
  partners: {
    snapshot: '/partners/snapshot',
    profile: (partnerId: string) => `/partners/${id(partnerId)}/profile`,
    auditHistory: (partnerId: string) => `/partners/${id(partnerId)}/audit-logs`,
    create: '/partners',
    update: (partnerId: string) => `/partners/${id(partnerId)}`,
    status: (partnerId: string) => `/partners/${id(partnerId)}/status`,
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
