interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

/** Material Symbols Outlined — dùng thay cho <span class="material-symbols-outlined"> của Stitch */
export default function Icon({ name, className = '', filled = false }: IconProps) {
  return (
    <span
      className={`material-icon select-none ${className}`}
      style={filled ? { fontVariationSettings: '"FILL" 1' } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
