import { Icon } from '@/components/common';

/** Thông báo lỗi trong form xác thực */
export default function AuthAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl bg-error-container px-4 py-3 text-on-error-container"
    >
      <Icon name="error" className="shrink-0 text-xl" />
      <p className="font-body-sm text-body-sm font-medium">{message}</p>
    </div>
  );
}
