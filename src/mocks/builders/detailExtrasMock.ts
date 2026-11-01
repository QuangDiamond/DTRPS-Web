/**
 * Dữ liệu mẫu bổ sung cho màn chi tiết: đánh giá đối tác
 * và lịch sử tìm kiếm AI của người dùng. Sinh ổn định theo id (mỗi lần mở cho cùng kết quả).
 */
import type { AppUser, Partner, PartnerRatingSummary, PartnerReview, UserAiSearch } from '@/types';

/** Bộ sinh số giả ngẫu nhiên có hạt giống theo chuỗi */
function seededRandom(seed: string): () => number {
  let state = [...seed].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const daysAgo = (days: number, hour = 9): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
};

// ---------------------------------------------------------------- Đối tác
const REVIEWERS = [
  'Nguyễn Minh Anh',
  'Trần Quốc Huy',
  'Emily Carter',
  'Lê Thu Hà',
  'Kenji Watanabe',
  'Phạm Gia Bảo',
];
const REVIEW_COMMENTS = [
  'Dịch vụ chu đáo, nhân viên thân thiện, sẽ quay lại lần sau.',
  'Vị trí thuận tiện, phòng sạch sẽ đúng như mô tả.',
  'Great experience, the staff were very helpful and friendly.',
  'Giá hợp lý nhưng thời gian chờ check-in hơi lâu.',
  'Món ăn ngon, không gian đẹp, rất đáng để thử.',
  'Hướng dẫn viên nhiệt tình, lịch trình hợp lý.',
];

export function buildPartnerRatings(partner: Partner): PartnerRatingSummary {
  const random = seededRandom(`${partner.id}-ratings`);
  const total = 80 + Math.round(random() * 900);
  const average = partner.rating > 0 ? partner.rating : 4.2;
  // Phân bố số sao khớp với điểm trung bình
  const fiveShare = Math.max(0.3, Math.min(0.85, (average - 3.5) / 1.5));
  const shares = [
    fiveShare,
    (1 - fiveShare) * 0.6,
    (1 - fiveShare) * 0.25,
    (1 - fiveShare) * 0.1,
    (1 - fiveShare) * 0.05,
  ];
  const counts = shares.map((share) => Math.round(total * share));
  const recent: PartnerReview[] = Array.from({ length: 4 }, (_, index) => ({
    id: `RV-${partner.id.slice(-4)}-${index}`,
    author: REVIEWERS[Math.floor(random() * REVIEWERS.length)],
    rating: Math.max(3, Math.min(5, Math.round(average + (random() - 0.6)))),
    comment: REVIEW_COMMENTS[Math.floor(random() * REVIEW_COMMENTS.length)],
    date: daysAgo(index * 5 + 1),
    listingName: partner.businessName,
  }));
  return {
    average,
    total,
    distribution: { 5: counts[0], 4: counts[1], 3: counts[2], 2: counts[3], 1: counts[4] },
    recent,
  };
}

// ---------------------------------------------------------------- Người dùng
const AI_QUERIES: { query: string; target: UserAiSearch['target']; topMatch: string }[] = [
  {
    query: 'bãi biển yên tĩnh cho gia đình ở Đà Nẵng',
    target: 'pois',
    topMatch: 'Bãi biển Mỹ Khê',
  },
  {
    query: 'homestay gần phố cổ Hội An có sân vườn',
    target: 'listings',
    topMatch: 'Hoi An Garden Homestay',
  },
  {
    query: 'quán ăn đặc sản miền Bắc gần Hồ Gươm',
    target: 'pois',
    topMatch: 'Quán Cơm Niêu Phố Cổ',
  },
  {
    query: 'resort view biển có hồ bơi cho cặp đôi',
    target: 'listings',
    topMatch: 'An Bang Beach Resort',
  },
  {
    query: 'điểm tâm linh ngắm hoàng hôn',
    target: 'pois',
    topMatch: 'Bán đảo Sơn Trà & Chùa Linh Ứng',
  },
  {
    query: 'làng nghề truyền thống cho trẻ em trải nghiệm',
    target: 'pois',
    topMatch: 'Bảo tàng Gốm Thanh Hà',
  },
  { query: 'du thuyền ngắm vịnh qua đêm', target: 'pois', topMatch: 'Vịnh Hạ Long' },
  {
    query: 'nhà hàng hải sản tươi giá hợp lý',
    target: 'listings',
    topMatch: 'Nhà hàng Hải sản Bếp Biển',
  },
  { query: 'chợ đêm ăn vặt địa phương', target: 'pois', topMatch: 'Chợ Bến Thành' },
  { query: 'nghỉ dưỡng giữa ruộng bậc thang', target: 'pois', topMatch: 'Sapa Terraces Retreat' },
];

/** Tối đa 8 lượt tìm kiếm gần nhất (server trả kèm tổng số lượt) */
export function buildUserAiSearches(user: AppUser): UserAiSearch[] {
  const random = seededRandom(`${user.id}-ai-searches`);
  const count = Math.min(8, user.aiSearchCount);
  return Array.from({ length: count }, (_, index) => {
    const sample = AI_QUERIES[Math.floor(random() * AI_QUERIES.length)];
    const resultCount = Math.floor(random() * 9);
    return {
      id: `AIS-${user.id.slice(-4)}-${index}`,
      query: sample.query,
      target: sample.target,
      resultCount,
      topMatch: resultCount > 0 ? sample.topMatch : undefined,
      topScore: resultCount > 0 ? 78 + Math.floor(random() * 21) : undefined,
      searchedAt: daysAgo(index * 2 + Math.floor(random() * 2), 7 + Math.floor(random() * 14)),
    };
  });
}
