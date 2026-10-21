import type { ReactNode } from 'react';
import { Icon } from '@/components/common';

interface PoiSectionCardProps {
  icon: string;
  title: string;
  description: string;
  /** Badge bên phải tiêu đề, ví dụ "Bắt buộc" */
  badge?: ReactNode;
  iconBoxClass?: string;
  /** Thẻ cột trái dùng p-space-xl, thẻ cột phải dùng p-space-lg */
  compact?: boolean;
  /** Lớp trang trí đặt trước nội dung (ví dụ vệt sáng góc thẻ AI) */
  decoration?: ReactNode;
  children: ReactNode;
}

export default function PoiSectionCard({
  icon,
  title,
  description,
  badge,
  iconBoxClass = 'bg-secondary-container text-secondary',
  compact = false,
  decoration,
  children,
}: PoiSectionCardProps) {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm ${
        compact ? 'gap-space-md p-space-lg' : 'gap-space-lg p-space-xl'
      }`}
    >
      {decoration}
      <div className={`flex items-center justify-between ${compact ? '' : 'pb-space-xs'}`}>
        <div className="flex items-center gap-space-sm">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBoxClass}`}
          >
            <Icon name={icon} className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-title-md text-title-md font-bold text-on-surface">{title}</h2>
            <p className="font-body-sm text-body-sm text-outline">{description}</p>
          </div>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}
