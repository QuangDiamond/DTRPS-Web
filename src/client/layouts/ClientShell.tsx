import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import NotificationBell from '@/components/common/NotificationBell';
import { useClientLive } from '@/client/live/clientLiveContext';
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

/** Chế độ còn lại để chuyển sang (nút trên topbar luôn ghi chế độ KHÔNG đang dùng) */
const switchTarget = (partnerMode: boolean) =>
  partnerMode
    ? { to: CLIENT_ROUTES.HOME, label: 'Chế độ du khách', icon: 'explore' }
    : { to: CLIENT_ROUTES.PARTNER, label: 'Dành cho đối tác', icon: 'storefront' };

/** Nút chuyển du khách ⇄ đối tác trên topbar (kiểu "Chuyển sang chế độ đón tiếp khách" của Airbnb) */
function ModeSwitchButton({ partnerMode }: { partnerMode: boolean }) {
  const target = switchTarget(partnerMode);
  return (
    <Link
      to={target.to}
      title={target.label}
      aria-label={target.label}
      // Viên thuốc nền xanh bạc hà (màu chữ "Travel" của logo): nổi trên nền topbar tối mà vẫn hợp tông
      className="flex h-9 items-center gap-1.5 rounded-full bg-[#99EFE5] px-2.5 text-[13px] font-extrabold whitespace-nowrap text-[#0B3F3B] shadow-sm transition-colors hover:bg-white xl:px-4"
    >
      <Icon name={target.icon} className="text-[18px]" />
      {/* Màn nhỏ chỉ hiện icon cho gọn; menu ảnh đại diện cũng có mục chuyển chế độ */}
      <span className="hidden xl:inline">{target.label}</span>
    </Link>
  );
}

function AccountMenu({ partnerMode }: { partnerMode: boolean }) {
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
            <Link
              to={switchTarget(partnerMode).to}
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <Icon name={switchTarget(partnerMode).icon} className="text-[18px] text-primary" />{' '}
              {partnerMode ? 'Chuyển sang chế độ du khách' : 'Chuyển sang chế độ đối tác'}
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

/** Khung chung của du khách + đối tác: header (kèm nút chuyển chế độ), menu và thanh tab dưới (điện thoại) */
export default function ClientShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const live = useClientLive();
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
    `flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[13px] whitespace-nowrap transition-colors lg:px-2 xl:px-3 ${
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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <AppLogo subtitle={partnerMode ? 'BUSINESS OWNER' : 'VIETNAM AI PLANNER'} onDark />
          <nav
            className="hidden min-w-0 flex-1 justify-center gap-0.5 md:flex xl:gap-1"
            aria-label="Điều hướng chính"
          >
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.label}
                className={tabClass}
              >
                <Icon name={item.icon} className="text-[18px]" />
                {/* Máy tính bảng (768–1023px): chỉ icon để menu không xuống dòng */}
                <span className="hidden lg:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ModeSwitchButton partnerMode={partnerMode} />
            <span aria-hidden className="mx-1 hidden h-6 w-px bg-white/20 sm:block" />
            <button
              type="button"
              onClick={() => setNotice('Tiếng Anh sẽ có trong phiên bản sau.')}
              className="flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20"
            >
              <Icon name="language" className="text-[14px]" />
              VI | EN
            </button>
            {live ? (
              <NotificationBell
                tone="dark"
                unread={live.unread}
                items={live.items}
                loading={live.loading}
                connected={live.connected}
                onOpen={live.loadItems}
                onMarkAllRead={live.markAllRead}
                onSelect={(item) => {
                  live.markRead(item.id);
                  if (item.link) navigate(item.link);
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate(CLIENT_ROUTES.LOGIN, {
                    state: { from: pathname, notice: 'Đăng nhập để nhận thông báo' },
                  })
                }
                aria-label="Thông báo"
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white hover:bg-white/20"
              >
                <Icon name="notifications" className="text-[21px]" />
              </button>
            )}
            <AccountMenu partnerMode={partnerMode} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6">
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
