import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthAlert from '../../../components/auth/AuthAlert';
import AuthHeading from '../../../components/auth/AuthHeading';
import AuthNotice from '../../../components/auth/AuthNotice';
import AuthSubmitButton from '../../../components/auth/AuthSubmitButton';
import OtpInput from '../../../components/auth/OtpInput';
import Icon from '../../../components/common/Icon';
import {
  MAX_OTP_ATTEMPTS,
  OTP_LENGTH,
  OTP_TTL_SECONDS,
  RECOVERY_BRAND_CONTENT,
} from '../../../constants/auth';
import { ROUTES } from '../../../constants/routes';
import { useToast } from '../../../hooks/useToast';
import AuthLayout from '../../../layouts/AuthLayout';
import { sendPasswordResetOtp, verifyPasswordResetOtp } from '../../../services/authService';
import { getErrorMessage } from '../../../utils/error';
import { formatCountdown } from '../../../utils/format';
import { getStateString } from '../../../utils/routeState';
import { AUTH_LINK_CLASS, otpSentMessage } from '../authMessages';

const emptyDigits = (): string[] => Array<string>(OTP_LENGTH).fill('');

/** Bước 2/3 — Nhập mã OTP 6 số */
export default function VerifyOtpPage() {
  const location = useLocation();
  const email = getStateString(location.state, 'email');

  // Vào thẳng URL mà chưa qua bước 1 -> quay lại bước 1
  if (!email) return <Navigate to={ROUTES.FORGOT_PASSWORD} replace />;
  return <VerifyOtpForm email={email} />;
}

function VerifyOtpForm({ email }: { email: string }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [digits, setDigits] = useState<string[]>(emptyDigits);
  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL_SECONDS);
  const [attempts, setAttempts] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLocked = attempts >= MAX_OTP_ATTEMPTS;
  const isExpired = secondsLeft <= 0;
  const code = digits.join('');

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isExpired) {
      setError('Mã OTP đã hết hạn. Vui lòng bấm "Gửi lại mã OTP" để nhận mã mới.');
      return;
    }
    if (code.length < OTP_LENGTH) {
      setError(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số`);
      return;
    }

    setVerifying(true);
    setError(null);
    const isValid = await verifyPasswordResetOtp(email, code);
    setVerifying(false);

    if (isValid) {
      showToast('Xác thực mã OTP thành công');
      navigate(ROUTES.RESET_PASSWORD, { replace: true, state: { email, otpVerified: true } });
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setDigits(emptyDigits());
    setError(
      nextAttempts >= MAX_OTP_ATTEMPTS
        ? `Bạn đã nhập sai quá ${MAX_OTP_ATTEMPTS} lần. Chức năng xác thực tạm khóa, vui lòng liên hệ Đội ngũ An ninh Mạng.`
        : `Mã xác thực không chính xác. Bạn còn ${MAX_OTP_ATTEMPTS - nextAttempts} lần thử.`,
    );
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await sendPasswordResetOtp(email);
      setDigits(emptyDigits());
      setSecondsLeft(OTP_TTL_SECONDS);
      setError(null);
      showToast(otpSentMessage(email));
    } catch (resendError) {
      setError(getErrorMessage(resendError));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout brand={RECOVERY_BRAND_CONTENT}>
      <AuthHeading
        title="Xác thực mã bảo mật OTP"
        description="Mã xác thực gồm 6 chữ số đã được gửi tới email:"
        email={email}
      />

      <form className="flex flex-col gap-space-md" onSubmit={(event) => void handleSubmit(event)}>
        <div>
          <label className="mb-space-xs block font-label-md text-label-md font-semibold tracking-wider text-on-surface-variant uppercase">
            Nhập mã xác thực 6 chữ số
          </label>
          <OtpInput digits={digits} onChange={setDigits} disabled={isLocked || verifying} />

          {/* Đếm ngược + gửi lại */}
          <div className="mt-space-sm flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
              <Icon name="timer" className="text-[16px] text-tertiary" />
              {isExpired ? (
                <span className="font-semibold text-error">Mã đã hết hạn</span>
              ) : (
                <>
                  <span>Mã có hiệu lực trong:</span>
                  <span className="font-title-md text-title-md font-bold text-tertiary">
                    {formatCountdown(secondsLeft)}
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resending || isLocked}
              className="inline-flex cursor-pointer items-center gap-1 font-label-md text-label-md font-semibold text-primary transition-colors hover:text-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="replay" className={`text-[16px] ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Đang gửi...' : 'Gửi lại mã OTP'}</span>
            </button>
          </div>
        </div>

        {error && <AuthAlert message={error} />}

        <AuthNotice icon="info">
          Nếu không nhận được email, vui lòng kiểm tra hòm thư rác (Spam) hoặc liên hệ{' '}
          <strong className="text-on-surface">Đội ngũ An ninh Mạng</strong> để được giải tỏa khóa
          khẩn cấp.
        </AuthNotice>

        <AuthSubmitButton loading={verifying} loadingText="Đang xác thực mã..." disabled={isLocked}>
          Xác nhận mã bảo mật
        </AuthSubmitButton>
      </form>

      <div className="flex items-center justify-center gap-space-md">
        <Link to={ROUTES.FORGOT_PASSWORD} state={{ email }} className={AUTH_LINK_CLASS}>
          <Icon name="alternate_email" className="text-[16px]" />
          <span>Thay đổi email xác thực</span>
        </Link>
        <span className="h-1 w-1 rounded-full bg-outline-variant" />
        <Link to={ROUTES.LOGIN} className={AUTH_LINK_CLASS}>
          <Icon name="arrow_back" className="text-[16px]" />
          <span>Quay lại Đăng nhập</span>
        </Link>
      </div>
    </AuthLayout>
  );
}
