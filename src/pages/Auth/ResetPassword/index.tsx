import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthAlert from '../../../components/auth/AuthAlert';
import AuthHeading from '../../../components/auth/AuthHeading';
import AuthSubmitButton from '../../../components/auth/AuthSubmitButton';
import PasswordInput from '../../../components/auth/PasswordInput';
import Icon from '../../../components/common/Icon';
import { PASSWORD_RULES, RECOVERY_BRAND_CONTENT } from '../../../constants/auth';
import { ROUTES } from '../../../constants/routes';
import { useToast } from '../../../hooks/useToast';
import AuthLayout from '../../../layouts/AuthLayout';
import { resetPassword } from '../../../services/authService';
import { getErrorMessage } from '../../../utils/error';
import { getStateBoolean, getStateString } from '../../../utils/routeState';
import { AUTH_LINK_CLASS } from '../authMessages';

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
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!PASSWORD_RULES.every((rule) => rule.test(password))) {
      setError('Mật khẩu mới chưa đáp ứng đủ yêu cầu bảo mật');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetPassword(email, password);
      showToast('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      navigate(ROUTES.LOGIN, { replace: true, state: { email } });
    } catch (resetError) {
      setError(getErrorMessage(resetError));
      setLoading(false);
    }
  };

  return (
    <AuthLayout brand={RECOVERY_BRAND_CONTENT}>
      <AuthHeading
        title="Thiết lập mật khẩu mới"
        description="Danh tính đã được xác minh. Tạo mật khẩu mới cho tài khoản quản trị:"
        email={email}
      />

      <form className="space-y-space-md" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <PasswordInput
          id="newPassword"
          label="Mật khẩu mới"
          autoComplete="new-password"
          autoFocus
          placeholder="••••••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordInput
          id="confirmPassword"
          label="Xác nhận mật khẩu mới"
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
          <AuthSubmitButton loading={loading} loadingText="Đang cập nhật mật khẩu..." icon="check">
            Cập nhật mật khẩu
          </AuthSubmitButton>
        </div>
      </form>

      <div className="flex justify-center">
        <Link to={ROUTES.LOGIN} className={AUTH_LINK_CLASS}>
          <Icon name="arrow_back" className="text-[16px]" />
          <span>Quay lại Đăng nhập</span>
        </Link>
      </div>
    </AuthLayout>
  );
}
