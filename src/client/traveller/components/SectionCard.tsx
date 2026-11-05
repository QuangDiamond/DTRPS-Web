import type { ReactNode } from 'react';
import { Icon } from '@/components/common';

/** Khung một mục trong form kế hoạch (dùng ở trang tạo và trang sửa). */
export default function SectionCard({
  icon,
  title,
  subtitle,
  right,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[20px] bg-white p-4">
      <div className="mb-3 flex items-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBEDFF] text-[#087A78]">
          <Icon name={icon} className="text-[19px]" />
        </span>
        <div className="ml-2.5 min-w-0 flex-1">
          <h2 className="text-[14px] font-extrabold text-[#13364A]">{title}</h2>
          <p className="text-[11px] text-[#72818C]">{subtitle}</p>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}
