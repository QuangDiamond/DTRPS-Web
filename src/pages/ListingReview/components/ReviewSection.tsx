import type { ReactNode } from 'react';

interface ReviewSectionProps {
  number: string;
  title: string;
  subtitle: ReactNode;
  badge?: ReactNode;
  /** Nút / link bên phải tiêu đề (thay cho badge) */
  action?: ReactNode;
  numberClassName?: string;
  /** Viền gradient trên cùng cho mục bắt buộc */
  accent?: boolean;
  children: ReactNode;
}

export const REVIEW_CARD_CLASS =
  'rounded-2xl border border-surface-container-high/90 bg-surface-container-lowest p-6 shadow-sm';

/** Khung mục đánh số 01–05 của màn Xem xét & Duyệt */
export default function ReviewSection({
  number,
  title,
  subtitle,
  badge,
  action,
  numberClassName = 'bg-primary',
  accent = false,
  children,
}: ReviewSectionProps) {
  return (
    <section className={`${REVIEW_CARD_CLASS} ${accent ? 'relative overflow-hidden' : ''}`}>
      {accent && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-primary via-primary to-tertiary-container" />
      )}
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-surface-container pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tracking-wider text-on-primary shadow-xs ${numberClassName}`}
          >
            {number}
          </div>
          <div>
            <h2 className="text-[17px] leading-tight font-bold text-on-surface">{title}</h2>
            <div className="text-[12px] text-on-surface-variant">{subtitle}</div>
          </div>
        </div>
        {badge ?? action}
      </div>
      {children}
    </section>
  );
}

/** Ô thông tin chỉ đọc (nền xám, viền mảnh) */
export const READONLY_FIELD_CLASS =
  'rounded-xl border border-surface-container-high/90 bg-surface-container-low px-3.5 py-2.5 text-[13.5px] text-on-surface';

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
      {children}
    </label>
  );
}
