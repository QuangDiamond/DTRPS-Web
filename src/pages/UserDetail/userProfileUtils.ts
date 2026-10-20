import { MOCK_USER_PROFILES, MOCK_USER_SESSIONS } from '../../constants/mockUserProfiles';
import type { AppUser, TripStatus, UserAuditEntry, UserProfile } from '../../types/admin';

export const TRIP_STATUS_CONFIG: Record<
  TripStatus,
  { label: string; badgeClass: string; dotClass?: string; iconBoxClass: string }
> = {
  upcoming: {
    label: 'Sắp diễn ra',
    badgeClass: 'bg-secondary-container font-bold text-on-secondary-container',
    dotClass: 'animate-ping bg-secondary',
    iconBoxClass: 'bg-surface-container text-primary',
  },
  completed: {
    label: 'Đã hoàn thành',
    badgeClass: 'bg-surface-container-high font-medium text-on-surface-variant',
    iconBoxClass: 'bg-surface-container-low text-outline',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-error-container/70 font-medium text-on-error-container',
    iconBoxClass: 'bg-error-container/30 text-error',
  },
};

export function getTrustTitle(score: number): string {
  if (score >= 90) return 'Tài khoản mẫu mực';
  if (score >= 70) return 'Tài khoản tin cậy';
  if (score >= 50) return 'Cần theo dõi';
  return 'Tài khoản rủi ro';
}

/** Hồ sơ dựng tự động cho người dùng chưa có dữ liệu chi tiết */
function buildFallbackProfile(user: AppUser): UserProfile {
  const suspended = user.status === 'suspended';
  const trustScore = suspended ? 32 : user.accountType === 'vip' ? 92 : 84;
  const completed = Math.round(user.tripCount * 0.6);

  return {
    tierLabel: user.accountType === 'vip' ? 'Khách VIP' : 'Khách tiêu chuẩn',
    address: user.city,
    emailVerified: true,
    phoneVerified: !suspended,
    lastLogin: {
      time: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      device: 'Smart Travel Web App',
      ip: '113.161.0.1 (VN)',
    },
    trustScore,
    trustTitle: getTrustTitle(trustScore),
    trustNote: suspended
      ? `Ghi nhận vi phạm: ${user.suspendReason ?? 'chưa rõ lý do'}`
      : 'Không ghi nhận vi phạm tiêu chuẩn cộng đồng',
    badge: user.tripCount >= 10 ? 'Khách du lịch tích cực' : 'Thành viên mới',
    tripSummary: {
      total: user.tripCount,
      completed,
      upcoming: Math.min(1, user.tripCount - completed),
    },
    savedPois: user.tripCount * 3,
    savedNote: `Tập trung quanh ${user.city}`,
    savedBreakdown: `${user.tripCount * 3} địa điểm du lịch đã được lưu vào danh sách yêu thích.`,
    reviewCount: Math.floor(user.tripCount * 1.5),
    avgRating: 4.5,
    reviewsNote: 'Đánh giá được xác thực qua lịch sử đặt chỗ trên ứng dụng.',
    totalSpend: user.tripCount * 1_200_000,
    spendNote: 'Đặt dịch vụ qua Smart Travel',
    trips: [],
  };
}

export function getUserProfile(user: AppUser): UserProfile {
  return MOCK_USER_PROFILES[user.id] ?? buildFallbackProfile(user);
}

/** Nhật ký phiên & bảo mật: thao tác admin trong phiên + lịch sử có sẵn (mới nhất trước) */
export function getUserSessionLog(
  user: AppUser,
  sessionEntries: UserAuditEntry[] = [],
): UserAuditEntry[] {
  const history = (MOCK_USER_SESSIONS[user.id] ?? []).map((entry, index) => ({
    ...entry,
    id: `session-${index}`,
  }));
  const registered: UserAuditEntry = {
    id: 'registered',
    time: `${user.joinedAt}T08:00:00+07:00`,
    icon: 'how_to_reg',
    text: 'Đăng ký tài khoản Smart Travel',
  };
  return [...sessionEntries, ...history, registered].sort((a, b) => b.time.localeCompare(a.time));
}

/** "1 năm đồng hành" */
export function formatMembership(joinedAt: string, now: Date = new Date()): string {
  const joined = new Date(joinedAt);
  const months =
    (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth());
  if (months < 1) return 'Mới tham gia';
  if (months < 12) return `${months} tháng đồng hành`;
  return `${Math.floor(months / 12)} năm đồng hành`;
}

export function formatVnd(value: number): string {
  return `${value.toLocaleString('en-US')} đ`;
}
