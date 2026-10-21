import type { ReactNode } from 'react';
import { Icon } from '@/components/common';

interface SummaryTabProps {
  icon: string;
  iconClass: string;
  title: string;
  description: string;
  action?: ReactNode;
}

/** Tab tóm tắt (Địa điểm đã lưu / Đánh giá) — giống khối placeholder trong thiết kế */
export default function SummaryTab({
  icon,
  iconClass,
  title,
  description,
  action,
}: SummaryTabProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-container-lowest p-space-xl py-16 text-center shadow-sm">
      <div
        className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container ${iconClass}`}
      >
        <Icon name={icon} className="text-[32px]" />
      </div>
      <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{title}</h4>
      <p className="mt-1 max-w-md font-body-md text-body-md text-on-surface-variant">
        {description}
      </p>
      {action}
    </div>
  );
}
