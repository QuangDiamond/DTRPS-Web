/**
 * Lựa chọn cho màn Sở thích du lịch (UC-006) — giống constants/travelPreferences.ts của mobile.
 * Mã (id) trùng với bảng tham chiếu của BE: interests, transport_modes, special_needs;
 * ngân sách / phong cách gửi lên dạng chữ hoa (SAVING, RELAX…).
 */
import type { BudgetLevel, TravelStyle } from '@/client/api/types';

export interface ImageOption<T extends string = string> {
  id: T;
  label: string;
  image: string;
}

export interface IconOption<T extends string = string> {
  id: T;
  label: string;
  icon: string;
  note?: string;
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&q=80`;

/** Bước 1 – Trải nghiệm (chọn nhiều) */
export const INTEREST_OPTIONS: ImageOption[] = [
  { id: 'nature', label: 'Thiên nhiên & Ngoài trời', image: img('1528127269322-539801943592') },
  { id: 'culture', label: 'Văn hóa & Lịch sử', image: img('1559592413-7cec4d0cae2b') },
  { id: 'food', label: 'Ẩm thực', image: img('1555126634-323283e090fa') },
  { id: 'photo', label: 'Chụp ảnh', image: img('1490750967868-88aa4486c946') },
  { id: 'shopping', label: 'Mua sắm', image: img('1583417319070-4a69db38a482') },
  { id: 'nightlife', label: 'Cuộc sống về đêm', image: img('1528181304800-259b08848526') },
];

/** Bước 2 – Ngân sách (chọn 1) */
export const BUDGET_OPTIONS: IconOption<BudgetLevel>[] = [
  { id: 'SAVING', label: 'Tiết kiệm', note: 'Dưới 5.000.000đ', icon: 'savings' },
  {
    id: 'MEDIUM',
    label: 'Trung bình',
    note: '5.000.000đ - 15.000.000đ',
    icon: 'account_balance_wallet',
  },
  { id: 'LUXURY', label: 'Cao cấp', note: 'Trên 15.000.000đ', icon: 'diamond' },
];

/** Bước 3 – Phương tiện (chọn nhiều) */
export const TRANSPORT_OPTIONS: IconOption[] = [
  { id: 'plane', label: 'Máy bay', icon: 'flight' },
  { id: 'train', label: 'Tàu hỏa', icon: 'train' },
  { id: 'bus', label: 'Xe khách', icon: 'directions_bus' },
  { id: 'car', label: 'Ô tô thuê', icon: 'directions_car' },
  { id: 'motorbike', label: 'Xe máy', icon: 'two_wheeler' },
  { id: 'other', label: 'Khác', icon: 'more_horiz' },
];

/** Bước 4 – Phong cách (chọn 1) */
export const STYLE_OPTIONS: ImageOption<TravelStyle>[] = [
  { id: 'RELAX', label: 'Thư giãn', image: img('1506461883276-594a12b11cf3') },
  { id: 'ADVENTURE', label: 'Phiêu lưu', image: img('1570366583862-f91883984fde') },
  { id: 'CULTURE', label: 'Khám phá văn hóa', image: img('1540611025311-01df3cef54b5') },
  { id: 'FAMILY', label: 'Du lịch gia đình', image: img('1564596823821-79b97151055e') },
  { id: 'SOLO', label: 'Du lịch một mình', image: img('1509030450996-dd1a26dda07a') },
  { id: 'LUXURY', label: 'Du lịch cao cấp', image: img('1573270689103-d7a4e42b609a') },
];

/** Bước 5 – Yêu cầu đặc biệt (chọn nhiều, không bắt buộc) */
export const SPECIAL_NEED_OPTIONS: IconOption[] = [
  { id: 'vegetarian', label: 'Ăn chay', icon: 'eco' },
  { id: 'diet', label: 'Hạn chế đồ ăn', icon: 'no_meals' },
  { id: 'kids', label: 'Phù hợp trẻ em', icon: 'child_care' },
  { id: 'elderly', label: 'Phù hợp người lớn tuổi', icon: 'elderly' },
  { id: 'pets', label: 'Thân thiện với thú cưng', icon: 'pets' },
  { id: 'other', label: 'Khác', icon: 'more_horiz' },
];
