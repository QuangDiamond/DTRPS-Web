import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '@/client/api/http';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import ClientAuthLayout, { SocialLogin } from '@/client/layouts/ClientAuthLayout';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { FormAlert, Notice } from '@/client/ui/Blocks';
import { routeNotice } from '@/client/ui/useNotice';
import { PrimaryButton, TextLink } from '@/client/ui/Buttons';
import Field from '@/client/ui/Field';
import { isValidEmail } from '@/client/utils/validation';

/** Trang được mở trước khi bị chuyển về đăng nhập (RequireClientAuth gửi kèm) */
function redirectTarget(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    const { from } = state as { from: unknown };
    if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('/admin')) return from;
  }
  return CLIENT_ROUTES.HOME;
}

export default function LoginPage() {
  const { login } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Thông báo do trang trước gửi kèm (vd. vừa đổi mật khẩu)
  const notice = routeNotice(location.state);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!isValidEmail(email)) next.email = 'Nhập địa chỉ email hợp lệ';
    if (!password) next.password = 'Vui lòng nhập mật khẩu';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      await login(email, password, remember);
      navigate(redirectTarget(location.state), { replace: true });
    } catch (error) {
      setFormError(errorMessage(error));
      setBusy(false);
    }
  };

  return (
    <ClientAuthLayout title="Đăng nhập">
      <div className="mb-6 rounded-2xl bg-[#E7FAF6] p-4">
        <p className="text-[11px] font-bold text-[#00756F]">AI Curated Journey</p>
        <p className="mt-1 text-[17px] font-extrabold text-[#1B3845]">Chào mừng trở lại! 👋</p>
        <p className="mt-1 text-[12px] text-[#647784]">
          Đăng nhập để tiếp tục hành trình khám phá Việt Nam cùng lịch trình thông minh của bạn.
        </p>
      </div>

      <form onSubmit={(event) => void submit(event)} noValidate>
        {notice && !formError && <Notice>{notice}</Notice>}
        {formError && <FormAlert message={formError} />}
        <Field
          label="Email"
          type="email"
          autoComplete="username"
          placeholder="Nhập email"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <Field
          label="Mật khẩu"
          type="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />
        <div className="mb-5 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-1 text-[12px] text-[#5C6D79] select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Ghi nhớ đăng nhập
          </label>
          <Link
            to={CLIENT_ROUTES.FORGOT_PASSWORD}
            className="text-[12px] font-bold text-[#007E78] hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <PrimaryButton type="submit" loading={busy}>
          Đăng nhập
        </PrimaryButton>
      </form>

      <SocialLogin />
      <TextLink to={CLIENT_ROUTES.REGISTER}>Chưa có tài khoản? Tạo tài khoản ngay ›</TextLink>
    </ClientAuthLayout>
  );
}
