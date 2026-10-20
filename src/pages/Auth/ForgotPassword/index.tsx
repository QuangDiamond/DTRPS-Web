import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthAlert from '../../../components/auth/AuthAlert';
import AuthHeading from '../../../components/auth/AuthHeading';
import AuthInput from '../../../components/auth/AuthInput';
import AuthNotice from '../../../components/auth/AuthNotice';
import AuthSubmitButton from '../../../components/auth/AuthSubmitButton';
import Icon from '../../../components/common/Icon';
import { RECOVERY_BRAND_CONTENT } from '../../../constants/auth';
import { ROUTES } from '../../../constants/routes';
import { useToast } from '../../../hooks/useToast';
import AuthLayout from '../../../layouts/AuthLayout';
import { sendPasswordResetOtp } from '../../../services/authService';
import { getErrorMessage } from '../../../utils/error';
import { getStateString } from '../../../utils/routeState';
import { isValidEmail } from '../../../utils/validation';
import { AUTH_LINK_CLASS, otpSentMessage } from '../authMessages';

/**
 * Bước 1/3 — Nhập email nhận OTP.
 * TODO: thay bằng UI từ Stitch khi có HTML (hiện dựng theo phong cách màn Đăng nhập).
 */
export default function ForgotPasswordPage() {
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
      setError('Vui lòng nhập email hợp lệ');
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
        title="Khôi phục mật khẩu quản trị"
        description="Nhập email quản trị đã được cấp. Hệ thống sẽ gửi mã xác thực OTP gồm 6 chữ số để xác minh danh tính của bạn."
      />

      <form className="space-y-space-md" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <AuthInput
          id="recoveryEmail"
          label="Email quản trị"
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
          <AuthSubmitButton loading={loading} loadingText="Đang gửi mã xác thực..." icon="send">
            Gửi mã xác thực OTP
          </AuthSubmitButton>
        </div>
      </form>

      <AuthNotice icon="info">
        Mã OTP có hiệu lực trong <strong className="text-on-surface">5 phút</strong>. Nếu không nhận
        được email, vui lòng kiểm tra hòm thư rác (Spam) hoặc liên hệ{' '}
        <strong className="text-on-surface">Đội ngũ An ninh Mạng</strong>.
      </AuthNotice>

      <div className="flex justify-center">
        <Link to={ROUTES.LOGIN} className={AUTH_LINK_CLASS}>
          <Icon name="arrow_back" className="text-[16px]" />
          <span>Quay lại Đăng nhập</span>
        </Link>
      </div>
    </AuthLayout>
  );
}
