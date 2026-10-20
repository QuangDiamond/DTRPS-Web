import { useEffect, useRef, type RefObject } from 'react';

/** Gọi onDismiss khi bấm ra ngoài phần tử hoặc nhấn Esc — dùng cho menu thả xuống / popover */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: () => void,
): void {
  const handlerRef = useRef(onDismiss);
  useEffect(() => {
    handlerRef.current = onDismiss;
  });

  useEffect(() => {
    if (!active) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) handlerRef.current();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handlerRef.current();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, active]);
}
