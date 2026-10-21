import type { ReactNode } from 'react';
import { Icon } from '@/components/common';

interface ProfileInputProps {
  label: string;
  icon: string;
  value: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'password';
  readOnly?: boolean;
  error?: string;
  autoComplete?: string;
  /** Nút bên phải ô nhập, ví dụ hiện/ẩn mật khẩu */
  trailing?: ReactNode;
}

export default function ProfileInput({
  label,
  icon,
  value,
  onChange,
  type = 'text',
  readOnly = false,
  error,
  autoComplete,
  trailing,
}: ProfileInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon name={icon} className="absolute left-3 text-[18px] text-outline" />
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange?.(event.target.value)}
          className={`h-11 w-full rounded-xl pl-10 font-body-md text-body-md transition-all ${
            trailing ? 'pr-10' : 'pr-space-md'
          } ${
            readOnly
              ? 'cursor-not-allowed bg-surface-container-high text-on-surface-variant'
              : 'bg-surface-container-low text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
          } ${error ? 'ring-2 ring-error/40' : ''}`}
        />
        {trailing && <div className="absolute right-3 flex items-center">{trailing}</div>}
      </div>
      {error && (
        <span className="flex items-center gap-1 font-label-sm text-label-sm text-error">
          <Icon name="error" className="text-[14px]" /> {error}
        </span>
      )}
    </div>
  );
}
