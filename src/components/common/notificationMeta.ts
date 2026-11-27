/** Tab chuông theo nhóm BE trả về (NotificationCategory) — tên ngắn để vừa một hàng */
export const NOTIFICATION_CATEGORIES: Record<string, { label: string; icon: string }> = {
  LISTING: { label: 'Niêm yết', icon: 'storefront' },
  ADS: { label: 'Quảng cáo', icon: 'campaign' },
  REVIEW: { label: 'Đánh giá', icon: 'reviews' },
  TRIP: { label: 'Chuyến đi', icon: 'luggage' },
  WEATHER: { label: 'Thời tiết', icon: 'thunderstorm' },
  OTHER: { label: 'Khác', icon: 'notifications' },
};

/** Icon + màu cho từng loại thông báo (theo hậu tố của type, ví dụ LISTING_APPROVED) */
export interface NotificationTone {
  icon: string;
  /** Lớp Tailwind cho ô icon */
  badge: string;
  /** Lớp Tailwind cho vạch màu bên trái toast */
  accent: string;
}

const TONES: { match: RegExp; tone: NotificationTone }[] = [
  {
    match: /^(TRIP_)?WEATHER_SEVERE$/,
    tone: { icon: 'thunderstorm', badge: 'bg-rose-50 text-rose-600', accent: 'bg-rose-500' },
  },
  {
    match: /^(TRIP_)?WEATHER_/,
    tone: { icon: 'rainy', badge: 'bg-amber-50 text-amber-600', accent: 'bg-amber-500' },
  },
  {
    match: /^TRIP_UPCOMING_REMINDER$/,
    tone: { icon: 'luggage', badge: 'bg-sky-50 text-sky-600', accent: 'bg-sky-500' },
  },
  {
    match: /^TRIP_REVIEW_REMINDER$/,
    tone: {
      icon: 'rate_review',
      badge: 'bg-emerald-50 text-emerald-600',
      accent: 'bg-emerald-500',
    },
  },
  {
    match: /_(APPROVED|REACTIVATED)$/,
    tone: {
      icon: 'check_circle',
      badge: 'bg-emerald-50 text-emerald-600',
      accent: 'bg-emerald-500',
    },
  },
  {
    match: /^AD_PAYMENT_SUCCESS$/,
    tone: { icon: 'payments', badge: 'bg-emerald-50 text-emerald-600', accent: 'bg-emerald-500' },
  },
  {
    match:
      /^AD_(PAYMENT_REVIEW|PAYMENT_ISSUE_CREATED|PAYMENT_ISSUE_REJECTED|SUSPENDED|SUBSCRIPTION_CANCELLED)$/,
    tone: { icon: 'warning', badge: 'bg-rose-50 text-rose-600', accent: 'bg-rose-500' },
  },
  {
    match: /^AD_SUBSCRIPTION_(EXPIRING|EXPIRED)$/,
    tone: { icon: 'schedule', badge: 'bg-amber-50 text-amber-600', accent: 'bg-amber-500' },
  },
  {
    match: /^AD_/,
    tone: { icon: 'campaign', badge: 'bg-teal-50 text-teal-700', accent: 'bg-teal-600' },
  },
  {
    match: /_REPORTED$/,
    tone: { icon: 'flag', badge: 'bg-rose-50 text-rose-600', accent: 'bg-rose-500' },
  },
  {
    match: /_RESOLVED$/,
    tone: { icon: 'task_alt', badge: 'bg-emerald-50 text-emerald-600', accent: 'bg-emerald-500' },
  },
  {
    match: /_DISMISSED$/,
    tone: { icon: 'fact_check', badge: 'bg-slate-100 text-slate-600', accent: 'bg-slate-400' },
  },
  {
    match: /_HIDDEN$/,
    tone: { icon: 'visibility_off', badge: 'bg-amber-50 text-amber-600', accent: 'bg-amber-500' },
  },
  {
    match: /_RESTORED$/,
    tone: { icon: 'visibility', badge: 'bg-emerald-50 text-emerald-600', accent: 'bg-emerald-500' },
  },
  {
    match: /_REJECTED$/,
    tone: { icon: 'cancel', badge: 'bg-rose-50 text-rose-600', accent: 'bg-rose-500' },
  },
  {
    match: /_SUSPENDED$/,
    tone: { icon: 'lock', badge: 'bg-amber-50 text-amber-600', accent: 'bg-amber-500' },
  },
  {
    match: /_CANCELLED$/,
    tone: { icon: 'undo', badge: 'bg-slate-100 text-slate-500', accent: 'bg-slate-400' },
  },
  {
    match: /^REVISION_SUBMITTED$/,
    tone: { icon: 'edit_note', badge: 'bg-sky-50 text-sky-600', accent: 'bg-sky-500' },
  },
  {
    match: /^PARTNER_(SUBMITTED|RESUBMITTED)$/,
    tone: { icon: 'storefront', badge: 'bg-violet-50 text-violet-600', accent: 'bg-violet-500' },
  },
  {
    match: /_(SUBMITTED|RESUBMITTED)$/,
    tone: { icon: 'add_location_alt', badge: 'bg-teal-50 text-teal-700', accent: 'bg-teal-600' },
  },
];

const DEFAULT_TONE: NotificationTone = {
  icon: 'notifications',
  badge: 'bg-slate-100 text-slate-600',
  accent: 'bg-teal-600',
};

export function notificationTone(type: string): NotificationTone {
  return TONES.find((entry) => entry.match.test(type))?.tone ?? DEFAULT_TONE;
}
