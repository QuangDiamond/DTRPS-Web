import type { ReactNode } from 'react';
import { Icon } from '@/components/common';

interface KpiCardProps {
  label: string;
  icon: string;
  iconClassName: string;
  value: string;
  valueClassName?: string;
  /** Phần tử nằm ngay sau con số, ví dụ badge "Cần xử lý ngay" */
  valueAddon?: ReactNode;
  /** Phần tử bên phải con số, ví dụ "+12.4%" */
  aside?: ReactNode;
  footer: ReactNode;
  footerClassName?: string;
  /** Màu nhấn cho thẻ cần chú ý */
  highlight?: boolean;
  onClick: () => void;
}

export default function KpiCard({
  label,
  icon,
  iconClassName,
  value,
  valueClassName = 'text-on-surface',
  valueAddon,
  aside,
  footer,
  footerClassName = 'gap-1',
  highlight = false,
  onClick,
}: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex cursor-pointer flex-col justify-between rounded-2xl border bg-surface-container-lowest p-6 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-transform duration-200 hover:-translate-y-0.5 ${
        highlight ? 'border-tertiary-fixed/60' : 'border-surface-container/60'
      }`}
    >
      <div className="mb-4 flex w-full items-center justify-between">
        <span
          className={`font-label-md text-[12px] font-semibold tracking-wider uppercase ${
            highlight ? 'text-tertiary' : 'text-on-surface-variant'
          }`}
        >
          {label}
        </span>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}>
          <Icon name={icon} className="text-[24px]" />
        </div>
      </div>

      <div className="flex w-full items-baseline justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`font-display-sm text-[28px] font-bold tracking-tight ${valueClassName}`}
          >
            {value}
          </span>
          {valueAddon}
        </div>
        {aside}
      </div>

      <div
        className={`mt-3.5 flex w-full items-center font-body-sm text-[12px] text-on-surface-variant ${footerClassName}`}
      >
        {footer}
      </div>
    </button>
  );
}
