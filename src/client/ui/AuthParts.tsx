import { type ClipboardEvent, type KeyboardEvent, type ReactNode, useRef, useState } from 'react';
import { Icon } from '@/components/common';
import type { OtpSent } from '@/client/api/authApi';
import { errorMessage } from '@/client/api/http';
import { FormAlert } from '@/client/ui/Blocks';
import { PrimaryButton } from '@/client/ui/Buttons';
import { formatClock, useCountdown } from '@/client/utils/useCountdown';

/** Thẻ trắng chứa form xác thực: tiêu đề + mô tả + nội dung */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#E8EDF2] bg-white p-6 shadow-[0_10px_30px_rgba(19,54,74,0.06)] sm:p-7">
      <h1 className="text-[22px] font-extrabold text-[#13364A]">{title}</h1>
      {subtitle && <p className="mt-1 mb-5 text-[13px] leading-5 text-[#62737F]">{subtitle}</p>}
      {!subtitle && <div className="mb-5" />}
      {children}
    </section>
  );
}

/** Thanh các bước: ① Thông tin ─ ② Xác thực email ─ ③ Mật khẩu */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Các bước">
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                done
                  ? 'bg-primary text-white'
                  : active
                    ? 'bg-[#E4F6F2] text-primary ring-2 ring-primary'
                    : 'bg-[#EEF1F5] text-[#8A99A6]'
              }`}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <Icon name="check" className="text-[16px]" /> : index + 1}
            </span>
            <span
              className={`truncate text-[11.5px] font-semibold ${active ? 'text-[#13364A]' : 'text-[#8A99A6]'}`}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <span className={`h-px flex-1 ${done ? 'bg-primary' : 'bg-[#E3E8EE]'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

const DIGITS = 6;

/** 6 ô nhập mã: tự nhảy ô, dán được cả mã, Backspace lùi ô */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: DIGITS }, (_, index) => value[index] ?? '');

  const set = (next: string) => {
    const clean = next.replace(/\D/g, '').slice(0, DIGITS);
    onChange(clean);
    if (clean.length === DIGITS) onComplete?.(clean);
  };

  const type = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const next = (value.slice(0, index) + digit + value.slice(index + 1)).slice(0, DIGITS);
    set(next);
    refs.current[Math.min(index + 1, DIGITS - 1)]?.focus();
  };

  const key = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (digits[index]) set(value.slice(0, index) + value.slice(index + 1));
      else if (index > 0) {
        set(value.slice(0, index - 1) + value.slice(index));
        refs.current[index - 1]?.focus();
      }
    } else if (event.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    else if (event.key === 'ArrowRight' && index < DIGITS - 1) refs.current[index + 1]?.focus();
  };

  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, DIGITS);
    if (!pasted) return;
    set(pasted);
    refs.current[Math.min(pasted.length, DIGITS - 1)]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="Mã xác thực 6 số">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          value={digit}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          autoFocus={index === 0}
          aria-label={`Số thứ ${index + 1}`}
          onChange={(event) => type(index, event.target.value)}
          onKeyDown={(event) => key(index, event)}
          onPaste={paste}
          onFocus={(event) => event.target.select()}
          className={`h-14 w-full min-w-0 rounded-xl border bg-client-field text-center text-[22px] font-extrabold text-[#13364A] focus:ring-2 focus:ring-primary/40 focus:outline-none disabled:opacity-60 ${
            invalid ? 'border-client-danger' : digit ? 'border-primary/50' : 'border-[#E3E8EE]'
          }`}
        />
      ))}
    </div>
  );
}

const RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: 'Từ 8 ký tự', test: (value) => value.length >= 8 && value.length <= 72 },
  { label: 'Có chữ hoa', test: (value) => /[A-Z]/.test(value) },
  { label: 'Có chữ thường', test: (value) => /[a-z]/.test(value) },
  { label: 'Có chữ số', test: (value) => /\d/.test(value) },
];

/** Các yêu cầu mật khẩu (giống PasswordPolicy của backend), tích xanh khi đạt */
export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="-mt-2 mb-4 grid grid-cols-2 gap-x-3 gap-y-1">
      {RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-[11.5px] ${ok ? 'font-semibold text-primary' : 'text-[#8A99A6]'}`}
          >
            <Icon
              name={ok ? 'check_circle' : 'radio_button_unchecked'}
              filled={ok}
              className="text-[15px]"
            />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

/** Che bớt email: nam.nguyen@gmail.com → na••••••@gmail.com */
function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 2)}${'•'.repeat(Math.max(2, name.length - 2))}@${domain}`;
}

/**
 * Bước nhập mã OTP: hiện email đã gửi, đếm ngược hạn mã và thời gian được gửi lại,
 * tự xác nhận khi nhập đủ 6 số.
 */
export function OtpStep({
  email,
  sent,
  onVerify,
  onResend,
  onChangeEmail,
}: {
  email: string;
  sent: OtpSent;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<OtpSent>;
  onChangeEmail: () => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const expiry = useCountdown(sent.expiresInSeconds);
  const resend = useCountdown(sent.resendInSeconds);

  const verify = async (value = code) => {
    if (value.length !== DIGITS || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onVerify(value);
    } catch (failure) {
      setError(errorMessage(failure));
      setCode('');
      setBusy(false);
    }
  };

  const again = async () => {
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      const next = await onResend();
      expiry.restart(next.expiresInSeconds);
      resend.restart(next.resendInSeconds);
      setCode('');
      setInfo('Đã gửi mã mới, vui lòng kiểm tra hộp thư (cả mục Spam / Quảng cáo).');
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[#F1FAF8] p-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
          <Icon name="mark_email_read" className="text-[22px]" />
        </span>
        <div className="min-w-0 flex-1 text-[12.5px] leading-5 text-[#4F5F6B]">
          Mã 6 số đã được gửi tới
          <span className="block truncate font-bold text-[#13364A]">{maskEmail(email)}</span>
        </div>
        <button
          type="button"
          onClick={onChangeEmail}
          className="shrink-0 text-[12px] font-bold text-primary hover:underline"
        >
          Đổi email
        </button>
      </div>

      {error && <FormAlert message={error} />}
      {info && !error && (
        <p className="mb-3 rounded-xl bg-[#EEF7FF] px-3 py-2 text-[12px] text-[#285A7E]">{info}</p>
      )}

      <OtpInput
        value={code}
        onChange={(value) => {
          setCode(value);
          setError(null);
        }}
        onComplete={(value) => void verify(value)}
        disabled={busy}
        invalid={Boolean(error)}
      />

      <div className="mt-3 mb-5 flex items-center justify-between text-[12px]">
        <span className={expiry.left > 0 ? 'text-[#62737F]' : 'font-semibold text-client-danger'}>
          {expiry.left > 0 ? `Mã hết hạn sau ${formatClock(expiry.left)}` : 'Mã đã hết hạn'}
        </span>
        {resend.left > 0 ? (
          <span className="text-[#8A99A6]">Gửi lại sau {resend.left}s</span>
        ) : (
          <button
            type="button"
            onClick={() => void again()}
            disabled={resending}
            className="font-bold text-primary hover:underline disabled:opacity-60"
          >
            {resending ? 'Đang gửi…' : 'Gửi lại mã'}
          </button>
        )}
      </div>
      <p className="-mt-2 mb-5 flex items-start gap-1.5 text-[11.5px] leading-[17px] text-[#8A99A6]">
        <Icon name="info" className="mt-px text-[15px]" />
        Không thấy mã? Kiểm tra mục Spam / Quảng cáo — mã có thể đến sau 1–2 phút.
      </p>

      <PrimaryButton
        type="button"
        loading={busy}
        disabled={code.length !== DIGITS}
        onClick={() => void verify()}
      >
        Xác nhận
      </PrimaryButton>
    </div>
  );
}

/** Logo Google 4 màu (SVG chuẩn của Google) */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

/** Nút "Tiếp tục với Google" + vạch "hoặc" phía trên */
export function GoogleButton() {
  const [note, setNote] = useState(false);
  return (
    <div className="mt-5">
      <div className="mb-4 flex items-center gap-3 text-[11px] font-semibold text-[#9AA6B1]">
        <span className="h-px flex-1 bg-[#E8EDF2]" />
        hoặc
        <span className="h-px flex-1 bg-[#E8EDF2]" />
      </div>
      <button
        type="button"
        onClick={() => setNote(true)}
        className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-2xl border border-[#E3E8EE] bg-white text-[13.5px] font-semibold text-[#293A48] transition-colors hover:bg-[#F7F9FB]"
      >
        <GoogleLogo />
        Tiếp tục với Google
      </button>
      {note && (
        <p className="mt-2 text-center text-[11.5px] text-[#8A99A6]">
          Đăng nhập bằng Google đang được hoàn thiện — tạm thời bạn dùng email nhé.
        </p>
      )}
    </div>
  );
}
