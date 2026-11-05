import type { ReactNode } from 'react';
import { Icon } from '@/components/common';

/** Khối tiêu đề nền xanh nhạt (theo Heading của màn đối tác trên mobile) */
export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 rounded-[24px] bg-client-pale px-5 py-6 md:px-8 md:py-8">
      <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#007E73] uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-[24px] leading-[32px] font-extrabold text-client-ink md:text-[30px] md:leading-[38px]">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-2xl text-[13px] leading-[21px] text-client-muted">{description}</p>
      )}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-3 rounded-[20px] border border-client-line bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <p className="text-[15px] font-bold text-client-ink">{children}</p>;
}

/** Ghi chú nền xanh có icon thông tin */
export function Notice({
  children,
  tone = 'info',
}: {
  children: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'danger';
}) {
  const styles = {
    info: 'bg-[#E5F5F0] text-[#356D64]',
    success: 'border border-[#8FD9B6] bg-[#DDF7EA] font-semibold text-[#11643F]',
    warning: 'bg-[#FFF4DD] text-[#7A5410]',
    danger: 'bg-[#FCE4E3] text-[#9A2D2D]',
  }[tone];
  const icon = { info: 'info', success: 'check_circle', warning: 'schedule', danger: 'error' }[
    tone
  ];
  return (
    <div className={`mb-4 flex items-start gap-2 rounded-2xl p-4 ${styles}`}>
      <Icon name={icon} className="text-[18px]" />
      <div className="flex-1 text-[12px] leading-[19px]">{children}</div>
    </div>
  );
}

/** Một dòng "nhãn — giá trị" có kẻ trên (theo Line của mobile) */
export function InfoLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-t border-[#E9EEEE] py-3">
      <span className="flex-1 text-[12px] text-client-muted">{label}</span>
      <span className="flex-1 text-right text-[12px] font-bold break-words text-client-ink">
        {value}
      </span>
    </div>
  );
}

export type BadgeTone = 'pending' | 'approved' | 'rejected' | 'locked' | 'draft';

const BADGE_STYLES: Record<BadgeTone, string> = {
  pending: 'bg-[#FFF0D5] text-[#976207]',
  approved: 'bg-[#DDF4E8] text-primary',
  rejected: 'bg-[#FCE4E3] text-[#AD3232]',
  locked: 'bg-[#EDE7F6] text-[#5B3E99]',
  draft: 'bg-[#EDF0F0] text-[#596768]',
};

export function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${BADGE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-client-muted">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-client-pale border-t-primary" />
      <span className="text-[12px]">{label}</span>
    </div>
  );
}

/** Thông báo lỗi trong form */
export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2 rounded-xl bg-[#FCE4E3] p-3 text-[12px] text-[#9A2D2D]"
    >
      <Icon name="error" className="text-[18px]" />
      <span className="flex-1">{message}</span>
    </div>
  );
}
