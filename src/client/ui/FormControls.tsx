import { useId } from 'react';
import { Icon } from '@/components/common';

const LABEL_CLASS = 'mb-1.5 block text-[12px] font-bold text-[#293E4A]';
const boxClass = (error?: string) =>
  `rounded-xl border bg-client-field px-3 focus-within:ring-2 focus-within:ring-primary/40 ${
    error ? 'border-client-danger' : 'border-[#EBEDF5]'
  }`;

function Message({ error, hint }: { error?: string; hint?: string }) {
  if (error) return <p className="mt-1 text-xs text-client-danger">{error}</p>;
  if (hint) return <p className="mt-1 text-[11px] text-[#71838D]">{hint}</p>;
  return null;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  icon?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

/** Ô chọn cùng kiểu với Field */
export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon = 'list',
  error,
  hint,
  disabled,
}: SelectFieldProps) {
  const id = useId();
  return (
    <div className="mb-4">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <div className={`relative flex h-[51px] items-center ${boxClass(error)}`}>
        <Icon name={icon} className="text-[18px] text-[#168C85]" />
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          className={`ml-2 h-full flex-1 cursor-pointer appearance-none bg-transparent pr-6 text-[14px] focus:outline-none disabled:cursor-not-allowed ${
            value ? 'text-[#18333E]' : 'text-[#98A4AF]'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="expand_more"
          className="pointer-events-none absolute right-3 text-[20px] text-[#83959E]"
        />
      </div>
      <Message error={error} hint={hint} />
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
}: TextAreaFieldProps) {
  const id = useId();
  return (
    <div className="mb-4">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <div className={`py-2 ${boxClass(error)}`}>
        <textarea
          id={id}
          rows={4}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full resize-none bg-transparent text-[14px] text-[#18333E] placeholder:text-[#98A4AF] focus:outline-none"
        />
      </div>
      <div className="flex justify-between">
        <Message error={error} />
        {maxLength && (
          <span className="mt-1 ml-auto text-[11px] text-[#71838D]">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
