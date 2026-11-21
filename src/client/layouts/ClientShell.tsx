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
import SiteAnnouncementBanner from './SiteAnnouncementBanner';

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
        className="flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-extrabold text-[#0F2A3B] shadow-sm hover:bg-[#DFF4F6]"
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
        className="rounded-full ring-2 ring-white/40 transition-all duration-200 hover:ring-white/85 active:scale-95"
      >
        <Avatar
          url={user.avatarUrl}
          size={36}
          iconSize={30}
          className="bg-[#95EAF3] text-client-primary"
        />
      </button>
      {open && (
        <div className="animate-[fadeIn_150ms_ease-out] absolute right-0 z-40 mt-2 w-64 origin-top-right rounded-2xl border border-client-line bg-white p-2 shadow-xl">
          <div className="flex items-center gap-3 border-b border-client-line px-3 pt-1 pb-3">
            <Avatar url={user.avatarUrl} size={40} iconSize={34} />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-client-ink">{user.name}</p>
              <p className="truncate text-[12px] text-client-muted">{user.email}</p>
            </div>
          </div>
          <div className="pt-2">
            {partnerMode ? (
              // Cổng đối tác: hồ sơ doanh nghiệp + đổi mật khẩu, không có lối sang khu du khách
              <>
                <Link
                  to={CLIENT_ROUTES.PARTNER_PROFILE}
                  className={itemClass}
                  onClick={() => setOpen(false)}
                >
                  <Icon name="storefront" className="text-[18px] text-client-primary" /> Hồ sơ doanh
                  nghiệp
                </Link>
                <Link
                  to={CLIENT_ROUTES.PROFILE_PASSWORD}
                  className={itemClass}
                  onClick={() => setOpen(false)}
                >
                  <Icon name="lock" className="text-[18px] text-client-primary" /> Đổi mật khẩu
                </Link>
              </>
            ) : (
              <Link to={CLIENT_ROUTES.PROFILE} className={itemClass} onClick={() => setOpen(false)}>
                <Icon name="account_circle" className="text-[18px] text-client-primary" /> Hồ sơ của
                tôi
              </Link>
            )}
            {hasRole('ADMIN') && (
              <a href="/admin/dashboard" className={itemClass}>
                <Icon name="admin_panel_settings" className="text-[18px] text-client-primary" />{' '}
                Trang quản trị
              </a>
            )}
            <button
              type="button"
              className={itemClass}
              onClick={() => {
                logout();
                navigate(partnerMode ? CLIENT_ROUTES.PARTNER_LOGIN : CLIENT_ROUTES.LOGIN, {
                  replace: true,
                });
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

/** Khung chung: du khách thấy menu du khách, tài khoản đối tác thấy menu đối tác (không chuyển qua lại) */
export default function ClientShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const live = useClientLive();
  const { hasRole } = useClientAuth();
  const { profile } = usePartnerProfile();
  const [notice, setNotice] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  // Chế độ theo loại tài khoản, không theo đường dẫn (đối tác xem /explore vẫn giữ khung đối tác)
  const partnerMode = hasRole('BUSINESS_OWNER');
  // Menu đối tác chỉ hiện khi hồ sơ đã được duyệt
  const nav = partnerMode ? (profile?.status === 'ACTIVE' ? PARTNER_NAV : []) : TRAVELLER_NAV;

  // Theo dõi vị trí cuộn trang: >8px bật hiệu ứng kính mờ topbar, >360px hiện nút cuộn lên đầu trang
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      setShowTop(window.scrollY > 360);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Đo vị trí tab đang chọn bằng getBoundingClientRect + ResizeObserver để viên thuốc trượt luôn khớp tuyệt đối
  useEffect(() => {
    const updatePill = () => {
      const container = navRef.current;
      if (!container) return;
      const activeEl = container.querySelector<HTMLElement>('[aria-current="page"]');
      if (!activeEl) {
        setPill(null);
        return;
      }
      const cRect = container.getBoundingClientRect();
      const aRect = activeEl.getBoundingClientRect();
      setPill({ left: aRect.left - cRect.left, width: aRect.width });
    };
    const frame = window.requestAnimationFrame(updatePill);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updatePill) : null;
    if (observer && navRef.current) observer.observe(navRef.current);
    void document.fonts?.ready.then(updatePill);
    window.addEventListener('resize', updatePill);
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', updatePill);
    };
  }, [pathname, nav.length]);

  useEffect(() => {
    document.title = partnerMode ? 'Đối tác · SmartTravel' : 'SmartTravel';
  }, [partnerMode]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `group relative z-10 flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[13px] whitespace-nowrap transition-all duration-200 active:scale-95 lg:px-2.5 xl:px-3.5 ${
      isActive
        ? 'font-bold text-white'
        : 'font-semibold text-white/75 hover:bg-white/10 hover:text-white'
    }`;
  const bottomTabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] transition-colors ${
      isActive ? 'font-extrabold text-[#0891B2]' : 'font-semibold text-[#65747D]'
    }`;

  return (
    <div className="min-h-screen bg-client-bg pb-20 md:pb-10">
      {/* Topbar giữ nguyên nền #0891B2; cuộn xuống chuyển sang kính mờ (backdrop-blur) + bóng sâu */}
      <header
        className={`sticky top-0 z-30 border-b transition-all duration-300 ${
          scrolled
            ? 'border-white/15 bg-[#0891B2]/92 shadow-[0_8px_24px_rgba(8,47,73,0.22)] backdrop-blur-md'
            : 'border-transparent bg-[#0891B2] shadow-[0_2px_12px_rgba(8,47,73,0.18)]'
        }`}
      >
        <div className="flex h-16 w-full items-center justify-between gap-3 px-4 md:px-6 lg:px-10">
          <AppLogo subtitle={partnerMode ? 'BUSINESS OWNER' : 'VIETNAM AI PLANNER'} onDark />
          <nav
            ref={navRef}
            className="relative hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex xl:gap-1"
            aria-label="Điều hướng chính"
          >
            {/* Viên thuốc nền sáng trượt mượt theo tab đang chọn (sliding active pill) */}
            {pill && (
              <span
                aria-hidden
                style={{ transform: `translateX(${pill.left}px)`, width: `${pill.width}px` }}
                className="pointer-events-none absolute top-0 bottom-0 left-0 rounded-full bg-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 ease-out motion-reduce:transition-none"
              />
            )}
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={item.label}
                className={tabClass}
              >
                <Icon
                  name={item.icon}
                  className="text-[18px] transition-transform duration-200 group-hover:scale-110"
                />
                {/* Máy tính bảng (768–1023px): chỉ icon để menu không xuống dòng */}
                <span className="hidden lg:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNotice('Tiếng Anh sẽ có trong phiên bản sau.')}
              className="flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-bold text-white transition-all duration-200 hover:bg-white/22 active:scale-95"
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
                filter={live.filter}
                categories={live.categories}
                hasMore={live.hasMore}
                loadingMore={live.loadingMore}
                onFilter={live.setFilter}
                onLoadMore={live.loadMore}
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

      <SiteAnnouncementBanner partnerMode={partnerMode} />

      <main className="w-full px-4 pt-6 md:px-6 lg:px-10">
        <Suspense fallback={<Spinner />}>
          {/* Hiệu ứng chuyển trang mượt (.page-enter trong index.css) mỗi khi đổi route */}
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </Suspense>
      </main>

      {/* Nút cuộn nhanh lên đầu trang khi người dùng cuộn xuống sâu */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Lên đầu trang"
        title="Lên đầu trang"
        className={`fixed right-4 bottom-20 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-[#0891B2] text-white shadow-[0_10px_24px_rgba(8,47,73,0.28)] ring-2 ring-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0E7490] active:scale-95 md:right-7 md:bottom-7 ${
          showTop
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <Icon name="keyboard_arrow_up" className="text-[24px]" />
      </button>

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
