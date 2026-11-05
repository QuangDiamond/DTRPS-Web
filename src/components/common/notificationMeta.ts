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
    match: /_(APPROVED|REACTIVATED)$/,
    tone: {
      icon: 'check_circle',
      badge: 'bg-emerald-50 text-emerald-600',
      accent: 'bg-emerald-500',
    },
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
