import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';

/** Thanh tiêu đề của trang con: nút quay lại + tiêu đề + các nút bên phải (theo header màn con của mobile) */
export default function PageBar({
  title,
  subtitle,
  backTo,
  onBack,
  actions,
}: {
  title: string;
  subtitle?: string;
  /** Đường dẫn khi bấm quay lại (bỏ qua nếu có onBack) */
  backTo?: string;
  onBack?: () => void;
  actions?: ReactNode;
}) {
  const backClass =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-client-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:text-primary';
  return (
    <div className="mb-4 flex items-center gap-3">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Quay lại" className={backClass}>
          <Icon name="arrow_back" className="text-[22px]" />
        </button>
      ) : backTo ? (
        <Link to={backTo} aria-label="Quay lại" className={backClass}>
          <Icon name="arrow_back" className="text-[22px]" />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[18px] font-extrabold text-client-ink md:text-[22px]">
          {title}
        </h1>
        {subtitle && <p className="truncate text-[11px] text-client-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </div>
  );
}

/** Nút tròn chỉ có icon dùng trong PageBar */
export function BarIconButton({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-10 w-10 items-center justify-center rounded-full ${
        active ? 'bg-[#C3F8F0] text-primary' : 'bg-white text-[#435369] hover:text-primary'
      }`}
    >
      <Icon name={icon} filled={active} className="text-[21px]" />
    </button>
  );
}
