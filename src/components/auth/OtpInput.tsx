import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';

interface OtpInputProps {
  digits: string[];
  onChange: (digits: string[]) => void;
  disabled?: boolean;
}

/** 6 ô nhập OTP: tự nhảy ô, Backspace lùi ô, hỗ trợ dán cả mã */
export default function OtpInput({ digits, onChange, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const focusAt = (index: number) => {
    const target = inputRefs.current[Math.max(0, Math.min(index, digits.length - 1))];
    target?.focus();
    target?.select();
  };

  const setDigit = (index: number, value: string) => {
    const next = [...digits];
    next[index] = value;
    onChange(next);
  };

  const handleInput = (index: number, rawValue: string) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    setDigit(index, digit);
    if (digit) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      setDigit(index - 1, '');
      focusAt(index - 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, digits.length);
    if (!pasted) return;
    event.preventDefault();
    onChange(digits.map((_, index) => pasted[index] ?? ''));
    focusAt(pasted.length);
  };

  return (
    <div className="grid grid-cols-6 gap-space-xs sm:gap-space-sm">
      {digits.map((digit, index) => {
        const isFocused = focusedIndex === index;
        return (
          <div
            key={index}
            className={`relative flex h-14 items-center justify-center rounded-xl text-on-surface transition-all sm:h-16 ${
              isFocused
                ? 'bg-surface-container-lowest shadow-md ring-2 ring-primary/30'
                : 'bg-surface-container-low shadow-inner'
            }`}
          >
            <input
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              disabled={disabled}
              aria-label={`Chữ số thứ ${index + 1}`}
              onChange={(event) => handleInput(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              onFocus={(event) => {
                setFocusedIndex(index);
                event.target.select();
              }}
              onBlur={() => setFocusedIndex(null)}
              className="h-full w-full bg-transparent text-center font-headline-lg text-display-sm font-bold text-on-surface caret-primary focus:outline-none disabled:cursor-not-allowed"
            />
            {!digit && !isFocused && (
              <span className="pointer-events-none absolute h-2 w-2 rounded-full bg-outline-variant" />
            )}
          </div>
        );
      })}
    </div>
  );
}
