import { Link } from 'react-router-dom';
import BrandMark from '@/components/common/BrandMark';

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
    <Link to="/" className="flex items-center" aria-label="SmartTravel — Trang chủ">
      <BrandMark subtitle={subtitle} tone={onDark ? 'dark' : 'light'} />
    </Link>
  );
}

/** Logo lớn ở màn đăng nhập / đăng ký (theo Brand của mobile) */
export function Brand() {
  return (
    <div className="mb-7 flex justify-center">
      <BrandMark size="lg" subtitle="VIETNAM AI TRAVEL PLANNER" />
    </div>
  );
}
