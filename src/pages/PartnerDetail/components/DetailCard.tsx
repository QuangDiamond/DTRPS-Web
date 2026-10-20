import type { ReactNode } from 'react';
import Icon from '../../../components/common/Icon';

interface DetailCardProps {
  icon: string;
  iconBoxClass: string;
  title: string;
  subtitle: string;
  badge?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** Khung thẻ dùng cho 4 khối thông tin ở tab "Thông tin doanh nghiệp & Pháp lý" */
export default function DetailCard({
  icon,
  iconBoxClass,
  title,
  subtitle,
  badge,
  footer,
  children,
}: DetailCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-surface-container/60 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBoxClass}`}
            >
              <Icon name={icon} className="text-[22px]" />
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>
            </div>
          </div>
          {badge}
        </div>
        {children}
      </div>
      {footer && (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-surface-container/60 pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-0.5 block font-label-sm text-label-sm tracking-wider text-outline uppercase">
      {children}
    </span>
  );
}

export const CARD_LINK_BUTTON_CLASS =
  'flex items-center gap-1 rounded-full bg-surface-container px-3 py-1.5 font-label-sm text-label-sm font-semibold text-primary transition-all hover:bg-surface-container-high';
