import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { authApi, type OtpSent } from '@/client/api/authApi';
import { ClientApiError, errorMessage } from '@/client/api/http';
import { onboarding } from '@/client/auth/onboarding';
import ClientAuthLayout from '@/client/layouts/ClientAuthLayout';
import { CLIENT_ROUTES } from '@/client/routePaths';
import {
  AuthCard,
  GoogleButton,
  OtpStep,
  PasswordChecklist,
  StepIndicator,
} from '@/client/ui/AuthParts';
import { FormAlert } from '@/client/ui/Blocks';
import { PrimaryButton } from '@/client/ui/Buttons';
import Field from '@/client/ui/Field';
import { useCountdown } from '@/client/utils/useCountdown';
import { isValidEmail, isValidPassword, PASSWORD_HINT } from '@/client/utils/validation';

const STEPS = ['Thông tin', 'Xác thực email', 'Mật khẩu'];

const TITLES = [
  { title: 'Tạo tài khoản', subtitle: 'Nhập họ tên và email — chúng tôi sẽ gửi mã xác thực 6 số.' },
  { title: 'Xác thực email', subtitle: 'Nhập mã 6 số trong email vừa nhận để xác nhận địa chỉ.' },
  { title: 'Đặt mật khẩu', subtitle: 'Bước cuối: tạo mật khẩu để đăng nhập lần sau.' },
];

/** Đăng ký 3 bước: họ tên + email → mã OTP qua email → mật khẩu → về trang đăng nhập */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState<OtpSent | null>(null);
  const [ticket, setTicket] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [emailTaken, setEmailTaken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

  const fail = (error: unknown) => {
    if (error instanceof ClientApiError && Object.keys(error.fieldErrors).length > 0) {
      setErrors(error.fieldErrors);
    }
    setFormError(errorMessage(error));
    setBusy(false);
  };

  const sendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Họ tên phải có ít nhất 2 ký tự';
    if (!isValidEmail(email)) next.email = 'Email không hợp lệ';
    setErrors(next);
    setFormError(null);
    setEmailTaken(false);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      setSent(await authApi.sendRegisterCode(name, email));
      setStep(1);
      setBusy(false);
    } catch (error) {
      setEmailTaken(error instanceof ClientApiError && error.status === 409);
      fail(error);
    }
  };

  const finish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!isValidPassword(password)) next.password = PASSWORD_HINT;
    if (confirm !== password) next.confirm = 'Mật khẩu nhập lại chưa khớp';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      const created = await authApi.completeRegistration(ticket, name, password);
      // Không tự đăng nhập: bỏ phiên BE vừa cấp, người dùng đăng nhập lại bằng email + mật khẩu
      authApi.revoke(created.refreshToken).catch(() => undefined);
      // Lần đăng nhập đầu tiên → trả lời câu hỏi sở thích rồi mới vào trang chủ
      onboarding.mark(created.user.email);
      // Hiện màn thành công vài giây rồi mới sang trang đăng nhập
      setCreatedEmail(created.user.email);
      setBusy(false);
    } catch (error) {
      fail(error);
    }
  };

  if (createdEmail) {
    return (
      <ClientAuthLayout title="Đăng ký thành công">
        <RegisterSuccess
          email={createdEmail}
          onContinue={() =>
            navigate(CLIENT_ROUTES.LOGIN, {
              replace: true,
              state: {
                email: createdEmail,
                notice: 'Đăng ký tài khoản thành công! Hãy đăng nhập bằng mật khẩu vừa tạo.',
              },
            })
          }
        />
      </ClientAuthLayout>
    );
  }

  // Báo ngay khi gõ ô nhập lại (chưa gõ thì chưa báo)
  const mismatch = confirm.length > 0 && confirm !== password;
  const matched = confirm.length > 0 && confirm === password;
  const canFinish = isValidPassword(password) && matched;

  return (
    <ClientAuthLayout title="Đăng ký">
      <AuthCard title={TITLES[step].title} subtitle={TITLES[step].subtitle}>
        <StepIndicator steps={STEPS} current={step} />

        {step === 0 && (
          <form onSubmit={(event) => void sendCode(event)} noValidate>
            {formError && <FormAlert message={formError} />}
            {emailTaken && (
              <p className="-mt-1 mb-4 text-[12.5px] text-[#4F5F6B]">
                <Link to={CLIENT_ROUTES.LOGIN} className="font-bold text-primary hover:underline">
                  Đăng nhập
                </Link>{' '}
                hoặc{' '}
                <Link
                  to={CLIENT_ROUTES.FORGOT_PASSWORD}
                  className="font-bold text-primary hover:underline"
                >
                  lấy lại mật khẩu
                </Link>
              </p>
            )}
            <Field
              label="Họ và tên"
              autoComplete="name"
              placeholder="Nguyễn Hoàng Nam"
              value={name}
              onChange={setName}
              error={errors.name}
            />
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="ban@gmail.com"
              value={email}
              onChange={setEmail}
              error={errors.email}
              hint="Mã xác thực sẽ được gửi tới email này"
            />
            <PrimaryButton type="submit" loading={busy}>
              Gửi mã xác thực
            </PrimaryButton>
          </form>
        )}

        {step === 1 && sent && (
          <OtpStep
            email={email}
            sent={sent}
            onVerify={async (code) => {
              const result = await authApi.verifyRegisterCode(email, code);
              setTicket(result.ticket);
              setErrors({});
              setFormError(null);
              setStep(2);
            }}
            onResend={() => authApi.sendRegisterCode(name, email)}
            onChangeEmail={() => {
              setStep(0);
              setSent(null);
            }}
          />
        )}

        {step === 2 && (
          <form onSubmit={(event) => void finish(event)} noValidate>
            {formError && <FormAlert message={formError} />}
            <Field
              label="Mật khẩu"
              type="password"
              autoComplete="new-password"
              placeholder="Tạo mật khẩu"
              value={password}
              onChange={setPassword}
              error={errors.password}
            />
            <PasswordChecklist password={password} />
            <Field
              label="Nhập lại mật khẩu"
              type="password"
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              value={confirm}
              onChange={setConfirm}
              error={mismatch ? 'Mật khẩu nhập lại chưa khớp' : errors.confirm}
            />
            {matched && (
              <p className="-mt-3 mb-4 flex items-center gap-1 text-[12px] font-semibold text-[#13936B]">
                <Icon name="check_circle" className="text-[16px]" />
                Mật khẩu khớp
              </p>
            )}
            <PrimaryButton type="submit" loading={busy} disabled={!canFinish}>
              Tạo tài khoản
            </PrimaryButton>
          </form>
        )}

        {step === 0 && <GoogleButton />}

        <p className="mt-6 text-center text-[13px] text-[#62737F]">
          Đã có tài khoản?{' '}
          <Link to={CLIENT_ROUTES.LOGIN} className="font-bold text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </AuthCard>
    </ClientAuthLayout>
  );
}

const REDIRECT_SECONDS = 3;

/** Tạo tài khoản xong: báo thành công, tự sang trang đăng nhập sau vài giây */
function RegisterSuccess({ email, onContinue }: { email: string; onContinue: () => void }) {
  const { left } = useCountdown(REDIRECT_SECONDS);
  useEffect(() => {
    if (left === 0) onContinue();
  }, [left, onContinue]);

  return (
    <AuthCard title="Đăng ký thành công" subtitle="Tài khoản SmartTravel của bạn đã sẵn sàng.">
      <div className="flex flex-col items-center py-2 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DDF7EA] text-[#13936B]">
          <Icon name="check_circle" filled className="text-[52px]" />
        </span>
        <p className="mt-4 text-[16px] font-extrabold text-[#13364A]">
          Đăng ký tài khoản thành công!
        </p>
        <p className="mt-1.5 text-[13px] leading-5 text-[#62737F]">
          Hãy đăng nhập bằng email
          <span className="block font-bold break-all text-[#13364A]">{email}</span>
          và mật khẩu bạn vừa tạo.
        </p>
      </div>
      <PrimaryButton type="button" className="mt-6" onClick={onContinue}>
        Đăng nhập ngay
      </PrimaryButton>
      <p className="mt-3 text-center text-[12px] text-[#8A99A6]">
        Tự chuyển tới trang đăng nhập sau {left}s
      </p>
    </AuthCard>
  );
}
