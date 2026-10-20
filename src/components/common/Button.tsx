import type { ButtonHTMLAttributes } from 'react';
import Icon from './Icon';

export type ButtonVariant = 'primary' | 'neutral' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon Material Symbols đứng trước nhãn */
  icon?: string;
  /** Icon đứng sau nhãn, ví dụ "chevron_right" */
  trailingIcon?: string;
  /** Hiện vòng xoay và khóa nút trong lúc xử lý */
  loading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary shadow-sm hover:bg-primary-container',
  neutral: 'bg-surface-container-low text-on-surface hover:bg-surface-container-high',
  secondary: 'bg-surface-container-high text-primary hover:bg-surface-container-highest',
  danger: 'bg-error text-on-error shadow-sm hover:opacity-90',
  ghost: 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
};

const SIZE_CLASSES: Record<ButtonSize, { button: string; icon: string }> = {
  sm: { button: 'gap-1.5 px-space-md py-1.5 font-label-sm text-label-sm', icon: 'text-[16px]' },
  md: { button: 'gap-2 px-5 py-2.5 font-label-md text-label-md', icon: 'text-[18px]' },
};

/** Nút chuẩn của hệ thống (dạng pill) — dùng cho footer modal, form và thao tác chung */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  loading = false,
  type = 'button',
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses.button} ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Icon name="progress_activity" className={`animate-spin ${sizeClasses.icon}`} />
      ) : (
        icon && <Icon name={icon} className={sizeClasses.icon} />
      )}
      {children}
      {trailingIcon && !loading && <Icon name={trailingIcon} className={sizeClasses.icon} />}
    </button>
  );
}
