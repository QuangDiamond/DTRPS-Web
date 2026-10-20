interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** Công tắc dạng pill theo thiết kế Stitch */
export default function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <label
      className={`relative inline-flex shrink-0 items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onChange(event.target.checked)}
      />
      <div className="peer h-6 w-11 rounded-full bg-outline-variant peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-surface-container-lowest after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest" />
    </label>
  );
}
