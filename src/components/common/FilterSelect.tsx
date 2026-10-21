import type { SelectOption } from '@/types';
import Icon from './Icon';

interface FilterSelectProps<T extends string> {
  label: string;
  icon: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}

export default function FilterSelect<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
}: FilterSelectProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-on-surface-variant">
        <Icon name={icon} className="text-[16px] text-primary" /> {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => {
            const next = options.find((option) => option.value === event.target.value);
            if (next) onChange(next.value);
          }}
          className="h-10 w-full cursor-pointer appearance-none rounded-xl bg-surface-container-low px-3 pr-8 font-body-sm text-body-sm font-medium text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="expand_more"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[18px] text-on-surface-variant"
        />
      </div>
    </div>
  );
}
