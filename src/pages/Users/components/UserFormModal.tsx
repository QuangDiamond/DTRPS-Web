import { useState, type FormEvent, type ReactNode } from 'react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { USER_ACCOUNT_TYPE_LABELS, USER_CITIES } from '../../../constants/user';
import type { AppUser, UserAccountType, UserFormValues } from '../../../types/admin';
import { isValidEmail, isValidPhone, VALIDATION_MESSAGES } from '../../../utils/validation';

interface UserFormModalProps {
  /** null = thêm mới, có giá trị = chỉnh sửa */
  user: AppUser | null;
  onSubmit: (values: UserFormValues) => void;
  onClose: () => void;
}

type FormErrors = Partial<Record<keyof UserFormValues, string>>;

const FORM_ID = 'user-form';
const INPUT_CLASS =
  'h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:outline-none';
const ACCOUNT_TYPES = Object.keys(USER_ACCOUNT_TYPE_LABELS) as UserAccountType[];

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      {children}
      {error && <span className="font-body-sm text-body-sm text-error">{error}</span>}
    </label>
  );
}

export default function UserFormModal({ user, onSubmit, onClose }: UserFormModalProps) {
  const [values, setValues] = useState<UserFormValues>(() =>
    user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
          accountType: user.accountType,
        }
      : { name: '', email: '', phone: '', city: USER_CITIES[0], accountType: 'standard' },
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const isEdit = user !== null;

  const update = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Vui lòng nhập họ tên';
    if (!isValidEmail(values.email)) nextErrors.email = VALIDATION_MESSAGES.email;
    if (!isValidPhone(values.phone)) nextErrors.phone = VALIDATION_MESSAGES.phone;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    });
  };

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
      description={
        isEdit ? `Cập nhật thông tin ${user.id}` : 'Tài khoản mới sẽ ở trạng thái Đang hoạt động'
      }
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            Hủy
          </Button>
          <Button icon={isEdit ? 'save' : 'person_add'} type="submit" form={FORM_ID}>
            {isEdit ? 'Lưu thay đổi' : 'Thêm người dùng'}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <Field label="Họ và tên *" error={errors.name}>
          <input
            className={INPUT_CLASS}
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="VD: Nguyễn Văn Hùng"
          />
        </Field>
        <Field label="Email *" error={errors.email}>
          <input
            type="email"
            className={INPUT_CLASS}
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="ten@email.vn"
          />
        </Field>
        <Field label="Số điện thoại *" error={errors.phone}>
          <input
            className={INPUT_CLASS}
            value={values.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="0905 123 456"
          />
        </Field>
        <Field label="Thành phố">
          <select
            className={`${INPUT_CLASS} cursor-pointer`}
            value={values.city}
            onChange={(event) => update('city', event.target.value)}
          >
            {USER_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Loại tài khoản">
          <select
            className={`${INPUT_CLASS} cursor-pointer`}
            value={values.accountType}
            onChange={(event) => {
              const next = ACCOUNT_TYPES.find((type) => type === event.target.value);
              if (next) update('accountType', next);
            }}
          >
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {USER_ACCOUNT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </Field>
      </form>
    </Modal>
  );
}
