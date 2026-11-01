import { buildUserAiSearches } from './detailExtrasMock';
import { MOCK_USER_PROFILES, MOCK_USER_SESSIONS } from '@/mocks/data/mockUserProfiles';
import type { AppUser, UserAuditEntry, UserProfile } from '@/types';

function getTrustTitle(score: number): string {
  if (score >= 90) return 'Tài khoản mẫu mực';
  if (score >= 70) return 'Tài khoản tin cậy';
  if (score >= 50) return 'Cần theo dõi';
  return 'Tài khoản rủi ro';
}

/** Hồ sơ dựng tự động cho người dùng chưa có dữ liệu chi tiết */
function buildFallbackProfile(user: AppUser): Omit<UserProfile, 'aiSearches'> {
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
    trips: [],
  };
}

export function buildMockUserProfile(user: AppUser): UserProfile {
  const base = MOCK_USER_PROFILES[user.id] ?? buildFallbackProfile(user);
  return { ...base, aiSearches: buildUserAiSearches(user) };
}

/** Lịch sử phiên & bảo mật có sẵn trên server + mốc đăng ký tài khoản */
export function buildMockUserSessionHistory(user: AppUser): UserAuditEntry[] {
  const history = (MOCK_USER_SESSIONS[user.id] ?? []).map((entry, index) => ({
    ...entry,
    id: `session-${index}`,
  }));
  return [
    ...history,
    {
      id: 'registered',
      time: `${user.joinedAt}T08:00:00+07:00`,
      icon: 'how_to_reg',
      text: 'Đăng ký tài khoản Smart Travel',
    },
  ];
}
