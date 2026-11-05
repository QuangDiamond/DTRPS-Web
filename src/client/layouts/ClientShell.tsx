import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { usePartnerProfile } from '@/client/partner/partnerProfileContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { Spinner } from '@/client/ui/Blocks';
import { AppLogo } from '@/client/ui/Brand';
import Avatar from '@/client/traveller/components/Avatar';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  /** Chỉ sáng khi đúng đường dẫn này (dùng cho trang gốc) */
  end?: boolean;
}

const TRAVELLER_NAV: NavItem[] = [
  { to: CLIENT_ROUTES.HOME, label: 'Trang chủ', icon: 'home', end: true },
  { to: CLIENT_ROUTES.EXPLORE, label: 'Khám phá', icon: 'explore' },
  { to: CLIENT_ROUTES.TRIPS, label: 'Chuyến đi', icon: 'luggage' },
  { to: CLIENT_ROUTES.FAVORITES, label: 'Yêu thích', icon: 'favorite' },
  { to: CLIENT_ROUTES.PROFILE, label: 'Hồ sơ', icon: 'account_circle' },
];

const PARTNER_NAV: NavItem[] = [
  { to: CLIENT_ROUTES.PARTNER, label: 'Tổng quan', icon: 'dashboard', end: true },
  { to: CLIENT_ROUTES.PARTNER_LOCATIONS, label: 'Địa điểm', icon: 'location_on' },
  { to: CLIENT_ROUTES.PARTNER_ADS, label: 'Quảng cáo', icon: 'campaign' },
  { to: CLIENT_ROUTES.PARTNER_PROFILE, label: 'Hồ sơ', icon: 'storefront' },
];

/** Thanh chuyển "Khách du lịch | Đối tác" giống màn Home của mobile */
function RoleSwitch({ partnerMode }: { partnerMode: boolean }) {
  const option = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[13px] transition-colors ${
      active
        ? 'bg-primary font-bold text-white'
        : 'font-semibold text-client-muted hover:text-primary'
    }`;
  return (
    <div className="mx-auto flex w-full max-w-md rounded-full bg-client-soft p-1" role="tablist">
      <Link
        to={CLIENT_ROUTES.HOME}
        role="tab"
        aria-selected={!partnerMode}
        className={option(!partnerMode)}
      >
        <Icon name="explore" className="text-[17px]" />
        Khách du lịch
      </Link>
      <Link
        to={CLIENT_ROUTES.PARTNER}
        role="tab"
        aria-selected={partnerMode}
        className={option(partnerMode)}
      >
        <Icon name="storefront" className="text-[17px]" />
        Đối tác
      </Link>
    </div>
  );
}

function AccountMenu() {
  const { user, logout, hasRole } = useClientAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  // Khách chưa đăng nhập: nút đăng nhập thay cho ảnh đại diện
  if (!user)
    return (
      <Link
        to={CLIENT_ROUTES.LOGIN}
        className="flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-extrabold text-[#0B3F3B] shadow-sm hover:bg-[#E0F5EF]"
      >
        <Icon name="login" className="text-[18px]" />
        Đăng nhập
      </Link>
    );
  const itemClass =
    'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] text-client-ink hover:bg-client-soft';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Tài khoản"
        aria-expanded={open}
        className="rounded-full ring-2 ring-white/40 transition hover:ring-white/80"
      >
        <Avatar
          url={user.avatarUrl}
          size={36}
          iconSize={30}
          className="bg-[#99EFE5] text-primary"
        />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 rounded-2xl border border-client-line bg-white p-2 shadow-lg">
          <div className="flex items-center gap-3 border-b border-client-line px-3 pt-1 pb-3">
            <Avatar url={user.avatarUrl} size={40} iconSize={34} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-client-ink">{user.name}</p>
              <p className="truncate text-[12px] text-client-muted">{user.email}</p>
            </div>
          </div>
          <div className="pt-2">
            <Link to={CLIENT_ROUTES.PROFILE} className={itemClass} onClick={() => setOpen(false)}>
              <Icon name="account_circle" className="text-[18px] text-primary" /> Hồ sơ của tôi
            </Link>
            {hasRole('ADMIN') && (
              <a href="/admin/dashboard" className={itemClass}>
                <Icon name="admin_panel_settings" className="text-[18px] text-primary" /> Trang quản
                trị
              </a>
            )}
            <button
              type="button"
              className={itemClass}
              onClick={() => {
                logout();
                navigate(CLIENT_ROUTES.LOGIN, { replace: true });
              }}
            >
              <Icon name="logout" className="text-[18px] text-client-danger" /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Khung chung của du khách + đối tác: header, thanh chuyển vai trò, menu và thanh tab dưới (điện thoại) */
export default function ClientShell() {
  const { pathname } = useLocation();
  const { profile } = usePartnerProfile();
  const [notice, setNotice] = useState<string | null>(null);
  const partnerMode = pathname.startsWith(CLIENT_ROUTES.PARTNER);
  // Menu đối tác chỉ hiện khi hồ sơ đã được duyệt
  const nav = partnerMode ? (profile?.status === 'ACTIVE' ? PARTNER_NAV : []) : TRAVELLER_NAV;

  useEffect(() => {
    document.title = partnerMode ? 'Đối tác · SmartTravel' : 'SmartTravel';
  }, [partnerMode]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] transition-colors ${
      isActive
        ? 'bg-white/15 font-bold text-white'
        : 'font-semibold text-white/75 hover:bg-white/10 hover:text-white'
    }`;
  const bottomTabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] ${
      isActive ? 'font-extrabold text-[#087E78]' : 'font-semibold text-[#65747D]'
    }`;

  return (
    <div className="min-h-screen bg-client-bg pb-20 md:pb-10">
      <header className="sticky top-0 z-30 bg-linear-to-r from-[#0B3F3B] to-[#0F5F57] shadow-[0_2px_12px_rgba(7,42,40,0.18)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <AppLogo subtitle={partnerMode ? 'BUSINESS OWNER' : 'VIETNAM AI PLANNER'} onDark />
          <nav className="hidden flex-1 justify-center gap-1 md:flex" aria-label="Điều hướng chính">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={tabClass}>
                <Icon name={item.icon} className="text-[18px]" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNotice('Tiếng Anh sẽ có trong phiên bản sau.')}
              className="flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20"
            >
              <Icon name="language" className="text-[14px]" />
              VI | EN
            </button>
            <button
              type="button"
              onClick={() => setNotice('Thông báo đang được phát triển.')}
              aria-label="Thông báo"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white hover:bg-white/20"
            >
              <Icon name="notifications" className="text-[21px]" />
            </button>
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-4">
        <div className="mb-5">
          <RoleSwitch partnerMode={partnerMode} />
        </div>
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>

      {nav.length > 0 && (
        <nav
          className="fixed inset-x-0 bottom-0 z-30 flex h-[62px] items-center border-t border-[#E6E9EE] bg-white px-1 md:hidden"
          aria-label="Thanh điều hướng dưới"
        >
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={bottomTabClass}>
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} filled={isActive} className="text-[24px]" />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}

      {notice && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-client-ink px-4 py-2 text-[12px] text-white shadow-lg md:bottom-8">
          {notice}
        </div>
      )}
    </div>
  );
}
