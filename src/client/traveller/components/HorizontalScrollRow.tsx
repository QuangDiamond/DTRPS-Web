import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/common';

const SCROLL_STEP = 160;

/** Dải cuộn ngang có nút mũi tên trái/phải (chỉ hiện khi còn nội dung để cuộn tiếp). */
export default function HorizontalScrollRow({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
  }, [children]);

  const scrollBy = (delta: number) =>
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });

  return (
    <div className="relative min-w-0">
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="-mx-1 flex gap-2 overflow-x-auto scroll-smooth px-1 pb-1"
      >
        {children}
      </div>
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-SCROLL_STEP)}
          aria-label="Xem các mục trước"
          className="absolute top-1/2 left-0 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#3B6FD8] shadow-[0_2px_8px_rgba(19,54,74,0.18)]"
        >
          <Icon name="chevron_left" className="text-[18px]" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(SCROLL_STEP)}
          aria-label="Xem thêm"
          className="absolute top-1/2 right-0 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#3B6FD8] shadow-[0_2px_8px_rgba(19,54,74,0.18)]"
        >
          <Icon name="chevron_right" className="text-[18px]" />
        </button>
      )}
    </div>
  );
}
