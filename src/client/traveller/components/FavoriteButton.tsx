import { Icon } from '@/components/common';

/** Nút trái tim tròn nền trắng nằm trên ảnh (hover phóng nhẹ, bấm lưu nảy bằng @keyframes heartPop) */
export default function FavoriteButton({
  active,
  onToggle,
  size = 'md',
  className = '',
}: {
  active: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      aria-label={active ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      aria-pressed={active}
      className={`flex items-center justify-center rounded-full bg-white shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-90 ${
        size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
      } ${className}`}
    >
      <Icon
        name="favorite"
        filled={active}
        className={`transition-colors duration-200 ${size === 'sm' ? 'text-[16px]' : 'text-[20px]'} ${
          active ? 'animate-[heartPop_340ms_ease-out] text-[#D93B4A]' : 'text-[#5C6B75]'
        }`}
      />
    </button>
  );
}
