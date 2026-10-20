import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthAlert from '../../../components/auth/AuthAlert';
import AuthHeading from '../../../components/auth/AuthHeading';
import AuthInput from '../../../components/auth/AuthInput';
import AuthNotice from '../../../components/auth/AuthNotice';
import AuthSubmitButton from '../../../components/auth/AuthSubmitButton';
import PasswordInput from '../../../components/auth/PasswordInput';
import { LOGIN_BRAND_CONTENT } from '../../../constants/auth';
import { MOCK_ADMIN_ACCOUNTS } from '../../../constants/mockData';
import { ROUTES } from '../../../constants/routes';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import AuthLayout from '../../../layouts/AuthLayout';
import { getErrorMessage } from '../../../utils/error';
import { getStateString } from '../../../utils/routeState';

const DEMO_ACCOUNT = MOCK_ADMIN_ACCOUNTS[0];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState(
    getStateString(location.state, 'email') ?? DEMO_ACCOUNT.profile.email,
  );
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const admin = await login(email, password, remember);
      showToast(`Xác thực thành công. Chào mừng ${admin.name}!`);
      navigate(getStateString(location.state, 'from') ?? ROUTES.DASHBOARD, { replace: true });
    } catch (loginError) {
      setError(getErrorMessage(loginError));
      setLoading(false);
    }
  };

  return (
    <AuthLayout brand={LOGIN_BRAND_CONTENT}>
      <AuthHeading
        title="Cổng thông tin Quản trị viên"
        description="Vui lòng đăng nhập với tài khoản quản trị được cấp để tiếp tục vận hành hệ thống."
      />

      <form className="space-y-space-md" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <AuthInput
          id="adminEmail"
          label="Email quản trị"
          icon="mail"
          type="email"
          autoComplete="username"
          placeholder="admin@smarttravel.vn"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordInput
          id="adminPassword"
          label="Mật khẩu"
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
              Ghi nhớ đăng nhập
            </span>
          </label>
          <button
            type="button"
            onClick={() => navigate(ROUTES.FORGOT_PASSWORD, { state: { email } })}
            className="font-label-md text-label-md font-semibold text-primary hover:underline focus:outline-none"
          >
            Quên mật khẩu?
          </button>
        </div>

        <div className="pt-2">
          <AuthSubmitButton loading={loading} loadingText="Đang xác thực thông tin...">
            Đăng nhập Cổng Quản trị
          </AuthSubmitButton>
        </div>
      </form>

      <AuthNotice icon="verified_user" title="Bảo mật cấp Doanh nghiệp & 2FA">
        Đăng nhập an toàn với chuẩn xác thực 2FA. KHÔNG hỗ trợ đăng nhập qua mạng xã hội nhằm bảo
        toàn dữ liệu quốc gia.
      </AuthNotice>

      {import.meta.env.DEV && (
        <p className="text-center font-body-sm text-body-sm text-outline">
          Tài khoản demo: {DEMO_ACCOUNT.profile.email} / {DEMO_ACCOUNT.password}
        </p>
      )}
    </AuthLayout>
  );
}
