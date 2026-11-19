import type {
  AnnouncementForm,
  AnnouncementLevel,
  GeneralSettingsForm,
  RuleSettingsForm,
  TranslationKey,
} from '@/types';

export type SystemTab = 'audit' | 'integrations' | 'rules' | 'announcement' | 'general';

export const SYSTEM_TABS: { value: SystemTab; icon: string }[] = [
  { value: 'audit', icon: 'history' },
  { value: 'integrations', icon: 'hub' },
  { value: 'rules', icon: 'rule' },
  { value: 'announcement', icon: 'campaign' },
  { value: 'general', icon: 'info' },
];

export const isSystemTab = (value: string | null): value is SystemTab =>
  SYSTEM_TABS.some((tab) => tab.value === value);

/** Tab có form lưu được (cần chặn rời trang khi chưa lưu) */
export const FORM_TABS: SystemTab[] = ['rules', 'announcement', 'general'];

/** Lỗi hiển thị: key dịch + tham số */
export interface FieldError {
  key: TranslationKey;
  values?: Record<string, number | string>;
}

export type FormErrors<T> = Partial<Record<keyof T, FieldError>>;

export const hasErrors = <T>(errors: FormErrors<T>): boolean =>
  Object.values(errors).some(Boolean);

// ===== Thông tin chung =====

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Khớp BE: di động/cố định 10–11 số (0… hoặc +84…) hoặc 1800/1900 */
const PHONE = /^(?:(?:\+84|0)[1-9]\d{8,9}|1[89]00\d{4,6})$/;

export function validateGeneral(form: GeneralSettingsForm): FormErrors<GeneralSettingsForm> {
  const errors: FormErrors<GeneralSettingsForm> = {};
  const name = form.siteName.trim();
  if (!name) errors.siteName = { key: 'systemSettings.general.errors.siteNameRequired' };
  else if (name.length < 2 || name.length > 60)
    errors.siteName = { key: 'systemSettings.general.errors.siteNameLength' };

  const email = form.supportEmail.trim();
  if (!email) errors.supportEmail = { key: 'systemSettings.general.errors.emailRequired' };
  else if (email.length > 120)
    errors.supportEmail = { key: 'systemSettings.general.errors.emailLength' };
  else if (!EMAIL.test(email))
    errors.supportEmail = { key: 'systemSettings.general.errors.emailInvalid' };

  const phone = form.supportPhone.trim();
  if (!phone) errors.supportPhone = { key: 'systemSettings.general.errors.phoneRequired' };
  else if (phone.length > 20 || !PHONE.test(phone.replace(/[\s.()-]/g, '')))
    errors.supportPhone = { key: 'systemSettings.general.errors.phoneInvalid' };

  if (form.supportHours.trim().length > 60)
    errors.supportHours = { key: 'systemSettings.general.errors.hoursLength' };
  return errors;
}

// ===== Quy tắc =====

/** Giới hạn khớp với @Min/@Max bên BE */
export const RULE_LIMITS: Record<keyof RuleSettingsForm, { min: number; max: number }> = {
  maxPlaceImages: { min: 1, max: 20 },
  maxImageMb: { min: 1, max: 10 },
  renewalNoticeDays: { min: 1, max: 30 },
  paymentLinkMinutes: { min: 5, max: 60 },
};

/** Ô số giữ chuỗi người dùng gõ để báo lỗi đúng (rỗng, số lẻ…) */
export type RuleDraft = Record<keyof RuleSettingsForm, string>;

export const toRuleDraft = (rules: RuleSettingsForm): RuleDraft => ({
  maxPlaceImages: String(rules.maxPlaceImages),
  maxImageMb: String(rules.maxImageMb),
  renewalNoticeDays: String(rules.renewalNoticeDays),
  paymentLinkMinutes: String(rules.paymentLinkMinutes),
});

export function validateRules(draft: RuleDraft): FormErrors<RuleDraft> {
  const errors: FormErrors<RuleDraft> = {};
  (Object.keys(RULE_LIMITS) as (keyof RuleSettingsForm)[]).forEach((field) => {
    const raw = draft[field].trim();
    const { min, max } = RULE_LIMITS[field];
    if (!raw) errors[field] = { key: 'systemSettings.rules.errors.required' };
    else if (!/^\d+$/.test(raw)) errors[field] = { key: 'systemSettings.rules.errors.integer' };
    else if (Number(raw) < min || Number(raw) > max)
      errors[field] = { key: 'systemSettings.rules.errors.range', values: { min, max } };
  });
  return errors;
}

export const fromRuleDraft = (draft: RuleDraft): RuleSettingsForm => ({
  maxPlaceImages: Number(draft.maxPlaceImages),
  maxImageMb: Number(draft.maxImageMb),
  renewalNoticeDays: Number(draft.renewalNoticeDays),
  paymentLinkMinutes: Number(draft.paymentLinkMinutes),
});

// ===== Thông báo hệ thống =====

export const ANNOUNCEMENT_LEVELS: AnnouncementLevel[] = ['INFO', 'WARNING', 'CRITICAL'];
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 300;

/** Màu banner theo mức độ — dùng cho xem trước (client có bản riêng) */
export const LEVEL_STYLE: Record<AnnouncementLevel, { box: string; icon: string }> = {
  INFO: { box: 'bg-sky-50 text-sky-900 border-sky-200', icon: 'info' },
  WARNING: { box: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'warning' },
  CRITICAL: { box: 'bg-rose-50 text-rose-900 border-rose-200', icon: 'error' },
};

/** ISO → giá trị ô datetime-local (giờ máy người dùng) */
export function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** Ô datetime-local → ISO; rỗng = null; sai = undefined */
export function fromLocalInput(value: string): string | null | undefined {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export interface AnnouncementDraft extends Omit<AnnouncementForm, 'startsAt' | 'endsAt'> {
  startsAt: string;
  endsAt: string;
}

export const toAnnouncementDraft = (form: AnnouncementForm): AnnouncementDraft => ({
  ...form,
  message: form.message ?? '',
  startsAt: toLocalInput(form.startsAt),
  endsAt: toLocalInput(form.endsAt),
});

export function validateAnnouncement(
  draft: AnnouncementDraft,
  now = Date.now(),
): FormErrors<AnnouncementDraft> {
  const errors: FormErrors<AnnouncementDraft> = {};
  const message = draft.message.trim();
  if (message.length > MESSAGE_MAX)
    errors.message = { key: 'systemSettings.announcement.errors.messageLength' };
  else if (draft.enabled && message.length < MESSAGE_MIN)
    errors.message = { key: 'systemSettings.announcement.errors.messageRequired' };

  const starts = fromLocalInput(draft.startsAt);
  const ends = fromLocalInput(draft.endsAt);
  if (starts === undefined)
    errors.startsAt = { key: 'systemSettings.announcement.errors.invalidDate' };
  if (ends === undefined) errors.endsAt = { key: 'systemSettings.announcement.errors.invalidDate' };
  else if (ends) {
    if (starts && new Date(ends) <= new Date(starts))
      errors.endsAt = { key: 'systemSettings.announcement.errors.endsBeforeStart' };
    else if (draft.enabled && new Date(ends).getTime() <= now)
      errors.endsAt = { key: 'systemSettings.announcement.errors.endsInPast' };
  }
  return errors;
}

export const fromAnnouncementDraft = (draft: AnnouncementDraft): AnnouncementForm => ({
  enabled: draft.enabled,
  message: draft.message.trim(),
  level: draft.level,
  audience: draft.audience,
  startsAt: fromLocalInput(draft.startsAt) ?? null,
  endsAt: fromLocalInput(draft.endsAt) ?? null,
});

// ===== Nhật ký =====

/** yyyy-MM-dd theo giờ máy */
export const todayInput = (): string => toLocalInput(new Date().toISOString()).slice(0, 10);

export function validateAuditRange(from: string, to: string): FieldError | null {
  const today = todayInput();
  if ((from && from > today) || (to && to > today))
    return { key: 'systemSettings.audit.errors.future' };
  if (from && to) {
    if (to < from) return { key: 'systemSettings.audit.errors.range' };
    const days = (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000;
    if (days > 366) return { key: 'systemSettings.audit.errors.tooLong' };
  }
  return null;
}

/** USER_STATUS_BANNED → USER_STATUS; mã chưa có nhãn → "Place Review Hidden" */
export const actionGroup = (action: string): string =>
  action.startsWith('USER_STATUS_') ? 'USER_STATUS' : action;

export const humanize = (code: string): string =>
  code
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');

/** Lớp ô nhập theo trạng thái lỗi */
export function inputClass(invalid: boolean): string {
  return `w-full rounded-lg border bg-surface-container-low px-3 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 disabled:opacity-50 ${
    invalid
      ? 'border-error focus:ring-error/25'
      : 'border-transparent focus:border-primary/30 focus:ring-primary/25'
  }`;
}

/** Thuộc tính aria cho ô có lỗi / gợi ý (khớp id trong <Field>) */
export const describedBy = (id: string, invalid: boolean, hasHint: boolean) => ({
  'aria-invalid': invalid,
  'aria-describedby': invalid ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
});

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}
