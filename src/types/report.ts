/** Báo cáo & Thống kê */
import type { DateRange } from './dashboard';
import type { PartnerType, ProvinceCode } from './partner';

export type ReportRegion = 'all' | 'north' | 'central' | 'south';

export type ReportService = 'all' | 'hotel' | 'fnb' | 'attraction' | 'experience';

export type ReportPeriod = '7days' | '30days' | 'quarter' | 'year' | 'custom';

export interface ReportFilters {
  region: ReportRegion;
  service: ReportService;
  period: ReportPeriod;
  /** Khoảng ngày thực tế (ISO) — tự tính theo period, hoặc admin tự chọn khi period = custom */
  dateRange: DateRange;
}

/** Chỉ số tính theo kỳ báo cáo (số tổng tồn kho lấy từ store × coverage) */
export interface ReportKpis {
  /** % tăng trưởng người dùng so với cùng kỳ năm trước */
  userGrowthYoY: number;
  /** Người dùng hoạt động trong tháng */
  monthlyActiveUsers: number;
  tripsCreated: number;
  /** Số truy vấn tìm kiếm ngữ nghĩa AI (pgvector) trong kỳ */
  aiQueries: number;
  /** % truy vấn AI trả về ít nhất 1 kết quả vượt ngưỡng tương đồng */
  aiHitRate: number;
  /** Độ tương đồng trung bình của kết quả top-1 (0 - 100) */
  aiAvgSimilarity: number;
  /** % tăng trưởng đối tác so với quý trước */
  partnerGrowthQoQ: number;
  provincesCovered: number;
  /** Thời gian duyệt niêm yết trung bình (giờ) */
  avgApprovalHours: number;
}

export interface MonthlyTrafficPoint {
  /** 1 - 12 */
  month: number;
  /** Lượt xem trang (nghìn) */
  pageViewsK: number;
  newUsers: number;
  /** Tháng chưa kết thúc / chưa tới — số dự báo */
  projected: boolean;
}

export interface MonthlyTripPoint {
  month: number;
  trips: number;
}

export interface TripInsights {
  /** Tháng bắt đầu & kết thúc mùa cao điểm */
  peakMonths: [number, number];
  /** % tăng của tỷ lệ đặt tour kèm khách sạn vào mùa hè */
  bundleGrowthPercent: number;
  avgDurationDays: number;
  /** Chi tiêu ước tính mỗi chuyến (VNĐ) */
  avgSpendVnd: number;
}

export interface DestinationRank {
  id: string;
  name: string;
  /** Vùng / tỉnh, ví dụ "Tỉnh Quảng Nam" */
  area: string;
  region: Exclude<ReportRegion, 'all'>;
  rating: number;
  plannedTrips: number;
  growthPercent: number;
  highlights: string[];
}

export type ReportCategoryId = Exclude<ReportService, 'all'> | 'shopping';

export interface PoiCategoryStat {
  id: ReportCategoryId;
  label: string;
  icon: string;
  count: number;
}

export interface PartnerPerformance {
  partnerId: string;
  name: string;
  type: PartnerType;
  province: ProvinceCode;
  bookings: number;
  /** Doanh thu đặt chỗ qua nền tảng (VNĐ) */
  revenueVnd: number;
  rating: number;
  growthPercent: number;
}

export interface ReportInsight {
  id: string;
  icon: string;
  title: string;
  detail: string;
  tone: 'primary' | 'tertiary' | 'error';
}

export interface ReportOverview {
  /** Tỷ trọng của phạm vi đang lọc so với toàn quốc (0 - 1) — áp lên số tổng trong store */
  coverage: number;
  kpis: ReportKpis;
  traffic: MonthlyTrafficPoint[];
  trips: MonthlyTripPoint[];
  tripInsights: TripInsights;
  destinations: DestinationRank[];
  poiCategories: PoiCategoryStat[];
  topPartners: PartnerPerformance[];
  insights: ReportInsight[];
  /** Thời điểm server tổng hợp báo cáo (ISO) */
  generatedAt: string;
}
