import type { ReactNode } from 'react';
import Icon from './Icon';

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  /** Màu nền + màu chữ của ô icon, ví dụ "bg-secondary-container text-on-secondary-container" */
  iconClassName: string;
  footer: ReactNode;
}

export default function StatCard({ label, value, icon, iconClassName, footer }: StatCardProps) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
            {label}
          </span>
          <span className="mt-1 font-display-sm text-display-sm font-bold text-on-surface">
            {value}
          </span>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}>
          <Icon name={icon} className="text-[22px]" />
        </div>
      </div>
      {footer}
    </div>
  );
}
