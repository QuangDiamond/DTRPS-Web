import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { authApi, type OtpSent } from '@/client/api/authApi';
import { ClientApiError, errorMessage } from '@/client/api/http';
import ClientAuthLayout from '@/client/layouts/ClientAuthLayout';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { AuthCard, OtpStep, PasswordChecklist, StepIndicator } from '@/client/ui/AuthParts';
import { FormAlert } from '@/client/ui/Blocks';
import { PrimaryButton } from '@/client/ui/Buttons';
import Field from '@/client/ui/Field';
import { isValidEmail, isValidPassword, PASSWORD_HINT } from '@/client/utils/validation';

const STEPS = ['Email', 'Xác thực', 'Mật khẩu mới'];

const TITLES = [
  {
    title: 'Quên mật khẩu',
    subtitle: 'Nhập email đã đăng ký — chúng tôi sẽ gửi mã 6 số để đặt lại mật khẩu.',
  },
  { title: 'Xác thực email', subtitle: 'Nhập mã 6 số trong email vừa nhận.' },
  {
    title: 'Mật khẩu mới',
    subtitle: 'Tạo mật khẩu mới. Các thiết bị đang đăng nhập sẽ được đăng xuất để an toàn.',
  },
];

/** Quên mật khẩu 3 bước: email → mã OTP qua email → mật khẩu mới */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState<OtpSent | null>(null);
  const [ticket, setTicket] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fail = (error: unknown) => {
    if (error instanceof ClientApiError && Object.keys(error.fieldErrors).length > 0) {
      setErrors(error.fieldErrors);
    }
    setFormError(errorMessage(error));
    setBusy(false);
  };

  const sendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    if (!isValidEmail(email)) {
      setErrors({ email: 'Vui lòng nhập email hợp lệ' });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      setSent(await authApi.sendResetCode(email));
      setStep(1);
      setBusy(false);
    } catch (error) {
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
      await authApi.resetPassword(ticket, password);
      navigate(CLIENT_ROUTES.LOGIN, {
        replace: true,
        state: { notice: 'Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.' },
      });
    } catch (error) {
      fail(error);
    }
  };

  return (
    <ClientAuthLayout title="Quên mật khẩu">
      <AuthCard title={TITLES[step].title} subtitle={TITLES[step].subtitle}>
        <StepIndicator steps={STEPS} current={step} />

        {step === 0 && (
          <form onSubmit={(event) => void sendCode(event)} noValidate>
            {formError && <FormAlert message={formError} />}
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="ban@gmail.com"
              value={email}
              onChange={setEmail}
              error={errors.email}
            />
            <PrimaryButton type="submit" loading={busy}>
              Gửi mã xác thực
            </PrimaryButton>
          </form>
        )}

        {step === 1 && sent && (
          <>
            <p className="-mt-2 mb-4 text-[12px] leading-5 text-[#8A99A6]">
              Nếu email này đã đăng ký, mã sẽ đến trong ít phút. Không thấy? Hãy xem mục Spam /
              Quảng cáo.
            </p>
            <OtpStep
              email={email}
              sent={sent}
              onVerify={async (code) => {
                const result = await authApi.verifyResetCode(email, code);
                setTicket(result.ticket);
                setErrors({});
                setFormError(null);
                setStep(2);
              }}
              onResend={() => authApi.sendResetCode(email)}
              onChangeEmail={() => {
                setStep(0);
                setSent(null);
              }}
            />
          </>
        )}

        {step === 2 && (
          <form onSubmit={(event) => void finish(event)} noValidate>
            {formError && <FormAlert message={formError} />}
            <Field
              label="Mật khẩu mới"
              type="password"
              autoComplete="new-password"
              placeholder="Tạo mật khẩu mới"
              value={password}
              onChange={setPassword}
              error={errors.password ?? errors.newPassword}
            />
            <PasswordChecklist password={password} />
            <Field
              label="Nhập lại mật khẩu mới"
              type="password"
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              value={confirm}
              onChange={setConfirm}
              error={errors.confirm}
            />
            <PrimaryButton type="submit" loading={busy}>
              Đặt lại mật khẩu
            </PrimaryButton>
          </form>
        )}

        <Link
          to={CLIENT_ROUTES.LOGIN}
          className="mt-6 flex items-center justify-center gap-1 text-[13px] font-semibold text-[#62737F] hover:text-primary"
        >
          <Icon name="arrow_back" className="text-[17px]" />
          Quay lại đăng nhập
        </Link>
      </AuthCard>
    </ClientAuthLayout>
  );
}
