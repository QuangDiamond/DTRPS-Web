/** Người dùng (khách du lịch) */
import type { SemanticTarget } from './search';

export type UserStatus = 'active' | 'suspended';

export type UserAccountType = 'standard' | 'vip' | 'partner';

export type UserJoinedRange = 'all' | '30days' | 'quarter' | 'year';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  /** ISO date */
  joinedAt: string;
  accountType: UserAccountType;
  status: UserStatus;
  tripCount: number;
  /** Số lượt tìm kiếm ngữ nghĩa AI (pgvector) người dùng đã thực hiện */
  aiSearchCount: number;
  /** Lý do tạm khóa (hiển thị thay cho tripNote khi bị khóa) */
  suspendReason?: string;
  /** Màu avatar khi đang hoạt động */
  avatarTone: 'teal' | 'neutral';
}

export interface UserFilters {
  keyword: string;
  status: UserStatus | 'all';
  accountType: UserAccountType | 'all';
  joined: UserJoinedRange;
}

export type UserFormValues = Pick<AppUser, 'name' | 'email' | 'phone' | 'city' | 'accountType'>;

/** Số liệu toàn hệ thống (do server tính) */
export interface UserStats {
  total: number;
  active: number;
  newThisMonth: number;
  newToday: number;
  suspended: number;
}

// ----- Hồ sơ chi tiết người dùng (màn Chi tiết người dùng) -----
export type TripStatus = 'upcoming' | 'completed' | 'cancelled';

export interface UserTrip {
  id: string;
  name: string;
  status: TripStatus;
  /** Ví dụ "3N2Đ" */
  durationLabel: string;
  icon: string;
  /** ISO date */
  startDate: string;
  /** ISO date */
  endDate: string;
  poiCount: number;
  travelers?: string;
  /** Kinh phí dự toán (sắp diễn ra) hoặc số tiền đã thanh toán */
  amount: number;
  /** Điểm người dùng đã đánh giá chuyến đi */
  rating?: number;
}

export interface UserProfile {
  tierLabel: string;
  address: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin: { time: string; device: string; ip: string };
  trustScore: number;
  trustTitle: string;
  trustNote: string;
  badge: string;
  tripSummary: { total: number; completed: number; upcoming: number };
  savedPois: number;
  savedNote: string;
  savedBreakdown: string;
  reviewCount: number;
  avgRating: number;
  reviewsNote: string;
  trips: UserTrip[];
  /** Các lượt tìm kiếm AI gần nhất */
  aiSearches: UserAiSearch[];
}

export interface UserAuditEntry {
  id: string;
  /** ISO datetime */
  time: string;
  icon: string;
  text: string;
}

/** Một lượt tìm kiếm ngữ nghĩa AI (pgvector) của người dùng */
export interface UserAiSearch {
  id: string;
  /** Câu truy vấn người dùng nhập — dữ liệu, không dịch */
  query: string;
  target: SemanticTarget;
  resultCount: number;
  topMatch?: string;
  /** Độ tương đồng AI (%) của kết quả đứng đầu */
  topScore?: number;
  /** ISO datetime */
  searchedAt: string;
}
