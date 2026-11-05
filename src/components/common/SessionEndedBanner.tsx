import type { SessionEndReason } from '@/utils/sessionEnd';
import Icon from './Icon';

/**
 * Banner trên trang đăng nhập khi tab vừa bị đăng xuất: không thao tác quá lâu hoặc phiên hết hạn.
 * Không tự tắt — người dùng quay lại tab lúc nào cũng hiểu vì sao phải đăng nhập lại.
 */
export default function SessionEndedBanner({
  reason,
  title,
  message,
}: {
  reason: SessionEndReason;
  title: string;
  message: string;
}) {
  const idle = reason === 'idle';
  return (
    <div
      role="alert"
      className={`mb-5 flex gap-3 rounded-2xl border p-4 ${
        idle ? 'border-amber-200 bg-amber-50' : 'border-rose-200 bg-rose-50'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          idle ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
        }`}
      >
        <Icon name={idle ? 'timer_off' : 'lock_clock'} className="text-[22px]" />
      </span>
      <div className="min-w-0">
        <p className={`text-[14px] font-bold ${idle ? 'text-amber-900' : 'text-rose-900'}`}>
          {title}
        </p>
        <p
          className={`mt-0.5 text-[12.5px] leading-[19px] ${idle ? 'text-amber-800' : 'text-rose-800'}`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
