import { useState } from 'react';
import Icon from '../common/Icon';
import AuthInput, { type AuthInputProps } from './AuthInput';

type PasswordInputProps = Omit<AuthInputProps, 'type' | 'trailing' | 'icon'> & { icon?: string };

/** Ô mật khẩu có nút ẩn / hiện */
export default function PasswordInput({ icon = 'lock', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthInput
      {...props}
      icon={icon}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          className="absolute right-3.5 flex items-center justify-center text-outline transition-colors hover:text-on-surface focus:outline-none"
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} className="text-xl" />
        </button>
      }
    />
  );
}
