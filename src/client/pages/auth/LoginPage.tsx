import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import SessionEndedBanner from '@/components/common/SessionEndedBanner';
import { errorMessage } from '@/client/api/http';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { onboarding } from '@/client/auth/onboarding';
import ClientAuthLayout from '@/client/layouts/ClientAuthLayout';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { AuthCard, GoogleButton } from '@/client/ui/AuthParts';
import { FormAlert, Notice } from '@/client/ui/Blocks';
import { PrimaryButton } from '@/client/ui/Buttons';
import Field from '@/client/ui/Field';
import { routeNotice } from '@/client/ui/useNotice';
import { isValidEmail } from '@/client/utils/validation';
import type { SessionEndReason } from '@/utils/sessionEnd';

/** Trang được mở trước khi bị chuyển về đăng nhập (RequireClientLogin gửi kèm) */
function redirectTarget(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    const { from } = state as { from: unknown };
    if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('/admin')) return from;
  }
  return CLIENT_ROUTES.HOME;
}

/** Email vừa đăng ký do trang Đăng ký gửi kèm (state.email) */
function emailOf(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('email' in state)) return '';
  const { email } = state as { email: unknown };
  return typeof email === 'string' ? email : '';
}

/** Lý do bị đưa về đăng nhập do guard gửi kèm (state.ended) */
function sessionEndOf(state: unknown): SessionEndReason | null {
  if (typeof state !== 'object' || state === null || !('ended' in state)) return null;
  const { ended } = state as { ended: unknown };
  return ended === 'idle' || ended === 'expired' ? ended : null;
}

export default function LoginPage() {
  const { login } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Vừa đăng ký xong → điền sẵn email, chỉ cần nhập mật khẩu
  const [email, setEmail] = useState(() => emailOf(location.state));
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Thông báo do trang trước gửi kèm (vd. vừa đặt lại mật khẩu)
  const notice = routeNotice(location.state);
  // Tab vừa bị đá về đây (không thao tác 30 phút / phiên hết hạn): lý do đi kèm lần chuyển trang,
  // nên vẫn còn khi F5 hay quay lại tab; khách tự bấm Đăng nhập thì không có.
  const ended = sessionEndOf(location.state);

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
      const user = await login(email, password, remember);
      if (onboarding.take(user.email)) {
        // Lần đầu đăng nhập sau khi đăng ký: trả lời vài câu hỏi rồi mới vào trang chủ
        navigate(CLIENT_ROUTES.PREFERENCES, {
          replace: true,
          state: { notice: 'Chào mừng bạn! Trả lời vài câu hỏi để SmartTravel gợi ý đúng gu bạn.' },
        });
      } else {
        navigate(redirectTarget(location.state), { replace: true });
      }
    } catch (error) {
      setFormError(errorMessage(error));
      setBusy(false);
    }
  };

  return (
    <ClientAuthLayout title="Đăng nhập">
      {ended && !formError && (
        <SessionEndedBanner
          reason={ended}
          title={ended === 'idle' ? 'Phiên đăng nhập đã tạm dừng' : 'Phiên đăng nhập đã hết hạn'}
          message={
            ended === 'idle'
              ? 'Bạn đã không thao tác trong 30 phút nên tab này đã được đăng xuất để bảo vệ tài khoản. Đăng nhập lại để tiếp tục — bạn sẽ quay về đúng trang đang xem.'
              : 'Phiên làm việc đã hết hạn hoặc tài khoản vừa đăng xuất ở nơi khác. Vui lòng đăng nhập lại để tiếp tục.'
          }
        />
      )}

      <AuthCard title="Đăng nhập">
        <form onSubmit={(event) => void submit(event)} noValidate>
          {notice && !ended && !formError && <Notice tone="success">{notice}</Notice>}
          {formError && <FormAlert message={formError} />}
          <Field
            label="Email"
            type="email"
            autoComplete="username"
            placeholder="ban@gmail.com"
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
            <label className="flex cursor-pointer items-center gap-1.5 text-[12.5px] text-[#5C6D79] select-none">
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
              className="text-[12.5px] font-bold text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <PrimaryButton type="submit" loading={busy}>
            Đăng nhập
          </PrimaryButton>
        </form>

        <GoogleButton redirectTo={redirectTarget(location.state)} />

        <p className="mt-6 text-center text-[13px] text-[#62737F]">
          Chưa có tài khoản?{' '}
          <Link to={CLIENT_ROUTES.REGISTER} className="font-bold text-primary hover:underline">
            Đăng ký
          </Link>
        </p>
      </AuthCard>

      <Link
        to={CLIENT_ROUTES.HOME}
        className="group mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-[#9FD8D1] bg-white px-5 py-2.5 text-[13px] font-bold text-primary shadow-sm transition-colors hover:border-primary hover:bg-[#E8F9F4]"
      >
        <Icon name="explore" className="text-[19px]" />
        Khám phá ngay, chưa cần đăng nhập
        <Icon
          name="arrow_forward"
          className="text-[17px] transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </ClientAuthLayout>
  );
}
