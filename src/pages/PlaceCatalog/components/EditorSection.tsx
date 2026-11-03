import type { ReactNode } from 'react';
import { Icon } from '@/components/common';

/** Khung một phần của form / trang chi tiết: icon + tiêu đề + mô tả ngắn */
export default function EditorSection({
  icon,
  title,
  hint,
  actions,
  children,
}: {
  icon: string;
  title: string;
  hint?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-secondary">
            <Icon name={icon} className="text-[20px]" />
          </span>
          <div>
            <h2 className="font-title-md text-title-md font-bold text-on-surface">{title}</h2>
            {hint && <p className="font-body-sm text-body-sm text-outline">{hint}</p>}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

/** Nhãn + ô nhập + lỗi */
export function FormField({
  label,
  required,
  error,
  hint,
  children,
  className = '',
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="font-label-md text-label-md font-semibold text-on-surface">
        {label} {required && <span className="text-error">*</span>}
      </span>
      {children}
      {error ? (
        <span className="flex items-center gap-1 font-label-sm text-label-sm text-error">
          <Icon name="error" className="text-[14px]" /> {error}
        </span>
      ) : (
        hint && <span className="font-label-sm text-label-sm text-outline">{hint}</span>
      )}
    </label>
  );
}
