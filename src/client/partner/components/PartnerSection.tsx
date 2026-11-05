import type { ReactNode } from 'react';
import { Icon } from '@/components/common';

/**
 * Khung một mục của form / trang xem địa điểm bên đối tác: icon + tiêu đề + gợi ý.
 * Cùng bố cục với EditorSection bên admin để hai bên trông đồng bộ.
 */
export default function PartnerSection({
  icon,
  title,
  hint,
  actions,
  children,
  className = '',
}: {
  icon: string;
  title: string;
  hint?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[20px] border border-client-line bg-white p-5 shadow-[0_3px_12px_rgba(19,54,74,0.04)] ${className}`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E4F6F2] text-[#087F79]">
            <Icon name={icon} className="text-[20px]" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold text-client-ink">{title}</h2>
            {hint && <p className="mt-0.5 text-[12px] text-client-muted">{hint}</p>}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
