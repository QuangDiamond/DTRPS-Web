/**
 * Lựa chọn của màn Lập kế hoạch chuyến đi (giống constants/planTrip.ts của mobile).
 * Danh sách điểm đến lấy từ danh mục tỉnh/thành của hệ thống (GET /api/reference/provinces).
 */

export type CompanionId = 'solo' | 'couple' | 'family' | 'friends';

export const COMPANION_OPTIONS: {
  id: CompanionId;
  label: string;
  note: string;
  icon: string;
  defaultCount: number;
}[] = [
  { id: 'solo', label: 'Solo', note: '1 người', icon: 'person', defaultCount: 1 },
  { id: 'couple', label: 'Cặp đôi', note: '2 người lớn', icon: 'favorite', defaultCount: 2 },
  { id: 'family', label: 'Gia đình', note: 'Có trẻ nhỏ', icon: 'family_restroom', defaultCount: 4 },
  { id: 'friends', label: 'Nhóm bạn', note: '3+ người', icon: 'groups', defaultCount: 4 },
];

export type PlanBudgetId = 'saving' | 'standard' | 'luxury';

export const PLAN_BUDGET_OPTIONS: {
  id: PlanBudgetId;
  label: string;
  note: string;
  estimate: string;
}[] = [
  { id: 'saving', label: 'Tiết kiệm', note: '< 5 triệu', estimate: '~3.500.000 đ' },
  { id: 'standard', label: 'Tiêu chuẩn', note: '5tr - 12tr', estimate: '~8.000.000 đ' },
  { id: 'luxury', label: 'Sang trọng', note: '> 12 triệu', estimate: '~15.000.000 đ' },
];

export const PLAN_INTEREST_OPTIONS: { id: string; label: string; icon: string }[] = [
  { id: 'beach', label: 'Bãi biển', icon: 'beach_access' },
  { id: 'food', label: 'Ẩm thực', icon: 'restaurant' },
  { id: 'culture', label: 'Văn hóa & Di sản', icon: 'account_balance' },
  { id: 'nature', label: 'Thiên nhiên & Sinh thái', icon: 'park' },
  { id: 'shopping', label: 'Mua sắm & Chợ đêm', icon: 'shopping_bag' },
  { id: 'adventure', label: 'Phiêu lưu & Khám phá', icon: 'hiking' },
  { id: 'relax', label: 'Nghỉ dưỡng & Spa', icon: 'spa' },
];

export type PaceId = 'relaxed' | 'balanced' | 'packed';

export const PACE_OPTIONS: {
  id: PaceId;
  label: string;
  english: string;
  perDay: string;
  description: string;
}[] = [
  {
    id: 'relaxed',
    label: 'Thư giãn',
    english: 'Relaxed',
    perDay: '2-3 điểm/ngày',
    description: 'Thong thả tận hưởng, không hối hả, nhiều thời gian tự do cafe ngắm cảnh.',
  },
  {
    id: 'balanced',
    label: 'Cân bằng',
    english: 'Balanced',
    perDay: '3-4 điểm/ngày',
    description: 'Hài hòa giữa nghỉ ngơi, ẩm thực và tham quan các địa danh tiêu biểu.',
  },
  {
    id: 'packed',
    label: 'Khám phá tối đa',
    english: 'Packed',
    perDay: '5-6 điểm/ngày',
    description: 'Trải nghiệm phong phú, tận dụng trọn vẹn từng khoảnh khắc trong ngày.',
  },
];
