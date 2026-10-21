/** Dữ liệu mẫu Báo cáo & Thống kê — số liệu toàn quốc cả năm, builder tự co giãn theo bộ lọc */
import type {
  DestinationRank,
  PartnerPerformance,
  PoiCategoryStat,
  ReportInsight,
  TripInsights,
} from '@/types';

/** Lượt xem (nghìn) & người dùng mới theo tháng, T1 → T12 */
export const MOCK_MONTHLY_TRAFFIC: { pageViewsK: number; newUsers: number }[] = [
  { pageViewsK: 412, newUsers: 7800 },
  { pageViewsK: 468, newUsers: 9100 },
  { pageViewsK: 535, newUsers: 10400 },
  { pageViewsK: 690, newUsers: 13900 },
  { pageViewsK: 735, newUsers: 15600 },
  { pageViewsK: 802, newUsers: 17800 },
  { pageViewsK: 766, newUsers: 16900 },
  { pageViewsK: 624, newUsers: 12300 },
  { pageViewsK: 557, newUsers: 11200 },
  { pageViewsK: 601, newUsers: 12400 },
  { pageViewsK: 668, newUsers: 14100 },
  { pageViewsK: 757, newUsers: 16800 },
];

/** Số chuyến đi được tạo theo tháng, T1 → T12 (tổng 342,800) */
export const MOCK_MONTHLY_TRIPS: number[] = [
  18000, 21400, 26000, 29600, 41200, 58200, 46800, 30400, 31000, 26800, 19400, 44000,
];

export const MOCK_REPORT_BASE = {
  userGrowthYoY: 14.2,
  monthlyActiveUsers: 92400,
  partnerGrowthQoQ: 18.5,
  provincesCovered: 63,
  avgApprovalHours: 3.5,
  /** Truy vấn AI pgvector / năm (toàn hệ thống) */
  aiQueriesYear: 386_400,
  aiHitRate: 91.4,
  aiAvgSimilarity: 86.2,
};

export const MOCK_TRIP_INSIGHTS: TripInsights = {
  peakMonths: [5, 7],
  bundleGrowthPercent: 32,
  avgDurationDays: 3.4,
  avgSpendVnd: 4_800_000,
};

export const MOCK_DESTINATIONS: DestinationRank[] = [
  {
    id: 'DST-DN',
    name: 'Đà Nẵng',
    area: 'Vùng Duyên hải Nam Trung Bộ',
    region: 'central',
    rating: 4.9,
    plannedTrips: 78420,
    growthPercent: 24,
    highlights: ['Bãi biển Mỹ Khê', 'Bán đảo Sơn Trà', 'Cầu Rồng'],
  },
  {
    id: 'DST-HA',
    name: 'Hội An',
    area: 'Tỉnh Quảng Nam',
    region: 'central',
    rating: 4.9,
    plannedTrips: 65300,
    growthPercent: 18,
    highlights: ['Phố cổ Hội An', 'Cẩm Châu', 'Làng rau Trà Quế'],
  },
  {
    id: 'DST-HN',
    name: 'Hà Nội',
    area: 'Thủ đô văn hiến',
    region: 'north',
    rating: 4.8,
    plannedTrips: 59100,
    growthPercent: 15,
    highlights: ['Hồ Hoàn Kiếm', 'Phố cổ 36 phố phường', 'Hồ Tây'],
  },
  {
    id: 'DST-HL',
    name: 'Vịnh Hạ Long',
    area: 'Tỉnh Quảng Ninh',
    region: 'north',
    rating: 4.9,
    plannedTrips: 48900,
    growthPercent: 22,
    highlights: ['Du thuyền đêm', 'Hang Sửng Sốt', 'Đảo Ti Tốp'],
  },
  {
    id: 'DST-NB',
    name: 'Ninh Bình',
    area: 'Đồng bằng Sông Hồng',
    region: 'north',
    rating: 4.8,
    plannedTrips: 39200,
    growthPercent: 12,
    highlights: ['Quần thể Tràng An', 'Tam Cốc - Bích Động', 'Hang Múa'],
  },
  {
    id: 'DST-DL',
    name: 'Đà Lạt',
    area: 'Tỉnh Lâm Đồng',
    region: 'south',
    rating: 4.8,
    plannedTrips: 36800,
    growthPercent: 9,
    highlights: ['Hồ Xuân Hương', 'Thác Datanla', 'Langbiang'],
  },
  {
    id: 'DST-PQ',
    name: 'Phú Quốc',
    area: 'Tỉnh Kiên Giang',
    region: 'south',
    rating: 4.7,
    plannedTrips: 34500,
    growthPercent: 27,
    highlights: ['Bãi Sao', 'Hòn Thơm', 'Chợ đêm Dinh Cậu'],
  },
  {
    id: 'DST-HCM',
    name: 'TP. Hồ Chí Minh',
    area: 'Đông Nam Bộ',
    region: 'south',
    rating: 4.6,
    plannedTrips: 31200,
    growthPercent: 11,
    highlights: ['Phố đi bộ Nguyễn Huệ', 'Chợ Bến Thành', 'Địa đạo Củ Chi'],
  },
  {
    id: 'DST-HUE',
    name: 'Huế',
    area: 'Thành phố Huế',
    region: 'central',
    rating: 4.7,
    plannedTrips: 28700,
    growthPercent: 14,
    highlights: ['Đại Nội Huế', 'Chùa Thiên Mụ', 'Lăng Khải Định'],
  },
];

/** Phân bố POI theo danh mục (tổng 6,420) */
export const MOCK_POI_CATEGORIES: PoiCategoryStat[] = [
  { id: 'hotel', label: 'Khách sạn & Homestay', icon: 'hotel', count: 2700 },
  { id: 'fnb', label: 'Nhà hàng & Quán ăn', icon: 'restaurant', count: 1800 },
  { id: 'attraction', label: 'Điểm tham quan & Di tích', icon: 'attractions', count: 1150 },
  { id: 'experience', label: 'Trải nghiệm & Tour địa phương', icon: 'kayaking', count: 520 },
  { id: 'shopping', label: 'Mua sắm đặc sản', icon: 'shopping_bag', count: 250 },
];

export const MOCK_PARTNER_PERFORMANCE: PartnerPerformance[] = [
  {
    partnerId: 'PTN-0891',
    name: 'Hoi An Hospitality',
    type: 'hotel',
    province: 'quangnam',
    bookings: 12840,
    revenueVnd: 18_420_000_000,
    rating: 4.8,
    growthPercent: 26,
  },
  {
    partnerId: 'PTN-0977',
    name: 'Hanoi Street Food Tours',
    type: 'tour',
    province: 'hanoi',
    bookings: 9620,
    revenueVnd: 6_150_000_000,
    rating: 4.9,
    growthPercent: 31,
  },
  {
    partnerId: 'PTN-1104',
    name: 'Danang Eco Tours',
    type: 'tour',
    province: 'danang',
    bookings: 8410,
    revenueVnd: 7_980_000_000,
    rating: 4.7,
    growthPercent: 19,
  },
  {
    partnerId: 'PTN-0742',
    name: 'Cố Đô Culinary Group',
    type: 'fnb',
    province: 'hanoi',
    bookings: 7930,
    revenueVnd: 3_640_000_000,
    rating: 4.6,
    growthPercent: 12,
  },
  {
    partnerId: 'PTN-1210',
    name: 'Pearl Bay Resort Phú Quốc',
    type: 'hotel',
    province: 'kiengiang',
    bookings: 6880,
    revenueVnd: 21_760_000_000,
    rating: 4.4,
    growthPercent: 22,
  },
  {
    partnerId: 'PTN-0446',
    name: 'Ngũ Hành Sơn Discovery',
    type: 'attraction',
    province: 'danang',
    bookings: 5720,
    revenueVnd: 1_980_000_000,
    rating: 4.6,
    growthPercent: 9,
  },
  {
    partnerId: 'PTN-0329',
    name: 'Saigonese Taste Ltd',
    type: 'fnb',
    province: 'hcm',
    bookings: 5160,
    revenueVnd: 2_410_000_000,
    rating: 4.1,
    growthPercent: -4,
  },
];

export const MOCK_REPORT_INSIGHTS: ReportInsight[] = [
  {
    id: 'INS-1',
    icon: 'dns',
    title: 'Lưu lượng truy cập đạt đỉnh vào quý 2',
    detail:
      'Nhu cầu lập lịch trình tăng mạnh chuẩn bị cho kỳ nghỉ hè. Khuyến nghị tăng tải cụm máy chủ POI trước tháng 5.',
    tone: 'primary',
  },
  {
    id: 'INS-2',
    icon: 'hotel',
    title: 'Combo tour + khách sạn tăng 32% mùa hè',
    detail:
      'Nên đẩy mạnh gợi ý gói kết hợp tại Đà Nẵng, Hội An và Phú Quốc; ưu tiên đối tác có đánh giá từ 4.5 trở lên.',
    tone: 'primary',
  },
  {
    id: 'INS-3',
    icon: 'trending_down',
    title: 'Ẩm thực TP. Hồ Chí Minh giảm nhẹ',
    detail:
      'Lượt đặt nhóm F&B tại TP. Hồ Chí Minh giảm 4% so với quý trước. Cần rà soát chất lượng niêm yết và khuyến mãi.',
    tone: 'error',
  },
  {
    id: 'INS-4',
    icon: 'map',
    title: 'Miền Bắc còn dư địa phát triển POI',
    detail:
      'Ninh Bình và Hạ Long có tăng trưởng lịch trình cao nhưng mật độ POI trải nghiệm địa phương còn thấp.',
    tone: 'tertiary',
  },
];
