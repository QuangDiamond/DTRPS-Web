import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import type { AuthPortal } from '@/client/api/authApi';
import { CLIENT_ROUTES } from '@/client/routePaths';

const TABS: { portal: AuthPortal; label: string; icon: string }[] = [
  { portal: 'TRAVELLER', label: 'Du khách', icon: 'hiking' },
  { portal: 'PARTNER', label: 'Đối tác', icon: 'storefront' },
];

/** Đường dẫn của mỗi tab: mỗi cổng có trang riêng nên F5 / gửi link vẫn đúng tab */
function pathOf(portal: AuthPortal, mode: 'login' | 'register'): string {
  if (portal === 'PARTNER') {
    return mode === 'login' ? CLIENT_ROUTES.PARTNER_LOGIN : CLIENT_ROUTES.PARTNER_REGISTER;
  }
  return mode === 'login' ? CLIENT_ROUTES.LOGIN : CLIENT_ROUTES.REGISTER;
}

/** Hai tab Du khách / Đối tác trên đầu form đăng nhập và đăng ký */
export function AuthTabs({ active, mode }: { active: AuthPortal; mode: 'login' | 'register' }) {
  return (
    <div role="tablist" className="mb-5 flex rounded-xl bg-[#EEF6F8] p-1">
      {TABS.map((tab) => {
        const selected = tab.portal === active;
        return (
          <Link
            key={tab.portal}
            to={pathOf(tab.portal, mode)}
            replace
            role="tab"
            aria-selected={selected}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13.5px] font-bold transition-colors ${
              selected
                ? 'bg-white text-client-primary shadow-sm'
                : 'text-[#62737F] hover:text-client-primary'
            }`}
          >
            <Icon name={tab.icon} className="text-[18px]" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
