import { useTranslation } from 'react-i18next';
import { type FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthHeading from '@/components/auth/AuthHeading';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordInput from '@/components/auth/PasswordInput';
import { Icon } from '@/components/common';
import { PASSWORD_RULES, RECOVERY_BRAND_CONTENT } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/hooks';
import AuthLayout from '@/layouts/AuthLayout';
import { AUTH_LINK_CLASS } from '@/pages/Auth/authMessages';
import { resetPassword } from '@/services/authService';
import { getErrorMessage } from '@/utils/error';
import { getStateBoolean, getStateString } from '@/utils/routeState';

/**
 * Bước 3/3 — Đặt mật khẩu mới.
 * TODO: thay bằng UI từ Stitch khi có HTML (hiện dựng theo phong cách màn Đăng nhập).
 */
export default function ResetPasswordPage() {
  const location = useLocation();
  const email = getStateString(location.state, 'email');
  const otpVerified = getStateBoolean(location.state, 'otpVerified');

  // Chưa xác thực OTP thì không được vào bước này
  if (!email || !otpVerified) return <Navigate to={ROUTES.FORGOT_PASSWORD} replace />;
  return <ResetPasswordForm email={email} />;
}

function ResetPasswordForm({ email }: { email: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!PASSWORD_RULES.every((rule) => rule.test(password))) {
      setError(t('auth.resetPassword.theNewPasswordDoes'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.theConfirmationPasswordDoes'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetPassword(email, password);
      showToast(t('auth.resetPassword.passwordChangedSuccessfullyPlease'));
      navigate(ROUTES.LOGIN, { replace: true, state: { email } });
    } catch (resetError) {
      setError(getErrorMessage(resetError));
      setLoading(false);
    }
  };

  return (
    <AuthLayout brand={RECOVERY_BRAND_CONTENT}>
      <AuthHeading
        title={t('auth.resetPassword.setNewPassword')}
        description={t('auth.resetPassword.identityVerifiedCreateNew')}
        email={email}
      />

      <form className="space-y-space-md" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <PasswordInput
          id="newPassword"
          label={t('auth.resetPassword.newPassword')}
          autoComplete="new-password"
          autoFocus
          placeholder="••••••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordInput
          id="confirmPassword"
          label={t('auth.resetPassword.confirmNewPassword')}
          icon="lock_reset"
          autoComplete="new-password"
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        {/* Yêu cầu mật khẩu (cập nhật theo thời gian thực) */}
        <ul className="grid grid-cols-1 gap-1.5 rounded-xl bg-surface-container-low p-space-md sm:grid-cols-2">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(password);
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-1.5 font-body-sm text-body-sm ${
                  passed ? 'font-medium text-primary' : 'text-on-surface-variant'
                }`}
              >
                <Icon
                  name={passed ? 'check_circle' : 'radio_button_unchecked'}
                  filled={passed}
                  className="text-[16px]"
                />
                {rule.label}
              </li>
            );
          })}
        </ul>

        {error && <AuthAlert message={error} />}

        <div className="pt-2">
          <AuthSubmitButton
            loading={loading}
            loadingText={t('auth.resetPassword.updatingPassword')}
            icon="check"
          >
            {t('auth.resetPassword.updatePassword')}
          </AuthSubmitButton>
        </div>
      </form>

      <div className="flex justify-center">
        <Link to={ROUTES.LOGIN} className={AUTH_LINK_CLASS}>
          <Icon name="arrow_back" className="text-[16px]" />
          <span>{t('auth.resetPassword.backSign')}</span>
        </Link>
      </div>
    </AuthLayout>
  );
}
