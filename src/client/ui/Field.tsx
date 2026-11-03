import { type InputHTMLAttributes, useId, useState } from 'react';
import { Icon } from '@/components/common';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Material Symbol bên trái ô nhập */
  icon?: string;
  error?: string;
  hint?: string;
}

/** Ô nhập theo Field của mobile; type="password" có nút ẩn/hiện */
export default function Field({
  label,
  value,
  onChange,
  icon,
  error,
  hint,
  type = 'text',
  ...rest
}: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const leadingIcon = icon ?? (isPassword ? 'lock' : type === 'email' ? 'mail' : 'person');

  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-bold text-[#293E4A]">
        {label}
      </label>
      <div
        className={`flex h-[51px] items-center rounded-xl border bg-client-field px-3 focus-within:ring-2 focus-within:ring-primary/40 ${
          error ? 'border-client-danger' : 'border-[#EBEDF5]'
        }`}
      >
        <Icon name={leadingIcon} className="text-[18px] text-[#168C85]" />
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className="ml-2 h-full flex-1 bg-transparent text-[14px] text-[#18333E] placeholder:text-[#98A4AF] focus:outline-none"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="text-[#83959E] hover:text-primary"
          >
            <Icon name={visible ? 'visibility' : 'visibility_off'} className="text-[20px]" />
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-client-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-[#71838D]">{hint}</p>
      ) : null}
    </div>
  );
}
