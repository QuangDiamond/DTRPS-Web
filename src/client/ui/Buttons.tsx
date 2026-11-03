import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  /** Hiện mũi tên → sau chữ (mặc định có) */
  arrow?: boolean;
}

/** Nút chính theo PrimaryButton của mobile */
export function PrimaryButton({
  children,
  loading = false,
  arrow = true,
  disabled,
  type = 'button',
  className = '',
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[14px] font-extrabold text-white transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:bg-[#9EBEB9] ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        <>
          {children}
          {arrow && <Icon name="arrow_forward" className="text-[19px]" />}
        </>
      )}
    </button>
  );
}

/** Nút phụ nền xanh nhạt (theo Button secondary của màn đối tác) */
export function SecondaryButton({
  children,
  type = 'button',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`flex h-[48px] w-full items-center justify-center rounded-[15px] bg-[#E3F3EF] text-[13px] font-extrabold text-primary transition-colors hover:bg-client-pale disabled:opacity-60 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Liên kết chữ xanh ở cuối form (theo LinkText của mobile) */
export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="block py-3 text-center text-[12px] font-bold text-[#007A73] hover:underline"
    >
      {children}
    </Link>
  );
}
