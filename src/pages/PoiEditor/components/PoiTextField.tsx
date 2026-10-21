import type { ReactNode } from 'react';
import { Icon } from '@/components/common';

export const POI_INPUT_CLASS =
  'w-full bg-surface-container-low text-on-surface font-body-md text-body-md py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all';

interface PoiTextFieldProps {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  icon?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'url';
  placeholder?: string;
  error?: string;
  className?: string;
}

/** Ô nhập một dòng theo style form Stitch (nhãn + icon trái + thông báo lỗi) */
export default function PoiTextField({
  label,
  value,
  onChange,
  icon,
  required = false,
  type = 'text',
  placeholder,
  error,
  className = '',
}: PoiTextFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="flex items-center gap-1 font-label-md text-label-md font-semibold text-on-surface">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className="relative flex items-center">
        {icon && <Icon name={icon} className="absolute left-3 text-[18px] text-outline" />}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className={`${POI_INPUT_CLASS} ${icon ? 'pr-space-md pl-10' : 'px-space-md'} ${
            error ? 'ring-2 ring-error/40' : ''
          } placeholder:text-outline`}
        />
      </div>
      {error && (
        <span className="flex items-center gap-1 font-label-sm text-label-sm text-error">
          <Icon name="error" className="text-[14px]" /> {error}
        </span>
      )}
    </div>
  );
}
