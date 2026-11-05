import { type FormEvent, type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { FormAlert } from '@/client/ui/Blocks';
import PageBar from '@/client/ui/PageBar';
import { isValidPassword, PASSWORD_HINT } from '@/client/utils/validation';

function PasswordField({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  autoComplete,
  right,
}: {
  id: string;
  label: string;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  right?: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-[14px] font-bold text-[#16394D]">
          {label}
        </label>
        {right}
      </div>
      <div className="flex h-[58px] items-center rounded-2xl bg-white px-4 focus-within:ring-2 focus-within:ring-primary/30">
        <Icon name={icon} className="text-[21px] text-[#006D68]" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="ml-3 h-full flex-1 bg-transparent text-[15px] font-medium text-[#16394D] placeholder:text-[#A7B2C1] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((previous) => !previous)}
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
          className="ml-2 flex h-10 w-10 items-center justify-center text-[#35556B]"
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} className="text-[22px]" />
        </button>
      </div>
    </div>
  );
}

function PasswordRule({ title, valid }: { title: string; valid: boolean }) {
  return (
    <li className="mb-2 flex items-center gap-2">
      <Icon
        name={valid ? 'check_circle' : 'radio_button_unchecked'}
        filled={valid}
        className={`text-[18px] ${valid ? 'text-[#007A73]' : 'text-[#A1ADBD]'}`}
      />
      <span className={`text-[12px] ${valid ? 'font-medium text-[#164B58]' : 'text-[#8190A3]'}`}>
        {title}
      </span>
    </li>
  );
}

/** Đổi mật khẩu — gộp ChangePasswordScreen + ProfileChangePasswordScreen của mobile */
export default function ChangePasswordPage() {
  const { changePassword } = useClientAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Khớp PasswordPolicy của BE: 8–72 ký tự, chữ hoa, chữ thường, số
  const rules = [
    { title: 'Tối thiểu 8 ký tự', valid: next.length >= 8 },
    { title: 'Có ít nhất 1 chữ in hoa (A-Z)', valid: /[A-Z]/.test(next) },
    { title: 'Có ít nhất 1 chữ thường (a-z)', valid: /[a-z]/.test(next) },
    { title: 'Có ít nhất 1 số (0-9)', valid: /\d/.test(next) },
    { title: 'Khác mật khẩu hiện tại', valid: Boolean(next) && next !== current },
  ];
  // Ký tự đặc biệt không bắt buộc nhưng giúp mật khẩu mạnh hơn
  const score =
    rules.slice(0, 4).filter((rule) => rule.valid).length + (/[^A-Za-z0-9]/.test(next) ? 1 : 0);
  const strength =
    next.length === 0
      ? { label: 'Chưa nhập', color: '#8C9AB0' }
      : score <= 2
        ? { label: 'Yếu (Weak)', color: '#E87575' }
        : score <= 4
          ? { label: 'Trung bình (Medium)', color: '#D69E36' }
          : { label: 'Khá mạnh (Strong)', color: '#007A73' };
  const matches = confirm.length > 0 && confirm === next;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!current || !next || !confirm) return setError('Vui lòng nhập đầy đủ các trường mật khẩu.');
    if (!isValidPassword(next)) return setError(`Mật khẩu mới chưa đủ mạnh: ${PASSWORD_HINT}.`);
    if (next === current) return setError('Mật khẩu mới phải khác mật khẩu hiện tại.');
    if (!matches) return setError('Mật khẩu xác nhận chưa trùng khớp.');
    setError(null);
    setBusy(true);
    try {
      // Thiết bị khác bị đăng xuất, tab này nhận phiên mới nên vẫn đăng nhập
      await changePassword(current, next);
      setDone(true);
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl">
        <PageBar title="Đổi mật khẩu" subtitle="Bảo mật tài khoản" backTo={CLIENT_ROUTES.PROFILE} />
        <div className="flex flex-col items-center rounded-[20px] bg-white px-6 py-10 text-center shadow-[0_10px_30px_rgba(19,54,74,0.06)]">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DDF7EA] text-[#13936B]">
            <Icon name="check_circle" filled className="text-[52px]" />
          </span>
          <p className="mt-4 text-[18px] font-extrabold text-[#16394D]">Đổi mật khẩu thành công!</p>
          <p className="mt-2 max-w-sm text-[13px] leading-5 text-[#52728A]">
            Bạn vẫn đang đăng nhập trên thiết bị này. Các thiết bị khác đã được đăng xuất — hãy dùng
            mật khẩu mới khi đăng nhập lại.
          </p>
          <Link
            to={CLIENT_ROUTES.PROFILE}
            className="mt-6 flex h-[50px] w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[#006D68] text-[15px] font-bold text-white shadow-md hover:bg-primary-container"
          >
            <Icon name="person" className="text-[20px]" />
            Về trang cá nhân
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageBar title="Đổi mật khẩu" subtitle="Bảo mật tài khoản" backTo={CLIENT_ROUTES.PROFILE} />

      <div className="flex min-h-[124px] items-start gap-3 rounded-[17px] bg-linear-to-br from-[#F0F1FF] to-[#DFF8FC] p-[18px]">
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[#006D68] text-white shadow-md">
          <Icon name="shield_lock" filled className="text-[28px]" />
        </span>
        <div>
          <p className="text-[17px] font-bold text-[#16394D]">Bảo vệ tài khoản của bạn</p>
          <p className="mt-2 text-[12px] leading-[19px] text-[#52728A]">
            Mật khẩu mới phải có tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số. Thêm ký tự
            đặc biệt để bảo vệ chuyến đi và thông tin cá nhân tốt hơn.
          </p>
        </div>
      </div>

      <form onSubmit={(event) => void submit(event)} noValidate>
        <PasswordField
          id="current-password"
          label="Mật khẩu hiện tại"
          icon="lock"
          value={current}
          onChange={setCurrent}
          placeholder="Nhập mật khẩu hiện tại"
          autoComplete="current-password"
          right={
            <Link
              to={CLIENT_ROUTES.FORGOT_PASSWORD}
              className="text-[11px] font-semibold text-[#006D68] hover:underline"
            >
              Quên mật khẩu?
            </Link>
          }
        />
        <PasswordField
          id="new-password"
          label="Mật khẩu mới"
          icon="key"
          value={next}
          onChange={setNext}
          placeholder="Nhập mật khẩu mới"
          autoComplete="new-password"
        />

        <div className="mt-3 rounded-2xl bg-[#F0F1FF] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#54718A]">Độ an toàn:</span>
            <span className="text-[11px] font-bold" style={{ color: strength.color }}>
              ● {strength.label}
            </span>
          </div>
          <div className="mt-3 mb-4 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <span
                key={level}
                className="h-[6px] flex-1 rounded-full"
                style={{
                  backgroundColor: next && score >= level ? strength.color : '#DCE2FA',
                }}
              />
            ))}
          </div>
          <ul>
            {rules.map((rule) => (
              <PasswordRule key={rule.title} title={rule.title} valid={rule.valid} />
            ))}
          </ul>
        </div>

        <PasswordField
          id="confirm-password"
          label="Xác nhận mật khẩu mới"
          icon="lock_reset"
          value={confirm}
          onChange={setConfirm}
          placeholder="Nhập lại mật khẩu mới"
          autoComplete="new-password"
        />
        {confirm.length > 0 && (
          <p
            className={`mt-3 flex items-center gap-2 text-[12px] font-medium ${
              matches ? 'text-[#007A73]' : 'text-[#D94A4A]'
            }`}
          >
            <Icon name={matches ? 'verified' : 'error'} className="text-[17px]" />
            {matches ? 'Mật khẩu trùng khớp hoàn toàn' : 'Mật khẩu xác nhận chưa trùng khớp'}
          </p>
        )}

        <div className="mt-6">{error && <FormAlert message={error} />}</div>

        <button
          type="submit"
          disabled={busy}
          className="mt-3 flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#006D68] text-[16px] font-bold text-white shadow-md hover:bg-primary-container disabled:bg-[#9EBEB9]"
        >
          {busy ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <>
              <Icon name="check" className="text-[24px]" />
              Lưu mật khẩu mới
            </>
          )}
        </button>
        <Link
          to={CLIENT_ROUTES.PROFILE}
          className="mt-3 flex h-[43px] items-center justify-center text-[14px] font-semibold text-[#16394D]"
        >
          Hủy thay đổi
        </Link>
      </form>
    </div>
  );
}
