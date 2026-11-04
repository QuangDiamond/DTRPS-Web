import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';

/** Logo trên header (theo AppLogo của mobile) */
/** onDark: chữ sáng khi đặt trên nền đậm (top bar) */
export function AppLogo({
  subtitle = 'VIETNAM AI PLANNER',
  onDark = false,
}: {
  subtitle?: string;
  onDark?: boolean;
}) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="SmartTravel — Trang chủ">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white">
        <Icon name="public" className="text-[24px]" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`text-[16px] font-extrabold ${onDark ? 'text-white' : 'text-client-ink'}`}>
          Smart<span className={onDark ? 'text-[#5EEAD4]' : 'text-client-teal'}>Travel</span>
        </span>
        <span
          className={`mt-1 text-[9px] font-semibold tracking-[0.2em] ${onDark ? 'text-white/60' : 'text-primary'}`}
        >
          {subtitle}
        </span>
      </span>
    </Link>
  );
}

/** Logo lớn ở màn đăng nhập / đăng ký (theo Brand của mobile) */
export function Brand() {
  return (
    <div className="mb-7 flex flex-col items-center">
      <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00998E] text-white">
        <Icon name="language" className="text-[38px]" />
      </span>
      <span className="text-[26px] font-extrabold text-client-ink">
        Smart<span className="text-client-teal">Travel</span>
      </span>
      <span className="text-[10px] font-extrabold tracking-[0.15em] text-[#008B85]">
        VIETNAM AI TRAVEL PLANNER
      </span>
    </div>
  );
}
