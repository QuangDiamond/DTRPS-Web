import { Trans, useTranslation } from 'react-i18next';
import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthHeading from '@/components/auth/AuthHeading';
import AuthInput from '@/components/auth/AuthInput';
import AuthNotice from '@/components/auth/AuthNotice';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import { Icon } from '@/components/common';
import { RECOVERY_BRAND_CONTENT } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks';
import AuthLayout from '@/layouts/AuthLayout';
import { AUTH_LINK_CLASS, otpSentMessage } from '@/pages/Auth/authMessages';
import { sendPasswordResetOtp } from '@/services/authService';
import { getErrorMessage } from '@/utils/error';
import { getStateString } from '@/utils/routeState';
import { isValidEmail } from '@/utils/validation';

/**
 * Bước 1/3 — Nhập email nhận OTP.
 * TODO: thay bằng UI từ Stitch khi có HTML (hiện dựng theo phong cách màn Đăng nhập).
 */
export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [email, setEmail] = useState(getStateString(location.state, 'email') ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError(t('auth.forgotPassword.pleaseEnterValidEmail'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetOtp(normalizedEmail);
      showToast(otpSentMessage(normalizedEmail));
      navigate(ROUTES.VERIFY_OTP, { state: { email: normalizedEmail } });
    } catch (sendError) {
      setError(getErrorMessage(sendError));
      setLoading(false);
    }
  };

  return (
    <AuthLayout brand={RECOVERY_BRAND_CONTENT}>
      <AuthHeading
        title={t('auth.forgotPassword.recoverAdminPassword')}
        description={t('auth.forgotPassword.enterAdminEmailYou')}
      />

      <form className="space-y-space-md" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <AuthInput
          id="recoveryEmail"
          label={t('auth.forgotPassword.adminEmail')}
          icon="mail"
          type="email"
          autoComplete="username"
          autoFocus
          placeholder="admin@smarttravel.vn"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        {error && <AuthAlert message={error} />}

        <div className="pt-2">
          <AuthSubmitButton
            loading={loading}
            loadingText={t('auth.forgotPassword.sendingVerificationCode')}
            icon="send"
          >
            {t('auth.forgotPassword.sendOtpCode')}
          </AuthSubmitButton>
        </div>
      </form>

      <AuthNotice icon="info">
        <Trans
          i18nKey="auth.forgotPassword.theOtpCodeValid"
          components={{
            c0: <strong className="text-on-surface" />,
            c1: <strong className="text-on-surface" />,
          }}
        />
      </AuthNotice>

      <div className="flex justify-center">
        <Link to={ROUTES.LOGIN} className={AUTH_LINK_CLASS}>
          <Icon name="arrow_back" className="text-[16px]" />
          <span>{t('auth.forgotPassword.backSign')}</span>
        </Link>
      </div>
    </AuthLayout>
  );
}
