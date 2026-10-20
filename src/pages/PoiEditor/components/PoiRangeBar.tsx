interface PoiRangeBarProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  /** Lớp chiều cao thanh, ví dụ "h-1.5" */
  heightClass: string;
  onChange: (value: number) => void;
}

/** Thanh tiến độ của Stitch, phủ thêm input range trong suốt để kéo chỉnh giá trị */
export default function PoiRangeBar({
  value,
  min,
  max,
  step = 1,
  label,
  heightClass,
  onChange,
}: PoiRangeBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="relative flex items-center py-1">
      <div
        className={`w-full overflow-hidden rounded-full bg-surface-container-highest ${heightClass}`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
