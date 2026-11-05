import { Trans, useTranslation } from 'react-i18next';
import { type FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthHeading from '@/components/auth/AuthHeading';
import AuthNotice from '@/components/auth/AuthNotice';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import OtpInput from '@/components/auth/OtpInput';
import { Icon } from '@/components/common';
import {
  MAX_OTP_ATTEMPTS,
  OTP_LENGTH,
  OTP_TTL_SECONDS,
  RECOVERY_BRAND_CONTENT,
} from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks';
import AuthLayout from '@/layouts/AuthLayout';
import { AUTH_LINK_CLASS, otpSentMessage } from '@/pages/Auth/authMessages';
import { sendPasswordResetOtp, verifyPasswordResetOtp } from '@/services/authService';
import { getErrorMessage } from '@/utils/error';
import { formatCountdown } from '@/utils/format';
import { getStateString } from '@/utils/routeState';

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
  const { t } = useTranslation();
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
      setError(t('auth.verifyOtp.theOtpCodeHas'));
      return;
    }
    if (code.length < OTP_LENGTH) {
      setError(t('auth.verifyOtp.pleaseEnterAllDigits', { OTP_LENGTH }));
      return;
    }

    setVerifying(true);
    setError(null);
    let ticket: string | null;
    try {
      ticket = await verifyPasswordResetOtp(email, code);
    } catch (verifyError) {
      setVerifying(false);
      setError(getErrorMessage(verifyError));
      return;
    }
    setVerifying(false);

    if (ticket) {
      showToast(t('auth.verifyOtp.otpVerifiedSuccessfully'));
      navigate(ROUTES.RESET_PASSWORD, { replace: true, state: { email, ticket } });
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setDigits(emptyDigits());
    setError(
      nextAttempts >= MAX_OTP_ATTEMPTS
        ? t('auth.verifyOtp.youHaveEnteredWrong', { MAX_OTP_ATTEMPTS })
        : t('auth.verifyOtp.incorrectCodeYouHave', { count: MAX_OTP_ATTEMPTS - nextAttempts }),
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
        title={t('auth.verifyOtp.verifyOtpSecurityCode')}
        description={t('auth.verifyOtp.a6DigitVerification')}
        email={email}
      />

      <form className="flex flex-col gap-space-md" onSubmit={(event) => void handleSubmit(event)}>
        <div>
          <label className="mb-space-xs block font-label-md text-label-md font-semibold tracking-wider text-on-surface-variant uppercase">
            {t('auth.verifyOtp.enter6DigitCode')}
          </label>
          <OtpInput digits={digits} onChange={setDigits} disabled={isLocked || verifying} />

          {/* Đếm ngược + gửi lại */}
          <div className="mt-space-sm flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant">
              <Icon name="timer" className="text-[16px] text-tertiary" />
              {isExpired ? (
                <span className="font-semibold text-error">{t('auth.verifyOtp.codeExpired')}</span>
              ) : (
                <>
                  <span>{t('auth.verifyOtp.codeValid')}</span>
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
              <span>
                {resending ? t('auth.verifyOtp.sending') : t('auth.verifyOtp.resendOtpCode')}
              </span>
            </button>
          </div>
        </div>

        {error && <AuthAlert message={error} />}

        <AuthNotice icon="info">
          <Trans
            i18nKey="auth.verifyOtp.ifYouDoNot"
            components={{ c0: <strong className="text-on-surface" /> }}
          />
        </AuthNotice>

        <AuthSubmitButton
          loading={verifying}
          loadingText={t('auth.verifyOtp.verifyingCode')}
          disabled={isLocked}
        >
          {t('auth.verifyOtp.confirmSecurityCode')}
        </AuthSubmitButton>
      </form>

      <div className="flex items-center justify-center gap-space-md">
        <Link to={ROUTES.FORGOT_PASSWORD} state={{ email }} className={AUTH_LINK_CLASS}>
          <Icon name="alternate_email" className="text-[16px]" />
          <span>{t('auth.verifyOtp.changeVerificationEmail')}</span>
        </Link>
        <span className="h-1 w-1 rounded-full bg-outline-variant" />
        <Link to={ROUTES.LOGIN} className={AUTH_LINK_CLASS}>
          <Icon name="arrow_back" className="text-[16px]" />
          <span>{t('auth.verifyOtp.backSign')}</span>
        </Link>
      </div>
    </AuthLayout>
  );
}
