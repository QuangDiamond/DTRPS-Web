import { Icon } from '@/components/common';

/** 5 ngôi sao, tô đúng số sao đã chấm */
export default function RatingStars({ value }: { value: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center"
      aria-label={`${value}/5`}
      title={`${value}/5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          filled={star <= value}
          className={`text-[16px] ${star <= value ? 'text-amber-500' : 'text-outline-variant'}`}
        />
      ))}
    </span>
  );
}
