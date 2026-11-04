import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { type FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthAlert from '@/components/auth/AuthAlert';
import AuthHeading from '@/components/auth/AuthHeading';
import AuthInput from '@/components/auth/AuthInput';
import AuthNotice from '@/components/auth/AuthNotice';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordInput from '@/components/auth/PasswordInput';
import { LOGIN_BRAND_CONTENT } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { useAuth, useToast } from '@/hooks';
import AuthLayout from '@/layouts/AuthLayout';
import { getErrorMessage } from '@/utils/error';
import { getStateString } from '@/utils/routeState';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState(getStateString(location.state, 'email') ?? '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError(t('auth.login.pleaseEnterBothYour'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const admin = await login(email, password, remember);
      showToast(i18n.t('session.welcome', { name: admin.name }));
      navigate(getStateString(location.state, 'from') ?? ROUTES.DASHBOARD, { replace: true });
    } catch (loginError) {
      setError(getErrorMessage(loginError));
      setLoading(false);
    }
  };

  return (
    <AuthLayout brand={LOGIN_BRAND_CONTENT}>
      <AuthHeading
        title={t('auth.login.administratorPortal')}
        description={t('auth.login.signWithYourIssued')}
      />

      <form className="space-y-space-md" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <AuthInput
          id="adminEmail"
          label={t('auth.login.adminEmail')}
          icon="mail"
          type="email"
          autoComplete="username"
          placeholder="admin@smarttravel.vn"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordInput
          id="adminPassword"
          label={t('auth.login.password')}
          autoComplete="current-password"
          placeholder="••••••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <AuthAlert message={error} />}

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2.5 select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 cursor-pointer rounded accent-primary"
            />
            <span className="font-body-sm text-body-sm font-medium text-on-surface-variant">
              {t('auth.login.rememberMe')}
            </span>
          </label>
          <button
            type="button"
            onClick={() => navigate(ROUTES.FORGOT_PASSWORD, { state: { email } })}
            className="font-label-md text-label-md font-semibold text-primary hover:underline focus:outline-none"
          >
            {t('auth.login.forgotPassword')}
          </button>
        </div>

        <div className="pt-2">
          <AuthSubmitButton loading={loading} loadingText={t('auth.login.verifyingCredentials')}>
            {t('auth.login.signAdminPortal')}
          </AuthSubmitButton>
        </div>
      </form>

      <AuthNotice icon="verified_user" title={t('auth.login.enterpriseGradeSecurity2fa')}>
        {t('auth.login.secureSignWith2fa')}
      </AuthNotice>

    </AuthLayout>
  );
}
