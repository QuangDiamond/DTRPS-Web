import type { InputHTMLAttributes, ReactNode } from 'react';
import Icon from '../common/Icon';

export interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  id: string;
  label: string;
  icon: string;
  /** Phần tử bên phải ô nhập, ví dụ nút ẩn/hiện mật khẩu */
  trailing?: ReactNode;
}

export default function AuthInput({ id, label, icon, trailing, ...inputProps }: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-label-md text-label-md font-medium text-on-surface">
        {label}
      </label>
      <div className="relative flex items-center rounded-xl bg-surface-container-low shadow-sm transition-all focus-within:bg-surface-container-lowest focus-within:shadow-md">
        <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-on-surface-variant">
          <Icon name={icon} className="text-lg" />
        </div>
        <input
          id={id}
          className={`w-full bg-transparent py-3.5 pl-11 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none ${
            trailing ? 'pr-12' : 'pr-4'
          }`}
          {...inputProps}
        />
        {trailing}
      </div>
    </div>
  );
}
