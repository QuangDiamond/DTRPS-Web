import type { UserAuditEntry, UserProfile } from '@/types';

/** Hồ sơ chi tiết theo UID. Người dùng không có ở đây sẽ dùng hồ sơ dựng tự động. */
/** Hồ sơ gốc — lịch sử tìm kiếm AI được builder bổ sung */
export const MOCK_USER_PROFILES: Record<string, Omit<UserProfile, 'aiSearches'>> = {
  'USR-8291': {
    tierLabel: 'Khách nội địa ưu tiên',
    address: 'Quận Hải Châu, TP. Đà Nẵng',
    emailVerified: true,
    phoneVerified: true,
    lastLogin: {
      time: new Date(new Date().setHours(14, 15, 0, 0)).toISOString(),
      device: 'Smart Travel Mobile App (iPhone 15 Pro)',
      ip: '118.69.182.25 (Đà Nẵng, VN)',
    },
    trustScore: 96,
    trustTitle: 'Tài khoản mẫu mực',
    trustNote: 'Không ghi nhận vi phạm tiêu chuẩn cộng đồng',
    badge: 'Khách du lịch tích cực',
    tripSummary: { total: 14, completed: 8, upcoming: 2 },
    savedPois: 38,
    savedNote: 'Tập trung tại Miền Trung & Miền Bắc',
    savedBreakdown:
      'Danh sách bao gồm 22 điểm ăn uống, 10 di tích lịch sử và 6 resort bãi biển cao cấp.',
    reviewCount: 26,
    avgRating: 4.8,
    reviewsNote: 'Tất cả đánh giá đều đính kèm hình ảnh và hóa đơn thanh toán hợp lệ qua ứng dụng.',
    totalSpend: 18_450_000,
    spendNote: 'Dịch vụ Khách sạn & Tour trọn gói',
    trips: [
      {
        id: 'TRIP-2041',
        name: 'Hành trình di sản Hội An - Mỹ Sơn 3N2Đ',
        status: 'upcoming',
        durationLabel: '3N2Đ',
        icon: 'flight_takeoff',
        startDate: '2026-11-20',
        endDate: '2026-11-22',
        poiCount: 7,
        travelers: '2 Người lớn (Gia đình)',
        amount: 8_200_000,
      },
      {
        id: 'TRIP-1877',
        name: 'Khám phá ẩm thực Phố cổ Hà Nội & Tràng An',
        status: 'completed',
        durationLabel: '4N3Đ',
        icon: 'task_alt',
        startDate: '2026-01-12',
        endDate: '2026-01-15',
        poiCount: 11,
        amount: 6_150_000,
        rating: 4.9,
      },
      {
        id: 'TRIP-1650',
        name: 'Nghỉ dưỡng biển Đà Nẵng - Bán đảo Sơn Trà',
        status: 'completed',
        durationLabel: '2N1Đ',
        icon: 'beach_access',
        startDate: '2025-10-05',
        endDate: '2025-10-06',
        poiCount: 6,
        amount: 4_100_000,
      },
      {
        id: 'TRIP-1502',
        name: 'Phượt Hà Giang mùa hoa tam giác mạch',
        status: 'cancelled',
        durationLabel: '4N3Đ',
        icon: 'event_busy',
        startDate: '2025-10-20',
        endDate: '2025-10-23',
        poiCount: 9,
        amount: 5_400_000,
      },
    ],
  },
};

/** Nhật ký đăng nhập & bảo mật có sẵn */
export const MOCK_USER_SESSIONS: Record<string, Omit<UserAuditEntry, 'id'>[]> = {
  'USR-8291': [
    {
      time: new Date(new Date().setHours(14, 15, 0, 0)).toISOString(),
      icon: 'login',
      text: 'Đăng nhập thành công từ IP 118.69.182.25 (Đà Nẵng, VN)',
    },
    {
      time: '2026-03-20T09:30:00+07:00',
      icon: 'verified_user',
      text: 'Xác thực OTP 2FA cho phiên đặt phòng InterContinental',
    },
  ],
};
